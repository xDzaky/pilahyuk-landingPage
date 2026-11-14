import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id: eventId } = await (context.params ?? Promise.resolve({ id: "" }));

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: { select: { registrations: true } },
      organization: { select: { id: true, name: true } },
    },
  });
  if (!event) throw new HttpError(404, "NOT_FOUND", "Kegiatan tidak ditemukan");
  if (event.status !== "upcoming" && event.status !== "ongoing") {
    throw new HttpError(400, "EVENT_NOT_ACTIVE", "Kegiatan sudah selesai atau dibatalkan");
  }

  // Cek kapasitas
  if (event.capacity && event._count.registrations >= event.capacity) {
    throw new HttpError(400, "CAPACITY_FULL", "Kapasitas peserta untuk kegiatan ini sudah penuh");
  }

  // Cek apakah sudah terdaftar
  const existing = await prisma.eventRegistration.findUnique({
    where: {
      event_id_user_id: {
        event_id: eventId,
        user_id: user.id,
      },
    },
  });
  if (existing) {
    if (existing.status === "cancelled") {
      const reactivated = await prisma.eventRegistration.update({
        where: { id: existing.id },
        data: { status: "registered" },
      });
      return ok({ message: "Pendaftaran berhasil diaktifkan kembali", registration: reactivated });
    }
    return ok({ message: "Anda sudah terdaftar pada kegiatan ini", registration: existing });
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      event_id: eventId,
      user_id: user.id,
      status: "registered",
    },
  });

  // Notifikasi konfirmasi pendaftaran
  await prisma.notification.create({
    data: {
      user_id: user.id,
      type: "event_registered",
      payload: {
        title: "Pendaftaran Kegiatan Berhasil",
        event_id: eventId,
        event_title: event.title,
        start_at: event.start_at,
        location: event.location,
      },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "REGISTER_EVENT",
    entityType: "event_registration",
    entityId: registration.id,
    after: { eventId, userId: user.id },
    req,
  });

  return ok(
    {
      id: registration.id,
      event_id: event.id,
      event_title: event.title,
      organization_name: event.organization.name,
      user_id: user.id,
      status: registration.status,
      created_at: registration.created_at,
    },
    undefined,
    201
  );
});
