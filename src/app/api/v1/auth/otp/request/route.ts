// src/app/api/v1/auth/otp/request/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createOtp } from "@/server/auth/otp-store"
import { normalizePhone } from "@/server/auth/user-store"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const raw = typeof body.phone === "string" ? body.phone.trim() : ""

  if (!raw) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Nomor WhatsApp wajib diisi", details: { phone: ["Wajib diisi"] } } },
      { status: 400 }
    )
  }

  const phone = normalizePhone(raw)
  if (phone.length < 10) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Format nomor WhatsApp tidak valid", details: { phone: ["Contoh: 08123456789"] } } },
      { status: 400 }
    )
  }

  const otp = createOtp(phone)

  // Demo: WhatsApp gateway (Fonnte) belum aktif — kode dikembalikan agar bisa diuji.
  return NextResponse.json({
    data: {
      sent: true,
      channel: "whatsapp",
      phone,
      expires_in: otp.expires_in,
      dev_code: otp.code,
      note: "Kode OTP dikembalikan di dev_code sampai gateway WhatsApp aktif.",
    },
  })
}
