"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, MessageSquare, Scale } from "lucide-react";

interface Dispute {
  id: string;
  batch_id: string;
  batch_name: string;
  raised_by: string;
  org_name: string;
  type: "weight_dispute" | "payment_dispute" | "quality_dispute";
  description: string;
  status: "open" | "under_review" | "resolved" | "escalated";
  created_at: string;
  resolution?: string;
}

const MOCK_DISPUTES: Dispute[] = [
  { id: "d1", batch_id: "batch-001", batch_name: "Batch Nov-01 — Berkah Jaya", raised_by: "Budi Santoso", org_name: "Bank Sampah Berkah Jaya", type: "weight_dispute", description: "Berat aktual penjemputan 45.2 kg tidak sesuai laporan 52.1 kg. Selisih 6.9 kg.", status: "under_review", created_at: "2024-11-06T10:00:00Z" },
  { id: "d2", batch_id: "batch-002", batch_name: "Batch Nov-02 — Hijau Nusantara", raised_by: "Siti Rahayu", org_name: "Komunitas Hijau Nusantara", type: "payment_dispute", description: "Pembayaran batch belum masuk setelah 7 hari. Nominal Rp 1.240.000.", status: "open", created_at: "2024-11-08T14:00:00Z" },
  { id: "d3", batch_id: "batch-003", batch_name: "Batch Okt-15 — Berkah Jaya", raised_by: "Budi Santoso", org_name: "Bank Sampah Berkah Jaya", type: "quality_dispute", description: "Material plastik ditolak karena dianggap terkontaminasi minyak. Tidak ada pemberitahuan sebelumnya.", status: "resolved", created_at: "2024-10-16T09:00:00Z", resolution: "Setelah investigasi, 30% material diterima. Pembayaran disesuaikan." },
];

const TYPE_LABELS: Record<string, string> = {
  weight_dispute: "Selisih Berat",
  payment_dispute: "Pembayaran",
  quality_dispute: "Kualitas Material",
};

const STATUS_CONFIG = {
  open: { label: "Terbuka", cls: "bg-red-50 text-red-700", icon: AlertTriangle },
  under_review: { label: "Ditinjau", cls: "bg-amber-50 text-amber-700", icon: Clock },
  resolved: { label: "Selesai", cls: "bg-[#DDF3EC] text-[#173F35]", icon: CheckCircle },
  escalated: { label: "Eskalasi", cls: "bg-purple-50 text-purple-700", icon: Scale },
};

export default function AdminSengketaPage() {
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");

  const open = MOCK_DISPUTES.filter(d => d.status === "open" || d.status === "under_review");
  const resolved = MOCK_DISPUTES.filter(d => d.status === "resolved");

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-[6px] px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Pusat Sengketa</div>
          <div className="text-white font-semibold">
            {open.length > 0
              ? `${open.length} sengketa aktif memerlukan tindakan — tinjau dan beri keputusan secepatnya.`
              : "Tidak ada sengketa aktif. Platform berjalan lancar."}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Sengketa", value: MOCK_DISPUTES.length },
          { label: "Terbuka", value: MOCK_DISPUTES.filter(d => d.status === "open").length },
          { label: "Ditinjau", value: MOCK_DISPUTES.filter(d => d.status === "under_review").length },
          { label: "Selesai", value: resolved.length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#D2DCD5] rounded-[6px] px-4 py-3">
            <div className="text-xs text-[#55615B] mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-[#1E2925]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Dispute list */}
      <div className="space-y-3">
        {MOCK_DISPUTES.map((d) => {
          const cfg = STATUS_CONFIG[d.status];
          return (
            <div key={d.id} className="bg-white border border-[#D2DCD5] rounded-[6px] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
                      <cfg.icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <span className="text-xs text-[#55615B] bg-[#F6F8F5] px-2 py-0.5 rounded-full border border-[#D2DCD5]">
                      {TYPE_LABELS[d.type]}
                    </span>
                  </div>
                  <div className="font-semibold text-[#1E2925] text-sm">{d.batch_name}</div>
                  <div className="text-xs text-[#55615B] mb-2">
                    Diajukan oleh {d.raised_by} · {d.org_name} · {new Date(d.created_at).toLocaleDateString("id-ID")}
                  </div>
                  <div className="text-sm text-[#1E2925]">{d.description}</div>
                  {d.resolution && (
                    <div className="mt-2 p-3 bg-[#F6F8F5] border border-[#D2DCD5] rounded-[6px] text-xs text-[#55615B]">
                      <span className="font-semibold text-[#1E2925]">Resolusi: </span>
                      {d.resolution}
                    </div>
                  )}
                </div>
                {(d.status === "open" || d.status === "under_review") && (
                  <button
                    onClick={() => { setSelected(d); setResolution(""); }}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#173F35] text-white rounded-[6px] text-xs font-semibold hover:bg-[#246B56] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Tangani
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolution modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[6px] border border-[#D2DCD5] max-w-lg w-full p-6">
            <div className="text-base font-semibold text-[#1E2925] mb-1">Tangani Sengketa</div>
            <div className="text-sm text-[#55615B] mb-4">{selected.batch_name}</div>
            <div className="text-sm font-medium text-[#1E2925] mb-2">Keputusan & Resolusi</div>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Tuliskan keputusan dan langkah resolusi secara detail..."
              rows={4}
              className="w-full border border-[#D2DCD5] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274] resize-none"
            />
            <div className="text-xs text-[#55615B] mt-1 mb-4">
              Resolusi ini akan dicatat sebagai audit log dan tidak dapat diubah.
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-[#D2DCD5] text-[#55615B] rounded-[6px] text-sm">
                Batal
              </button>
              <button
                onClick={() => setSelected(null)}
                disabled={!resolution.trim()}
                className="px-4 py-2 bg-[#173F35] text-white rounded-[6px] text-sm font-semibold disabled:opacity-40 hover:bg-[#246B56] transition-colors"
              >
                Simpan Resolusi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
