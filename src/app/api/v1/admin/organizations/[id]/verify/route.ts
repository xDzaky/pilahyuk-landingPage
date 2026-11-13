import { NextRequest, NextResponse } from "next/server";

// Org verify endpoint
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const role = req.headers.get("x-user-role");
  if (role !== "super_admin") {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  const body = await req.json();
  const { action, reason } = body; // action: "approve" | "reject"
  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "action harus approve atau reject" } },
      { status: 400 }
    );
  }
  return NextResponse.json({
    data: {
      org_id: id,
      status: action === "approve" ? "verified" : "rejected",
      reason: reason || null,
      verified_at: action === "approve" ? new Date().toISOString() : null,
      verified_by: req.headers.get("x-user-id"),
    },
  });
}
