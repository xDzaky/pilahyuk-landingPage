// src/app/(portal)/dashboard/page.tsx
"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnswerBanner } from "@/components/dashboard/AnswerBanner"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { StatusBadge, mapWeighingStatus, mapCollectionStatus } from "@/components/dashboard/StatusBadge"
import { DataTable, Column } from "@/components/dashboard/DataTable"
import { FilterBar } from "@/components/dashboard/FilterBar"
import { MetricList } from "@/components/dashboard/MetricList"
import { TrendChart } from "@/components/charts/TrendChart"
import { OfflineBanner } from "@/components/dashboard/SyncIndicator"
import { formatRupiah, formatKg, formatDateTime, timeAgo, cn } from "@/lib/utils"
import {
  MOCK_WEIGHING_TRANSACTIONS, MOCK_COLLECTION_REQUESTS,
  MOCK_ORGANIZATIONS, getTodaySummary
} from "@/lib/mock-data"
import type { WeighingTransaction, CollectionRequest } from "@/types/api"
import {
  Scale, Users, Package, AlertTriangle,
  Plus, Download, RefreshCw
} from "lucide-react"

const TREND_7D = [
  { label: "Sen", value: 12.4 },
  { label: "Sel", value: 18.1 },
  { label: "Rab", value: 9.8 },
  { label: "Kam", value: 22.0 },
  { label: "Jum", value: 15.6 },
  { label: "Sab", value: 7.3 },
  { label: "Min", value: 18.1, estimated: true },
]

const TXN_COLUMNS: Column<WeighingTransaction>[] = [
  {
    key: "transaction_at", header: "Waktu", sortable: true,
    cell: row => (
      <span className="text-xs text-[#66736D]">{formatDateTime(row.transaction_at)}</span>
    )
  },
  {
    key: "member_name", header: "Anggota", sortable: true,
    cell: row => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#DDF3EC] rounded-full flex items-center justify-center shrink-0">
          <span className="text-[#173F35] text-[10px] font-bold">
            {row.member_name.split(" ").map(w => w[0]).join("").slice(0,2)}
          </span>
        </div>
        <span className="text-sm font-medium text-[#1E2925]">{row.member_name}</span>
      </div>
    )
  },
  {
    key: "total_net", header: "Berat Bersih", sortable: true,
    cell: row => <span className="text-sm font-semibold text-[#1E2925]">{formatKg(row.total_net)}</span>
  },
  {
    key: "total_value", header: "Nilai", sortable: true,
    cell: row => <span className="text-sm text-[#1E2925]">{formatRupiah(row.total_value)}</span>
  },
  {
    key: "status", header: "Status",
    cell: row => {
      const syncStatus = row.sync_status === "pending" ? "pending_sync" : undefined
      const badge = syncStatus ?? mapWeighingStatus(row.status)
      return <StatusBadge status={badge} size="sm" />
    }
  },
]

