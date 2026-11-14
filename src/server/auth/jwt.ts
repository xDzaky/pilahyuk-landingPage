import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface AccessPayload {
  sub: string;
  role: string;
  org_id: string | null;
  name: string;
  email: string | null;
}

function getSecret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET wajib diisi di production");
    }
    return new TextEncoder().encode("pilahyuk-dev-only-secret-change-me-32chars");
  }
  if (process.env.NODE_ENV === "production" && value.length < 32) {
    console.warn("JWT_SECRET kurang dari 32 karakter; segera rotasi.");
  }
  return new TextEncoder().encode(value);
}

export async function signAccessToken(payload: AccessPayload): Promise<string> {
  return new SignJWT({ ...payload, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessPayload & JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (payload.typ !== "access") throw new Error("Token bukan access token");
  return payload as AccessPayload & JWTPayload;
}
