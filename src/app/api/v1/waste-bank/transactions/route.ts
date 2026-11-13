// src/app/api/v1/waste-bank/transactions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { MOCK_WEIGHING_TRANSACTIONS, MOCK_MATERIALS } from "@/lib/mock-data"

// Module-level idempotency store (dev only — use Redis in production)
const processedKeys = new Map<string, object>()

function paginate<T>(data: T[], page: number, perPage: number) {
  const total = data.length
  const total_pages = Math.ceil(total / perPage)
  const sliced = data.slice((page - 1) * perPage, page * perPage)
  return { data: sliced, meta: { page, per_page: perPage, total, total_pages } }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "10"), 100)
  const memberId = searchParams.get("member_id")
  const status = searchParams.get("status")

  let data = [...MOCK_WEIGHING_TRANSACTIONS]
  if (memberId) data = data.filter(t => t.member_id === memberId)
  if (status) data = data.filter(t => t.status === status)
  data.sort((a, b) => new Date(b.transaction_at).getTime() - new Date(a.transaction_at).getTime())

  return NextResponse.json(paginate(data, page, perPage))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support idempotency key from header OR body
    const idempotencyKey =
      request.headers.get("Idempotency-Key") ||
      body.idempotency_key ||
      null

    // Check idempotency store
    if (idempotencyKey && processedKeys.has(idempotencyKey)) {
      const cached = processedKeys.get(idempotencyKey) as Record<string, unknown>
      return NextResponse.json({ ...cached, meta: { ...(cached.meta as object || {}), idempotent: true } })
    }

    const { member_id, items } = body

    // Validate
    if (!member_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "member_id dan items wajib diisi" } },
        { status: 400 }
      )
    }

    // Calculate with price snapshot
    // Support both {gross, tare} and {amount_kg} formats
    const processedItems = items.map((item: {
      material_id: string;
      gross?: number;
      tare?: number;
      amount_kg?: number;
    }) => {
      const material = MOCK_MATERIALS.find(m => m.id === item.material_id)
      if (!material) throw new Error(`Material ${item.material_id} tidak ditemukan`)

      const gross = item.gross ?? item.amount_kg ?? 0
      const tare = item.tare ?? 0
      const net = Math.max(0, gross - tare)
      const priceSnapshot = material.current_price ?? 0

      return {
        material_id: item.material_id,
        material_name: material.name,
        gross,
        tare,
        net,
        price_snapshot: priceSnapshot,
        price_valid_from: material.price_valid_from,
        value: net * priceSnapshot,
      }
    })

    const totalNet = processedItems.reduce((s, i) => s + i.net, 0)
    const totalValue = processedItems.reduce((s, i) => s + i.value, 0)

    const transaction = {
      id: `wtx-${Date.now()}`,
      organization_id: "org-002",
      member_id,
      operator_id: request.headers.get("x-user-id") || "usr-002",
      transaction_at: new Date().toISOString(),
      status: "confirmed" as const,
      sync_status: "synced" as const,
      is_offline_created: false,
      idempotency_key: idempotencyKey,
      items: processedItems,
      total_net: totalNet,
      total_value: totalValue,
    }

    const responseBody = {
      data: transaction,
      meta: { idempotent: false },
    }

    // Store idempotency key
    if (idempotencyKey) {
      processedKeys.set(idempotencyKey, responseBody)
    }

    return NextResponse.json(responseBody, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan"
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    )
  }
}
