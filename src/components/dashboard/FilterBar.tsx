// src/components/dashboard/FilterBar.tsx
"use client"

import { cn } from "@/lib/utils"
import { Filter, ArrowUpDown, BarChart3 } from "lucide-react"

interface FilterBarProps {
  viewOptions?: string[]
  activeView?: string
  onViewChange?: (v: string) => void
  onFilter?: () => void
  onSort?: () => void
  showStats?: boolean
  onToggleStats?: () => void
  extraLeft?: React.ReactNode
  extraRight?: React.ReactNode
  className?: string
}

export function FilterBar({
  viewOptions,
  activeView,
  onViewChange,
  onFilter,
  onSort,
  showStats,
  onToggleStats,
  extraLeft,
  extraRight,
  className,
}: FilterBarProps) {
  const btnBase = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#D2DCD5] rounded-[6px] text-[#55615B] hover:border-[#246B56] hover:text-[#246B56] transition-colors bg-white"
  const btnActive = "border-[#246B56] text-[#246B56] bg-[#DDF3EC]/30"

  return (
    <div className={cn("flex items-center gap-2 flex-wrap mb-4", className)}>
      {/* View toggle */}
      {viewOptions && viewOptions.length > 0 && (
        <div className="flex items-center bg-[#F6F8F5] border border-[#D2DCD5] rounded-[6px] p-0.5">
          {viewOptions.map(view => (
            <button
              key={view}
              onClick={() => onViewChange?.(view)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-[6px] transition-all",
                activeView === view
                  ? "bg-white text-[#173F35] border border-[#D2DCD5]"
                  : "text-[#55615B] hover:text-[#1E2925]"
              )}
            >
              {view}
            </button>
          ))}
        </div>
      )}

      {extraLeft}

      <div className="flex items-center gap-1.5 ml-auto">
        {onFilter && (
          <button onClick={onFilter} className={btnBase}>
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        )}
        {onSort && (
          <button onClick={onSort} className={btnBase}>
            <ArrowUpDown className="w-3.5 h-3.5" />
            Urutan
          </button>
        )}
        {onToggleStats !== undefined && (
          <button
            onClick={onToggleStats}
            className={cn(btnBase, showStats && btnActive)}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Statistik
          </button>
        )}
        {extraRight}
      </div>
    </div>
  )
}
