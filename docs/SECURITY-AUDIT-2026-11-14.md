# Security & Implementation Audit — PilahYuk 2.0 (Web + API)

**Tanggal:** 14 November 2026
**Scope:** repo `pilahyuk-dashboard` (Next.js web + Route Handlers), lokal `http://localhost:3000` dan produksi Vercel.
**Bukan scope:** aplikasi mobile Flutter, infrastruktur Vercel itu sendiri, uji beban, uji penetrasi pihak ketiga.
**Data:** audit awal dilakukan saat endpoint masih mock. Perbaikan sore hari memakai PostgreSQL Neon + Prisma dan data seed nyata (Probolinggo, Jakarta, Bandung).

---

## 0. Status setelah perbaikan (14 Nov 2026, sore)

Database nyata (PostgreSQL Neon) sudah dipakai; mock API diganti Prisma. Status temuan:

| Temuan | Status |
|---|---|
| C1 JWT secret fallback di deployment duplikat | ✅ Diperbaiki (secret acak + redeploy) |
| C2 Reset token/dev token bocor | ✅ Di produksi tidak lagi dikembalikan; token dikirim via WhatsApp. `dev_*` hanya saat `AUTH_DEV_MODE=true` (lokal) |
| C3 Endpoint tulis tanpa otorisasi | ✅ Diperbaiki: role + org + ownership per endpoint; `requester_id`/`reporter_id` dari token |
| H1 Tanpa rate limit | ✅ Rate limit login/OTP/register/reset persisten di DB (429 + Retry-After) |
| H2 Data lintas anggota terbaca | ✅ Query di-scope per role/organisasi/pemilik |
| H3 RBAC halaman | ✅ Proxy memblokir halaman per role + halaman `/akses-ditolak` |
| H4 Token di localStorage | ✅ Token tidak lagi disimpan; cookie httpOnly + refresh token; CSP dipasang |
| H5 Header keamanan | ✅ CSP, XCTO, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| M1 Ganti password tanpa password lama | ✅ Wajib `current_password` |
| M2 JSON rusak → 500 | ✅ Sekarang 400 |
| M3 Token tanpa refresh/revocation | ✅ Refresh token 30 hari, rotasi, revocation, cek status user tiap request |
| M4 bcrypt cost 8 | ✅ cost 12 |
| M5 Store in-memory | ✅ PostgreSQL + Prisma; OTP/reset/rate limit/idempotency di DB |
| M6 Audit log tidak ditulis | ✅ Audit nyata untuk login, register, transaksi, koreksi, batch, verifikasi, profil, sengketa |
| M7 Enumerasi akun | 🟡 Masih ada 409 pada register dan perbedaan respons dev; produksi tidak membocorkan token |
| M8 CSRF token | 🟡 Masih mengandalkan SameSite=Lax + JSON |

Masih terbuka: beberapa halaman dashboard web masih memakai data contoh; endpoint events/tasks/cultural/notifications belum dibuat; tidak ada email gateway; CSP masih mengizinkan `unsafe-inline`; belum ada test otomatis/OpenAPI; migrasi masih `prisma db push` (belum `migrate`).

---

## 1. Ringkasan eksekutif

| Tingkat | Jumlah | Status |
|---|---:|---|
| Kritis | 3 | 1 sudah diperbaiki, 2 terbuka |
| Tinggi | 5 | Terbuka |
| Sedang | 7 | Terbuka |
| Rendah / info | 4 | Terbuka |

Temuan terpenting:

