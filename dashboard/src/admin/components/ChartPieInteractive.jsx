import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"

export const description = "Lifecycle Stages Distribution"

const STAGE_META = {
  INTAKE: { label: "Intake / New", color: "#3b82f6" },
  ENTRY: { label: "Data Entry", color: "#60a5fa" },
  PROCESSING: { label: "Processing", color: "#f59e0b" },
  UNDER_PROCESS: { label: "Under Process", color: "#d97706" },
  OFFER_LETTER: { label: "Offer Approved", color: "#8b5cf6" },
  APPROVED_OFFER_LETTER: { label: "Offer Approved", color: "#8b5cf6" },
  SUBMITTED_EMBASSY_BSF: { label: "Submitted", color: "#6366f1" },
  COMPLETED_DELIVERED: { label: "Delivered", color: "#10b981" },
  COMPLETED: { label: "Completed", color: "#059669" },
  REJECTED: { label: "Rejected", color: "#ef4444" },
  ON_HOLD: { label: "On Hold", color: "#9ca3af" },
}

export function ChartPieInteractive() {
  const id = "pie-stages"
  const [stagesData, setStagesData] = React.useState([])
  const [activeStage, setActiveStage] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const res = await apiClient.get("/api/v1/admin/dashboard/charts")
        if (isMounted && res.data?.data?.stageDistribution) {
          const formatted = res.data.data.stageDistribution.map((item, idx) => {
            const meta = STAGE_META[item.stage] || {
              label: item.stage,
              color: `hsl(${(idx * 65) % 360}, 70%, 50%)`,
            }
            return {
              stageKey: item.stage,
              label: meta.label,
              count: item.count,
              fill: meta.color,
            }
          })
          setStagesData(formatted)
          if (formatted.length > 0) {
            setActiveStage(formatted[0].stageKey)
          }
        }
      } catch (err) {
        console.error("Failed to load stage distribution", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const activeIndex = React.useMemo(
    () => stagesData.findIndex((item) => item.stageKey === activeStage),
    [activeStage, stagesData]
  )

  const chartConfig = React.useMemo(() => {
    const config = {
      count: { label: "Files" },
    }
    stagesData.forEach((s) => {
      config[s.stageKey] = {
        label: s.label,
        color: s.fill,
      }
    })
    return config
  }, [stagesData])

  const renderPieShape = React.useCallback(
    ({ index, outerRadius = 0, ...props }) => {
      if (index === activeIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 8} />
            <Sector
              {...props}
              outerRadius={outerRadius + 18}
              innerRadius={outerRadius + 10}
            />
          </g>
        )
      }

      return <Sector {...props} outerRadius={outerRadius} />
    },
    [activeIndex]
  )

  const activeItem = stagesData[activeIndex] || stagesData[0] || { count: 0, label: "Files" }

  return (
    <Card data-chart={id} className="flex flex-col bg-white border border-black/10 shadow-sm">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-base font-semibold text-black">Stage Breakdown</CardTitle>
          <CardDescription className="text-xs text-black/60">Live workflow lifecycle stages</CardDescription>
        </div>
        {stagesData.length > 0 && (
          <Select value={activeStage} onValueChange={setActiveStage}>
            <SelectTrigger
              className="ml-auto h-7 w-[140px] rounded-lg pl-2.5 text-xs bg-black/[0.02] border-black/10"
              aria-label="Select a stage"
            >
              <SelectValue placeholder="Select stage" value={chartConfig[activeStage]?.label || activeStage} />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {stagesData.map((item) => (
                <SelectItem
                  key={item.stageKey}
                  value={item.stageKey}
                  className="rounded-lg [&_span]:flex text-xs"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: item.fill,
                      }}
                    />
                    {item.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-3">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[240px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={stagesData}
              dataKey="count"
              nameKey="label"
              innerRadius={55}
              strokeWidth={3}
              shape={renderPieShape}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {loading ? "-" : activeItem.count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          {activeItem.label.length > 14 ? `${activeItem.label.slice(0, 12)}…` : activeItem.label}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartPieInteractive

