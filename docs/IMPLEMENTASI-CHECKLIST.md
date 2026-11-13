# Checklist Implementasi — `PilahYuk_Dashboard_AI_Agent_Prompts.md`

> **Tanggal audit:** 14 November 2026
> **Commit acuan:** `ff19696` + perubahan lokal (header putih, KPI card konsisten)
> **Cara membaca:** ✅ = sudah sesuai · 🟡 = sebagian / jalan tapi belum lengkap · ❌ = belum ada

---

## Ringkasan per Prompt

| Prompt | Area | Status | Ringkas |
|---|---|---|---|
| 1 | Tech stack & arsitektur | 🟡 9/16 | Next.js + TS strict + Tailwind 4 jalan; Prisma/DB belum terhubung, Zod & service layer belum ada |
| 2 | Design system & anti-slop | 🟡 9/14 | Token, KpiCard, AnswerBanner, DataTable, Timeline ada; Skeleton, Toast, QR card belum |
| 3 | Database schema (Prisma) | 🟡 3/5 | 37 model + 16 enum + seed siap; belum ada migrasi & belum dipakai runtime |
| 4 | REST API `/api/v1` | 🟡 26 endpoint | Semua endpoint inti ada; ±60 endpoint PRD belum lengkap, OpenAPI belum |
| 5 | Auth, RBAC & routing | 🟡 4/7 | Login token + proteksi admin (page & API) jalan; refresh/role selector/audit login belum |
| 6 | Dashboard shell portal | ✅ 10/12 | Sidebar, header, search, sync indicator, notifikasi, responsive lengkap |
| 7 | Dashboard Pengurus Komunitas | ✅ 6/6 | AnswerBanner, agenda, join-request, tugas, dampak |
| 8 | Dashboard Operator Bank Sampah | 🟡 5/7 | KPI + form timbang + outbox + ledger + laporan; drawer konflik & export belum |
| 9 | Dashboard Traceability (Batch) | 🟡 4/5 | Tabel, drawer timeline, validasi; scan QR belum berfungsi |
| 10 | Dashboard Super Admin | 🟡 5/7 | Overview/verifikasi/sengketa/audit/users jalan; moderasi/template/verifikasi terpusat masih placeholder |
| 11 | User Dashboard (Dampak) | ✅ 5/6 | Personal impact + chart + riwayat; pengumuman/tantangan belum |
| 12 | Standar chart | ✅ 5/6 | 4 wrapper chart + aturan warna; data masih mock |
| 13 | UX states & pola | 🟡 5/10 | Empty state + offline + validasi ada; skeleton, toast, error-retry belum |
| 14 | QA / Definition of Done | 🟡 8/18 | Lihat tabel audit di bagian akhir |

**Skor keseluruhan: ±62% dari kontrak PRD.** Yang paling menahan: API–database belum tersambung dan sebagian endpoint PRD belum dibuat.

---

## Prompt 1 — Tech Stack & Arsitektur

| # | Requirement | Status | Bukti / Catatan |
|---|---|---|---|
| 1 | Next.js App Router + TypeScript strict | ✅ | Next 16.4.6 (di-upgrade dari 15 karena CVE-2025-66478), `tsconfig.json` `"strict": true` |
| 2 | Satu proyek: portal + REST API | ✅ | `src/app/(portal)`, `(admin)`, `api/v1` |
| 3 | Tailwind CSS 4 + shadcn/ui | 🟡 | Tailwind 4 CSS-first (`globals.css`); **tidak ada folder `components/ui`** — komponen dibuat custom, Radix terpasang tapi belum dipakai sebagai primitive |
| 4 | Recharts + Lucide | ✅ | `src/components/charts/*`, ikon Lucide di seluruh UI |
| 5 | PostgreSQL + PostGIS | ❌ | Schema menyimpan geometry sebagai `Json` (bukan PostGIS), DB belum tersambung |
| 6 | Prisma + migrasi terversi | 🟡 | `prisma/schema.prisma` 37 model, 16 enum, 13 kolom `Decimal`; belum ada `prisma/migrations` |
| 7 | Auth token bearer (+refresh) | 🟡 | Login JWT 8 jam; `POST /auth/refresh` belum ada |
| 8 | TanStack Query | ✅ | `QueryProvider` + `src/lib/api/hooks.ts` (17 query/mutation) |
| 9 | Zod di client & server | ❌ | Package terpasang, tidak dipakai; validasi masih manual di route |
| 10 | S3-compatible storage | 🟡 | Env R2 + dependency tersedia, belum ada endpoint upload |
| 11 | Redis (queue/cache/rate limit) | 🟡 | Dependency + env, belum dipakai |
| 12 | Sentry + structured logging | ❌ | Hanya env; belum diinisialisasi |
| 13 | Struktur folder sesuai spesifikasi | ✅ | `app/(auth|portal|admin)`, `components/{charts,dashboard,providers}`, `lib/{api,auth}`, `prisma`, `types` |
| 14 | Route handler tipis → service layer | ❌ | `src/server/services/` kosong; logika + mock ada di route |
| 15 | Pagination wajib semua list | ✅ | `?page&per_page` (maks 100) di semua endpoint list |
| 16 | docker-compose + .env.example | ✅ | `docker-compose.yml` (postgres/redis/minio), `.env.example` |

