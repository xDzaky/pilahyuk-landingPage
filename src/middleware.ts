import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pilahyuk-secret-dev-only"
);

const PUBLIC_PATHS = ["/login", "/api/v1/auth/login"];
const ADMIN_PATHS = ["/admin"];
const PORTAL_PATHS = [
  "/dashboard",
  "/komunitas",
  "/bank-sampah",
  "/batch",
  "/dampak",
  "/material",
  "/pengumpulan",
  "/pengetahuan",
  "/bantuan",
  "/pengaturan",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const token =
    req.cookies.get("pilahyuk_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Token diperlukan" } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // Admin route protection
    if (pathname.startsWith("/admin")) {
      if (payload.role !== "super_admin") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: { code: "FORBIDDEN", message: "Akses ditolak" } },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Inject user info to headers for downstream
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.sub as string);
    requestHeaders.set("x-user-role", payload.role as string);
    requestHeaders.set("x-user-org", (payload.org_id as string) || "");

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Token tidak valid" } },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("pilahyuk_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/).*)",
  ],
};
