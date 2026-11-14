// src/app/api/v1/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createResetToken } from "@/server/auth/otp-store"
import { findByIdentifier } from "@/server/auth/user-store"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const identifier = typeof body.identifier === "string"
    ? body.identifier.trim()
    : (body.email ?? body.phone ?? "").toString().trim()

  if (!identifier) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Email atau nomor WhatsApp wajib diisi" } },
      { status: 400 }
    )
  }

  const user = findByIdentifier(identifier)

  // Selalu 200 agar tidak membocorkan akun mana yang terdaftar.
  const data: Record<string, unknown> = {
    sent: true,
    channel: "email_atau_whatsapp",
    expires_in: 900,
    message: "Jika akun terdaftar, tautan pemulihan telah dikirim.",
  }

  if (user) {
    const reset = createResetToken(user.id)
    // Demo: token dikembalikan agar alur bisa diuji tanpa email gateway.
    data.dev_reset_token = reset.token
  }

  return NextResponse.json({ data })
}
