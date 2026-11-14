# PilahYuk 2.0 — Dashboard (Portal Mitra + Super Admin)

Dashboard web + REST API untuk platform ekonomi sirkular PilahYuk 2.0. Satu proyek Next.js berisi portal mitra, console super admin, dan API yang dipakai aplikasi mobile.

**Production:** https://pilahyuk-dashboard.vercel.app

## Tech stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| UI | Tailwind CSS 4 (CSS-first `@theme`), komponen custom, Lucide |
| Chart | Recharts (`src/components/charts`) |
| Server state | TanStack Query |
| Database | PostgreSQL (Neon) + Prisma, terhubung ke runtime |
| Auth | Access token JWT 8 jam + refresh token 30 hari (`jose`), cookie httpOnly / Bearer, rate limit persisten |

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi DATABASE_URL, DIRECT_URL, JWT_SECRET, FONNTE_TOKEN
npm run db:push              # sinkronkan schema ke database
npm run db:seed              # isi data nyata (Probolinggo, Jakarta, Bandung)
npm run dev                  # http://localhost:3000
```

Akun demo:

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@pilahyuk.id` | `admin123` |
| Operator Bank Sampah | `operator@banksampah.id` | `operator123` |
| Pengurus Komunitas | `pengurus@komunitas.id` | `pengurus123` |
| Warga | `warga@pilahyuk.id` | `warga123` |
| Pengumpul | `collector@pilahyuk.id` | `collector123` |
| Mitra Pengolah | `recycler@pilahyuk.id` | `recycler123` |
| Kurator Budaya | `kurator@pilahyuk.id` | `kurator123` |

## Perintah

```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint (Next flat config)
npm run db:push    # prisma db push
npm run db:seed    # seed data awal
```

## Struktur

```
src/
├── app/
│   ├── (auth)/login
│   ├── (portal)/          # dashboard mitra: dashboard, komunitas, bank-sampah, batch, dampak, ...
│   ├── (admin)/admin/     # console super admin: overview, users, organisasi, verifikasi, audit, ...
│   └── api/v1/            # REST API untuk portal + mobile app
├── components/
│   ├── charts/            # TrendChart, CategoryBarChart, StatusDonutChart, ProgressBar
│   └── dashboard/         # KpiCard, AnswerBanner, DataTable, Timeline, BreakdownCard, ...
├── lib/                   # api client/hooks, auth rbac, mock data, utils
└── types/                 # DTO API
```

## Dokumentasi

- [`docs/PROJECT-FLOW.md`](docs/PROJECT-FLOW.md) — alur project end-to-end (onboarding, pengumpulan, bank sampah, batch, budaya, dampak) + status tiap langkah.
- [`docs/API-MOBILE.md`](docs/API-MOBILE.md) — **kontrak API terbaru** untuk mobile: auth + refresh, wilayah, semua endpoint nyata, contoh request/response, rate limit, RBAC.
- [`docs/API.md`](docs/API.md) — panduan lama; beberapa detail (mock, izin) sudah digantikan `API-MOBILE.md`.
- [`docs/ACCOUNTS.md`](docs/ACCOUNTS.md) — akun demo (dashboard & mobile) + alur registrasi mandiri.
- [`docs/MOBILE-APP-AUDIT.md`](docs/MOBILE-APP-AUDIT.md) — hasil reverse engineering APK Flutter: layar yang ada, endpoint yang dipanggil, dan gap integrasi.
- [`docs/IMPLEMENTASI-CHECKLIST.md`](docs/IMPLEMENTASI-CHECKLIST.md) — audit kesesuaian implementasi terhadap `PilahYuk_Dashboard_AI_Agent_Prompts.md` (Prompt 0–14) beserta prioritas perbaikan.

## Status data

- **API + database:** nyata. Route `/api/v1` membaca/menulis PostgreSQL melalui Prisma; auth, OTP, reset, refresh token, rate limit, idempotency sync, dan audit log persisten.
- **Data seed:** 3 wilayah (Probolinggo, Jakarta Selatan, Bandung), 9 organisasi, 8 material + harga per bank, transaksi/ledger, permintaan jemput, batch, sengketa, agenda.
- **Halaman web:** sebagian dashboard masih memakai `src/lib/mock-data.ts` untuk tampilan (API-nya sudah tersedia). Penyambungan halaman ke API adalah pekerjaan lanjutan.
- **Mobile:** APK lama masih menunjuk `https://pilahyuk2.onrender.com/api`; ganti base URL ke `https://pilahyuk-dashboard.vercel.app/api/v1` (lihat `docs/MOBILE-APP-AUDIT.md`).

## Deploy

Project Vercel terhubung ke branch `main`. Environment variables diatur di dashboard Vercel (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FONNTE_TOKEN`, `NEXT_PUBLIC_*`) — jangan pernah commit nilai secret ke repo. Build Vercel menjalankan `prisma generate` lewat `postinstall`.
