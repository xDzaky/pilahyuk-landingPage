import { NextRequest } from "next/server";
import type { User } from "@prisma/client";
import { prisma } from "@/server/db";
import { signAccessToken } from "./jwt";
import { createRefreshToken } from "./session";

export async function orgNameFor(orgId: string | null): Promise<string | null> {
  if (!orgId) return null;
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } });
  return org?.name ?? null;
}

export async function issueSession(user: User, req: NextRequest) {
  const access = await signAccessToken({
    sub: user.id,
    role: user.role,
    org_id: user.org_id,
    name: user.name,
    email: user.email,
  });
  const refresh = await createRefreshToken(user.id, req);
  return { access, refresh, expiresIn: 60 * 60 * 8, refreshExpiresIn: 60 * 60 * 24 * 30 };
}
