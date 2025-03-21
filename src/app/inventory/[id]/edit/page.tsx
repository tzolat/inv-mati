import { Suspense } from "react"
import { EditProductForm } from "@/components/edit-product-form"
import { EditProductFormSkeleton } from "@/components/skeletons/edit-product-form-skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditProductPage({ params }:any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/inventory/${params.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>
      <Suspense fallback={<EditProductFormSkeleton />}>
        <EditProductForm id={params.id} />
      </Suspense>
    </div>
  )
}

