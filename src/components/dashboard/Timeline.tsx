// src/components/dashboard/Timeline.tsx
"use client"

import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import {
  Package, Truck, CheckCircle2, XCircle,
  Scale, ArrowRightLeft, Recycle, AlertTriangle, Clock
} from "lucide-react"

export type TimelineEventType =
  | "dikumpulkan"
  | "ditimbang"
  | "digabung"
  | "diserahkan"
  | "diterima"
  | "ditolak"
  | "diproses"
  | "residu"
  | "dipakai_ulang"

const EVENT_CONFIG: Record<TimelineEventType, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}> = {
  dikumpulkan:  { label: "Dikumpulkan",   icon: Package,          color: "text-[#246B56]",   bg: "bg-[#DDF3EC]" },
  ditimbang:    { label: "Ditimbang",      icon: Scale,            color: "text-[#246B56]",   bg: "bg-[#DDF3EC]" },
  digabung:     { label: "Digabung",       icon: ArrowRightLeft,   color: "text-[#286A9B]",   bg: "bg-[#EBF3F9]" },
  diserahkan:   { label: "Diserahkan",     icon: Truck,            color: "text-[#A86712]",   bg: "bg-[#FBF1DF]" },
  diterima:     { label: "Diterima",       icon: CheckCircle2,     color: "text-[#246B56]",   bg: "bg-[#DDF3EC]" },
  ditolak:      { label: "Ditolak",        icon: XCircle,          color: "text-[#B54747]",   bg: "bg-[#FCEBEB]" },
  diproses:     { label: "Diproses",       icon: Recycle,          color: "text-[#246B56]",   bg: "bg-[#DDF3EC]" },
  residu:       { label: "Residu",         icon: AlertTriangle,    color: "text-[#A86712]",   bg: "bg-[#FBF1DF]" },
  dipakai_ulang:{ label: "Dipakai Ulang",  icon: Recycle,          color: "text-[#246B56]",   bg: "bg-[#DDF3EC]" },
}

interface TimelineItem {
  id: string
  event_type: string
  actor_org_name: string
  actor_user_name?: string
  occurred_at: string
  weight?: number
  quality?: string
  notes?: string
  evidence_url?: string
}

interface TimelineProps {
  events: TimelineItem[]
  className?: string
}

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center gap-2 py-6 text-[#66736D] text-sm">
        <Clock className="w-4 h-4" />
        Belum ada peristiwa tercatat
      </div>
    )
  }

  return (
    <ol className={cn("relative pl-6", className)}>
      {/* Vertical line */}
      <div className="absolute left-3 top-3 bottom-3 w-px bg-[#E1E8E3]" aria-hidden />

      {events.map((event, idx) => {
        const type = event.event_type as TimelineEventType
        const config = EVENT_CONFIG[type] ?? {
          label: event.event_type,
          icon: Clock,
          color: "text-[#66736D]",
          bg: "bg-[#F6F8F5]",
        }
        const Icon = config.icon

        return (
          <li key={event.id} className={cn("relative flex gap-4", idx < events.length - 1 && "pb-6")}>
            {/* Icon dot */}
            <div className={cn(
              "absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 border-white",
              config.bg
            )}>
              <Icon className={cn("w-3 h-3", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={cn("text-xs font-semibold", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-xs text-[#66736D] ml-1.5">
                    oleh {event.actor_org_name}
                    {event.actor_user_name && ` · ${event.actor_user_name}`}
                  </span>
                </div>
                <time className="text-[11px] text-[#66736D] shrink-0 whitespace-nowrap">
                  {formatDateTime(event.occurred_at)}
                </time>
              </div>

              {/* Details */}
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-[#66736D]">
                {event.weight !== undefined && (
                  <span>Berat: <strong className="text-[#1E2925]">{event.weight} kg</strong></span>
                )}
                {event.quality && (
                  <span>Kualitas: <strong className="text-[#1E2925]">Grade {event.quality}</strong></span>
                )}
                {event.notes && (
                  <span className="text-[#66736D] italic">{event.notes}</span>
                )}
                {event.evidence_url && (
                  <a
                    href={event.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#246B56] font-medium hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    Lihat bukti ↗
                  </a>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
