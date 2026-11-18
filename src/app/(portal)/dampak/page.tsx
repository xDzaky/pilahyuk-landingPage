// src/app/(portal)/dampak/page.tsx
// Dashboard Dampak Personal — Resident/Member
"use client"

import { AnswerBanner } from "@/components/dashboard/AnswerBanner"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { StatusBadge, mapCollectionStatus } from "@/components/dashboard/StatusBadge"
import { FilterBar } from "@/components/dashboard/FilterBar"
import { formatRupiah, formatKg, formatDate } from "@/lib/utils"
import {
  MOCK_WEIGHING_TRANSACTIONS, MOCK_COLLECTION_REQUESTS,
  MOCK_IMPACT, MOCK_EVENTS
} from "@/lib/mock-data"
import { BarChart2, Package, Calendar, Award, Info } from "lucide-react"
import { useState } from "react"

// Only show data for current user (usr-004 as demo)
const MY_ID = "usr-004"
const myTxns = MOCK_WEIGHING_TRANSACTIONS.filter(t => t.member_id === MY_ID)
const myCollections = MOCK_COLLECTION_REQUESTS.filter(c => c.requester_id === MY_ID)
const myTotalNet = myTxns.reduce((s, t) => s + t.total_net, 0)
const myTotalValue = myTxns.reduce((s, t) => s + t.total_value, 0)

