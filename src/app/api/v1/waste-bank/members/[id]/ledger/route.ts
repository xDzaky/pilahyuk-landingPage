import { NextRequest, NextResponse } from "next/server";

// Ledger mock per member
const MOCK_LEDGER: Record<string, Array<{
  id: string; member_id: string; entry_type: string;
  amount_kg: number; material_name: string;
  credit_idr: number; debit_idr: number; balance_after: number;
  reference_id: string; notes: string; created_at: string;
}>> = {
  "user-member-001": [
    {
      id: "led-001", member_id: "user-member-001",
      entry_type: "deposit", amount_kg: 5.2,
      material_name: "Kertas HVS", credit_idr: 10400, debit_idr: 0,
      balance_after: 10400, reference_id: "trx-001",
      notes: "Setoran timbang", created_at: "2024-11-01T09:00:00Z",
    },
    {
      id: "led-002", member_id: "user-member-001",
      entry_type: "deposit", amount_kg: 3.1,
      material_name: "Plastik PET", credit_idr: 9300, debit_idr: 0,
      balance_after: 19700, reference_id: "trx-002",
      notes: "Setoran timbang", created_at: "2024-11-05T10:00:00Z",
    },
    {
      id: "led-003", member_id: "user-member-001",
      entry_type: "withdrawal", amount_kg: 0,
      material_name: "", credit_idr: 0, debit_idr: 15000,
      balance_after: 4700, reference_id: "wd-001",
      notes: "Penarikan tunai", created_at: "2024-11-08T14:00:00Z",
    },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requesterId = req.headers.get("x-user-id");
  const requesterRole = req.headers.get("x-user-role");

  // Privacy: only self or operator/admin can view
  const canView =
    requesterId === id ||
    ["operator_bank_sampah", "super_admin"].includes(requesterRole || "");

  if (!canView) {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  const ledger = MOCK_LEDGER[id] || [];
  const balance = ledger.reduce(
    (sum, e) => sum + e.credit_idr - e.debit_idr,
    0
  );

  return NextResponse.json({
    data: { member_id: id, entries: ledger, computed_balance_idr: balance },
    meta: { total: ledger.length },
  });
}
