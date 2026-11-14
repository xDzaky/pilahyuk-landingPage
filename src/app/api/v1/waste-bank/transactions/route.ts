import { NextRequest } from "next/server";
import { Prisma, WeighingStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { requireOrgAccess } from "@/server/auth/current-user";
import { createWeighingTransaction, serializeTransaction, transactionInclude } from "@/server/services/waste-bank";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const memberId = searchParams.get("member_id");
  const organizationId = searchParams.get("organization_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.WeighingTransactionWhereInput = {};
  if (user.role === "super_admin") {
    if (organizationId) where.organization_id = organizationId;
    if (memberId) where.member_id = memberId;
  } else if (user.role === "operator_bank_sampah") {
    where.organization_id = user.org_id ?? "__none__";
    if (memberId) where.member_id = memberId;
  } else if (user.role === "resident" || user.role === "volunteer") {
    where.member_id = user.id;
  } else {
    throw new HttpError(403, "FORBIDDEN", "Peran Anda tidak memiliki akses ke data bank sampah");
  }
  if (status && Object.values(WeighingStatus).includes(status as WeighingStatus)) where.status = status as WeighingStatus;
  if (from || to) where.transaction_at = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };

  const [total, rows] = await prisma.$transaction([
    prisma.weighingTransaction.count({ where }),
    prisma.weighingTransaction.findMany({
      where, include: transactionInclude, orderBy: { transaction_at: "desc" }, skip, take: perPage,
    }),
  ]);

  return ok(rows.map(serializeTransaction), meta(page, perPage, total));
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  if (!["operator_bank_sampah", "super_admin"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Hanya operator bank sampah yang dapat mencatat penimbangan");
  }
  const body = await readJson<Record<string, unknown>>(req);
  const organizationId = String(body.organization_id ?? user.org_id ?? "").trim();
  const memberId = String(body.member_id ?? "").trim();
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (!organizationId) throw new HttpError(400, "VALIDATION_ERROR", "organization_id wajib diisi");
  if (!memberId) throw new HttpError(400, "VALIDATION_ERROR", "member_id wajib diisi");
  await requireOrgAccess(user, organizationId);
  if (rawItems.length === 0) throw new HttpError(400, "VALIDATION_ERROR", "items wajib diisi");

  const items = rawItems.map((raw) => {
    const item = raw as Record<string, unknown>;
    return { material_id: String(item.material_id ?? ""), gross: Number(item.gross ?? 0), tare: Number(item.tare ?? 0) };
  });

  const idempotencyKey = req.headers.get("idempotency-key") || (body.idempotency_key ? String(body.idempotency_key) : null);
  if (idempotencyKey) {
    const existing = await prisma.syncIdempotencyKey.findUnique({ where: { key: idempotencyKey } });
    if (existing) {
      if (existing.response_reference) {
        const trx = await prisma.weighingTransaction.findUnique({ where: { id: existing.response_reference }, include: transactionInclude });
        if (trx) return ok({ ...serializeTransaction(trx), idempotent: true });
      }
      throw new HttpError(409, "CONFLICT", "Permintaan dengan Idempotency-Key ini sedang/sudah diproses");
    }
    try {
      await prisma.syncIdempotencyKey.create({
        data: { key: idempotencyKey, user_id: user.id, endpoint: "POST /waste-bank/transactions" },
      });
    } catch {
      throw new HttpError(409, "CONFLICT", "Idempotency-Key sudah dipakai");
    }
  }

  try {
    const trx = await createWeighingTransaction({
      organizationId, memberId, operatorId: user.id, items,
      deviceId: body.device_id ? String(body.device_id) : null,
      isOfflineCreated: Boolean(body.is_offline_created),
      transactionAt: body.transaction_at ? new Date(String(body.transaction_at)) : new Date(),
    });
    if (idempotencyKey) {
      await prisma.syncIdempotencyKey.update({ where: { key: idempotencyKey }, data: { response_reference: trx.id } });
    }
    await writeAudit({ actorId: user.id, action: "CREATE_TRANSACTION", entityType: "weighing_transaction", entityId: trx.id, after: { organization_id: organizationId, member_id: memberId }, req });
    return ok(serializeTransaction(trx), undefined, 201);
  } catch (error) {
    if (idempotencyKey) await prisma.syncIdempotencyKey.delete({ where: { key: idempotencyKey } }).catch(() => undefined);
    throw error;
  }
});
