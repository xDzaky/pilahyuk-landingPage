import { NextRequest } from "next/server";
import { route, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadCollection, canViewCollection, serializeCollection } from "@/server/services/collections";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const collection = await loadCollection(id);
  if (!canViewCollection(user, collection)) throw new HttpError(403, "FORBIDDEN", "Anda tidak berhak melihat permintaan ini");
  return ok(serializeCollection(collection, user));
});
