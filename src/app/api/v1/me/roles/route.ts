import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { ROLE_CODE_BY_NAME } from "@/server/rbac";

interface RoleEntry {
  organization_id: string | null;
  organization_name: string;
  organization_type: string | null;
  role: string;
  role_name: string;
  status: string;
  primary: boolean;
  joined_at: string | null;
}

export const GET = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);

  if (auth.role === "super_admin") {
    return ok<RoleEntry[]>([{
      organization_id: null,
      organization_name: "PilahYuk",
      organization_type: null,
      role: "super_admin",
      role_name: "Super Admin",
      status: "active",
      primary: true,
      joined_at: null,
    }]);
  }

  const memberships = await prisma.organizationMember.findMany({
    where: { user_id: auth.id, status: "active", deleted_at: null },
    include: { organization: true, role: true },
    orderBy: { joined_at: "asc" },
  });

  const data: RoleEntry[] = memberships.map((m) => ({
    organization_id: m.organization_id,
    organization_name: m.organization.name,
    organization_type: m.organization.type,
    role: ROLE_CODE_BY_NAME[m.role.name] ?? "resident",
    role_name: m.role.name,
    status: m.status,
    primary: m.organization_id === auth.org_id,
    joined_at: m.joined_at ? m.joined_at.toISOString() : null,
  }));

  if (data.length === 0) {
    data.push({
      organization_id: null,
      organization_name: "",
      organization_type: null,
      role: auth.role,
      role_name: auth.role,
      status: "active",
      primary: true,
      joined_at: null,
    });
  }

  return ok(data);
});
