import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { HttpError, num } from "@/server/http";
import type { AuthUser } from "@/server/auth/current-user";

export const batchInclude = {
  material: true,
  origin_org: true,
  events: { orderBy: { occurred_at: "asc" as const } },
} satisfies Prisma.MaterialBatchInclude;

export type BatchWithRelations = Prisma.MaterialBatchGetPayload<{ include: typeof batchInclude }>;

export function serializeBatch(batch: BatchWithRelations) {
  return {
    id: batch.id,
    code: batch.code,
    qr_token: batch.qr_token,
    status: batch.status,
    quantity_kg: num(batch.quantity),
    material: { id: batch.material.id, name: batch.material.name, category: batch.material.category },
    origin_org: { id: batch.origin_org.id, name: batch.origin_org.name, type: batch.origin_org.type },
    created_at: batch.created_at,
    updated_at: batch.updated_at,
    events: batch.events.map((event) => ({
      id: event.id,
      event_type: event.event_type,
      occurred_at: event.occurred_at,
      actor_org_id: event.actor_org_id,
      actor_user_id: event.actor_user_id,
      payload: event.payload,
      evidence_url: event.evidence_id,
    })),
  };
}

export const ORIGIN_EVENTS = ["dikumpulkan", "ditimbang", "digabung", "diserahkan"] as const;
export const RECEIVER_EVENTS = ["diterima", "ditolak", "diproses", "residu", "dipakai_ulang"] as const;

export const EVENT_STATUS: Record<string, string> = {
  dikumpulkan: "dibuat",
  ditimbang: "dibuat",
  digabung: "dibuat",
  diserahkan: "diserahkan",
  diterima: "diterima",
  ditolak: "ditolak",
  diproses: "diproses",
  residu: "residu",
  dipakai_ulang: "dipakai_ulang",
};

export function canAddBatchEvent(user: AuthUser, batch: BatchWithRelations, eventType: string): boolean {
  if (user.role === "super_admin") return true;
  if (ORIGIN_EVENTS.includes(eventType as never)) {
    return ["operator_bank_sampah", "pengurus_komunitas"].includes(user.role) && user.org_id === batch.origin_org_id;
  }
  if (RECEIVER_EVENTS.includes(eventType as never)) {
    return user.role === "recycler";
  }
  return false;
}

export async function loadBatch(idOrCode: string): Promise<BatchWithRelations> {
  const batch = await prisma.materialBatch.findFirst({
    where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
    include: batchInclude,
  });
  if (!batch) throw new HttpError(404, "NOT_FOUND", "Batch tidak ditemukan");
  return batch;
}
