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
    const interval = searchParams.get("interval") || "day" // day, week, month, year

    // Default to last 30 days if no dates provided
    let start: Date, end: Date
    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      end = new Date()
      start = new Date()
      start.setDate(end.getDate() - 30)
    }

    // Determine group format based on interval
    let dateFormat: any
    let dateGroup: any

    switch (interval) {
      case "day":
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        break
      case "week":
        dateFormat = {
          $dateToString: {
            format: "%Y-W%U",
            date: "$createdAt",
          },
        }
        break
      case "month":
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
        break
      case "year":
        dateFormat = { $dateToString: { format: "%Y", date: "$createdAt" } }
        break
      default:
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
    }

    // Get sales data grouped by the selected interval
    const salesData = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: dateFormat,
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$totalProfit" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    return NextResponse.json(salesData)
  } catch (error) {
    console.error("Error fetching sales over time:", error)
    return NextResponse.json({ error: "Failed to fetch sales over time" }, { status: 500 })
  }
}

