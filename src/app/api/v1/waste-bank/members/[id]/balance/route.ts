import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requesterId = req.headers.get("x-user-id");
  const requesterRole = req.headers.get("x-user-role");

  const canView =
    requesterId === id ||
    ["operator_bank_sampah", "super_admin"].includes(requesterRole || "");

  if (!canView) {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  // Balance is ALWAYS computed from ledger SUM — never stored directly
  const MOCK_BALANCES: Record<string, { credit: number; debit: number }> = {
    "user-member-001": { credit: 19700, debit: 15000 },
    "user-member-002": { credit: 45200, debit: 20000 },
  };

  const data = MOCK_BALANCES[id] || { credit: 0, debit: 0 };
  const balance = data.credit - data.debit;

  return NextResponse.json({
    data: {
      member_id: id,
      total_credit_idr: data.credit,
      total_debit_idr: data.debit,
      computed_balance_idr: balance,
      note: "Saldo dihitung dari akumulasi ledger, bukan field tersimpan",
    },
  });
}
