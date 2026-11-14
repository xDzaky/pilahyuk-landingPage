import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { HttpError } from "@/server/http";
import type { AuthUser } from "@/server/auth/current-user";

export const disputeInclude = {
  reporter: { select: { id: true, name: true } },
  collection_request: { select: { id: true, organization_id: true, requester_id: true } },
} satisfies Prisma.DisputeInclude;

export type DisputeWithRelations = Prisma.DisputeGetPayload<{ include: typeof disputeInclude }>;

export async function relatedOrganizationId(dispute: {
  related_type: string;
  related_id: string;
  collection_request?: { organization_id: string } | null;
}): Promise<string | null> {
  if (dispute.related_type === "collection") {
    if (dispute.collection_request) return dispute.collection_request.organization_id;
    const collection = await prisma.collectionRequest.findUnique({ where: { id: dispute.related_id }, select: { organization_id: true } });
    return collection?.organization_id ?? null;
  }
  if (dispute.related_type === "transaction") {
    const trx = await prisma.weighingTransaction.findUnique({ where: { id: dispute.related_id }, select: { organization_id: true } });
    return trx?.organization_id ?? null;
  }
  if (dispute.related_type === "batch") {
    const batch = await prisma.materialBatch.findUnique({ where: { id: dispute.related_id }, select: { origin_org_id: true } });
    return batch?.origin_org_id ?? null;
  }
  if (dispute.related_type === "content") {
    const content = await prisma.culturalContent.findUnique({ where: { id: dispute.related_id }, select: { organization_id: true } });
    return content?.organization_id ?? null;
  }
  return null;
}

export function serializeDispute(dispute: DisputeWithRelations) {
  return {
    id: dispute.id,
    reporter: dispute.reporter,
    related_type: dispute.related_type,
    related_id: dispute.related_id,
    collection_request_id: dispute.collection_request_id,
    reason: dispute.reason,
    category: dispute.category,
    status: dispute.status,
    assigned_to: dispute.assigned_to,
    resolution: dispute.resolution,
    created_at: dispute.created_at,
    resolved_at: dispute.resolved_at,
  };
}

export async function assertDisputeStakeholder(user: AuthUser, dispute: DisputeWithRelations): Promise<boolean> {
  if (user.role === "super_admin") return true;
  if (dispute.reporter_id === user.id) return true;
  const orgId = await relatedOrganizationId(dispute);
  if (orgId && user.org_id === orgId && ["operator_bank_sampah", "pengurus_komunitas"].includes(user.role)) {
    return true;
  }
  // Pengurus komunitas boleh menangani sengketa anggota komunitasnya.
  if (user.role === "pengurus_komunitas" && user.org_id) {
    const membership = await prisma.organizationMember.findFirst({
      where: { organization_id: user.org_id, user_id: dispute.reporter_id, status: "active" },
      select: { id: true },
    });
    if (membership) return true;
  }
  return false;
}

export async function loadDispute(id: string): Promise<DisputeWithRelations> {
  const dispute = await prisma.dispute.findUnique({ where: { id }, include: disputeInclude });
  if (!dispute) throw new HttpError(404, "NOT_FOUND", "Sengketa tidak ditemukan");
  return dispute;
}
