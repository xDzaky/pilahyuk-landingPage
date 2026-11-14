import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

interface CheckInBody {
  user_id?: unknown; // jika pengurus yang melakukan check-in untuk peserta
}

export const POST = route(async (req: NextRequest, context) => {
  const actor = await requireAuth(req);
  const { id: eventId } = await (context.params ?? Promise.resolve({ id: "" }));

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organization: true },
  });
  if (!event) throw new HttpError(404, "NOT_FOUND", "Kegiatan tidak ditemukan");

  let body: CheckInBody = {};
  try {
    body = await readJson<CheckInBody>(req);
  } catch {
    // Body opsional jika user check in untuk dirinya sendiri
  }

  let targetUserId = actor.id;
  if (body.user_id && typeof body.user_id === "string") {
    // Hanya pengurus komunitas atau super_admin yang boleh check-in atas nama orang lain
    const isStaff =
      actor.role === "super_admin" ||
      (actor.org_id === event.organization_id && ["pengurus_komunitas", "operator_bank_sampah"].includes(actor.role));
    if (!isStaff) {
      throw new HttpError(403, "FORBIDDEN", "Hanya pengurus yang dapat melakukan check-in atas nama orang lain");
    }
    targetUserId = body.user_id;
  }

  let registration = await prisma.eventRegistration.findUnique({
    where: {
      event_id_user_id: {
        event_id: eventId,
        user_id: targetUserId,
      },
    },
  });

  const now = new Date();
  if (!registration) {
    // On-the-spot registration + check-in
    registration = await prisma.eventRegistration.create({
      data: {
        event_id: eventId,
        user_id: targetUserId,
        status: "attended",
        checked_in_at: now,
      },
    });
  } else {
    registration = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        status: "attended",
        checked_in_at: now,
      },
    });
  }

  await writeAudit({
    actorId: actor.id,
    action: "CHECK_IN_EVENT",
    entityType: "event_registration",
    entityId: registration.id,
    after: { eventId, userId: targetUserId, checkedInAt: now },
    req,
  });

  return ok({
    id: registration.id,
    event_id: event.id,
    event_title: event.title,
    user_id: targetUserId,
    status: registration.status,
    checked_in_at: registration.checked_in_at,
    message: "Presensi kehadiran berhasil dicatat",
  });
});
