// src/components/dashboard/BreakdownCard.tsx
// Compact composition card: one stacked bar + legend + optional status footer.
// Used where a full metric list would leave a lot of dead vertical space.
"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface BreakdownSegment {
  label: string
  value: number
  /** Tailwind background class, e.g. "bg-[#173F35]" */
  colorClass: string
}

interface BreakdownCardProps {
  title: string
  segments: BreakdownSegment[]
  /** Small text next to the title, e.g. "organisasi" */
  unit?: string
  footer?: ReactNode
  className?: string
}

export function BreakdownCard({
  title,
  segments,
  unit = "total",
  footer,
  className,
}: BreakdownCardProps) {
  const visible = segments.filter((s) => s.value > 0)
  const total = visible.reduce((sum, s) => sum + s.value, 0)
  const summary = visible.map((s) => `${s.label} ${s.value}`).join(", ")

  return (
    <section className={cn("bg-white border border-[#E1E8E3] rounded-[16px] p-4 sm:p-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[#66736D]">{title}</h2>
        <span className="text-xs text-[#66736D] tabular-nums whitespace-nowrap">
          {total} {unit}
        </span>
      </div>

      {total > 0 ? (
        <>
          <div
            className="mt-4 flex h-2 w-full gap-[2px] overflow-hidden rounded-full bg-[#F1F5F1]"
            role="img"
            aria-label={`${title}: ${summary}`}
          >
            {visible.map((s) => (
              <div
                key={s.label}
                className={s.colorClass}
                style={{ width: `${(s.value / total) * 100}%` }}
              />
            ))}
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {visible.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.colorClass)} />
                  <span className="text-xs text-[#66736D] truncate">{s.label}</span>
                </span>
                <span className="text-xs font-semibold text-[#1E2925] tabular-nums">{s.value}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 text-sm text-[#66736D]">Belum ada data.</p>
      )}

      {footer && <div className="mt-4 border-t border-[#E1E8E3] pt-3">{footer}</div>}
    </section>
  )
}
