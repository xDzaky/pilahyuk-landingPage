import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/server/auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/akses-ditolak",
  "/api/v1/auth/",
  "/api/v1/areas",
  "/api/v1/communities",
  "/api/v1/materials",
  "/api/v1/health",
];

const PAGE_ROLES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/admin", roles: ["super_admin"] },
  { prefix: "/bank-sampah", roles: ["super_admin", "operator_bank_sampah"] },
  { prefix: "/material", roles: ["super_admin", "operator_bank_sampah", "pengurus_komunitas"] },
  { prefix: "/pengumpulan", roles: ["super_admin", "operator_bank_sampah", "pengurus_komunitas", "collector"] },
  { prefix: "/batch", roles: ["super_admin", "operator_bank_sampah", "pengurus_komunitas", "recycler"] },
  { prefix: "/komunitas", roles: ["super_admin", "pengurus_komunitas"] },
  { prefix: "/pengetahuan", roles: ["super_admin", "pengurus_komunitas", "curator"] },
  { prefix: "/dashboard", roles: ["super_admin", "operator_bank_sampah", "pengurus_komunitas", "collector", "recycler"] },
  { prefix: "/dampak", roles: ["super_admin", "resident", "volunteer"] },
];

function isStaticAsset(pathname: string): boolean {
  if (pathname.startsWith("/_next") || pathname.startsWith("/icons")) return true;
  if (/^\/(?:img|screens|download|fonts)\//.test(pathname)) return true;
  if (["/favicon.ico", "/robots.txt", "/sitemap.xml", "/og.png"].includes(pathname)) return true;
  return /\.(?:svg|png|jpe?g|webp|avif|gif|ico|woff2?|ttf|otf|apk|webmanifest)$/i.test(pathname);
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p)));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticAsset(pathname) || isPublic(pathname)) {
    return NextResponse.next();
  }

  const token =
    req.cookies.get("pilahyuk_token")?.value ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Token diperlukan" } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url));
  }

  try {
    const payload = await verifyAccessToken(token);
    const role = String(payload.role ?? "");

    if (pathname.startsWith("/api/v1/admin") && role !== "super_admin") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Akses ditolak" } },
        { status: 403 }
      );
    }

    const rule = PAGE_ROLES.find((entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`));
    if (rule && !rule.roles.includes(role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Peran Anda tidak memiliki akses" } },
          { status: 403 }
        );
      }
      return NextResponse.redirect(
        new URL(`/akses-ditolak?from=${encodeURIComponent(pathname)}`, req.url)
      );
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", String(payload.sub ?? ""));
    headers.set("x-user-role", role);
    headers.set("x-user-org", String(payload.org_id ?? ""));
    headers.set("x-user-name", String(payload.name ?? ""));
    headers.set("x-user-email", String(payload.email ?? ""));
    return NextResponse.next({ request: { headers } });
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Token tidak valid" } },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(pathname)}`, req.url)
    );
    response.cookies.delete("pilahyuk_token");
    response.cookies.delete("pilahyuk_refresh");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"],
};
