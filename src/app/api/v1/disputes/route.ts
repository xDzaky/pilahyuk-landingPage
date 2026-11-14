import { NextRequest } from "next/server";
import { DisputeCategory, DisputeStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { disputeInclude, serializeDispute } from "@/server/services/disputes";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  const where: Prisma.DisputeWhereInput = {};
  if (user.role === "super_admin") {
    // all
  } else if (user.role === "resident" || user.role === "volunteer") {
    where.reporter_id = user.id;
  } else if (["operator_bank_sampah", "pengurus_komunitas"].includes(user.role)) {
    const memberIds = (await prisma.organizationMember.findMany({
      where: { organization_id: user.org_id ?? "__none__", status: "active" },
      select: { user_id: true },
    })).map((m) => m.user_id);
    where.OR = [
      { reporter_id: { in: memberIds.length ? memberIds : ["__none__"] } },
      { collection_request: { organization_id: user.org_id ?? "__none__" } },
    ];
  } else {
    where.reporter_id = user.id;
  }
  if (status && Object.values(DisputeStatus).includes(status as DisputeStatus)) where.status = status as DisputeStatus;
  if (category && Object.values(DisputeCategory).includes(category as DisputeCategory)) where.category = category as DisputeCategory;

  const [total, rows] = await prisma.$transaction([
    prisma.dispute.count({ where }),
    prisma.dispute.findMany({ where, include: disputeInclude, orderBy: { created_at: "desc" }, skip, take: perPage }),
  ]);
  return ok(rows.map(serializeDispute), meta(page, perPage, total));
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const body = await readJson<Record<string, unknown>>(req);
  const relatedType = String(body.related_type ?? "");
  const relatedId = String(body.related_id ?? "");
  const reason = String(body.reason ?? "").trim();
  const category = String(body.category ?? "") as DisputeCategory;

  if (!["collection", "transaction", "batch", "content", "user"].includes(relatedType)) {
    throw new HttpError(400, "VALIDATION_ERROR", "related_type tidak valid");
  }
  if (!relatedId || reason.length < 5) throw new HttpError(400, "VALIDATION_ERROR", "related_id dan alasan (min 5 karakter) wajib diisi");
  if (!Object.values(DisputeCategory).includes(category)) throw new HttpError(400, "VALIDATION_ERROR", "category tidak valid");

  let collectionId: string | null = null;
  if (relatedType === "collection") {
    const collection = await prisma.collectionRequest.findUnique({ where: { id: relatedId } });
    if (!collection) throw new HttpError(404, "NOT_FOUND", "Permintaan tidak ditemukan");
    if (["resident", "volunteer"].includes(user.role) && collection.requester_id !== user.id) {
      throw new HttpError(403, "FORBIDDEN", "Anda hanya dapat menyengketakan permintaan sendiri");
    }
    collectionId = collection.id;
  } else if (relatedType === "transaction") {
    const trx = await prisma.weighingTransaction.findUnique({ where: { id: relatedId } });
    if (!trx) throw new HttpError(404, "NOT_FOUND", "Transaksi tidak ditemukan");
    if (["resident", "volunteer"].includes(user.role) && trx.member_id !== user.id) {
      throw new HttpError(403, "FORBIDDEN", "Anda hanya dapat menyengketakan transaksi sendiri");
    }
  } else if (relatedType === "batch") {
    const batch = await prisma.materialBatch.findUnique({ where: { id: relatedId } });
    if (!batch) throw new HttpError(404, "NOT_FOUND", "Batch tidak ditemukan");
  } else if (relatedType === "content") {
    const content = await prisma.culturalContent.findUnique({ where: { id: relatedId } });
    if (!content) throw new HttpError(404, "NOT_FOUND", "Konten tidak ditemukan");
  }

  const dispute = await prisma.dispute.create({
    data: {
      reporter_id: user.id,
      related_type: relatedType,
      related_id: relatedId,
      collection_request_id: collectionId,
      reason,
      category,
      status: "open",
      status_changed_at: new Date(),
    },
    include: disputeInclude,
  });
  await writeAudit({ actorId: user.id, action: "CREATE_DISPUTE", entityType: "dispute", entityId: dispute.id, after: { related_type: relatedType, related_id: relatedId, category }, req });
  return ok(serializeDispute(dispute), undefined, 201);
});
