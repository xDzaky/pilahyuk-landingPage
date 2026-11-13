import { NextRequest, NextResponse } from "next/server";

// Mock user store (replace with Prisma in production)
const USERS: Record<string, {
  id: string; name: string; email: string; role: string;
  org_id: string | null; org_name: string | null; phone?: string; avatar?: string;
}> = {
  "user-superadmin-001": {
    id: "user-superadmin-001",
    name: "Super Admin",
    email: "admin@pilahyuk.id",
    role: "super_admin",
    org_id: null,
    org_name: null,
  },
  "user-operator-001": {
    id: "user-operator-001",
    name: "Budi Santoso",
    email: "operator@banksampah.id",
    role: "operator_bank_sampah",
    org_id: "org-001",
    org_name: "Bank Sampah Berkah Jaya",
    phone: "08123456789",
  },
  "user-pengurus-001": {
    id: "user-pengurus-001",
    name: "Siti Rahayu",
    email: "pengurus@komunitas.id",
    role: "pengurus_komunitas",
    org_id: "org-002",
    org_name: "Komunitas Hijau Nusantara",
    phone: "08234567890",
  },
};

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId || !USERS[userId]) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Pengguna tidak ditemukan" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: USERS[userId] });
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId || !USERS[userId]) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Pengguna tidak ditemukan" } },
      { status: 404 }
    );
  }
  const body = await req.json();
  const allowed = ["name", "phone"];
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  USERS[userId] = { ...USERS[userId], ...updates };
  return NextResponse.json({ data: USERS[userId] });
}
