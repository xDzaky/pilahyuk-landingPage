// src/components/dashboard/MetricList.tsx
"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface MetricItem {
  label: string
  value: string | number
  pct?: number
  trend?: "up" | "down" | "flat"
  highlight?: boolean
}

interface MetricListProps {
  title?: string
  items: MetricItem[]
  className?: string
}

export function MetricList({ title, items, className }: MetricListProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {title && (
        <div className="text-xs font-semibold uppercase tracking-wide text-[#55615B] mb-3">
          {title}
        </div>
      )}
      {items.map((item, i) => {
        const TrendIcon = item.trend === "up" ? TrendingUp
          : item.trend === "down" ? TrendingDown
          : item.trend === "flat" ? Minus
          : null
        return (
          <div
            key={i}
            className={cn(
              "flex items-center justify-between py-2.5",
              i < items.length - 1 && "border-b border-[#D2DCD5]"
            )}
          >
            <span className={cn(
              "text-sm",
              item.highlight ? "font-semibold text-[#1E2925]" : "text-[#55615B]"
            )}>
              {item.label}
            </span>
            <div className="flex items-center gap-2">
              {TrendIcon && (
                <TrendIcon className={cn(
                  "w-3.5 h-3.5",
                  item.trend === "up" && "text-[#246B56]",
                  item.trend === "down" && "text-[#B54747]",
                  item.trend === "flat" && "text-[#55615B]",
                )} />
              )}
              <span className={cn(
                "text-sm font-bold tabular-nums",
                item.highlight ? "text-[#173F35]" : "text-[#1E2925]"
              )}>
                {typeof item.value === "number" ? item.value.toLocaleString("id-ID") : item.value}
              </span>
              {item.pct !== undefined && (
                <span className="text-[11px] text-[#55615B] min-w-[2.5rem] text-right">
                  {item.pct}%
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
