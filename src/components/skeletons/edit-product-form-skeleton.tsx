import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function EditProductFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        <div className="space-y-2 md:col-span-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <Separator />

      <div>
        <Skeleton className="h-6 w-[200px] mb-4" />
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

