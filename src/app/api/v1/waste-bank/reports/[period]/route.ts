import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ period: string }> }
) {
  const { period } = await params;
  const role = req.headers.get("x-user-role");
  const orgId = req.headers.get("x-user-org");

  if (!["operator_bank_sampah", "super_admin"].includes(role || "")) {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  // period: "2024-11" (monthly) or "2024-11-13" (daily)
  const isDaily = period.length === 10;
  const isMonthly = period.length === 7;

  if (!isDaily && !isMonthly) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Format period: YYYY-MM atau YYYY-MM-DD" } },
      { status: 400 }
    );
  }

  const mockReport = {
    period,
    org_id: orgId,
    period_type: isDaily ? "daily" : "monthly",
    summary: {
      total_transactions: isDaily ? 8 : 156,
      total_weight_kg: isDaily ? 42.3 : 1240.5,
      total_value_idr: isDaily ? 84600 : 2481000,
      unique_members: isDaily ? 6 : 47,
    },
    by_material: [
      { material: "Kertas HVS", weight_kg: isDaily ? 18.2 : 520.4, value_idr: isDaily ? 36400 : 1040800 },
      { material: "Plastik PET", weight_kg: isDaily ? 12.1 : 380.1, value_idr: isDaily ? 36300 : 1140300 },
      { material: "Logam Campuran", weight_kg: isDaily ? 8.5 : 220.0, value_idr: isDaily ? 8500 : 220000 },
      { material: "Kardus", weight_kg: isDaily ? 3.5 : 120.0, value_idr: isDaily ? 3400 : 79900 },
    ],
    generated_at: new Date().toISOString(),
  };

  return NextResponse.json({ data: mockReport });
}
