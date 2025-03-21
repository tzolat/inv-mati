"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import axios from "axios"

export function RecentSales() {
  const router = useRouter()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get("/api/sales?limit=5")
        setSales(response.data.sales)
      } catch (error) {
        console.error("Error fetching recent sales:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest transactions</CardDescription>
        </div>
        <Button variant="outline" onClick={() => router.push("/sales")}>
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {sales.length > 0 ? (
          <div className="space-y-6">
            {sales.map((sale) => (
              <div key={sale._id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">
                      {sale.customer ? sale.customer.substring(0, 2).toUpperCase() : "CS"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {sale.customer || "Customer Sale"} - {sale.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true })} •{sale.items.length}{" "}
                      {sale.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${sale.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-green-500">+${sale.totalProfit.toFixed(2)} profit</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <h3 className="text-sm font-medium">No Recent Sales</h3>
            <p className="mt-1 text-xs text-muted-foreground">Start recording sales to see them here.</p>
            <Button className="mt-4" size="sm" onClick={() => router.push("/sales/add")}>
              Record a Sale
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

