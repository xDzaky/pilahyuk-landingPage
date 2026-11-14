import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError } from "@/server/http";
import { requireAuth, requireRole } from "@/server/auth/current-user";
import { ADMIN_ROLES } from "@/server/rbac";
import { createPasswordResetToken } from "@/server/auth/otp";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const admin = await requireAuth(req);
  requireRole(admin, ADMIN_ROLES);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Pengguna tidak ditemukan");
  const reset = await createPasswordResetToken(user.id);
  await writeAudit({ actorId: admin.id, action: "ADMIN_CREATE_RESET_TOKEN", entityType: "user", entityId: id, after: { expires_in: reset.expiresIn }, req });
  return ok({ user_id: user.id, name: user.name, email: user.email, phone: user.phone, reset_token: reset.token, expires_in: reset.expiresIn });
});
