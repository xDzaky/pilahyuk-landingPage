import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getIp, getUserAgent } from "@/server/http";

const REFRESH_TTL_DAYS = 30;
export const ACCESS_COOKIE = "pilahyuk_token";
export const REFRESH_COOKIE = "pilahyuk_refresh";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createRefreshToken(userId: string, req: NextRequest): Promise<string> {
  const raw = randomBytes(48).toString("base64url");
  await prisma.refreshToken.create({
    data: {
      user_id: userId,
      token_hash: hashToken(raw),
      user_agent: getUserAgent(req),
      ip: getIp(req),
      expires_at: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  return raw;
}

export async function rotateRefreshToken(raw: string, req: NextRequest) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token_hash: hashToken(raw) },
    include: { user: true },
  });
  if (!stored || stored.revoked_at || stored.expires_at.getTime() <= Date.now()) return null;
  if (stored.user.status !== "active") return null;

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked_at: new Date() },
  });
  const refresh = await createRefreshToken(stored.user_id, req);
  return { user: stored.user, refresh };
}

export async function revokeRefreshToken(raw: string | undefined): Promise<void> {
  if (!raw) return;
  await prisma.refreshToken.updateMany({
    where: { token_hash: hashToken(raw), revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { user_id: userId, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

export function setAuthCookies(res: NextResponse, access: string, refresh: string): NextResponse {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ACCESS_COOKIE, access, {
    httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8,
  });
  res.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true, secure, sameSite: "lax", path: "/api/v1/auth", maxAge: 60 * 60 * 24 * REFRESH_TTL_DAYS,
  });
  return res;
}

export function clearAuthCookies(res: NextResponse): NextResponse {
  res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { path: "/api/v1/auth", maxAge: 0 });
  return res;
}
