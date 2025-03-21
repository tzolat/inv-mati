"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Check } from "lucide-react"
import { NotificationItem } from "@/components/notification-item"
import { Pagination } from "@/components/pagination"
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
import axios from "axios"

export function NotificationsList() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  })
  const [unreadCount, setUnreadCount] = useState(0)
  const [markAllDialogOpen, setMarkAllDialogOpen] = useState(false)

  // Get search params
  const type = searchParams.get("type") || ""
  const isRead = searchParams.get("isRead")
  const page = Number.parseInt(searchParams.get("page") || "1")

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)

        // Build query string
        const queryParams = new URLSearchParams()
        if (type) queryParams.set("type", type)
        if (isRead === "true" || isRead === "false") queryParams.set("isRead", isRead)
        queryParams.set("page", page.toString())
        queryParams.set("limit", "20")

        const response = await axios.get(`/api/notifications?${queryParams.toString()}`)
        setNotifications(response.data.notifications)
        setPagination(response.data.pagination)
        setUnreadCount(response.data.unreadCount)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [type, isRead, page])

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put("/api/notifications", { markAllAsRead: true })

      // Update UI
      setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
      setUnreadCount(0)
      setMarkAllDialogOpen(false)

      // Refresh if we're filtering by unread
      if (isRead === "false") {
        router.push("/notifications")
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const handleNotificationRead = () => {
    // Decrement unread count
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-start gap-2 p-3 border-b">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium">No notifications found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              {type || isRead
                ? "No notifications match your current filters. Try adjusting your filter criteria."
                : "You don't have any notifications yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setMarkAllDialogOpen(true)}>
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read ({unreadCount})
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleNotificationRead}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(page) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set("page", page.toString())
          router.push(`/notifications?${params.toString()}`)
        }}
      />

      <AlertDialog open={markAllDialogOpen} onOpenChange={setMarkAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark all as read?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all your unread notifications as read. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkAllAsRead}>Mark All as Read</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

