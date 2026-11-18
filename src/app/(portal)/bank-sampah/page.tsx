// src/app/(portal)/bank-sampah/page.tsx
// Dashboard Bank Sampah — Waste Bank Operator
"use client"

import { useState, useCallback } from "react"
import { AnswerBanner } from "@/components/dashboard/AnswerBanner"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { StatusBadge, mapWeighingStatus } from "@/components/dashboard/StatusBadge"
import { DataTable, Column } from "@/components/dashboard/DataTable"
import { SyncIndicator, OfflineBanner } from "@/components/dashboard/SyncIndicator"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { formatRupiah, formatKg, formatDateTime, timeAgo, getInitials, generateId } from "@/lib/utils"
import {
  MOCK_WEIGHING_TRANSACTIONS, MOCK_MATERIALS, MOCK_USERS,
  getTodaySummary, getMemberBalance, MOCK_LEDGER
} from "@/lib/mock-data"
import type { WeighingTransaction } from "@/types/api"
import {
  Scale, Wallet, Package, RefreshCw, Search,
  Plus, AlertTriangle, CheckCircle2, X, Download
} from "lucide-react"

const summary = getTodaySummary()
const members = MOCK_USERS.filter(u => u.roles.some(r => r.organization_type === "waste_bank"))

type FormItem = { material_id: string; material_name: string; gross: string; tare: string }

