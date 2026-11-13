import { NextRequest, NextResponse } from "next/server";

const MOCK_ORGS = [
  {
    id: "org-001",
    name: "Bank Sampah Berkah Jaya",
    type: "bank_sampah",
    status: "verified",
    city: "Jakarta Selatan",
    member_count: 234,
    created_at: "2024-01-15T07:00:00Z",
    contact_email: "admin@berkah.id",
  },
  {
    id: "org-002",
    name: "Komunitas Hijau Nusantara",
    type: "komunitas",
    status: "verified",
    city: "Bandung",
    member_count: 89,
    created_at: "2024-02-20T08:00:00Z",
    contact_email: "info@hijaunusantara.id",
  },
  {
    id: "org-003",
    name: "EcoWarriors Surabaya",
    type: "komunitas",
    status: "pending_review",
    city: "Surabaya",
    member_count: 12,
    created_at: "2024-11-10T09:00:00Z",
    contact_email: "ecowarriors@surabaya.id",
  },
];

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "super_admin") {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();

  let orgs = [...MOCK_ORGS];
  if (status) orgs = orgs.filter((o) => o.status === status);
  if (q) orgs = orgs.filter((o) => o.name.toLowerCase().includes(q));

  return NextResponse.json({
    data: orgs,
    meta: { total: orgs.length, page: 1, per_page: 20 },
  });
}
