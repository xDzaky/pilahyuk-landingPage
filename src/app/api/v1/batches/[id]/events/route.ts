import { NextRequest, NextResponse } from "next/server";

const MOCK_EVENTS: Record<string, Array<{
  id: string; batch_id: string; event_type: string;
  actor_id: string; actor_name: string; notes: string;
  evidence_url?: string; created_at: string;
}>> = {
  "batch-001": [
    {
      id: "evt-001", batch_id: "batch-001", event_type: "batch_created",
      actor_id: "user-operator-001", actor_name: "Budi Santoso",
      notes: "Batch dibuat dari 23 transaksi timbang",
      created_at: "2024-11-01T08:00:00Z",
    },
    {
      id: "evt-002", batch_id: "batch-001", event_type: "material_sorted",
      actor_id: "user-operator-001", actor_name: "Budi Santoso",
      notes: "Sortasi selesai: 45.2 kg kertas, 23.8 kg plastik, 12.1 kg logam",
      created_at: "2024-11-02T10:30:00Z",
    },
    {
      id: "evt-003", batch_id: "batch-001", event_type: "pickup_scheduled",
      actor_id: "user-operator-001", actor_name: "Budi Santoso",
      notes: "Penjemputan dijadwalkan: 5 Nov 2024 09:00",
      created_at: "2024-11-03T14:00:00Z",
    },
    {
      id: "evt-004", batch_id: "batch-001", event_type: "batch_validated",
      actor_id: "user-superadmin-001", actor_name: "Super Admin",
      notes: "Batch divalidasi. Berat aktual sesuai laporan.",
      evidence_url: "https://r2.example.com/evidence/batch-001-validation.jpg",
      created_at: "2024-11-05T11:15:00Z",
    },
    {
      id: "evt-005", batch_id: "batch-001", event_type: "batch_completed",
      actor_id: "user-superadmin-001", actor_name: "Super Admin",
      notes: "Batch selesai. Pembayaran telah ditransfer.",
      created_at: "2024-11-06T09:00:00Z",
    },
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const events = MOCK_EVENTS[id] || [];
  return NextResponse.json({
    data: events,
    meta: { total: events.length, batch_id: id },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { event_type, notes, evidence_url } = body;

  const allowedEvents = [
    "material_sorted", "pickup_scheduled", "batch_validated",
    "batch_completed", "dispute_raised", "note_added",
  ];

  if (!allowedEvents.includes(event_type)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Tipe event tidak valid" } },
      { status: 400 }
    );
  }

  const newEvent = {
    id: `evt-${Date.now()}`,
    batch_id: id,
    event_type,
    actor_id: req.headers.get("x-user-id") || "unknown",
    actor_name: "Pengguna",
    notes: notes || "",
    evidence_url: evidence_url || undefined,
    created_at: new Date().toISOString(),
  };

  if (!MOCK_EVENTS[id]) MOCK_EVENTS[id] = [];
  MOCK_EVENTS[id].push(newEvent);

  return NextResponse.json({ data: newEvent }, { status: 201 });
}