---

## Prompt 2 — Design System & Kontrak Anti-Slop

| # | Requirement | Status | Bukti |
|---|---|---|---|
| 1 | Token warna/radius/font dari DESIGN.md | ✅ | `@theme` di `globals.css` (brand-900/700/500, canvas, ink, muted, border, warning/danger/info/accent, radius 16/12/pill) |
| 2 | KpiCard anatomi lengkap | ✅ | `components/dashboard/KpiCard.tsx` — label, nilai, unit, tren, ikon, footer sumber + waktu. **Baru diseragamkan** (label 2 baris, nilai 3xl, slot tren/status/footer tetap) |
| 3 | AnswerBanner | ✅ | `components/dashboard/AnswerBanner.tsx`, dipakai semua dashboard |
| 4 | DataTable (sort, paginasi, filter, bulk, badge, empty) | 🟡 | Sorting + page size + search + empty state ✅; filter tanggal/kategori per kolom & bulk action baru di beberapa halaman |
| 5 | Timeline | ✅ | `components/dashboard/Timeline.tsx` (batch & pickup) |
| 6 | Skeleton loading | ❌ | Hanya util CSS `.skeleton` di `globals.css`; tidak ada komponen, tidak dipakai halaman |
| 7 | Empty state bermakna + CTA | ✅ | `EmptyState.tsx` + CTA per halaman |
| 8 | Offline / Sync indicator | ✅ | `SyncIndicator.tsx`, `OfflineBanner` di dashboard operator |
| 9 | Toast | ❌ | Dependency Radix Toast ada, komponen belum dibuat |
| 10 | Modal konfirmasi aksi destruktif | 🟡 | `@radix-ui/react-alert-dialog` terpasang, belum dipakai |
| 11 | QR card & receipt transaksi | ❌ | Belum dibuat |
| 12 | Hierarki 1 kartu penekanan / halaman | ✅ | `emphasis` hanya di KPI yang butuh aksi |
| 13 | Tanpa gradient/glow, border 1px | ✅ | Hanya 1 `shadow-xl`/gradient sisa di `batch/page.tsx` & layout (dropdown) |
| 14 | Status = teks + ikon + warna | ✅ | `StatusBadge.tsx` + label teks di semua tabel |

---

## Prompt 3 — Database Schema

| # | Requirement | Status | Bukti |
|---|---|---|---|
| 1 | Semua entitas wajib (users s.d. media_assets) | ✅ | 37 model di `prisma/schema.prisma` |
| 2 | Decimal untuk uang & berat, UUID PK | ✅ | 13 field `Decimal`, `@id @default(uuid())` |
| 3 | Enum status + kolom `status_changed_at` | 🟡 | 16 enum ada; `status_changed_at` belum konsisten di semua model |
| 4 | Migrasi awal + seed | 🟡 | `prisma/seed.ts` (26 operasi) ada; migrasi belum dibuat; seed belum dijalankan karena DB belum ada |
| 5 | Index pada kolom filter | 🟡 | Sebagian `@@index` ada, belum menyeluruh |

---

## Prompt 4 — REST API `/api/v1`

**Sudah ada (26 method, 19 route handler):**

