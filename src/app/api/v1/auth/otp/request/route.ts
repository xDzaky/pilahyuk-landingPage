import { NextRequest } from "next/server";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { createOtp, isDevAuth, normalizePhone } from "@/server/auth/otp";

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

  try {
    const otp = await createOtp(phone, "contact_verify");
    return ok({
      sent: true,
      channel: "whatsapp",
      phone,
      expires_in: otp.expiresIn,
      ...(isDevAuth() ? { dev_code: otp.code } : {}),
    });
  } catch {
    throw new HttpError(502, "GATEWAY_UNAVAILABLE", "Gateway WhatsApp belum siap. Coba lagi beberapa saat.");
  }
});
