"use client";
export default function VerifikasiPage() {
  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden mb-6" style={{ background: "#173F35" }}>
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Pusat Verifikasi</div>
          <div className="text-white font-semibold">Kelola semua antrian verifikasi: organisasi, batch, dan dokumen.</div>
        </div>
      </div>
      <div className="bg-white border border-[#E1E8E3] rounded-2xl p-8 text-center text-[#66736D]">
        <div className="text-4xl mb-3">🔍</div>
        <div className="font-semibold text-[#1E2925]">Halaman Verifikasi Terpusat</div>
        <div className="text-sm mt-1">Lihat antrean per bagian: Organisasi, Batch, dan Dokumen.</div>
      </div>
    </div>
  );
}
