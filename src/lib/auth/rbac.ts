// Role-Based Access Control definitions
// All roles in PilahYuk 2.0

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  OPERATOR_BANK_SAMPAH: "operator_bank_sampah",
  PENGURUS_KOMUNITAS: "pengurus_komunitas",
  ANGGOTA_KOMUNITAS: "anggota_komunitas",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  operator_bank_sampah: "Operator Bank Sampah",
  pengurus_komunitas: "Pengurus Komunitas",
  anggota_komunitas: "Anggota Komunitas",
};

// Permission map: what each role can do
export const PERMISSIONS = {
  // Super Admin
  "org.verify": [ROLES.SUPER_ADMIN],
  "org.reject": [ROLES.SUPER_ADMIN],
  "material.price.update": [ROLES.SUPER_ADMIN],
  "batch.validate": [ROLES.SUPER_ADMIN],
  "dispute.resolve": [ROLES.SUPER_ADMIN],
  "user.suspend": [ROLES.SUPER_ADMIN],
  "audit.view": [ROLES.SUPER_ADMIN],
  "platform.config": [ROLES.SUPER_ADMIN],

  // Operator Bank Sampah
  "weighing.create": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH],
  "weighing.view": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH],
  "ledger.view_all": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH],
  "batch.create": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH],
  "batch.view": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH, ROLES.PENGURUS_KOMUNITAS],
  "report.download": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH, ROLES.PENGURUS_KOMUNITAS],

  // Pengurus Komunitas
  "member.approve": [ROLES.SUPER_ADMIN, ROLES.PENGURUS_KOMUNITAS],
  "member.reject": [ROLES.SUPER_ADMIN, ROLES.PENGURUS_KOMUNITAS],
  "event.create": [ROLES.SUPER_ADMIN, ROLES.PENGURUS_KOMUNITAS],
  "task.assign": [ROLES.SUPER_ADMIN, ROLES.PENGURUS_KOMUNITAS],

  // Any logged-in user
  "profile.view_self": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH, ROLES.PENGURUS_KOMUNITAS, ROLES.ANGGOTA_KOMUNITAS],
  "ledger.view_self": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH, ROLES.PENGURUS_KOMUNITAS, ROLES.ANGGOTA_KOMUNITAS],
  "pickup.request": [ROLES.SUPER_ADMIN, ROLES.OPERATOR_BANK_SAMPAH, ROLES.PENGURUS_KOMUNITAS, ROLES.ANGGOTA_KOMUNITAS],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

// Status transition maps (server-side validation)
export const COLLECTION_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["picked_up", "cancelled"],
  picked_up: ["completed"],
  completed: [],
  cancelled: [],
};

export const BATCH_STATUS_TRANSITIONS: Record<string, string[]> = {
  batch_created: ["material_sorted"],
  material_sorted: ["pickup_scheduled"],
  pickup_scheduled: ["picked_up"],
  picked_up: ["batch_validated", "disputed"],
  batch_validated: ["batch_completed"],
  disputed: ["batch_validated", "batch_created"],
  batch_completed: [],
};

export function isValidTransition(
  map: Record<string, string[]>,
  from: string,
  to: string
): boolean {
  return (map[from] || []).includes(to);
}
