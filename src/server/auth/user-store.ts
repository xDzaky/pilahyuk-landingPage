// src/server/auth/user-store.ts
// In-memory user store for demo/pilot. Lives for the lifetime of a server
// instance — replace with Prisma queries (prisma/schema.prisma -> users) when
// the database is wired. Passwords are bcrypt-hashed even in memory so the
// same code path keeps working after the switch.
import bcrypt from "bcryptjs"

export type UserRole =
  | "resident"
  | "volunteer"
  | "super_admin"
  | "operator_bank_sampah"
  | "pengurus_komunitas"
  | "collector"
  | "recycler"
  | "curator"

export interface StoredUser {
  id: string
  name: string
  email: string | null
  phone: string | null
  password_hash: string
  role: UserRole
  org_id: string | null
  org_name: string | null
  avatar: string | null
  status: "active" | "suspended"
  contact_verified: boolean
  district: string | null
  village: string | null
  rw: string | null
  created_at: string
}

/** Digits only, with Indonesian country code normalized to a leading 0. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "")
  if (digits.startsWith("+62")) return "0" + digits.slice(3)
  if (digits.startsWith("62")) return "0" + digits.slice(2)
  return digits
}

const hash = (plain: string) => bcrypt.hashSync(plain, 8)

const DEMO_USERS: StoredUser[] = [
  {
    id: "user-superadmin-001",
    name: "Super Admin",
    email: "admin@pilahyuk.id",
    phone: "081200000001",
    password_hash: hash("admin123"),
    role: "super_admin",
    org_id: null,
    org_name: null,
    avatar: null,
    status: "active",
    contact_verified: true,
    district: null,
    village: null,
    rw: null,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-operator-001",
    name: "Budi Santoso",
    email: "operator@banksampah.id",
    phone: "081200000002",
    password_hash: hash("operator123"),
    role: "operator_bank_sampah",
    org_id: "org-001",
    org_name: "Bank Sampah Berkah Jaya",
    avatar: null,
    status: "active",
    contact_verified: true,
    district: "Kecamatan Sukmajaya",
    village: "Kelurahan Mekarjaya",
    rw: "RW 02",
    created_at: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "user-pengurus-001",
    name: "Siti Rahayu",
    email: "pengurus@komunitas.id",
    phone: "081200000003",
    password_hash: hash("pengurus123"),
    role: "pengurus_komunitas",
    org_id: "org-002",
    org_name: "Komunitas Hijau Nusantara",
    avatar: null,
    status: "active",
    contact_verified: true,
    district: "Kecamatan Cilodong",
    village: "Kelurahan Kalimulya",
    rw: "RW 03",
    created_at: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "user-warga-001",
    name: "Dewi Lestari",
    email: "warga@pilahyuk.id",
    phone: "081200000004",
    password_hash: hash("warga123"),
    role: "resident",
    org_id: "org-002",
    org_name: "Komunitas Hijau Nusantara",
    avatar: null,
    status: "active",
    contact_verified: true,
    district: "Kecamatan Cilodong",
    village: "Kelurahan Sukamaju",
    rw: "RW 05",
    created_at: "2026-02-01T00:00:00.000Z",
  },
]

// Survive Next.js dev HMR by keeping the array on globalThis.
const globalStore = globalThis as unknown as { __pilahyukUsers?: StoredUser[] }
const users: StoredUser[] = globalStore.__pilahyukUsers ?? [...DEMO_USERS]
globalStore.__pilahyukUsers = users

export function allUsers(): StoredUser[] {
  return users
}

export function findById(id: string): StoredUser | undefined {
  return users.find((u) => u.id === id)
}

export function findByIdentifier(identifier: string): StoredUser | undefined {
  const value = identifier.trim().toLowerCase()
  const phone = normalizePhone(identifier)
  return users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === value) ||
      (u.phone && phone.length >= 8 && u.phone === phone)
  )
}

export function isIdentifierTaken(identifier: string): boolean {
  return !!findByIdentifier(identifier)
}

export interface CreateUserInput {
  name: string
  email?: string | null
  phone?: string | null
  password: string
  role?: UserRole
  org_id?: string | null
  org_name?: string | null
  district?: string | null
  village?: string | null
  rw?: string | null
}

export function createUser(input: CreateUserInput): StoredUser {
  const user: StoredUser = {
    id: `user-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    email: input.email?.trim().toLowerCase() || null,
    phone: input.phone ? normalizePhone(input.phone) : null,
    password_hash: hash(input.password),
    role: input.role ?? "resident",
    org_id: input.org_id ?? null,
    org_name: input.org_name ?? null,
    avatar: null,
    status: "active",
    contact_verified: false,
    district: input.district?.trim() || null,
    village: input.village?.trim() || null,
    rw: input.rw?.trim() || null,
    created_at: new Date().toISOString(),
  }
  users.push(user)
  return user
}

export function verifyPassword(user: StoredUser, password: string): boolean {
  return bcrypt.compareSync(password, user.password_hash)
}

export function setPassword(user: StoredUser, password: string): void {
  user.password_hash = hash(password)
}

export function markContactVerified(user: StoredUser): void {
  user.contact_verified = true
}

/** Shape safe to return to clients — never includes password_hash. */
export function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    org_id: user.org_id,
    org_name: user.org_name,
    avatar: user.avatar,
    status: user.status,
    contact_verified: user.contact_verified,
    district: user.district,
    village: user.village,
    rw: user.rw,
    created_at: user.created_at,
  }
}
