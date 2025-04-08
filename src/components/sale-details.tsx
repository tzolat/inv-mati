"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { Trash, Printer, Edit } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

interface SaleDetailsProps {
  id: string
}

export function SaleDetails({ id }: SaleDetailsProps) {
  const router = useRouter()
  const [sale, setSale] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const response = await axios.get(`/api/sales/${id}`)
        setSale(response.data)
      } catch (error) {
        console.error("Error fetching sale:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSale()
  }, [id])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/sales/${id}`)
      router.push("/sales")
    } catch (error) {
      console.error("Error deleting sale:", error)
    }
  }

  const handlePrint = () => {
    window.print()
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
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">Sale not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The sale record you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" onClick={() => router.push("/sales")}>
          Back to Sales
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice #{sale.invoiceNumber}</h2>
          <p className="text-sm text-muted-foreground">{format(new Date(sale.createdAt), "MMMM dd, yyyy • h:mm a")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/sales/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
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
            <CardTitle>Sale Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Customer:</span>
              <span>{sale.customer || "Walk-in Customer"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Payment Method:</span>
              <span>{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Amount:</span>
              <span className="font-medium">${sale.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Profit:</span>
              <span className="text-green-600 font-medium">${sale.totalProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Profit Margin:</span>
              <span className="font-medium">{((sale.totalProfit / sale.totalAmount) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Payment Status:</span>
              <span>
                {sale.paymentStatus === "Completed" && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
                {sale.paymentStatus === "Pending" && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                )}
                {sale.paymentStatus === "Cancelled" && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    Cancelled
                  </Badge>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Documentation Status:</span>
              <span>
                {sale.flagStatus === "green" ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Green Flag
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    Red Flag
                  </Badge>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {sale.notes ? (
              <p className="text-sm">{sale.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No notes provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>
            This sale includes {sale.items.length} {sale.items.length === 1 ? "item" : "items"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Product</th>
                  <th className="p-2 text-left font-medium">Variant</th>
                  <th className="p-2 text-left font-medium">Quantity</th>
                  <th className="p-2 text-left font-medium">Unit Price</th>
                  <th className="p-2 text-left font-medium">Total</th>
                  <th className="p-2 text-left font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item: any) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2">{item.product?.name || "Unknown Product"}</td>
                    <td className="p-2">{item.variant}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">${item.actualSellingPrice.toFixed(2)}</td>
                    <td className="p-2">${(item.actualSellingPrice * item.quantity).toFixed(2)}</td>
                    <td className="p-2 text-green-600">${item.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-medium">
                  <td colSpan={4} className="p-2 text-right">
                    Total:
                  </td>
                  <td className="p-2">${sale.totalAmount.toFixed(2)}</td>
                  <td className="p-2 text-green-600">${sale.totalProfit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sale record from your system.
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
