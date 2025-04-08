'use client'
import { Suspense, useEffect } from "react"

import { ReportsSummary } from "@/components/reports-summary"
import { SalesChart } from "@/components/sales-chart"
import { ProfitChart } from "@/components/profit-chart"
import { TopProducts } from "@/components/top-products"
import { ProductProfitAnalysis } from "@/components/product-profit-analysis"
import { ReportsSkeleton } from "@/components/skeletons/reports-skeleton"
import { ReportsFilters } from "@/components/reports-filters"
import { checkRole } from '@/utils/roles';
import { redirect } from 'next/navigation';
import React from 'react';
import { useUser } from "@clerk/nextjs"

export default  function ReportsPage() {
  const { user } = useUser()
   if(user?.publicMetadata.role !== 'admin') {
    redirect('/inventory')

   }
  return (
    <div className="flex flex-col gap-6 pb-8">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Suspense fallback={<ReportsSkeleton />}>
        <ReportsFilters />
    
        <ReportsSummary />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SalesChart />
          <ProfitChart />
        </div>
        <TopProducts />
        <ProductProfitAnalysis />
      </Suspense>
    </div>
  )
}

