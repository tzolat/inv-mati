import { DashboardCards } from "@/components/dashboard-cards"
import { RecentSales } from "@/components/recent-sales"
import { InventoryOverview } from "@/components/inventory-overview"
import { StockAlerts } from "@/components/stock-alerts"
import Link from "next/link"
import { Package, PackagePlus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkRole } from '@/utils/roles';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function Home() {
const isAdmin = await checkRole('admin')
if (!isAdmin) {
  redirect('/inventory')
}
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start md:items-center  justify-between">
         <h1 className="text-3xl font-bold">Dashboard</h1>
         <div className="hidden md:flex items-center gap-4">
         <Link href="/inventory/add">
          <Button>
            <PackagePlus className="mr-2 h-5 w-5" />
            Add Product
          </Button>
        </Link>          
         <Link href="/sales/add">
          <Button>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Record Sale
          </Button>
        </Link>          
         </div>
      </div>
     
      <DashboardCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryOverview />
        <StockAlerts />
      </div>
      <RecentSales />
    </div>
  )
}

