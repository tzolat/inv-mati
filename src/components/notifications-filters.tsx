"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

export function NotificationsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get("type") || ""
  const isRead = searchParams.get("isRead") || ""

  const applyFilters = (newType?: string, newIsRead?: string) => {
    const params = new URLSearchParams()

    if (newType !== undefined) {
      if (newType) params.set("type", newType)
    } else if (type) {
      params.set("type", type)
    }

    if (newIsRead !== undefined) {
      if (newIsRead) params.set("isRead", newIsRead)
    } else if (isRead) {
      params.set("isRead", isRead)
    }

    router.push(`/notifications?${params.toString()}`)
  }

  const resetFilters = () => {
    router.push("/notifications")
  }

  const hasActiveFilters = type || isRead

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Select value={type} onValueChange={(value) => applyFilters(value, isRead)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="new_sale">New Sale</SelectItem>
            <SelectItem value="price_change">Price Change</SelectItem>
          </SelectContent>
        </Select>

        <Select value={isRead} onValueChange={(value) => applyFilters(type, value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="false">Unread</SelectItem>
            <SelectItem value="true">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}

