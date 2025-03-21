"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts"
import axios from "axios"

export function TopProducts() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Get search params
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        if (startDate) queryParams.set("startDate", startDate)
        if (endDate) queryParams.set("endDate", endDate)
        queryParams.set("limit", "10")

        const response = await axios.get(`/api/reports/top-products?${queryParams.toString()}`)

        // Format data for chart
        const formattedData = response.data.map((item: any) => ({
          name: `${item.productName} - ${item.variantName}`,
          quantity: item.quantitySold,
          revenue: item.revenue,
          profit: item.profit,
          category: item.category,
          brand: item.brand,
        }))

        setData(formattedData)
      } catch (error) {
        console.error("Error fetching top products data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by quantity sold</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performing products by quantity sold</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 150,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number, name) => {
                      if (name === "quantity") return [value, "Quantity Sold"]
                      return [`$${value.toFixed(2)}`, name === "revenue" ? "Revenue" : "Profit"]
                    }}
                  />
                  <Legend />
                  <Bar dataKey="quantity" name="Quantity Sold" fill="#3b82f6">
                    <LabelList dataKey="quantity" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Product</th>
                    <th className="p-2 text-left font-medium">Category</th>
                    <th className="p-2 text-left font-medium">Brand</th>
                    <th className="p-2 text-left font-medium">Quantity</th>
                    <th className="p-2 text-left font-medium">Revenue</th>
                    <th className="p-2 text-left font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="p-2">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="p-2">{item.brand}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">${item.revenue.toFixed(2)}</td>
                      <td className="p-2 text-green-600">${item.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available for the selected period</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

