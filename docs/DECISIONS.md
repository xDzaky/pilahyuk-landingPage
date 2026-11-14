# DECISIONS — Landing Page PilahYuk

Dokumen ini mencatat keputusan, penyimpangan dari `docs/LANDING_BRIEF.md`, dan semua placeholder yang masih terbuka.
Status: sudah di-push ke `xDzaky/pilahyuk-landingPage` dan ter-deploy di Vercel.

## 1. Ringkasan implementasi

| Area | Keputusan |
|---|---|
| Framework | Next.js 16 App Router yang sudah ada di repo (bukan proyek `landing/` terpisah) |
| Halaman | `/` sekarang landing page. `/login` tetap halaman masuk portal |
| Login | Tautan **Masuk** ada di navbar (desktop) dan di sheet menu (mobile), lalu menuju `/login` |
| Styling | Tailwind v4 + `src/app/landing.css` dengan token §3 (scoped `.lp`) |
| Font | Plus Jakarta Sans lewat `<link>` Google Fonts di `layout.tsx` (bukan `next/font`) |
| Ikut serta | Navbar, S1–S11, S13–S15. S12 (cerita komunitas) tidak dirender karena belum ada kutipan nyata |
| Gambar | Semua slot §7.2 dan screenshot §8.1 memakai placeholder berlabel; berkas otomatis terpakai begitu ditaruh di `public/` |
| Animasi | `Reveal` buatan sendiri (IntersectionObserver + CSS), tanpa pustaka `motion` |
| QR | `qrcode.react` level H, hanya tampil ≥1024px |
| Deploy | Vercel project `pilahyuk` → https://pilahyuk-dashboard.vercel.app |
| Analitik | Belum dipasang (tidak ada cookie/pelacak). Event §5.16 belum dikirim |

## 2. Gambar & screenshot yang masih placeholder

Sistem placeholder: `src/lib/landing/assets.ts` memeriksa `public/` saat render. Selama berkas belum ada, komponen menampilkan kotak hijau bergaris dengan kode slot + nama berkas. Tidak ada UI aplikasi palsu yang digambar.

Letakkan berkas dengan nama berikut untuk mengaktifkannya otomatis (tanpa ubah kode):

| Slot | Berkas |
|---|---|
| H1 | `public/img/hero-gang-pagi.avif` |
| A1 | `public/img/tentang-memilah.avif` |
| A2 | `public/img/tentang-tangan.avif` |
| A3 | `public/img/tentang-timbang.avif` |
| F1–F7 | `public/img/fitur-aturan.avif`, `fitur-jemput.avif`, `fitur-bank.avif`, `fitur-agenda.avif`, `fitur-batch.avif`, `fitur-budaya.avif`, `fitur-offline.avif` |
| O1 | `public/img/offline-balai.avif` |
| C1 | `public/img/komunitas-kerja-bakti.avif` |
| C2 | `public/img/komunitas-budaya.avif` |
| B1 | `public/img/unduh-banner.avif` |
| Layar | `public/screens/01-beranda.png` … `15-bukti-hasil.png` (nama lengkap di `src/content/id.ts`) |

Rekomendasi ukuran ada di brief §7.2 dan §8.1. Screenshot harus dari aplikasi Flutter asli, bukan hasil generate.

## 3. Placeholder `[ISI]` yang wajib diisi sebelum rilis

| Lokasi | Placeholder | Catatan |
|---|---|---|
| FAQ | `[ISI: kontak]` | Kanal kontak resmi |
| FAQ "Bagaimana RT/RW saya bergabung?" | `[ISI: alur pendaftaran komunitas dan kontak]` | Alur verifikasi komunitas |
| FAQ "Tersedia di ponsel apa?" | `[ISI: status]` | Status Play Store & iPhone |
| Footer → Kontak | `[ISI: email]`, `[ISI: kota]` | Ganti dengan kontak nyata |
| Footer → legal | `Kebijakan Privasi`, `Syarat Penggunaan` | Saat ini teks non-tautan; tautan wajib ada sebelum APK dipublikasikan |
| Footer → sosial | Instagram & email | Ikon ditampilkan non-aktif dengan label "belum diatur" |
| Metadata | Versi Android minimum | Belum ditampilkan karena belum diverifikasi; brief meminta `Android 8.0+ [ISI]` |

## 4. Penyimpangan kecil dari brief

