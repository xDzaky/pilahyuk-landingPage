import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, ok, parsePagination, meta } from "@/server/http";
import { requireAuth, requireRole } from "@/server/auth/current-user";
import { ADMIN_ROLES } from "@/server/rbac";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  requireRole(user, ADMIN_ROLES);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const q = searchParams.get("q")?.trim();
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const where: Prisma.UserWhereInput = {
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where, orderBy: { created_at: "desc" }, skip, take: perPage,
      select: { id: true, name: true, email: true, phone: true, role: true, org_id: true, status: true, contact_verified: true, created_at: true, last_login_at: true },
    }),
  ]);
  return ok(rows, meta(page, perPage, total));
});
