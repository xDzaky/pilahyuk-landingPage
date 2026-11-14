import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError, num } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { requireOrgAccess } from "@/server/auth/current-user";
import { periodRange } from "@/server/services/waste-bank";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  if (!["operator_bank_sampah", "super_admin"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Hanya operator bank sampah yang dapat melihat laporan");
  }
  const { period } = await (context.params ?? Promise.resolve({ period: "" }));
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organization_id") || user.org_id || "";
  if (!organizationId) throw new HttpError(400, "VALIDATION_ERROR", "organization_id wajib diisi");
  await requireOrgAccess(user, organizationId);

  const { start, end, type } = periodRange(period);
  const transactions = await prisma.weighingTransaction.findMany({
    where: {
      organization_id: organizationId,
      transaction_at: { gte: start, lt: end },
      status: { in: ["confirmed", "adjusted"] },
    },
    include: { items: { include: { material: true } } },
  });

  const byMaterial = new Map<string, { material: string; weight_kg: number; value_idr: number }>();
  let totalWeight = 0;
  let totalValue = 0;
  const members = new Set<string>();
  for (const trx of transactions) {
    members.add(trx.member_id);
    for (const item of trx.items) {
      const key = item.material_id;
      const entry = byMaterial.get(key) ?? { material: item.material.name, weight_kg: 0, value_idr: 0 };
      entry.weight_kg += num(item.net);
      entry.value_idr += num(item.value);
      totalWeight += num(item.net);
      totalValue += num(item.value);
      byMaterial.set(key, entry);
    }
  }

  return ok({
    period,
    period_type: type,
    org_id: organizationId,
    summary: {
      total_transactions: transactions.length,
      total_weight_kg: Number(totalWeight.toFixed(3)),
      total_value_idr: Number(totalValue.toFixed(2)),
      unique_members: members.size,
    },
    by_material: [...byMaterial.values()].sort((a, b) => b.weight_kg - a.weight_kg),
    generated_at: new Date().toISOString(),
    source: "weighing_transactions (confirmed/adjusted)",
  });
});
