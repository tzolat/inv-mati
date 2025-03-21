import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"

export async function GET() {
  try {
    await connectDB()

    // Find products with at least one variant below its low stock threshold
    const lowStockProducts = await Product.aggregate([
      { $unwind: "$variants" },
      {
        $match: {
          $expr: {
            $lte: ["$variants.currentStock", "$variants.lowStockThreshold"],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          brand: { $first: "$brand" },
          category: { $first: "$category" },
          lowStockVariants: {
            $push: {
              name: "$variants.name",
              sku: "$variants.sku",
              currentStock: "$variants.currentStock",
              lowStockThreshold: "$variants.lowStockThreshold",
            },
          },
        },
      },
    ])

    return NextResponse.json(lowStockProducts)
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json({ error: "Failed to fetch low stock products" }, { status: 500 })
  }
}

