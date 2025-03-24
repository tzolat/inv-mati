"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

interface ExportButtonProps {
  endpoint: string
  filename: string
  params?: Record<string, string>
}

export function ExportButton({ endpoint, filename, params = {} }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  const handleExport = async (format: string) => {
    try {
      setExportFormat(format)
      setIsExporting(true)

      // Build query params
      const queryParams = new URLSearchParams(params)
      queryParams.set("format", format)

      if (format === "pdf") {
        // For PDF, open in a new window/tab
        window.open(`${endpoint}?${queryParams.toString()}`, "_blank")

        toast({
          title: "Export Initiated",
          description: `PDF report opened in a new tab. Save it from your browser.`,
        })
      } else {
        // For other formats, download as before
        const response = await axios.get(`${endpoint}?${queryParams.toString()}`, {
          responseType: "blob",
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `${filename}.${format}`)
        document.body.appendChild(link)
        link.click()

        // Clean up
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: "Export Successful",
          description: `Data exported as ${format.toUpperCase()} successfully.`,
        })
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error)
      toast({
        title: "Export Failed",
        description: `Failed to export data as ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isExporting}>
          {isExporting && exportFormat === "csv" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")} disabled={isExporting}>
          {isExporting && exportFormat === "xlsx" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export as Excel
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={isExporting}>
          {isExporting && exportFormat === "pdf" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export as PDF
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

