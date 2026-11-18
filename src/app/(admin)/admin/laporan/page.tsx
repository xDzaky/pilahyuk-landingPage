"use client";

import { TrendingUp, Users, Weight, Package } from "lucide-react";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";

export default function AdminLaporanPage() {
  const materialData = [
    { label: "Kertas HVS", value: 520, color: "#173F35" },
    { label: "Plastik PET", value: 380, color: "#246B56" },
    { label: "Kardus", value: 220, color: "#3D9274" },
    { label: "Logam", value: 180, color: "#55615B" },
    { label: "Aluminium", value: 42, color: "#DDF3EC" },
  ];

  const orgTypeData = [
    { label: "Bank Sampah", value: 15, color: "#173F35" },
    { label: "Komunitas", value: 8, color: "#3D9274" },
  ];

  const batchStatusData = [
    { label: "Selesai", value: 42, color: "#173F35" },
    { label: "Dijemput", value: 8, color: "#246B56" },
    { label: "Terjadwal", value: 5, color: "#3D9274" },
    { label: "Dibuat", value: 3, color: "#55615B" },
  ];

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-[6px] px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Laporan Platform</div>
          <div className="text-white font-semibold">November 2024: 1.342 kg sampah terpilah, Rp 2,48 juta nilai ekonomi, 847 anggota aktif di 23 organisasi.</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Berat (bulan ini)", value: "1.342 kg", icon: Weight, emphasis: true },
          { label: "Nilai Ekonomi", value: "Rp 2,48 jt", icon: TrendingUp, emphasis: false },
          { label: "Anggota Aktif", value: "847", icon: Users, emphasis: false },
          { label: "Total Batch", value: "58", icon: Package, emphasis: false },
        ].map((kpi) => (
          <div key={kpi.label} className={`border rounded-[6px] px-4 py-3 ${kpi.emphasis ? "border-[#173F35] bg-[#173F35]" : "border-[#D2DCD5] bg-white"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center ${kpi.emphasis ? "bg-[#DDF3EC]/20" : "bg-[#F6F8F5]"}`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.emphasis ? "text-[#DDF3EC]" : "text-[#3D9274]"}`} />
              </div>
              <span className={`text-xs font-medium ${kpi.emphasis ? "text-[#DDF3EC]" : "text-[#55615B]"}`}>{kpi.label}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.emphasis ? "text-white" : "text-[#1E2925]"}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <CategoryBarChart
          data={materialData}
          title="Volume per Material"
          question="Material apa yang paling banyak terkumpul bulan ini?"
          unit="kg"
        />
        <StatusDonutChart
          data={batchStatusData}
          title="Status Batch"
          question="Berapa batch yang sudah selesai vs masih berjalan?"
          centerValue="58"
          centerLabel="Total"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatusDonutChart
          data={orgTypeData}
          title="Tipe Organisasi"
          question="Komposisi bank sampah vs komunitas di platform"
          centerValue="23"
          centerLabel="Org Aktif"
        />
        {/* Export section */}
        <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-4">
          <div className="text-xs text-[#55615B] font-medium uppercase tracking-wide mb-2">Ekspor Laporan</div>
          <div className="space-y-2">
            {[
              { label: "Laporan Bulanan November 2024", fmt: "CSV" },
              { label: "Data Transaksi Timbang", fmt: "CSV" },
              { label: "Ringkasan Dampak Lingkungan", fmt: "PDF" },
            ].map((item) => (
              <button key={item.label} className="w-full flex items-center justify-between px-3 py-2.5 border border-[#D2DCD5] rounded-[6px] text-sm hover:bg-[#EDF1EC] transition-colors">
                <span className="text-[#1E2925]">{item.label}</span>
                <span className="text-xs font-semibold text-[#3D9274] border border-[#D2DCD5] px-2 py-0.5 rounded-lg">{item.fmt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
