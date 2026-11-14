"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Bell, Shield, LogOut, Camera, Save, MapPin,
  Building2, Smartphone, CheckCircle2, AlertCircle, Key,
  ExternalLink, HelpCircle, Laptop, Clock, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  operator_bank_sampah: "Operator Bank Sampah",
  pengurus_komunitas: "Pengurus Komunitas",
  collector: "Petugas Pengumpul",
  recycler: "Mitra Pengolah",
  curator: "Kurator Budaya",
  resident: "Warga / Resident",
  volunteer: "Relawan / Volunteer",
};

export default function PengaturanPage() {
  const router = useRouter();

  // User state
  const [userId, setUserId] = useState("usr-demo");
  const [name, setName] = useState("Budi Santoso");
  const [phone, setPhone] = useState("08123456789");
  const [email, setEmail] = useState("operator@banksampah.id");
  const [role, setRole] = useState("operator_bank_sampah");
  const [orgName, setOrgName] = useState("Bank Sampah Melati");
  const [district, setDistrict] = useState("Mayangan");
  const [village, setVillage] = useState("Sukabumi");
  const [rw, setRw] = useState("RW 05");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification toggles
  const [notifPickup, setNotifPickup] = useState(true);
  const [notifBatch, setNotifBatch] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifSecurity, setNotifSecurity] = useState(true);

  // Status & feedback
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load real user data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pilahyuk_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.id) setUserId(u.id);
        if (u.name) setName(u.name);
        if (u.phone) setPhone(u.phone);
        if (u.email) setEmail(u.email);
        if (u.role) setRole(u.role);
        if (u.org_name) setOrgName(u.org_name);
        if (u.district) setDistrict(u.district);
        if (u.village) setVillage(u.village);
        if (u.rw) setRw(u.rw);
      }
    } catch {}
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);

    // Validasi password jika diisi
    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setFeedback({ type: "error", text: "Kata sandi baru minimal 8 karakter." });
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
        setSaving(false);
        return;
      }
      if (!currentPassword) {
        setFeedback({ type: "error", text: "Kata sandi saat ini wajib diisi untuk mengganti kata sandi." });
        setSaving(false);
        return;
      }
    }

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim(),
        district: district.trim(),
        village: village.trim(),
        rw: rw.trim(),
      };

      if (newPassword) {
        payload.password = newPassword;
        payload.current_password = currentPassword;
      }

      const res = await fetch("/api/v1/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          text: json.error?.message || "Gagal menyimpan perubahan profil.",
        });
        setSaving(false);
        return;
      }

      // Update localStorage
      const stored = localStorage.getItem("pilahyuk_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.name = name.trim();
        u.phone = phone.trim();
        u.district = district.trim();
        u.village = village.trim();
        u.rw = rw.trim();
        localStorage.setItem("pilahyuk_user", JSON.stringify(u));
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback({ type: "success", text: "Pengaturan akun berhasil disimpan ke database." });
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan jaringan. Coba lagi." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari semua perangkat?")) {
      try {
        await fetch("/api/v1/auth/logout", { method: "POST" });
      } catch {}
      localStorage.removeItem("pilahyuk_token");
      localStorage.removeItem("pilahyuk_user");
      router.push("/login");
    }
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      {/* ── HEADER BANNER ── */}
      <div className="relative rounded-[20px] px-6 py-5 overflow-hidden text-white bg-[#173F35] brand-motif border border-white/10 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#DDF3EC] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#DDF3EC]" />
              Pengaturan Akun & Keamanan
            </div>
            <h1 className="text-white font-bold text-xl md:text-2xl leading-tight">
              Pusat Kendali Profil & Preferensi
            </h1>
            <p className="text-[#DDF3EC]/80 text-xs md:text-sm mt-1">
              Kelola data identitas, preferensi notifikasi WhatsApp, wilayah komunitas, dan keamanan login Anda.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DDF3EC] text-[#173F35] rounded-[14px] text-sm font-bold hover:bg-white transition-all shadow-sm active:scale-95 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={cn(
            "p-4 rounded-[16px] border flex items-center gap-3 transition-all text-sm font-semibold animate-in fade-in slide-in-from-top-2",
            feedback.type === "success"
              ? "bg-[#DDF3EC] border-[#3D9274]/40 text-[#173F35]"
              : "bg-[#FCEBEB] border-[#B54747]/40 text-[#B54747]"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#246B56]" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-[#B54747]" />
          )}
          <span className="flex-1">{feedback.text}</span>
        </div>
      )}

      {/* ── 2-COLUMN BALANCED GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* ── LEFT COLUMN (7 COLS): FORMS ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Profil Personal */}
          <div className="bg-white border border-[#E1E8E3] rounded-[20px] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E1E8E3] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DDF3EC] text-[#173F35] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1E2925]">Informasi Pribadi</h2>
                  <p className="text-xs text-[#66736D]">Identitas akun yang terverifikasi di jaringan PilahYuk</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-[#DDF3EC] text-[#173F35] text-[11px] font-bold rounded-full">
                Terverifikasi
              </span>
            </div>

            {/* Avatar Row */}
            <div className="flex items-center gap-4 bg-[#F6F8F5] p-4 rounded-[16px] border border-[#E1E8E3]">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#173F35] text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-white">
                  {initials}
                </div>
                <button
                  type="button"
                  title="Ubah foto profil"
                  onClick={() => alert("Fitur unggah avatar terhubung ke penyimpanan S3/CDN.")}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-[#E1E8E3] rounded-full flex items-center justify-center hover:bg-[#DDF3EC] transition-colors shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-[#173F35]" />
                </button>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1E2925] truncate">{name}</div>
                <div className="text-xs text-[#66736D] truncate">{email}</div>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 bg-white border border-[#E1E8E3] rounded-md text-[11px] font-semibold text-[#173F35]">
                  <Building2 className="w-3 h-3 text-[#3D9274]" />
                  <span>{orgName}</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E2925] block mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  className="w-full border border-[#E1E8E3] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3D9274] focus:ring-2 focus:ring-[#DDF3EC] transition-all bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#1E2925] block mb-1.5">Nomor WhatsApp</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-[#66736D] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full border border-[#E1E8E3] rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3D9274] focus:ring-2 focus:ring-[#DDF3EC] transition-all bg-white font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-[#66736D] mt-1">Untuk kode OTP & notifikasi timbangan</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1E2925] block mb-1.5">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full border border-[#E1E8E3] rounded-xl px-3.5 py-2.5 text-sm bg-[#F6F8F5] text-[#66736D] cursor-not-allowed font-mono"
                  />
                  <p className="text-[11px] text-[#66736D] mt-1">Email identitas utama tidak dapat diubah</p>
                </div>
              </div>
            </div>

            {/* Wilayah & Domisili */}
            <div className="pt-2 border-t border-[#E1E8E3] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E2925] uppercase tracking-wider text-[#66736D]">
                <MapPin className="w-3.5 h-3.5 text-[#3D9274]" />
                Wilayah Domisili Komunitas
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#66736D] block mb-1">Kecamatan</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Kecamatan"
                    className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#66736D] block mb-1">Kelurahan / Desa</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Kelurahan"
                    className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#66736D] block mb-1">RW / Dusun</label>
                  <input
                    type="text"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    placeholder="RW 05"
                    className="w-full border border-[#E1E8E3] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#3D9274]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Keamanan & Password */}
          <div className="bg-white border border-[#E1E8E3] rounded-[20px] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#E1E8E3] pb-4">
              <div className="w-8 h-8 rounded-xl bg-[#FBF1DF] text-[#A86712] flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1E2925]">Perbarui Kata Sandi</h2>
                <p className="text-xs text-[#66736D]">Pastikan menggunakan kombinasi kata sandi yang aman dan sulit ditebak</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1E2925] block mb-1.5">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full border border-[#E1E8E3] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3D9274] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#1E2925] block mb-1.5">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full border border-[#E1E8E3] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3D9274] bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1E2925] block mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full border border-[#E1E8E3] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3D9274] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 COLS): STATUS & PREFERENSI ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Ringkasan Akun & Role */}
          <div className="bg-white border border-[#E1E8E3] rounded-[20px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1E2925] border-b border-[#E1E8E3] pb-3">
              <Shield className="w-4 h-4 text-[#3D9274]" />
              Detail Hak Akses Akun
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#F6F8F5]">
                <span className="text-[#66736D]">Peran Akses</span>
                <span className="font-bold text-[#173F35] bg-[#DDF3EC] px-2.5 py-0.5 rounded-full">
                  {ROLE_LABELS[role] || role}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#F6F8F5]">
                <span className="text-[#66736D]">Organisasi / Unit</span>
                <span className="font-semibold text-[#1E2925] text-right truncate max-w-[200px]">
                  {orgName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#F6F8F5]">
                <span className="text-[#66736D]">ID Akun Sistem</span>
                <span className="font-mono text-[#66736D]">{userId}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#F6F8F5]">
                <span className="text-[#66736D]">Status Akun</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#246B56]">
                  <span className="w-2 h-2 rounded-full bg-[#246B56]" />
                  Aktif & Terverifikasi
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#66736D]">Tipe Pengguna</span>
                <span className="font-semibold text-[#1E2925]">Mitra Komunitas</span>
              </div>
            </div>
          </div>

          {/* Card: Notifikasi WhatsApp */}
          <div className="bg-white border border-[#E1E8E3] rounded-[20px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E8E3] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E2925]">
                <Bell className="w-4 h-4 text-[#3D9274]" />
                Preferensi Notifikasi
              </div>
              <span className="text-[11px] font-semibold text-[#3D9274]">WhatsApp Live</span>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  id: "pickup",
                  title: "Penjemputan Sampah",
                  desc: "Kirim pesan saat jadwal penjemputan dikonfirmasi",
                  state: notifPickup,
                  setter: setNotifPickup,
                },
                {
                  id: "batch",
                  title: "Pembaruan Status Batch",
                  desc: "Pemberitahuan saat batch diterima oleh mitra pengolah",
                  state: notifBatch,
                  setter: setNotifBatch,
                },
                {
                  id: "weekly",
                  title: "Ringkasan Mingguan",
                  desc: "Laporan rekap omzet & kilogram sampah terpilah",
                  state: notifWeekly,
                  setter: setNotifWeekly,
                },
                {
                  id: "security",
                  title: "Peringatan Keamanan",
                  desc: "Alert saat ada login dari perangkat atau IP baru",
                  state: notifSecurity,
                  setter: setNotifSecurity,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1E2925]">{item.title}</div>
                    <div className="text-[11px] text-[#66736D] leading-relaxed">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.state)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative shrink-0 mt-0.5",
                      item.state ? "bg-[#3D9274]" : "bg-[#E1E8E3]"
                    )}
                    aria-label={`Toggle ${item.title}`}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                        item.state ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Sesi Login & Perangkat Aktif */}
          <div className="bg-white border border-[#E1E8E3] rounded-[20px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1E2925] border-b border-[#E1E8E3] pb-3">
              <Laptop className="w-4 h-4 text-[#3D9274]" />
              Sesi Login Perangkat
            </div>

            <div className="p-3 bg-[#F6F8F5] rounded-[14px] border border-[#E1E8E3] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E1E8E3] flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4 text-[#173F35]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1E2925] truncate">Browser Sesi Ini (Desktop)</div>
                  <div className="text-[10px] text-[#66736D] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-[#246B56]" />
                    <span>Aktif sekarang · Terautentikasi JWT</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#DDF3EC] text-[#173F35] text-[10px] font-bold rounded-md shrink-0">
                Sesi Utama
              </span>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleLogoutAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#B54747]/30 text-[#B54747] hover:bg-[#FCEBEB] rounded-xl text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar dari Semua Sesi Perangkat
              </button>
            </div>
          </div>

          {/* Card: Bantuan & Info SOP */}
          <div className="bg-[#F6F8F5] border border-[#E1E8E3] rounded-[20px] p-5 text-xs text-[#66736D] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E2925]">
              <HelpCircle className="w-4 h-4 text-[#173F35]" />
              Butuh Bantuan Operasional?
            </div>
            <p className="leading-relaxed">
              Pelajari tata kelola pembukuan ledger bank sampah, penimbangan offline, dan penerbitan Batch QR di modul panduan resmi.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Link
                href="/bantuan"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#173F35] hover:underline"
              >
                <span>Buka FAQ & Bantuan</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
