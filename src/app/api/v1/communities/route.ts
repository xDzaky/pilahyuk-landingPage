// src/app/api/v1/communities/route.ts
import { NextRequest, NextResponse } from "next/server"
import { MOCK_ORGANIZATIONS } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "10"), 100)
  const status = searchParams.get("status")

  let data = MOCK_ORGANIZATIONS.filter(o => o.type === "community")
  if (status) data = data.filter(o => o.status === status)

  const total = data.length
  const sliced = data.slice((page - 1) * perPage, page * perPage)

  return NextResponse.json({
    data: sliced,
    meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
  })
}
