"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import axios from "axios"

export function SalesChart() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get search params
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""
  const interval = searchParams.get("interval") || "day"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        if (startDate) queryParams.set("startDate", startDate)
        if (endDate) queryParams.set("endDate", endDate)
        if (interval) queryParams.set("interval", interval)

        const response = await axios.get(`/api/reports/sales-over-time?${queryParams.toString()}`)

        // Format data for chart
        const formattedData = response.data.map((item: any) => ({
          date: item._id,
          revenue: item.revenue,
          profit: item.profit,
          count: item.count,
        }))

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching sales chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate, interval])

  // Format the x-axis labels based on interval
  const formatXAxis = (value: string) => {
    if (!value) return ""

    try {
      switch (interval) {
        case "day":
          return value.split("-").slice(1).join("-") // Show MM-DD
        case "week":
          return `Week ${value.split("-W")[1]}`
        case "month":
          return value.split("-")[1] // Show MM
        case "year":
          return value // Show YYYY
        default:
          return value
      }
    } catch (e) {
      return value
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
          <CardDescription>Revenue and profit trends</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Over Time</CardTitle>
        <CardDescription>Revenue and profit trends</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => value} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name) => {
                  if (name === "count") return [value, "Sales Count"]
                  return [`$${value.toFixed(2)}`, name === "revenue" ? "Revenue" : "Profit"]
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line yAxisId="left" type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="count"
                name="Sales Count"
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available for the selected period</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

