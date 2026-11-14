import { NextRequest } from "next/server";
import { ContentAccessLevel, ContentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, parsePagination, meta } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  const { searchParams } = new URL(req.url);
  const { page, perPage, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const organizationId = searchParams.get("organization_id");

  const where: Prisma.CulturalContentWhereInput = { deleted_at: null };
  if (user.role === "super_admin") {
    if (organizationId) where.organization_id = organizationId;
  } else if (user.org_id) {
    where.OR = [
      { status: "approved", access_level: "publik" },
      { organization_id: user.org_id },
    ];
  } else {
    where.status = "approved";
    where.access_level = "publik";
  }
  if (status && Object.values(ContentStatus).includes(status as ContentStatus)) where.status = status as ContentStatus;

  const [total, rows] = await prisma.$transaction([
    prisma.culturalContent.count({ where }),
    prisma.culturalContent.findMany({
      where, include: { organization: true, contributors: true, consents: true },
      orderBy: { created_at: "desc" }, skip, take: perPage,
    }),
  ]);
  return ok(rows.map((c) => ({
    id: c.id, title: c.title, body: c.body, access_level: c.access_level, status: c.status,
    organization_id: c.organization_id, organization_name: c.organization.name,
    contributors: c.contributors.map((x) => ({ name: x.name, attribution: x.attribution_preference })),
    consents: c.consents.map((x) => ({ type: x.consent_type, scope: x.scope, revoked_at: x.revoked_at })),
    created_at: c.created_at, updated_at: c.updated_at,
  })), meta(page, perPage, total));
});

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  if (!["pengurus_komunitas", "curator", "super_admin"].includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Hanya pengurus/kurator yang dapat mengirim konten budaya");
  }
  const body = await readJson<Record<string, unknown>>(req);
  const title = String(body.title ?? "").trim();
  const contentBody = String(body.body ?? "").trim();
  const organizationId = String(body.organization_id ?? user.org_id ?? "");
  if (title.length < 3 || !organizationId) throw new HttpError(400, "VALIDATION_ERROR", "title dan organization_id wajib diisi");
  const access = String(body.access_level ?? "publik") as ContentAccessLevel;
  if (!Object.values(ContentAccessLevel).includes(access)) throw new HttpError(400, "VALIDATION_ERROR", "access_level tidak valid");

  const content = await prisma.culturalContent.create({
    data: {
      organization_id: organizationId, title, body: contentBody, access_level: access,
      status: body.status === "draft" ? "draft" : "submitted",
      contributors: body.contributor_name ? { create: { name: String(body.contributor_name), attribution_preference: "nama" } } : undefined,
      consents: body.consent_scope ? { create: { consent_type: "publish", scope: String(body.consent_scope) } } : undefined,
    },
    include: { organization: true },
  });
  await writeAudit({ actorId: user.id, action: "CREATE_CULTURAL_CONTENT", entityType: "cultural_content", entityId: content.id, after: { title, access_level: access }, req });
  return ok({ id: content.id, title: content.title, status: content.status, access_level: content.access_level }, undefined, 201);
});
