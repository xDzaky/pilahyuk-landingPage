import { NextRequest } from "next/server";
import { OrgStatus, OrgType, Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth, requireRole } from "@/server/auth/current-user";
import { ADMIN_ROLES } from "@/server/rbac";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  requireRole(user, ADMIN_ROLES);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.trim();

  const where: Prisma.OrganizationWhereInput = {
    deleted_at: null,
    ...(status && Object.values(OrgStatus).includes(status as OrgStatus) ? { status: status as OrgStatus } : {}),
    ...(type && Object.values(OrgType).includes(type as OrgType) ? { type: type as OrgType } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.organization.count({ where }),
    prisma.organization.findMany({
      where, include: { area: true, _count: { select: { members: { where: { status: "active" } } } } },
      orderBy: { created_at: "desc" }, skip, take: perPage,
    }),
  ]);

  return ok(rows.map((o) => ({
    id: o.id, name: o.name, type: o.type, status: o.status,
    area_id: o.area_id, area_name: o.area?.name ?? null,
    member_count: o._count.members, created_at: o.created_at, verified_at: o.verified_at,
  })), meta(page, perPage, total));
});
