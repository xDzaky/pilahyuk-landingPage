import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { normalizePhone, createOtp, createPasswordResetToken, isDevAuth, supportUrl } from "@/server/auth/otp";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest) => {
  await enforceRateLimit(`forgot-password:ip:${getIp(req)}`, 10, 3600);

  const body = await readJson<{ identifier?: unknown }>(req);
  const identifierRaw = typeof body.identifier === "string" ? body.identifier.trim() : "";

  if (!identifierRaw) {
    throw new HttpError(400, "VALIDATION_ERROR", "Email atau nomor WhatsApp diperlukan", {
      identifier: ["Masukkan email atau nomor WhatsApp yang terdaftar"],
    });
  }

  const isEmail = identifierRaw.includes("@");
  const identifier = isEmail ? identifierRaw.toLowerCase() : normalizePhone(identifierRaw);

  await enforceRateLimit(`forgot-password:id:${identifier}`, 5, 3600);

  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier } : { phone: identifier },
    select: { id: true, email: true, phone: true, status: true },
  });

  // Anti user-enumeration: jika user tidak ditemukan atau non-aktif,
  // tetap kembalikan pesan sukses generik agar tidak membocorkan keberadaan akun.
  if (!user || user.status !== "active") {
    return ok({
      message: "Jika akun Anda terdaftar, kode verifikasi atau instruksi pemulihan telah dikirimkan.",
      channel: isEmail ? "email" : "whatsapp",
      expires_in: 300,
      support_url: supportUrl(),
    });
  }

  const targetIdentifier = isEmail ? user.email! : user.phone!;
  const otpResult = await createOtp(targetIdentifier, "password_reset", user.email);
  const resetToken = await createPasswordResetToken(user.id);

  await writeAudit({
    actorId: user.id,
    action: "PASSWORD_RESET_REQUEST",
    entityType: "user",
    entityId: user.id,
    req,
  });

  return ok({
    message: "Instruksi pemulihan kata sandi telah dikirimkan.",
    channel: otpResult.channel,
    expires_in: otpResult.expiresIn,
    ...(isDevAuth() ? { dev_code: otpResult.code, dev_token: resetToken.token } : {}),
    support_url: supportUrl(),
  });
});
