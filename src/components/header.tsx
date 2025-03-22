"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import axios from "axios"
import { NotificationItem } from "@/components/notification-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"


import Link from "next/link"

import { BarChart3, Home, Package, Settings, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}


export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [search, setSearch] = useState("")
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [open, setOpen] = useState(false)
 

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get("/api/notifications?isRead=false&limit=1")
        setUnreadCount(response.data.unreadCount)
      } catch (error) {
        console.error("Error fetching unread notifications:", error)
      }
    }

    fetchUnreadCount()

    // Set up interval to check for new notifications more frequently
    const interval = setInterval(fetchUnreadCount, 15000) // Check every 15 seconds

    // Set up event listener for new notifications
    window.addEventListener("new-notification", fetchUnreadCount)

    return () => {
      clearInterval(interval)
      window.removeEventListener("new-notification", fetchUnreadCount)
    }
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/api/notifications?limit=5")
        setNotifications(response.data.notifications)
        setUnreadCount(response.data.unreadCount)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Set up interval to check for new notifications more frequently
    const interval = setInterval(fetchNotifications, 15000) // Check every 15 seconds

    // Set up event listener for new notifications
    window.addEventListener("new-notification", fetchNotifications)

    return () => {
      clearInterval(interval)
      window.removeEventListener("new-notification", fetchNotifications)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!search.trim()) return

    // Determine where to redirect based on current path
    if (pathname.startsWith("/inventory")) {
      router.push(`/inventory?search=${encodeURIComponent(search)}`)
    } else if (pathname.startsWith("/sales")) {
      router.push(`/sales?search=${encodeURIComponent(search)}`)
    } else {
      router.push(`/inventory?search=${encodeURIComponent(search)}`)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications", { markAllAsRead: true })
      setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
       <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="m-2 md:hidden">
            <Package className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent className="w-full" unreadCount={unreadCount} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
      <form onSubmit={handleSearch} className="flex-1 md:flex-initial">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </form>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-300 text-[10px] font-medium text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[380px]">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem key={notification._id} notification={notification} />
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              )}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button variant="ghost" className="w-full justify-center" onClick={() => router.push("/notifications")}>
                View all notifications
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function SidebarContent({
  className,
  unreadCount,
  setOpen,
}: SidebarProps & {
  unreadCount: number
  setOpen?: (open: boolean) => void
}) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (setOpen) {
      setOpen(false)
    }
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold" onClick={handleLinkClick}>
          <Package className="h-6 w-6" />
          <span>AutoParts IMS</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/" ? "bg-accent text-accent-foreground" : "transparent",
            )}
            onClick={handleLinkClick}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/inventory"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/inventory") ? "bg-accent text-accent-foreground" : "transparent",
            )}
            onClick={handleLinkClick}
          >
            <Package className="h-4 w-4" />
            Inventory
          </Link>
          <Link
            href="/sales"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/sales") ? "bg-accent text-accent-foreground" : "transparent",
            )}
            onClick={handleLinkClick}
          >
            <ShoppingCart className="h-4 w-4" />
            Sales
          </Link>
          <Link
            href="/reports"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/reports") ? "bg-accent text-accent-foreground" : "transparent",
            )}
            onClick={handleLinkClick}
          >
            <BarChart3 className="h-4 w-4" />
            Reports
          </Link>
          <Link
            href="/notifications"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/notifications") ? "bg-accent text-accent-foreground" : "transparent",
            )}
            onClick={handleLinkClick}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-orange-300 text-[10px] font-medium text-primary-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/settings") ? "bg-accent text-accent-foreground" : "transparent",
            )}
            onClick={handleLinkClick}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </ScrollArea>
    </div>
  )
}