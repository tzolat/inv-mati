import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sale from "@/lib/models/sale"
import { format, startOfHour, endOfHour, addHours } from "date-fns"

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
      case "hour":
        // For hourly data, we need to generate all hours in the range
        const hourlyData = await getHourlyData(start, end)
        return NextResponse.json(hourlyData)
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

    // If not hourly, use the standard aggregation
    if (interval !== "hour") {
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
    }
  } catch (error) {
    console.error("Error fetching sales over time:", error)
    return NextResponse.json({ error: "Failed to fetch sales over time" }, { status: 500 })
  }

  // Helper function to get hourly data
  async function getHourlyData(start: Date, end: Date) {
    // Ensure we're working with the start of hours
    const startHour = startOfHour(start)
    const endHour = endOfHour(end)

    // Get sales data grouped by hour
    const salesData = await Sale.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startHour,
            $lte: endHour,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
            hour: { $hour: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: "$totalProfit" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 },
      },
      {
        $project: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%dT%H:00:00.000Z",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                  hour: "$_id.hour",
                },
              },
            },
          },
          revenue: 1,
          profit: 1,
          count: 1,
        },
      },
    ])

    // Generate all hours in the range to ensure we have data points for every hour
    const result = []
    let currentHour = startHour

    // Create a map of existing data points
    const dataMap = new Map()
    salesData.forEach((item) => {
      dataMap.set(item._id, item)
    })

    // Fill in all hours
    while (currentHour <= endHour) {
      const hourKey = format(currentHour, "yyyy-MM-dd'T'HH:00:00.000'Z'")

      if (dataMap.has(hourKey)) {
        // Use existing data
        result.push(dataMap.get(hourKey))
      } else {
        // Create empty data point
        result.push({
          _id: hourKey,
          revenue: 0,
          profit: 0,
          count: 0,
        })
      }

      // Move to next hour
      currentHour = addHours(currentHour, 1)
    }

    return result
  }
}

