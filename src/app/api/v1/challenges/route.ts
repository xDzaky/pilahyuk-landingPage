import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, parsePagination, meta } from "@/server/http";
import { getAuthUser, requireAuth, requireRole } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest) => {
  const auth = await getAuthUser(req);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status")?.trim() || "active";

  const where = {
    ...(status !== "all" ? { status } : {}),
  };

  const [total, challenges] = await prisma.$transaction([
    prisma.challenge.count({ where }),
    prisma.challenge.findMany({
      where,
      include: {
        _count: { select: { participants: true } },
        ...(auth
          ? {
              participants: {
                where: { user_id: auth.id },
                select: { id: true, score: true, joined_at: true },
              },
            }
          : {}),
      },
      orderBy: { created_at: "desc" },
      skip,
      take: perPage,
    }),
  ]);

  return ok(
    challenges.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      start_at: c.start_at,
      end_at: c.end_at,
      status: c.status,
      participants_count: c._count.participants,
      my_participation: auth && c.participants ? c.participants[0] ?? null : null,
      created_at: c.created_at,
    })),
    meta(page, perPage, total)
  );
});

interface CreateChallengeBody {
  title?: unknown;
  description?: unknown;
  start_at?: unknown;
  end_at?: unknown;
}

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  requireRole(user, ["pengurus_komunitas", "super_admin"]);

  const body = await readJson<CreateChallengeBody>(req);
  const title = String(body.title ?? "").trim();
  const startAtStr = String(body.start_at ?? "").trim();
  const endAtStr = String(body.end_at ?? "").trim();

  if (!title || !startAtStr || !endAtStr) {
    throw new HttpError(400, "VALIDATION_ERROR", "title, start_at, dan end_at wajib diisi");
  }

  const startAt = new Date(startAtStr);
  const endAt = new Date(endAtStr);
  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
    throw new HttpError(400, "VALIDATION_ERROR", "Format tanggal harus ISO-8601 yang valid");
  }

  const description = typeof body.description === "string" ? body.description.trim() : null;

  const challenge = await prisma.challenge.create({
    data: {
      title,
      description,
      start_at: startAt,
      end_at: endAt,
      status: "active",
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "CREATE_CHALLENGE",
    entityType: "challenge",
    entityId: challenge.id,
    after: { title, startAt, endAt },
    req,
  });

  return ok(
    {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      start_at: challenge.start_at,
      end_at: challenge.end_at,
      status: challenge.status,
      created_at: challenge.created_at,
    },
    undefined,
    201
  );
});
