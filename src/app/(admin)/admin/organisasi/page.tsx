"use client";

import { useState } from "react";
import { Search, Building2, CheckCircle, Clock, XCircle, Eye } from "lucide-react";

interface Org {
  id: string;
  name: string;
  type: "bank_sampah" | "komunitas";
  status: "verified" | "pending_review" | "rejected";
  city: string;
  member_count: number;
  contact_email: string;
  created_at: string;
  pic_name?: string;
}

const MOCK_ORGS: Org[] = [
  { id: "org-001", name: "Bank Sampah Berkah Jaya", type: "bank_sampah", status: "verified", city: "Jakarta Selatan", member_count: 234, contact_email: "admin@berkah.id", created_at: "2024-01-15", pic_name: "Budi Santoso" },
  { id: "org-002", name: "Komunitas Hijau Nusantara", type: "komunitas", status: "verified", city: "Bandung", member_count: 89, contact_email: "info@hijaunusantara.id", created_at: "2024-02-20", pic_name: "Siti Rahayu" },
  { id: "org-003", name: "EcoWarriors Surabaya", type: "komunitas", status: "pending_review", city: "Surabaya", member_count: 12, contact_email: "eco@surabaya.id", created_at: "2024-11-10", pic_name: "Ahmad Basri" },
  { id: "org-004", name: "Recycle Indonesia Timur", type: "bank_sampah", status: "pending_review", city: "Makassar", member_count: 5, contact_email: "recycle@timur.id", created_at: "2024-11-12", pic_name: "Haris Maulana" },
  { id: "org-005", name: "Lingkungan Bersih Palembang", type: "komunitas", status: "rejected", city: "Palembang", member_count: 0, contact_email: "lb@palembang.id", created_at: "2024-10-05" },
];

const STATUS_CONFIG = {
  verified: { icon: CheckCircle, label: "Terverifikasi", cls: "text-[#173F35] bg-[#DDF3EC]" },
  pending_review: { icon: Clock, label: "Menunggu Review", cls: "text-amber-700 bg-amber-50" },
  rejected: { icon: XCircle, label: "Ditolak", cls: "text-red-700 bg-red-50" },
};

const TYPE_LABELS = { bank_sampah: "Bank Sampah", komunitas: "Komunitas" };

export default function AdminOrganisasiPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Org | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const filtered = MOCK_ORGS.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !search || o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = MOCK_ORGS.filter((o) => o.status === "pending_review");

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Manajemen Organisasi</div>
          <div className="text-white font-semibold">
            {pending.length > 0
              ? `${pending.length} organisasi menunggu verifikasi — tinjau sebelum mereka bisa beroperasi.`
              : "Semua organisasi telah diverifikasi. Pantau aktivitas dan kepatuhan rutin."}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Organisasi", value: MOCK_ORGS.length, icon: Building2 },
          { label: "Menunggu Verifikasi", value: pending.length, icon: Clock },
          { label: "Terverifikasi", value: MOCK_ORGS.filter(o => o.status === "verified").length, icon: CheckCircle },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E1E8E3] rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F6F8F5] flex items-center justify-center">
              <s.icon className="w-4 h-4 text-[#3D9274]" />
            </div>
            <div>
              <div className="text-xs text-[#66736D]">{s.label}</div>
              <div className="text-xl font-bold text-[#1E2925]">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending queue — prioritized */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Antrean Verifikasi ({pending.length})
          </div>
          <div className="space-y-2">
            {pending.map((org) => (
              <div key={org.id} className="bg-white border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#1E2925] text-sm">{org.name}</div>
                  <div className="text-xs text-[#66736D]">
                    {TYPE_LABELS[org.type]} · {org.city} · Mendaftar {org.created_at}
                  </div>
                  <div className="text-xs text-[#66736D]">PIC: {org.pic_name} · {org.contact_email}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setSelected(org); setAction("reject"); }}
                    className="px-3 py-1.5 border border-red-200 text-red-700 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => { setSelected(org); setAction("approve"); }}
                    className="px-3 py-1.5 bg-[#173F35] text-white rounded-xl text-xs font-semibold hover:bg-[#246B56] transition-colors"
                  >
                    Verifikasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter + Table */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
          <input
            type="text"
            placeholder="Cari nama organisasi atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E1E8E3] rounded-xl text-sm focus:outline-none focus:border-[#3D9274] bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3D9274]"
        >
          <option value="all">Semua Status</option>
          <option value="verified">Terverifikasi</option>
          <option value="pending_review">Menunggu</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E1E8E3] bg-[#F6F8F5]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Organisasi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Tipe</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Kota</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Anggota</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8E3]">
            {filtered.map((org) => {
              const cfg = STATUS_CONFIG[org.status];
              return (
                <tr key={org.id} className="hover:bg-[#F6F8F5] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#1E2925]">{org.name}</div>
                    <div className="text-xs text-[#66736D]">{org.contact_email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#66736D]">{TYPE_LABELS[org.type]}</td>
                  <td className="px-4 py-3 text-[#66736D]">{org.city}</td>
                  <td className="px-4 py-3 font-semibold text-[#1E2925]">{org.member_count}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
                      <cfg.icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#E1E8E3] text-[#66736D] rounded-lg text-xs hover:bg-[#F6F8F5] transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      {selected && action && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#E1E8E3] max-w-md w-full p-6">
            <div className="text-base font-semibold text-[#1E2925] mb-2">
              {action === "approve" ? "Verifikasi Organisasi" : "Tolak Organisasi"}
            </div>
            <div className="text-sm text-[#66736D] mb-4">
              {action === "approve"
                ? `Organisasi "${selected.name}" akan diaktifkan dan dapat beroperasi di platform.`
                : `Organisasi "${selected.name}" akan ditolak dan tidak dapat beroperasi.`}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setSelected(null); setAction(null); }}
                className="px-4 py-2 border border-[#E1E8E3] text-[#66736D] rounded-xl text-sm hover:bg-[#F6F8F5]"
              >
                Batal
              </button>
              <button
                onClick={() => { setSelected(null); setAction(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white ${action === "approve" ? "bg-[#173F35] hover:bg-[#246B56]" : "bg-red-600 hover:bg-red-700"}`}
              >
                {action === "approve" ? "Ya, Verifikasi" : "Ya, Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
