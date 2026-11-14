import { NextRequest } from "next/server";
import { MemberStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

export const PATCH = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const params = await (context.params ?? Promise.resolve({ id: "", userId: "" }));
  const { id, userId } = params;
  const body = await readJson<{ status?: unknown; role_id?: unknown }>(req);

  const canManage = user.role === "super_admin" ||
    (user.role === "pengurus_komunitas" && user.org_id === id) ||
    (user.role === "operator_bank_sampah" && user.org_id === id);
  if (!canManage) throw new HttpError(403, "FORBIDDEN", "Hanya pengurus organisasi ini yang dapat mengubah anggota");

  const membership = await prisma.organizationMember.findFirst({ where: { organization_id: id, user_id: userId, deleted_at: null } });
  if (!membership) throw new HttpError(404, "NOT_FOUND", "Anggota tidak ditemukan");

  const status = body.status !== undefined ? String(body.status) : null;
  if (status && !Object.values(MemberStatus).includes(status as MemberStatus)) {
    throw new HttpError(400, "VALIDATION_ERROR", "status anggota tidak valid", { allowed: Object.values(MemberStatus) });
  }
  const roleId = body.role_id !== undefined ? String(body.role_id) : null;
  if (roleId) {
    const role = await prisma.role.findUnique({ where: { id: roleId }, select: { id: true } });
    if (!role) throw new HttpError(400, "VALIDATION_ERROR", "role_id tidak ditemukan");
  }

  const updated = await prisma.organizationMember.update({
    where: { id: membership.id },
    data: {
      ...(status ? { status: status as MemberStatus, status_changed_at: new Date(), ...(status === "active" ? { joined_at: membership.joined_at ?? new Date() } : {}) } : {}),
      ...(roleId ? { role_id: roleId } : {}),
    },
    include: { role: true, user: { select: { id: true, name: true } } },
  });
  await writeAudit({ actorId: user.id, action: "UPDATE_MEMBER", entityType: "organization_member", entityId: updated.id, before: { status: membership.status, role_id: membership.role_id }, after: { status: updated.status, role_id: updated.role_id }, req });
  return ok({ id: updated.id, user: updated.user, role: updated.role.name, status: updated.status });
});
