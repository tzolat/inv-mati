import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Sale from "@/lib/models/sale"
import mongoose from "mongoose"
import Notification from "@/lib/models/notification"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = params.id

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 })
    }

    const sale = await Sale.findById(id).populate({
      path: "items.product",
      select: "name brand category",
    })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error fetching sale:", error)
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = params.id

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 })
    }

    const deletedSale = await Sale.findByIdAndDelete(id)

    if (!deletedSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Sale deleted successfully" })
  } catch (error) {
    console.error("Error deleting sale:", error)
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const id = params.id
    const body = await req.json()

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid sale ID" }, { status: 400 })
    }

    // Find the sale
    const sale = await Sale.findById(id)

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Update only the allowed fields
    if (body.customer !== undefined) sale.customer = body.customer
    if (body.paymentMethod) sale.paymentMethod = body.paymentMethod
    if (body.paymentStatus) sale.paymentStatus = body.paymentStatus
    if (body.notes !== undefined) sale.notes = body.notes
    if (body.flagStatus) sale.flagStatus = body.flagStatus

    sale.updatedAt = new Date()

    // Save the updated sale
    await sale.save()

    // Create notification for sale update
    await Notification.create({
      type: "sale_updated",
      message: `Sale updated: ${sale.invoiceNumber}`,
      relatedTo: sale._id,
      relatedModel: "Sale",
      isRead: false,
    })

    return NextResponse.json(sale)
  } catch (error) {
    console.error("Error updating sale:", error)
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 })
  }
}
