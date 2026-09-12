import React, { useEffect, useState } from "react"
import { TrendingUp, DollarSign } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { apiClient } from "@/lib/api-client"

export const description = "Monthly Financial Cashflow - Collections vs Bills"

const chartConfig = {
  collections: {
    label: "Received (Collections)",
    color: "#16a34a",
  },
  bills: {
    label: "Expenses (Bills)",
    color: "#dc2626",
  },
}

export function ChartAreaAxes() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const res = await apiClient.get("/api/v1/admin/dashboard/charts")
        if (isMounted && res.data?.data?.financialTrend) {
          setChartData(res.data.data.financialTrend)
        }
      } catch (err) {
        console.error("Failed to load financial trend data", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const totalCollections = chartData.reduce((acc, curr) => acc + (curr.collections || 0), 0)
  const totalBills = chartData.reduce((acc, curr) => acc + (curr.bills || 0), 0)

  return (
    <Card className="bg-white border border-black/10 shadow-sm flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-black">Financial Flow (6 Months)</CardTitle>
          <CardDescription className="text-xs text-black/60">
            Monthly comparison of client collections vs office bills
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: -15,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickCount={3}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="bills"
                type="monotone"
                fill="#dc2626"
                fillOpacity={0.15}
                stroke="#dc2626"
                strokeWidth={2}
                stackId="b"
              />
              <Area
                dataKey="collections"
                type="monotone"
                fill="#16a34a"
                fillOpacity={0.25}
                stroke="#16a34a"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </div>
      <CardFooter className="pt-3 border-t border-black/5 mt-4">
        <div className="flex w-full items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            <span>Col: {loading ? '-' : totalCollections.toLocaleString()} BDT</span>
          </div>
          <div className="text-black/50 font-medium">
            Bills: {loading ? '-' : totalBills.toLocaleString()} BDT
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartAreaAxes

