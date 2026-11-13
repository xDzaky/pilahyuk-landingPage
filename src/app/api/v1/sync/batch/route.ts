// src/app/api/v1/sync/batch/route.ts
// CRITICAL: Offline sync endpoint — idempotent, no last-write-wins for financial data
import { NextRequest, NextResponse } from "next/server"

const processedKeys = new Map<string, {
  key: string
  status: "synced" | "failed" | "conflict"
  server_id?: string
  reason?: string
}>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "items array wajib diisi" } },
        { status: 400 }
      )
    }

    const results = []

    for (const item of items) {
      const { key, type, payload, client_created_at } = item

      // ── IDEMPOTENCY CHECK ──
      if (processedKeys.has(key)) {
        results.push(processedKeys.get(key))
        continue
      }

      // ── PROCESS BASED ON TYPE ──
      let result: { key: string; status: "synced" | "failed" | "conflict"; server_id?: string; reason?: string }

      if (type === "weighing_transaction") {
        // Check for financial data conflicts — NEVER last-write-wins
        const { member_id, items: txnItems } = payload as {
          member_id: string
          items: Array<{ material_id: string; gross: number; tare: number; price_snapshot: number }>
        }

        // Validate references exist
        if (!member_id) {
          result = { key, status: "failed", reason: "member_id tidak valid" }
        } else {
          // Check if price snapshot matches current price
          // In production: query DB for current price at client_created_at time
          const hasConflict = false // simplified; real check needed in production

          if (hasConflict) {
            result = {
              key,
              status: "conflict",
              reason: "Harga material sudah berubah — perlu penyesuaian",
            }
          } else {
            const serverId = `wtx-sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
            result = { key, status: "synced", server_id: serverId }
          }
        }
      } else if (type === "collection_request") {
        const serverId = `col-sync-${Date.now()}`
        result = { key, status: "synced", server_id: serverId }
      } else {
        result = { key, status: "failed", reason: `Tipe tidak didukung: ${type}` }
      }

      // Store result for idempotency
      processedKeys.set(key, result)
      results.push(result)
    }

    return NextResponse.json({ data: results })
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan saat sinkronisasi" } },
      { status: 500 }
    )
  }
}
