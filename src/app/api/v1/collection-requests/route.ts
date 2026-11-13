// src/app/api/v1/collection-requests/route.ts
import { NextRequest, NextResponse } from "next/server"
import { MOCK_COLLECTION_REQUESTS } from "@/lib/mock-data"

// Valid status transitions (enforced server-side)
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["on_the_way", "cancelled"],
  on_the_way: ["collected"],
  collected: ["received"],
  received: ["completed", "disputed"],
  completed: [],
  cancelled: [],
  disputed: ["resolved", "cancelled"],
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "10"), 100)
  const status = searchParams.get("status")
  const requesterId = searchParams.get("requester_id")

  let data = [...MOCK_COLLECTION_REQUESTS]
  if (status) data = data.filter(r => r.status === status)
  if (requesterId) data = data.filter(r => r.requester_id === requesterId)

  data.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())

  const total = data.length
  return NextResponse.json({
    data: data.slice((page - 1) * perPage, page * perPage),
    meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
  })
}

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get("Idempotency-Key")
    const body = await request.json()

    const { requester_id, organization_id, method, items } = body

    if (!requester_id || !organization_id || !method || !items?.length) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "requester_id, organization_id, method, dan items wajib diisi" } },
        { status: 400 }
      )
    }

    const request_ = {
      id: `col-${Date.now()}`,
      requester_id,
      requester_name: "Pengguna Baru",
      organization_id,
      method,
      status: "draft" as const,
      requested_at: new Date().toISOString(),
      items,
    }

    return NextResponse.json({ data: request_ }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    )
  }
}
