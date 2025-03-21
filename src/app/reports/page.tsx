import { Suspense } from "react"
import { ReportsFilters } from "@/components/reports-filters"
import { ReportsSummary } from "@/components/reports-summary"
import { SalesChart } from "@/components/sales-chart"
import { ProfitChart } from "@/components/profit-chart"
import { TopProducts } from "@/components/top-products"
import { ReportsSkeleton } from "@/components/skeletons/reports-skeleton"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      <ReportsFilters />
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsSummary />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SalesChart />
          <ProfitChart />
        </div>
        <TopProducts />
      </Suspense>
    </div>
  )
}

