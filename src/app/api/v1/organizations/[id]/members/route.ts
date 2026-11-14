import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");

  const staff = ["operator_bank_sampah", "pengurus_komunitas"].includes(user.role) && user.org_id === id;
  if (user.role !== "super_admin" && !staff) {
    throw new HttpError(403, "FORBIDDEN", "Hanya pengurus organisasi ini yang dapat melihat anggota");
  }

  const where = {
    organization_id: id,
    deleted_at: null,
    ...(status ? { status: status as never } : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.organizationMember.count({ where }),
    prisma.organizationMember.findMany({
      where, skip, take: perPage, orderBy: { created_at: "desc" },
      include: { user: { select: { id: true, name: true, email: true, phone: true, contact_verified: true } }, role: true },
    }),
  ]);

  return ok(rows.map((m) => ({
    id: m.id,
    user: { id: m.user.id, name: m.user.name, email: m.user.email, phone: m.user.phone, contact_verified: m.user.contact_verified },
    role: m.role.name,
    status: m.status,
    joined_at: m.joined_at,
    created_at: m.created_at,
  })), meta(page, perPage, total));
});
