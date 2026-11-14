import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadCollection, collectionInclude, serializeCollection } from "@/server/services/collections";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ collector_org_id?: unknown }>(req);
  const collectorId = String(body.collector_org_id ?? "").trim();
  if (!collectorId) throw new HttpError(400, "VALIDATION_ERROR", "collector_org_id wajib diisi");

  const collection = await loadCollection(id);
  const allowed = user.role === "super_admin" ||
    (["operator_bank_sampah", "pengurus_komunitas"].includes(user.role) && user.org_id === collection.organization_id);
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Hanya pengurus organisasi ini yang dapat menugaskan pengumpul");
  if (["completed", "cancelled"].includes(collection.status)) throw new HttpError(409, "CONFLICT", "Permintaan sudah selesai/dibatalkan");

  const collector = await prisma.organization.findFirst({
    where: { id: collectorId, type: "collector", status: "verified", deleted_at: null },
    select: { id: true },
  });
  if (!collector) throw new HttpError(404, "NOT_FOUND", "Organisasi pengumpul tidak ditemukan atau belum terverifikasi");

  const existing = await prisma.collectionAssignment.findFirst({ where: { collection_request_id: id, collector_id: collectorId } });
  if (existing) {
    await prisma.collectionAssignment.update({ where: { id: existing.id }, data: { status: "assigned", assigned_at: new Date() } });
  } else {
    await prisma.collectionAssignment.create({ data: { collection_request_id: id, collector_id: collectorId, status: "assigned" } });
  }

  const updated = await prisma.collectionRequest.update({
    where: { id },
    data: { status: "assigned", status_changed_at: new Date() },
    include: collectionInclude,
  });
  await writeAudit({ actorId: user.id, action: "ASSIGN_COLLECTOR", entityType: "collection_request", entityId: id, after: { collector_org_id: collectorId }, req });
  return ok(serializeCollection(updated, user));
});