1. **JWT secret fallback** sempat membuat deployment duplikat menerima token `super_admin` palsu. **Sudah diperbaiki** dengan memasang `JWT_SECRET` acak di project Vercel duplikat dan redeploy; token palsu sekarang `401`.
2. **Reset password membocorkan `dev_reset_token`** ke siapa pun yang tahu email/nomor HP. Akun mana pun bisa diambil alih. Ini kritis untuk produksi.
3. **Endpoint tulis tidak memeriksa role/ownership.** Warga bisa mencatat penimbangan untuk anggota lain, memvalidasi batch, membuat batch untuk organisasi mana pun, dan memalsukan `requester_id`/`reporter_id`.
4. **Tidak ada rate limit** di login/OTP/reset/register.
5. **RBAC halaman tidak ada** selain `/admin`: warga bisa membuka `/bank-sampah`, `/komunitas`, `/pengaturan`.

---

## 2. Akun demo & login per role

Semua akun dari `docs/ACCOUNTS.md` diuji di lokal dan di dua domain produksi.

| Peran | Email | Login | Role di token | Halaman awal | Halaman awal status |
|---|---|---|---|---|---|
| Super Admin | `admin@pilahyuk.id` | 200 | `super_admin` | `/admin/overview` | 200 |
| Operator Bank Sampah | `operator@banksampah.id` | 200 | `operator_bank_sampah` | `/dashboard` | 200 |
| Pengurus Komunitas | `pengurus@komunitas.id` | 200 | `pengurus_komunitas` | `/dashboard` | 200 |
| Warga | `warga@pilahyuk.id` | 200 | `resident` | `/dampak` | 200 |

Login lewat email **dan** nomor HP sama-sama berfungsi. Cookie sesi: `HttpOnly; Secure; SameSite=Lax; Max-Age=28800`.

**Catatan "aman":**

- Password disimpan sebagai bcrypt hash (cost 8 — rendah, sebaiknya 10–12).
- Password demo lemah dan **dipublikasikan** di repo; siapa pun bisa login sebagai Super Admin di produksi. Untuk demo/pilot masih bisa diterima, **tidak boleh** untuk data nyata.
- Login page juga menulis token yang sama ke `localStorage` (`pilahyuk_token`). Token itu tidak dipakai API client (client mengandalkan cookie), jadi ini murni risiko XSS — hapus.
- Tidak ada lockout/rate limit; 12 percobaan password salah semuanya `401`, tidak ada `429`.

---

## 3. Matriks endpoint

24 route handler, ±31 method. Status di bawah adalah hasil uji nyata sebagai role tersebut.

### 3.1 Auth & profil

| Endpoint | Tanpa token | Warga | Operator | Pengurus | Super Admin | Catatan |
|---|---|---|---|---|---|---|
| `POST /auth/login` | 200/401 | — | — | — | — | Tidak ada rate limit |
| `POST /auth/register` | 201 | — | — | — | — | Role `super_admin` di body diturunkan ke `resident` ✅ |
| `POST /auth/logout` | 401 | 200 | 200 | 200 | 200 | Hanya hapus cookie; token tetap valid |
| `POST /auth/otp/request` | 200 | — | — | — | — | `dev_code` dikembalikan |
| `POST /auth/otp/verify` | 200 | — | — | — | — | Bisa verifikasi nomor orang lain |
| `POST /auth/forgot-password` | 200 | — | — | — | — | `dev_reset_token` dikembalikan |
| `POST /auth/reset-password` | 200 | — | — | — | — | Token 15 menit, sekali pakai |
| `POST /auth/refresh` | 404 | 404 | 404 | 404 | 404 | **Belum ada** |
| `GET/PATCH /me` | 401 | 200 | 200 | 200 | 200 | PATCH password tanpa password lama |
| `GET /me/roles` | 404 | 404 | 404 | 404 | 404 | **Belum ada** |

### 3.2 Resource

