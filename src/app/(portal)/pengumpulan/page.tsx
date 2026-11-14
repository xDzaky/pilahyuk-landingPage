"use client";

import { useMemo, useState } from "react";
import { Truck, Play, Check, X } from "lucide-react";
import { AnswerBanner } from "@/components/dashboard/AnswerBanner";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { StatusBadge, mapCollectionStatus } from "@/components/dashboard/StatusBadge";
import { ErrorState } from "@/components/dashboard/EmptyState";
import { useApi, apiSend, formatDate } from "@/lib/api/use-api";

interface Me { id: string; role: string; org_id: string | null; org_name: string | null }
interface Collection {
  id: string; status: string; method: string; requested_at: string;
  slot_start: string | null; slot_end: string | null; area_name: string | null;
  organization_id: string; organization_name: string;
  requester: { id: string; name: string; phone?: string | null };
  address?: string | null;
  items: Array<{ material_id: string; material_name: string; estimated_quantity: number | null }>;
  assignments: Array<{ collector_id: string; collector_name: string; status: string }>;
}

export default function PengumpulanPage() {
  const me = useApi<Me>("/api/v1/me");
  const collections = useApi<Collection[]>("/api/v1/collection-requests?per_page=100");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const rows = useMemo(() => collections.data ?? [], [collections.data]);
  const waiting = rows.filter((r) => ["submitted", "confirmed", "assigned", "on_the_way", "collected"].includes(r.status)).length;

  const act = async (id: string, action: "confirm" | "on_the_way" | "collected" | "cancel") => {
    setBusy(id); setActionError(null);
    try {
      if (action === "cancel") {
        const reason = window.prompt("Alasan pembatalan (opsional):") ?? "";
        await apiSend(`/api/v1/collection-requests/${id}/cancel`, "POST", { reason });
      } else {
        const status = action === "confirm" ? "confirmed" : action === "on_the_way" ? "on_the_way" : "collected";
        await apiSend(`/api/v1/collection-requests/${id}/status`, "PATCH", { status });
      }
      collections.reload();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Aksi gagal");
    } finally {
      setBusy(null);
    }
  };

  const canManage = ["operator_bank_sampah", "pengurus_komunitas", "collector", "super_admin"].includes(me.data?.role ?? "");
  const isCollector = me.data?.role === "collector";

  const columns: Column<Collection>[] = [
    {
      key: "id", header: "Permintaan", sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-[#1E2925]">{row.requester.name}</div>
          <div className="text-[11px] text-[#66736D]">{row.id.slice(0, 8)} · {row.method} · {row.organization_name}</div>
        </div>
      ),
    },
    {
      key: "area_name", header: "Lokasi",
      cell: (row) => (
        <div className="text-xs text-[#66736D]">
          <div>{row.area_name ?? "—"}</div>
          {row.address ? <div className="max-w-[220px] truncate">{row.address}</div> : null}
        </div>
      ),
    },
    {
      key: "items", header: "Material",
      cell: (row) => (
        <div className="text-xs text-[#66736D]">
          {row.items.map((item) => `${item.material_name} ${item.estimated_quantity ?? 0} kg`).join(" · ") || "—"}
        </div>
      ),
    },
    {
      key: "slot_start", header: "Jadwal", sortable: true,
      cell: (row) => <span className="text-xs text-[#66736D]">{formatDate(row.slot_start)}</span>,
    },
    {
      key: "status", header: "Status", sortable: true,
      cell: (row) => <StatusBadge status={mapCollectionStatus(row.status)} size="sm" />,
    },
    {
      key: "actions", header: "Aksi", className: "text-right",
      cell: (row) => {
        const disabled = busy === row.id;
        return (
          <div className="flex justify-end gap-1">
            {canManage && row.status === "submitted" ? (
              <button disabled={disabled} onClick={() => act(row.id, "confirm")} className="inline-flex items-center gap-1 rounded-lg border border-[#DDF3EC] bg-[#DDF3EC] px-2.5 py-1 text-[11px] font-semibold text-[#173F35] disabled:opacity-50"><Check className="h-3 w-3" />Konfirmasi</button>
            ) : null}
            {isCollector && row.status === "assigned" ? (
              <button disabled={disabled} onClick={() => act(row.id, "on_the_way")} className="inline-flex items-center gap-1 rounded-lg border border-[#EBF3F9] bg-[#EBF3F9] px-2.5 py-1 text-[11px] font-semibold text-[#286A9B] disabled:opacity-50"><Play className="h-3 w-3" />Mulai</button>
            ) : null}
            {isCollector && row.status === "on_the_way" ? (
              <button disabled={disabled} onClick={() => act(row.id, "collected")} className="inline-flex items-center gap-1 rounded-lg border border-[#DDF3EC] bg-[#DDF3EC] px-2.5 py-1 text-[11px] font-semibold text-[#173F35] disabled:opacity-50"><Check className="h-3 w-3" />Tiba</button>
            ) : null}
            {!["completed", "cancelled"].includes(row.status) ? (
              <button disabled={disabled} onClick={() => act(row.id, "cancel")} className="inline-flex items-center gap-1 rounded-lg border border-[#FCEBEB] bg-[#FCEBEB] px-2.5 py-1 text-[11px] font-semibold text-[#B54747] disabled:opacity-50"><X className="h-3 w-3" />Batal</button>
            ) : null}
          </div>
        );
      },
    },
  ];

  if (collections.error) {
    return <ErrorState description={collections.error} onRetry={collections.reload} />;
  }

  return (
    <div className="space-y-6">
      <AnswerBanner
        icon={Truck}
        answer={`${waiting} permintaan masih berjalan · ${rows.filter((r) => r.status === "submitted").length} menunggu konfirmasi`}
        subtext={`Menampilkan permintaan yang sesuai peranmu (${me.data?.org_name ?? me.data?.role ?? "memuat…"}). Alamat hanya terlihat oleh pemilik dan petugas terkait.`}
      />
      {actionError ? (
        <div className="rounded-xl border border-[#FCEBEB] bg-[#FCEBEB]/40 px-4 py-2 text-sm text-[#B54747]">{actionError}</div>
      ) : null}
      <div className="rounded-[16px] border border-[#E1E8E3] bg-white p-4">
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(row) => row.id}
          isLoading={collections.loading}
          searchPlaceholder="Cari nama, area, atau ID..."
          searchKeys={["id", "area_name"]}
          emptyTitle="Belum ada permintaan"
          emptyDescription="Permintaan penjemputan yang masuk akan tampil di sini."
          pageSize={15}
        />
      </div>
    </div>
  );
}
