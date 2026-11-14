import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { hashPassword } from "@/server/auth/password";
import { consumePasswordResetToken, normalizePhone, verifyOtpRecord } from "@/server/auth/otp";
import { revokeAllUserTokens } from "@/server/auth/session";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest) => {
  const body = await readJson<{ token?: unknown; identifier?: unknown; code?: unknown; password?: unknown }>(req);
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (password.length < 8) {
    throw new HttpError(400, "VALIDATION_ERROR", "Kata sandi minimal 8 karakter", { password: ["Minimal 8 karakter"] });
  }
  if (!token && !(identifier && code)) {
    throw new HttpError(400, "VALIDATION_ERROR", "Kirim token, atau identifier + kode OTP");
  }

  await enforceRateLimit(`reset:ip:${getIp(req)}`, 20, 900);
  if (identifier) await enforceRateLimit(`reset:id:${identifier.toLowerCase()}`, 10, 900);

  let userId: string | null = null;
  if (token) {
    userId = await consumePasswordResetToken(token);
  } else {
    const isEmail = identifier.includes("@");
    const phone = isEmail ? identifier : normalizePhone(identifier);
    const verified = await verifyOtpRecord(isEmail ? identifier.toLowerCase() : phone, code, "password_reset");
    if (!verified.ok) throw new HttpError(400, verified.code, verified.message);
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier.toLowerCase() } : { phone },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  if (!userId) {
    throw new HttpError(400, "INVALID_TOKEN", "Tautan atau kode pemulihan tidak valid atau sudah kedaluwarsa");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: await hashPassword(password) },
  });
  await revokeAllUserTokens(userId);
  await writeAudit({ actorId: userId, action: "RESET_PASSWORD", entityType: "user", entityId: userId, req });

  return ok({ reset: true, message: "Kata sandi berhasil diubah. Silakan masuk." });
});
