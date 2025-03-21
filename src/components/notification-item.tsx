"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Check, Package, ShoppingCart, DollarSign, Plus, Edit, Trash, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { useRouter } from "next/navigation"

interface NotificationItemProps {
  notification: {
    _id: string
    type: string
    message: string
    relatedTo?: string
    relatedModel?: string
    isRead: boolean
    createdAt: string
  }
  onMarkAsRead?: () => void
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const router = useRouter()
  const [isRead, setIsRead] = useState(notification.isRead)

  const getIcon = () => {
    switch (notification.type) {
      case "low_stock":
        return <Package className="h-4 w-4 text-orange-500" />
      case "new_sale":
        return <ShoppingCart className="h-4 w-4 text-green-500" />
      case "price_change":
        return <DollarSign className="h-4 w-4 text-blue-500" />
      case "product_added":
        return <Plus className="h-4 w-4 text-green-500" />
      case "product_updated":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "product_deleted":
        return <Trash className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const handleClick = async () => {
    try {
      // Navigate based on notification type
      if (notification.relatedModel === "Product" && notification.relatedTo) {
        router.push(`/inventory/${notification.relatedTo}`)
      } else if (notification.relatedModel === "Sale" && notification.relatedTo) {
        router.push(`/sales/${notification.relatedTo}`)
      } else {
        // Default to notifications page
        router.push("/notifications")
      }

      // Mark as read if not already
      if (!isRead) {
        await axios.put(`/api/notifications/${notification._id}`, { isRead: true })
        setIsRead(true)
        if (onMarkAsRead) onMarkAsRead()
      }
    } catch (error) {
      console.error("Error handling notification click:", error)
    }
  }

  const markAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await axios.put(`/api/notifications/${notification._id}`, { isRead: true })
      setIsRead(true)
      if (onMarkAsRead) onMarkAsRead()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <div
      className={cn("flex items-start gap-2 p-3 hover:bg-accent cursor-pointer", !isRead && "bg-accent/50")}
      onClick={handleClick}
    >
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm", !isRead && "font-medium")}>{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!isRead && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={markAsRead}>
          <Check className="h-4 w-4" />
          <span className="sr-only">Mark as read</span>
        </Button>
      )}
    </div>
  )
}

