"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/export-button"

interface SalesFiltersProps {
  onSearchChange: (value: string) => void
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  onPaymentStatusChange: (status: string) => void
  searchValue: string
  startDateValue: Date | undefined
  endDateValue: Date | undefined
  paymentStatusValue: string
  exportParams: Record<string, string>
}

export function SalesFilters({
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onPaymentStatusChange,
  searchValue,
  startDateValue,
  endDateValue,
  paymentStatusValue,
  exportParams,
}: SalesFiltersProps) {
  const resetFilters = () => {
    onSearchChange("")
    onStartDateChange(undefined)
    onEndDateChange(undefined)
    onPaymentStatusChange("all")
  }

  const hasActiveFilters =
    searchValue || startDateValue || endDateValue || (paymentStatusValue && paymentStatusValue !== "all")

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by invoice number or customer..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal sm:w-[200px]",
                  !startDateValue && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDateValue ? format(startDateValue, "MMM dd, yyyy") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDateValue} onSelect={onStartDateChange} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal sm:w-[200px]",
                  !endDateValue && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDateValue ? format(endDateValue, "MMM dd, yyyy") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDateValue}
                onSelect={onEndDateChange}
                initialFocus
                disabled={(date) => (startDateValue ? date < startDateValue : false)}
              />
            </PopoverContent>
          </Popover>

          <Select value={paymentStatusValue} onValueChange={onPaymentStatusChange}>
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasActiveFilters ? "Filtered results" : "Showing all sales"}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
          <ExportButton endpoint="/api/export/sales" filename="sales-report" params={exportParams} />
        </div>
      </div>
    </div>
  )
}

