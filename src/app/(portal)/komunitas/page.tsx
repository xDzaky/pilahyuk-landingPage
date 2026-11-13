// src/app/(portal)/komunitas/page.tsx
// Dashboard Komunitas — Community Admin
"use client"

import { useState } from "react"
import { AnswerBanner } from "@/components/dashboard/AnswerBanner"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable, Column } from "@/components/dashboard/DataTable"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { FilterBar } from "@/components/dashboard/FilterBar"
import { MetricList } from "@/components/dashboard/MetricList"
import { formatDate, formatDateTime, getInitials } from "@/lib/utils"
import {
  MOCK_JOIN_REQUESTS, MOCK_EVENTS, MOCK_TASKS,
  MOCK_ORGANIZATIONS, MOCK_COLLECTION_REQUESTS
} from "@/lib/mock-data"
import {
  Users, Calendar, Truck, CheckSquare,
  AlertTriangle, CheckCircle2, XCircle,
  Clock, MapPin
} from "lucide-react"

const pendingJoins = MOCK_JOIN_REQUESTS.length
const lateTasks = MOCK_TASKS.filter(t => t.status === "terlambat").length
const org = MOCK_ORGANIZATIONS[0]

type Task = typeof MOCK_TASKS[0]

const TASK_COLUMNS: Column<Task>[] = [
  {
    key: "title", header: "Tugas", sortable: true,
    cell: row => (
      <div>
        <div className="text-sm font-medium text-[#1E2925]">{row.title}</div>
        <div className="text-xs text-[#66736D]">PIC: {row.pic}</div>
      </div>
    )
  },
  {
    key: "assignee", header: "Penanggung Jawab", sortable: true,
    cell: row => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#DDF3EC] rounded-full flex items-center justify-center shrink-0">
          <span className="text-[#173F35] text-[10px] font-bold">{getInitials(row.assignee)}</span>
        </div>
        <span className="text-sm text-[#1E2925]">{row.assignee}</span>
      </div>
    )
  },
  {
    key: "due_at", header: "Tenggat", sortable: true,
    cell: row => (
      <span className={`text-xs ${row.status === "terlambat" ? "text-[#B54747] font-semibold" : "text-[#66736D]"}`}>
        {formatDate(row.due_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
      </span>
    )
  },
  {
    key: "status", header: "Status",
    cell: row => {
      const map: Record<string, "belum"|"berjalan"|"selesai"|"terlambat"> = {
        belum: "belum", berjalan: "berjalan", selesai: "selesai", terlambat: "terlambat"
      }
      return <StatusBadge status={map[row.status] || "belum"} size="sm" />
    }
  },
  {
    key: "actions", header: "Aksi",
    cell: row => row.status !== "selesai" ? (
      <button className="px-2 py-1 text-xs font-medium border border-[#E1E8E3] rounded-[9999px] hover:border-[#246B56] hover:text-[#246B56] transition-colors">
        Verifikasi
      </button>
    ) : (
      <span className="text-xs text-[#66736D]">—</span>
    )
  },
]

export default function KomunitasPage() {
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set())

  const pendingRequests = MOCK_JOIN_REQUESTS.filter(
    r => !approvedIds.has(r.id) && !rejectedIds.has(r.id)
  )

  const handleApprove = (id: string) => {
    setApprovedIds(s => new Set(s).add(id))
  }
  const handleReject = (id: string) => {
    setRejectedIds(s => new Set(s).add(id))
  }

  const completedTasks = MOCK_TASKS.filter(t => t.status === "selesai").length
  const totalTasks = MOCK_TASKS.length

  return (
    <div className="space-y-6">

      {/* ── ANSWER BANNER ── */}
      {pendingJoins > 0 || lateTasks > 0 ? (
        <AnswerBanner
          answer={[
            pendingJoins > 0 && `${pendingRequests.length} permintaan anggota`,
            lateTasks > 0 && `${lateTasks} tugas terlambat`,
          ].filter(Boolean).join(" & ") + " menunggu tindakanmu."}
          icon={AlertTriangle}
          variant="dark"
          actions={
            <button className="px-3 py-1.5 bg-[#DDF3EC] text-[#173F35] text-xs font-semibold rounded-[12px] hover:bg-[#CBECE2] transition-colors">
              Lihat semua
            </button>
          }
        />
      ) : (
        <AnswerBanner
          answer="Tidak ada yang perlu keputusanmu hari ini · semua tugas selesai"
          subtext={`Agenda terdekat: ${MOCK_EVENTS[0]?.title ?? "—"}, ${formatDate(MOCK_EVENTS[0]?.start_at ?? new Date().toISOString())}`}
          icon={CheckCircle2}
          variant="calm"
        />
      )}

      {/* ── KPI BARIS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Anggota Aktif Bulan Ini"
          value={org.member_count ?? 0}
          unit="anggota"
          icon={Users}
          trend={{ value: 8, direction: "up", period: "vs bulan lalu" }}
          source="dari organization_members"
          updatedAt="07.00"
        />
        <KpiCard
          label="Kegiatan Terlaksana"
          value={2}
          unit="kegiatan"
          icon={Calendar}
          source="dari events"
          updatedAt="07.00"
        />
        <KpiCard
          label="Pickup Selesai"
          value={MOCK_COLLECTION_REQUESTS.filter(c => c.status === "completed").length}
          unit="pickup"
          icon={Truck}
          source="dari collection_requests"
          updatedAt="08.00"
        />
        <KpiCard
          label="Tugas Relawan"
          value={completedTasks}
          unit={`dari ${totalTasks} selesai`}
          icon={CheckSquare}
          emphasis={lateTasks > 0}
          source="dari tasks"
          footer={
            lateTasks > 0
              ? <span className="text-[#B54747] font-semibold text-[11px]">⚠ {lateTasks} terlambat</span>
              : <span className="text-[11px] text-[#66736D]">Semua on track</span>
          }
        />
      </div>

      {/* ── METRIK KOMUNITAS ── */}
      <div className="bg-white border border-[#E1E8E3] rounded-[16px] p-5">
        <MetricList
          title="Statistik Keanggotaan"
          items={[
            { label: "Total Anggota", value: org.member_count ?? 0, highlight: true, trend: "up" },
            { label: "Bergabung Bulan Ini", value: 3, trend: "up" },
            { label: "Menunggu Persetujuan", value: pendingRequests.length },
            { label: "Kegiatan Selesai", value: 2 },
            { label: "Tugas Terlambat", value: lateTasks, trend: lateTasks > 0 ? "down" : "flat" },
          ]}
        />
      </div>

      {/* ── GRID 2 COL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Agenda mendatang (span 8) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[16px] border border-[#E1E8E3] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1E2925]">Agenda Mendatang</h2>
              <button className="text-xs text-[#246B56] font-semibold hover:underline">
                Kelola agenda →
              </button>
            </div>

            {MOCK_EVENTS.length === 0 ? (
              <EmptyState
                title="Belum ada agenda mendatang"
                description="Tambahkan kegiatan komunitas pertama"
                action={{ label: "Buat Kegiatan", onClick: () => {} }}
              />
            ) : (
              <div className="space-y-3">
                {MOCK_EVENTS.map(evt => {
                  const pct = Math.round((evt.registered / evt.capacity) * 100)
                  const isCritical = pct > 80
                  return (
                    <div key={evt.id} className="flex gap-4 p-4 rounded-[12px] border border-[#E1E8E3] hover:border-[#3D9274] transition-colors">
                      {/* Date block */}
                      <div className="text-center min-w-[48px]">
                        <div className="text-2xl font-black text-[#173F35] leading-none">
                          {new Date(evt.start_at).getDate()}
                        </div>
                        <div className="text-[11px] text-[#66736D] font-medium mt-0.5">
                          {new Date(evt.start_at).toLocaleDateString("id-ID", { month: "short" })}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[#1E2925] text-sm">{evt.title}</h3>
                          {isCritical && (
                            <span className="shrink-0 text-[11px] font-semibold bg-[#FBF1DF] text-[#A86712] px-2 py-0.5 rounded-full">
                              Hampir penuh
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-[#66736D]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(evt.start_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {evt.location}
                          </span>
                        </div>

                        {/* Quota progress */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#E1E8E3] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: isCritical ? "#E7A34B" : "#3D9274"
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-[#66736D] whitespace-nowrap">
                            {evt.registered}/{evt.capacity} terdaftar
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Permintaan anggota (span 4) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[16px] border border-[#E1E8E3] p-6 h-full">
            <h2 className="font-bold text-[#1E2925] mb-4">
              Permintaan Bergabung
              {pendingRequests.length > 0 && (
                <span className="ml-2 text-xs bg-[#FBF1DF] text-[#A86712] px-2 py-0.5 rounded-full font-semibold">
                  {pendingRequests.length}
                </span>
              )}
            </h2>

            {pendingRequests.length === 0 ? (
              <EmptyState
                title="Tidak ada permintaan menunggu"
                icon={CheckCircle2}
              />
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex items-start gap-3 p-3 rounded-[12px] border border-[#E1E8E3]">
                    <div className="w-9 h-9 bg-[#DDF3EC] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[#173F35] text-xs font-bold">{getInitials(req.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1E2925]">{req.name}</div>
                      <div className="text-[11px] text-[#66736D]">
                        {new Date(req.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                      </div>
                      {req.message && (
                        <div className="text-[11px] text-[#66736D] mt-1 italic truncate">&ldquo;{req.message}&rdquo;</div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#173F35] text-white text-xs font-semibold rounded-[9999px] hover:bg-[#246B56] transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="flex items-center gap-1 px-2.5 py-1 border border-[#B54747] text-[#B54747] text-xs font-semibold rounded-[9999px] hover:bg-[#FCEBEB] transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          Tolak
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TUGAS RELAWAN ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-[#1E2925]">Tugas Relawan</h2>
            <p className="text-xs text-[#66736D]">{completedTasks} dari {totalTasks} selesai · dari tasks</p>
          </div>
          <button className="px-3 py-1.5 bg-[#173F35] text-white text-xs font-semibold rounded-[12px] hover:bg-[#246B56] transition-colors">
            + Tambah Tugas
          </button>
        </div>

        <FilterBar onFilter={() => {}} onSort={() => {}} />

        <DataTable
          columns={TASK_COLUMNS}
          data={MOCK_TASKS}
          keyExtractor={r => r.id}
          searchKeys={["title", "assignee"]}
          searchPlaceholder="Cari tugas..."
          emptyTitle="Belum ada tugas"
          emptyAction={{ label: "Buat Tugas Baru", onClick: () => {} }}
        />
      </section>
    </div>
  )
}
