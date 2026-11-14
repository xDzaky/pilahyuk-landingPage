// src/server/auth/token.ts
import { SignJWT, jwtVerify } from "jose"

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || "pilahyuk-secret-dev-only")

export interface TokenPayload {
  sub: string
  role: string
  org_id: string | null
  name: string
  email: string | null
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret())
  return payload
}