| Endpoint | Warga | Operator | Pengurus | Admin | Penilaian |
|---|---|---|---|---|---|
| `GET /communities` | 200 | 200 | 200 | 200 | Terbuka untuk semua user login; seharusnya publik/guest |
| `GET /materials` | 200 | 200 | 200 | 200 | Wajar untuk katalog |
| `GET /collection-requests` | **200** | 200 | 200 | 200 | Warga melihat semua permintaan + nama + area |
| `POST /collection-requests` | **201** | 201 | 201 | 201 | `requester_id` dari body bisa dipalsukan |
| `GET /collection-requests/{id}` | 404 | 404 | 404 | 404 | Belum ada |
| `PATCH /collection-requests/{id}/status` | 404 | 404 | 404 | 404 | Belum ada |
| `GET /batches` | **200** | 200 | 200 | 200 | Semua batch terbaca |
| `POST /batches` | **201** | 201 | 201 | 201 | Bisa membuat batch untuk org mana pun |
| `GET /batches/{id}/events` | **200** | 200 | 200 | 200 | Timeline terbuka |
| `POST /batches/{id}/events` | **201** | 201 | 201 | 201 | Warga bisa kirim `batch_validated`/`batch_completed` |
| `GET /batches/{id}` | 404 | 404 | 404 | 404 | Belum ada |
| `GET /batches/{id}/qr` | 404 | 404 | 404 | 404 | Belum ada |
| `GET /disputes` | **200** | 200 | 200 | 200 | Nama + alasan sengketa semua user |
| `POST /disputes` | **201** | 201 | 201 | 201 | `reporter_id` bisa dipalsukan |
| `PATCH /disputes/{id}` | 404 | 404 | 404 | 404 | Belum ada |
| `GET /waste-bank/transactions` | **200** | 200 | 200 | 200 | Semua transaksi + nama anggota |
| `GET .../transactions?member_id=...` | **200** | 200 | 200 | 200 | Filter anggota lain tetap 200 |
| `POST /waste-bank/transactions` | **201** | 201 | 201 | 201 | Warga bisa menimbang untuk anggota lain |
| `GET .../members/{id}/ledger` | 403 | 200 | 403 | 200 | Benar: self/operator/admin |
| `GET .../members/{id}/balance` | 403 | 200 | 403 | 200 | Benar |
| `GET .../reports/{period}` | 403 | 200 | 403 | 200 | Benar |
| `POST .../transactions/{id}/adjustments` | 403 | 201 | 403 | 201 | Benar |
| `POST /sync/batch` | **200** | 200 | 200 | 200 | Warga bisa sync transaksi anggota lain |
| `GET /admin/organizations` | 403 | 403 | 403 | 200 | Benar |
| `POST /admin/organizations/{id}/verify` | 403 | 403 | 403 | 200 | Benar |
| `GET /admin/audit-logs` | 403 | 403 | 403 | 200 | Benar via middleware; route sendiri tanpa cek role |
| `GET /admin/system/health` | 403 | 403 | 403 | 200 | Benar |
| `GET /organizations/{id}/members` | 404 | 404 | 404 | 404 | Belum ada |
| `GET /organizations/{id}/impact` | 404 | 404 | 404 | 404 | Belum ada |
| `GET /cultural-contents` | 404 | 404 | 404 | 404 | Belum ada |
| `GET /api/docs` | 404 | 404 | 404 | 404 | OpenAPI/Swagger belum ada |

**Yang sudah benar:** semua request tanpa token → `401` (API) / `307` (halaman); token invalid/forge → `401`; endpoint admin → `403` untuk non-admin; ledger/balance/report → `403` untuk non-pemilik; adjustment → `403` untuk non-operator.

---

## 4. Temuan keamanan

### Kritis

**C1 — JWT secret fallback di deployment duplikat (SUDAH DIPERBAIKI)**
- `src/server/auth/token.ts` dan `src/proxy.ts` memakai `process.env.JWT_SECRET || "pilahyuk-secret-dev-only"`.
- Project Vercel `pilahyuk` punya `JWT_SECRET`; project duplikat `pilahyuk-dashboard` **tidak punya** env apa pun selain variabel landing.
- Token HS256 buatan sendiri dengan secret fallback diterima `200` oleh `GET /api/v1/admin/organizations` di `https://pilahyuk-dashboard-swart.vercel.app` → siapa pun bisa menjadi `super_admin`.
- **Perbaikan:** `JWT_SECRET` acak 32 byte dipasang di project `pilahyuk-dashboard` (Production) + redeploy. Hasil uji ulang: `401` di kedua domain. Login demo tetap `200`.
- **Sisa rekomendasi:** hapus fallback di kode (gagal saat start jika `JWT_SECRET` kosong saat production), dan putuskan salah satu project duplikat.

