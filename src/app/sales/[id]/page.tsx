import { Suspense } from "react"
import { SaleDetails } from "@/components/sale-details"
import { SaleDetailsSkeleton } from "@/components/skeletons/sale-details-skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SaleDetailsPage({ params }:any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/sales">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Sale Details</h1>
      </div>
      <Suspense fallback={<SaleDetailsSkeleton />}>
        <SaleDetails id={params.id} />
      </Suspense>
    </div>
  )
}

