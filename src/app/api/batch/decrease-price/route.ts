import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"
import Notification from "@/lib/models/notification"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { productIds, percentage } = await req.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 })
    }

    if (!percentage || percentage <= 0 || percentage > 100) {
      return NextResponse.json({ error: "Invalid percentage" }, { status: 400 })
    }

    // Fetch all selected products
    const products = await Product.find({ _id: { $in: productIds } })

    // Update each product
    for (const product of products) {
      // Update each variant's selling price
      product.variants = product.variants.map((variant: any) => {
        const newPrice = variant.sellingPrice * (1 - percentage / 100)
        return {
          ...variant,
          sellingPrice: Math.round(newPrice * 100) / 100, // Round to 2 decimal places
        }
      })

      // Save the updated product
      await product.save()

      // Create notification
      await Notification.create({
        type: "price_change",
        message: `Price decreased by ${percentage}% for ${product.name}`,
        relatedTo: product._id,
        relatedModel: "Product",
        isRead: false,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Decreased prices for ${products.length} products by ${percentage}%`,
    })
  } catch (error) {
    console.error("Error decreasing prices:", error)
    return NextResponse.json({ error: "Failed to decrease prices" }, { status: 500 })
  }
}

