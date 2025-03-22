import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Product from "@/lib/models/product"
import { parse } from "json2csv"
import * as XLSX from "xlsx"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const url = new URL(req.url)
    const searchParams = url.searchParams
    const format = searchParams.get("format") || "csv"

    // Fetch all products
    const products = await Product.find()

    // Flatten the data for export
    const flattenedData = products.flatMap((product) => {
      return product.variants.map((variant) => ({
        productName: product.name,
        productCategory: product.category,
        productBrand: product.brand,
        productSupplier: product.supplier,
        variantName: variant.name,
        sku: variant.sku,
        costPrice: variant.costPrice,
        sellingPrice: variant.sellingPrice,
        currentStock: variant.currentStock,
        lowStockThreshold: variant.lowStockThreshold,
        location: variant.location || "",
        profitMargin: (((variant.sellingPrice - variant.costPrice) / variant.sellingPrice) * 100).toFixed(2) + "%",
        stockStatus:
          variant.currentStock === 0
            ? "Out of Stock"
            : variant.currentStock <= variant.lowStockThreshold
              ? "Low Stock"
              : "In Stock",
      }))
    })

    // Generate the appropriate format
    let data: any
    let contentType: string

    switch (format) {
      case "csv":
        data = parse(flattenedData)
        contentType = "text/csv"
        break

      case "xlsx":
        const worksheet = XLSX.utils.json_to_sheet(flattenedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory")
        data = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        break

      case "pdf":
        // For PDF, we'll use the xlsx format but change the extension and content type
        // This is a workaround since PDF generation is problematic in server components
        const pdfWorksheet = XLSX.utils.json_to_sheet(flattenedData)
        const pdfWorkbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(pdfWorkbook, pdfWorksheet, "Inventory")
        data = XLSX.write(pdfWorkbook, { type: "buffer", bookType: "xlsx" })
        contentType = "application/pdf"
        break

      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }

    // Return the data
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename=inventory.${format}`,
      },
    })
  } catch (error) {
    console.error("Error exporting inventory:", error)
    return NextResponse.json({ error: "Failed to export inventory" }, { status: 500 })
  }
}

