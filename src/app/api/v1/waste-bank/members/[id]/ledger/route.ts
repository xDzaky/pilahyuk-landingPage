import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, num } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { assertLedgerAccess } from "@/server/services/waste-bank";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  await assertLedgerAccess(user, id);

  const entries = await prisma.ledgerEntry.findMany({
    where: { member_id: id },
    include: {
      transaction: { include: { items: { include: { material: true } } } },
      adjustment: true,
    },
    orderBy: { created_at: "asc" },
  });

  const balance = entries.reduce((sum, entry) => sum + num(entry.amount), 0);

  return ok({
    member_id: id,
    entries: entries.map((entry) => ({
      id: entry.id,
      entry_type: entry.entry_type,
      amount: num(entry.amount),
      balance_after: num(entry.balance_after),
      transaction_id: entry.transaction_id,
      adjustment_id: entry.adjustment_id,
      transaction: entry.transaction
        ? {
            id: entry.transaction.id,
            transaction_at: entry.transaction.transaction_at,
            status: entry.transaction.status,
            items: entry.transaction.items.map((item) => ({
              material_name: item.material.name,
              net: num(item.net),
              price_snapshot: num(item.price_snapshot),
              value: num(item.value),
            })),
          }
        : null,
      adjustment: entry.adjustment
        ? { id: entry.adjustment.id, reason: entry.adjustment.reason, created_at: entry.adjustment.created_at }
        : null,
      notes: entry.adjustment?.reason ?? (entry.entry_type === "deposit" ? "Setoran timbang" : entry.entry_type),
      created_at: entry.created_at,
    })),
    computed_balance_idr: balance,
  }, { total: entries.length, computed_from: "sum(ledger_entries.amount)" });
});
