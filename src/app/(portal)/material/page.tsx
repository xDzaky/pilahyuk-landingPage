"use client";

import { useMemo } from "react";
import { Package, Search } from "lucide-react";
import { AnswerBanner } from "@/components/dashboard/AnswerBanner";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { ErrorState } from "@/components/dashboard/EmptyState";
import { useApi, formatNumber } from "@/lib/api/use-api";

interface Me { id: string; name: string; role: string; org_id: string | null; org_name: string | null }
interface Material {
  id: string; name: string; category: string; description: string | null; prep_guide: string | null;
  current_price?: number | null; price_valid_from?: string | null; accepted?: boolean | null; conditions?: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  plastik_pet: "Plastik PET", plastik_lain: "Plastik lain", kertas: "Kertas", kardus: "Kardus",
  logam: "Logam", kaca: "Kaca", organik: "Organik", b3: "B3", lainnya: "Lainnya",
};

export default function MaterialPage() {
  const me = useApi<Me>("/api/v1/me");
  const orgId = me.data?.org_id ?? null;
  const materials = useApi<Material[]>(orgId ? `/api/v1/materials?organization_id=${orgId}` : "/api/v1/materials");

  const rows = useMemo(() => materials.data ?? [], [materials.data]);
  const priced = rows.filter((m) => typeof m.current_price === "number").length;

  const columns: Column<Material>[] = [
    {
      key: "name", header: "Material", sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-[#1E2925]">{row.name}</div>
          <div className="text-[11px] text-[#66736D]">{CATEGORY_LABEL[row.category] ?? row.category}</div>
        </div>
      ),
    },
    {
      key: "prep_guide", header: "Cara menyiapkan", className: "max-w-[260px]",
      cell: (row) => <span className="text-xs text-[#66736D] line-clamp-2">{row.prep_guide ?? "—"}</span>,
    },
    {
      key: "current_price", header: "Harga aktif / kg", sortable: true,
      cell: (row) => row.current_price === null || row.current_price === undefined
        ? <span className="text-xs text-[#66736D]">Belum diatur</span>
        : <span className="font-semibold text-[#173F35]">Rp {formatNumber(row.current_price)}</span>,
    },
    {
      key: "accepted", header: "Diterima",
      cell: (row) => row.accepted === null || row.accepted === undefined
        ? <span className="text-xs text-[#66736D]">—</span>
        : row.accepted
          ? <span className="rounded-full bg-[#DDF3EC] px-2 py-0.5 text-[11px] font-semibold text-[#173F35]">Diterima</span>
          : <span className="rounded-full bg-[#FCEBEB] px-2 py-0.5 text-[11px] font-semibold text-[#B54747]">Tidak diterima</span>,
    },
  ];

  if (me.error || materials.error) {
    return <ErrorState description={me.error ?? materials.error ?? undefined} onRetry={() => { me.reload(); materials.reload(); }} />;
  }

  return (
    <div className="space-y-6">
      <AnswerBanner
        icon={Package}
        answer={me.data?.org_name
          ? `${rows.length} material terdaftar · ${priced} punya harga aktif untuk ${me.data.org_name}`
          : `${rows.length} material terdaftar di katalog PilahYuk`}
        subtext="Harga diambil dari harga yang berlaku saat ini. Perubahan harga tidak mengubah transaksi lama karena setiap timbangan menyimpan snapshot harga."
      />

      <div className="rounded-[16px] border border-[#E1E8E3] bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-xs text-[#66736D]">
          <Search className="h-4 w-4" aria-hidden="true" />
          Cari material atau cara penyiapan. Data dari tabel <code className="rounded bg-[#F6F8F5] px-1">materials</code> + <code className="rounded bg-[#F6F8F5] px-1">material_prices</code>.
        </div>
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(row) => row.id}
          isLoading={materials.loading || me.loading}
          searchPlaceholder="Cari material..."
          searchKeys={["name", "category", "prep_guide"]}
          emptyTitle="Belum ada material"
          emptyDescription="Tambahkan material dan harga lewat admin."
          pageSize={20}
        />
      </div>
    </div>
  );
}
