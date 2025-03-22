"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import axios from "axios"
import { format } from "date-fns"

export function ProfitChart() {
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
        const formattedData = response.data.map((item: any) => {
          const profitMargin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
          return {
            date: item._id,
            profit: item.profit,
            profitMargin: Number.parseFloat(profitMargin.toFixed(1)),
          }
        })

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching profit chart data:", error)
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
        case "hour":
          // For hourly data, show the hour
          if (value.includes("T")) {
            const date = new Date(value)
            return format(date, "h:mm a")
          }
          return value
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

  // Color function for profit margin
  const getProfitMarginColor = (margin: number) => {
    if (margin >= 30) return "#10b981" // Green for high margin
    if (margin >= 15) return "#f59e0b" // Yellow for medium margin
    return "#ef4444" // Red for low margin
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Analysis</CardTitle>
          <CardDescription>Profit and margin breakdown</CardDescription>
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
        <CardTitle>Profit Analysis</CardTitle>
        <CardDescription>Profit and margin breakdown</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis yAxisId="left" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number, name) => {
                  if (name === "profitMargin") return [`${value}%`, "Profit Margin"]
                  return [`$${value.toFixed(2)}`, "Profit"]
                }}
                labelFormatter={(label) => {
                  if (interval === "hour" && label.includes("T")) {
                    const date = new Date(label)
                    return `Time: ${format(date, "MMM dd, yyyy h:mm a")}`
                  }
                  return `Date: ${label}`
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="profit" name="Profit" fill="#10b981" />
              <Bar yAxisId="right" dataKey="profitMargin" name="Profit Margin" fill="#3b82f6">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getProfitMarginColor(entry.profitMargin)} />
                ))}
              </Bar>
            </BarChart>
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

