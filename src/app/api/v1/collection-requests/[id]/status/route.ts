import { NextRequest } from "next/server";
import { CollectionStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadCollection, collectionInclude, serializeCollection } from "@/server/services/collections";
import { canTransition, COLLECTION_TRANSITIONS } from "@/server/services/collection-permissions";
import { writeAudit } from "@/server/audit";

export const PATCH = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ status?: unknown; reason?: unknown }>(req);
  const next = String(body.status ?? "");
  if (!Object.values(CollectionStatus).includes(next as CollectionStatus)) {
    throw new HttpError(400, "VALIDATION_ERROR", "Status tidak valid", { allowed: COLLECTION_TRANSITIONS });
  }

  const collection = await loadCollection(id);
  if (!canTransition(user, collection, next)) {
    throw new HttpError(403, "INVALID_TRANSITION", `Tidak boleh mengubah ${collection.status} → ${next}`);
  }

  const updated = await prisma.collectionRequest.update({
    where: { id },
    data: {
      status: next as CollectionStatus,
      status_changed_at: new Date(),
      ...(body.reason ? { notes: body.reason } : {}),
    },
    include: collectionInclude,
  });
  await writeAudit({ actorId: user.id, action: "UPDATE_COLLECTION_STATUS", entityType: "collection_request", entityId: id, before: { status: collection.status }, after: { status: next, reason: body.reason ?? null }, req });
  return ok(serializeCollection(updated, user));
});
