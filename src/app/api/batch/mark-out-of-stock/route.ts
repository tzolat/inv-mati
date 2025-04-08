import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"
import Notification from "@/lib/models/notification"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { productIds } = await req.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 })
    }

    // Fetch all selected products
    const products = await Product.find({ _id: { $in: productIds } })

    // Update each product
    for (const product of products) {
      // Set all variants' stock to 0
      product.variants = product.variants.map((variant: any) => {
        return {
          ...variant,
          currentStock: 0,
          // No need to modify flagStatus as we're preserving it with the spread operator above
        }
      })

      // Save the updated product
      await product.save()

      // Create notification
      await Notification.create({
        type: "stock_update",
        message: `Marked all variants of ${product.name} as out of stock`,
        relatedTo: product._id,
        relatedModel: "Product",
        isRead: false,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${products.length} products as out of stock`,
    })
  } catch (error) {
    console.error("Error marking products as out of stock:", error)
    return NextResponse.json({ error: "Failed to mark products as out of stock" }, { status: 500 })
  }
}
