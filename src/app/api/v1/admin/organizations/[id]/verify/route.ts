import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth, requireRole } from "@/server/auth/current-user";
import { ADMIN_ROLES } from "@/server/rbac";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  requireRole(user, ADMIN_ROLES);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ action?: unknown; reason?: unknown }>(req);
  const action = String(body.action ?? "");
  if (!["approve", "reject"].includes(action)) {
    throw new HttpError(400, "VALIDATION_ERROR", "action harus approve atau reject");
  }
  if (action === "reject" && !String(body.reason ?? "").trim()) {
    throw new HttpError(400, "VALIDATION_ERROR", "reason wajib diisi saat menolak");
  }

  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) throw new HttpError(404, "NOT_FOUND", "Organisasi tidak ditemukan");

  const updated = await prisma.organization.update({
    where: { id },
    data: {
      status: action === "approve" ? "verified" : "unverified",
      verified_at: action === "approve" ? new Date() : null,
      status_changed_at: new Date(),
    },
  });
  await writeAudit({ actorId: user.id, action: "VERIFY_ORGANIZATION", entityType: "organization", entityId: id, before: { status: org.status }, after: { status: updated.status, reason: body.reason ?? null }, req });
  return ok({ org_id: updated.id, status: updated.status, verified_at: updated.verified_at, reason: body.reason ?? null });
});
