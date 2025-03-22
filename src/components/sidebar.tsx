"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bell, Home, Package, Settings, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import axios from "axios"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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

  return (
    <>
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
      <SidebarContent className="hidden border-r bg-background md:block" unreadCount={unreadCount} />
    </>
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

