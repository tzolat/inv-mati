import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Settings from "@/lib/models/settings"

export async function GET() {
  try {
    await connectDB()

    // Get settings (there should only be one document)
    let settings = await Settings.findOne()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        businessName: "Auto Parts Store",
        currency: "USD",
        lowStockThreshold: 5,
        taxRate: 0,
        notificationSettings: {
          lowStock: true,
          newSales: true,
          priceChanges: true,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Get existing settings
    let settings = await Settings.findOne()

    // If no settings exist, create new settings
    if (!settings) {
      settings = await Settings.create({
        ...body,
        updatedAt: new Date(),
      })
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate(
        {},
        {
          ...body,
          updatedAt: new Date(),
        },
        { new: true },
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

