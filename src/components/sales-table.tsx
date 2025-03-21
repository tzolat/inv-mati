"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MoreHorizontal, Plus, Trash, ShoppingCart, Edit } from "lucide-react"
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
import { Pagination } from "@/components/pagination"
import { format } from "date-fns"
import axios from "axios"
import { Badge } from "@/components/ui/badge"

export function SalesTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null)

  // Get search params
  const search = searchParams.get("search") || ""
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""
  const page = Number.parseInt(searchParams.get("page") || "1")

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        if (search) queryParams.set("search", search)
        if (startDate) queryParams.set("startDate", startDate)
        if (endDate) queryParams.set("endDate", endDate)
        queryParams.set("page", page.toString())
        queryParams.set("limit", "10")

        const response = await axios.get(`/api/sales?${queryParams.toString()}`)
        setSales(response.data.sales)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching sales:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [search, startDate, endDate, page])

  const handleDelete = async () => {
    if (!saleToDelete) return

    try {
      await axios.delete(`/api/sales/${saleToDelete}`)

      // Remove from list
      setSales(sales.filter((sale) => sale._id !== saleToDelete))

      // Update pagination if needed
      if (sales.length === 1 && pagination.page > 1) {
        router.push(`/sales?page=${pagination.page - 1}`)
      } else {
        // Refresh the current page
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting sale:", error)
    } finally {
      setDeleteDialogOpen(false)
      setSaleToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setSaleToDelete(id)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-[80px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-8 w-[300px]" />
        </div>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No sales found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {search || startDate || endDate
            ? "No sales match your current filters. Try adjusting your search criteria."
            : "You haven't recorded any sales yet. Record your first sale to get started."}
        </p>
        <Button className="mt-4" onClick={() => router.push("/sales/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Record Sale
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale._id}>
                <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                <TableCell>{format(new Date(sale.createdAt), "MMM dd, yyyy")}</TableCell>
                <TableCell>{sale.customer || "Walk-in Customer"}</TableCell>
                <TableCell>{sale.items.length}</TableCell>
                <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <span className="text-green-600">${sale.totalProfit.toFixed(2)}</span>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/sales/${sale._id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/sales/${sale._id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Sale
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => confirmDelete(sale._id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Sale
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(page) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set("page", page.toString())
          router.push(`/sales?${params.toString()}`)
        }}
      />

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

