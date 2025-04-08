"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import axios from "axios"
// Add import for ExportButton
import { ExportButton } from "@/components/export-button"

export function InventoryFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [brand, setBrand] = useState(searchParams.get("brand") || "")
  const [supplier, setSupplier] = useState(searchParams.get("supplier") || "")
  const [stockStatus, setStockStatus] = useState(searchParams.get("stockStatus") || "")
  const [lowStock, setLowStock] = useState(searchParams.get("lowStock") === "true")
  // Add a new state for flag status
  const [flagStatus, setFlagStatus] = useState(searchParams.get("flagStatus") || "")

  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [suppliers, setSuppliers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true)

        // Fetch filter options in parallel
        const [categoriesRes, brandsRes, suppliersRes] = await Promise.all([
          axios.get("/api/products/categories"),
          axios.get("/api/products/brands"),
          axios.get("/api/products/suppliers"),
        ])

        setCategories(categoriesRes.data)
        setBrands(brandsRes.data)
        setSuppliers(suppliersRes.data)
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  // Apply filters automatically when they change
  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (category) params.set("category", category)
    if (brand) params.set("brand", brand)
    if (supplier) params.set("supplier", supplier)
    if (stockStatus) params.set("stockStatus", stockStatus)
    if (lowStock) params.set("lowStock", "true")
    // Add flag status to the params in the useEffect
    if (flagStatus) params.set("flagStatus", flagStatus)

    // Debounce to avoid too many router pushes
    const timer = setTimeout(() => {
      router.push(`/inventory?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, category, brand, supplier, stockStatus, lowStock, flagStatus, router])

  // Add flag status to the resetFilters function
  const resetFilters = () => {
    setSearch("")
    setCategory("")
    setBrand("")
    setSupplier("")
    setStockStatus("")
    setLowStock(false)
    setFlagStatus("")

    router.push("/inventory")
  }

  // Add flag status to the hasActiveFilters check
  const hasActiveFilters = search || category || brand || supplier || stockStatus || lowStock || flagStatus

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supplier} onValueChange={setSupplier}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockStatus} onValueChange={setStockStatus}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          {/* // Add the flag status filter dropdown in the UI // Add this inside the filters section */}
          <Select value={flagStatus} onValueChange={setFlagStatus}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Documentation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="green">Green Flag</SelectItem>
              <SelectItem value="red">Red Flag</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 rounded-md border px-3 py-2">
            <Checkbox id="lowStock" checked={lowStock} onCheckedChange={(checked) => setLowStock(checked as boolean)} />
            <Label htmlFor="lowStock" className="text-sm cursor-pointer">
              Low Stock
            </Label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasActiveFilters ? "Filtered results" : "Showing all products"}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
          <ExportButton endpoint="/api/export/inventory" filename="inventory-report" />
        </div>
      </div>
    </div>
  )
}
