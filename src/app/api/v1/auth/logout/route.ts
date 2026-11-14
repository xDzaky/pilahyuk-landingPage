import { NextRequest } from "next/server";
import { route, readJson, ok } from "@/server/http";
import { clearAuthCookies, revokeRefreshToken, REFRESH_COOKIE } from "@/server/auth/session";

export const POST = route(async (req: NextRequest) => {
  let body: { refresh_token?: unknown } = {};
  try {
    body = await readJson<{ refresh_token?: unknown }>(req);
  } catch {
    // cookie-only request
  }
  const raw = req.cookies.get(REFRESH_COOKIE)?.value || (typeof body.refresh_token === "string" ? body.refresh_token : undefined);
  await revokeRefreshToken(raw);
  return clearAuthCookies(ok({ message: "Berhasil logout" }));
});
