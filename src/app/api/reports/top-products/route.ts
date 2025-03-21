import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sale from "@/lib/models/sale"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "10")

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

    // Get top products by quantity sold
    const topProducts = await Sale.aggregate([
      { $match: dateQuery },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            product: "$items.product",
            variant: "$items.variant",
          },
          productName: { $first: "$items.product" },
          variantName: { $first: "$items.variant" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.actualSellingPrice", "$items.quantity"] } },
          profit: { $sum: "$items.profit" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          productName: { $arrayElemAt: ["$productDetails.name", 0] },
          brand: { $arrayElemAt: ["$productDetails.brand", 0] },
          category: { $arrayElemAt: ["$productDetails.category", 0] },
        },
      },
      {
        $project: {
          productDetails: 0,
        },
      },
      {
        $sort: { quantitySold: -1 },
      },
      {
        $limit: limit,
      },
    ])

    return NextResponse.json(topProducts)
  } catch (error) {
    console.error("Error fetching top products:", error)
    return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 })
  }
}

