import { NextRequest } from "next/server";
import { route, ok } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadTransactionForUser, serializeTransaction } from "@/server/services/waste-bank";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const trx = await loadTransactionForUser(id, user);
  return ok(serializeTransaction(trx));
});
