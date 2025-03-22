import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sale from "@/lib/models/sale"
import Product from "@/lib/models/product"
import Notification from "@/lib/models/notification"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const search = searchParams.get("search") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const paymentStatus = searchParams.get("paymentStatus") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customer: { $regex: search, $options: "i" } },
      ]
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Add payment status filter - only if a specific status is selected
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus
    }

    // Log the query for debugging
    console.log("Sales API Query:", JSON.stringify(query, null, 2))

    // Execute query
    const totalSales = await Sale.countDocuments(query)
    const sales = await Sale.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    return NextResponse.json({
      sales,
      pagination: {
        total: totalSales,
        page,
        limit,
        pages: Math.ceil(totalSales / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    await connectDB()

    const body = await req.json()

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Sale must include at least one item" }, { status: 400 })
    }

    // Generate invoice number if not provided
    if (!body.invoiceNumber) {
      const date = new Date()
      const year = date.getFullYear().toString().slice(-2)
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")
      const count = (await Sale.countDocuments()) + 1
      body.invoiceNumber = `INV-${year}${month}${day}-${count.toString().padStart(4, "0")}`
    }

    // Ensure payment status is either "Completed" or "Pending"
    if (!body.paymentStatus || (body.paymentStatus !== "Completed" && body.paymentStatus !== "Pending")) {
      body.paymentStatus = "Completed" // Default to Completed if not specified or invalid
    }

    // Calculate total amount and profit
    let totalAmount = 0
    let totalProfit = 0

    // Process each item in the sale
    for (const item of body.items) {
      // Find the product and variant
      const product = await Product.findById(item.product)

      if (!product) {
        await session.abortTransaction()
        session.endSession()
        return NextResponse.json({ error: `Product with ID ${item.product} not found` }, { status: 400 })
      }

      const variant = product.variants.find((v: any) => v.name === item.variant)

      if (!variant) {
        await session.abortTransaction()
        session.endSession()
        return NextResponse.json(
          { error: `Variant ${item.variant} not found for product ${product.name}` },
          { status: 400 },
        )
      }

      // Check if enough stock is available
      if (variant.currentStock < item.quantity) {
        await session.abortTransaction()
        session.endSession()
        return NextResponse.json(
          { error: `Not enough stock for ${product.name} - ${variant.name}. Available: ${variant.currentStock}` },
          { status: 400 },
        )
      }

      // Update item with prices from database
      item.costPrice = variant.costPrice
      item.sellingPrice = variant.sellingPrice

      // If actualSellingPrice is not provided, use the current selling price
      if (!item.actualSellingPrice) {
        item.actualSellingPrice = variant.sellingPrice
      }

      // Calculate profit for this item
      item.profit = (item.actualSellingPrice - item.costPrice) * item.quantity

      // Update totals
      totalAmount += item.actualSellingPrice * item.quantity
      totalProfit += item.profit

      // Update stock
      variant.currentStock -= item.quantity
      await product.save({ session })

      // Create low stock notification if needed
      if (variant.currentStock <= variant.lowStockThreshold) {
        await Notification.create({
          type: "low_stock",
          message: `Low stock alert: ${product.name} - ${variant.name} (${variant.currentStock} remaining)`,
          relatedTo: product._id,
          relatedModel: "Product",
          isRead: false,
        })
      }
    }

    // Update sale with calculated totals
    body.totalAmount = totalAmount
    body.totalProfit = totalProfit

    // Create the sale
    const newSale = await Sale.create(body)

    // Create sale notification
    await Notification.create({
      type: "new_sale",
      message: `New sale recorded: ${body.invoiceNumber} for $${totalAmount.toFixed(2)}`,
      relatedTo: newSale._id,
      relatedModel: "Sale",
      isRead: false,
    })

    await session.commitTransaction()
    session.endSession()

    return NextResponse.json(newSale, { status: 201 })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()

    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}

