"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList } from "recharts"
import axios from "axios"

export function TopProducts() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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
        queryParams.set("limit", "20") // Increased limit to show more products

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
        setFilteredData(formattedData)
      } catch (error) {
        console.error("Error fetching top products data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(data)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = data.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query),
    )
    setFilteredData(filtered)
  }, [searchQuery, data])

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
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by quantity sold</CardDescription>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <div className="space-y-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData.slice(0, 10)} // Show top 10 in chart
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
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={150} />
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

            <div className="overflow-x-auto">
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
                    {filteredData.map((item, index) => (
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
          </div>
        ) : (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No products match your search criteria" : "No data available for the selected period"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

