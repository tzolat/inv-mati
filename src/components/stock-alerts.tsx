"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

export function StockAlerts() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [restockOpen, setRestockOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [restockQuantity, setRestockQuantity] = useState(1)
  const [isRestocking, setIsRestocking] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("/api/products/low-stock")
        setAlerts(response.data)
      } catch (error) {
        console.error("Error fetching low stock alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const handleRestock = async () => {
    if (!selectedProduct || !selectedVariant) return

    try {
      setIsRestocking(true)

      // Find the product
      const productResponse = await axios.get(`/api/products/${selectedProduct._id}`)
      const product = productResponse.data

      // Update the variant stock
      const updatedVariants = product.variants.map((variant: any) => {
        if (variant.name === selectedVariant.name) {
          return {
            ...variant,
            currentStock: variant.currentStock + restockQuantity,
          }
        }
        return variant
      })

      // Save the updated product
      await axios.put(`/api/products/${selectedProduct._id}`, {
        ...product,
        variants: updatedVariants,
      })

      // Update the UI
      setAlerts(
        alerts
          .map((alert) => {
            if (alert._id === selectedProduct._id) {
              return {
                ...alert,
                lowStockVariants: alert.lowStockVariants.filter(
                  (v: any) =>
                    v.name !== selectedVariant.name ||
                    (v.name === selectedVariant.name && v.currentStock + restockQuantity <= v.lowStockThreshold),
                ),
              }
            }
            return alert
          })
          .filter((alert) => alert.lowStockVariants.length > 0),
      )

      toast({
        title: "Stock Updated",
        description: `Added ${restockQuantity} units to ${selectedProduct.name} - ${selectedVariant.name}`,
      })

      setRestockOpen(false)
    } catch (error) {
      console.error("Error restocking item:", error)
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRestocking(false)
    }
  }

  const openRestockDialog = (product: any, variant: any) => {
    setSelectedProduct(product)
    setSelectedVariant(variant)
    setRestockQuantity(1)
    setRestockOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </CardHeader>
        <CardContent>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="mb-4 flex items-center gap-4">
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    )
  }

  // Get all variants that are low in stock or out of stock
  const allVariants = alerts.flatMap((product) =>
    product.lowStockVariants.map((variant: any) => ({
      product,
      variant,
      status: variant.currentStock === 0 ? "out-of-stock" : "low-stock",
    })),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Stock Alerts</CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </div>
        {allVariants.length > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {allVariants.length} items
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {allVariants.length > 0 ? (
          <div className="space-y-4">
            {allVariants.slice(0, 5).map((item, index) => (
              <div key={`${item.product._id}-${item.variant.name}-${index}`} className="flex items-start gap-4">
                <div
                  className={`mt-1 rounded-full p-1 ${item.status === "out-of-stock" ? "bg-red-100" : "bg-orange-100"}`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 ${item.status === "out-of-stock" ? "text-red-600" : "text-orange-600"}`}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">
                    {item.product.name} - {item.variant.name}
                  </p>
                  <div className="flex place-items-start justify-between gap-2">
                    {item.status === "out-of-stock" ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-orange-500">
                        Low Stock: {item.variant.currentStock}/{item.variant.lowStockThreshold}
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openRestockDialog(item.product, item.variant)} className="-mt-7">
                      <Plus className="mr-1 h-3 w-3" /> Restock
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {allVariants.length > 5 && (
              <p className="text-xs text-muted-foreground">+{allVariants.length - 5} more items need attention</p>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/inventory")} // Ensure lowStock=true is passed
            >
              View all low stock items
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-green-100 p-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-sm font-medium">No Low Stock Items</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              All your inventory items are above their minimum threshold levels.
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add inventory to {selectedProduct?.name} - {selectedVariant?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-stock">Current Stock</Label>
              <Input id="current-stock" value={selectedVariant?.currentStock || 0} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(Number.parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestock} disabled={isRestocking}>
              {isRestocking ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

