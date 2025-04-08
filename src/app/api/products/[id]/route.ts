import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"
import mongoose from "mongoose"
import Notification from "@/lib/models/notification"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = params.id

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = params.id
    const body = await req.json()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    // Check for duplicate SKUs (excluding this product's variants)
    if (body.variants && body.variants.length > 0) {
      const skus = body.variants.map((variant: any) => variant.sku)
      const existingSKUs = await Product.find({
        _id: { $ne: id },
        "variants.sku": { $in: skus },
      })

      if (existingSKUs.length > 0) {
        return NextResponse.json({ error: "One or more SKUs already exist in other products" }, { status: 400 })
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Create notification for product update
    await Notification.create({
      type: "product_updated",
      message: `Product updated: ${updatedProduct.name}`,
      relatedTo: updatedProduct._id,
      relatedModel: "Product",
      isRead: false,
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = params.id

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const deletedProduct = await Product.findByIdAndDelete(id)

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Create notification for product deletion
    await Notification.create({
      type: "product_deleted",
      message: `Product deleted: ${deletedProduct.name}`,
      relatedTo: deletedProduct._id,
      relatedModel: "Product",
      isRead: false,
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