| Grup | Endpoint |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout` |
| Me | `GET /me`, `PATCH /me` |
| Communities | `GET /communities` |
| Materials | `GET /materials` |
| Collections | `GET/POST /collection-requests` |
| Waste Bank | `GET/POST /waste-bank/transactions`, `GET /members/{id}/ledger`, `GET /members/{id}/balance`, `GET/POST /transactions/{id}/adjustments`, `GET /reports/{period}` |
| Batches | `GET/POST /batches`, `GET/POST /batches/{id}/events` |
| Sync | `POST /sync/batch` (idempoten per key) |
| Disputes | `GET/POST /disputes` |
| Admin | `GET /admin/organizations`, `POST /admin/organizations/{id}/verify`, `GET /admin/audit-logs`, `GET /admin/system/health` |

**Belum ada (dari kontrak PRD):**

| Grup | Endpoint yang belum |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/refresh`, `GET /me/roles` |
| Communities | `POST /communities/{id}/join-requests`, `GET /organizations/{id}/members`, `PATCH /organizations/{id}/members/{userId}` |
| Events & Tasks | Semua (`/organizations/{id}/events`, registrations, check-in, `/organizations/{id}/tasks`, `PATCH /tasks/{id}`) |
| Materials | `GET /materials/{id}/rules`, `GET/PUT /organizations/{id}/materials/prices` |
| Collections | `GET /collection-requests/{id}`, `PATCH /{id}/status`, `POST /{id}/assign`, `POST /{id}/confirm`, `POST /{id}/cancel` |
| Traceability | `GET /batches/{id}`, `GET /batches/{id}/qr` |
| Cultural | Semua (`/cultural-contents` CRUD + review + withdraw) |
| Impact | `GET /organizations/{id}/impact` (folder ada, `route.ts` tidak) |
| Disputes | `PATCH /disputes/{id}` |
| Notifikasi | Semua |
| Admin | `/admin/users`, `/admin/roles`, moderasi konten, konfigurasi |
| Sync | `GET /sync/status` |
| Docs | OpenAPI + Swagger UI `/api/docs` |

| Aturan | Status |
|---|---|
| Envelope `{ data, meta, error }` | ✅ |
| Pagination `{page, per_page, total, total_pages}` | ✅ |
| `Idempotency-Key` di transaksi & sync | ✅ (disimpan di `Map` memori, belum Redis) |
| Error code konsisten + HTTP status | ✅ |
| Validasi Zod server | ❌ |
| Rate limit login/upload | ❌ |
| Guard organisasi per role | 🟡 (baru admin vs non-admin) |
| Audit log dalam transaksi yang sama | ❌ |

---

## Prompt 5 — Auth, RBAC & Routing

| # | Requirement | Status | Bukti |
|---|---|---|---|
| 1 | Login + sesi token | ✅ | `POST /auth/login`, cookie `pilahyuk_token` + Bearer |
| 2 | Route group + middleware blokir role | ✅ | `src/proxy.ts` (Next 16 menggantikan `middleware.ts`); admin page → redirect `/dashboard`, admin API → 403 |
| 3 | Role selector di header | 🟡 | Ada organization switcher di sidebar, belum selector role multi-role di header |
| 4 | Sidebar dinamis per role | 🟡 | Menu admin/portal terpisah; filter per item role belum granular |
| 5 | Halaman akses ditolak informatif | ❌ | Masih redirect tanpa halaman penjelasan |
| 6 | Audit login gagal/berhasil | ❌ | Belum ada penulisan audit pada login |
| 7 | Demo 3 akun seed | ✅ | `admin@`, `operator@`, `pengurus@` (password di dokumen API) |

---

## Prompt 6 — Dashboard Shell

| # | Requirement | Status |
|---|---|---|
| 1 | Sidebar dark + motif + grup menu lengkap | ✅ (UTAMA/KOMUNITAS/OPERASIONAL/LAPORAN/LAINNYA) |
| 2 | Sidebar collapsible + org switcher | ✅ |
| 3 | Item aktif teal-100 + border kiri | ✅ |
| 4 | Top header: search global | ✅ (suggestions per tipe) |
| 5 | SyncIndicator di header | ✅ |
| 6 | Notifikasi badge + panel | ✅ |
| 7 | Avatar + dropdown profil | ✅ |
| 8 | Breadcrumb | ❌ |
| 9 | Search debounce 300ms + navigasi keyboard | 🟡 | Ada delay pencarian; belum ada navigasi panah/Enter antar hasil |
| 10 | Responsive (drawer < lg, KPI 2 kolom, tabel scroll) | ✅ |
| 11 | Skip-link + focus ring + aria-label | ✅ | `skip-link`, `aria-label` pada tombol ikon |
| 12 | Header putih konsisten admin & portal | ✅ | **Baru diseragamkan** (`(admin)/layout.tsx`) |

