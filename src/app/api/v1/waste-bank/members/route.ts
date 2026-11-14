import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth, requireOrgAccess } from "@/server/auth/current-user";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  if (!["operator_bank_sampah", "super_admin"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Hanya operator bank sampah yang dapat melihat anggota");
  }
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organization_id") || user.org_id || "";
  if (!organizationId) throw new HttpError(400, "VALIDATION_ERROR", "organization_id wajib diisi");
  await requireOrgAccess(user, organizationId);
  const { page, perPage, skip } = parsePagination(searchParams);
  const q = searchParams.get("q")?.trim();

  const where = {
    organization_id: organizationId,
    deleted_at: null,
    ...(q ? { OR: [{ member_code: { contains: q, mode: "insensitive" as const } }, { user: { name: { contains: q, mode: "insensitive" as const } } }] } : {}),
  };
  const [total, rows] = await prisma.$transaction([
    prisma.wasteBankMember.count({ where }),
    prisma.wasteBankMember.findMany({
      where, include: { user: { select: { id: true, name: true, phone: true, email: true } } },
      skip, take: perPage, orderBy: { joined_at: "desc" },
    }),
  ]);
  return ok(rows.map((m) => ({
    id: m.id, user_id: m.user_id, name: m.user.name, phone: m.user.phone,
    email: m.user.email, member_code: m.member_code, status: m.status, joined_at: m.joined_at,
  })), meta(page, perPage, total));
});
