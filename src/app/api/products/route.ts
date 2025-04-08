import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"
import Notification from "@/lib/models/notification"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const brand = searchParams.get("brand") || ""
    const supplier = searchParams.get("supplier") || ""
    const lowStock = searchParams.get("lowStock") === "true"
    const stockStatus = searchParams.get("stockStatus") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const flagStatus = searchParams.get("flagStatus") || ""

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "variants.sku": { $regex: search, $options: "i" } },
      ]
    }

    if (category) query.category = category
    if (brand) query.brand = brand
    if (supplier) query.supplier = supplier

    if (lowStock) {
      query["variants.currentStock"] = { $lte: "$variants.lowStockThreshold" }
    }

    // Add flag status to the query
    if (flagStatus === "green" || flagStatus === "red") {
      if (flagStatus === "red") {
        // Show products where ANY variant has a red flag
        // Use aggregate to filter products with any red-flagged variant
        const productsWithRedFlags = await Product.find({
          "variants.flagStatus": "red",
        })

        // Extract product IDs to use in main query
        const productIds = productsWithRedFlags.map((p) => p._id)
        query._id = { $in: productIds }
      } else {
        // Show products where ALL variants have green flags
        // Use aggregate to filter products with any red-flagged variant
        const productsWithRedFlags = await Product.find({
          "variants.flagStatus": "red",
        })

        // Extract product IDs to use in main query
        const productIds = productsWithRedFlags.map((p) => p._id)
        query._id = { $nin: productIds }
      }
    }

    // Handle stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case "in-stock":
          // At least one variant has stock > 0 and > lowStockThreshold
          query.$expr = {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$variants",
                    as: "variant",
                    cond: {
                      $and: [
                        { $gt: ["$$variant.currentStock", 0] },
                        { $gt: ["$$variant.currentStock", "$$variant.lowStockThreshold"] },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          }
          break

        case "low-stock":
          // At least one variant has stock > 0 but <= lowStockThreshold
          query.$expr = {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$variants",
                    as: "variant",
                    cond: {
                      $and: [
                        { $gt: ["$$variant.currentStock", 0] },
                        { $lte: ["$$variant.currentStock", "$$variant.lowStockThreshold"] },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          }
          break

        case "out-of-stock":
          // At least one variant has stock = 0
          query.$expr = {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$variants",
                    as: "variant",
                    cond: { $eq: ["$$variant.currentStock", 0] },
                  },
                },
              },
              0,
            ],
          }
          break
      }
    }

    // Execute query
    const totalProducts = await Product.countDocuments(query)
    const products = await Product.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit)

    return NextResponse.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Validate required fields
    if (!body.name || !body.category || !body.brand || !body.supplier || !body.variants || body.variants.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for duplicate SKUs
    const skus = body.variants.map((variant: any) => variant.sku)
    const existingSKUs = await Product.find({
      "variants.sku": { $in: skus },
    })

    if (existingSKUs.length > 0) {
      return NextResponse.json({ error: "One or more SKUs already exist" }, { status: 400 })
    }

    // Make sure each variant has a flagStatus set, default to green if not provided
    if (body.variants && body.variants.length > 0) {
      body.variants = body.variants.map((variant: any) => {
        return {
          ...variant,
          flagStatus: variant.flagStatus || "green",
        }
      })
    }

    // Create new product
    const newProduct = await Product.create(body)

    // Create notification for new product
    await Notification.create({
      type: "product_added",
      message: `New product added: ${body.name}`,
      relatedTo: newProduct._id,
      relatedModel: "Product",
      isRead: false,
    })

    const res = NextResponse.json(newProduct, { status: 201 })

    // Dispatch event to client
    res.headers.set("X-Notification-Created", "true")

    return res
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
