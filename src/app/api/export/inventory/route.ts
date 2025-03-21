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
        // Create a simple HTML table for PDF
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8" />
            <title>Inventory Report</title>
            <style>
              body { font-family: sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1, h2 { text-align: center; }
              .date { text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>Inventory Report</h1>
            <p class="date">Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
        `

        // Add rows to the table
        flattenedData.forEach((item) => {
          htmlContent += `
            <tr>
              <td>${item.productName}</td>
              <td>${item.variantName}</td>
              <td>${item.sku}</td>
              <td>${item.productCategory}</td>
              <td>${item.productBrand}</td>
              <td>${item.currentStock}</td>
              <td>$${item.sellingPrice.toFixed(2)}</td>
              <td>${item.stockStatus}</td>
            </tr>
          `
        })

        // Close the HTML
        htmlContent += `
              </tbody>
            </table>
          </body>
          </html>
        `

        // Return HTML content with PDF content type
        // The browser will render this as a PDF when downloading
        data = htmlContent
        contentType = "text/html"
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

