import { Suspense } from "react"
import { InventoryTable } from "@/components/inventory-table"
import { InventoryFilters } from "@/components/inventory-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { InventoryTableSkeleton } from "@/components/skeletons/inventory-table-skeleton"

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <Link href="/inventory/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      <InventoryFilters />
      <Suspense fallback={<InventoryTableSkeleton />}>
        <InventoryTable />
      </Suspense>
    </div>
  )
}

