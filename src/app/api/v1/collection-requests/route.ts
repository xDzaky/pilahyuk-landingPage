import { NextRequest } from "next/server";
import { Prisma, CollectionMethod, CollectionStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { collectionInclude, serializeCollection } from "@/server/services/collections";
import { areaIdsWithDescendants } from "@/server/services/areas";
import { writeAudit } from "@/server/audit";

function listWhere(user: Awaited<ReturnType<typeof requireAuth>>): Prisma.CollectionRequestWhereInput {
  if (user.role === "super_admin") return {};
  if (user.role === "resident" || user.role === "volunteer") return { requester_id: user.id };
  if (user.role === "collector") {
    return {
      OR: [
        { assignments: { some: { collector_id: user.org_id ?? "__none__" } } },
        { organization_id: user.org_id ?? "__none__" },
      ],
    };
  }
  if (user.role === "operator_bank_sampah" || user.role === "pengurus_komunitas") {
    return { organization_id: user.org_id ?? "__none__" };
  }
  return { id: "__none__" };
}

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const areaId = searchParams.get("area_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.CollectionRequestWhereInput = {
    ...listWhere(user),
    ...(status && Object.values(CollectionStatus).includes(status as CollectionStatus)
      ? { status: status as CollectionStatus }
      : {}),
    ...(areaId ? { area_id: { in: await areaIdsWithDescendants(areaId) } } : {}),
    ...(from || to
      ? {
          requested_at: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.collectionRequest.count({ where }),
    prisma.collectionRequest.findMany({
      where,
      include: collectionInclude,
      orderBy: { requested_at: "desc" },
      skip,
      take: perPage,
    }),
  ]);

  return ok(rows.map((row) => serializeCollection(row, user)), meta(page, perPage, total));
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const body = await readJson<Record<string, unknown>>(req);

  const organizationId = String(body.organization_id ?? "").trim();
  const method = String(body.method ?? "individual") as CollectionMethod;
  const areaId = body.area_id ? String(body.area_id) : null;
  const address = body.address ? String(body.address).trim() : "";
  const notes = body.notes ? String(body.notes).trim() : null;
  const slotStart = body.slot_start ? new Date(String(body.slot_start)) : null;
  const slotEnd = body.slot_end ? new Date(String(body.slot_end)) : null;
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const latitude = body.latitude !== undefined && body.latitude !== null ? Number(body.latitude) : null;
  const longitude = body.longitude !== undefined && body.longitude !== null ? Number(body.longitude) : null;

  if (!organizationId) throw new HttpError(400, "VALIDATION_ERROR", "organization_id wajib diisi");
  if (!Object.values(CollectionMethod).includes(method)) throw new HttpError(400, "VALIDATION_ERROR", "method tidak valid");
  if (rawItems.length === 0 || rawItems.length > 50) throw new HttpError(400, "VALIDATION_ERROR", "items harus 1–50 baris");
  if (address && address.length < 5) {
    throw new HttpError(400, "VALIDATION_ERROR", "Alamat penjemputan minimal 5 karakter", { address: ["Minimal 5 karakter"] });
  }
  if (slotStart && Number.isNaN(slotStart.getTime())) throw new HttpError(400, "VALIDATION_ERROR", "slot_start tidak valid");
  if (slotEnd && Number.isNaN(slotEnd.getTime())) throw new HttpError(400, "VALIDATION_ERROR", "slot_end tidak valid");
  if (slotStart && slotEnd && slotEnd < slotStart) throw new HttpError(400, "VALIDATION_ERROR", "slot_end harus setelah slot_start");

  const org = await prisma.organization.findFirst({
    where: { id: organizationId, status: "verified", deleted_at: null, type: { in: ["community", "waste_bank", "collector"] } },
    select: { id: true },
  });
  if (!org) throw new HttpError(404, "NOT_FOUND", "Organisasi tujuan tidak ditemukan atau belum terverifikasi");
  if (areaId) {
    const area = await prisma.area.findUnique({ where: { id: areaId }, select: { id: true } });
    if (!area) throw new HttpError(400, "VALIDATION_ERROR", "area_id tidak ditemukan");
  }

  const items: Array<{ material_id: string; estimated_quantity: number }> = [];
  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") throw new HttpError(400, "VALIDATION_ERROR", "Item tidak valid");
    const item = raw as Record<string, unknown>;
    const materialId = String(item.material_id ?? "");
    const qty = Number(item.estimated_quantity ?? item.quantity ?? 0);
    if (!materialId || !Number.isFinite(qty) || qty <= 0 || qty > 1000) {
      throw new HttpError(400, "VALIDATION_ERROR", "material_id dan estimated_quantity (0–1000) wajib valid");
    }
    const material = await prisma.material.findUnique({ where: { id: materialId }, select: { id: true } });
    if (!material) throw new HttpError(400, "VALIDATION_ERROR", `Material ${materialId} tidak ditemukan`);
    items.push({ material_id: materialId, estimated_quantity: qty });
  }

  const collection = await prisma.collectionRequest.create({
    data: {
      requester_id: user.id,
      organization_id: organizationId,
      method,
      area_id: areaId,
      address: address || null,
      notes,
      slot_start: slotStart,
      slot_end: slotEnd,
      latitude: latitude !== null && Number.isFinite(latitude) ? latitude : null,
      longitude: longitude !== null && Number.isFinite(longitude) ? longitude : null,
      status: body.status === "draft" ? "draft" : "submitted",
      status_changed_at: new Date(),
      items: { create: items },
    },
    include: collectionInclude,
  });

  await writeAudit({ actorId: user.id, action: "CREATE_COLLECTION", entityType: "collection_request", entityId: collection.id, after: { status: collection.status, organization_id: organizationId }, req });
  return ok(serializeCollection(collection, user), undefined, 201);
});
