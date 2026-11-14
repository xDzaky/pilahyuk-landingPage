import Link from "next/link";
import { ShieldX, ArrowLeft, LogIn } from "lucide-react";

export const metadata = {
  title: "Akses ditolak — PilahYuk",
  robots: { index: false, follow: false },
};

export default function AksesDitolakPage() {
  return (
    <main className="min-h-screen bg-[#F6F8F5] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[16px] border border-[#E1E8E3] bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCEBEB]">
          <ShieldX className="h-6 w-6 text-[#B54747]" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-[#1E2925]">Akses ditolak</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#66736D]">
          Peran akunmu tidak memiliki izin untuk membuka halaman ini. Hubungi pengurus atau admin
          komunitas bila kamu merasa ini keliru.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#173F35] px-4 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke beranda
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#E1E8E3] px-4 text-sm font-semibold text-[#246B56]"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Masuk dengan akun lain
          </Link>
        </div>
      </div>
    </main>
  );
}
