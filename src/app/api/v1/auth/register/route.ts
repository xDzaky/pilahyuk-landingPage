// src/app/api/v1/auth/register/route.ts
// Registrasi akun baru (selaras alur mobile: 3 langkah + verifikasi kontak).
import { NextRequest, NextResponse } from "next/server"
import { signToken } from "@/server/auth/token"
import {
  createUser, isIdentifierTaken, toPublicUser, type UserRole,
} from "@/server/auth/user-store"
import { createOtp } from "@/server/auth/otp-store"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(\+?62|0)8[1-9][0-9]{6,11}$/
const ALLOWED_ROLES: UserRole[] = ["resident", "volunteer"]

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Body harus JSON" } },
      { status: 400 }
    )
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const phone = typeof body.phone === "string" ? body.phone.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const district = typeof body.district === "string" ? body.district.trim() : ""
  const village = typeof body.village === "string" ? body.village.trim() : ""
  const rw = typeof body.rw === "string" ? body.rw.trim() : ""
  const communityId = typeof body.community_id === "string" ? body.community_id : null
  const communityName = typeof body.community_name === "string" ? body.community_name.trim() : null
  const requestedRole = typeof body.role === "string" ? (body.role as UserRole) : "resident"

  const details: Record<string, string[]> = {}
  if (name.length < 3) details.name = ["Nama lengkap minimal 3 karakter"]
  if (!phone && !email) details.identifier = ["Isi nomor WhatsApp atau email"]
  if (phone && !PHONE_RE.test(phone.replace(/[\s-]/g, ""))) {
    details.phone = ["Format nomor WhatsApp tidak valid (contoh: 08123456789)"]
  }
  if (email && !EMAIL_RE.test(email)) details.email = ["Format email tidak valid"]
  if (password.length < 8) details.password = ["Kata sandi minimal 8 karakter"]

  if (Object.keys(details).length > 0) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Data registrasi belum lengkap atau tidak valid",
          details,
        },
      },
      { status: 400 }
    )
  }

  if (isIdentifierTaken(phone || email)) {
    return NextResponse.json(
      {
        error: {
          code: "CONFLICT",
          message: "Nomor WhatsApp atau email sudah terdaftar. Silakan masuk.",
        },
      },
      { status: 409 }
    )
  }

  const role: UserRole = ALLOWED_ROLES.includes(requestedRole) ? requestedRole : "resident"

  const user = createUser({
    name,
    phone: phone || null,
    email: email || null,
    password,
    role,
    district: district || null,
    village: village || null,
    rw: rw || null,
    org_id: communityId,
    org_name: communityName,
  })

  const token = await signToken({
    sub: user.id,
    role: user.role,
    org_id: user.org_id,
    name: user.name,
    email: user.email,
  })

  // Demo: no WhatsApp gateway is connected yet, so the OTP is returned to the
  // client. Remove `dev_code` once Fonnte/WhatsApp is wired.
  const otp = user.phone ? createOtp(user.phone) : null

  const response = NextResponse.json(
    {
      data: {
        token,
        user: toPublicUser(user),
        expires_in: 28800,
        next_step: user.phone ? "verify_contact" : "complete_profile",
        otp: otp
          ? { channel: "whatsapp", expires_in: otp.expires_in, dev_code: otp.code }
          : null,
      },
    },
    { status: 201 }
  )

  response.cookies.set("pilahyuk_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  })

  return response
}
