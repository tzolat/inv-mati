import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"
import Notification from "@/lib/models/notification"

export async function POST(req: Request) {
  try {
    await connectDB()

    const { productIds, quantity } = await req.json()

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 })
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    // Fetch all selected products
    const products = await Product.find({ _id: { $in: productIds } })

    // Update each product
    for (const product of products) {
      // Update each variant's stock
      product.variants = product.variants.map((variant: any) => {
        return {
          ...variant,
          currentStock: variant.currentStock + quantity,
          // No need to modify flagStatus as we're preserving it with the spread operator above
        }
      })

      // Save the updated product
      await product.save()

      // Create notification
      await Notification.create({
        type: "stock_update",
        message: `Added ${quantity} units to all variants of ${product.name}`,
        relatedTo: product._id,
        relatedModel: "Product",
        isRead: false,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Added ${quantity} units to ${products.length} products`,
    })
  } catch (error) {
    console.error("Error adding stock:", error)
    return NextResponse.json({ error: "Failed to add stock" }, { status: 500 })
  }
}
