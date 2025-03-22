import { Suspense } from "react"
import { SalesTable } from "@/components/sales-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Sales</h1>
        <Link href="/sales/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Sale
          </Button>
        </Link>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <SalesTable />
      </Suspense>
    </div>
  )
}

