import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { Prisma, BatchStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, parsePagination, meta, num } from "@/server/http";
import { requireAuth, requireOrgAccess } from "@/server/auth/current-user";
import { batchInclude, serializeBatch, EVENT_STATUS } from "@/server/services/batches";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest) => {
  await requireAuth(req);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const organizationId = searchParams.get("organization_id");
  const q = searchParams.get("q")?.trim();
  const materialId = searchParams.get("material_id");

  const where: Prisma.MaterialBatchWhereInput = {
    ...(status && Object.values(BatchStatus).includes(status as BatchStatus) ? { status: status as BatchStatus } : {}),
    ...(organizationId ? { origin_org_id: organizationId } : {}),
    ...(materialId ? { material_id: materialId } : {}),
    ...(q ? { OR: [{ code: { contains: q, mode: "insensitive" } }, { origin_org: { name: { contains: q, mode: "insensitive" } } }] } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.materialBatch.count({ where }),
    prisma.materialBatch.findMany({
      where, include: { material: true, origin_org: true, _count: { select: { events: true } } },
      orderBy: { created_at: "desc" }, skip, take: perPage,
    }),
  ]);

  return ok(rows.map((b) => ({
    id: b.id, code: b.code, status: b.status, quantity_kg: num(b.quantity),
    material: { id: b.material.id, name: b.material.name },
    origin_org: { id: b.origin_org.id, name: b.origin_org.name, type: b.origin_org.type },
    event_count: b._count.events, created_at: b.created_at,
  })), meta(page, perPage, total));
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  if (!["operator_bank_sampah", "pengurus_komunitas", "super_admin"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Peran Anda tidak dapat membuat batch");
  }
  const body = await readJson<Record<string, unknown>>(req);
  const originOrgId = String(body.origin_org_id ?? user.org_id ?? "").trim();
  const materialId = String(body.material_id ?? "").trim();
  const quantity = Number(body.quantity ?? body.quantity_kg ?? 0);
  if (!originOrgId) throw new HttpError(400, "VALIDATION_ERROR", "origin_org_id wajib diisi");
  if (!materialId) throw new HttpError(400, "VALIDATION_ERROR", "material_id wajib diisi");
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100000) {
    throw new HttpError(400, "VALIDATION_ERROR", "quantity harus > 0");
  }
  await requireOrgAccess(user, originOrgId);
  const material = await prisma.material.findUnique({ where: { id: materialId }, select: { id: true } });
  if (!material) throw new HttpError(400, "VALIDATION_ERROR", "Material tidak ditemukan");

  const now = new Date();
  const dateCode = now.toISOString().slice(0, 10).replace(/-/g, "");
  const org = await prisma.organization.findUnique({ where: { id: originOrgId }, select: { name: true } });
  const short = (org?.name ?? "ORG").replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || "ORG";
  const code = `PY-${dateCode}-${short}-${randomBytes(2).toString("hex").toUpperCase()}`;

  const batch = await prisma.materialBatch.create({
    data: {
      code,
      qr_token: randomBytes(18).toString("base64url"),
      origin_org_id: originOrgId,
      material_id: materialId,
      quantity,
      status: "dibuat",
      status_changed_at: now,
      events: {
        create: {
          event_type: "dikumpulkan",
          actor_org_id: originOrgId,
          actor_user_id: user.id,
          payload: { weight: quantity },
        },
      },
    },
    include: batchInclude,
  });
  await writeAudit({ actorId: user.id, action: "CREATE_BATCH", entityType: "material_batch", entityId: batch.id, after: { code, quantity, origin_org_id: originOrgId }, req });
  return ok(serializeBatch(batch), undefined, 201);
});
