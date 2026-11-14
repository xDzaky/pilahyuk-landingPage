import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";
import { prisma } from "@/server/db";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;

export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+62")) return "0" + digits.slice(3);
  if (digits.startsWith("62")) return "0" + digits.slice(2);
  return digits;
}

export function isDevAuth(): boolean {
  if (process.env.AUTH_DEV_MODE === "true") return true;
  if (process.env.AUTH_DEV_MODE === "false") return false;
  return process.env.NODE_ENV !== "production";
}

function hmac(value: string): string {
  const secret = process.env.JWT_SECRET || "pilahyuk-dev-only-secret-change-me-32chars";
  return createHmac("sha256", secret).update(value).digest("hex");
}

function hashOtp(identifier: string, code: string): string {
  return hmac(`${identifier}:${code}`);
}

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ target: phone, message }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (error) {
    console.error("Fonnte send failed:", error);
    return false;
  }
}

export async function createOtp(
  identifier: string,
  purpose: "contact_verify" | "password_reset"
): Promise<{ code: string; expiresIn: number; delivered: boolean }> {
  const code = String(randomInt(1000, 10000));
  await prisma.otpCode.updateMany({
    where: { identifier, purpose, consumed_at: null },
    data: { consumed_at: new Date() },
  });
  await prisma.otpCode.create({
    data: {
      identifier,
      purpose,
      code_hash: hashOtp(identifier, code),
      expires_at: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  if (isDevAuth()) {
    return { code, expiresIn: OTP_TTL_MS / 1000, delivered: false };
  }

  const message =
    purpose === "contact_verify"
      ? `Kode verifikasi PilahYuk Anda: ${code}. Berlaku 5 menit. Jangan bagikan kode ini.`
      : `Kode reset kata sandi PilahYuk Anda: ${code}. Berlaku 5 menit. Jangan bagikan kode ini.`;
  const delivered = await sendWhatsApp(identifier, message);
  if (!delivered) {
    throw new Error("GATEWAY_UNAVAILABLE");
  }
  return { code, expiresIn: OTP_TTL_MS / 1000, delivered: true };
}

export async function verifyOtpRecord(
  identifier: string,
  code: string,
  purpose: "contact_verify" | "password_reset"
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const record = await prisma.otpCode.findFirst({
    where: { identifier, purpose, consumed_at: null },
    orderBy: { created_at: "desc" },
  });
  if (!record) return { ok: false, code: "OTP_NOT_FOUND", message: "Kode OTP belum diminta." };
  if (record.expires_at.getTime() <= Date.now()) {
    return { ok: false, code: "OTP_EXPIRED", message: "Kode OTP kedaluwarsa. Minta kode baru." };
  }
  if (record.attempts >= 5) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { consumed_at: new Date() } });
    return { ok: false, code: "OTP_TOO_MANY_ATTEMPTS", message: "Terlalu banyak percobaan. Minta kode baru." };
  }
  const matches = record.code_hash === hashOtp(identifier, code.trim());
  await prisma.otpCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 }, ...(matches ? { consumed_at: new Date() } : {}) },
  });
  if (!matches) return { ok: false, code: "OTP_INVALID", message: "Kode OTP salah." };
  return { ok: true };
}

export async function createPasswordResetToken(userId: string): Promise<{ token: string; expiresIn: number }> {
  const token = randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.updateMany({
    where: { user_id: userId, consumed_at: null },
    data: { consumed_at: new Date() },
  });
  await prisma.passwordResetToken.create({
    data: {
      user_id: userId,
      token_hash: createHash("sha256").update(token).digest("hex"),
      expires_at: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  return { token, expiresIn: RESET_TTL_MS / 1000 };
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token_hash: createHash("sha256").update(token).digest("hex") },
  });
  if (!record || record.consumed_at || record.expires_at.getTime() <= Date.now()) return null;
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { consumed_at: new Date() },
  });
  return record.user_id;
}
