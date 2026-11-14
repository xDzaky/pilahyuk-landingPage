import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, num } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { requireOrgAccess } from "@/server/auth/current-user";
import { loadTransactionForUser } from "@/server/services/waste-bank";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  await loadTransactionForUser(id, user);

  const adjustments = await prisma.transactionAdjustment.findMany({
    where: { original_transaction_id: id },
    include: { ledger_entries: true },
    orderBy: { created_at: "asc" },
  });

  return ok(adjustments.map((a) => ({
    id: a.id,
    original_transaction_id: a.original_transaction_id,
    reason: a.reason,
    actor_id: a.actor_id,
    created_at: a.created_at,
    ledger_entries: a.ledger_entries.map((entry) => ({
      id: entry.id, entry_type: entry.entry_type, amount: num(entry.amount), balance_after: num(entry.balance_after),
    })),
    note: "Koreksi ini tidak mengubah transaksi asal. Saldo dihitung ulang dari ledger.",
  })), { total: adjustments.length });
});

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  if (!["operator_bank_sampah", "super_admin"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Hanya operator bank sampah yang dapat membuat koreksi");
  }
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ reason?: unknown; amount_kg_delta?: unknown; amount_idr_delta?: unknown }>(req);
  const reason = String(body.reason ?? "").trim();
  if (!reason) throw new HttpError(400, "VALIDATION_ERROR", "Alasan koreksi wajib diisi");

  const trx = await loadTransactionForUser(id, user);
  await requireOrgAccess(user, trx.organization_id);

  const kgDelta = body.amount_kg_delta !== undefined ? Number(body.amount_kg_delta) : 0;
  const idrDelta = body.amount_idr_delta !== undefined ? Number(body.amount_idr_delta) : 0;
  if (!Number.isFinite(kgDelta) || !Number.isFinite(idrDelta)) {
    throw new HttpError(400, "VALIDATION_ERROR", "amount_kg_delta/amount_idr_delta harus angka");
  }
  if (kgDelta === 0 && idrDelta === 0) throw new HttpError(400, "VALIDATION_ERROR", "Isi minimal salah satu delta");

  const result = await prisma.$transaction(async (tx) => {
    const adjustment = await tx.transactionAdjustment.create({
      data: { original_transaction_id: id, reason, actor_id: user.id },
    });
    const balanceAgg = await tx.ledgerEntry.aggregate({ where: { member_id: trx.member_id }, _sum: { amount: true } });
    const balance = Number(balanceAgg._sum.amount ?? 0) + idrDelta;
    const entry = await tx.ledgerEntry.create({
      data: {
        member_id: trx.member_id,
        adjustment_id: adjustment.id,
        entry_type: "adjustment",
        amount: idrDelta,
        balance_after: balance,
        actor_id: user.id,
      },
    });
    await tx.weighingTransaction.update({ where: { id }, data: { status: "adjusted", status_changed_at: new Date() } });
    return { adjustment, entry };
  });

  await writeAudit({ actorId: user.id, action: "CREATE_ADJUSTMENT", entityType: "transaction_adjustment", entityId: result.adjustment.id, before: { transaction_id: id }, after: { reason, amount_kg_delta: kgDelta, amount_idr_delta: idrDelta }, req });

  return ok({
    id: result.adjustment.id,
    original_transaction_id: id,
    reason,
    amount_kg_delta: kgDelta,
    amount_idr_delta: idrDelta,
    ledger_entry: { id: result.entry.id, amount: num(result.entry.amount), balance_after: num(result.entry.balance_after) },
    created_at: result.adjustment.created_at,
    note: "Koreksi ini tidak mengubah transaksi asal.",
  }, undefined, 201);
});
