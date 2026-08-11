'use client'

import React, { createContext, useContext, type HTMLAttributes } from 'react'
import { Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

type ChartConfig = Record<string, { label: string; color?: string }>

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = createContext<ChartContextValue | null>(null)

function useChart() {
  const ctx = useContext(ChartContext)
  if (!ctx) throw new Error('Chart components must be used within a ChartContainer')
  return ctx
}

interface ChartContainerProps extends HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

function ChartContainer({ config, children, className, style, ...props }: ChartContainerProps) {
  const cssVars = Object.fromEntries(
    Object.entries(config).map(([key, val]) => [`--color-${key}`, val.color]),
  ) as React.CSSProperties

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          'flex justify-center text-xs [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
          className,
        )}
        style={{ ...cssVars, ...style }}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: { name?: string; value?: number; dataKey?: string; payload?: Record<string, unknown>; color?: string }[]
  label?: string
}

function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  const { config } = useChart()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {label && <p className="mb-1 text-xs text-muted-foreground">{label}</p>}
      {payload.map((entry, i) => {
        const key = entry.dataKey || entry.name || ''
        const cfg = config[key] || { label: key }
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color || cfg.color }} />
            <span className="text-foreground">{cfg.label}:</span>
            <span className="font-medium text-foreground">{entry.value?.toLocaleString()}</span>
          </div>
        )
      })}
    </div>
  )
}

function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip {...props} />
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig }
