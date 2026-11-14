import { NextRequest } from "next/server";
import { BatchEventType } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadBatch, batchInclude, canAddBatchEvent, EVENT_STATUS, ORIGIN_EVENTS, RECEIVER_EVENTS } from "@/server/services/batches";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest, context) => {
  await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const batch = await loadBatch(id);
  return ok(batch.events, { total: batch.events.length, batch_id: batch.id });
});

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<Record<string, unknown>>(req);
  const eventType = String(body.event_type ?? "");

  if (!Object.values(BatchEventType).includes(eventType as BatchEventType)) {
    throw new HttpError(400, "VALIDATION_ERROR", "event_type tidak valid", {
      allowed: [...ORIGIN_EVENTS, ...RECEIVER_EVENTS],
    });
  }
  const batch = await loadBatch(id);
  if (!canAddBatchEvent(user, batch, eventType)) {
    throw new HttpError(403, "FORBIDDEN", "Peran Anda tidak berhak menambahkan event ini pada batch tersebut");
  }
  if (batch.status === "ditolak" && eventType === "diterima") {
    throw new HttpError(409, "CONFLICT", "Batch sudah ditolak");
  }

  const payload = {
    ...(body.weight !== undefined ? { weight: Number(body.weight) } : {}),
    ...(body.quality !== undefined ? { quality: String(body.quality) } : {}),
    ...(body.notes !== undefined ? { notes: String(body.notes) } : {}),
    ...(body.to_org_id !== undefined ? { to_org_id: String(body.to_org_id) } : {}),
    ...(body.residu_kg !== undefined ? { residu_kg: Number(body.residu_kg) } : {}),
  };
  const nextStatus = EVENT_STATUS[eventType];

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.batchEvent.create({
      data: {
        batch_id: batch.id,
        event_type: eventType as BatchEventType,
        actor_org_id: user.org_id,
        actor_user_id: user.id,
        evidence_id: body.evidence_url ? String(body.evidence_url) : null,
        payload,
      },
    });
    if (nextStatus) {
      await tx.materialBatch.update({
        where: { id: batch.id },
        data: { status: nextStatus as never, status_changed_at: new Date() },
      });
    }
    return event;
  });

  const updated = await prisma.materialBatch.findUniqueOrThrow({ where: { id: batch.id }, include: batchInclude });
  await writeAudit({ actorId: user.id, action: "ADD_BATCH_EVENT", entityType: "material_batch", entityId: batch.id, before: { status: batch.status }, after: { event_type: eventType, status: updated.status }, req });

  return ok({
    event: {
      id: result.id, event_type: result.event_type, occurred_at: result.occurred_at,
      actor_org_id: result.actor_org_id, actor_user_id: result.actor_user_id, payload: result.payload,
    },
    batch: { id: updated.id, code: updated.code, status: updated.status },
  }, undefined, 201);
});
