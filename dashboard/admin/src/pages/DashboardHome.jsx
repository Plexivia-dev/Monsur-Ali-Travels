import * as React from 'react'
import SalesMetricsCard from '@/components/blocks/chart-sales-metrics'
import { ChartPieInteractive } from '@/components/ChartPieInteractive'
import { ChartBarMultiple } from '@/components/ChartBarMultiple'
import { ChartLineDots } from '@/components/ChartLineDots'

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome back to the Monsur Ali Travels secure administration portal.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <SalesMetricsCard />
        </div>
        <div className="lg:col-span-2">
          <ChartBarMultiple />
        </div>
        <div>
          <ChartPieInteractive />
        </div>
        <div className="lg:col-span-3">
          <ChartLineDots />
        </div>
      </div>
    </div>
  )
}