**C2 — Reset password membocorkan token (terbuka)**
- `POST /auth/forgot-password` mengembalikan `dev_reset_token` untuk identifier yang terdaftar.
- Siapa pun yang tahu email/nomor HP (termasuk akun demo) bisa memanggil endpoint itu, mengambil token, memanggil `reset-password`, lalu login dengan password baru.
- Dibuktikan pada akun uji baru: forgot → token → reset → login dengan password penyerang = `200`.
- Dampak: **account takeover** semua akun, termasuk Super Admin, tanpa akses ke email/WhatsApp.
- Perbaikan: kembalikan `dev_reset_token` hanya jika `ALLOW_DEV_AUTH=true` dan `NODE_ENV !== "production"`; produksi harus lewat email/WhatsApp; jangan pernah bocorkan token di response.

**C3 — Endpoint tulis tanpa otorisasi (terbuka)**
- Warga (`resident`) mendapat `201` untuk:
  - `POST /waste-bank/transactions` dengan `member_id` anggota lain (nilai finansial),
  - `POST /batches` untuk `origin_org_id` sembarang,
  - `POST /batches/{id}/events` dengan `batch_validated` / `batch_completed`,
  - `POST /collection-requests` dengan `requester_id` orang lain,
  - `POST /disputes` dengan `reporter_id` orang lain,
  - `POST /sync/batch` untuk `member_id` lain.
- Dampak nyata saat DB tersambung: manipulasi saldo, status batch, dan jejak audit.
- Perbaikan: policy per endpoint (role + org + ownership), validasi `requester_id`/`reporter_id` dari token (bukan body), tolak `batch_validated` kecuali operator/admin/recycler berwenang, dan tulis audit log.

### Tinggi

**H1 — Tidak ada rate limit.** 12 login gagal berturut-turut semuanya `401`; tidak ada `429`. Endpoint OTP/reset/register juga terbuka. Perbaikan: Redis/Upstash rate limit per IP + identifier, lockout sementara, CAPTCHA bila perlu.

**H2 — Read data melebar & tanpa scope organisasi.** Warga bisa membaca semua collection request (nama + area), semua transaksi timbang (nama anggota + nilai), semua batch, dan semua sengketa. Produk mensyaratkan warga hanya melihat datanya sendiri. Perbaikan: filter `member_id`/`requester_id` dari token untuk role resident; operator dibatasi `org_id`.

**H3 — RBAC halaman tidak ada selain `/admin`.** Warga membuka `/bank-sampah` = `200`, `/komunitas` = `200`, `/pengaturan` = `200`. Sidebar portal juga menampilkan semua menu ke semua role. Perbaikan: guard per route group/role, filter menu, halaman 403 informatif.

**H4 — Token di localStorage + tidak ada CSP.** Login menulis `pilahyuk_token` ke `localStorage` meski cookie `httpOnly` sudah dipakai. Dengan tidak adanya CSP, satu XSS dapat mencuri token. Perbaikan: hapus penulisan localStorage, tambah CSP (nonce/hash), audit dependency.

**H5 — Header keamanan tidak lengkap.** Produksi hanya punya `Strict-Transport-Security` (dari Vercel). Tidak ada `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`. Perbaikan: set di `next.config.ts` (`headers()`).

### Sedang

**M1 — `PATCH /me` mengubah password/nomor HP tanpa password lama/OTP.** Perbaikan: wajibkan password lama untuk ganti password, OTP untuk ganti nomor.