const COL_COLUMNS: Column<CollectionRequest>[] = [
  {
    key: "requested_at", header: "Waktu", sortable: true,
    cell: row => <span className="text-xs text-[#66736D]">{timeAgo(row.requested_at)}</span>
  },
  {
    key: "requester_name", header: "Peminta", sortable: true,
    cell: row => <span className="text-sm font-medium text-[#1E2925]">{row.requester_name}</span>
  },
  {
    key: "method", header: "Metode",
    cell: row => {
      const labels = { individual: "Jemput", collective: "Kolektif", dropoff: "Setor" }
      return <span className="text-xs text-[#66736D]">{labels[row.method]}</span>
    }
  },
  {
    key: "status", header: "Status",
    cell: row => <StatusBadge status={mapCollectionStatus(row.status)} size="sm" />
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const initialSummary = getTodaySummary()
  const [pendingSync, setPendingSync] = useState(initialSummary.pendingSync)
  const [isSyncing, setIsSyncing] = useState(false)
  const [transactions, setTransactions] = useState(MOCK_WEIGHING_TRANSACTIONS)

  const verifiedOrgs = MOCK_ORGANIZATIONS.filter(o => o.status === "verified").length

  const handleSync = useCallback(async () => {
    setIsSyncing(true)
    await new Promise(r => setTimeout(r, 1200))
    setPendingSync(0)
    setIsSyncing(false)
    setTransactions(prev =>
      prev.map(t => ({
        ...t,
        sync_status: "synced" as const,
        status: (t.status as string) === "pending" ? "confirmed" as const : t.status
      }))
    )
  }, [])

  const handleExportCSV = useCallback(() => {
    const headers = ["ID Transaksi", "Waktu", "Nama Anggota", "Berat Bersih (kg)", "Total Nilai (Rp)", "Status"]
    const rows = transactions.map(t => [
      t.id,
      t.transaction_at,
      `"${t.member_name}"`,
      t.total_net,
      t.total_value,
      t.sync_status === "pending" ? "Pending Sync" : t.status
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transaksi-penimbangan-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [transactions])

  const totalValue = transactions.reduce((sum, t) => sum + t.total_value, 0)
  const avgWeight = transactions.length ? (initialSummary.totalNet / transactions.length) : 0

  return (
    <div className="space-y-6">
      {/* Offline sync banner */}
      {pendingSync > 0 && (
        <OfflineBanner
          pendingCount={pendingSync}
          lastSync="08.30"
          onSync={handleSync}
        />
      )}

      {/* ── ANSWER BANNER ── */}
      <AnswerBanner
        compact
        answer={
          pendingSync > 0
            ? `${pendingSync} transaksi menunggu sinkronisasi · berat bersih hari ini: ${formatKg(initialSummary.totalNet)}`
            : `Semua ${initialSummary.confirmedCount} transaksi hari ini tersinkron · berat bersih: ${formatKg(initialSummary.totalNet)}`
        }
        subtext={pendingSync > 0 ? "Periksa koneksi dan sinkronkan data sebelum tutup sesi" : undefined}
        icon={pendingSync > 0 ? AlertTriangle : Scale}
        variant={pendingSync > 0 ? "warning" : "dark"}
        actions={
          <div className="flex gap-2">
            {pendingSync > 0 && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-[12px] hover:bg-white/30 flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                {isSyncing ? "Menyinkronkan..." : "Sinkronkan"}
              </button>
            )}
            <Link
              href="/bank-sampah"
              className="px-3 py-1.5 bg-[#DDF3EC] text-[#173F35] text-xs font-semibold rounded-[12px] hover:bg-[#CBECE2] flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Timbang Baru
            </Link>
          </div>
        }
      />

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Menunggu Sinkronisasi"
          value={pendingSync}
          unit="transaksi"
          icon={RefreshCw}
          emphasis={pendingSync > 0}
          source="dari outbox lokal"
          updatedAt={new Date().toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" })}
          href="/bank-sampah"
        />
        <KpiCard
          label="Berat Bersih Hari Ini"
          value={initialSummary.totalNet.toFixed(1)}
          unit="kg"
          icon={Scale}
          trend={{ value: 12, direction: "up", period: "vs kemarin" }}
          source="dari weighing_items.net"
          updatedAt="08.32"
          href="/bank-sampah"
        />
        <KpiCard
          label="Transaksi Hari Ini"
          value={initialSummary.totalCount}
          unit="transaksi"
          icon={Package}
          source="dari weighing_transactions"
          updatedAt="08.32"
          href="/bank-sampah"
        />
        <KpiCard
          label="Mitra Terverifikasi"
          value={verifiedOrgs}
          unit="organisasi"
          icon={Users}
          source="dari organizations"
          updatedAt="08.00"
          href="/komunitas"
        />
      </div>

      {/* ── TREND CHART + METRIC PANEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TrendChart
            data={TREND_7D}
            title="Tren Penimbangan"
            question="Berapa berat bersih per hari selama 7 hari terakhir?"
            unit="kg"
          />
        </div>
        <div className="lg:col-span-4">
          <div className="bg-white border border-[#E1E8E3] rounded-[16px] p-5 h-full">
            <MetricList
              title="Ringkasan Operasional"
              items={[
                { label: "Total Nilai Transaksi", value: formatRupiah(totalValue), highlight: true },
                { label: "Rata-rata Berat/Transaksi", value: `${avgWeight.toFixed(1)} kg`, trend: "up" },
                { label: "Transaksi Dikonfirmasi", value: initialSummary.confirmedCount },
                { label: "Menunggu Sinkronisasi", value: pendingSync, trend: pendingSync > 0 ? "down" : "flat" },
                { label: "Mitra Aktif", value: verifiedOrgs, trend: "up" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── RIWAYAT TRANSAKSI ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-[#1E2925]">Riwayat Transaksi</h2>
            <p className="text-xs text-[#66736D]">dari weighing_transactions · diperbarui tiap 30 detik</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E1E8E3] rounded-[12px] text-xs font-medium text-[#66736D] hover:border-[#246B56] hover:text-[#246B56] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
        </div>

        <FilterBar
          onFilter={() => {}}
          onSort={() => {}}
        />

        <DataTable
          columns={TXN_COLUMNS}
          data={transactions}
          keyExtractor={r => r.id}
          searchKeys={["member_name"]}
          searchPlaceholder="Cari anggota..."
          emptyTitle="Belum ada transaksi hari ini"
          emptyDescription="Catat penimbangan pertama menggunakan tombol di atas"
          emptyAction={{ label: "Catat Penimbangan Baru", onClick: () => router.push("/bank-sampah") }}
        />
      </section>

      {/* ── PERMINTAAN PENGUMPULAN ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-[#1E2925]">Permintaan Pengumpulan</h2>
            <p className="text-xs text-[#66736D]">dari collection_requests · semua status</p>
          </div>
          <Link
            href="/pengumpulan"
            className="text-xs font-semibold text-[#246B56] hover:underline"
          >
            Kelola Pengumpulan →
          </Link>
        </div>

        <FilterBar onFilter={() => {}} />

        <DataTable
          columns={COL_COLUMNS}
          data={MOCK_COLLECTION_REQUESTS}
          keyExtractor={r => r.id}
          searchKeys={["requester_name"]}
          searchPlaceholder="Cari peminta..."
          emptyTitle="Tidak ada permintaan pengumpulan"
          pageSize={5}
        />
      </section>
    </div>
  )
}
