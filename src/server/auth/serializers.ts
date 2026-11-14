import type { Prisma } from "@prisma/client";

export type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;

export function toPublicUser(user: UserWithProfile, orgName: string | null = null) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    org_id: user.org_id,
    org_name: orgName,
    avatar: user.profile?.avatar_url ?? null,
    status: user.status,
    contact_verified: user.contact_verified,
    district: user.profile?.district ?? null,
    village: user.profile?.village ?? null,
    rw: user.profile?.rw ?? null,
    area_id: user.profile?.area_id ?? null,
    created_at: user.created_at,
    last_login_at: user.last_login_at,
  };
}
