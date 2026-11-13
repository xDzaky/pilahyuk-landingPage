import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pilahyuk-secret-dev-only"
);

// Mock users (replace with Prisma query in production)
const DEMO_ACCOUNTS = [
  {
    id: "user-superadmin-001",
    email: "admin@pilahyuk.id",
    password: "admin123",
    name: "Super Admin",
    role: "super_admin",
    org_id: null,
    org_name: null,
    avatar: null,
  },
  {
    id: "user-operator-001",
    email: "operator@banksampah.id",
    password: "operator123",
    name: "Budi Santoso",
    role: "operator_bank_sampah",
    org_id: "org-001",
    org_name: "Bank Sampah Berkah Jaya",
    avatar: null,
  },
  {
    id: "user-pengurus-001",
    email: "pengurus@komunitas.id",
    password: "pengurus123",
    name: "Siti Rahayu",
    role: "pengurus_komunitas",
    org_id: "org-002",
    org_name: "Komunitas Hijau Nusantara",
    avatar: null,
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email dan password diperlukan" } },
        { status: 400 }
      );
    }

    const user = DEMO_ACCOUNTS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      // Rate limit simulation: in production use Upstash Redis
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah" } },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      sub: user.id,
      role: user.role,
      org_id: user.org_id,
      name: user.name,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(SECRET);

    const { password: _pw, ...safeUser } = user;

    const response = NextResponse.json({
      data: {
        token,
        user: safeUser,
        expires_in: 28800,
      },
    });

    response.cookies.set("pilahyuk_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan server" } },
      { status: 500 }
    );
  }
}