1. **Ikon `cloud-check`** tidak tersedia di `lucide-react@0.469`. Diganti `CloudUpload` untuk simpul "Tersinkron". Label teks tetap sama; warna bukan satu-satunya pembeda.
2. **Font** dimuat lewat `<link>` Google Fonts (sudah ada di layout) alih-alih `next/font/google`, agar build tetap jalan tanpa akses jaringan saat kompilasi. Hasil visual identik.
3. **Navbar mobile** tidak memuat tautan "Masuk" terpisah karena ruang 390px; tautan masuk ada di sheet menu ("Masuk ke portal").
4. **Halaman `/`** memakai route group yang sudah ada, bukan proyek `landing/` terpisah seperti default brief §9.1. Dashboard dan landing berbagi satu deploy.
5. **Tombol unduh** memakai `public/download/pilahyuk-2.0.apk` (22 MB, SHA-256 `324a330c…70496d`). Berkas ini **ikut di-commit** agar APK tersedia di domain sendiri saat deploy (Vercel menyajikannya sebagai `application/vnd.android.package-archive`). `.gitignore` tetap mengabaikan APK baru; tambahkan dengan `git add -f` bila versi APK berubah.
6. **Warna CTA**: navbar "Unduh" dan hero sama-sama amber (brief §5.1 dan §5.2 meminta keduanya amber), meski aturan umum mengatakan satu amber per layar.
7. **Section gelap berdampingan**: banner CTA (gelap) diikuti footer (gelap) dipisahkan padding section terang, sesuai ritme brief.

## 5. Environment

Ditambahkan ke `.env.example` dan `.env.local`:

```bash
NEXT_PUBLIC_APK_URL="/download/pilahyuk-2.0.apk"
NEXT_PUBLIC_APK_VERSION="2.0"
NEXT_PUBLIC_APK_SIZE_MB="22"
NEXT_PUBLIC_APK_SHA256="324a330c2261d8e348165c481353040508eed606da8cdb7cdf237a0ada70496d"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_PLAY_STORE_URL=""
NEXT_PUBLIC_APP_STORE_URL=""
```

Catatan QR: pada dev, QR berisi `http://localhost:3000/download/...` sehingga hanya terbaca di mesin yang sama. Untuk mengujinya dari ponsel, set `NEXT_PUBLIC_SITE_URL` ke IP LAN (mis. `http://192.168.1.10:3000`) atau domain produksi.

Kelima variabel di atas sudah diset di Vercel untuk environment **Production** pada dua project yang terhubung ke repo ini (lihat §8).

## 6. Middleware

`src/proxy.ts` diubah agar:
- `/` dapat diakses tanpa login (sebelumnya selalu redirect ke `/login`).
- Berkas statis (`.png`, `.avif`, `.apk`, `.xml`, `.txt`, dsb.) dapat diakses tanpa login.

Halaman portal/admin tetap terlindungi seperti sebelumnya.

## 7. Yang belum dikerjakan

- S12 Cerita komunitas (menunggu ≥3 kutipan nyata + izin).
- Analitik Plausible/Umami dan event §5.16.
- Uji Lighthouse formal (LCP/CLS/JS budget) — belum dijalankan karena belum ada aset gambar final.
- Uji axe otomatis — belum dijalankan; navigasi keyboard sudah diimplementasikan manual.
- Halaman Kebijakan Privasi & Syarat Penggunaan (tautan masih non-aktif).
- OG image dibuat via `scripts/generate-og.mjs` (sharp + SVG), bukan Figma.

## 8. Deployment Vercel

Repo `xDzaky/pilahyuk-landingPage` terhubung ke **dua** project Vercel, dan keduanya ter-deploy setiap kali `main` di-push:

| Project | URL produksi | Env | Catatan |
|---|---|---|---|
| `pilahyuk` | https://pilahyuk-dashboard.vercel.app | Lengkap (DB, R2, Fonnte, Sentry, landing) | **Jadikan kanonik** — ini yang punya domain rapi |
| `pilahyuk-dashboard` | https://pilahyuk-dashboard-swart.vercel.app | Hanya variabel landing | Duplikat dari `.vercel/project.json` di repo |

Keduanya saat ini menyajikan landing yang sama dan APK berfungsi. Disarankan memutus salah satu integrasi Git di dashboard Vercel agar tidak ada build ganda; pertahankan `pilahyuk`.

Verifikasi produksi:
- `/` → 200, judul & OG benar
- `/download/pilahyuk-2.0.apk` → 200, `content-type: application/vnd.android.package-archive`, 22.605.712 byte
- `/login` → 200, `/dashboard` tanpa token → 307 ke `/login`
