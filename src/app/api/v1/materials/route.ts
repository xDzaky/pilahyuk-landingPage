// src/app/api/v1/materials/route.ts
import { NextRequest, NextResponse } from "next/server"
import { MOCK_MATERIALS } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "50"), 100)

  let data = [...MOCK_MATERIALS]
  if (category) data = data.filter(m => m.category === category)

  const total = data.length
  return NextResponse.json({
    data: data.slice((page - 1) * perPage, page * perPage),
    meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
  })
}