function WeighingForm({ onClose }: { onClose?: () => void }) {
  const [memberQuery, setMemberQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null)
  const [items, setItems] = useState<FormItem[]>([{ material_id: "", material_name: "", gross: "", tare: "" }])
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberQuery.toLowerCase())
  ).slice(0, 5)

  const getNet = (item: FormItem) => {
    const g = parseFloat(item.gross) || 0
    const t = parseFloat(item.tare) || 0
    return Math.max(0, g - t)
  }

  const getPrice = (materialId: string) => {
    return MOCK_MATERIALS.find(m => m.id === materialId)?.current_price ?? 0
  }

  const totalNet = items.reduce((s, it) => s + getNet(it), 0)
  const totalValue = items.reduce((s, it) => s + getNet(it) * getPrice(it.material_id), 0)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!selectedMember) errs.member = "Pilih anggota terlebih dahulu"
    items.forEach((item, i) => {
      if (!item.material_id) errs[`mat_${i}`] = "Pilih material"
      const g = parseFloat(item.gross)
      const t = parseFloat(item.tare)
      if (isNaN(g) || g <= 0) errs[`gross_${i}`] = "Berat bruto harus lebih dari 0"
      if (isNaN(t) || t < 0) errs[`tare_${i}`] = "Tara tidak boleh negatif"
      if (!isNaN(g) && !isNaN(t) && t >= g) errs[`tare_${i}`] = "Berat bersih tidak boleh negatif atau melebihi bruto"
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveDraft = () => {
    if (!validate()) {
      const firstError = document.querySelector('[data-error]') as HTMLElement
      firstError?.focus()
      return
    }
    alert("Draft tersimpan di perangkat · akan sinkron otomatis saat online")
  }

  const handleConfirm = () => {
    if (!validate()) return
    setShowConfirm(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000)) // simulate API
    setSubmitting(false)
    setShowConfirm(false)
    alert("Transaksi dikonfirmasi! ID: wtx-" + generateId().slice(0, 6))
    onClose?.()
  }

  return (
    <div className="bg-white rounded-[6px] border border-[#D2DCD5] p-6">
      <h2 className="font-bold text-[#1E2925] mb-4">Penimbangan Baru</h2>

      {/* Member search */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#55615B] mb-1.5">
          Anggota <span className="text-[#B54747]">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55615B]" />
          <input
            type="text"
            value={selectedMember ? selectedMember.name : memberQuery}
            onChange={e => { setMemberQuery(e.target.value); setSelectedMember(null) }}
            placeholder="Cari nama atau kode anggota..."
            className="w-full pl-9 pr-3 h-10 text-sm border border-[#D2DCD5] rounded-[6px] focus:outline-none focus:border-[#246B56]"
            aria-label="Cari anggota"
            data-error={errors.member ? "" : undefined}
          />
          {!selectedMember && memberQuery && filteredMembers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D2DCD5] rounded-[6px] shadow-sm z-10 overflow-hidden">
              {filteredMembers.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMember(m); setMemberQuery("") }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#EDF1EC] text-left"
                >
                  <div className="w-7 h-7 bg-[#DDF3EC] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[#173F35] text-[10px] font-bold">{getInitials(m.name)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#1E2925]">{m.name}</div>
                    <div className="text-[11px] text-[#55615B]">
                      Saldo: {formatRupiah(getMemberBalance(m.id))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.member && <p className="mt-1 text-xs text-[#B54747]" role="alert">{errors.member}</p>}
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
        <label className="block text-xs font-semibold text-[#55615B]">
          Material & Berat <span className="text-[#B54747]">*</span>
        </label>
        {items.map((item, i) => {
          const net = getNet(item)
          const price = getPrice(item.material_id)
          const value = net * price
          return (
            <div key={i} className="rounded-[6px] border border-[#D2DCD5] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#55615B]">Item {i+1}</span>
                {items.length > 1 && (
                  <button
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    className="p-1 hover:text-[#B54747] text-[#55615B]"
                    aria-label={`Hapus item ${i+1}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Material */}
                <div className="col-span-2">
                  <select
                    value={item.material_id}
                    onChange={e => {
                      const mat = MOCK_MATERIALS.find(m => m.id === e.target.value)
                      const updated = [...items]
                      updated[i] = { ...updated[i], material_id: e.target.value, material_name: mat?.name ?? "" }
                      setItems(updated)
                    }}
                    className="w-full h-10 px-3 text-sm border border-[#D2DCD5] rounded-[6px] focus:outline-none focus:border-[#246B56] bg-white"
                    aria-label={`Pilih material item ${i+1}`}
                  >
                    <option value="">Pilih material...</option>
                    {MOCK_MATERIALS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {formatRupiah(m.current_price ?? 0)}/kg
                      </option>
                    ))}
                  </select>
                  {errors[`mat_${i}`] && <p className="mt-1 text-xs text-[#B54747]" role="alert">{errors[`mat_${i}`]}</p>}
                </div>

                {/* Bruto */}
                <div>
                  <label className="block text-[11px] text-[#55615B] mb-1">Bruto (kg)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={item.gross}
                    onChange={e => { const u = [...items]; u[i] = {...u[i], gross: e.target.value}; setItems(u) }}
                    className="w-full h-10 px-3 text-sm border border-[#D2DCD5] rounded-[6px] focus:outline-none focus:border-[#246B56]"
                    placeholder="0.00"
                    aria-label={`Berat bruto item ${i+1}`}
                  />
                  {errors[`gross_${i}`] && <p className="mt-1 text-xs text-[#B54747]" role="alert">{errors[`gross_${i}`]}</p>}
                </div>

                {/* Tara */}
                <div>
                  <label className="block text-[11px] text-[#55615B] mb-1">Tara (kg)</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={item.tare}
                    onChange={e => { const u = [...items]; u[i] = {...u[i], tare: e.target.value}; setItems(u) }}
                    className="w-full h-10 px-3 text-sm border border-[#D2DCD5] rounded-[6px] focus:outline-none focus:border-[#246B56]"
                    placeholder="0.00"
                    aria-label={`Berat tara item ${i+1}`}
                  />
                  {errors[`tare_${i}`] && <p className="mt-1 text-xs text-[#B54747]" role="alert">{errors[`tare_${i}`]}</p>}
                </div>
              </div>

              {/* Auto-calculated */}
              {item.material_id && (
                <div className="flex gap-4 pt-2 border-t border-[#D2DCD5] text-xs">
                  <div>
                    <span className="text-[#55615B]">Bersih: </span>
                    <strong className="text-[#1E2925]">{net.toFixed(2)} kg</strong>
                  </div>
                  <div>
                    <span className="text-[#55615B]">Harga: </span>
                    <strong className="text-[#1E2925]">{formatRupiah(price)}/kg</strong>
                    <span className="text-[#55615B] ml-1 text-[10px]">(berlaku 1 Nov)</span>
                  </div>
                  <div>
                    <span className="text-[#55615B]">Nilai: </span>
                    <strong className="text-[#246B56]">{formatRupiah(value)}</strong>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <button
          onClick={() => setItems([...items, { material_id: "", material_name: "", gross: "", tare: "" }])}
          className="w-full h-10 border border-dashed border-[#D2DCD5] rounded-[6px] text-xs text-[#55615B] hover:border-[#246B56] hover:text-[#246B56] transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Material
        </button>
      </div>

      {/* Total summary */}
      {totalNet > 0 && (
        <div className="rounded-[6px] bg-[#F6F8F5] p-3 mb-4 flex justify-between text-sm">
          <div>
            <span className="text-[#55615B]">Total Bersih: </span>
            <strong className="text-[#1E2925]">{formatKg(totalNet)}</strong>
          </div>
          <div>
            <span className="text-[#55615B]">Total Nilai: </span>
            <strong className="text-[#246B56]">{formatRupiah(totalValue)}</strong>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveDraft}
          className="flex-1 h-10 border border-[#D2DCD5] rounded-[6px] text-sm font-semibold text-[#1E2925] hover:border-[#246B56] hover:text-[#246B56] transition-colors"
        >
          Simpan Draft
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 h-10 bg-[#173F35] text-white rounded-[6px] text-sm font-semibold hover:bg-[#246B56] transition-colors"
        >
          Konfirmasi
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-[6px] p-6 max-w-sm w-full border border-[#D2DCD5]">
            <h3 className="font-bold text-[#1E2925] mb-2">Konfirmasi Transaksi</h3>
            <p className="text-sm text-[#55615B] mb-4">
              Transaksi untuk <strong>{selectedMember?.name}</strong>:{" "}
              <strong>{formatKg(totalNet)}</strong> senilai <strong>{formatRupiah(totalValue)}</strong>.
              Transaksi yang dikonfirmasi tidak dapat dihapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-10 border border-[#D2DCD5] rounded-[6px] text-sm font-medium text-[#55615B] hover:border-[#246B56]"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-10 bg-[#173F35] text-white rounded-[6px] text-sm font-semibold hover:bg-[#246B56] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {submitting ? "Menyimpan..." : "Ya, Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type Txn = typeof MOCK_WEIGHING_TRANSACTIONS[0]

const TXN_COLUMNS: Column<Txn>[] = [
  {
    key: "transaction_at", header: "Waktu", sortable: true,
    cell: row => <span className="text-xs text-[#55615B]">{formatDateTime(row.transaction_at)}</span>
  },
  {
    key: "member_name", header: "Anggota", sortable: true,
    cell: row => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#DDF3EC] rounded-full flex items-center justify-center shrink-0">
          <span className="text-[#173F35] text-[10px] font-bold">{getInitials(row.member_name)}</span>
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
      const badge = row.sync_status === "pending" ? "pending_sync" : mapWeighingStatus(row.status)
      return (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={badge} size="sm" />
          {row.is_offline_created && (
            <span className="text-[10px] text-[#286A9B] bg-[#EBF3F9] px-1.5 py-0.5 rounded-full">
              Offline
            </span>
          )}
        </div>
      )
    }
  },
]

export default function BankSampahPage() {
  const pendingSync = summary.pendingSync
  const totalBalance = MOCK_LEDGER.reduce((s, l) => {
    const member = MOCK_USERS.find(u => u.id === l.member_id)
    return member ? s : s
  }, 0)

  return (
    <div className="space-y-6">
      {/* ── ANSWER BANNER ── */}
      <AnswerBanner
        answer={`Operasional Bank Sampah · Berat Bersih ${formatKg(summary.totalNet)} dari ${summary.totalCount} Transaksi`}
        subtext={
          pendingSync > 0
            ? `${pendingSync} transaksi tersimpan lokal dan siap disinkronkan ke server pusat`
            : "Semua data penimbangan telah tersinkronisasi realtime ke server pusat"
        }
        icon={Scale}
        variant="dark"
        actions={
          <div className="flex items-center gap-2">
            {pendingSync > 0 && (
              <button
                onClick={() => alert("Membuka drawer antrean sinkronisasi")}
                className="px-3 py-1.5 bg-[#FBF1DF] text-[#A86712] border border-[#F3DFBD] hover:bg-[#F5E5C9] text-xs font-semibold rounded-[6px] flex items-center gap-1.5 transition-colors shadow-sm"
                title="Buka antrean sinkronisasi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {pendingSync} Menunggu Sinkron
              </button>
            )}
            <button className="px-3 py-1.5 bg-[#DDF3EC] text-[#173F35] text-xs font-semibold rounded-[6px] hover:bg-[#CBECE2] flex items-center gap-1.5 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" />
              Laporan
            </button>
          </div>
        }
      />

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Berat Bersih Hari Ini"
          value={summary.totalNet.toFixed(1)}
          unit="kg"
          icon={Scale}
          emphasis={true}
          trend={{ value: 12, direction: "up", period: "vs kemarin" }}
          source="dari weighing_items.net"
          updatedAt="08.32"
        />
        <KpiCard
          label="Transaksi Hari Ini"
          value={summary.totalCount}
          unit="transaksi"
          icon={Package}
          source="dari weighing_transactions"
          updatedAt="08.32"
        />
        <KpiCard
          label="Saldo Ledger Anggota"
          value="47.060"
          unit="Rp"
          icon={Wallet}
          source="dihitung dari ledger · bukan angka manual"
          footer={
            <span className="text-[11px] text-[#55615B]">
              💡 dihitung dari ledger · bukan angka manual
            </span>
          }
        />
        <KpiCard
          label="Antrean Sinkronisasi"
          value={pendingSync}
          unit="item"
          icon={RefreshCw}
          emphasis={pendingSync > 0}
          source="dari sync outbox"
          footer={
            pendingSync > 0
              ? <span className="text-[11px] text-[#A86712] font-semibold">⚠ {pendingSync} menunggu</span>
              : <span className="text-[11px] text-[#3D9274]">✓ Tersinkron</span>
          }
        />
      </div>

      {/* ── GRID FORM + TABLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weighing form (span 7) */}
        <div className="lg:col-span-7">
          <WeighingForm />
        </div>

        {/* Transaction list (span 5) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[6px] border border-[#D2DCD5] p-6">
            <h2 className="font-bold text-[#1E2925] mb-4">Riwayat Transaksi</h2>
            <div className="space-y-2">
              {MOCK_WEIGHING_TRANSACTIONS.slice(0, 5).map(tx => {
                const badge = tx.sync_status === "pending" ? "pending_sync" : mapWeighingStatus(tx.status)
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-[#D2DCD5] last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#1E2925]">{tx.member_name}</div>
                      <div className="text-[11px] text-[#55615B]">{timeAgo(tx.transaction_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#1E2925]">{formatKg(tx.total_net)}</div>
                      <div className="text-[11px] text-[#55615B]">{formatRupiah(tx.total_value)}</div>
                    </div>
                    <StatusBadge status={badge} size="sm" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full transaction table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#1E2925]">Semua Transaksi</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D2DCD5] rounded-[6px] text-xs font-medium text-[#55615B] hover:border-[#246B56] hover:text-[#246B56] transition-colors">
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>
        </div>
        <DataTable
          columns={TXN_COLUMNS}
          data={MOCK_WEIGHING_TRANSACTIONS}
          keyExtractor={r => r.id}
          searchKeys={["member_name"]}
          searchPlaceholder="Cari anggota..."
          emptyTitle="Belum ada transaksi"
          emptyAction={{ label: "Catat Penimbangan Baru", onClick: () => {} }}
        />
      </section>
    </div>
  )
}
