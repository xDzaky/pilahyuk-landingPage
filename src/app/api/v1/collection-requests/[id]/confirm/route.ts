import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadCollection, collectionInclude, serializeCollection } from "@/server/services/collections";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ items?: unknown; reason?: unknown }>(req);
  const collection = await loadCollection(id);

  const staff = ["operator_bank_sampah", "pengurus_komunitas"].includes(user.role) && user.org_id === collection.organization_id;
  const collector = user.role === "collector" && collection.assignments.some((a) => a.collector_id === user.org_id);
  if (user.role !== "super_admin" && !staff && !collector) {
    throw new HttpError(403, "FORBIDDEN", "Hanya petugas terkait yang dapat mengonfirmasi serah terima");
  }
  if (!["collected", "received"].includes(collection.status) && collection.status !== "assigned") {
    throw new HttpError(409, "CONFLICT", "Permintaan belum dalam tahap serah terima");
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) throw new HttpError(400, "VALIDATION_ERROR", "items hasil timbang wajib diisi");

  await prisma.$transaction(async (tx) => {
    for (const raw of rawItems) {
      if (!raw || typeof raw !== "object") continue;
      const item = raw as Record<string, unknown>;
      const materialId = String(item.material_id ?? "");
      const actual = Number(item.actual_quantity ?? item.quantity ?? 0);
      if (!materialId || !Number.isFinite(actual) || actual < 0 || actual > 1000) {
        throw new HttpError(400, "VALIDATION_ERROR", "actual_quantity tidak valid");
      }
      await tx.collectionItem.updateMany({
        where: { collection_request_id: id, material_id: materialId },
        data: { actual_quantity: actual },
      });
    }
    await tx.collectionRequest.update({
      where: { id },
      data: { status: "received", status_changed_at: new Date(), ...(body.reason ? { notes: String(body.reason) } : {}) },
    });
  });

  const updated = await prisma.collectionRequest.findUniqueOrThrow({ where: { id }, include: collectionInclude });
  await writeAudit({ actorId: user.id, action: "CONFIRM_HANDOVER", entityType: "collection_request", entityId: id, before: { status: collection.status }, after: { status: "received" }, req });
  return ok(serializeCollection(updated, user));
});
