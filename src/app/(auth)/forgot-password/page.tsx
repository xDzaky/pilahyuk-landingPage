// src/app/(auth)/forgot-password/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, KeyRound } from "lucide-react"

type Step = "request" | "reset" | "done"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request")
  const [identifier, setIdentifier] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!identifier) {
      setError("Email atau nomor WhatsApp wajib diisi")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message ?? "Gagal mengirim tautan pemulihan")
        return
      }
      if (data.data.dev_reset_token) setToken(data.data.dev_reset_token)
      setStep("reset")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error?.message ?? "Gagal mengubah kata sandi")
        return
      }
      setStep("done")
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#F6F8F5]">
      <div className="w-full max-w-sm">
        <div className="w-11 h-11 rounded-[6px] bg-[#DDF3EC] flex items-center justify-center mb-5">
          <KeyRound className="w-5 h-5 text-[#173F35]" />
        </div>

        {step === "request" && (
          <>
            <h1 className="text-2xl font-bold text-[#1E2925] mb-1">Lupa Kata Sandi</h1>
            <p className="text-sm text-[#55615B] mb-6">
              Masukkan email atau nomor WhatsApp terdaftar untuk menerima tautan pemulihan.
            </p>
            {error && <ErrorBox message={error} />}
            <form onSubmit={handleRequest} className="space-y-4" noValidate>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="email@contoh.com atau 08123456789"
                aria-label="Email atau nomor WhatsApp"
                className="w-full h-12 px-4 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC]"
              />
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-[#173F35] text-white font-semibold rounded-[6px] hover:bg-[#246B56] disabled:opacity-50 text-sm">
                {loading ? "Mengirim..." : "Kirim Tautan Pemulihan"}
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className="text-2xl font-bold text-[#1E2925] mb-1">Atur Ulang Kata Sandi</h1>
            <p className="text-sm text-[#55615B] mb-6">
              Buat kata sandi baru minimal 8 karakter.
            </p>
            {token && (
              <div className="mb-4 rounded-[6px] bg-[#EBF3F9] border border-[#286A9B]/20 px-4 py-3">
                <p className="text-xs text-[#286A9B]">
                  Mode demo — token pemulihan sudah terisi otomatis.
                </p>
              </div>
            )}
            {error && <ErrorBox message={error} />}
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <div>
                <label htmlFor="token" className="block text-sm font-semibold text-[#1E2925] mb-1.5">Token Pemulihan</label>
                <input id="token" type="text" value={token} onChange={e => setToken(e.target.value)}
                  className="w-full h-12 px-4 border border-[#D2DCD5] rounded-[6px] text-xs font-mono bg-white focus:outline-none focus:border-[#246B56]" />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-[#1E2925] mb-1.5">Kata Sandi Baru</label>
                <div className="relative">
                  <input id="new-password" type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter"
                    className="w-full h-12 pl-4 pr-12 border border-[#D2DCD5] rounded-[6px] text-sm bg-white focus:outline-none focus:border-[#246B56] focus:ring-2 focus:ring-[#DDF3EC]"
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-[4px] text-[#55615B] hover:text-[#1E2925] hover:bg-[#EDF1EC]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-[#173F35] text-white font-semibold rounded-[6px] hover:bg-[#246B56] disabled:opacity-50 text-sm">
                {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <h1 className="text-2xl font-bold text-[#1E2925] mb-1">Kata Sandi Diperbarui</h1>
            <p className="text-sm text-[#55615B] mb-6">Silakan masuk dengan kata sandi baru Anda.</p>
            <Link href="/login"
              className="inline-flex w-full h-12 items-center justify-center bg-[#173F35] text-white font-semibold rounded-[6px] hover:bg-[#246B56] text-sm">
              Kembali ke Halaman Masuk
            </Link>
          </>
        )}

        {step !== "done" && (
          <p className="mt-6 text-center text-sm text-[#55615B]">
            <Link href="/login" className="font-semibold text-[#246B56] hover:underline">Kembali ke halaman masuk</Link>
          </p>
        )}
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-[6px] bg-[#FCEBEB] border border-[#B54747]/30 px-4 py-3" role="alert">
      <p className="text-sm text-[#B54747]">{message}</p>
    </div>
  )
}