---

## Prompt 7 — Dashboard Pengurus Komunitas

| # | Requirement | Status |
|---|---|---|
| 1 | AnswerBanner dengan angka permintaan & tugas | ✅ |
| 2 | 4 KPI metrik sunyi + 1 penekanan | ✅ |
| 3 | Agenda mendatang + progress kuota | ✅ |
| 4 | Antrean join-request + Setujui/Tolak | ✅ |
| 5 | Tabel tugas relawan + status | ✅ |
| 6 | Ringkasan dampak + label Terverifikasi/Perkiraan | ✅ |

Catatan: aksi Setujui/Tolak belum memanggil API (masih state lokal + mock).

---

## Prompt 8 — Dashboard Operator Bank Sampah

| # | Requirement | Status |
|---|---|---|
| 1 | AnswerBanner + sync indicator menonjol | ✅ |
| 2 | Metrik: berat bersih, transaksi, saldo, antrean sinkron | ✅ (4 kartu, sekarang seragam) |
| 3 | Form penimbangan cepat (anggota → material → bruto/tara → net → nilai) | ✅ |
| 4 | Riwayat transaksi + badge sync | ✅ |
| 5 | Outbox drawer dengan status pending/syncing/failed/conflict | 🟡 | Panel outbox ada; diff konflik + tombol "Kirim sebagai penyesuaian" belum |
| 6 | Ledger & koreksi (selalu merujuk transaksi asal) | ✅ |
| 7 | Laporan harian/bulanan + export CSV/PDF | 🟡 | Halaman laporan + tombol ekspor; file belum benar-benar dihasilkan |

---

## Prompt 9 — Traceability / Waste Passport

| # | Requirement | Status |
|---|---|---|
| 1 | Metrik batch | ✅ |
| 2 | Pencari batch + scan QR | 🟡 | Input kode ✅; tombol QR belum memanggil kamera |
| 3 | Drawer detail + timeline + data rumah tangga disamarkan | ✅ |
| 4 | Tabel validasi batch + modal terima/tolak + bukti | ✅ (modal UI, belum persist) |
| 5 | Status "menunggu bukti" eksplisit sebelum klaim didaur ulang | ✅ |

---

## Prompt 10 — Dashboard Super Admin

| # | Requirement | Status |
|---|---|---|
| 1 | Metrik (organisasi per tipe, user aktif, sengketa, kesehatan) | ✅ |
| 2 | Antrean verifikasi + aksi Verifikasi/Tolak + bulk approve | 🟡 | Tombol ada; bulk approve belum punya handler; alasan tolak belum wajib |
| 3 | Pusat sengketa (filter kategori/status, assign, resolve) | 🟡 | Daftar + detail; aksi assign/resolve belum persist |
| 4 | Moderasi konten budaya | ❌ | `admin/moderasi` masih placeholder |
| 5 | Audit trail (diff before→after, IP, perangkat, filter) | ✅ |
| 6 | Manajemen user & organisasi | 🟡 | Daftar + aksi UI; suspend/ubah role belum persist |
| 7 | Taxonomi material | ✅ | `admin/material` |
| 8 | Halaman Roles/Verification/Templates | 🟡 | `users`, `organisasi`, `audit` jalan; `verifikasi`, `moderasi`, `template` placeholder |
| 9 | Sidebar admin grup lengkap | ✅ |
| 10 | Setiap aksi admin menulis audit | ❌ |

---

## Prompt 11 — User Dashboard (Dampak)

| # | Requirement | Status |
|---|---|---|
| 1 | AnswerBanner kontribusi bulan ini | ✅ |
| 2 | Kartu kontribusi pribadi | ✅ |
| 3 | Tren personal 90 hari + perbandingan komunitas | ✅ |
| 4 | Status pickup berjalan (timeline) | ✅ |
| 5 | Riwayat transaksi milik sendiri (read-only) | ✅ |
| 6 | Pengumuman & tantangan komunitas | ❌ |

---

## Prompt 12 — Standar Chart

