import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";

export const PATCH = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id } = await (context.params ?? Promise.resolve({ id: "" }));

  const notif = await prisma.notification.findUnique({
    where: { id },
  });
  if (!notif) throw new HttpError(404, "NOT_FOUND", "Notifikasi tidak ditemukan");
  if (notif.user_id !== user.id && user.role !== "super_admin") {
    throw new HttpError(403, "FORBIDDEN", "Anda tidak berhak mengakses notifikasi ini");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      read_at: notif.read_at ?? new Date(),
    },
  });

  return ok({
    id: updated.id,
    type: updated.type,
    payload: updated.payload,
    read_at: updated.read_at,
    created_at: updated.created_at,
  });
});
