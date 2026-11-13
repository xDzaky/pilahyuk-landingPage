// src/app/(admin)/admin/overview/page.tsx
// Super Admin Overview
"use client"

import { useState } from "react"
import { AnswerBanner } from "@/components/dashboard/AnswerBanner"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { DataTable, Column } from "@/components/dashboard/DataTable"
import { FilterBar } from "@/components/dashboard/FilterBar"
import { BreakdownCard } from "@/components/dashboard/BreakdownCard"
import { formatDateTime, timeAgo } from "@/lib/utils"
import {
  MOCK_ORGANIZATIONS, MOCK_DISPUTES, MOCK_AUDIT_LOGS
} from "@/lib/mock-data"
import type { Organization, Dispute, AuditLog } from "@/types/api"
import {
  ShieldCheck, AlertOctagon, Building2, Users,
  CheckCircle2, XCircle, Eye, Server
} from "lucide-react"

const pendingVerif = MOCK_ORGANIZATIONS.filter(o => o.status === "pending_verification").length
const activeDisputes = MOCK_DISPUTES.filter(d => ["open","assigned","in_review"].includes(d.status)).length
const verifiedOrgs = MOCK_ORGANIZATIONS.filter(o => o.status === "verified").length
const draftOrgs = MOCK_ORGANIZATIONS.filter(o => o.status === "unverified").length

const ORG_TYPE_SEGMENTS = [
  { key: "waste_bank", label: "Bank Sampah", colorClass: "bg-[#173F35]" },
  { key: "community",  label: "Komunitas",   colorClass: "bg-[#2E7F66]" },
  { key: "recycler",   label: "Pengolah",    colorClass: "bg-[#4FA089]" },
  { key: "collector",  label: "Pengumpul",   colorClass: "bg-[#8BC4B2]" },
  { key: "artisan",    label: "Perajin",     colorClass: "bg-[#D8ECE4]" },
].map(t => ({
  label: t.label,
  colorClass: t.colorClass,
  value: MOCK_ORGANIZATIONS.filter(o => o.type === t.key).length,
}))

