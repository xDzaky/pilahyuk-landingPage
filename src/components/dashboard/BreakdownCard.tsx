// src/components/dashboard/BreakdownCard.tsx
// Compact composition card: a stacked bar + legend + optional status footer.
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
  /** stack = vertical card (sidebar), inline = one-row strip (full width) */
  layout?: "stack" | "inline"
  className?: string
}

function Bar({ visible, total }: { visible: BreakdownSegment[]; total: number }) {
  return (
    <div
      className="flex h-2 w-full gap-[2px] overflow-hidden rounded-full bg-[#F1F5F1]"
      role="img"
      aria-label={visible.map((s) => `${s.label} ${s.value}`).join(", ")}
    >
      {visible.map((s) => (
        <div
          key={s.label}
          className={s.colorClass}
          style={{ width: `${(s.value / total) * 100}%` }}
        />
      ))}
    </div>
  )
}

function Legend({ visible }: { visible: BreakdownSegment[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {visible.map((s) => (
        <li key={s.label} className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.colorClass)} />
          <span className="text-xs text-[#66736D]">{s.label}</span>
          <span className="text-xs font-semibold tabular-nums text-[#1E2925]">{s.value}</span>
        </li>
      ))}
    </ul>
  )
}

export function BreakdownCard({
  title,
  segments,
  unit = "total",
  footer,
  layout = "stack",
  className,
}: BreakdownCardProps) {
  const visible = segments.filter((s) => s.value > 0)
  const total = visible.reduce((sum, s) => sum + s.value, 0)

  if (layout === "inline") {
    return (
      <section
        className={cn(
          "bg-white border border-[#E1E8E3] rounded-[16px] px-4 py-3 sm:px-5",
          className
        )}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex shrink-0 items-baseline gap-2">
            <h2 className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-[#66736D]">
              {title}
            </h2>
            <span className="whitespace-nowrap text-xs tabular-nums text-[#66736D]">
              {total} {unit}
            </span>
          </div>
          {footer && <div className="shrink-0">{footer}</div>}
        </div>

        {total > 0 ? (
          <div className="mt-3">
            <Bar visible={visible} total={total} />
            <div className="mt-2">
              <Legend visible={visible} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#66736D]">Belum ada data.</p>
        )}
      </section>
    )
  }

  return (
    <section className={cn("bg-white border border-[#E1E8E3] rounded-[16px] p-4 sm:p-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[#66736D]">{title}</h2>
        <span className="whitespace-nowrap text-xs tabular-nums text-[#66736D]">
          {total} {unit}
        </span>
      </div>

      {total > 0 ? (
        <>
          <div className="mt-4">
            <Bar visible={visible} total={total} />
          </div>
          <div className="mt-4">
            <Legend visible={visible} />
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-[#66736D]">Belum ada data.</p>
      )}

      {footer && <div className="mt-4 border-t border-[#E1E8E3] pt-3">{footer}</div>}
    </section>
  )
}
