import { NextRequest, NextResponse } from "next/server"
import { findById, setPassword, toPublicUser } from "@/server/auth/user-store"

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id")
  const user = userId ? findById(userId) : undefined
  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Pengguna tidak ditemukan" } },
      { status: 404 }
    )
  }
  return NextResponse.json({ data: toPublicUser(user) })
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id")
  const user = userId ? findById(userId) : undefined
  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Pengguna tidak ditemukan" } },
      { status: 404 }
    )
  }

  const body = await req.json()
  const details: Record<string, string[]> = {}

  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (name.length < 3) details.name = ["Nama minimal 3 karakter"]
    else user.name = name
  }
  if (body.phone !== undefined) {
    const phone = String(body.phone).trim()
    if (!/^(\+?62|0)8[1-9][0-9]{6,11}$/.test(phone.replace(/[\s-]/g, ""))) {
      details.phone = ["Format nomor HP tidak valid"]
    } else {
      user.phone = phone
    }
  }
  if (body.password !== undefined) {
    const password = String(body.password)
    if (password.length < 8) details.password = ["Kata sandi minimal 8 karakter"]
    else setPassword(user, password)
  }

  if (Object.keys(details).length > 0) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Data tidak valid", details } },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: toPublicUser(user) })
}
