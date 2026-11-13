"use client";
export default function ModerasiPage() {
  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden mb-6" style={{ background: "#173F35" }}>
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Moderasi Konten</div>
          <div className="text-white font-semibold">Tinjau konten edukasi dan artikel yang menunggu moderasi.</div>
        </div>
      </div>
      <div className="bg-white border border-[#E1E8E3] rounded-2xl p-8 text-center text-[#66736D]">
        <div className="text-4xl mb-3">📝</div>
        <div className="font-semibold text-[#1E2925]">Moderasi Konten</div>
        <div className="text-sm mt-1">Review artikel edukasi, foto profil, dan konten komunitas.</div>
      </div>
    </div>
  );
}
