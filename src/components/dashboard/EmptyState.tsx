// src/components/dashboard/EmptyState.tsx
"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, Package } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Package,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      className
    )}>
      {/* Minimal line illustration */}
      <div className="w-16 h-16 rounded-full bg-[#F6F8F5] border border-[#E1E8E3] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#66736D]" strokeWidth={1.5} />
      </div>

      <h3 className="font-semibold text-[#1E2925] text-sm">{title}</h3>

      {description && (
        <p className="mt-1 text-xs text-[#66736D] max-w-xs">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-[#173F35] text-white text-sm font-semibold rounded-[12px] hover:bg-[#246B56] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Error state variant
interface ErrorStateProps {
  title?: string
  description?: string
  lastLoaded?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Gagal memuat data",
  description,
  lastLoaded,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(
      "rounded-[16px] border border-[#FCEBEB] bg-[#FCEBEB]/30 p-6 text-center",
      className
    )}>
      <p className="font-semibold text-[#B54747] text-sm">{title}</p>
      {description && <p className="mt-1 text-xs text-[#66736D]">{description}</p>}
      {lastLoaded && (
        <p className="mt-2 text-[11px] text-[#66736D]">Terakhir dimuat {lastLoaded}</p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-1.5 border border-[#B54747] text-[#B54747] text-xs font-semibold rounded-[12px] hover:bg-[#FCEBEB] transition-colors"
        >
          Coba lagi
        </button>
      )}
    </div>
  )
}

// Skeleton components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[16px] border border-[#E1E8E3] bg-white p-6", className)}>
      <div className="skeleton h-3 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-32 rounded mb-2" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  )
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 py-3 border-b border-[#E1E8E3]", className)}>
      <div className="skeleton h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3 w-40 rounded" />
        <div className="skeleton h-2.5 w-24 rounded" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      <div className="flex gap-4 py-3 border-b border-[#E1E8E3]">
        {[40, 100, 80, 60, 70].map((w, i) => (
          <div key={i} className={`skeleton h-3 rounded`} style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
