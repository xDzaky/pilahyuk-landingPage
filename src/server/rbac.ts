export const ROLE_NAME_BY_CODE: Record<string, string> = {
  super_admin: "Super Admin",
  resident: "Resident",
  volunteer: "Volunteer",
  pengurus_komunitas: "Community Admin",
  operator_bank_sampah: "Waste Bank Operator",
  collector: "Collector",
  recycler: "Recycler",
  curator: "Cultural Curator",
};

export const ROLE_CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_NAME_BY_CODE).map(([code, name]) => [name, code])
);

export const ADMIN_ROLES = ["super_admin"] as const;
export const STAFF_ROLES = [
  "super_admin",
  "operator_bank_sampah",
  "pengurus_komunitas",
  "collector",
  "recycler",
  "curator",
] as const;
export const WASTE_BANK_ROLES = ["super_admin", "operator_bank_sampah"] as const;
export const COMMUNITY_ROLES = ["super_admin", "pengurus_komunitas"] as const;
export const BATCH_ROLES = ["super_admin", "operator_bank_sampah", "pengurus_komunitas", "recycler"] as const;
export const COLLECTION_STAFF_ROLES = ["super_admin", "operator_bank_sampah", "pengurus_komunitas", "collector"] as const;

export function homeForRole(role: string): string {
  if (role === "super_admin") return "/admin/overview";
  if (role === "resident" || role === "volunteer") return "/dampak";
  return "/dashboard";
}
