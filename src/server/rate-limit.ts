import { prisma } from "@/server/db";
import { HttpError } from "@/server/http";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  retryAfter: number;
}

/**
 * Fixed-window rate limit yang persisten di database.
 * Atomik lewat INSERT ... ON CONFLICT, sehingga aman untuk multi-instance.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const expiresAt = new Date(Date.now() + windowSeconds * 1000);
  const rows = await prisma.$queryRaw<Array<{ count: number; expires_at: Date }>>`
    INSERT INTO "rate_limits" ("key", "count", "expires_at", "updated_at")
    VALUES (${key.slice(0, 200)}, 1, ${expiresAt}, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "rate_limits"."expires_at" <= now() THEN 1 ELSE "rate_limits"."count" + 1 END,
      "expires_at" = CASE WHEN "rate_limits"."expires_at" <= now() THEN ${expiresAt} ELSE "rate_limits"."expires_at" END,
      "updated_at" = now()
    RETURNING "count", "expires_at"
  `;
  const row = rows[0];
  const count = Number(row.count);
  const retryAfter = Math.max(1, Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 1000));
  return { allowed: count <= limit, count, limit, retryAfter };
}

export async function enforceRateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  const result = await checkRateLimit(key, limit, windowSeconds);
  if (!result.allowed) {
    throw new HttpError(
      429,
      "RATE_LIMITED",
      `Terlalu banyak percobaan. Coba lagi dalam ${result.retryAfter} detik.`,
      { retry_after: result.retryAfter },
      { "Retry-After": String(result.retryAfter) }
    );
  }
}
