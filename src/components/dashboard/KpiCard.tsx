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
  const metaText = [source, updatedAt && `diperbarui ${updatedAt}`].filter(Boolean).join(" · ")

  const content = (
    <div
      className={cn(
        // rigid vertical rhythm so every KPI card in a row lines up
        "relative flex h-full flex-col rounded-[16px] p-5 border group",
        dark
          ? "bg-[#173F35] border-transparent text-white brand-motif"
          : "bg-white border-[#E1E8E3]",
        emphasis && !dark && "border-l-[3px] border-l-[#173F35] ring-1 ring-[#E1E8E3]",
        isClickable && "cursor-pointer transition-transform card-hover",
        className
      )}
      onClick={onClick}
    >
      {/* Label row — fixed two-line height */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "min-h-[32px] text-xs font-semibold uppercase leading-snug tracking-wide",
            dark ? "text-[#DDF3EC]/70" : "text-[#66736D]"
          )}
        >
          {label}
        </div>
        {Icon && (
          <div
            className={cn(
              "shrink-0 rounded-xl p-1.5",
              dark ? "bg-white/10" : "bg-[#F6F8F5]"
            )}
          >
            <Icon
              className={cn("h-4 w-4", dark ? "text-[#DDF3EC]" : "text-[#3D9274]")}
            />
          </div>
        )}
      </div>

      {/* Value — fixed line height across all cards */}
      <div className="mt-3 flex h-9 items-baseline gap-1.5">
        <span
          className={cn(
            "text-3xl font-black leading-none",
            dark ? "text-white" : "text-[#1E2925]"
          )}
        >
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </span>
        {unit && (
          <span
            className={cn(
              "text-sm font-medium",
              dark ? "text-[#DDF3EC]/80" : "text-[#66736D]"
            )}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Trend — slot always reserved so cards without a trend stay aligned */}
      <div
        className={cn(
          "mt-2 flex min-h-[16px] items-center gap-1 text-xs font-medium",
          trendPositive === true && (dark ? "text-[#DDF3EC]" : "text-[#246B56]"),
          trendPositive === false && "text-[#B54747]",
          trendPositive === null && (dark ? "text-[#DDF3EC]/60" : "text-[#66736D]")
        )}
      >
        {trend && TrendIcon && (
          <>
            <TrendIcon className="h-3 w-3" />
            <span>
              {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
              {trend.value}%
            </span>
            <span
              className={cn("font-normal", dark ? "text-[#DDF3EC]/50" : "text-[#66736D]")}
            >
              {trend.period}
            </span>
          </>
        )}
      </div>

      {/* Source / updated — single line, full text on hover */}
      {metaText && (
        <div
          title={metaText}
          className={cn(
            "mt-2 truncate text-[11px] leading-snug",
            dark ? "text-[#DDF3EC]/40" : "text-[#66736D]/60"
          )}
        >
          {metaText}
        </div>
      )}

      {/* Footer — height is reserved even when empty */}
      <div
        className={cn(
          "mt-auto pt-3",
          footer && "border-t border-current/10",
          !metaText && "min-h-[16px]"
        )}
      >
        {footer ?? <div className="h-[16px]" aria-hidden />}
      </div>

      {/* Navigate arrow */}
      {isClickable && (
        <ArrowRight
          className={cn(
            "absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-40",
            dark ? "text-white" : "text-[#1E2925]"
          )}
        />
      )}
    </div>
  )

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>
  }
  return content
}
