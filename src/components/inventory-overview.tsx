"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import axios from "axios"
// Add the import at the top
import type { InventoryOverviewData } from "@/types"

export function InventoryOverview() {
  // And update the state definition
  const [data, setData] = useState<InventoryOverviewData>({
    category: [],
    brand: [],
  })
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("category")

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f43f5e",
    "#84cc16",
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products
        const response = await axios.get("/api/products?limit=100")
        const products = response.data.products

        // Process data for charts
        const categoryData: Record<string, number> = {}
        const brandData: Record<string, number> = {}

        products.forEach((product: any) => {
          // Sum up stock for each product
          const totalStock = product.variants.reduce((sum: number, variant: any) => sum + variant.currentStock, 0)

          // Group by category
          if (categoryData[product.category]) {
            categoryData[product.category] += totalStock
          } else {
            categoryData[product.category] = totalStock
          }

          // Group by brand
          if (brandData[product.brand]) {
            brandData[product.brand] += totalStock
          } else {
            brandData[product.brand] = totalStock
          }
        })

        // Convert to chart format and sort by value (descending)
        const categoryChartData = Object.entries(categoryData)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)

        const brandChartData = Object.entries(brandData)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)

        setData({
          category: categoryChartData,
          brand: brandChartData,
        })
      } catch (error) {
        console.error("Error fetching inventory overview data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>Distribution of your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Overview</CardTitle>
        <CardDescription>Distribution of your inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category" onValueChange={setView}>
          <TabsList className="mb-4">
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="brand">By Brand</TabsTrigger>
          </TabsList>
          <TabsContent value="category" className="h-[300px]">
            {data?.category?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.category}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.category.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, "Stock"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No category data available</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="brand" className="h-[300px]">
            {data?.brand?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.brand}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.brand.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, "Stock"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No brand data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

