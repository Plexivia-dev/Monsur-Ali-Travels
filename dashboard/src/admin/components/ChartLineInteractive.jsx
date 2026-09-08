import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { apiClient } from "@/lib/api-client"

export const description = "An interactive case activity chart"

const chartConfig = {
  cases: {
    label: "Case Files",
    color: "#2563eb",
  },
  receipts: {
    label: "Receipts Issued",
    color: "#16a34a",
  },
}

export function ChartLineInteractive() {
  const [activeChart, setActiveChart] = React.useState("cases")
  const [timelineData, setTimelineData] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    async function fetchTimeline() {
      try {
        const res = await apiClient.get("/api/v1/admin/dashboard/orders/daily?days=30")
        if (isMounted && res.data?.data) {
          setTimelineData(res.data.data)
        }
      } catch (err) {
        console.error("Failed to load timeline data", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchTimeline()
    return () => {
      isMounted = false
    }
  }, [])

  const total = React.useMemo(
    () => ({
      cases: timelineData.reduce((acc, curr) => acc + (curr.cases ?? curr.count ?? 0), 0),
      receipts: timelineData.reduce((acc, curr) => acc + (curr.receipts ?? 0), 0),
    }),
    [timelineData]
  )

  return (
    <Card className="py-4 sm:py-0 bg-white border border-black/10 shadow-sm">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle className="text-base font-semibold text-black">Case Activity & Submissions</CardTitle>
          <CardDescription className="text-xs text-black/60">
            Daily breakdown of Case Files initiated and Money Receipts generated (Last 30 Days)
          </CardDescription>
        </div>
        <div className="flex">
          {["cases", "receipts"].map((key) => {
            const chart = key
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-black/[0.03] sm:border-t-0 sm:border-l sm:px-8 sm:py-6 cursor-pointer transition-colors"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-black/60 font-medium">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl text-black">
                  {isLoading ? "-" : total[key].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={timelineData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value) => {
                if (!value) return ""
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    if (!value) return ""
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart].color}
              strokeWidth={2.5}
              dot={{ r: 2, fill: chartConfig[activeChart].color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartLineInteractive

