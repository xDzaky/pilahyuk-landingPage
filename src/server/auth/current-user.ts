import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { HttpError } from "@/server/http";
import { verifyAccessToken } from "./jwt";
import { ACCESS_COOKIE } from "./session";

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  org_id: string | null;
  status: string;
  profile: {
    area_id: string | null;
    district: string | null;
    village: string | null;
    rw: string | null;
  } | null;
}

export function getAccessToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return req.cookies.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = getAccessToken(req);
  if (!token) return null;
  try {
    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });
    if (!user || user.status !== "active") return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      org_id: user.org_id,
      status: user.status,
      profile: user.profile
        ? {
            area_id: user.profile.area_id,
            district: user.profile.district,
            village: user.profile.village,
            rw: user.profile.rw,
          }
        : null,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req);
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "Sesi tidak valid atau sudah berakhir");
  return user;
}

export function requireRole(user: AuthUser, roles: readonly string[]): void {
  if (!roles.includes(user.role)) {
    throw new HttpError(403, "FORBIDDEN", "Peran Anda tidak memiliki akses ke operasi ini");
  }
}

export async function requireOrgAccess(user: AuthUser, organizationId: string | null | undefined): Promise<void> {
  if (!organizationId) throw new HttpError(400, "VALIDATION_ERROR", "organization_id wajib diisi");
  if (user.role === "super_admin") return;
  if (user.org_id === organizationId) return;
  const membership = await prisma.organizationMember.findFirst({
    where: { user_id: user.id, organization_id: organizationId, status: "active" },
    select: { id: true },
  });
  if (!membership) {
    throw new HttpError(403, "FORBIDDEN", "Anda bukan anggota organisasi ini");
  }
}
