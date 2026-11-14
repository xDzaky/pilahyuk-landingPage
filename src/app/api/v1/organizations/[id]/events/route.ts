import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth, requireOrgAccess, requireRole } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id: organizationId } = await (context.params ?? Promise.resolve({ id: "" }));
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status")?.trim();

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, type: true },
  });
  if (!org) throw new HttpError(404, "NOT_FOUND", "Organisasi tidak ditemukan");

  const where = {
    organization_id: organizationId,
    ...(status ? { status } : {}),
  };

  const [total, events] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          where: { user_id: user.id },
          select: { id: true, status: true, checked_in_at: true },
        },
      },
      orderBy: { start_at: "asc" },
      skip,
      take: perPage,
    }),
  ]);

  return ok(
    events.map((e) => ({
      id: e.id,
      organization_id: e.organization_id,
      organization_name: org.name,
      title: e.title,
      description: e.description,
      start_at: e.start_at,
      end_at: e.end_at,
      location: e.location,
      capacity: e.capacity,
      status: e.status,
      participants_count: e._count.registrations,
      my_registration: e.registrations[0] ?? null,
      created_at: e.created_at,
    })),
    meta(page, perPage, total)
  );
});

interface CreateEventBody {
  title?: unknown;
  description?: unknown;
  start_at?: unknown;
  end_at?: unknown;
  location?: unknown;
  capacity?: unknown;
}

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id: organizationId } = await (context.params ?? Promise.resolve({ id: "" }));

  requireRole(user, ["pengurus_komunitas", "super_admin", "operator_bank_sampah"]);
  await requireOrgAccess(user, organizationId);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });
  if (!org) throw new HttpError(404, "NOT_FOUND", "Organisasi tidak ditemukan");

  const body = await readJson<CreateEventBody>(req);
  const title = String(body.title ?? "").trim();
  const startAtStr = String(body.start_at ?? "").trim();

  if (!title || !startAtStr) {
    throw new HttpError(400, "VALIDATION_ERROR", "title dan start_at wajib diisi");
  }

  const startAt = new Date(startAtStr);
  if (isNaN(startAt.getTime())) {
    throw new HttpError(400, "VALIDATION_ERROR", "Format start_at harus tanggal ISO-8601 yang valid");
  }

  let endAt: Date | null = null;
  if (body.end_at) {
    endAt = new Date(String(body.end_at));
    if (isNaN(endAt.getTime())) {
      throw new HttpError(400, "VALIDATION_ERROR", "Format end_at tidak valid");
    }
  }

  const capacity = body.capacity ? Math.max(1, Number(body.capacity)) : null;
  const location = typeof body.location === "string" ? body.location.trim() : null;
  const description = typeof body.description === "string" ? body.description.trim() : null;

  const event = await prisma.event.create({
    data: {
      organization_id: organizationId,
      title,
      description,
      start_at: startAt,
      end_at: endAt,
      location,
      capacity,
      status: "upcoming",
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "CREATE_EVENT",
    entityType: "event",
    entityId: event.id,
    after: { title, organizationId, startAt, location },
    req,
  });

  return ok(
    {
      id: event.id,
      organization_id: event.organization_id,
      organization_name: org.name,
      title: event.title,
      description: event.description,
      start_at: event.start_at,
      end_at: event.end_at,
      location: event.location,
      capacity: event.capacity,
      status: event.status,
      created_at: event.created_at,
    },
    undefined,
    201
  );
});
