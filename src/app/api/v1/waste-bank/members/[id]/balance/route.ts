import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, num } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { assertLedgerAccess } from "@/server/services/waste-bank";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  await assertLedgerAccess(user, id);

  const aggregate = await prisma.ledgerEntry.aggregate({
    where: { member_id: id },
    _sum: { amount: true },
    _max: { created_at: true },
  });

  return ok({
    member_id: id,
    balance_idr: num(aggregate._sum.amount),
    computed_from: "SUM(ledger_entries.amount)",
    last_entry_at: aggregate._max.created_at,
    currency: "IDR",
  });
});
