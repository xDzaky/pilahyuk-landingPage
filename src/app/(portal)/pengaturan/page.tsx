"use client";

import { useState } from "react";
import { User, Bell, Shield, LogOut, Camera, Save } from "lucide-react";

export default function PengaturanPage() {
  const [name, setName] = useState("Budi Santoso");
  const [phone, setPhone] = useState("08123456789");
  const [notifPickup, setNotifPickup] = useState(true);
  const [notifBatch, setNotifBatch] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Answer Banner */}
      <div className="relative rounded-2xl px-6 py-4 overflow-hidden" style={{ background: "#173F35" }}>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ccircle cx='100' cy='100' r='80' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='100' cy='100' r='30' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "120px 120px", backgroundPosition: "right -20px top -20px", backgroundRepeat: "no-repeat" }} />
        <div className="relative">
          <div className="text-xs text-[#DDF3EC] font-medium uppercase tracking-widest mb-1">Pengaturan Akun</div>
          <div className="text-white font-semibold">Kelola profil, notifikasi, dan keamanan akun Anda.</div>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1E2925] mb-2">
          <User className="w-4 h-4 text-[#3D9274]" />
          Profil
        </div>
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-[#173F35] flex items-center justify-center text-white text-xl font-bold">
              BS
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-[#E1E8E3] rounded-full flex items-center justify-center hover:bg-[#F6F8F5]">
              <Camera className="w-3 h-3 text-[#66736D]" />
            </button>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#1E2925]">{name}</div>
            <div className="text-xs text-[#66736D]">operator@banksampah.id</div>
            <div className="text-xs text-[#3D9274] mt-0.5">Operator Bank Sampah</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#66736D] block mb-1.5">Nama Lengkap</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#66736D] block mb-1.5">Nomor WhatsApp</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
            <div className="text-xs text-[#66736D] mt-1">Digunakan untuk notifikasi penjemputan dan pembayaran</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#66736D] block mb-1.5">Email</label>
            <input type="email" defaultValue="operator@banksampah.id" disabled
              className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm bg-[#F6F8F5] text-[#66736D] cursor-not-allowed" />
            <div className="text-xs text-[#66736D] mt-1">Email tidak dapat diubah</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1E2925] mb-4">
          <Bell className="w-4 h-4 text-[#3D9274]" />
          Notifikasi WhatsApp
        </div>
        <div className="space-y-4">
          {[
            { label: "Konfirmasi penjemputan batch", state: notifPickup, setter: setNotifPickup },
            { label: "Status batch baru", state: notifBatch, setter: setNotifBatch },
            { label: "Laporan mingguan ringkasan", state: notifWeekly, setter: setNotifWeekly },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-[#1E2925]">{item.label}</span>
              <button
                onClick={() => item.setter(!item.state)}
                className={`w-10 h-5 rounded-full transition-colors relative ${item.state ? "bg-[#3D9274]" : "bg-[#E1E8E3]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.state ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white border border-[#E1E8E3] rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1E2925] mb-4">
          <Shield className="w-4 h-4 text-[#3D9274]" />
          Keamanan
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#66736D] block mb-1.5">Password Baru</label>
            <input type="password" placeholder="Minimal 8 karakter"
              className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#66736D] block mb-1.5">Konfirmasi Password</label>
            <input type="password" placeholder="Ulangi password baru"
              className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-700 rounded-xl text-sm hover:bg-red-50">
          <LogOut className="w-4 h-4" />
          Logout dari semua perangkat
        </button>
        <button onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#173F35] text-white rounded-xl text-sm font-semibold hover:bg-[#246B56] transition-colors">
          <Save className="w-4 h-4" />
          {saved ? "✓ Tersimpan" : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
