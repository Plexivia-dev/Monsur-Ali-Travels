import * as React from "react"
import { ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

export const ChartContainer = React.forwardRef(
  ({ id, config = {}, className, children, ...props }, ref) => {
    const autoId = React.useId()
    const chartId = id || `chart-${autoId.replace(/:/g, "")}`
    return (
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/40",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

export const ChartStyle = ({ id, config = {} }) => {
  const styles = React.useMemo(() => {
    return Object.entries(config)
      .map(([key, value]) => {
        if (value && value.color) {
          return `[data-chart="${id}"] { --color-${key}: ${value.color}; }`
        }
        return null
      })
      .filter(Boolean)
      .join("\n")
  }, [id, config])

  return <style dangerouslySetInnerHTML={{ __html: styles }} />
}

export const ChartTooltip = ({ active, payload, label, content, ...props }) => {
  if (content) {
    return React.cloneElement(content, { active, payload, label, ...props })
  }
  return null
}

export const ChartTooltipContent = ({
  active,
  payload,
  label,
  labelFormatter,
  hideLabel,
  className,
  nameKey,
}) => {
  if (!active || !payload || !payload.length) return null

  const formattedLabel = labelFormatter ? labelFormatter(label, payload) : label

  return (
    <div className={cn("rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md text-xs", className)}>
      {!hideLabel && formattedLabel && (
        <div className="font-semibold mb-1.5">{formattedLabel}</div>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((item, index) => {
          const color = item.payload?.fill || item.color || item.fill
          const name = item.name || item.dataKey || (nameKey ? item.payload?.[nameKey] : 'Value')
          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground capitalize">{name}:</span>
              </div>
              <span className="font-bold font-mono">{item.value?.toLocaleString?.() ?? item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
