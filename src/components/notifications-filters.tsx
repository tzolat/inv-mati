"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

export function NotificationsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [type, setType] = useState(searchParams.get("type") || "")
  const [isRead, setIsRead] = useState(searchParams.get("isRead") || "")

  // Apply filters automatically when they change
  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (type) params.set("type", type)
    if (isRead) params.set("isRead", isRead)

    // Debounce to avoid too many router pushes
    const timer = setTimeout(() => {
      router.push(`/notifications?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, type, isRead, router])

  const resetFilters = () => {
    setSearch("")
    setType("")
    setIsRead("")

    router.push("/notifications")
  }

  const hasActiveFilters = search || type || isRead

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notifications..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <Select value={type} onValueChange={(value) => setType(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Notification Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="new_sale">New Sale</SelectItem>
              <SelectItem value="price_change">Price Change</SelectItem>
              <SelectItem value="product_added">Product Added</SelectItem>
              <SelectItem value="product_updated">Product Updated</SelectItem>
              <SelectItem value="product_deleted">Product Deleted</SelectItem>
              <SelectItem value="sale_updated">Sale Updated</SelectItem>
              <SelectItem value="stock_update">Stock Update</SelectItem>
            </SelectContent>
          </Select>

          <Select value={isRead} onValueChange={(value) => setIsRead(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Read Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="false">Unread</SelectItem>
              <SelectItem value="true">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasActiveFilters ? "Filtered results" : "Showing all notifications"}
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}

