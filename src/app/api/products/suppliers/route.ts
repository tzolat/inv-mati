import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"

export async function GET() {
  try {
    await connectDB()

    const suppliers = await Product.distinct("supplier")

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

