import { NextRequest, NextResponse } from "next/server";

// Adjustments = corrections referencing original (never delete/modify original)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    data: [],
    meta: { transaction_id: id, total: 0 },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const role = req.headers.get("x-user-role");
  if (!["operator_bank_sampah", "super_admin"].includes(role || "")) {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  const body = await req.json();
  const { reason, amount_kg_delta, amount_idr_delta } = body;

  if (!reason) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Alasan koreksi wajib diisi" } },
      { status: 400 }
    );
  }

  const adjustment = {
    id: `adj-${Date.now()}`,
    original_transaction_id: id,
    reason,
    amount_kg_delta: amount_kg_delta || 0,
    amount_idr_delta: amount_idr_delta || 0,
    created_by: req.headers.get("x-user-id"),
    created_at: new Date().toISOString(),
    note: "Koreksi ini tidak mengubah transaksi asal. Saldo dihitung ulang dari ledger.",
  };

  return NextResponse.json({ data: adjustment }, { status: 201 });
}
