import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { hashPassword } from "@/server/auth/password";
import { normalizePhone, createOtp, isDevAuth } from "@/server/auth/otp";
import { issueSession, orgNameFor } from "@/server/auth/issue-session";
import { toPublicUser } from "@/server/auth/serializers";
import { setAuthCookies } from "@/server/auth/session";
import { writeAudit } from "@/server/audit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^08[1-9][0-9]{6,11}$/;

export const POST = route(async (req: NextRequest) => {
  await enforceRateLimit(`register:ip:${getIp(req)}`, 5, 3600);

  const body = await readJson<Record<string, unknown>>(req);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const district = typeof body.district === "string" ? body.district.trim() : "";
  const village = typeof body.village === "string" ? body.village.trim() : "";
  const rw = typeof body.rw === "string" ? body.rw.trim() : "";
  const areaId = typeof body.area_id === "string" ? body.area_id.trim() : "";
  const communityId = typeof body.community_id === "string" ? body.community_id.trim() : "";
  const communityName = typeof body.community_name === "string" ? body.community_name.trim() : "";
  const requestedRole = typeof body.role === "string" ? body.role : "resident";
  const role = ["resident", "volunteer"].includes(requestedRole) ? requestedRole : "resident";
  const phone = phoneRaw ? normalizePhone(phoneRaw) : "";

  const details: Record<string, string[]> = {};
  if (name.length < 3) details.name = ["Nama lengkap minimal 3 karakter"];
  if (!phone && !email) details.identifier = ["Isi nomor WhatsApp atau email"];
  if (phone && !PHONE_RE.test(phone)) details.phone = ["Format nomor WhatsApp tidak valid (contoh: 08123456789)"];
  if (email && !EMAIL_RE.test(email)) details.email = ["Format email tidak valid"];
  if (password.length < 8) details.password = ["Kata sandi minimal 8 karakter"];
  if (Object.keys(details).length > 0) {
    throw new HttpError(400, "VALIDATION_ERROR", "Data registrasi belum lengkap atau tidak valid", details);
  }

  const identifier = phone || email;
  await enforceRateLimit(`register:id:${identifier}`, 3, 3600);

  const existing = await prisma.user.findFirst({
    where: { OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])] },
    select: { id: true },
  });
  if (existing) throw new HttpError(409, "CONFLICT", "Nomor WhatsApp atau email sudah terdaftar. Silakan masuk.");

  if (areaId) {
    const area = await prisma.area.findUnique({ where: { id: areaId }, select: { id: true } });
    if (!area) throw new HttpError(400, "VALIDATION_ERROR", "area_id tidak ditemukan");
  }

  const community = communityId || communityName
    ? await prisma.organization.findFirst({
        where: {
          type: "community",
          ...(communityId ? { id: communityId } : { name: { equals: communityName, mode: "insensitive" } }),
        },
        select: { id: true, name: true },
      })
    : null;

  const user = await prisma.user.create({
    data: {
      name, phone: phone || null, email: email || null,
      password_hash: await hashPassword(password), role, status: "active",
      contact_verified: false,
      profile: { create: { area_id: areaId || null, district: district || null, village: village || null, rw: rw || null } },
    },
    include: { profile: true },
  });

  if (community) {
    const roleName = role === "volunteer" ? "Volunteer" : "Resident";
    const roleRecord = await prisma.role.findUnique({ where: { name: roleName } });
    if (roleRecord) {
      await prisma.organizationMember.create({
        data: { organization_id: community.id, user_id: user.id, role_id: roleRecord.id, status: "pending" },
      }).catch(() => undefined);
    }
  }

  let otp: { channel: string; expires_in: number; dev_code?: string } | null = null;
  let otpError: string | null = null;
  if (phone) {
    try {
      const created = await createOtp(phone, "contact_verify");
      otp = { channel: "whatsapp", expires_in: created.expiresIn, ...(isDevAuth() ? { dev_code: created.code } : {}) };
    } catch {
      otpError = "Kode verifikasi gagal dikirim. Coba minta ulang dari halaman verifikasi.";
    }
  }

  const session = await issueSession(user, req);
  await writeAudit({ actorId: user.id, action: "REGISTER", entityType: "user", entityId: user.id, after: { role, community_id: community?.id ?? null }, req });

  const response = ok({
    token: session.access,
    refresh_token: session.refresh,
    token_type: "Bearer",
    expires_in: session.expiresIn,
    refresh_expires_in: session.refreshExpiresIn,
    user: toPublicUser(user, await orgNameFor(user.org_id)),
    next_step: phone ? "verify_contact" : "complete_profile",
    otp,
    otp_error: otpError,
  }, undefined, 201);
  return setAuthCookies(response, session.access, session.refresh);
});
