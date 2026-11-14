import { NextRequest, NextResponse } from "next/server";
import { route, readJson, ok, HttpError, getIp } from "@/server/http";
import { enforceRateLimit } from "@/server/rate-limit";
import { rotateRefreshToken, setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "@/server/auth/session";
import { signAccessToken } from "@/server/auth/jwt";
import { orgNameFor } from "@/server/auth/issue-session";
import { toPublicUser } from "@/server/auth/serializers";

export const POST = route(async (req: NextRequest) => {
  await enforceRateLimit(`refresh:ip:${getIp(req)}`, 120, 900);

  let body: { refresh_token?: unknown } = {};
  try {
    body = await readJson<{ refresh_token?: unknown }>(req);
  } catch {
    // cookie-only request
  }
  const raw = req.cookies.get(REFRESH_COOKIE)?.value || (typeof body.refresh_token === "string" ? body.refresh_token : "");
  if (!raw) throw new HttpError(401, "UNAUTHORIZED", "Refresh token tidak ditemukan");

  const rotated = await rotateRefreshToken(raw, req);
  if (!rotated) {
    return clearAuthCookies(
      NextResponse.json(
        { error: { code: "INVALID_REFRESH_TOKEN", message: "Sesi berakhir. Silakan masuk kembali." } },
        { status: 401 }
      )
    );
  }

  const access = await signAccessToken({
    sub: rotated.user.id,
    role: rotated.user.role,
    org_id: rotated.user.org_id,
    name: rotated.user.name,
    email: rotated.user.email,
  });
  const orgName = await orgNameFor(rotated.user.org_id);
  const response = ok({
    token: access,
    refresh_token: rotated.refresh,
    token_type: "Bearer",
    expires_in: 60 * 60 * 8,
    user: toPublicUser({ ...rotated.user, profile: null }, orgName),
  });
  return setAuthCookies(response, access, rotated.refresh);
});
