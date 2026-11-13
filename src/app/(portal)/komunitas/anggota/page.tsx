"use client";

import { useState } from "react";
import { Users, Search, UserCheck, UserX, Shield, Mail } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "pengurus_komunitas" | "anggota_komunitas";
  status: "active" | "pending" | "suspended";
  joined_at: string;
  total_kg: number;
}

const MOCK_MEMBERS: Member[] = [
  { id: "m1", name: "Ahmad Fauzi", email: "ahmad@warga.id", role: "anggota_komunitas", status: "active", joined_at: "2024-03-01", total_kg: 48.2 },
  { id: "m2", name: "Dewi Lestari", email: "dewi@warga.id", role: "anggota_komunitas", status: "active", joined_at: "2024-04-10", total_kg: 35.1 },
  { id: "m3", name: "Rudi Hartono", email: "rudi@warga.id", role: "anggota_komunitas", status: "suspended", joined_at: "2024-04-15", total_kg: 28.7 },
  { id: "m4", name: "Fitri Handayani", email: "fitri@warga.id", role: "anggota_komunitas", status: "active", joined_at: "2024-05-20", total_kg: 22.4 },
  { id: "m5", name: "Hendra Gunawan", email: "hendra@warga.id", role: "anggota_komunitas", status: "pending", joined_at: "2024-11-11", total_kg: 0 },
  { id: "m6", name: "Siti Rahayu", email: "pengurus@komunitas.id", role: "pengurus_komunitas", status: "active", joined_at: "2024-02-20", total_kg: 0 },
];

export default function AnggotaPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = MOCK_MEMBERS.filter((m) => {
    const q = search.toLowerCase();
    return (
      (!search || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) &&
      (statusFilter === "all" || m.status === statusFilter)
    );
  });

  const pending = MOCK_MEMBERS.filter(m => m.status === "pending");

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Manajemen Anggota</div>
          <div className="text-white font-semibold">
            {pending.length > 0
              ? `${pending.length} permohonan bergabung menunggu persetujuan — tinjau sebelum mereka bisa berpartisipasi.`
              : `${MOCK_MEMBERS.filter(m => m.status === "active").length} anggota aktif. Semua permohonan telah ditangani.`}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Anggota", value: MOCK_MEMBERS.length },
          { label: "Aktif", value: MOCK_MEMBERS.filter(m => m.status === "active").length },
          { label: "Menunggu", value: pending.length },
          { label: "Ditangguhkan", value: MOCK_MEMBERS.filter(m => m.status === "suspended").length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E1E8E3] rounded-2xl px-4 py-3">
            <div className="text-xs text-[#66736D] mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-[#1E2925]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pending queue */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
          <div className="text-sm font-semibold text-amber-900 mb-2">Permohonan Bergabung ({pending.length})</div>
          {pending.map(m => (
            <div key={m.id} className="bg-white border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-[#1E2925]">{m.name}</div>
                <div className="text-xs text-[#66736D]">{m.email} · Mendaftar {m.joined_at}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-red-200 text-red-700 rounded-xl text-xs font-semibold hover:bg-red-50">
                  <UserX className="w-3.5 h-3.5 inline mr-1" />Tolak
                </button>
                <button className="px-3 py-1.5 bg-[#173F35] text-white rounded-xl text-xs font-semibold hover:bg-[#246B56]">
                  <UserCheck className="w-3.5 h-3.5 inline mr-1" />Terima
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
          <input type="text" placeholder="Cari nama atau email..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E1E8E3] rounded-xl text-sm focus:outline-none focus:border-[#3D9274] bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3D9274]">
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="pending">Menunggu</option>
          <option value="suspended">Ditangguhkan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E1E8E3] bg-[#F6F8F5]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Anggota</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Peran</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Total kg</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Bergabung</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8E3]">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-[#F6F8F5]">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#1E2925]">{m.name}</div>
                  <div className="flex items-center gap-1 text-xs text-[#66736D]">
                    <Mail className="w-3 h-3" />{m.email}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-[#66736D]">
                    <Shield className="w-3.5 h-3.5" />
                    {m.role === "pengurus_komunitas" ? "Pengurus" : "Anggota"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    m.status === "active" ? "bg-[#DDF3EC] text-[#173F35]" :
                    m.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                  }`}>
                    {m.status === "active" ? "Aktif" : m.status === "pending" ? "Menunggu" : "Ditangguhkan"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#1E2925]">{m.total_kg.toFixed(1)}</td>
                <td className="px-4 py-3 text-xs text-[#66736D]">{m.joined_at}</td>
                <td className="px-4 py-3">
                  {m.status === "active" && (
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#E1E8E3] text-[#66736D] rounded-lg text-xs hover:bg-[#F6F8F5]">
                      Lihat Detail
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
