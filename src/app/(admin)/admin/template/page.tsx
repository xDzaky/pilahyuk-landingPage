"use client";
export default function TemplatePage() {
  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden mb-6" style={{ background: "#173F35" }}>
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Template Notifikasi</div>
          <div className="text-white font-semibold">Kelola template pesan WhatsApp yang dikirim ke anggota dan operator.</div>
        </div>
      </div>
      <div className="bg-white border border-[#E1E8E3] rounded-2xl p-8 text-center text-[#66736D]">
        <div className="text-4xl mb-3">💬</div>
        <div className="font-semibold text-[#1E2925]">Template Pesan</div>
        <div className="text-sm mt-1">Edit template WA untuk: konfirmasi setoran, jadwal pickup, pengumuman komunitas.</div>
      </div>
    </div>
  );
}
