"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import axios from "axios"
import { formatNumber } from "@/utils/formatNumber"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Eye, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SalesFilters } from "./sales-filters"

export function SalesTable() {
  const router = useRouter()
  const [allSales, setAllSales] = useState<any[]>([])
  const [filteredSales, setFilteredSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchFilter, setSearchFilter] = useState("")
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined)
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")

  // Fetch all sales data
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get("/api/sales?limit=1000")
        setAllSales(response.data.sales)
        setFilteredSales(response.data.sales)
      } catch (err) {
        console.error("Error fetching sales:", err)
        setError("Failed to load sales data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  // Apply filters whenever filter states change
  useEffect(() => {
    if (allSales.length === 0) return

    let result = [...allSales]

    // Apply search filter
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      result = result.filter(
        (sale) =>
          sale.invoiceNumber.toLowerCase().includes(searchLower) ||
          (sale.customer && sale.customer.toLowerCase().includes(searchLower)),
      )
    }

    // Apply date filters
    if (startDateFilter) {
      const startDate = new Date(startDateFilter)
      startDate.setHours(0, 0, 0, 0)
      result = result.filter((sale) => new Date(sale.createdAt) >= startDate)
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter)
      endDate.setHours(23, 59, 59, 999)
      result = result.filter((sale) => new Date(sale.createdAt) <= endDate)
    }

    // Apply payment status filter
    if (paymentStatusFilter && paymentStatusFilter !== "all") {
      result = result.filter((sale) => sale.paymentStatus === paymentStatusFilter)
    }

    setFilteredSales(result)
  }, [allSales, searchFilter, startDateFilter, endDateFilter, paymentStatusFilter])

  // Function to prepare export parameters
  const getExportParams = () => {
    const params: Record<string, string> = {}
    if (searchFilter) params.search = searchFilter
    if (startDateFilter) params.startDate = startDateFilter.toISOString()
    if (endDateFilter) params.endDate = endDateFilter.toISOString()
    if (paymentStatusFilter && paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter
    return params
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <SalesFilters
        onSearchChange={setSearchFilter}
        onStartDateChange={setStartDateFilter}
        onEndDateChange={setEndDateFilter}
        onPaymentStatusChange={setPaymentStatusFilter}
        searchValue={searchFilter}
        startDateValue={startDateFilter}
        endDateValue={endDateFilter}
        paymentStatusValue={paymentStatusFilter}
        exportParams={getExportParams()}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                  <TableCell>{sale.customer || "Walk-in Customer"}</TableCell>
                  <TableCell>{sale.createdAt ? format(new Date(sale.createdAt), "MMM dd, yyyy") : "N/A"}</TableCell>
                  <TableCell>${formatNumber(sale.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={sale.paymentStatus === "Completed" ? "outline" : "secondary"}
                      className={
                        sale.paymentStatus === "Completed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {sale.paymentStatus}
                    </Badge>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No sales found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

