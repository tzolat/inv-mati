"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Package, Percent, AlertTriangle } from "lucide-react"
import axios from "axios"

interface BatchOperationsProps {
  selectedItems: string[]
  onComplete: () => void
}

export function BatchOperations({ selectedItems, onComplete }: BatchOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [operation, setOperation] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [percentageChange, setPercentageChange] = useState(10)
  const [stockQuantity, setStockQuantity] = useState(10)

  const handleOperation = async () => {
    if (!operation || selectedItems.length === 0) return

    try {
      setIsProcessing(true)

      let endpoint = ""
      const payload: any = { productIds: selectedItems }

      switch (operation) {
        case "increase-price":
          endpoint = "/api/batch/increase-price"
          payload.percentage = percentageChange
          break

        case "decrease-price":
          endpoint = "/api/batch/decrease-price"
          payload.percentage = percentageChange
          break

        case "add-stock":
          endpoint = "/api/batch/add-stock"
          payload.quantity = stockQuantity
          break

        case "mark-out-of-stock":
          endpoint = "/api/batch/mark-out-of-stock"
          break

        default:
          throw new Error("Invalid operation")
      }

      await axios.post(endpoint, payload)

      toast({
        title: "Batch Operation Successful",
        description: `Successfully processed ${selectedItems.length} items.`,
      })

      setDialogOpen(false)
      onComplete()
    } catch (error) {
      console.error(`Error performing batch operation:`, error)
      toast({
        title: "Operation Failed",
        description: "Failed to process the selected items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openDialog = (op: string) => {
    setOperation(op)
    setDialogOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={selectedItems.length === 0}>
            <Package className="mr-2 h-4 w-4" />
            Batch Operations ({selectedItems.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => openDialog("increase-price")}>
            <Percent className="mr-2 h-4 w-4 text-green-500" />
            Increase Price
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("decrease-price")}>
            <Percent className="mr-2 h-4 w-4 text-red-500" />
            Decrease Price
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("add-stock")}>
            <Package className="mr-2 h-4 w-4 text-blue-500" />
            Add Stock
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDialog("mark-out-of-stock")}>
            <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
            Mark as Out of Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {operation === "increase-price" && "Increase Price"}
              {operation === "decrease-price" && "Decrease Price"}
              {operation === "add-stock" && "Add Stock"}
              {operation === "mark-out-of-stock" && "Mark as Out of Stock"}
            </DialogTitle>
            <DialogDescription>This operation will affect {selectedItems.length} selected items.</DialogDescription>
          </DialogHeader>

          {(operation === "increase-price" || operation === "decrease-price") && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="percentage">Percentage Change</Label>
                <div className="flex items-center">
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={percentageChange}
                    onChange={(e) => setPercentageChange(Number.parseInt(e.target.value) || 10)}
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will {operation === "increase-price" ? "increase" : "decrease"} the selling price of all selected
                  items by {percentageChange}%.
                </p>
              </div>
            </div>
          )}

          {operation === "add-stock" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity to Add</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number.parseInt(e.target.value) || 10)}
                />
                <p className="text-sm text-muted-foreground">
                  This will add {stockQuantity} units to the stock of all selected items.
                </p>
              </div>
            </div>
          )}

          {operation === "mark-out-of-stock" && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This will set the stock of all selected items to 0, marking them as out of stock.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOperation} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

