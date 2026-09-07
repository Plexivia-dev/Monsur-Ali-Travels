import * as React from 'react'
import SalesMetricsCard from '@/components/blocks/chart-sales-metrics'
import ChartLineInteractive from '@/components/ChartLineInteractive'
import ChartAreaAxes from '@/components/ChartAreaAxes'
import ChartBarActive from '@/components/ChartBarActive'
import ChartPieInteractive from '@/components/ChartPieInteractive'

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Top Section: Interactive Line Chart */}
      <div className="w-full">
        <ChartLineInteractive />
      </div>

      {/* Middle Section: Sales Metrics, Latest Updates & Live Logs */}
      <div className="w-full">
        <SalesMetricsCard />
      </div>

      {/* Bottom Section: Analytical Charts Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <ChartAreaAxes />
        <ChartBarActive />
        <ChartPieInteractive />
      </div>
    </div>
  )
}
