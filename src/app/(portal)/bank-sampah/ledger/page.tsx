"use client";

import { useState } from "react";
import { Download, TrendingUp, Calendar, Package } from "lucide-react";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";

const MOCK_LEDGER = [
  { id: "led-001", date: "2024-11-01", material: "Kertas HVS", weight_kg: 5.2, price_snapshot: 2000, credit: 10400, debit: 0, balance: 10400, ref: "TRX-001", type: "deposit" },
  { id: "led-002", date: "2024-11-05", material: "Plastik PET", weight_kg: 3.1, price_snapshot: 3000, credit: 9300, debit: 0, balance: 19700, ref: "TRX-002", type: "deposit" },
  { id: "led-003", date: "2024-11-08", material: "—", weight_kg: 0, price_snapshot: 0, credit: 0, debit: 15000, balance: 4700, ref: "WD-001", type: "withdrawal" },
  { id: "led-004", date: "2024-11-10", material: "Kardus", weight_kg: 8.5, price_snapshot: 1000, credit: 8500, debit: 0, balance: 13200, ref: "TRX-003", type: "deposit" },
  { id: "led-005", date: "2024-11-12", material: "Logam Campuran", weight_kg: 2.3, price_snapshot: 1000, credit: 2300, debit: 0, balance: 15500, ref: "TRX-004", type: "deposit" },
];

const materialData = [
  { label: "Kertas HVS", value: 5.2 },
  { label: "Plastik PET", value: 3.1 },
  { label: "Kardus", value: 8.5 },
  { label: "Logam", value: 2.3 },
];

export default function LedgerPage() {
  const [period, setPeriod] = useState("2024-11");
  const totalCredit = MOCK_LEDGER.reduce((s, e) => s + e.credit, 0);
  const totalDebit = MOCK_LEDGER.reduce((s, e) => s + e.debit, 0);
  const computedBalance = totalCredit - totalDebit;

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Buku Tabungan</div>
          <div className="text-white font-semibold">
            Saldo Rp {computedBalance.toLocaleString("id-ID")} dari {MOCK_LEDGER.filter(e => e.type === "deposit").length} setoran dan {MOCK_LEDGER.filter(e => e.type === "withdrawal").length} penarikan bulan ini.
          </div>
        </div>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E1E8E3] rounded-2xl px-4 py-3">
          <div className="text-xs text-[#66736D] mb-1">Total Setoran</div>
          <div className="text-xl font-bold text-[#173F35]">Rp {totalCredit.toLocaleString("id-ID")}</div>
        </div>
        <div className="bg-white border border-[#E1E8E3] rounded-2xl px-4 py-3">
          <div className="text-xs text-[#66736D] mb-1">Total Penarikan</div>
          <div className="text-xl font-bold text-[#1E2925]">Rp {totalDebit.toLocaleString("id-ID")}</div>
        </div>
        <div className="border border-[#173F35] bg-[#173F35] rounded-2xl px-4 py-3">
          <div className="text-xs text-[#DDF3EC] mb-1">Saldo (dari ledger)</div>
          <div className="text-xl font-bold text-white">Rp {computedBalance.toLocaleString("id-ID")}</div>
          <div className="text-[10px] text-[#DDF3EC]/70 mt-0.5">Dihitung dari akumulasi, bukan field tersimpan</div>
        </div>
      </div>

      {/* Chart + controls */}
      <div className="grid grid-cols-2 gap-4">
        <CategoryBarChart
          data={materialData}
          title="Volume per Material"
          question="Material apa yang paling banyak disetorkan bulan ini?"
          unit="kg"
        />
        <div className="bg-white border border-[#E1E8E3] rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#66736D] font-medium uppercase tracking-wide mb-3">Filter & Ekspor</div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-[#66736D] block mb-1">Periode</label>
                <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
              </div>
            </div>
          </div>
          <button className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E1E8E3] rounded-xl text-sm text-[#66736D] hover:bg-[#F6F8F5]">
            <Download className="w-4 h-4" />
            Unduh Buku Tabungan (CSV)
          </button>
        </div>
      </div>

      {/* Ledger table */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E1E8E3] bg-[#F6F8F5]">
          <div className="text-sm font-semibold text-[#1E2925]">Riwayat Transaksi</div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E1E8E3]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Tanggal</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Jenis</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Material</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Berat</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Masuk</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Keluar</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Saldo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8E3]">
            {MOCK_LEDGER.map((entry) => (
              <tr key={entry.id} className="hover:bg-[#F6F8F5]">
                <td className="px-4 py-3 text-xs text-[#66736D]">{entry.date}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${entry.type === "deposit" ? "bg-[#DDF3EC] text-[#173F35]" : "bg-red-50 text-red-700"}`}>
                    {entry.type === "deposit" ? "Setoran" : "Penarikan"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#1E2925]">{entry.material}</td>
                <td className="px-4 py-3 text-right text-[#66736D] text-xs">
                  {entry.weight_kg > 0 ? `${entry.weight_kg} kg` : "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-[#173F35]">
                  {entry.credit > 0 ? `Rp ${entry.credit.toLocaleString("id-ID")}` : "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-red-700">
                  {entry.debit > 0 ? `Rp ${entry.debit.toLocaleString("id-ID")}` : "—"}
                </td>
                <td className="px-4 py-3 text-right font-bold text-[#1E2925]">
                  Rp {entry.balance.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[#66736D]">{entry.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
