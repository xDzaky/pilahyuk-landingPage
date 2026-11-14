import { NextRequest } from "next/server";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

const REVIEW_STATUSES: string[] = ["approved", "revised", "restricted", "rejected"];

export const PATCH = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  const body = await readJson<{ status?: unknown; review_notes?: unknown }>(req);
  const next = String(body.status ?? "");
  if (!Object.values(ContentStatus).includes(next as ContentStatus)) {
    throw new HttpError(400, "VALIDATION_ERROR", "status konten tidak valid", { allowed: Object.values(ContentStatus) });
  }

  const content = await prisma.culturalContent.findUnique({ where: { id } });
  if (!content) throw new HttpError(404, "NOT_FOUND", "Konten tidak ditemukan");

  const admin = user.role === "super_admin";
  const orgStaff = content.organization_id === user.org_id && ["pengurus_komunitas", "curator"].includes(user.role);
  if (!admin && !orgStaff) throw new HttpError(403, "FORBIDDEN", "Anda tidak berhak meninjau konten ini");
  if (REVIEW_STATUSES.includes(next) && !["curator", "super_admin"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Hanya kurator yang dapat menyetujui/menolak konten");
  }
  const notes = body.review_notes ? String(body.review_notes).trim() : null;
  if (["rejected", "revised"].includes(next) && !notes) {
    throw new HttpError(400, "VALIDATION_ERROR", "review_notes wajib diisi saat meminta revisi/menolak");
  }

  const updated = await prisma.culturalContent.update({
    where: { id },
    data: {
      status: next as ContentStatus,
      status_changed_at: new Date(),
      ...(notes ? { review_notes: notes } : {}),
    },
  });
  await writeAudit({ actorId: user.id, action: "REVIEW_CULTURAL_CONTENT", entityType: "cultural_content", entityId: id, before: { status: content.status }, after: { status: next, review_notes: notes }, req });
  return ok({ id: updated.id, title: updated.title, status: updated.status, review_notes: updated.review_notes });
});