type Org = Organization
const ORG_COLUMNS: Column<Org>[] = [
  {
    key: "name", header: "Organisasi", sortable: true,
    cell: row => (
      <div>
        <div className="text-sm font-semibold text-[#1E2925]">{row.name}</div>
        <div className="text-xs text-[#66736D]">{row.area_name}</div>
      </div>
    )
  },
  {
    key: "type", header: "Tipe",
    cell: row => {
      const labels: Record<string, string> = {
        community: "Komunitas", waste_bank: "Bank Sampah",
        collector: "Pengumpul", recycler: "Pengolah",
        artisan: "Perajin", school: "Sekolah",
      }
      return <span className="text-xs text-[#66736D]">{labels[row.type] ?? row.type}</span>
    }
  },
  {
    key: "status", header: "Status",
    cell: row => {
      const map: Record<string, "menunggu"|"terverifikasi"|"suspended"|"draft"> = {
        pending_verification: "menunggu",
        verified: "terverifikasi",
        suspended: "suspended",
        unverified: "draft",
      }
      return <StatusBadge status={map[row.status] ?? "draft"} size="sm" />
    }
  },
  {
    key: "member_count", header: "Anggota",
    cell: row => <span className="text-sm text-[#1E2925]">{row.member_count ?? 0}</span>
  },
  {
    key: "actions", header: "Aksi",
    cell: row => row.status === "pending_verification" ? (
      <div className="flex gap-1.5">
        <button className="flex items-center gap-1 px-2.5 py-1 bg-[#DDF3EC] text-[#173F35] text-xs font-semibold rounded-full hover:bg-[#CBECE2] transition-colors">
          <CheckCircle2 className="w-3 h-3" />
          Verifikasi
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 border border-[#B54747] text-[#B54747] text-xs font-semibold rounded-full hover:bg-[#FCEBEB] transition-colors">
          <XCircle className="w-3 h-3" />
          Tolak
        </button>
      </div>
    ) : (
      <button className="flex items-center gap-1 px-2.5 py-1 border border-[#E1E8E3] text-[#66736D] text-xs font-semibold rounded-full hover:border-[#246B56] transition-colors">
        <Eye className="w-3 h-3" />
        Detail
      </button>
    )
  },
]

type Dis = Dispute
const DISPUTE_COLUMNS: Column<Dis>[] = [
  {
    key: "reporter_name", header: "Pelapor", sortable: true,
    cell: row => <span className="text-sm text-[#1E2925]">{row.reporter_name}</span>
  },
  {
    key: "category", header: "Kategori",
    cell: row => {
      const labels: Record<string, string> = {
        berat: "Berat", harga: "Harga", kualitas: "Kualitas",
        layanan: "Layanan", konten: "Konten",
      }
      return <span className="text-xs text-[#66736D]">{labels[row.category]}</span>
    }
  },
  {
    key: "reason", header: "Alasan",
    cell: row => (
      <span className="text-xs text-[#1E2925] max-w-[200px] block truncate" title={row.reason}>
        {row.reason}
      </span>
    )
  },
  {
    key: "status", header: "Status",
    cell: row => {
      const map: Record<string, "menunggu"|"berjalan"|"selesai"|"ditolak"> = {
        open: "menunggu", assigned: "berjalan", in_review: "berjalan",
        resolved: "selesai", rejected: "ditolak",
      }
      return <StatusBadge status={map[row.status] ?? "menunggu"} size="sm" />
    }
  },
  {
    key: "created_at", header: "Dibuat",
    cell: row => <span className="text-xs text-[#66736D]">{timeAgo(row.created_at)}</span>
  },
  {
    key: "actions", header: "Aksi",
    cell: row => (
      <button className="px-2.5 py-1 border border-[#E1E8E3] text-[#66736D] text-xs font-semibold rounded-full hover:border-[#246B56] hover:text-[#246B56] transition-colors">
        Tangani
      </button>
    )
  },
]

type Log = AuditLog
const AUDIT_COLUMNS: Column<Log>[] = [
  {
    key: "occurred_at", header: "Waktu", sortable: true,
    cell: row => <span className="text-xs text-[#66736D]">{formatDateTime(row.occurred_at)}</span>
  },
  {
    key: "actor_name", header: "Aktor", sortable: true,
    cell: row => <span className="text-sm font-medium text-[#1E2925]">{row.actor_name}</span>
  },
  {
    key: "action", header: "Aksi",
    cell: row => (
      <span className="text-xs font-mono bg-[#F6F8F5] px-2 py-0.5 rounded text-[#246B56]">
        {row.action}
      </span>
    )
  },
  {
    key: "entity_type", header: "Entitas",
    cell: row => (
      <span className="text-xs text-[#66736D]">
        {row.entity_type} #{row.entity_id.slice(-6)}
      </span>
    )
  },
  {
    key: "ip", header: "IP",
    cell: row => <span className="text-xs text-[#66736D] font-mono">{row.ip}</span>
  },
]

export default function AdminOverviewPage() {
  const [activeTab, setActiveTab] = useState<"verifikasi" | "sengketa" | "audit">("verifikasi")

  return (
    <div className="space-y-6">

      {/* ── SYSTEM HEALTH ── */}
      <div className="bg-white border border-[#E1E8E3] rounded-[16px] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#66736D]">Status Sistem</span>
          <span className="text-[11px] text-[#66736D]">diperbarui otomatis</span>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { label: "API Server", status: "online", color: "#3D9274" },
            { label: "Database", status: "online", color: "#3D9274" },
            { label: "Sync Service", status: "online", color: "#3D9274" },
            { label: "Latensi", status: "24ms", color: "#1E2925" },
            { label: "Uptime", status: "99.9%", color: "#1E2925" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-[#66736D]">{item.label}</span>
              <span className="text-xs font-semibold text-[#1E2925]">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ANSWER BANNER ── */}
      <AnswerBanner
        answer={[
          pendingVerif > 0 && `${pendingVerif} organisasi menunggu verifikasi`,
          activeDisputes > 0 && `${activeDisputes} sengketa aktif`,
          "server sehat",
        ].filter(Boolean).join(" · ")}
        icon={pendingVerif > 0 || activeDisputes > 0 ? AlertOctagon : ShieldCheck}
        variant={pendingVerif > 0 || activeDisputes > 0 ? "dark" : "calm"}
      />

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Organisasi Terdaftar"
          value={MOCK_ORGANIZATIONS.length}
          unit="total"
          icon={Building2}
          emphasis={pendingVerif > 0}
          source="dari organizations"
          footer={
            <div className="text-[11px] text-[#66736D] space-y-0.5">
              <div>✓ {verifiedOrgs} terverifikasi</div>
              {pendingVerif > 0 && <div className="text-[#A86712] font-semibold">⏳ {pendingVerif} menunggu</div>}
            </div>
          }
        />
        <KpiCard
          label="Pengguna Aktif 30 Hari"
          value={87}
          unit="pengguna"
          icon={Users}
          trend={{ value: 12, direction: "up", period: "vs bulan lalu" }}
          source="dari users"
          updatedAt="07.00"
        />
        <KpiCard
          label="Sengketa Aktif"
          value={activeDisputes}
          unit="kasus"
          icon={AlertOctagon}
          emphasis={activeDisputes > 0}
          source="dari disputes"
          footer={
            activeDisputes > 0
              ? <span className="text-[11px] text-[#A86712] font-semibold">⚠ Perlu penanganan</span>
              : <span className="text-[11px] text-[#3D9274]">✓ Semua resolved</span>
          }
        />
        <KpiCard
          label="Kesehatan Sistem"
          value="Sehat"
          icon={Server}
          source="dari health checks"
          footer={
            <div className="text-[11px] text-[#66736D] space-y-0.5">
              <div>API p95: 142ms ✓</div>
              <div>Queue: 0 ✓</div>
            </div>
          }
        />
      </div>

      {/* ── BREAKDOWN + TABS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 lg:self-start lg:sticky lg:top-20">
          <BreakdownCard
            title="Komposisi Organisasi"
            unit="organisasi"
            segments={ORG_TYPE_SEGMENTS}
            footer={
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#246B56]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#246B56]" />
                  {verifiedOrgs} terverifikasi
                </span>
                {pendingVerif > 0 && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#A86712]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E7A34B]" />
                    {pendingVerif} menunggu
                  </span>
                )}
                {draftOrgs > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[#66736D]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E1E8E3]" />
                    {draftOrgs} draft
                  </span>
                )}
              </div>
            }
          />
        </div>

        <div className="lg:col-span-8">
      {/* ── TABS ── */}
      <div>
        <div className="flex gap-1 border-b border-[#E1E8E3] mb-6">
          {([
            { key: "verifikasi", label: `Antrean Verifikasi (${pendingVerif})` },
            { key: "sengketa", label: `Pusat Sengketa (${activeDisputes})` },
            { key: "audit", label: "Audit Trail" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[#246B56] text-[#173F35]"
                  : "border-transparent text-[#66736D] hover:text-[#1E2925]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "verifikasi" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#66736D]">
                Tinjau dokumen dan setujui / tolak pendaftaran organisasi mitra
              </p>
              {pendingVerif > 1 && (
                <button className="px-3 py-1.5 bg-[#DDF3EC] text-[#173F35] text-xs font-semibold rounded-[12px] hover:bg-[#CBECE2] transition-colors">
                  Approve Semua ({pendingVerif})
                </button>
              )}
            </div>
            <DataTable
              columns={ORG_COLUMNS}
              data={MOCK_ORGANIZATIONS.filter(o => o.status === "pending_verification")}
              keyExtractor={r => r.id}
              searchKeys={["name", "area_name"]}
              searchPlaceholder="Cari organisasi..."
              emptyTitle="Tidak ada organisasi menunggu verifikasi"
            />
            <div className="mt-4">
              <h3 className="font-semibold text-[#1E2925] text-sm mb-3">Semua Organisasi</h3>
              <DataTable
                columns={ORG_COLUMNS}
                data={MOCK_ORGANIZATIONS}
                keyExtractor={r => r.id}
                searchKeys={["name"]}
                searchPlaceholder="Cari semua organisasi..."
                pageSize={5}
              />
            </div>
          </div>
        )}

        {activeTab === "sengketa" && (
          <DataTable
            columns={DISPUTE_COLUMNS}
            data={MOCK_DISPUTES}
            keyExtractor={r => r.id}
            searchKeys={["reporter_name", "reason"]}
            searchPlaceholder="Cari sengketa..."
            emptyTitle="Tidak ada sengketa aktif"
          />
        )}

        {activeTab === "audit" && (
          <div>
            <div className="rounded-[12px] bg-[#EBF3F9] border border-[#286A9B]/20 px-4 py-2 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#286A9B]" />
              <p className="text-xs text-[#286A9B]">
                Audit log bersifat append-only — tidak ada aksi edit atau hapus di halaman ini.
              </p>
            </div>
            <DataTable
              columns={AUDIT_COLUMNS}
              data={MOCK_AUDIT_LOGS}
              keyExtractor={r => r.id}
              searchKeys={["actor_name", "action", "entity_type"]}
              searchPlaceholder="Cari aktor, aksi, entitas..."
              emptyTitle="Tidak ada log audit"
            />
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  )
}
