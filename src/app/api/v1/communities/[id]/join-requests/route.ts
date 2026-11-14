import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));

  if (["operator_bank_sampah", "collector", "recycler"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Peran operasional tidak dapat mengajukan join komunitas");
  }
  const org = await prisma.organization.findFirst({ where: { id, type: "community", status: "verified", deleted_at: null }, select: { id: true } });
  if (!org) throw new HttpError(404, "NOT_FOUND", "Komunitas tidak ditemukan");

  const existing = await prisma.organizationMember.findFirst({ where: { organization_id: id, user_id: user.id } });
  if (existing) throw new HttpError(409, "CONFLICT", `Status keanggotaan: ${existing.status}`);

  const role = await prisma.role.findUnique({ where: { name: user.role === "volunteer" ? "Volunteer" : "Resident" } });
  if (!role) throw new HttpError(500, "INTERNAL_ERROR", "Role dasar belum di-seed");

  const membership = await prisma.organizationMember.create({
    data: { organization_id: id, user_id: user.id, role_id: role.id, status: "pending" },
  });
  await writeAudit({ actorId: user.id, action: "JOIN_REQUEST", entityType: "organization_member", entityId: membership.id, after: { organization_id: id }, req });
  return ok({ id: membership.id, organization_id: id, status: membership.status }, undefined, 201);
});
