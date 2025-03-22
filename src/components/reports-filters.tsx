"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, CalendarIcon } from "lucide-react"
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
} from "date-fns"
import { cn } from "@/lib/utils"

export function ReportsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
  )
  const [interval, setInterval] = useState(searchParams.get("interval") || "day")

  // Apply filters automatically when they change
  useEffect(() => {
    const params = new URLSearchParams()

    if (startDate) params.set("startDate", startDate.toISOString())
    if (endDate) params.set("endDate", endDate.toISOString())
    if (interval) params.set("interval", interval)

    // Use a small delay to avoid too many router pushes when multiple filters change at once
    const timer = setTimeout(() => {
      router.push(`/reports?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [startDate, endDate, interval, router])

  const resetFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setInterval("day")
  }

  const applyPreset = (preset: string) => {
    const now = new Date()

    switch (preset) {
      case "today":
        // Set start date to beginning of today (00:00:00)
        const todayStart = startOfDay(now)
        // Set end date to end of today (23:59:59)
        const todayEnd = endOfDay(now)
        setStartDate(todayStart)
        setEndDate(todayEnd)
        setInterval("hour")
        break
      case "yesterday":
        const yesterday = subDays(now, 1)
        // Set start date to beginning of yesterday (00:00:00)
        const yesterdayStart = startOfDay(yesterday)
        // Set end date to end of yesterday (23:59:59)
        const yesterdayEnd = endOfDay(yesterday)
        setStartDate(yesterdayStart)
        setEndDate(yesterdayEnd)
        setInterval("hour")
        break
      case "last7days":
        setStartDate(startOfDay(subDays(now, 6)))
        setEndDate(endOfDay(now))
        setInterval("day")
        break
      case "last30days":
        setStartDate(startOfDay(subDays(now, 29)))
        setEndDate(endOfDay(now))
        setInterval("day")
        break
      case "thisMonth":
        setStartDate(startOfMonth(now))
        setEndDate(endOfDay(now))
        setInterval("day")
        break
      case "lastMonth":
        const lastMonth = subMonths(now, 1)
        setStartDate(startOfMonth(lastMonth))
        setEndDate(endOfMonth(lastMonth))
        setInterval("day")
        break
      case "thisYear":
        setStartDate(startOfYear(now))
        setEndDate(endOfDay(now))
        setInterval("month")
        break
      case "lastYear":
        const lastYear = new Date(now.getFullYear() - 1, 0, 1)
        setStartDate(startOfYear(lastYear))
        setEndDate(endOfYear(lastYear))
        setInterval("month")
        break
    }
  }

  const hasActiveFilters = startDate || endDate || interval !== "day"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
       
        <Button variant="outline" size="sm" onClick={() => applyPreset("last7days")}>
          Last 7 Days
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset("last30days")}>
          Last 30 Days
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset("thisMonth")}>
          This Month
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset("lastMonth")}>
          Last Month
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset("thisYear")}>
          This Year
        </Button>
        <Button variant="outline" size="sm" onClick={() => applyPreset("lastYear")}>
          Last Year
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[200px]",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[200px]",
                  !endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => (startDate ? date < startDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasActiveFilters ? "Custom date range" : "Showing default period (current month)"}
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}

