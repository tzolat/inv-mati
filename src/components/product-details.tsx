"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import axios from "axios"
import { TableCell } from "@/components/ui/table"

interface ProductDetailsProps {
  id: string
}

export function ProductDetails({ id }: ProductDetailsProps) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`)
        setProduct(response.data)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/products/${id}`)
      router.push("/inventory")
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  // Function to check if a product has any red-flagged variants
  const hasRedFlag = (product: any) => {
    if (!product || !product.variants || product.variants.length === 0) return false
    return product.variants.some((variant: any) => variant.flagStatus === "red")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[150px] w-full" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">Product not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => router.push("/inventory")}>
          Back to Inventory
        </Button>
      </div>
    )
  }

  // Calculate total stock and check if any variant is low in stock
  const totalStock = product.variants.reduce((sum: number, variant: any) => sum + variant.currentStock, 0)
  const hasLowStock = product.variants.some((variant: any) => variant.currentStock <= variant.lowStockThreshold)
  const productHasRedFlag = hasRedFlag(product)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/inventory/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Category:</span>
              <span>{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Brand:</span>
              <span>{product.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Supplier:</span>
              <span>{product.supplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Stock:</span>
              <span>{totalStock} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span>
                {hasLowStock ? (
                  <Badge variant="destructive">Low Stock</Badge>
                ) : totalStock === 0 ? (
                  <Badge variant="outline">Out of Stock</Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    In Stock
                  </Badge>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Documentation Status:</span>
              <span>
                {productHasRedFlag ? (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    Red Flag
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Green Flag
                  </Badge>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {product.description ? (
              <p className="text-sm">{product.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            This product has {product.variants.length} {product.variants.length === 1 ? "variant" : "variants"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">SKU</th>
                      <th className="p-2 text-left font-medium">Cost Price</th>
                      <th className="p-2 text-left font-medium">Selling Price</th>
                      <th className="p-2 text-left font-medium">Stock</th>
                      <th className="p-2 text-left font-medium">Location</th>
                      <th className="p-2 text-left font-medium">Status</th>
                      <th className="p-2 text-left font-medium">Documentation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant: any) => (
                      <tr key={variant._id} className="border-b">
                        <td className="p-2">{variant.name}</td>
                        <td className="p-2">{variant.sku}</td>
                        <td className="p-2">${variant.costPrice.toFixed(2)}</td>
                        <td className="p-2">${variant.sellingPrice.toFixed(2)}</td>
                        <td className="p-2">{variant.currentStock}</td>
                        <td className="p-2">{variant.location || "-"}</td>
                        <td className="p-2">
                          {variant.currentStock <= variant.lowStockThreshold ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : variant.currentStock === 0 ? (
                            <Badge variant="outline">Out of Stock</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              In Stock
                            </Badge>
                          )}
                        </td>
                        <TableCell>
                          {variant.flagStatus === "red" ? (
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              Red Flag
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Green Flag
                            </Badge>
                          )}
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="cards">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {product.variants.map((variant: any) => (
                  <Card key={variant._id}>
                    <CardHeader>
                      <CardTitle className="text-base">{variant.name}</CardTitle>
                      <CardDescription>SKU: {variant.sku}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Cost Price:</span>
                          <span className="text-sm font-medium">${variant.costPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Selling Price:</span>
                          <span className="text-sm font-medium">${variant.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Profit Margin:</span>
                          <span className="text-sm font-medium">
                            {(((variant.sellingPrice - variant.costPrice) / variant.sellingPrice) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm">Current Stock:</span>
                          <span className="text-sm font-medium">{variant.currentStock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Low Stock Threshold:</span>
                          <span className="text-sm font-medium">{variant.lowStockThreshold}</span>
                        </div>
                        {variant.location && (
                          <div className="flex justify-between">
                            <span className="text-sm">Location:</span>
                            <span className="text-sm font-medium">{variant.location}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm">Documentation:</span>
                          <span className="text-sm font-medium">
                            {variant.flagStatus === "red" ? (
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                Red Flag
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Green Flag
                              </Badge>
                            )}
                          </span>
                        </div>
                        <div className="pt-2">
                          {variant.currentStock <= variant.lowStockThreshold ? (
                            <Badge variant="destructive" className="w-full justify-center">
                              Low Stock
                            </Badge>
                          ) : variant.currentStock === 0 ? (
                            <Badge variant="outline" className="w-full justify-center">
                              Out of Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-100"
                            >
                              In Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and all its variants from your
              inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
