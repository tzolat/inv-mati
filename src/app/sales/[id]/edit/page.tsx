import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { EditSaleFormSkeleton } from "@/components/skeletons/edit-sale-form-skeleton"
import { EditSaleForm } from "@/components/edit-sale-form"

export default function EditSalePage({ params }:any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/sales/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Sale</h1>
      </div>
      <Suspense fallback={<EditSaleFormSkeleton />}>
        <EditSaleForm id={params.id} />
      </Suspense>
    </div>
  )
}

