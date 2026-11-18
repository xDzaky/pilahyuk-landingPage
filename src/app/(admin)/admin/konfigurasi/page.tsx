"use client";

import { Settings, Bell, Shield, Database, Globe, Smartphone } from "lucide-react";
import { useState } from "react";

export default function AdminKonfigurasiPage() {
  const [maxBatchKg, setMaxBatchKg] = useState("500");
  const [minWithdrawal, setMinWithdrawal] = useState("10000");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-[6px] px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Konfigurasi Platform</div>
          <div className="text-white font-semibold">Atur parameter operasional platform yang berlaku untuk semua organisasi.</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Operational Config */}
        <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-5 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E2925]">
            <Settings className="w-4 h-4 text-[#3D9274]" />
            Parameter Operasional
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#55615B] block mb-1.5">Berat Maksimum per Batch (kg)</label>
              <input type="number" value={maxBatchKg} onChange={(e) => setMaxBatchKg(e.target.value)}
                className="w-full border border-[#D2DCD5] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#55615B] block mb-1.5">Minimum Penarikan Saldo (Rp)</label>
              <input type="number" value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)}
                className="w-full border border-[#D2DCD5] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#55615B] block mb-1.5">Masa Berlaku Penjemputan (hari)</label>
              <input type="number" defaultValue="7"
                className="w-full border border-[#D2DCD5] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-5 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E2925]">
            <Bell className="w-4 h-4 text-[#3D9274]" />
            Notifikasi
          </div>
          <div className="space-y-4">
            {[
              { label: "Notifikasi WA (Fonnte)", key: "wa", enabled: notifEnabled },
              { label: "Notifikasi Verifikasi Org Baru", key: "org_verify", enabled: true },
              { label: "Alert Sengketa Baru", key: "dispute", enabled: true },
              { label: "Laporan Mingguan Otomatis", key: "weekly", enabled: false },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-[#1E2925]">{item.label}</span>
                <button
                  onClick={() => {}}
                  className={`w-10 h-5 rounded-full transition-colors relative ${item.enabled ? "bg-[#3D9274]" : "bg-[#D2DCD5]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-5 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E2925]">
            <Shield className="w-4 h-4 text-[#3D9274]" />
            Keamanan
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#55615B] block mb-1.5">Masa Berlaku Token (jam)</label>
              <input type="number" defaultValue="8"
                className="w-full border border-[#D2DCD5] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#55615B] block mb-1.5">Rate Limit Login (per menit)</label>
              <input type="number" defaultValue="5"
                className="w-full border border-[#D2DCD5] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white border border-[#D2DCD5] rounded-[6px] p-5 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1E2925]">
            <Database className="w-4 h-4 text-[#3D9274]" />
            Informasi Sistem
          </div>
          <div className="space-y-3">
            {[
              { label: "Versi Dashboard", value: "2.0.0" },
              { label: "Database", value: "PostgreSQL (Neon)" },
              { label: "Storage", value: "Cloudflare R2" },
              { label: "Cache", value: "Upstash Redis" },
              { label: "API Version", value: "v1" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-[#55615B]">{item.label}</span>
                <span className="font-semibold text-[#1E2925] font-mono text-xs">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#173F35] text-white rounded-[6px] text-sm font-semibold hover:bg-[#246B56] transition-colors"
        >
          {saved ? "✓ Tersimpan" : "Simpan Konfigurasi"}
        </button>
      </div>
    </div>
  );
}
