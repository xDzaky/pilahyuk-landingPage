// src/components/dashboard/StatusBadge.tsx
"use client"

import { cn } from "@/lib/utils"
import { Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Info, Package, Send, Cog } from "lucide-react"

export type BadgeStatus =
  | "draft"
  | "menunggu"
  | "dikonfirmasi"
  | "selesai"
  | "terverifikasi"
  | "ditolak"
  | "sengketa"
  | "pending_sync"
  | "perkiraan"
  | "berjalan"
  | "terlambat"
  | "belum"
  | "aktif"
  | "suspended"
  | "dikumpulkan"
  | "diserahkan"
  | "diproses"

const STATUS_CONFIG: Record<BadgeStatus, {
  label: string
  bg: string
  text: string
  icon: React.ComponentType<{ className?: string }>
  dashed?: boolean
}> = {
  draft:        { label: "Draft",           bg: "bg-gray-100",          text: "text-gray-600",             icon: Clock },
  menunggu:     { label: "Menunggu",         bg: "bg-[#FBF1DF]",         text: "text-[#A86712]",            icon: Clock },
  dikonfirmasi: { label: "Dikonfirmasi",     bg: "bg-[#DDF3EC]",         text: "text-[#173F35]",            icon: CheckCircle2 },
  selesai:      { label: "Selesai",          bg: "bg-[#DDF3EC]",         text: "text-[#173F35]",            icon: CheckCircle2 },
  terverifikasi:{ label: "Terverifikasi",    bg: "bg-[#DDF3EC]",         text: "text-[#173F35]",            icon: CheckCircle2 },
  ditolak:      { label: "Ditolak",          bg: "bg-[#FCEBEB]",         text: "text-[#B54747]",            icon: XCircle },
  sengketa:     { label: "Sengketa",         bg: "bg-[#FCEBEB]",         text: "text-[#B54747]",            icon: AlertTriangle },
  pending_sync: { label: "Pending Sync",     bg: "bg-[#EBF3F9]",         text: "text-[#286A9B]",            icon: RefreshCw },
  perkiraan:    { label: "Perkiraan",        bg: "bg-transparent",       text: "text-[#55615B]",            icon: Info, dashed: true },
  berjalan:     { label: "Berjalan",         bg: "bg-[#EBF3F9]",         text: "text-[#286A9B]",            icon: RefreshCw },
  terlambat:    { label: "Terlambat",        bg: "bg-[#FCEBEB]",         text: "text-[#B54747]",            icon: AlertTriangle },
  belum:        { label: "Belum Dimulai",    bg: "bg-gray-100",          text: "text-gray-500",             icon: Clock },
  aktif:        { label: "Aktif",            bg: "bg-[#DDF3EC]",         text: "text-[#173F35]",            icon: CheckCircle2 },
  suspended:    { label: "Ditangguhkan",     bg: "bg-[#FCEBEB]",         text: "text-[#B54747]",            icon: XCircle },
  dikumpulkan:  { label: "Dikumpulkan",      bg: "bg-[#DDF3EC]",         text: "text-[#173F35]",            icon: Package },
  diserahkan:   { label: "Diserahkan",       bg: "bg-[#EBF3F9]",         text: "text-[#286A9B]",            icon: Send },
  diproses:     { label: "Diproses",         bg: "bg-[#FBF1DF]",         text: "text-[#A86712]",            icon: Cog },
}

// Map API status strings to our badge status
export function mapCollectionStatus(status: string): BadgeStatus {
  const map: Record<string, BadgeStatus> = {
    draft: "draft", submitted: "menunggu", confirmed: "dikonfirmasi",
    assigned: "berjalan", on_the_way: "berjalan", collected: "berjalan",
    received: "berjalan", completed: "selesai", cancelled: "ditolak",
    disputed: "sengketa",
  }
  return map[status] || "draft"
}

export function mapWeighingStatus(status: string): BadgeStatus {
  const map: Record<string, BadgeStatus> = {
    draft: "draft", confirmed: "terverifikasi", adjusted: "menunggu", void: "ditolak",
  }
  return map[status] || "draft"
}

export function mapBatchStatus(status: string): BadgeStatus {
  const map: Record<string, BadgeStatus> = {
    dibuat: "draft", diserahkan: "diserahkan", diterima: "dikonfirmasi",
    ditolak: "ditolak", diproses: "diproses", dipakai_ulang: "selesai",
    residu: "menunggu", menunggu_bukti: "menunggu",
  }
  return map[status] || "draft"
}

interface StatusBadgeProps {
  status: BadgeStatus
  className?: string
  size?: "sm" | "md"
  dot?: boolean
}

export function StatusBadge({ status, className, size = "md", dot = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  const Icon = config.icon

  if (dot) {
    return (
      <span className={cn("inline-flex items-center gap-1.5", config.text, className)}>
        <span className={cn(
          "inline-block rounded-full",
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
          config.bg.replace("bg-", "bg-").replace("/", "/")
        )} style={{ backgroundColor: "currentColor", opacity: 0.7 }} />
        <span className={size === "sm" ? "text-[11px]" : "text-xs"}>{config.label}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full border border-current/10",
        config.bg,
        config.text,
        config.dashed && "border-dashed border-[#55615B]",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      {status === "pending_sync" ? (
        <Icon className={cn("sync-blink", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />
      ) : (
        <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      )}
      {config.label}
    </span>
  )
}
