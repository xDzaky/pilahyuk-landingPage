// ============================================================
// PilahYuk 2.0 — API Helpers: Response, Auth, Rate-limit
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import {
  tokenStore,
  userRolesStore,
  auditLogsStore,
  rateLimitStore,
  usersStore,
  type TokenRecord,
} from "./mock-data";
import type { UserRole } from "@/types/api";

// ─── Response Helpers ─────────────────────────────────────────
export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json({ data, meta }, { status });
}

export function paginate<T>(
  items: T[],
  page: number,
  per_page: number
): NextResponse {
  const total = items.length;
  const total_pages = Math.ceil(total / per_page);
  const slice = items.slice((page - 1) * per_page, page * per_page);
  return NextResponse.json({
    data: slice,
    meta: { page, per_page, total, total_pages },
  });
}

export function err(code: string, message: string, status: number, details?: unknown): NextResponse {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

// ─── Pagination Query Parser ──────────────────────────────────
export function parsePagination(req: NextRequest): { page: number; per_page: number } {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const per_page = Math.min(100, Math.max(1, parseInt(url.searchParams.get("per_page") ?? "20", 10)));
  return { page, per_page };
}

// ─── Auth Middleware ──────────────────────────────────────────
export interface AuthContext {
  user_id: string;
  user_name: string;
  roles: Array<{ org_id: string; role: UserRole }>;
  is_super_admin: boolean;
}

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export function resolveAuth(req: NextRequest): AuthContext | null {
  const token = extractToken(req);
  if (!token) return null;
  const record: TokenRecord | undefined = tokenStore.get(token);
  if (!record) return null;
  if (Date.now() > record.expires_at) {
    tokenStore.delete(token);
    return null;
  }
  const user = usersStore.find(u => u.id === record.user_id);
  if (!user) return null;

  const roles = userRolesStore
    .filter(r => r.user_id === record.user_id)
    .map(r => ({ org_id: r.org_id, role: r.role as UserRole }));

  const is_super_admin = roles.some(r => r.role === "super_admin");

  return { user_id: record.user_id, user_name: user.name, roles, is_super_admin };
}

export function requireAuth(req: NextRequest): AuthContext | NextResponse {
  const ctx = resolveAuth(req);
  if (!ctx) return err("UNAUTHORIZED", "Missing or invalid authentication token", 401);
  return ctx;
}

export function requireRole(ctx: AuthContext, org_id: string, ...allowedRoles: UserRole[]): boolean {
  if (ctx.is_super_admin) return true;
  return ctx.roles.some(r => r.org_id === org_id && allowedRoles.includes(r.role));
}

export function requireSuperAdmin(ctx: AuthContext): boolean {
  return ctx.is_super_admin;
}

// ─── Audit Log Writer ─────────────────────────────────────────
let auditSeq = auditLogsStore.length;
export function writeAuditLog(
  ctx: AuthContext,
  action: string,
  entity_type: string,
  entity_id: string,
  org_id: string | null,
  req: NextRequest,
  details: Record<string, unknown> = {}
): void {
  auditSeq++;
  auditLogsStore.unshift({
    id: `aud-${String(auditSeq).padStart(3, "0")}`,
    actor_id: ctx.user_id,
    actor_name: ctx.user_name,
    action,
    entity_type,
    entity_id,
    org_id,
    ip_address: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
    user_agent: req.headers.get("user-agent") ?? "unknown",
    details,
    created_at: new Date().toISOString(),
  });
}

// ─── Rate Limiting ────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX: Record<string, number> = {
  "auth": 10,
  "upload": 20,
};

export function checkRateLimit(key: string, bucket: keyof typeof RATE_LIMIT_MAX): NextResponse | null {
  const now = Date.now();
  const max = RATE_LIMIT_MAX[bucket] ?? 60;
  const existing = rateLimitStore.get(key);
  if (!existing || now - existing.window_start > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, window_start: now });
    return null;
  }
  if (existing.count >= max) {
    return err("RATE_LIMITED", `Too many requests. Max ${max} per minute.`, 429);
  }
  existing.count++;
  return null;
}

// ─── Idempotency Check ────────────────────────────────────────
import { idempotencyStore } from "./mock-data";

export function checkIdempotency(key: string | null): { hit: boolean; response?: NextResponse } {
  if (!key) return { hit: false };
  const existing = idempotencyStore.get(key);
  if (existing) {
    return { hit: true, response: NextResponse.json(existing.response) };
  }
  return { hit: false };
}

export function storeIdempotency(key: string | null, response: unknown): void {
  if (!key) return;
  idempotencyStore.set(key, { processed_at: new Date().toISOString(), response });
}

// ─── Token Generator (simple mock) ───────────────────────────
export function generateTokens(user_id: string): { access_token: string; refresh_token: string; expires_in: number } {
  const access_token = `mock_access_${user_id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const refresh_token = `mock_refresh_${user_id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const expires_in = 3600; // 1 hour in seconds
  const expires_at = Date.now() + expires_in * 1000;

  tokenStore.set(access_token, { user_id, access_token, refresh_token, expires_at });
  return { access_token, refresh_token, expires_in };
}

// ─── ID Generator ────────────────────────────────────────────
export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
