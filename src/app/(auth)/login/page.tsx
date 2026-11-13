// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email dan password wajib diisi")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message ?? "Login gagal")
        return
      }

      // Store token in localStorage as fallback (httpOnly cookie set by server)
      localStorage.setItem("pilahyuk_token", data.data.token)
      localStorage.setItem("pilahyuk_user", JSON.stringify(data.data.user))

      // Redirect based on role
      const role = data.data.user.role
      if (role === "super_admin") router.push("/admin/overview")
      else router.push("/dashboard")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { label: "Super Admin", email: "admin@pilahyuk.id", password: "admin123" },
    { label: "Operator Bank Sampah", email: "operator@banksampah.id", password: "operator123" },
    { label: "Pengurus Komunitas", email: "pengurus@komunitas.id", password: "pengurus123" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#173F35] brand-motif flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#DDF3EC] rounded-xl flex items-center justify-center">
              <span className="text-[#173F35] font-black text-lg">P</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">PilahYuk 2.0</div>
              <div className="text-[#DDF3EC]/60 text-xs">Portal Mitra</div>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight">
            Platform Komunitas<br />
            <span className="text-[#DDF3EC]">Ekonomi Sirkular</span>
          </h1>
          <p className="mt-4 text-[#DDF3EC]/70 text-base leading-relaxed max-w-sm">
            Kelola komunitas, catat penimbangan, lacak batch material, dan pantau dampak lingkungan secara transparan.
          </p>
        </div>

        <div className="space-y-3">
          {["Transparent by default", "Evidence-based impact", "Offline-aware", "Audit everything"].map(principle => (
            <div key={principle} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#DDF3EC] rounded-full" />
              <span className="text-[#DDF3EC]/70 text-sm">{principle}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F6F8F5]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#173F35] rounded-xl flex items-center justify-center">
              <span className="text-white font-black">P</span>
            </div>
            <div className="font-bold text-[#173F35]">PilahYuk 2.0</div>
          </div>

          <h2 className="text-2xl font-bold text-[#1E2925] mb-1">Masuk</h2>
          <p className="text-sm text-[#66736D] mb-6">Portal Mitra & Super Admin</p>

          {error && (
            <div className="mb-4 rounded-[12px] bg-[#FCEBEB] border border-[#B54747]/30 px-4 py-3">
              <p className="text-sm text-[#B54747]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-[#1E2925] mb-1.5">
                Email atau Nomor HP
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full h-12 px-4 border border-[#E1E8E3] rounded-[12px] text-sm text-[#1E2925] placeholder:text-[#66736D] bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC] transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[#1E2925]">Password</label>
                <button type="button" className="text-xs text-[#246B56] hover:underline">
                  Lupa password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 border border-[#E1E8E3] rounded-[12px] text-sm text-[#1E2925] placeholder:text-[#66736D] bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC] transition-colors"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#173F35] text-white font-semibold rounded-[12px] hover:bg-[#246B56] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </>
              ) : "Masuk"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 rounded-[12px] bg-[#EBF3F9] border border-[#286A9B]/20">
            <p className="text-xs font-semibold text-[#286A9B] mb-2">Demo — klik untuk isi otomatis:</p>
            <div className="space-y-1.5">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                  className="w-full text-left px-3 py-1.5 rounded-[8px] text-xs text-[#286A9B] hover:bg-[#286A9B]/10 transition-colors"
                >
                  <strong>{acc.label}</strong>
                  <span className="text-[#286A9B]/70 ml-1">· {acc.email}</span>
                </button>
              ))}
              <p className="text-[10px] text-[#286A9B]/60 mt-1">Klik akun untuk isi otomatis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
