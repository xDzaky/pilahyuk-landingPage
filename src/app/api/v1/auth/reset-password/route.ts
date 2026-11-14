// src/app/api/v1/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { consumeResetToken } from "@/server/auth/otp-store"
import { findById, setPassword } from "@/server/auth/user-store"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const token = typeof body.token === "string" ? body.token.trim() : ""
  const password = typeof body.password === "string" ? body.password : ""

  const details: Record<string, string[]> = {}
  if (!token) details.token = ["Token pemulihan wajib diisi"]
  if (password.length < 8) details.password = ["Kata sandi minimal 8 karakter"]

  if (Object.keys(details).length > 0) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Data tidak valid", details } },
      { status: 400 }
    )
  }

  const reset = consumeResetToken(token)
  if (!reset.ok) {
    return NextResponse.json(
      { error: { code: "INVALID_TOKEN", message: "Tautan pemulihan tidak valid atau sudah kedaluwarsa" } },
      { status: 400 }
    )
  }

  const user = findById(reset.user_id)
  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Pengguna tidak ditemukan" } },
      { status: 404 }
    )
  }

  setPassword(user, password)

  return NextResponse.json({
    data: { reset: true, message: "Kata sandi berhasil diubah. Silakan masuk." },
  })
}
