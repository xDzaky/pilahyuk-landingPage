// src/components/dashboard/KpiCard.tsx
"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, LucideIcon, ArrowRight } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: {
    value: number
    direction: "up" | "down" | "flat"
    period: string
    isPositiveGood?: boolean
  }
  icon?: LucideIcon
  source?: string
  updatedAt?: string
  emphasis?: boolean
  dark?: boolean
  className?: string
  footer?: React.ReactNode
  href?: string
  onClick?: () => void
}

export function KpiCard({
  label,
  value,
  unit,
  trend,
  icon: Icon,
  source,
  updatedAt,
  emphasis = false,
  dark = false,
  className,
  footer,
  href,
  onClick,
}: KpiCardProps) {
  const TrendIcon = !trend ? null
    : trend.direction === "up" ? TrendingUp
    : trend.direction === "down" ? TrendingDown
    : Minus

  const trendPositive = trend
    ? trend.isPositiveGood !== false
      ? trend.direction === "up"
      : trend.direction === "down"
    : null

  const isClickable = !!(href || onClick)

  const content = (
    <div
      className={cn(
        "relative rounded-[16px] p-5 border group",
        dark
          ? "bg-[#173F35] border-transparent text-white brand-motif"
          : "bg-white border-[#E1E8E3]",
        emphasis && !dark && "border-l-[3px] border-l-[#173F35] ring-1 ring-[#E1E8E3]",
        isClickable && "cursor-pointer transition-transform card-hover",
        className
      )}
      onClick={onClick}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          dark ? "text-[#DDF3EC]/70" : "text-[#66736D]"
        )}>
          {label}
        </div>
        {Icon && (
          <div className={cn(
            "p-1.5 rounded-xl",
            dark ? "bg-white/10" : "bg-[#F6F8F5]"
          )}>
            <Icon className={cn(
              "w-4 h-4",
              dark ? "text-[#DDF3EC]" : "text-[#3D9274]"
            )} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={cn(
          "font-black leading-none",
          emphasis ? "text-3xl" : "text-2xl",
          dark ? "text-white" : "text-[#1E2925]"
        )}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </span>
        {unit && (
          <span className={cn(
            "text-sm font-medium",
            dark ? "text-[#DDF3EC]/80" : "text-[#66736D]"
          )}>
            {unit}
          </span>
        )}
      </div>

      {/* Trend row */}
      {trend && TrendIcon && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium mb-1",
          trendPositive === true && (dark ? "text-[#DDF3EC]" : "text-[#246B56]"),
          trendPositive === false && "text-[#B54747]",
          trendPositive === null && (dark ? "text-[#DDF3EC]/60" : "text-[#66736D]"),
        )}>
          <TrendIcon className="w-3 h-3" />
          <span>{trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}{trend.value}%</span>
          <span className={cn("font-normal", dark ? "text-[#DDF3EC]/50" : "text-[#66736D]")}>{trend.period}</span>
        </div>
      )}

      {/* Source / updated */}
      {(source || updatedAt) && (
        <div className={cn(
          "text-[11px] mt-auto",
          dark ? "text-[#DDF3EC]/40" : "text-[#66736D]/60"
        )}>
          {source}{updatedAt && ` · diperbarui ${updatedAt}`}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="mt-2 pt-2 border-t border-current/10">
          {footer}
        </div>
      )}

      {/* Navigate arrow */}
      {isClickable && (
        <ArrowRight className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity",
          dark ? "text-white" : "text-[#1E2925]"
        )} />
      )}
    </div>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}
