// src/app/api/v1/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyOtp } from "@/server/auth/otp-store"
import { findByIdentifier, markContactVerified, toPublicUser, normalizePhone } from "@/server/auth/user-store"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const raw = typeof body.phone === "string" ? body.phone.trim() : ""
  const code = typeof body.code === "string" ? body.code.trim() : ""

  if (!raw || !code) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Nomor WhatsApp dan kode OTP wajib diisi",
          details: {
            ...(raw ? {} : { phone: ["Wajib diisi"] }),
            ...(code ? {} : { code: ["Wajib diisi"] }),
          },
        },
      },
      { status: 400 }
    )
  }

  const result = verifyOtp(raw, code)
  if (!result.ok) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: 400 }
    )
  }

  const user = findByIdentifier(normalizePhone(raw))
  if (user) markContactVerified(user)

  return NextResponse.json({
    data: {
      verified: true,
      user: user ? toPublicUser(user) : null,
    },
  })
}
