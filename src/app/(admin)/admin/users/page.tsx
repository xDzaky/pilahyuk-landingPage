"use client";

import { useMemo, useState } from "react";
import { Users, Copy, KeyRound, Ban, CheckCircle2 } from "lucide-react";
import { AnswerBanner } from "@/components/dashboard/AnswerBanner";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ErrorState } from "@/components/dashboard/EmptyState";
import { useApi, apiSend, formatDate } from "@/lib/api/use-api";

interface User {
  id: string; name: string; email: string | null; phone: string | null;
  role: string; org_id: string | null; status: string; contact_verified: boolean;
  created_at: string; last_login_at: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin", operator_bank_sampah: "Operator Bank Sampah",
  pengurus_komunitas: "Pengurus Komunitas", resident: "Warga", volunteer: "Relawan",
  collector: "Pengumpul", recycler: "Pengolah", curator: "Kurator",
};

export default function AdminUsersPage() {
  const users = useApi<User[]>("/api/v1/admin/users?per_page=100");
  const [busy, setBusy] = useState<string | null>(null);
  const [reset, setReset] = useState<{ name: string; token: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const rows = useMemo(() => users.data ?? [], [users.data]);

  const update = async (id: string, data: Record<string, unknown>) => {
    setBusy(id); setMessage(null);
    try { await apiSend(`/api/v1/admin/users/${id}`, "PATCH", data); users.reload(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Aksi gagal"); }
    finally { setBusy(null); }
  };

  const createReset = async (user: User) => {
    setBusy(user.id); setMessage(null);
    try {
      const result = await apiSend<{ reset_token: string }>(`/api/v1/admin/users/${user.id}/reset-token`, "POST");
      setReset({ name: user.name, token: result.reset_token });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal membuat token"); }
    finally { setBusy(null); }
  };

  const columns: Column<User>[] = [
    { key: "name", header: "Pengguna", sortable: true, cell: (row) => (
      <div><div className="font-semibold text-[#1E2925]">{row.name}</div>
        <div className="text-[11px] text-[#55615B]">{row.email ?? row.phone ?? row.id}</div></div>
    )},
    { key: "role", header: "Peran", sortable: true, cell: (row) => <span className="text-xs text-[#55615B]">{ROLE_LABEL[row.role] ?? row.role}</span> },
    { key: "status", header: "Status", cell: (row) => (
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.status === "active" ? "bg-[#DDF3EC] text-[#173F35]" : "bg-[#FCEBEB] text-[#B54747]"}`}>
        {row.status === "active" ? "Aktif" : "Ditangguhkan"}
      </span>
    )},
    { key: "contact_verified", header: "Kontak", cell: (row) => (
      <span className={`text-[11px] font-semibold ${row.contact_verified ? "text-[#246B56]" : "text-[#A86712]"}`}>
        {row.contact_verified ? "Terverifikasi" : "Belum"}
      </span>
    )},
    { key: "last_login_at", header: "Login terakhir", sortable: true, cell: (row) => <span className="text-[11px] text-[#55615B]">{formatDate(row.last_login_at)}</span> },
    { key: "actions", header: "Aksi", className: "text-right", cell: (row) => (
      <div className="flex justify-end gap-1">
        <button disabled={busy === row.id} onClick={() => createReset(row)} title="Buat token reset" className="rounded-lg border border-[#D2DCD5] p-1.5 text-[#246B56] disabled:opacity-50"><KeyRound className="h-3.5 w-3.5" /></button>
        <button disabled={busy === row.id} onClick={() => update(row.id, { status: row.status === "active" ? "suspended" : "active" })} title={row.status === "active" ? "Tangguhkan" : "Aktifkan"} className={`rounded-lg border p-1.5 disabled:opacity-50 ${row.status === "active" ? "border-[#FCEBEB] text-[#B54747]" : "border-[#DDF3EC] text-[#246B56]"}`}>
          {row.status === "active" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    )},
  ];

  if (users.error) return <ErrorState description={users.error} onRetry={users.reload} />;

  return (
    <div className="space-y-6">
      <AnswerBanner icon={Users} answer={`${rows.length} pengguna terdaftar`} subtext="Gunakan tindakan dengan hati-hati. Menangguhkan akun langsung mencabut seluruh refresh token-nya." />
      {message ? <div className="rounded-[6px] border border-[#FCEBEB] bg-[#FCEBEB]/40 px-4 py-2 text-sm text-[#B54747]">{message}</div> : null}
      {reset ? (
        <div className="rounded-[6px] border border-[#FBF1DF] bg-[#FBF1DF]/50 p-4">
          <div className="text-sm font-semibold text-[#1E2925]">Token reset untuk {reset.name}</div>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 text-xs text-[#1E2925]">{reset.token}</code>
            <button onClick={() => { navigator.clipboard.writeText(reset.token); setMessage("Token disalin."); }} className="inline-flex items-center gap-1 rounded-lg border border-[#D2DCD5] bg-white px-2 py-1.5 text-xs font-semibold text-[#246B56]"><Copy className="h-3.5 w-3.5" />Salin</button>
          </div>
          <p className="mt-2 text-[11px] text-[#55615B]">Berlaku 15 menit. Kirim ke pemilik akun lewat kanal tepercaya. Token ini tidak ditampilkan lagi.</p>
        </div>
      ) : null}
      <div className="rounded-[6px] border border-[#D2DCD5] bg-white p-4">
        <DataTable columns={columns} data={rows} keyExtractor={(row) => row.id} isLoading={users.loading}
          searchPlaceholder="Cari nama, email, atau nomor HP..." searchKeys={["name", "email", "phone", "role"]}
          emptyTitle="Belum ada pengguna" pageSize={20} />
      </div>
    </div>
  );
}
