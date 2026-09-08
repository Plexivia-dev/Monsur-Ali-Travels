import React, { useEffect, useState } from "react"
import { Globe } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts"

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

export const description = "Top Case Destinations & Programs"

const chartConfig = {
  count: {
    label: "Files",
    color: "#2563eb",
  },
}

export function ChartBarActive() {
  const [chartData, setChartData] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const res = await apiClient.get("/api/v1/admin/dashboard/charts")
        if (isMounted && res.data?.data?.destinationDistribution) {
          const formatted = res.data.data.destinationDistribution.map((item) => ({
            destination: item.destination,
            count: item.count,
            fill: "#2563eb",
          }))
          setChartData(formatted)
        }
      } catch (err) {
        console.error("Failed to load destination distribution", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const totalCases = chartData.reduce((acc, curr) => acc + (curr.count || 0), 0)

  return (
    <Card className="bg-white border border-black/10 shadow-sm flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-black">Top Destinations & Types</CardTitle>
          <CardDescription className="text-xs text-black/60">Distribution of files by destination country</CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseMove={(state) => {
                if (state?.activeTooltipIndex !== undefined) {
                  setActiveIndex(state.activeTooltipIndex)
                }
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="destination"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => (value.length > 8 ? `${value.slice(0, 7)}…` : value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="count"
                strokeWidth={2}
                radius={6}
                fill="#2563eb"
                shape={({ index, ...props }) =>
                  index === activeIndex ? (
                    <Rectangle
                      {...props}
                      fillOpacity={0.9}
                      stroke="#1d4ed8"
                      strokeWidth={2}
                    />
                  ) : (
                    <Rectangle {...props} fillOpacity={0.7} />
                  )
                }
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </div>
      <CardFooter className="pt-3 border-t border-black/5 mt-4">
        <div className="flex w-full items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-blue-700">
            <Globe className="h-4 w-4" />
            <span>Total: {loading ? '-' : totalCases.toLocaleString()} Files</span>
          </div>
          <div className="text-black/50 font-medium">
            Active Programs
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartBarActive

