import { NextRequest, NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public headers?: Record<string, string>
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(meta ? { data, meta } : { data }, { status });
}

export function fail(status: number, code: string, message: string, details?: unknown): NextResponse {
  return NextResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
}

export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T> {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new HttpError(400, "VALIDATION_ERROR", "Body harus objek JSON");
    }
    return body as T;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "VALIDATION_ERROR", "Body harus JSON yang valid");
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    const response = fail(error.status, error.code, error.message, error.details);
    if (error.headers) {
      for (const [key, value] of Object.entries(error.headers)) response.headers.set(key, value);
    }
    return response;
  }
  console.error("Unhandled API error:", error);
  return fail(500, "INTERNAL_ERROR", "Terjadi kesalahan server");
}

type RouteContext = { params?: Promise<Record<string, string>> };

export function route(
  handler: (req: NextRequest, context: RouteContext) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export function getIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

export function getUserAgent(req: NextRequest): string {
  return (req.headers.get("user-agent") ?? "unknown").slice(0, 300);
}

export function parsePagination(searchParams: URLSearchParams): { page: number; perPage: number; skip: number } {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("per_page") ?? "20", 10) || 20));
  return { page, perPage, skip: (page - 1) * perPage };
}

export function num(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return Number(value.toString());
}

export function meta(page: number, perPage: number, total: number): Record<string, unknown> {
  return { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) };
}
