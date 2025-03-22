import { Suspense } from "react"
import { ProductDetails } from "@/components/product-details"
import { ProductDetailsSkeleton } from "@/components/skeletons/product-details-skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProductPage({ params }:any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Product Details</h1>
      </div>
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails id={params.id} />
      </Suspense>
    </div>
  )
}

