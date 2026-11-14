import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, parsePagination, meta } from "@/server/http";
import { areaIdsWithDescendants } from "@/server/services/areas";
import { getAuthUser } from "@/server/auth/current-user";

export const GET = route(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const q = searchParams.get("q")?.trim();
  const areaIdParam = searchParams.get("area_id")?.trim();
  const auth = areaIdParam ? null : await getAuthUser(req);
  const areaId = areaIdParam || auth?.profile?.area_id || null;

  const areaIds = areaId ? await areaIdsWithDescendants(areaId) : null;
  const where = {
    type: "community" as const,
    deleted_at: null,
    status: "verified" as const,
    ...(areaIds ? { area_id: { in: areaIds } } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.organization.count({ where }),
    prisma.organization.findMany({
      where,
      include: { area: true, _count: { select: { members: { where: { status: "active" } } } } },
      orderBy: { name: "asc" },
      skip,
      take: perPage,
    }),
  ]);

  return ok(
    rows.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      status: o.status,
      area_id: o.area_id,
      area_name: o.area?.name ?? null,
      member_count: o._count.members,
      verified_at: o.verified_at,
      created_at: o.created_at,
    })),
    meta(page, perPage, total)
  );
});
