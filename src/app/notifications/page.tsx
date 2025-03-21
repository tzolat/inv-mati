import { Suspense } from "react"
import { NotificationsList } from "@/components/notifications-list"
import { NotificationsFilters } from "@/components/notifications-filters"
import { NotificationsListSkeleton } from "@/components/skeletons/notifications-list-skeleton"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <NotificationsFilters />
      <Suspense fallback={<NotificationsListSkeleton />}>
        <NotificationsList />
      </Suspense>
    </div>
  )
}

