import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/lib/models/notification"
import mongoose from "mongoose"

export async function PUT(req: NextRequest, { params }: any) {
  try {
    await connectDB()

    const id = params.id
    const body = await req.json()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isRead: body.isRead !== false },
      { new: true },
    )

    if (!updatedNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }:any) {
  try {
    await connectDB()

    const id = params.id

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    const deletedNotification = await Notification.findByIdAndDelete(id)

    if (!deletedNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}

