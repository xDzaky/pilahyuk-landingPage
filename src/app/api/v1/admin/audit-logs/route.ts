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
  const actorId = searchParams.get("actor_id");
  const entityType = searchParams.get("entity_type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.AuditLogWhereInput = {
    ...(actorId ? { actor_id: actorId } : {}),
    ...(entityType ? { entity_type: entityType } : {}),
    ...(from || to ? { occurred_at: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ where, include: { actor: { select: { id: true, name: true } } }, orderBy: { occurred_at: "desc" }, skip, take: perPage }),
  ]);

  return ok(rows.map((log) => ({
    id: log.id, actor_id: log.actor_id, actor_name: log.actor?.name ?? null,
    action: log.action, entity_type: log.entity_type, entity_id: log.entity_id,
    before: log.before, after: log.after, ip: log.ip, device: log.device, occurred_at: log.occurred_at,
  })), meta(page, perPage, total));
});
