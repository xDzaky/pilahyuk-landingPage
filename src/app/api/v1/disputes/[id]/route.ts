import { NextRequest } from "next/server";
import { DisputeStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { loadDispute, assertDisputeStakeholder, disputeInclude, serializeDispute } from "@/server/services/disputes";
import { writeAudit } from "@/server/audit";

const STAFF_STATUSES: string[] = ["assigned", "in_review"];
const ADMIN_STATUSES: string[] = ["resolved", "rejected"];

export const PATCH = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ status?: unknown; assigned_to?: unknown; resolution?: unknown }>(req);
  const next = String(body.status ?? "");
  if (!Object.values(DisputeStatus).includes(next as DisputeStatus)) {
    throw new HttpError(400, "VALIDATION_ERROR", "Status sengketa tidak valid");
  }

  const dispute = await loadDispute(id);
  const stakeholder = await assertDisputeStakeholder(user, dispute);
  if (!stakeholder) throw new HttpError(403, "FORBIDDEN", "Anda tidak berhak menangani sengketa ini");
  if (user.role !== "super_admin") {
    if (ADMIN_STATUSES.includes(next)) throw new HttpError(403, "FORBIDDEN", "Hanya Super Admin yang dapat menyelesaikan sengketa");
    if (!STAFF_STATUSES.includes(next)) throw new HttpError(403, "FORBIDDEN", "Peran Anda tidak dapat mengubah status ini");
  }
  if (ADMIN_STATUSES.includes(next) && !String(body.resolution ?? "").trim()) {
    throw new HttpError(400, "VALIDATION_ERROR", "resolution wajib diisi saat menyelesaikan/menolak");
  }

  const updated = await prisma.dispute.update({
    where: { id },
    data: {
      status: next as DisputeStatus,
      status_changed_at: new Date(),
      ...(body.assigned_to !== undefined ? { assigned_to: String(body.assigned_to) } : {}),
      ...(body.resolution !== undefined ? { resolution: String(body.resolution) } : {}),
      ...(ADMIN_STATUSES.includes(next) ? { resolved_at: new Date() } : {}),
    },
    include: disputeInclude,
  });
  await writeAudit({ actorId: user.id, action: "UPDATE_DISPUTE", entityType: "dispute", entityId: id, before: { status: dispute.status }, after: { status: next, resolution: body.resolution ?? null }, req });
  return ok(serializeDispute(updated));
});
