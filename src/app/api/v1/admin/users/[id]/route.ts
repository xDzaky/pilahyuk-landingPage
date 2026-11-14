import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth, requireRole } from "@/server/auth/current-user";
import { ADMIN_ROLES } from "@/server/rbac";
import { revokeAllUserTokens } from "@/server/auth/session";
import { writeAudit } from "@/server/audit";

export const PATCH = route(async (req: NextRequest, context) => {
  const admin = await requireAuth(req);
  requireRole(admin, ADMIN_ROLES);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ status?: unknown; contact_verified?: unknown }>(req);
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new HttpError(404, "NOT_FOUND", "Pengguna tidak ditemukan");

  const status = body.status !== undefined ? String(body.status) : null;
  if (status && !["active", "suspended"].includes(status)) {
    throw new HttpError(400, "VALIDATION_ERROR", "status harus active atau suspended");
  }
  if (target.id === admin.id && status === "suspended") {
    throw new HttpError(409, "CONFLICT", "Tidak dapat menangguhkan akun sendiri");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(body.contact_verified !== undefined ? { contact_verified: Boolean(body.contact_verified) } : {}),
    },
    select: { id: true, name: true, email: true, role: true, status: true, contact_verified: true },
  });
  if (status === "suspended") await revokeAllUserTokens(id);
  await writeAudit({ actorId: admin.id, action: "ADMIN_UPDATE_USER", entityType: "user", entityId: id, before: { status: target.status, contact_verified: target.contact_verified }, after: { status: updated.status, contact_verified: updated.contact_verified }, req });
  return ok(updated);
});