**M2 — JSON rusak → 500.** `POST /auth/login` dengan body `{bad` mengembalikan `500 INTERNAL_ERROR`; seharusnya `400 VALIDATION_ERROR`.

**M3 — Token 8 jam tanpa refresh/revocation, status user tidak dicek ulang.** User `suspended` tetap bisa memakai token sampai exp; token tetap valid setelah user dihapus dari store in-memory. Perbaikan: cek user/status di guard, refresh token, revocation list.

**M4 — bcrypt cost 8.** Terlalu rendah untuk produksi; naikkan ke 10–12.

**M5 — Store in-memory.** User, OTP, reset token, idempotency key hilang saat cold start/redeploy; multi-instance tidak konsisten. Ini juga membuat akun hasil registrasi hilang. Perbaikan: Prisma/Redis.

**M6 — Audit log tidak ditulis.** `MOCK_AUDIT_LOGS` hanya data contoh; login, transaksi, verifikasi, koreksi tidak menulis audit. `GET /admin/audit-logs` juga tidak punya cek role lokal (mengandalkan proxy). Produk mewajibkan audit append-only.

**M7 — Enumerasi akun.** `forgot-password` mengembalikan `dev_reset_token` hanya bila akun ada, dan `register` mengembalikan `409` untuk identifier terdaftar. Perbaikan: respons seragam, jangan bocorkan keberadaan akun.

**M8 — Tidak ada CSRF token.** Dimitosigasi `SameSite=Lax` dan JSON `Content-Type`, tapi belum eksplisit. Pertimbangkan double-submit token untuk aksi tulis.

### Rendah / info

- Regex `PUBLIC_FILE` mengizinkan semua path berakhiran `.json/.txt/.xml/.apk/...` tanpa login. Saat ini aman karena tidak ada API berekstensi, tetapi sebaiknya dibatasi ke prefix `/img`, `/screens`, `/download`, `/og.png`, `/sitemap.xml`, `/robots.txt`.
- `/api/v1/auth/refresh` dan beberapa folder route kosong (folder ada, `route.ts` tidak) — mudah menimbulkan salah paham.
- `POST /auth/logout` tidak mem-blacklist token.
- Tidak ada security.txt/contact keamanan.

---

## 5. Implementasi vs `PilahYuk_Dashboard_AI_Agent_Prompts.md`

Skor checklist internal: **±62%** (tidak berubah sejak commit `ff19696`). Hasil verifikasi ulang:

| Prompt | Status | Bukti singkat |
|---|---|---|
| 1 Tech stack | 🟡 9/16 | Next 16 + TS strict + Tailwind 4 + Recharts + TanStack Query + docker-compose ✅; Prisma belum runtime, tidak ada service layer, Zod, Redis, S3 upload, Sentry |
| 2 Design system | 🟡 9/14 | Token, KpiCard, AnswerBanner, DataTable, Timeline, EmptyState, SyncIndicator ✅; skeleton, toast, QR/receipt belum; beberapa shadow sisa |
| 3 Schema | 🟡 | 37 model, 16 enum, Decimal, 37 model; **tidak ada migrasi**, tidak dipakai runtime, PostGIS masih `Json` |
| 4 REST API | 🟡 | 24 route/±31 method; 13+ endpoint kontrak belum; tidak ada OpenAPI, Zod, rate limit, audit; RBAC org belum |
| 5 Auth & RBAC | 🟡 | Login/register/OTP/reset + proteksi admin ✅; refresh, role selector, menu dinamis, halaman 403, audit login ❌ |
| 6 Shell portal | ✅ 10/12 | Sidebar, header, search, sync, notifikasi, responsive; breadcrumb & keyboard search kurang |
| 7 Dashboard pengurus | ✅ UI | AnswerBanner, agenda, join-request, tugas, dampak; aksi masih state lokal |
| 8 Dashboard operator | 🟡 | KPI, form timbang, outbox, ledger, laporan; drawer konflik & export belum nyata |
| 9 Traceability | 🟡 | Tabel/timeline/validasi UI; scan QR & `GET /batches/{id}` belum |
| 10 Super Admin | 🟡 | Overview/users/organisasi/audit/material; verifikasi, moderasi, template masih placeholder |
| 11 User dashboard | ✅ 5/6 | Dampak personal, chart, riwayat; pengumuman/tantangan belum |
| 12 Chart | ✅ | 4 wrapper chart, token warna; data mock |
| 13 UX states | 🟡 5/10 | Empty/offline/validasi ✅; skeleton, toast, error+retry ❌ |
| 14 QA / DoD | 🟡 8/18 | Lihat temuan keamanan: RBAC lintas role gagal, rate limit tidak ada, audit tidak ada |

