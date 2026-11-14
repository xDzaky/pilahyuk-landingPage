import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { verifyPassword } from "@/server/auth/password";
import { normalizePhone } from "@/server/auth/otp";
import { issueSession, orgNameFor } from "@/server/auth/issue-session";
import { toPublicUser } from "@/server/auth/serializers";
import { setAuthCookies } from "@/server/auth/session";
import { writeAudit } from "@/server/audit";

const DUMMY_HASH = "$2a$12$FQZy7YSYKy/c.zYSSRPXWew4f4utb3jI0eyYdQsiJRbCSqD/1egji";

export const POST = route(async (req: NextRequest) => {
  await enforceRateLimit(`login:ip:${getIp(req)}`, 30, 900);

  const body = await readJson<{ identifier?: unknown; email?: unknown; phone?: unknown; password?: unknown }>(req);
  const identifier = String(body.identifier ?? body.email ?? body.phone ?? "").trim();
  const password = String(body.password ?? "");
  if (!identifier || !password) {
    throw new HttpError(400, "VALIDATION_ERROR", "Email/nomor HP dan password diperlukan");
  }

  await enforceRateLimit(`login:id:${identifier.toLowerCase()}`, 10, 900);

  const isEmail = identifier.includes("@");
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier.toLowerCase() } : { phone: normalizePhone(identifier) },
    include: { profile: true },
  });

  const valid = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) {
    await writeAudit({ action: "LOGIN_FAILED", entityType: "user", entityId: identifier, req });
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email/nomor HP atau password salah");
  }
  if (user.status !== "active") {
    throw new HttpError(403, "FORBIDDEN", "Akun dinonaktifkan. Hubungi admin PilahYuk.");
  }

  const session = await issueSession(user, req);
  const orgName = await orgNameFor(user.org_id);
  await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });
  await writeAudit({ actorId: user.id, action: "LOGIN_SUCCESS", entityType: "user", entityId: user.id, req });

  const response = ok({
    token: session.access,
    refresh_token: session.refresh,
    token_type: "Bearer",
    expires_in: session.expiresIn,
    refresh_expires_in: session.refreshExpiresIn,
    user: toPublicUser(user, orgName),
  });
  return setAuthCookies(response, session.access, session.refresh);
});
