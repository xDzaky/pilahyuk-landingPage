// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!identifier || !password) {
      setError("Email/nomor HP dan password wajib diisi")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message ?? "Login gagal")
        return
      }

      // Cookie httpOnly sudah dipasang server; hanya profil non-sensitif untuk UI.
      localStorage.setItem("pilahyuk_user", JSON.stringify(data.data.user))

      // Redirect sesuai role (sama dengan aturan proxy)
      const role: string = data.data.user.role
      const home =
        role === "super_admin" ? "/admin/overview"
        : role === "resident" || role === "volunteer" ? "/dampak"
        : role === "collector" ? "/pengumpulan"
        : role === "recycler" ? "/batch"
        : role === "curator" ? "/pengetahuan"
        : "/dashboard"
      router.push(home)
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
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#55615B] transition-colors hover:text-[#173F35]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke beranda
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#173F35] rounded-[6px] flex items-center justify-center">
              <span className="text-white font-black">P</span>
            </div>
            <div className="font-bold text-[#173F35]">PilahYuk 2.0</div>
          </div>

          <h2 className="text-2xl font-bold text-[#1E2925] mb-1">Masuk</h2>
          <p className="text-sm text-[#55615B] mb-6">Portal Mitra & Super Admin</p>

          {error && (
            <div className="mb-4 rounded-[6px] bg-[#FCEBEB] border border-[#B54747]/30 px-4 py-3" role="alert">
              <p className="text-sm text-[#B54747]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold text-[#1E2925] mb-1.5">
                Email atau Nomor HP
              </label>
              <input
                id="identifier"
                type="text"
                inputMode="email"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="email@contoh.com atau 08123456789"
                className="w-full h-12 px-4 border border-[#D2DCD5] rounded-[6px] text-sm text-[#1E2925] placeholder:text-[#55615B] bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC] transition-colors"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-[#1E2925]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#246B56] hover:underline">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-4 pr-12 border border-[#D2DCD5] rounded-[6px] text-sm text-[#1E2925] placeholder:text-[#55615B] bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC] transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-[4px] text-[#55615B] hover:text-[#1E2925] hover:bg-[#EDF1EC] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#173F35] text-white font-semibold rounded-[6px] hover:bg-[#246B56] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </>
              ) : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#55615B]">
            Belum punya akun?{" "}
            <Link href="/register" className="font-semibold text-[#246B56] hover:underline">
              Daftar akun baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
