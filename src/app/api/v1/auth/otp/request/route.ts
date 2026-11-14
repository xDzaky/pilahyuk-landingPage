import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { createOtp, isDevAuth, normalizePhone, supportUrl } from "@/server/auth/otp";

export const POST = route(async (req: NextRequest) => {
  const body = await readJson<{ phone?: unknown }>(req);
  const raw = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!raw) throw new HttpError(400, "VALIDATION_ERROR", "Nomor WhatsApp wajib diisi", { phone: ["Wajib diisi"] });

  const phone = normalizePhone(raw);
  if (!/^08[1-9][0-9]{6,11}$/.test(phone)) {
    throw new HttpError(400, "VALIDATION_ERROR", "Format nomor WhatsApp tidak valid", { phone: ["Contoh: 08123456789"] });
  }

  await enforceRateLimit(`otp:ip:${getIp(req)}`, 30, 600);
  await enforceRateLimit(`otp:phone:${phone}`, 5, 600);

  const user = await prisma.user.findFirst({ where: { phone }, select: { email: true } });
  const otp = await createOtp(phone, "contact_verify", user?.email ?? null);
  return ok({
    sent: otp.delivered,
    delivery: otp.channel,
    channel: "whatsapp",
    phone,
    expires_in: otp.expiresIn,
    ...(isDevAuth() ? { dev_code: otp.code } : {}),
    ...(!otp.delivered && !isDevAuth() ? { support_url: supportUrl(), message: "Kode tidak terkirim. Hubungi admin lewat tautan bantuan atau coba lagi." } : {}),
  });
});
