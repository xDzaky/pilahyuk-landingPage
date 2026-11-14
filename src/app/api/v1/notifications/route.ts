import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, parsePagination, meta } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const unreadOnly = searchParams.get("unread_only") === "true";

  const where = {
    user_id: user.id,
    ...(unreadOnly ? { read_at: null } : {}),
  };

  const [total, unreadCount, rows] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { user_id: user.id, read_at: null } }),
    prisma.notification.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: perPage,
    }),
  ]);

  return ok(
    rows.map((n) => ({
      id: n.id,
      type: n.type,
      payload: n.payload,
      read_at: n.read_at,
      created_at: n.created_at,
    })),
    {
      ...meta(page, perPage, total),
      unread_count: unreadCount,
    }
  );
});
