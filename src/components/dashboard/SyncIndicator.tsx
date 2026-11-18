// src/components/dashboard/SyncIndicator.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react"

interface SyncIndicatorProps {
  pendingCount?: number
  isOnline?: boolean
  onOpenOutbox?: () => void
  compact?: boolean
}

export function SyncIndicator({
  pendingCount = 0,
  isOnline = true,
  onOpenOutbox,
  compact = false,
}: SyncIndicatorProps) {
  if (!isOnline) {
    return (
      <button
        onClick={onOpenOutbox}
        className={cn(
          "inline-flex items-center gap-2 rounded-[6px] border px-3 py-1.5 text-xs font-semibold transition-colors",
          "bg-[#FCEBEB] border-[#B54747]/30 text-[#B54747] hover:bg-[#FCEBEB]/80"
        )}
        aria-label="Mode offline — klik untuk lihat antrean"
      >
        <WifiOff className="w-3.5 h-3.5" />
        {!compact && "Offline"}
      </button>
    )
  }

  if (pendingCount > 0) {
    return (
      <button
        onClick={onOpenOutbox}
        className={cn(
          "inline-flex items-center gap-2 rounded-[6px] border px-3 py-1.5 text-xs font-semibold transition-colors",
          "bg-[#FBF1DF] border-[#A86712]/30 text-[#A86712] hover:bg-[#FBF1DF]/80"
        )}
        aria-label={`${pendingCount} item menunggu sinkronisasi — klik untuk lihat`}
      >
        <RefreshCw className="w-3.5 h-3.5 sync-blink" />
        {!compact && `Pending Sync ${pendingCount} item`}
        {compact && (
          <span className="bg-[#A86712] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
            {pendingCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-[6px] border px-3 py-1.5 text-xs font-semibold",
        "bg-[#DDF3EC] border-[#3D9274]/30 text-[#173F35]"
      )}
      aria-label="Semua data tersinkronisasi"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      {!compact && "Tersinkron"}
    </div>
  )
}

// Offline banner for operational modules
interface OfflineBannerProps {
  pendingCount?: number
  lastSync?: string
  onSync?: () => void
}

export function OfflineBanner({ pendingCount = 0, lastSync, onSync }: OfflineBannerProps) {
  if (pendingCount === 0) return null

  return (
    <div className="rounded-[6px] bg-[#FBF1DF] border border-[#F3DFBD] p-3 flex items-center gap-3">
      <AlertTriangle className="w-4 h-4 text-[#A86712] shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-[#A86712]">
          {pendingCount} transaksi menunggu sinkronisasi
        </span>
        {lastSync && (
          <span className="text-xs text-[#A86712]/70 ml-2">
            · sinkron terakhir {lastSync}
          </span>
        )}
      </div>
      {onSync && (
        <button
          onClick={onSync}
          className="px-3 py-1 bg-[#A86712] text-white text-xs font-semibold rounded-[4px] hover:bg-[#8A5410] transition-colors"
        >
          Sinkronkan
        </button>
      )}
    </div>
  )
}
