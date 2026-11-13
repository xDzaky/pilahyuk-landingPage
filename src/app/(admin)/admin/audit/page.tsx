"use client";

import { useState } from "react";
import { Lock, Filter, Download, Info } from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  diff?: Record<string, { before: unknown; after: unknown }>;
  ip_address?: string;
  created_at: string;
}

const MOCK_AUDIT: AuditEntry[] = [
  { id: "al-001", action: "org.verified", entity_type: "Organization", entity_id: "org-001", actor_id: "user-superadmin-001", actor_name: "Super Admin", actor_role: "super_admin", ip_address: "180.247.1.1", created_at: "2024-11-05T11:15:00Z", diff: { status: { before: "pending_review", after: "verified" } } },
  { id: "al-002", action: "batch.validated", entity_type: "MaterialBatch", entity_id: "batch-001", actor_id: "user-superadmin-001", actor_name: "Super Admin", actor_role: "super_admin", ip_address: "180.247.1.1", created_at: "2024-11-05T11:30:00Z" },
  { id: "al-003", action: "user.suspended", entity_type: "User", entity_id: "u5", actor_id: "user-superadmin-001", actor_name: "Super Admin", actor_role: "super_admin", ip_address: "180.247.1.1", created_at: "2024-11-06T09:00:00Z", diff: { status: { before: "active", after: "suspended" } } },
  { id: "al-004", action: "material.price_updated", entity_type: "Material", entity_id: "mat-kertas", actor_id: "user-superadmin-001", actor_name: "Super Admin", actor_role: "super_admin", ip_address: "180.247.1.1", created_at: "2024-11-07T14:00:00Z", diff: { price_per_kg: { before: 1800, after: 2000 } } },
  { id: "al-005", action: "dispute.resolved", entity_type: "Dispute", entity_id: "d3", actor_id: "user-superadmin-001", actor_name: "Super Admin", actor_role: "super_admin", ip_address: "180.247.1.1", created_at: "2024-11-08T10:00:00Z" },
  { id: "al-006", action: "tx.adjustment_created", entity_type: "WeighingTransaction", entity_id: "trx-001", actor_id: "user-operator-001", actor_name: "Budi Santoso", actor_role: "operator_bank_sampah", ip_address: "112.215.1.2", created_at: "2024-11-09T13:00:00Z", diff: { amount_kg: { before: 5.2, after: 5.0 } } },
];

const ACTION_COLOR: Record<string, string> = {
  "org.verified": "text-[#173F35]",
  "batch.validated": "text-[#246B56]",
  "user.suspended": "text-red-700",
  "material.price_updated": "text-amber-700",
  "dispute.resolved": "text-[#3D9274]",
  "tx.adjustment_created": "text-purple-700",
};

export default function AdminAuditPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Answer Banner */}
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Jejak Audit</div>
          <div className="text-white font-semibold">
            {MOCK_AUDIT.length} entri audit tersimpan. Semua perubahan data penting tercatat dan tidak dapat dihapus.
          </div>
        </div>
      </div>

      {/* Immutability notice */}
      <div className="flex items-start gap-3 bg-[#F6F8F5] border border-[#E1E8E3] rounded-2xl px-4 py-3">
        <Lock className="w-4 h-4 text-[#3D9274] shrink-0 mt-0.5" />
        <div className="text-sm text-[#66736D]">
          <span className="font-semibold text-[#1E2925]">Append-only: </span>
          Entri audit tidak dapat diubah atau dihapus. Setiap koreksi menghasilkan entri baru yang mereferensikan entri sebelumnya.
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2 border border-[#E1E8E3] rounded-xl px-3 py-2 bg-white text-sm text-[#66736D]">
          <Filter className="w-4 h-4" />
          <span>Filter Aksi</span>
        </div>
        <div className="flex items-center gap-2 border border-[#E1E8E3] rounded-xl px-3 py-2 bg-white text-sm text-[#66736D]">
          <Filter className="w-4 h-4" />
          <span>Filter Aktor</span>
        </div>
        <div className="ml-auto">
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-[#E1E8E3] rounded-xl text-sm text-[#66736D] bg-white hover:bg-[#F6F8F5]">
            <Download className="w-4 h-4" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Audit timeline */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E1E8E3] bg-[#F6F8F5]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Waktu</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Aksi</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Entitas</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Aktor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">IP</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#66736D] uppercase tracking-wide">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8E3]">
            {MOCK_AUDIT.map((entry) => (
              <>
                <tr key={entry.id} className="hover:bg-[#F6F8F5] transition-colors">
                  <td className="px-4 py-3 text-xs text-[#66736D] whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                  </td>
                  <td className="px-4 py-3">
                    <code className={`text-xs font-mono font-semibold ${ACTION_COLOR[entry.action] || "text-[#1E2925]"}`}>
                      {entry.action}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#66736D]">
                    <div>{entry.entity_type}</div>
                    <div className="font-mono text-[10px]">{entry.entity_id}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-[#1E2925]">{entry.actor_name}</div>
                    <div className="text-[#66736D]">{entry.actor_role}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#66736D] font-mono">{entry.ip_address || "—"}</td>
                  <td className="px-4 py-3">
                    {entry.diff && (
                      <button
                        onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#3D9274] hover:text-[#173F35] border border-[#E1E8E3] rounded-lg"
                      >
                        <Info className="w-3 h-3" />
                        Diff
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === entry.id && entry.diff && (
                  <tr key={`${entry.id}-diff`}>
                    <td colSpan={6} className="px-4 py-3 bg-[#F6F8F5]">
                      <div className="text-xs font-semibold text-[#66736D] mb-2">Perubahan Data:</div>
                      <div className="space-y-1">
                        {Object.entries(entry.diff).map(([field, change]) => (
                          <div key={field} className="flex items-center gap-3 font-mono text-xs">
                            <span className="text-[#66736D] w-32">{field}</span>
                            <span className="text-red-600 line-through">{JSON.stringify(change.before)}</span>
                            <span className="text-[#66736D]">→</span>
                            <span className="text-[#173F35] font-semibold">{JSON.stringify(change.after)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
