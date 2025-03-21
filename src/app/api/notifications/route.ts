import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/lib/models/notification"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const type = searchParams.get("type") || ""
    const isRead = searchParams.get("isRead") === "true" ? true : searchParams.get("isRead") === "false" ? false : null
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (type) query.type = type
    if (isRead !== null) query.isRead = isRead

    // Execute query
    const totalNotifications = await Notification.countDocuments(query)
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    // Get unread count
    const unreadCount = await Notification.countDocuments({ isRead: false })

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        total: totalNotifications,
        page,
        limit,
        pages: Math.ceil(totalNotifications / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Mark notifications as read
    if (body.markAllAsRead) {
      await Notification.updateMany({}, { isRead: true })
      return NextResponse.json({ message: "All notifications marked as read" })
    }

    if (body.ids && Array.isArray(body.ids)) {
      await Notification.updateMany({ _id: { $in: body.ids } }, { isRead: body.isRead !== false })
      return NextResponse.json({ message: "Notifications updated successfully" })
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}

