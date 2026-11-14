import { NextRequest } from "next/server";
import { route, ok } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadBatch } from "@/server/services/batches";

export const GET = route(async (req: NextRequest, context) => {
  await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const batch = await loadBatch(id);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  return ok({
    code: batch.code,
    qr_token: batch.qr_token,
    url: `${base}/batch?code=${encodeURIComponent(batch.code)}`,
    payload: JSON.stringify({ code: batch.code, token: batch.qr_token }),
  });
});
