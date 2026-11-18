// src/app/(portal)/batch/page.tsx
// Dashboard Jejak Batch — Traceability (Recycler/Processor)
"use client"

import { useState } from "react"
import { AnswerBanner } from "@/components/dashboard/AnswerBanner"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { StatusBadge, mapBatchStatus } from "@/components/dashboard/StatusBadge"
import { DataTable, Column } from "@/components/dashboard/DataTable"
import { Timeline } from "@/components/dashboard/Timeline"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { formatKg, formatDateTime, timeAgo } from "@/lib/utils"
import { MOCK_BATCHES } from "@/lib/mock-data"
import type { MaterialBatch } from "@/types/api"
import {
  QrCode, Package, AlertTriangle, CheckCircle2,
  Recycle, X, Upload, Search
} from "lucide-react"

const waitingValidation = MOCK_BATCHES.filter(b => b.status === "diserahkan").length
const waitingEvidence = MOCK_BATCHES.filter(b => b.status === "menunggu_bukti").length
const residuTotal = 0 // placeholder

function BatchDetailDrawer({
  batch,
  onClose,
}: {
  batch: MaterialBatch
  onClose: () => void
}) {
  const [validating, setValidating] = useState(false)
  const [quality, setQuality] = useState<"A" | "B" | "C">("A")
  const [decision, setDecision] = useState<"terima" | "tolak">("terima")
  const [rejectReason, setRejectReason] = useState("")
  const [outcome, setOutcome] = useState<"diproses" | "dipakai_ulang" | "residu">("diproses")
  const [residuKg, setResiduKg] = useState("")
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitValidation = async () => {
    if (decision === "tolak" && !rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi")
      return
    }
    if (outcome === "residu" && !residuKg) {
      alert("Berat residu wajib diisi")
      return
    }
    setSubmitted(true)
    await new Promise(r => setTimeout(r, 1000))
    alert(
      decision === "terima"
        ? `Batch ${batch.code} diterima — status diubah ke "menunggu bukti"`
        : `Batch ${batch.code} ditolak`
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#D2DCD5] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs font-mono text-[#55615B]">{batch.code}</div>
            <h2 className="font-bold text-[#1E2925]">{batch.material_name}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={mapBatchStatus(batch.status)} />
            <button
              onClick={onClose}
              className="p-2 rounded-[6px] hover:bg-[#EDF1EC] text-[#55615B]"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Origin info — MASKED individual data */}
          <div className="rounded-[6px] bg-[#F6F8F5] border border-[#D2DCD5] p-4">
            <div className="text-xs font-semibold text-[#55615B] mb-2 uppercase tracking-wide">
              Asal Material
            </div>
            <div className="text-sm font-semibold text-[#1E2925]">{batch.origin_org_name}</div>
            <div className="text-xs text-[#55615B] mt-0.5">
              {formatKg(batch.quantity)} · dikumpulkan dari anggota komunitas
            </div>
            {/* Privacy note */}
            <div className="mt-2 text-[11px] text-[#286A9B] bg-[#EBF3F9] rounded-[4px] px-2 py-1">
              🔒 Data individu rumah tangga tidak ditampilkan sesuai kebijakan privasi
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-[#1E2925] text-sm mb-3">
              Riwayat Peristiwa
            </h3>
            <Timeline events={batch.events} />
          </div>

          {/* Validation form — only for "diserahkan" */}
          {batch.status === "diserahkan" && (
            <div className="border-t border-[#D2DCD5] pt-6">
              <h3 className="font-semibold text-[#1E2925] text-sm mb-4">
                Validasi Penerimaan
              </h3>

              {!validating ? (
                <button
                  onClick={() => setValidating(true)}
                  className="w-full h-10 bg-[#173F35] text-white rounded-[6px] text-sm font-semibold hover:bg-[#246B56] transition-colors"
                >
                  Mulai Validasi
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Quality */}
                  <div>
                    <label className="block text-xs font-semibold text-[#55615B] mb-2">
                      Grade Kualitas <span className="text-[#B54747]">*</span>
                    </label>
                    <div className="flex gap-2">
                      {(["A", "B", "C"] as const).map(q => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`flex-1 h-10 rounded-[6px] text-sm font-semibold border transition-colors ${
                            quality === q
                              ? "bg-[#173F35] text-white border-[#173F35]"
                              : "bg-white text-[#1E2925] border-[#D2DCD5] hover:border-[#246B56]"
                          }`}
                        >
                          Grade {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Decision */}
                  <div>
                    <label className="block text-xs font-semibold text-[#55615B] mb-2">
                      Keputusan <span className="text-[#B54747]">*</span>
                    </label>
                    <div className="flex gap-2">
                      {([
                        { v: "terima", label: "Terima", cls: "bg-[#DDF3EC] text-[#173F35] border-[#3D9274]" },
                        { v: "tolak", label: "Tolak", cls: "bg-[#FCEBEB] text-[#B54747] border-[#B54747]" },
                      ] as const).map(({ v, label, cls }) => (
                        <button
                          key={v}
                          onClick={() => setDecision(v)}
                          className={`flex-1 h-10 rounded-[6px] text-sm font-semibold border transition-colors ${
                            decision === v ? cls : "bg-white text-[#1E2925] border-[#D2DCD5] hover:border-[#246B56]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reject reason */}
                  {decision === "tolak" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#55615B] mb-1.5">
                        Alasan Penolakan <span className="text-[#B54747]">*</span>
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Jelaskan alasan penolakan..."
                        className="w-full px-3 py-2 text-sm border border-[#D2DCD5] rounded-[6px] focus:outline-none focus:border-[#246B56] resize-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmitValidation}
                    disabled={submitted}
                    className="w-full h-10 bg-[#173F35] text-white rounded-[6px] text-sm font-semibold hover:bg-[#246B56] disabled:opacity-50 transition-colors"
                  >
                    {submitted ? "Menyimpan..." : "Simpan Validasi"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upload evidence — only for "menunggu_bukti" */}
          {batch.status === "menunggu_bukti" && (
            <div className="border-t border-[#D2DCD5] pt-6">
              {/* Important notice — no "recycled" claim before evidence */}
              <div className="rounded-[6px] bg-[#FBF1DF] border border-[#F3DFBD] p-3 mb-4 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-[#A86712] shrink-0 mt-0.5" />
                <p className="text-xs text-[#A86712]">
                  <strong>Perhatian:</strong> Status &ldquo;sudah didaur ulang&rdquo; hanya akan ditampilkan
                  setelah bukti pemrosesan diunggah. Status saat ini: menunggu bukti.
                </p>
              </div>

              <h3 className="font-semibold text-[#1E2925] text-sm mb-4">
                Unggah Bukti Pemrosesan
              </h3>

              <div className="space-y-4">
                {/* Outcome */}
                <div>
                  <label className="block text-xs font-semibold text-[#55615B] mb-2">
                    Hasil Pemrosesan <span className="text-[#B54747]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { v: "diproses", label: "Diproses" },
                      { v: "dipakai_ulang", label: "Dipakai Ulang" },
                      { v: "residu", label: "Residu" },
                    ] as const).map(({ v, label }) => (
                      <button
                        key={v}
                        onClick={() => setOutcome(v)}
                        className={`h-10 rounded-[6px] text-xs font-semibold border transition-colors ${
                          outcome === v
                            ? "bg-[#173F35] text-white border-[#173F35]"
                            : "bg-white text-[#1E2925] border-[#D2DCD5] hover:border-[#246B56]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Residu weight — mandatory if residu */}
                {outcome === "residu" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#55615B] mb-1.5">
                      Berat Residu (kg) <span className="text-[#B54747]">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={residuKg}
                      onChange={e => setResiduKg(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-10 px-3 text-sm border border-[#D2DCD5] rounded-[6px] focus:outline-none focus:border-[#246B56]"
                    />
                  </div>
                )}

                {/* File upload */}
                <div>
                  <label className="block text-xs font-semibold text-[#55615B] mb-1.5">
                    Bukti Pemrosesan (foto/dokumen)
                  </label>
                  <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#D2DCD5] rounded-[6px] hover:border-[#246B56] cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-[#55615B]" />
                    <span className="text-xs text-[#55615B]">
                      {evidenceFile ? evidenceFile.name : "Klik untuk unggah foto/dokumen"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={e => setEvidenceFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <button
                  onClick={handleSubmitValidation}
                  disabled={submitted}
                  className="w-full h-10 bg-[#173F35] text-white rounded-[6px] text-sm font-semibold hover:bg-[#246B56] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {submitted ? "Mengunggah..." : "Unggah & Selesaikan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type Batch = typeof MOCK_BATCHES[0]

const BATCH_COLUMNS: Column<Batch>[] = [
  {
    key: "code", header: "Kode Batch", sortable: true,
    cell: row => (
      <span className="text-xs font-mono text-[#1E2925] font-semibold">{row.code}</span>
    )
  },
  {
    key: "material_name", header: "Material", sortable: true,
    cell: row => <span className="text-sm text-[#1E2925]">{row.material_name}</span>
  },
  {
    key: "origin_org_name", header: "Asal",
    cell: row => <span className="text-xs text-[#55615B]">{row.origin_org_name}</span>
  },
  {
    key: "quantity", header: "Berat", sortable: true,
    cell: row => <span className="text-sm font-semibold text-[#1E2925]">{formatKg(row.quantity)}</span>
  },
  {
    key: "status", header: "Status",
    cell: row => <StatusBadge status={mapBatchStatus(row.status)} size="sm" />
  },
  {
    key: "created_at", header: "Dibuat",
    cell: row => <span className="text-xs text-[#55615B]">{timeAgo(row.created_at)}</span>
  },
]

export default function BatchPage() {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [searchCode, setSearchCode] = useState("")

  return (
    <div className="space-y-6">

      {/* ── ANSWER BANNER ── */}
      {waitingValidation > 0 || waitingEvidence > 0 ? (
        <AnswerBanner
          answer={[
            waitingValidation > 0 && `${waitingValidation} batch menunggu validasimu`,
            waitingEvidence > 0 && `${waitingEvidence} batch menunggu bukti pemrosesan`,
          ].filter(Boolean).join(" · ")}
          icon={AlertTriangle}
          variant="dark"
        />
      ) : (
        <AnswerBanner
          answer="Semua batch sudah divalidasi · tidak ada yang perlu tindakanmu"
          icon={CheckCircle2}
          variant="calm"
        />
      )}

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Batch Masuk (Bulan Ini)"
          value={MOCK_BATCHES.length}
          unit="batch"
          icon={Package}
          source="dari material_batches"
          updatedAt="08.00"
        />
        <KpiCard
          label="Batch Layak"
          value={MOCK_BATCHES.filter(b => ["diterima","diproses","dipakai_ulang"].includes(b.status)).length}
          unit="batch"
          icon={CheckCircle2}
          source="dari material_batches"
          updatedAt="08.00"
        />
        <KpiCard
          label="Residu"
          value={residuTotal.toFixed(1)}
          unit="kg"
          icon={AlertTriangle}
          source="dari batch_events type=residu"
          updatedAt="08.00"
        />
        <KpiCard
          label="Menunggu Bukti"
          value={waitingEvidence}
          unit="batch"
          icon={Recycle}
          emphasis={waitingEvidence > 0}
          source="dari material_batches"
          footer={
            waitingEvidence > 0
              ? <span className="text-[11px] text-[#A86712] font-semibold">⚠ Perlu unggah bukti</span>
              : <span className="text-[11px] text-[#3D9274]">✓ Semua terdokumentasi</span>
          }
        />
      </div>

      {/* ── SEARCH BATCH ── */}
      <div className="bg-white rounded-[6px] border border-[#D2DCD5] p-6">
        <h2 className="font-semibold text-[#1E2925] text-sm mb-3">
          Cari Batch
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55615B]" />
            <input
              type="text"
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              placeholder="Masukkan kode batch (contoh: PY-20261113-MELATI-001)..."
              className="w-full pl-9 pr-3 h-10 text-sm border border-[#D2DCD5] rounded-[6px] focus:outline-none focus:border-[#246B56]"
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 h-10 border border-[#D2DCD5] rounded-[6px] text-sm text-[#55615B] hover:border-[#246B56] hover:text-[#246B56] transition-colors"
            aria-label="Scan kode QR"
          >
            <QrCode className="w-4 h-4" />
            Scan QR
          </button>
        </div>
        {searchCode && (
          <div className="mt-2">
            {MOCK_BATCHES.filter(b =>
              b.code.toLowerCase().includes(searchCode.toLowerCase())
            ).map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBatch(b)}
                className="w-full flex items-center gap-3 p-3 mt-1 rounded-[6px] border border-[#D2DCD5] hover:border-[#246B56] text-left transition-colors"
              >
                <Package className="w-4 h-4 text-[#3D9274]" />
                <div className="flex-1">
                  <div className="text-sm font-mono font-semibold text-[#1E2925]">{b.code}</div>
                  <div className="text-xs text-[#55615B]">{b.material_name} · {formatKg(b.quantity)}</div>
                </div>
                <StatusBadge status={mapBatchStatus(b.status)} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── BATCH TABLE ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#1E2925]">Semua Batch</h2>
          <span className="text-xs text-[#55615B]">dari material_batches · klik baris untuk detail</span>
        </div>
        <DataTable
          columns={BATCH_COLUMNS}
          data={MOCK_BATCHES}
          keyExtractor={r => r.id}
          searchKeys={["code", "material_name"]}
          searchPlaceholder="Cari kode atau material..."
          emptyTitle="Belum ada batch"
          onRowClick={row => setSelectedBatch(row)}
        />
      </section>

      {/* Batch detail drawer */}
      {selectedBatch && (
        <BatchDetailDrawer
          batch={selectedBatch}
          onClose={() => setSelectedBatch(null)}
        />
      )}
    </div>
  )
}
