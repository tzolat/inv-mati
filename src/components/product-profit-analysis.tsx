"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import axios from "axios"

export function ProductProfitAnalysis() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<any>({
    products: [],
    variants: [],
  })
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [filteredVariants, setFilteredVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("products")
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

        // Fetch product-level profit data
        const response = await axios.get(`/api/reports/product-profits?${queryParams.toString()}`)
        setData(response.data)
        setFilteredProducts(response.data.products)
        setFilteredVariants(response.data.variants)
      } catch (error) {
        console.error("Error fetching product profit data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(data.products)
      setFilteredVariants(data.variants)
      return
    }

    const query = searchQuery.toLowerCase()

    // Filter products
    const products = data.products.filter(
      (item: any) =>
        (item.productName && item.productName.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.brand && item.brand.toLowerCase().includes(query)),
    )
    setFilteredProducts(products)

    // Filter variants
    const variants = data.variants.filter(
      (item: any) =>
        (item.productName && item.productName.toLowerCase().includes(query)) ||
        (item.variantName && item.variantName.toLowerCase().includes(query)) ||
        (item.sku && item.sku.toLowerCase().includes(query)),
    )
    setFilteredVariants(variants)
  }, [searchQuery, data])

  // Color function for profit margin
  const getProfitMarginColor = (margin: number) => {
    if (margin >= 30) return "#10b981" // Green for high margin
    if (margin >= 15) return "#f59e0b" // Yellow for medium margin
    return "#ef4444" // Red for low margin
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Product Profit Analysis</CardTitle>
          <CardDescription>Profit breakdown by products and variants</CardDescription>
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
          <CardTitle>Product Profit Analysis</CardTitle>
          <CardDescription>Profit breakdown by products and variants</CardDescription>
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
        <Tabs defaultValue="products" value={view} onValueChange={setView}>
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="products">By Product</TabsTrigger>
            <TabsTrigger value="variants">By Variant</TabsTrigger>
            <TabsTrigger value="chart">Profit Margin Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((item: any) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell className="text-right">{item.quantitySold}</TableCell>
                        <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-green-600">${item.profit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                item.margin >= 30
                                  ? "bg-green-100 text-green-800"
                                  : item.margin >= 15
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            `}
                          >
                            {item.margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No products match your search criteria" : "No data available for the selected period"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="variants">
            {filteredVariants.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVariants.map((item: any) => (
                      <TableRow key={`${item.productId}-${item.variantName}`}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.variantName}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell className="text-right">{item.quantitySold}</TableCell>
                        <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-green-600">${item.profit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                item.margin >= 30
                                  ? "bg-green-100 text-green-800"
                                  : item.margin >= 15
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            `}
                          >
                            {item.margin.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No variants match your search criteria" : "No data available for the selected period"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart">
            {filteredProducts.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredProducts.slice(0, 10)}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productName"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                      interval={0}
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
                        if (name === "margin") return [`${value.toFixed(1)}%`, "Profit Margin"]
                        return [`$${value.toFixed(2)}`, name === "revenue" ? "Revenue" : "Profit"]
                      }}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" />
                    <Bar yAxisId="left" dataKey="profit" name="Profit" fill="#10b981" />
                    <Bar yAxisId="right" dataKey="margin" name="Profit Margin" fill="#f59e0b">
                      {filteredProducts.slice(0, 10).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={getProfitMarginColor(entry.margin)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No products match your search criteria" : "No data available for the selected period"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

