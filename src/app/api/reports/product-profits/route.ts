import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sale from "@/lib/models/sale"
import { isProduct } from "@/types"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    // Default to current month if no dates provided
    let dateQuery: any = {}
    if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      }
    } else {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      dateQuery = {
        createdAt: {
          $gte: firstDay,
          $lte: now,
        },
      }
    }

    // Get all sales for the period
    const sales = await Sale.find(dateQuery).populate({
      path: "items.product",
      select: "name brand category variants",
    })

    // Process data for product-level analysis
    const productMap = new Map()
    const variantMap = new Map()

    // Process each sale
    for (const sale of sales) {
      // Process each item in the sale
      for (const item of sale.items) {
        // Skip if product is missing
        if (!item.product) continue

        // Extract product information
        let productId: string
        let productName: string
        let brand: string
        let category: string
        let variants: any[] = []

        // Handle different types of product field
        if (isProduct(item.product)) {
          // It's a populated Product object
          productId = item.product._id.toString()
          productName = item.product.name
          brand = item.product.brand
          category = item.product.category
          variants = item.product.variants
        } else if (typeof item.product === "object" && "name" in item.product) {
          // It's a partial product object with name
          productId = mongoose.Types.ObjectId.isValid(item.product.toString()) ? item.product.toString() : "unknown-id"
          productName = (item.product as any).name || "Unknown Product"
          brand = (item.product as any).brand || "Unknown Brand"
          category = (item.product as any).category || "Unknown Category"
          variants = (item.product as any).variants || []
        } else {
          // It's an ID (string or ObjectId)
          productId = item.product.toString()
          productName = "Unknown Product"
          brand = "Unknown Brand"
          category = "Unknown Category"
          variants = []
        }

        // Get variant details
        const variantName = item.variant
        const variant = variants.find((v: any) => v.name === variantName)

        // Skip if variant is not found
        if (!variant) continue

        const sku = variant.sku
        const quantity = item.quantity
        const revenue = item.actualSellingPrice * quantity
        const cost = item.costPrice * quantity
        const profit = item.profit

        // Update product-level data
        const productKey = productId
        if (!productMap.has(productKey)) {
          productMap.set(productKey, {
            productId,
            productName,
            brand,
            category,
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          })
        }
        const productData = productMap.get(productKey)
        productData.quantitySold += quantity
        productData.revenue += revenue
        productData.cost += cost
        productData.profit += profit

        // Update variant-level data
        const variantKey = `${productId}-${variantName}`
        if (!variantMap.has(variantKey)) {
          variantMap.set(variantKey, {
            productId,
            productName,
            variantName,
            sku,
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          })
        }
        const variantData = variantMap.get(variantKey)
        variantData.quantitySold += quantity
        variantData.revenue += revenue
        variantData.cost += cost
        variantData.profit += profit
      }
    }

    // Calculate margins and convert to arrays
    const products = Array.from(productMap.values())
      .map((item) => ({
        ...item,
        margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit)

    const variants = Array.from(variantMap.values())
      .map((item) => ({
        ...item,
        margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit)

    return NextResponse.json({
      products,
      variants,
    })
  } catch (error) {
    console.error("Error fetching product profits:", error)
    return NextResponse.json({ error: "Failed to fetch product profits" }, { status: 500 })
  }
}

