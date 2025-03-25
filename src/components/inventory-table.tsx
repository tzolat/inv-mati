"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash,
  Package,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react"
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
import axios from "axios"
// Add imports for batch operations
import { Checkbox } from "@/components/ui/checkbox"
import { BatchOperations } from "@/components/batch-operations"
import { ColumnVisibility } from "@/components/column-visibility"
import { formatNumber } from "@/utils/formatNumber"

// Define column configuration
interface ColumnDef {
  id: string
  label: string
  accessor: (product: any) => any
  sortable: boolean
  canHide: boolean
  isVisible: boolean
}

export function InventoryTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  // Add state for selected items
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Add state for sorting
  const [sorting, setSorting] = useState<{ column: string; direction: "asc" | "desc" } | null>(null)

  // Add state for column visibility
  const [columns, setColumns] = useState<ColumnDef[]>([
    { id: "name", label: "Name", accessor: (product) => product.name, sortable: true, canHide: false, isVisible: true },
    {
      id: "category",
      label: "Category",
      accessor: (product) => product.category,
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    {
      id: "brand",
      label: "Brand",
      accessor: (product) => product.brand,
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    {
      id: "variants",
      label: "Variants",
      accessor: (product) => product.variants.length,
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    {
      id: "totalStock",
      label: "Total Stock",
      accessor: (product) => product.variants.reduce((sum: number, variant: any) => sum + variant.currentStock, 0),
      sortable: true,
      canHide: true,
      isVisible: true,
    },
    { id: "status", label: "Status", accessor: () => null, sortable: false, canHide: true, isVisible: true },
    { id: "actions", label: "Actions", accessor: () => null, sortable: false, canHide: false, isVisible: true },
  ])

  // Get search params
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const brand = searchParams.get("brand") || ""
  const supplier = searchParams.get("supplier") || ""
  const stockStatus = searchParams.get("stockStatus") || ""
  const lowStock = searchParams.get("lowStock") || ""
  const page = Number.parseInt(searchParams.get("page") || "1")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null); // Reset error state

        // Build query string
        const queryParams = new URLSearchParams()
        if (search) queryParams.set("search", search)
        if (category) queryParams.set("category", category)
        if (brand) queryParams.set("brand", brand)
        if (supplier) queryParams.set("supplier", supplier)
        if (lowStock === "true") queryParams.set("lowStock", "true") // Ensure lowStock is handled
        if (stockStatus) queryParams.set("stockStatus", stockStatus)
        queryParams.set("page", page.toString())
        queryParams.set("limit", "10")

        const response = await axios.get(`/api/products?${queryParams.toString()}`)
        let fetchedProducts = response.data.products

        // Apply low stock filtering if `lowStock=true` is present
        if (lowStock === "true") {
          fetchedProducts = fetchedProducts.filter((product: any) =>
            product.variants.some(
              (variant: any) => variant.currentStock > 0 && variant.currentStock <= variant.lowStockThreshold,
            ),
          )
        }

        setProducts(fetchedProducts)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching products:", error) // Log the error for debugging
        setError("Failed to load products. Please try again later."); // Set user-friendly error message
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category, brand, supplier, stockStatus, lowStock, page])

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

    localStorage.setItem("inventoryTableColumns", JSON.stringify(visibilityPrefs))
  }

  // Load column visibility preferences from localStorage on initial render
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("inventoryTableColumns")
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

  // Apply sorting to products
  const sortedProducts = [...products]
  if (sorting) {
    const column = columns.find((col) => col.id === sorting.column)
    if (column) {
      sortedProducts.sort((a, b) => {
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

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await axios.delete(`/api/products/${productToDelete}`)

      // Remove from list
      setProducts(products.filter((product) => product._id !== productToDelete))

      // Update pagination if needed
      if (products.length === 1 && pagination.page > 1) {
        router.push(`/inventory?page=${pagination.page - 1}`)
      } else {
        // Refresh the current page
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setProductToDelete(id)
    setDeleteDialogOpen(true)
  }

  const toggleRowExpansion = (productId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  // Add function to handle selection
  const toggleSelection = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  // Add function to handle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === sortedProducts.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(sortedProducts.map((product) => product._id))
    }
  }

  // Add function to handle batch operation completion
  const handleBatchComplete = () => {
    setSelectedItems([])
    router.refresh()
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
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
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
                      <Skeleton className="h-4 w-[50px]" />
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">Error Loading Products</h3>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => router.refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No products found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {search || category || brand || supplier || lowStock || stockStatus
            ? "No products match your current filters. Try adjusting your search criteria."
            : "You haven't added any products yet. Add your first product to get started."}
        </p>
        <Button className="mt-4" onClick={() => router.push("/inventory/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Add batch operations and column visibility controls */}
      <div className="mb-4 flex justify-between items-center">
        <BatchOperations selectedItems={selectedItems} onComplete={handleBatchComplete} />
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
          {/* Update the table header to include checkbox and sorting */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedItems.length === sortedProducts.length && sortedProducts.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[30px]"></TableHead>
              {columns.map((column) => {
                if (!column.isVisible || column.id === "actions") return null

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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => {
              const totalStock = product.variants.reduce((sum: number, variant: any) => sum + variant.currentStock, 0)
              const hasLowStock = product.variants.some(
                (variant: any) => variant.currentStock <= variant.lowStockThreshold && variant.currentStock > 0,
              )
              const hasOutOfStock = product.variants.some((variant: any) => variant.currentStock === 0)
              const isExpanded = expandedRows[product._id] || false

              return (
                <>
                  {/* Update the table row to include checkbox */}
                  <TableRow key={product._id} className={isExpanded ? "border-b-0" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(product._id)}
                        onCheckedChange={() => toggleSelection(product._id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleRowExpansion(product._id)}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    {columns.find((col) => col.id === "name")?.isVisible && (
                      <TableCell className="font-medium">{product.name}</TableCell>
                    )}
                    {columns.find((col) => col.id === "category")?.isVisible && (
                      <TableCell>{product.category}</TableCell>
                    )}
                    {columns.find((col) => col.id === "brand")?.isVisible && <TableCell>{product.brand}</TableCell>}
                    {columns.find((col) => col.id === "variants")?.isVisible && (
                      <TableCell>{product.variants.length}</TableCell>
                    )}
                    {columns.find((col) => col.id === "totalStock")?.isVisible && (
                      <TableCell>{formatNumber(totalStock)}</TableCell>
                    )}
                    {columns.find((col) => col.id === "status")?.isVisible && (
                      <TableCell>
                        {hasOutOfStock ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : hasLowStock ? (
                          <Badge variant="destructive" className="bg-orange-500">
                            Low Stock
                          </Badge>
                        ) : totalStock === 0 ? (
                          <Badge variant="outline">Out of Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                    )}
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
                          <DropdownMenuItem onClick={() => router.push(`/inventory/${product._id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/inventory/${product._id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => confirmDelete(product._id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Expanded row with variants */}
                  {isExpanded && (
                    <TableRow key={`${product._id}-expanded`} className="bg-muted/50">
                      <TableCell colSpan={8} className="p-0">
                        <div className="px-4 py-2">
                          <h4 className="font-medium mb-2">Variants</h4>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Cost Price</TableHead>
                                  <TableHead>Selling Price</TableHead>
                                  <TableHead>Current Stock</TableHead>
                                  <TableHead>Threshold</TableHead>
                                  <TableHead>Location</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {product.variants.map((variant: any) => (
                                  <TableRow key={`${product._id}-${variant.name}`}>
                                    <TableCell>{variant.name}</TableCell>
                                    <TableCell>{variant.sku}</TableCell>
                                    <TableCell>${formatNumber(variant.costPrice)}</TableCell>
                                    <TableCell>${formatNumber(variant.sellingPrice)}</TableCell>
                                    <TableCell>{formatNumber(variant.currentStock)}</TableCell>
                                    <TableCell>{formatNumber(variant.lowStockThreshold)}</TableCell>
                                    <TableCell>{variant.location || "-"}</TableCell>
                                    <TableCell>
                                      {variant.currentStock === 0 ? (
                                        <Badge variant="destructive">Out of Stock</Badge>
                                      ) : variant.currentStock <= variant.lowStockThreshold ? (
                                        <Badge variant="destructive" className="bg-orange-500">
                                          Low Stock
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="bg-green-100 text-green-800 hover:bg-green-100"
                                        >
                                          In Stock
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(page) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set("page", page.toString())
          router.push(`/inventory?${params.toString()}`)
        }}
      />

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