Catatan implementasi:
- 28 halaman total; **13 memakai mock-data**, hanya **2 memakai API hooks**.
- 6 halaman masih stub/placeholder: portal `material`, `pengumpulan`, `pengetahuan`; admin `verifikasi`, `moderasi`, `template`.
- `src/server/services/` kosong; `PrismaClient` tidak dipakai di `src` sama sekali; tidak ada file test; Sentry belum diinisialisasi; tidak ada OpenAPI.

---

## 6. Implementasi vs PRD `PilahYuk_2.0_Dokumentasi_Produk_dan_Teknis.md`

PRD mencakup mobile + portal + API + operasi. Audit ini hanya web/API; aplikasi mobile tidak diperiksa.

| Modul P0 | Status | Keterangan |
|---|---|---|
| A. Account, Identity & Access | 🟡 | Login/registrasi/OTP/reset ada; RBAC per organisasi, refresh, audit login belum |
| B. Community OS | 🟡 | UI dashboard komunitas ada; API events/tasks/join-request tidak ada (404), aksi mock |
| C. Home Dashboard | 🟡 | UI ada, data mock; personalisasi per role belum |
| D. Smart Material Intelligence | ❌ | `/material` masih halaman placeholder; rules/prices per organisasi tidak ada |
| E. Smart Collection Network | 🟡 | GET/POST collection-requests ada; status transition, assign, confirm, cancel belum |
| F. Digital Waste Bank | 🟡 | UI + API mock; ledger/saldo belum dari DB, belum ada transaksi nyata |
| G. Waste Passport & Traceability | 🟡 | UI batch + events; `GET /batches/{id}`, QR, validasi persist belum |
| H. Cultural Knowledge & Learning | ❌ | `/pengetahuan` placeholder; semua endpoint cultural-contents belum ada |
| I. Trust, Safety & Dispute | 🟡 | UI + GET/POST; resolve/assign (`PATCH`) belum |
| J. Offline-first | 🟡 | Sync endpoint + UI outbox; idempotency Map memori, konflik selalu `false`, tidak ada outbox persisten |
| Impact (P1) | ❌ | `/organizations/{id}/impact` 404; label verified baru di UI mock |
| WhatsApp companion (P1) | ❌ | Env Fonnte ada, integrasi belum |
| Marketplace / demand matching / incentives / learning (P1–P2) | ❌ | Belum ada |
| Admin console | 🟡 | Overview/users/organisasi/audit/material ada; verifikasi/moderasi/template placeholder; aksi belum menulis audit |
| Nonfungsional | ❌/🟡 | Tidak ada rate limit, observability, test otomatis, OpenAPI; PostGIS belum; backup/queue belum |

**Kesimpulan:** belum semua terimplementasi. Yang ada adalah **prototipe UI dashboard yang kaya + API mock**, bukan backend produksi. Untuk pilot dengan data nyata, P0 yang wajib dibereskan: database + migrasi, RBAC per organisasi, otorisasi tulis, reset/OTP yang aman, rate limit, audit log, dan penyambungan UI ke API.

---

## 7. Perbaikan yang sudah dilakukan

