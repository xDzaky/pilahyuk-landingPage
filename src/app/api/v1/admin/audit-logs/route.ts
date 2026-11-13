// src/app/api/v1/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from "next/server"
import { MOCK_AUDIT_LOGS } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "50"), 100)
  const actorId = searchParams.get("actor_id")
  const entityType = searchParams.get("entity_type")

  let data = [...MOCK_AUDIT_LOGS]
  if (actorId) data = data.filter(l => l.actor_id === actorId)
  if (entityType) data = data.filter(l => l.entity_type === entityType)

  data.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())

  const total = data.length
  return NextResponse.json({
    data: data.slice((page - 1) * perPage, page * perPage),
    meta: { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) },
  })
}
