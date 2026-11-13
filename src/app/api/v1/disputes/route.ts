// src/app/api/v1/disputes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { MOCK_DISPUTES } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "10"), 100)
  const status = searchParams.get("status")
  const category = searchParams.get("category")

  let data = [...MOCK_DISPUTES]
  if (status) data = data.filter(d => d.status === status)
  if (category) data = data.filter(d => d.category === category)

  data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const total = data.length
  return NextResponse.json({
    data: data.slice((page - 1) * perPage, page * perPage),
    meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reporter_id, related_type, related_id, reason, category } = body

    if (!reporter_id || !related_type || !related_id || !reason || !category) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Semua field wajib diisi" } },
        { status: 400 }
      )
    }

    const dispute = {
      id: `dis-${Date.now()}`,
      reporter_id,
      reporter_name: "Pengguna",
      related_type,
      related_id,
      reason,
      category,
      status: "open" as const,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ data: dispute }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    )
  }
}