1. `JWT_SECRET` acak (32 byte) dipasang di project Vercel `pilahyuk-dashboard` (Production) dan deployment di-redeploy.
2. Uji ulang token `super_admin` palsu: `401` di `pilahyuk-dashboard.vercel.app`, `pilahyuk-dashboard-swart.vercel.app`, dan lokal.
3. Login 4 akun demo di kedua domain tetap `200` dan halaman awal sesuai role.

Tidak ada perubahan kode aplikasi pada audit ini; temuan lain dibiarkan untuk diputuskan pemilik produk.

---

## 8. Prioritas rekomendasi

**P0 — sebelum menyambungkan database / data nyata**
1. Hapus `dev_reset_token`/`dev_code` dari response produksi (flag dev-only) dan gunakan gateway email/WhatsApp.
2. Tambah policy per endpoint: role + org + ownership; jangan percaya `requester_id`/`reporter_id` dari body.
3. Rate limit login/OTP/reset/register (Redis/Upstash) + lockout.
4. RBAC halaman + filter menu; halaman 403.
5. Cek status user & role di setiap request (bukan hanya signature token).
6. Hapus fallback `JWT_SECRET`; gagal start di production bila kosong.
7. Audit log append-only untuk login, transaksi, verifikasi, koreksi, batch, konten.

**P1 — sebelum pilot publik**
8. Header keamanan (CSP, XCTO, frame-ancestors, Referrer-Policy, Permissions-Policy).
9. Hapus token dari localStorage; pastikan semua API pakai cookie httpOnly.
10. Sambungkan Prisma + migrasi + seed; ganti mock di route dengan service layer.
11. Zod di semua body; error 400 untuk JSON rusak.
12. Refresh token + revocation; bcrypt cost 10–12.
13. `/auth/refresh`, `/me/roles`, events/tasks, material rules/prices, batch detail/QR, disputes PATCH, cultural contents, impact.
14. OpenAPI + test otomatis transisi status/ledger/otorisasi.

**P2 — produksi**
15. Sentry + structured logging + queue.
16. Putuskan project Vercel duplikat (`pilahyuk-dashboard`) agar tidak ada dua permukaan dengan konfigurasi berbeda.
17. Uji dependency, backup terenkripsi, dan prosedur insiden.

---

## 9. Bukti reproduksi (ringkas)

```bash
# Semua akun demo
POST /api/v1/auth/login {"identifier":"admin@pilahyuk.id","password":"admin123"}   # 200 super_admin
POST /api/v1/auth/login {"identifier":"warga@pilahyuk.id","password":"warga123"}    # 200 resident

# Tanpa token / token palsu
GET /api/v1/me                                  # 401
GET /api/v1/admin/organizations                 # 401 tanpa token; 403 operator; 200 super_admin

# Privilege escalation sebagai warga
POST /api/v1/waste-bank/transactions {"member_id":"user-member-001", ...}  # 201
POST /api/v1/batches/batch-001/events {"event_type":"batch_validated"}     # 201
POST /api/v1/batches {"origin_org_id":"org-999", ...}                      # 201
POST /api/v1/collection-requests {"requester_id":"user-superadmin-001", ...} # 201

# Read data orang lain
GET /api/v1/waste-bank/transactions?member_id=user-member-001   # 200 sebagai warga
GET /api/v1/collection-requests                                 # 200 sebagai warga

# Reset takeover (akun uji, bukan akun demo)
POST /api/v1/auth/forgot-password {"identifier":"victim@example.com"}  # dev_reset_token
POST /api/v1/auth/reset-password {"token":"...","password":"hacked123"} # 200
POST /api/v1/auth/login {"identifier":"victim@example.com","password":"hacked123"} # 200

# Rate limit
12x login password salah → 401 semua, tidak ada 429
```

---

*Dokumen ini dibuat dari pengujian langsung pada 14 November 2026. Angka status dapat berubah setelah perbaikan kode.*
