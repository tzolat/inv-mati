import { DashboardCards } from "@/components/dashboard-cards"
import { RecentSales } from "@/components/recent-sales"
import { InventoryOverview } from "@/components/inventory-overview"
import { StockAlerts } from "@/components/stock-alerts"

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryOverview />
        <StockAlerts />
      </div>
      <RecentSales />
    </div>
  )
}

