// src/server/auth/otp-store.ts
// Short-lived OTP codes + password reset tokens, kept in memory for the pilot.
// Replace with Redis (Upstash) so codes survive cold starts in production.
import { normalizePhone } from "./user-store"

interface OtpEntry {
  code: string
  expires_at: number
  attempts: number
}

interface ResetEntry {
  user_id: string
  expires_at: number
}

const globalOtp = globalThis as unknown as {
  __pilahyukOtps?: Map<string, OtpEntry>
  __pilahyukResets?: Map<string, ResetEntry>
}

const otps = globalOtp.__pilahyukOtps ?? new Map<string, OtpEntry>()
const resets = globalOtp.__pilahyukResets ?? new Map<string, ResetEntry>()
globalOtp.__pilahyukOtps = otps
globalOtp.__pilahyukResets = resets

const OTP_TTL_MS = 5 * 60 * 1000
const RESET_TTL_MS = 15 * 60 * 1000

export function createOtp(phone: string): { code: string; expires_in: number } {
  const code = String(Math.floor(1000 + Math.random() * 9000))
  otps.set(normalizePhone(phone), {
    code,
    expires_at: Date.now() + OTP_TTL_MS,
    attempts: 0,
  })
  return { code, expires_in: Math.floor(OTP_TTL_MS / 1000) }
}

export type OtpResult =
  | { ok: true }
  | { ok: false; code: "OTP_NOT_FOUND" | "OTP_EXPIRED" | "OTP_INVALID" | "OTP_TOO_MANY_ATTEMPTS"; message: string }

export function verifyOtp(phone: string, code: string): OtpResult {
  const key = normalizePhone(phone)
  const entry = otps.get(key)
  if (!entry) {
    return { ok: false, code: "OTP_NOT_FOUND", message: "Kode OTP belum diminta. Kirim kode terlebih dahulu." }
  }
  if (Date.now() > entry.expires_at) {
    otps.delete(key)
    return { ok: false, code: "OTP_EXPIRED", message: "Kode OTP kedaluwarsa. Minta kode baru." }
  }
  if (entry.attempts >= 5) {
    otps.delete(key)
    return { ok: false, code: "OTP_TOO_MANY_ATTEMPTS", message: "Terlalu banyak percobaan. Minta kode baru." }
  }
  entry.attempts += 1
  if (entry.code !== code.trim()) {
    return { ok: false, code: "OTP_INVALID", message: "Kode OTP salah" }
  }
  otps.delete(key)
  return { ok: true }
}

export function createResetToken(userId: string): { token: string; expires_in: number } {
  const token = `rst_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  resets.set(token, { user_id: userId, expires_at: Date.now() + RESET_TTL_MS })
  return { token, expires_in: Math.floor(RESET_TTL_MS / 1000) }
}

export function consumeResetToken(token: string): { ok: true; user_id: string } | { ok: false } {
  const entry = resets.get(token)
  if (!entry || Date.now() > entry.expires_at) {
    resets.delete(token)
    return { ok: false }
  }
  resets.delete(token)
  return { ok: true, user_id: entry.user_id }
}
