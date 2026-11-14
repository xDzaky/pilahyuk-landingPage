import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Berkas statis yang boleh diakses tanpa login (landing page)
const PUBLIC_FILE =
  /\.(?:svg|png|jpe?g|webp|avif|gif|ico|mp4|webm|woff2?|ttf|otf|apk|txt|xml|json|webmanifest)$/i;

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pilahyuk-secret-dev-only"
);

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/otp",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Landing page (root) + berkas statis publik
  const isPublicFile = PUBLIC_FILE.test(pathname);
  if (pathname === "/" || isPublicFile) {
    return NextResponse.next();
  }

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

    // Admin protection — applies to both admin pages and admin API routes
    const isAdminApi = pathname.startsWith("/api/v1/admin");
    const isAdminPage = pathname.startsWith("/admin");

    if ((isAdminApi || isAdminPage) && payload.role !== "super_admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Akses ditolak" } },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
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
