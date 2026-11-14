import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok } from "@/server/http";

export const GET = route(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const parentId = searchParams.get("parent_id");

  const areas = await prisma.area.findMany({
    where: {
      ...(parentId ? { parent_id: parentId } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
  });

  return ok(areas.map((a) => ({ id: a.id, name: a.name, parent_id: a.parent_id })));
});
