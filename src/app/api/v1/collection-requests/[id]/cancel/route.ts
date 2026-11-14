import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadCollection, collectionInclude, serializeCollection } from "@/server/services/collections";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ reason?: unknown }>(req);
  const collection = await loadCollection(id);

  const staff = ["operator_bank_sampah", "pengurus_komunitas"].includes(user.role) && user.org_id === collection.organization_id;
  const owner = collection.requester_id === user.id;
  if (user.role !== "super_admin" && !staff && !owner) throw new HttpError(403, "FORBIDDEN", "Tidak berhak membatalkan permintaan ini");
  if (["completed", "cancelled"].includes(collection.status)) throw new HttpError(409, "CONFLICT", "Permintaan sudah selesai/dibatalkan");

  const reason = body.reason ? String(body.reason).trim() : "";
  const updated = await prisma.collectionRequest.update({
    where: { id },
    data: {
      status: "cancelled",
      status_changed_at: new Date(),
      notes: reason ? `${collection.notes ? collection.notes + "\n" : ""}Dibatalkan: ${reason}` : collection.notes,
    },
    include: collectionInclude,
  });
  await writeAudit({ actorId: user.id, action: "CANCEL_COLLECTION", entityType: "collection_request", entityId: id, before: { status: collection.status }, after: { status: "cancelled", reason }, req });
  return ok(serializeCollection(updated, user));
});
