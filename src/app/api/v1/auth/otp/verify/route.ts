import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { normalizePhone, verifyOtpRecord } from "@/server/auth/otp";
import { orgNameFor } from "@/server/auth/issue-session";
import { toPublicUser } from "@/server/auth/serializers";

export const POST = route(async (req: NextRequest) => {
  const body = await readJson<{ phone?: unknown; code?: unknown }>(req);
  const raw = typeof body.phone === "string" ? body.phone.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!raw || !code) {
    throw new HttpError(400, "VALIDATION_ERROR", "Nomor WhatsApp dan kode OTP wajib diisi", {
      ...(raw ? {} : { phone: ["Wajib diisi"] }),
      ...(code ? {} : { code: ["Wajib diisi"] }),
    });
  }

  const phone = normalizePhone(raw);
  await enforceRateLimit(`otpverify:phone:${phone}`, 10, 600);

  const result = await verifyOtpRecord(phone, code, "contact_verify");
  if (!result.ok) throw new HttpError(400, result.code, result.message);

  const user = await prisma.user.findFirst({ where: { phone }, include: { profile: true } });
  if (user && !user.contact_verified) {
    await prisma.user.update({ where: { id: user.id }, data: { contact_verified: true } });
  }

  return ok({
    verified: true,
    user: user ? toPublicUser({ ...user, contact_verified: true }, await orgNameFor(user.org_id)) : null,
  });
});