| # | Requirement | Status |
|---|---|---|
| 1 | Area/Line untuk tren + toggle 7H/30H/90H | ✅ `TrendChart` |
| 2 | BarChart kategori | ✅ `CategoryBarChart` |
| 3 | Donut ≤5 slice + legend teks | ✅ `StatusDonutChart` |
| 4 | ProgressBar 8px, warna token, warning >80% | ✅ `ProgressBar` |
| 5 | Judul berupa pertanyaan + sumber + periode | ✅ |
| 6 | Data perkiraan bergaris putus-putus + badge | 🟡 Sebagian chart |

---

## Prompt 13 — UX States

| # | Requirement | Status |
|---|---|---|
| 1 | Skeleton loading per blok | ❌ |
| 2 | Empty state bermakna + CTA | ✅ |
| 3 | Error state + retry + waktu data terakhir | ❌ |
| 4 | Nol yang jujur (bedakan kosong vs gagal) | 🟡 |
| 5 | Offline banner + badge pending sync | ✅ |
| 6 | Validasi inline + cegah submit ganda | 🟡 |
| 7 | Modal konfirmasi aksi destruktif | 🟡 |
| 8 | Konfirmasi kedua pihak | 🟡 (UI saja) |
| 9 | Motion 150–250ms + `prefers-reduced-motion` | ✅ |
| 10 | A11y: teks+ikon+warna, kontras, keyboard | 🟡 |

---

## Prompt 14 — QA / Definition of Done

### Design

| Item | Hasil | Bukti |
|---|---|---|
| AnswerBanner di setiap halaman | ✅ | 8 dashboard utama |
| Tanpa gradient/glow/shadow | ✅ | Sisa 1 shadow di dropdown & batch hero |
| 1 kartu penekanan per halaman | ✅ | `emphasis` pada KPI prioritas |
| Warna & tipografi dari token | ✅ | `@theme` |
| Status = teks+ikon+warna | ✅ | `StatusBadge` |

### Data & API

| Item | Hasil | Bukti |
|---|---|---|
| Saldo dari ledger | ✅ | `balance` menghitung `Σ credit − Σ debit` |
| Harga snapshot | ✅ | `POST /waste-bank/transactions` memakai `material.current_price` saat itu |
| Koreksi = adjustment, asal tidak dihapus | ✅ | `POST /adjustments` + `note` eksplisit |
| `/sync/batch` idempoten | ✅ | `processedKeys` Map, uji 2× key sama |
| Metrik impact punya `verified` | 🟡 | Label Terverifikasi/Perkiraan ada di UI, endpoint impact belum |
| RBAC 403 + audit | 🟡 | 403 ✅ (baru diperbaiki untuk admin API); audit aksi belum |

### UX

| Item | Hasil |
|---|---|
| Skeleton di semua fetch | ❌ |
| Empty + error state | 🟡 (empty ✅, error ❌) |
| Simulasi offline draft → outbox → sync | 🟡 |
| Modal konfirmasi + undo | 🟡 |

### Teknis

| Item | Hasil |
|---|---|
| Lint & TS strict tanpa `any` | ✅ `tsc --noEmit` lolos; `npm run lint` **0 error** (43 warning sisa unused-import) setelah eslint config Vite diganti config Next 16 |
| Pagination/filter/sorting semua tabel | 🟡 |
| Rate limit login/upload + refresh token | ❌ |

---

## Prioritas Perbaikan Berikutnya

**P0 — memblokir integrasi mobile**
1. Sambungkan Prisma ke PostgreSQL (Neon) + jalankan migrasi & seed.
2. Ganti semua route mock → query Prisma lewat `src/server/services/*`.
3. `POST /auth/refresh`, `GET /me/roles`, `POST /auth/register`.
4. Zod schema untuk semua body request.
5. Idempotency key → tabel `sync_idempotency_keys` (bukan `Map`).

**P1 — melengkapi PRD**
6. `GET /organizations/{id}/impact` + flag `verified`.
7. `PATCH /collection-requests/{id}/status` (transition map) + assign/confirm/cancel.
8. `GET /batches/{id}` + QR token, `PATCH /disputes/{id}`.
9. Events, tasks, join-requests, cultural contents.
10. Skeleton + Toast + error state dengan retry.
11. Halaman placeholder: `admin/verifikasi`, `admin/moderasi`, `admin/template`, portal `material`, `pengumpulan`.

**P2 — produksi**
12. Rate limiting (Redis/Upstash), Sentry, structured logging.
13. OpenAPI + Swagger UI di `/api/docs`.
14. Audit log otomatis untuk semua aksi tulis.
15. Role selector multi-role + halaman akses ditolak.
