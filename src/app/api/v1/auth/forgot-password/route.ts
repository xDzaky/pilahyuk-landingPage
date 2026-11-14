import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { createPasswordResetToken, isDevAuth, normalizePhone, sendWhatsApp } from "@/server/auth/otp";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest) => {
  const body = await readJson<{ identifier?: unknown; email?: unknown; phone?: unknown }>(req);
  const identifier = String(body.identifier ?? body.email ?? body.phone ?? "").trim();
  if (!identifier) throw new HttpError(400, "VALIDATION_ERROR", "Email atau nomor WhatsApp wajib diisi");

  await enforceRateLimit(`forgot:ip:${getIp(req)}`, 20, 900);
  await enforceRateLimit(`forgot:id:${identifier.toLowerCase()}`, 3, 900);

  const isEmail = identifier.includes("@");
  const phone = isEmail ? "" : normalizePhone(identifier);
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: identifier.toLowerCase() } : { phone },
    select: { id: true, phone: true, email: true },
  });

  const dev = isDevAuth();
  const data: Record<string, unknown> = {
    sent: true,
    channel: isEmail ? "email" : "whatsapp",
    expires_in: 900,
    message: "Jika akun terdaftar, tautan pemulihan telah dikirim.",
  };

  if (user) {
    await writeAudit({ actorId: user.id, action: "FORGOT_PASSWORD", entityType: "user", entityId: user.id, req });
    const reset = await createPasswordResetToken(user.id);

    if (dev) {
      data.dev_reset_token = reset.token;
    } else if (user.phone) {
      const sent = await sendWhatsApp(
        user.phone,
        `Tautan pemulihan kata sandi PilahYuk: ${reset.token}\nBerlaku 15 menit. Abaikan pesan ini jika bukan Anda.`
      );
      if (!sent) console.error("Reset token gagal dikirim via WhatsApp untuk user", user.id);
    }
  }

  return ok(data);
});
