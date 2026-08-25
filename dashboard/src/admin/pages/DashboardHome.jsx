import * as React from 'react'
import SalesMetricsCard from '@/components/blocks/chart-sales-metrics'

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <SalesMetricsCard />
        </div>
      </div>
    </div>
  )
}
