"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InventoryOverview() {
  const [products, setProducts] = useState<any[]>([])
  const [productChartData, setProductChartData] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [variantData, setVariantData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState("products")

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

  // Function to fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch products with a timestamp to prevent caching
        const response = await axios.get(`/api/products?limit=100&t=${new Date().getTime()}`)
        const productsData = response.data.products

        if (!productsData || productsData.length === 0) {
          setError("No products found in inventory")
          setLoading(false)
          return
        }

        setProducts(productsData)

        // Process data for product chart
        const productData = productsData
          .map((product: any) => {
            // Sum up stock for each product
            const totalStock = product.variants.reduce(
              (sum: number, variant: any) => sum + (variant.currentStock || 0),
              0,
            )

            return {
              name: product.name,
              value: totalStock,
              id: product._id,
            }
          })
          .filter((item: any) => item.value > 0) // Only show products with stock
          .sort((a: any, b: any) => b.value - a.value) // Sort by stock (descending)
          .slice(0, 10) // Limit to top 10 products for better visualization

        setProductChartData(productData)

        // If we have products with stock, select the first one by default
        if (productData.length > 0 && !selectedProduct) {
          setSelectedProduct(productData[0].id)
        }
      } catch (error) {
        console.error("Error fetching inventory overview data:", error)
        setError("Failed to load inventory data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedProduct])

  // Update variant data when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find((p) => p._id === selectedProduct)
      if (product) {
        const variantChartData = product.variants
          .map((variant: any) => ({
            name: variant.name,
            value: variant.currentStock || 0,
          }))
          .filter((item: any) => item.value > 0) // Only show variants with stock

        setVariantData(variantChartData)
      }
    }
  }, [selectedProduct, products])

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>Distribution of your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
        <Tabs defaultValue="variants" onValueChange={setView}>
          <TabsList className="mb-4">
            {/* <TabsTrigger value="products">By Products</TabsTrigger> */}
            <TabsTrigger value="variants">By Product Variants</TabsTrigger>
          </TabsList>

          {/* <TabsContent value="products" className="h-[800px]">
            {productChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                  <YAxis
                    label={{
                      value: "Stock Quantity",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} units`, "Stock"]}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background p-2 border rounded shadow-sm">
                            <p className="font-medium">{payload[0].payload.name}</p>
                            <p className="text-sm">{`Stock: ${payload[0].value} units`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Stock Quantity"
                    fill="#3b82f6"
                    onClick={(data) => setSelectedProduct(data.id)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No products with stock available</p>
              </div>
            )}
          </TabsContent> */}

          <TabsContent value="variants" className="h-[350px]">
            <div className="mb-4">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter((product) => product.variants.some((v: any) => (v.currentStock || 0) > 0))
                    .map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct ? (
              variantData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={variantData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {variantData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} units`, "Stock"]}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background p-2 border rounded shadow-sm">
                                <p className="font-medium">{payload[0].name}</p>
                                <p className="text-sm">{`Stock: ${payload[0].value} units`}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">No variants with stock available for this product</p>
                </div>
              )
            ) : (
              <div className="flex h-[250px] items-center justify-center">
                <p className="text-sm text-muted-foreground">Please select a product to view its variants</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

