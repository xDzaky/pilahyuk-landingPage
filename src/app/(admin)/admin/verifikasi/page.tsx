"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, X } from "lucide-react";
import { AnswerBanner } from "@/components/dashboard/AnswerBanner";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ErrorState } from "@/components/dashboard/EmptyState";
import { useApi, apiSend, formatDate } from "@/lib/api/use-api";

interface Org {
  id: string; name: string; type: string; status: string;
  area_name: string | null; member_count: number; created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  community: "Komunitas", waste_bank: "Bank Sampah", collector: "Pengumpul",
  recycler: "Pengolah", artisan: "Perajin", school: "Sekolah",
};

export default function VerifikasiPage() {
  const orgs = useApi<Org[]>("/api/v1/admin/organizations?status=pending_verification&per_page=100");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => orgs.data ?? [], [orgs.data]);

  const decide = async (id: string, action: "approve" | "reject") => {
    setBusy(id); setMessage(null);
    try {
      const reason = action === "reject" ? (window.prompt("Alasan penolakan (wajib):") ?? "").trim() : "";
      if (action === "reject" && !reason) { setMessage("Alasan penolakan wajib diisi."); return; }
      await apiSend(`/api/v1/admin/organizations/${id}/verify`, "POST", { action, ...(reason ? { reason } : {}) });
      setMessage(action === "approve" ? "Organisasi diverifikasi." : "Organisasi ditolak.");
      orgs.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Aksi gagal");
    } finally {
      setBusy(null);
    }
  };

  const columns: Column<Org>[] = [
    { key: "name", header: "Organisasi", sortable: true, cell: (row) => (
      <div><div className="font-semibold text-[#1E2925]">{row.name}</div><div className="text-[11px] text-[#55615B]">{row.id}</div></div>
    )},
    { key: "type", header: "Tipe", cell: (row) => <span className="text-xs text-[#55615B]">{TYPE_LABEL[row.type] ?? row.type}</span> },
    { key: "area_name", header: "Wilayah", cell: (row) => <span className="text-xs text-[#55615B]">{row.area_name ?? "—"}</span> },
    { key: "member_count", header: "Anggota", sortable: true, cell: (row) => <span className="text-sm">{row.member_count}</span> },
    { key: "created_at", header: "Diajukan", sortable: true, cell: (row) => <span className="text-xs text-[#55615B]">{formatDate(row.created_at)}</span> },
    { key: "actions", header: "Aksi", className: "text-right", cell: (row) => (
      <div className="flex justify-end gap-1">
        <button disabled={busy === row.id} onClick={() => decide(row.id, "approve")} className="inline-flex items-center gap-1 rounded-lg bg-[#DDF3EC] px-2.5 py-1 text-[11px] font-semibold text-[#173F35] disabled:opacity-50"><Check className="h-3 w-3" />Verifikasi</button>
        <button disabled={busy === row.id} onClick={() => decide(row.id, "reject")} className="inline-flex items-center gap-1 rounded-lg bg-[#FCEBEB] px-2.5 py-1 text-[11px] font-semibold text-[#B54747] disabled:opacity-50"><X className="h-3 w-3" />Tolak</button>
      </div>
    )},
  ];

  if (orgs.error) return <ErrorState description={orgs.error} onRetry={orgs.reload} />;

  return (
    <div className="space-y-6">
      <AnswerBanner
        icon={BadgeCheck}
        answer={`${rows.length} organisasi menunggu verifikasi`}
        subtext="Periksa identitas, wilayah, dan kontak sebelum menyetujui. Setiap keputusan tercatat di audit log."
      />
      {message ? <div className="rounded-[6px] border border-[#D2DCD5] bg-white px-4 py-2 text-sm text-[#246B56]">{message}</div> : null}
      <div className="rounded-[6px] border border-[#D2DCD5] bg-white p-4">
        <DataTable columns={columns} data={rows} keyExtractor={(row) => row.id} isLoading={orgs.loading}
          searchPlaceholder="Cari organisasi..." searchKeys={["name", "area_name"]}
          emptyTitle="Tidak ada antrean verifikasi" emptyDescription="Semua organisasi sudah ditinjau." pageSize={20} />
      </div>
    </div>
  );
}
