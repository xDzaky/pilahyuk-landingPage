"use client";

import { useState } from "react";
import { Search, UserCheck, UserX, Shield, Mail, Phone } from "lucide-react";
import { AnswerBanner } from "@/components/dashboard/AnswerBanner";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  org_name?: string;
  status: "active" | "suspended" | "pending";
  joined_at: string;
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Budi Santoso", email: "operator@banksampah.id", phone: "08123456789", role: "operator_bank_sampah", org_name: "Bank Sampah Berkah Jaya", status: "active", joined_at: "2024-01-15" },
  { id: "u2", name: "Siti Rahayu", email: "pengurus@komunitas.id", phone: "08234567890", role: "pengurus_komunitas", org_name: "Komunitas Hijau Nusantara", status: "active", joined_at: "2024-02-20" },
  { id: "u3", name: "Ahmad Fauzi", email: "ahmad@warga.id", role: "anggota_komunitas", org_name: "Komunitas Hijau Nusantara", status: "active", joined_at: "2024-03-01" },
  { id: "u4", name: "Dewi Lestari", email: "dewi@warga.id", role: "anggota_komunitas", status: "pending", joined_at: "2024-11-10" },
  { id: "u5", name: "Rudi Hartono", email: "rudi@warga.id", role: "anggota_komunitas", status: "suspended", joined_at: "2024-04-15" },
  { id: "u6", name: "Fitri Handayani", email: "fitri@warga.id", role: "anggota_komunitas", org_name: "EcoWarriors Surabaya", status: "active", joined_at: "2024-05-20" },
  { id: "u7", name: "Super Admin", email: "admin@pilahyuk.id", role: "super_admin", status: "active", joined_at: "2024-01-01" },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  operator_bank_sampah: "Operator Bank Sampah",
  pengurus_komunitas: "Pengurus Komunitas",
  anggota_komunitas: "Anggota",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-[#DDF3EC] text-[#173F35]",
  suspended: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  suspended: "Ditangguhkan",
  pending: "Menunggu",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <AnswerBanner
        compact
        answer={`${MOCK_USERS.length} pengguna terdaftar · ${MOCK_USERS.filter(u => u.status === "pending").length} menunggu verifikasi · ${MOCK_USERS.filter(u => u.status === "suspended").length} ditangguhkan`}
        icon={Users}
        variant="dark"
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Pengguna", value: MOCK_USERS.length },
          { label: "Aktif", value: MOCK_USERS.filter(u => u.status === "active").length },
          { label: "Menunggu", value: MOCK_USERS.filter(u => u.status === "pending").length },
          { label: "Ditangguhkan", value: MOCK_USERS.filter(u => u.status === "suspended").length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E1E8E3] rounded-2xl px-4 py-3">
            <div className="text-xs text-[#66736D] mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-[#1E2925]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterBar onFilter={() => {}} onSort={() => {}} />
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E1E8E3] rounded-xl text-sm focus:outline-none focus:border-[#3D9274] bg-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3D9274] text-[#1E2925]"
        >
          <option value="all">Semua Peran</option>
          <option value="super_admin">Super Admin</option>
          <option value="operator_bank_sampah">Operator</option>
          <option value="pengurus_komunitas">Pengurus</option>
          <option value="anggota_komunitas">Anggota</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3D9274] text-[#1E2925]"
        >
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Pengguna</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Peran</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Organisasi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Bergabung</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8E3]">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-[#F6F8F5] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-[#1E2925]">{user.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-xs text-[#66736D]">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1 text-xs text-[#66736D]">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#66736D]" />
                    <span className="text-[#1E2925]">{ROLE_LABELS[user.role] || user.role}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#66736D]">
                  {user.org_name || <span className="text-[#E1E8E3]">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[user.status]}`}>
                    {STATUS_LABELS[user.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#66736D] text-xs">{user.joined_at}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {user.status === "pending" && (
                      <button className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#DDF3EC] text-[#173F35] rounded-lg text-xs font-semibold hover:bg-[#246B56] hover:text-white transition-colors">
                        <UserCheck className="w-3.5 h-3.5" />
                        Verifikasi
                      </button>
                    )}
                    {user.status === "active" && user.role !== "super_admin" && (
                      <button className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                        <UserX className="w-3.5 h-3.5" />
                        Tangguhkan
                      </button>
                    )}
                    {user.status === "suspended" && (
                      <button className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#DDF3EC] text-[#173F35] rounded-lg text-xs font-semibold hover:bg-[#246B56] hover:text-white transition-colors">
                        <UserCheck className="w-3.5 h-3.5" />
                        Aktifkan
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#66736D]">
            Tidak ada pengguna yang sesuai filter
          </div>
        )}
        <div className="px-4 py-3 border-t border-[#E1E8E3] bg-[#F6F8F5] text-xs text-[#66736D]">
          Menampilkan {filtered.length} dari {MOCK_USERS.length} pengguna
        </div>
      </div>
    </div>
  );
}
