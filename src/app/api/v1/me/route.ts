import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { verifyPassword, hashPassword } from "@/server/auth/password";
import { normalizePhone, isDevAuth } from "@/server/auth/otp";
import { orgNameFor } from "@/server/auth/issue-session";
import { toPublicUser } from "@/server/auth/serializers";
import { clearAuthCookies, revokeAllUserTokens } from "@/server/auth/session";
import { writeAudit } from "@/server/audit";

export const GET = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const user = await prisma.user.findUnique({ where: { id: auth.id }, include: { profile: true } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Pengguna tidak ditemukan");
  return ok(toPublicUser(user, await orgNameFor(user.org_id)));
});

export const PATCH = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const body = await readJson<Record<string, unknown>>(req);
  const user = await prisma.user.findUnique({ where: { id: auth.id }, include: { profile: true } });
  if (!user) throw new HttpError(404, "NOT_FOUND", "Pengguna tidak ditemukan");

  const before = { name: user.name, phone: user.phone, district: user.profile?.district, village: user.profile?.village, rw: user.profile?.rw };
  const data: Record<string, unknown> = {};
  const profileData: Record<string, unknown> = {};
  let passwordChanged = false;

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 3) throw new HttpError(400, "VALIDATION_ERROR", "Nama minimal 3 karakter", { name: ["Minimal 3 karakter"] });
    data.name = name;
  }

  const wantsPhone = body.phone !== undefined && String(body.phone).trim() !== user.phone;
  const wantsPassword = typeof body.password === "string" && body.password.length > 0;
  if (wantsPhone || wantsPassword) {
    const current = typeof body.current_password === "string" ? body.current_password : "";
    if (!current || !(await verifyPassword(current, user.password_hash))) {
      throw new HttpError(400, "INVALID_PASSWORD", "Password saat ini salah", { current_password: ["Wajib benar"] });
    }
  }

  if (wantsPhone) {
    const phone = normalizePhone(String(body.phone));
    if (!/^08[1-9][0-9]{6,11}$/.test(phone)) {
      throw new HttpError(400, "VALIDATION_ERROR", "Format nomor HP tidak valid", { phone: ["Contoh: 08123456789"] });
    }
    const existing = await prisma.user.findFirst({ where: { phone, NOT: { id: user.id } }, select: { id: true } });
    if (existing) throw new HttpError(409, "CONFLICT", "Nomor HP sudah dipakai akun lain");
    data.phone = phone;
    data.contact_verified = false;
  }

  if (wantsPassword) {
    const password = String(body.password);
    if (password.length < 8) throw new HttpError(400, "VALIDATION_ERROR", "Kata sandi minimal 8 karakter", { password: ["Minimal 8 karakter"] });
    data.password_hash = await hashPassword(password);
    passwordChanged = true;
  }

  for (const field of ["district", "village", "rw"] as const) {
    if (body[field] !== undefined) profileData[field] = String(body[field]).trim() || null;
  }
  if (body.area_id !== undefined) {
    const areaId = String(body.area_id).trim();
    const area = areaId ? await prisma.area.findUnique({ where: { id: areaId }, select: { id: true } }) : null;
    if (areaId && !area) throw new HttpError(400, "VALIDATION_ERROR", "area_id tidak ditemukan");
    profileData.area_id = areaId || null;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({ where: { id: user.id }, data, include: { profile: true } });
    if (Object.keys(profileData).length > 0) {
      await tx.userProfile.upsert({
        where: { user_id: user.id },
        create: { user_id: user.id, ...profileData },
        update: profileData,
      });
    }
    return tx.user.findUniqueOrThrow({ where: { id: user.id }, include: { profile: true } });
  });

  if (passwordChanged) await revokeAllUserTokens(user.id);

  await writeAudit({
    actorId: user.id, action: "UPDATE_PROFILE", entityType: "user", entityId: user.id,
    before, after: { name: updated.name, phone: updated.phone, district: updated.profile?.district, village: updated.profile?.village, rw: updated.profile?.rw }, req,
  });

  const response = ok({
    ...toPublicUser(updated, await orgNameFor(updated.org_id)),
    re_login_required: passwordChanged,
  });
  return passwordChanged ? clearAuthCookies(response) : response;
});
