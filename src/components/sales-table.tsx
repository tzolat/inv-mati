"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import axios from "axios"
import { SalesFilters } from "./sales-filters"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Eye, MoreHorizontal, Trash, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
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
import { ColumnVisibility } from "@/components/column-visibility"
import { formatNumber } from "@/utils/formatNumber"

// Define column configuration
interface ColumnDef {
  id: string
  label: string
  accessor: (sale: any) => any
  sortable: boolean
  canHide: boolean
  isVisible: boolean
}

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

  // Add state for sorting
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" } | null>(null)

  // Add state for column visibility
  const [columns, setColumns] = useState<ColumnDef[]>([
    {
      id: "invoice",
      label: "Invoice",
      accessor: (sale) => sale.invoiceNumber,
      sortable: true,
      canHide: false,
      isVisible: true,
    },
    {
      id: "customer",
      label: "Customer",
      accessor: (sale) => sale.customer || "Walk-in Customer",
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    {
      id: "date",
      label: "Date",
      accessor: (sale) => new Date(sale.createdAt).getTime(),
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    {
      id: "totalAmount",
      label: "Total Amount",
      accessor: (sale) => sale.totalAmount,
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    {
      id: "status",
      label: "Status",
      accessor: (sale) => sale.paymentStatus,
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    { id: "actions", label: "Actions", accessor: () => null, sortable: false, canHide: false, isVisible: true },
  ])

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

  // Function to handle column visibility changes
  const handleColumnVisibilityChange = (columnId: string, isVisible: boolean) => {
    setColumns(columns.map((col) => (col.id === columnId ? { ...col, isVisible } : col)))

    // Save column visibility preferences to localStorage
    const visibilityPrefs = columns.reduce(
      (acc, col) => {
        acc[col.id] = col.id === columnId ? isVisible : col.isVisible
        return acc
      },
      {} as Record<string, boolean>,
    )

    localStorage.setItem("salesTableColumns", JSON.stringify(visibilityPrefs))
  }

  // Load column visibility preferences from localStorage on initial render
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("salesTableColumns")
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs)
        setColumns(
          columns.map((col) => ({
            ...col,
            isVisible: prefs[col.id] !== undefined ? prefs[col.id] : col.isVisible,
          })),
        )
      }
    } catch (error) {
      console.error("Error loading column preferences:", error)
    }
  }, [])

  // Function to handle sorting
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column || !column.sortable) return

    if (sorting && sorting.column === columnId) {
      // Toggle direction if already sorting by this column
      setSorting({
        column: columnId,
        direction: sorting.direction === "asc" ? "desc" : "asc",
      })
    } else {
      // Set new sort column with default ascending direction
      setSorting({
        column: columnId,
        direction: "asc",
      })
    }
  }

  // Apply sorting to sales
  const sortedSales = [...filteredSales]
  if (sorting) {
    const column = columns.find((col) => col.id === sorting.column)
    if (column) {
      sortedSales.sort((a, b) => {
        const aValue = column.accessor(a)
        const bValue = column.accessor(b)

        // Handle string comparison
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sorting.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        // Handle number comparison
        return sorting.direction === "asc" ? aValue - bValue : bValue - aValue
      })
    }
  }

  // Function to prepare export parameters
  const getExportParams = () => {
    const params: Record<string, string> = {}
    if (searchFilter) params.search = searchFilter
    if (startDateFilter) params.startDate = startDateFilter.toISOString()
    if (endDateFilter) params.endDate = endDateFilter.toISOString()
    if (paymentStatusFilter && paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter
    return params
  }

  // Function to render sort indicator
  const renderSortIndicator = (columnId: string) => {
    if (!sorting || sorting.column !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sorting.direction === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
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
      <div className="flex justify-between items-center mb-4">
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
        <ColumnVisibility
          columns={columns.map((col) => ({
            id: col.id,
            label: col.label,
            isVisible: col.isVisible,
            canHide: col.canHide,
          }))}
          onColumnVisibilityChange={handleColumnVisibilityChange}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => {
                if (!column.isVisible) return null

                return (
                  <TableHead
                    key={column.id}
                    className={column.sortable ? "cursor-pointer select-none" : ""}
                    onClick={column.sortable ? () => handleSort(column.id) : undefined}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && renderSortIndicator(column.id)}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSales.length > 0 ? (
              sortedSales.map((sale) => (
                <TableRow key={sale._id}>
                  {columns.find((col) => col.id === "invoice")?.isVisible && (
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                  )}
                  {columns.find((col) => col.id === "customer")?.isVisible && (
                    <TableCell>{sale.customer || "Walk-in Customer"}</TableCell>
                  )}
                  {columns.find((col) => col.id === "date")?.isVisible && (
                    <TableCell>{sale.createdAt ? format(new Date(sale.createdAt), "MMM dd, yyyy") : "N/A"}</TableCell>
                  )}
                  {columns.find((col) => col.id === "totalAmount")?.isVisible && (
                    <TableCell>${formatNumber(sale.totalAmount)}</TableCell>
                  )}
                  {columns.find((col) => col.id === "status")?.isVisible && (
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
                  )}
                  {columns.find((col) => col.id === "actions")?.isVisible && (
                    <TableCell className="text-left">
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
                  )}
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

