import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError, num } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const { searchParams } = new URL(req.url);

  const member = await prisma.organizationMember.findFirst({ where: { organization_id: id, user_id: user.id, status: "active" } });
  if (user.role !== "super_admin" && user.org_id !== id && !member) {
    throw new HttpError(403, "FORBIDDEN", "Anda bukan anggota organisasi ini");
  }

  const period = searchParams.get("period") ?? "30d";
  const now = new Date();
  const start = period === "90d" ? new Date(now.getTime() - 90 * 86400000)
    : period === "month" ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    : new Date(now.getTime() - 30 * 86400000);

  const [transactions, members, collections, batches, contents] = await Promise.all([
    prisma.weighingTransaction.findMany({
      where: { organization_id: id, transaction_at: { gte: start }, status: { in: ["confirmed", "adjusted"] } },
      include: { items: { include: { material: true } } },
    }),
    prisma.organizationMember.count({ where: { organization_id: id, status: "active" } }),
    prisma.collectionRequest.count({ where: { organization_id: id, status: "completed", requested_at: { gte: start } } }),
    prisma.materialBatch.aggregate({ where: { origin_org_id: id, created_at: { gte: start } }, _count: { id: true }, _sum: { quantity: true } }),
    prisma.culturalContent.count({ where: { organization_id: id, status: "approved" } }),
  ]);

  let weight = 0;
  let value = 0;
  const byMaterial = new Map<string, { material: string; weight_kg: number; value_idr: number }>();
  for (const trx of transactions) {
    for (const item of trx.items) {
      const current = byMaterial.get(item.material_id) ?? { material: item.material.name, weight_kg: 0, value_idr: 0 };
      current.weight_kg += num(item.net);
      current.value_idr += num(item.value);
      weight += num(item.net);
      value += num(item.value);
      byMaterial.set(item.material_id, current);
    }
  }

  const metric = (key: string, label: string, value: number, unit: string, source: string, verified: boolean) => ({
    key, label, value, unit, source, verified,
    method: verified ? "dihitung dari transaksi terverifikasi" : "estimasi",
    period,
  });

  return ok({
    organization_id: id,
    period,
    period_start: start,
    metrics: [
      metric("material_weight", "Material terkumpul", Number(weight.toFixed(3)), "kg", "weighing_transactions", true),
      metric("material_value", "Nilai setoran", Number(value.toFixed(2)), "IDR", "weighing_transactions", true),
      metric("active_members", "Anggota aktif", members, "orang", "organization_members", true),
      metric("collections_completed", "Pickup selesai", collections, "permintaan", "collection_requests", true),
      metric("batches", "Batch dibuat", batches._count.id, "batch", "material_batches", true),
      metric("batch_weight", "Berat batch", num(batches._sum.quantity), "kg", "material_batches", true),
      metric("cultural_contents", "Konten budaya tayang", contents, "konten", "cultural_contents", true),
    ],
    by_material: [...byMaterial.values()].sort((a, b) => b.weight_kg - a.weight_kg),
  });
});
