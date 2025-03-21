import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function NotificationsListSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-start gap-2 p-3 border-b">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