export default function DampakPage() {
  const [period, setPeriod] = useState<"Minggu" | "Bulan" | "Kuartal">("Minggu")
  return (
    <div className="space-y-6">

      {/* ── ANSWER BANNER ── */}
      <AnswerBanner
        answer={`Kontribusimu bulan ini: ${formatKg(myTotalNet)} material terverifikasi dari ${myTxns.length} transaksi.`}
        subtext="Data hanya milikmu — privasi terjaga sepenuhnya"
        icon={BarChart2}
        variant="dark"
      />

      {/* ── KPI PERSONAL ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Material Terverifikasi"
          value={myTotalNet.toFixed(1)}
          unit="kg ✓"
          icon={Package}
          emphasis={true}
          trend={{ value: 15, direction: "up", period: "vs bulan lalu" }}
          source="dari weighing_transactions"
          updatedAt="08.32"
        />
        <KpiCard
          label="Jumlah Transaksi"
          value={myTxns.length}
          unit="transaksi"
          icon={BarChart2}
          source="dari weighing_transactions"
          updatedAt="08.32"
        />
        <KpiCard
          label="Kegiatan Diikuti"
          value={2}
          unit="kegiatan"
          icon={Calendar}
          source="dari event_registrations"
          updatedAt="07.00"
        />
        <KpiCard
          label="Poin Partisipasi"
          value={340}
          unit="poin"
          icon={Award}
          source="dari challenge_participants"
          footer={
            <span className="text-[11px] text-[#55615B]">
              💡 Poin = pengakuan partisipasi, bukan nilai uang
            </span>
          }
        />
      </div>

      {/* ── GRID 2 COL ── */}
      <FilterBar
        viewOptions={["Minggu", "Bulan", "Kuartal"]}
        activeView={period}
        onViewChange={(v) => setPeriod(v as "Minggu" | "Bulan" | "Kuartal")}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Trend chart placeholder (span 8) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[6px] border border-[#D2DCD5] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-[#1E2925]">
                Seberapa banyak yang sudah kamu pisahkan?
              </h2>
              <div className="flex gap-1">
                {["7H", "30H", "90H"].map(p => (
                  <button
                    key={p}
                    className="px-2 py-1 text-xs rounded-[4px] border border-[#D2DCD5] text-[#55615B] hover:border-[#246B56] hover:text-[#246B56] first:bg-[#DDF3EC] first:text-[#173F35] first:border-[#3D9274] transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-[#55615B] mb-4">dari transaksi terverifikasi · diperbarui 08.32</p>

            {/* Chart placeholder */}
            <div className="h-40 bg-[#F6F8F5] rounded-[6px] flex items-center justify-center">
              <span className="text-xs text-[#55615B]">
                Chart (Recharts AreaChart) — tersedia setelah install dependencies
              </span>
            </div>

            {/* Comparison bar */}
            <div className="mt-4 p-3 rounded-[6px] bg-[#F6F8F5] border border-[#D2DCD5]">
              <div className="text-xs text-[#55615B] mb-2">Perbandingan komunitas (anonim, agregat)</div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#1E2925] w-20 shrink-0">Kamu</span>
                <div className="flex-1 h-2 bg-[#D2DCD5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#3D9274] rounded-full" style={{ width: "68%" }} />
                </div>
                <span className="text-xs font-semibold text-[#173F35]">{formatKg(myTotalNet)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-[#55615B] w-20 shrink-0">Rata-rata</span>
                <div className="flex-1 h-2 bg-[#D2DCD5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D2DCD5] rounded-full" style={{ width: "45%" }} />
                </div>
                <span className="text-xs text-[#55615B]">~5.2 kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active pickup (span 4) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[6px] border border-[#D2DCD5] p-6 h-full">
            <h2 className="font-bold text-[#1E2925] mb-4">Permintaan Aktif</h2>
            {myCollections.filter(c => !["completed", "cancelled"].includes(c.status)).length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#55615B]">Tidak ada permintaan aktif</p>
                <button className="mt-3 px-4 py-2 bg-[#173F35] text-white text-xs font-semibold rounded-[6px] hover:bg-[#246B56] transition-colors">
                  Ajukan Pengumpulan
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myCollections.filter(c => !["completed", "cancelled"].includes(c.status)).map(col => (
                  <div key={col.id} className="p-3 rounded-[6px] border border-[#D2DCD5]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#1E2925]">
                        #{col.id.slice(-4)}
                      </span>
                      <StatusBadge status={mapCollectionStatus(col.status)} size="sm" />
                    </div>
                    <div className="text-xs text-[#55615B]">
                      {col.items.map(i => i.material_name).join(", ")}
                    </div>
                    {col.slot_start && (
                      <div className="text-xs text-[#246B56] mt-1 font-medium">
                        📅 {formatDate(col.slot_start, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIWAYAT TRANSAKSI ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-[#1E2925]">Riwayat Transaksi Bank Sampah</h2>
            <p className="text-xs text-[#55615B]">Hanya transaksimu · baca saja di web · transaksi baru via mobile/operator</p>
          </div>
        </div>

        <div className="bg-white rounded-[6px] border border-[#D2DCD5] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D2DCD5] bg-[#E9EDE9]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#55615B] uppercase tracking-wide">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#55615B] uppercase tracking-wide">Material</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#55615B] uppercase tracking-wide">Berat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#55615B] uppercase tracking-wide">Harga/kg</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#55615B] uppercase tracking-wide">Nilai</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#55615B] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {myTxns.map(tx => (
                tx.items.map((item, i) => (
                  <tr key={`${tx.id}-${i}`} className="border-b border-[#D2DCD5] last:border-0 hover:bg-[#EDF1EC]">
                    <td className="px-4 py-3 text-xs text-[#55615B]">
                      {i === 0 ? formatDate(tx.transaction_at, { day: "numeric", month: "short" }) : ""}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1E2925]">{item.material_name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1E2925]">{formatKg(item.net)}</td>
                    <td className="px-4 py-3 text-xs text-[#55615B]">{formatRupiah(item.price_snapshot)}</td>
                    <td className="px-4 py-3 text-sm text-[#246B56] font-semibold">{formatRupiah(item.value)}</td>
                    <td className="px-4 py-3">
                      {i === 0 && <StatusBadge status="terverifikasi" size="sm" />}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#D2DCD5] bg-[#F6F8F5] flex items-center gap-2 text-xs text-[#55615B]">
            <Info className="w-3.5 h-3.5" />
            Saldo dihitung dari ledger · total nilai: <strong className="text-[#1E2925]">{formatRupiah(myTotalValue)}</strong>
          </div>
        </div>
      </section>

      {/* ── DAMPAK KOMUNITAS ── */}
      <section>
        <h2 className="font-bold text-[#1E2925] mb-3">Dampak Terverifikasi Komunitas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_IMPACT.map(metric => (
            <div
              key={metric.key}
              className="bg-white rounded-[6px] border border-[#D2DCD5] p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs text-[#55615B] font-medium">{metric.label}</span>
                {metric.verified ? (
                  <span className="shrink-0 text-[10px] font-bold bg-[#DDF3EC] text-[#173F35] px-1.5 py-0.5 rounded-full">
                    ✓ Terverifikasi
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-bold border border-dashed border-[#55615B] text-[#55615B] px-1.5 py-0.5 rounded-full">
                    ~ Perkiraan
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-[#173F35]">
                {metric.value.toLocaleString("id-ID")}
                <span className="text-sm font-medium text-[#55615B] ml-1">{metric.unit}</span>
              </div>
              <div className="text-[11px] text-[#55615B] mt-1">
                Sumber: {metric.source} · {metric.period}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
