import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ data: { message: "Berhasil logout" } });
  response.cookies.delete("pilahyuk_token");
  return response;
}
