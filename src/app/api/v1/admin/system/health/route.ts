import { NextRequest, NextResponse } from "next/server";

// Mock admin health data
export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "super_admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Akses ditolak" } },
      { status: 403 }
    );
  }

  return NextResponse.json({
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: { status: "up", latency_ms: 12 },
        redis: { status: "up", latency_ms: 2 },
        storage: { status: "up", latency_ms: 45 },
      },
      stats: {
        total_users: 847,
        active_orgs: 23,
        transactions_today: 156,
        batches_this_month: 42,
      },
    },
  });
}
