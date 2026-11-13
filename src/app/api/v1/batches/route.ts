// src/app/api/v1/batches/route.ts
import { NextRequest, NextResponse } from "next/server"
import { MOCK_BATCHES } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "10"), 100)
  const status = searchParams.get("status")
  const orgId = searchParams.get("organization_id")

  let data = [...MOCK_BATCHES]
  if (status) data = data.filter(b => b.status === status)
  if (orgId) data = data.filter(b => b.origin_org_id === orgId)

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
    const { origin_org_id, material_id, quantity } = body

    if (!origin_org_id || !material_id || !quantity) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "origin_org_id, material_id, dan quantity wajib diisi" } },
        { status: 400 }
      )
    }

    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    const code = `PY-${dateStr}-ORG-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const batch = {
      id: `bat-${Date.now()}`,
      code,
      origin_org_id,
      origin_org_name: "Organisasi",
      material_id,
      material_name: "Material",
      quantity,
      status: "dibuat" as const,
      created_at: today.toISOString(),
      events: [],
    }

    return NextResponse.json({ data: batch }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" } },
      { status: 500 }
    )
  }
}
