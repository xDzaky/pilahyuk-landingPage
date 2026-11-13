"use client";

import { useState } from "react";
import { Download, TrendingUp, FileText, Calendar } from "lucide-react";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { TrendChart } from "@/components/charts/TrendChart";

const TREND_DATA = [
  { label: "1 Nov", value: 42 },
  { label: "5 Nov", value: 65 },
  { label: "8 Nov", value: 38 },
  { label: "10 Nov", value: 91 },
  { label: "12 Nov", value: 55 },
  { label: "13 Nov", value: 73 },
  { label: "14 Nov", value: 48, estimated: true },
  { label: "15 Nov", value: 60, estimated: true },
];

const MATERIAL_DATA = [
  { label: "Kertas HVS", value: 520 },
  { label: "Kardus", value: 380 },
  { label: "Plastik PET", value: 220 },
  { label: "Logam", value: 85 },
];

export default function LaporanPage() {
  const [period, setPeriod] = useState("2024-11");

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Laporan Bank Sampah</div>
          <div className="text-white font-semibold">
            November 2024: 1.205 kg terkumpul dari 47 anggota aktif. Nilai ekonomi Rp 2,41 juta.
          </div>
        </div>
      </div>

      {/* Period & download */}
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#66736D]" />
          <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
            className="border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
        </div>
        <div className="ml-auto flex gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-[#E1E8E3] rounded-xl text-sm text-[#66736D] bg-white hover:bg-[#F6F8F5]">
            <Download className="w-4 h-4" />
            Unduh CSV
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-[#E1E8E3] rounded-xl text-sm text-[#66736D] bg-white hover:bg-[#F6F8F5]">
            <FileText className="w-4 h-4" />
            Unduh PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Transaksi", value: "156", emphasis: false },
          { label: "Total Berat", value: "1.205 kg", emphasis: true },
          { label: "Nilai Ekonomi", value: "Rp 2,41 jt", emphasis: false },
          { label: "Anggota Aktif", value: "47", emphasis: false },
        ].map((kpi) => (
          <div key={kpi.label} className={`border rounded-2xl px-4 py-3 ${kpi.emphasis ? "border-[#173F35] bg-[#173F35]" : "border-[#E1E8E3] bg-white"}`}>
            <div className={`text-xs mb-1 ${kpi.emphasis ? "text-[#DDF3EC]" : "text-[#66736D]"}`}>{kpi.label}</div>
            <div className={`text-2xl font-bold ${kpi.emphasis ? "text-white" : "text-[#1E2925]"}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <TrendChart
          data={TREND_DATA}
          title="Volume Harian"
          question="Bagaimana tren setoran selama bulan ini?"
          unit="kg"
        />
        <CategoryBarChart
          data={MATERIAL_DATA}
          title="Per Material"
          question="Material apa yang paling banyak terkumpul?"
          unit="kg"
        />
      </div>

      {/* Top members */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E1E8E3] bg-[#F6F8F5]">
          <div className="text-sm font-semibold text-[#1E2925]">Top 5 Anggota — Berat Terbanyak</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E1E8E3]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Anggota</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Berat (kg)</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Nilai (Rp)</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Transaksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8E3]">
            {[
              { rank: 1, name: "Ahmad Fauzi", weight: 48.2, value: 96400, tx: 8 },
              { rank: 2, name: "Dewi Lestari", weight: 35.1, value: 70200, tx: 6 },
              { rank: 3, name: "Rudi Hartono", weight: 28.7, value: 57400, tx: 5 },
              { rank: 4, name: "Fitri Handayani", weight: 22.4, value: 44800, tx: 4 },
              { rank: 5, name: "Hendra Gunawan", weight: 19.8, value: 39600, tx: 3 },
            ].map((m) => (
              <tr key={m.rank} className="hover:bg-[#F6F8F5]">
                <td className="px-4 py-3">
                  <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${m.rank === 1 ? "bg-[#173F35] text-white" : "bg-[#F6F8F5] text-[#66736D]"}`}>
                    {m.rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-[#1E2925]">{m.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#1E2925]">{m.weight.toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-[#173F35] font-semibold">{m.value.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-right text-[#66736D]">{m.tx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
