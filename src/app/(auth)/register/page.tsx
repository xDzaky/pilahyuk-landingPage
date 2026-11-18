// src/app/(auth)/register/page.tsx
// Registrasi akun — mengikuti alur mobile: data akun -> wilayah -> komunitas -> OTP.
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, ShieldCheck } from "lucide-react"

type Step = "form" | "otp"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [form, setForm] = useState({
    name: "",
    identifier: "",
    password: "",
    district: "",
    village: "",
    rw: "",
    community: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState("")
  const [devCode, setDevCode] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.name || !form.identifier || !form.password) {
      setError("Nama lengkap, nomor WhatsApp/email, dan kata sandi wajib diisi")
      return
    }
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter")
      return
    }

    const isEmail = form.identifier.includes("@")
    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: isEmail ? "" : form.identifier,
          email: isEmail ? form.identifier : "",
          password: form.password,
          district: form.district,
          village: form.village,
          rw: form.rw,
          community_name: form.community || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error?.details) {
          setError(Object.values(data.error.details).flat().join(" · "))
        } else {
          setError(data.error?.message ?? "Registrasi gagal")
        }
        return
      }

      localStorage.setItem("pilahyuk_user", JSON.stringify(data.data.user))

      if (data.data.next_step === "verify_contact") {
        setPhone(data.data.user.phone ?? "")
        setDevCode(data.data.otp?.dev_code ?? "")
        setStep("otp")
        return
      }

      router.push("/dampak")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message ?? "Verifikasi gagal")
        return
      }
      router.push("/dampak")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#173F35] brand-motif flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#DDF3EC] rounded-[6px] flex items-center justify-center">
              <span className="text-[#173F35] font-black text-lg">P</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">PilahYuk 2.0</div>
              <div className="text-[#DDF3EC]/60 text-xs">Portal Mitra</div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight">
            Mulai dari<br />
            <span className="text-[#DDF3EC]">satu langkah kecil</span>
          </h1>
          <p className="mt-4 text-[#DDF3EC]/70 text-base leading-relaxed max-w-sm">
            Buat akun warga untuk mencatat setoran, mengikuti kegiatan komunitas, dan memantau dampak yang terverifikasi.
          </p>
        </div>

        <ol className="space-y-4">
          {[
            { n: 1, t: "Data akun", d: "Nama sesuai KTP, nomor WhatsApp, kata sandi" },
            { n: 2, t: "Wilayah", d: "Kecamatan, kelurahan, dan RW" },
            { n: 3, t: "Komunitas", d: "Gabung komunitas terdekat (opsional)" },
          ].map(item => (
            <li key={item.n} className="flex items-start gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full bg-[#DDF3EC] text-[#173F35] text-xs font-bold flex items-center justify-center">
                {item.n}
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{item.t}</div>
                <div className="text-xs text-[#DDF3EC]/60">{item.d}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F6F8F5]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#173F35] rounded-[6px] flex items-center justify-center">
              <span className="text-white font-black">P</span>
            </div>
            <div className="font-bold text-[#173F35]">PilahYuk 2.0</div>
          </div>

          {step === "form" ? (
            <>
              <h2 className="text-2xl font-bold text-[#1E2925] mb-1">Daftar Akun Baru</h2>
              <p className="text-sm text-[#55615B] mb-6">Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-[#246B56] hover:underline">Masuk</Link>
              </p>

              {error && (
                <div className="mb-4 rounded-[6px] bg-[#FCEBEB] border border-[#B54747]/30 px-4 py-3" role="alert">
                  <p className="text-sm text-[#B54747]">{error}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#1E2925] mb-1.5">Nama Lengkap</label>
                  <input id="name" type="text" value={form.name} onChange={set("name")}
                    placeholder="Nama sesuai KTP"
                    className="w-full h-12 px-4 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC]"
                    autoComplete="name" />
                </div>

                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-[#1E2925] mb-1.5">Nomor WhatsApp / Email</label>
                  <input id="identifier" type="text" value={form.identifier} onChange={set("identifier")}
                    placeholder="08123456789 atau email@contoh.com"
                    className="w-full h-12 px-4 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC]"
                    autoComplete="username" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#1E2925] mb-1.5">Kata Sandi</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={set("password")}
                      placeholder="Minimal 8 karakter"
                      className="w-full h-12 pl-4 pr-12 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC]"
                      autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-[4px] text-[#55615B] hover:text-[#1E2925] hover:bg-[#EDF1EC]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[#55615B]">Minimal 8 karakter, jangan pakai tanggal lahir.</p>
                </div>

                <fieldset className="pt-1">
                  <legend className="text-sm font-semibold text-[#1E2925] mb-2">Wilayah <span className="font-normal text-[#55615B]">(opsional)</span></legend>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={form.district} onChange={set("district")} placeholder="Kecamatan"
                      aria-label="Kecamatan"
                      className="h-11 px-3 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56]" />
                    <input type="text" value={form.village} onChange={set("village")} placeholder="Kelurahan"
                      aria-label="Kelurahan"
                      className="h-11 px-3 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56]" />
                    <input type="text" value={form.rw} onChange={set("rw")} placeholder="RW 02"
                      aria-label="RW"
                      className="col-span-2 h-11 px-3 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56]" />
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="community" className="block text-sm font-semibold text-[#1E2925] mb-1.5">
                    Komunitas <span className="font-normal text-[#55615B]">(opsional)</span>
                  </label>
                  <input id="community" type="text" value={form.community} onChange={set("community")}
                    placeholder="Nama komunitas terdekat"
                    className="w-full h-12 px-4 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC]" />
                  <p className="mt-1 text-[11px] text-[#55615B]">Permintaan bergabung akan ditinjau pengurus komunitas.</p>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 bg-[#173F35] text-white font-semibold rounded-[6px] hover:bg-[#246B56] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mendaftar...</> : "Selesaikan Registrasi"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-[6px] bg-[#DDF3EC] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-[#173F35]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E2925] mb-1">Verifikasi Kontak</h2>
              <p className="text-sm text-[#55615B] mb-6">
                Masukkan 4 digit kode yang dikirim ke <strong className="text-[#1E2925]">{phone}</strong>.
              </p>

              {devCode && (
                <div className="mb-4 rounded-[6px] bg-[#EBF3F9] border border-[#286A9B]/20 px-4 py-3">
                  <p className="text-xs text-[#286A9B]">
                    Mode demo — kode OTP: <strong className="font-mono text-sm">{devCode}</strong>
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-[6px] bg-[#FCEBEB] border border-[#B54747]/30 px-4 py-3" role="alert">
                  <p className="text-sm text-[#B54747]">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-[#1E2925] mb-1.5">Kode OTP (4 Digit)</label>
                  <input id="otp" type="text" inputMode="numeric" maxLength={4} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    className="w-full h-12 px-4 border border-[#D2DCD5] rounded-[6px] text-lg tracking-[0.4em] font-mono text-[#1E2925] bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC]"
                    autoComplete="one-time-code" />
                </div>
                <button type="submit" disabled={loading || otp.length !== 4}
                  className="w-full h-12 bg-[#173F35] text-white font-semibold rounded-[6px] hover:bg-[#246B56] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm">
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memverifikasi...</> : "Verifikasi & Masuk"}
                </button>
              </form>

              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/v1/auth/otp/request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone }),
                  })
                  const data = await res.json()
                  if (res.ok) setDevCode(data.data.dev_code)
                }}
                className="mt-4 w-full text-xs font-semibold text-[#246B56] hover:underline"
              >
                Kirim ulang kode verifikasi
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
