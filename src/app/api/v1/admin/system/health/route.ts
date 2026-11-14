import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok } from "@/server/http";
import { requireAuth, requireRole } from "@/server/auth/current-user";
import { ADMIN_ROLES } from "@/server/rbac";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  requireRole(user, ADMIN_ROLES);

  const started = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const latency = Date.now() - started;
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [users, orgs, transactionsToday, batchesMonth] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count({ where: { deleted_at: null } }),
    prisma.weighingTransaction.count({ where: { transaction_at: { gte: todayStart } } }),
    prisma.materialBatch.count({ where: { created_at: { gte: monthStart } } }),
  ]);

  return ok({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: { database: { status: "up", latency_ms: latency }, storage: { status: process.env.CLOUDFLARE_R2_BUCKET ? "configured" : "not_configured" } },
    stats: { total_users: users, active_orgs: orgs, transactions_today: transactionsToday, batches_this_month: batchesMonth },
  });
});
