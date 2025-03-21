import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sale from "@/lib/models/sale"
import Product from "@/lib/models/product"

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

    // Get total sales and profit
    const salesData = await Sale.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalProfit: { $sum: "$totalProfit" },
        },
      },
    ])

    // Get total products and low stock count
    const productsCount = await Product.countDocuments()

    const lowStockCount = await Product.aggregate([
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
          _id: null,
          count: { $sum: 1 },
        },
      },
    ])

    // Calculate average profit margin
    let averageProfitMargin = 0
    if (salesData.length > 0 && salesData[0].totalRevenue > 0) {
      averageProfitMargin = (salesData[0].totalProfit / salesData[0].totalRevenue) * 100
    }

    return NextResponse.json({
      totalSales: salesData.length > 0 ? salesData[0].totalSales : 0,
      totalRevenue: salesData.length > 0 ? salesData[0].totalRevenue : 0,
      totalProfit: salesData.length > 0 ? salesData[0].totalProfit : 0,
      averageProfitMargin: averageProfitMargin,
      totalProducts: productsCount,
      lowStockItems: lowStockCount.length > 0 ? lowStockCount[0].count : 0,
    })
  } catch (error) {
    console.error("Error fetching summary report:", error)
    return NextResponse.json({ error: "Failed to fetch summary report" }, { status: 500 })
  }
}

