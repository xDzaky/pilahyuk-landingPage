// src/app/api/v1/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server"
import { signToken } from "@/server/auth/token"
import { findByIdentifier, toPublicUser, verifyPassword } from "@/server/auth/user-store"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Accept `identifier` (email atau nomor HP), atau `email` / `phone` lama.
    const identifier: string =
      (body.identifier ?? body.email ?? body.phone ?? "").toString().trim()
    const password: string = (body.password ?? "").toString()

    if (!identifier || !password) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Email/nomor HP dan password diperlukan",
          },
        },
        { status: 400 }
      )
    }

    const user = findByIdentifier(identifier)

    if (!user || !verifyPassword(user, password)) {
      // Rate limit simulation: in production use Upstash Redis
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email/nomor HP atau password salah",
          },
        },
        { status: 401 }
      )
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Akun dinonaktifkan. Hubungi admin PilahYuk.",
          },
        },
        { status: 403 }
      )
    }

    const token = await signToken({
      sub: user.id,
      role: user.role,
      org_id: user.org_id,
      name: user.name,
      email: user.email,
    })

    const response = NextResponse.json({
      data: {
        token,
        user: toPublicUser(user),
        expires_in: 28800,
      },
    })

    response.cookies.set("pilahyuk_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
      { status: 500 }
    )
  }
}
