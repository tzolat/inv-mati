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
import { Edit, Eye, MoreHorizontal, Plus, Trash, Package, ChevronDown, ChevronRight } from "lucide-react"
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
import { formatNumber } from "@/utils/formatNumber";

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

        // Build query string
        const queryParams = new URLSearchParams()
        if (search) queryParams.set("search", search)
        if (category) queryParams.set("category", category)
        if (brand) queryParams.set("brand", brand)
        if (supplier) queryParams.set("supplier", supplier)
        if (lowStock === "true") queryParams.set("lowStock", "true")
        if (stockStatus) queryParams.set("stockStatus", stockStatus)
        queryParams.set("page", page.toString())
        queryParams.set("limit", "10")

        const response = await axios.get(`/api/products?${queryParams.toString()}`)
        setProducts(response.data.products)
        setPagination(response.data.pagination)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category, brand, supplier, stockStatus, lowStock, page])

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
    if (selectedItems.length === products.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(products.map((product) => product._id))
    }
  }

  // Add function to handle batch operation completion
  const handleBatchComplete = () => {
    setSelectedItems([])
    router.refresh()
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

  if (products.length === 0) {
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
      {/* Add batch operations above the table */}
      <div className="mb-4 flex justify-end">
        <BatchOperations selectedItems={selectedItems} onComplete={handleBatchComplete} />
      </div>
      <div className="rounded-md border">
        <Table>
          {/* Update the table header to include checkbox */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedItems.length === products.length && products.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
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
            {products.map((product) => {
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
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>{product.variants.length}</TableCell>
                    <TableCell>{formatNumber(totalStock)}</TableCell>
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

