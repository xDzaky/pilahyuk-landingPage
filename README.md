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
| Database | PostgreSQL + Prisma (`prisma/schema.prisma`, belum terhubung ke runtime) |
| Auth | JWT 8 jam (`jose`), cookie `pilahyuk_token` / Bearer token |

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi DATABASE_URL, JWT_SECRET, dll.
npm run dev                  # http://localhost:3000
```

Akun demo:

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@pilahyuk.id` | `admin123` |
| Operator Bank Sampah | `operator@banksampah.id` | `operator123` |
| Pengurus Komunitas | `pengurus@komunitas.id` | `pengurus123` |

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
- [`docs/API.md`](docs/API.md) — panduan API untuk tim mobile: autentikasi, registrasi, semua endpoint, contoh request/response, aturan bisnis, alur offline sync.
- [`docs/ACCOUNTS.md`](docs/ACCOUNTS.md) — akun demo (dashboard & mobile) + alur registrasi mandiri.
- [`docs/MOBILE-APP-AUDIT.md`](docs/MOBILE-APP-AUDIT.md) — hasil reverse engineering APK Flutter: layar yang ada, endpoint yang dipanggil, dan gap integrasi.
- [`docs/IMPLEMENTASI-CHECKLIST.md`](docs/IMPLEMENTASI-CHECKLIST.md) — audit kesesuaian implementasi terhadap `PilahYuk_Dashboard_AI_Agent_Prompts.md` (Prompt 0–14) beserta prioritas perbaikan.

## Status data

Route API saat ini membaca `src/lib/mock-data.ts`; `POST` belum persisten. Skema Prisma sudah lengkap tetapi belum dipakai. Langkah migrasi ada di bagian akhir `docs/API.md`.

## Deploy

Project Vercel terhubung ke branch `main` (framework Next.js). Environment variables diatur di dashboard Vercel — jangan pernah commit nilai secret ke repo.
