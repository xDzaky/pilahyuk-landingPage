# PilahYuk 2.0 — Panduan API untuk Tim Mobile

> **Versi dokumen:** 1.0 — 14 November 2026
> **Base URL (production):** `https://pilahyuk-dashboard.vercel.app/api/v1`
> **Base URL (lokal):** `http://localhost:3000/api/v1`
> **Status:** kontrak endpoint stabil dan bisa dipakai mobile untuk integrasi. Autentikasi (login, registrasi, OTP, lupa password) sudah berfungsi penuh; data domain lain masih mock.

> ⚠️ **Penting untuk tim mobile:** APK saat ini memakai base URL `https://pilahyuk2.onrender.com/api` (backend lama). Ganti ke `https://pilahyuk-dashboard.vercel.app/api/v1` agar terhubung ke API ini. Detail temuan ada di [`docs/MOBILE-APP-AUDIT.md`](MOBILE-APP-AUDIT.md).

---

## Daftar Isi

1. [Ringkasan Cepat](#1-ringkasan-cepat)
2. [Autentikasi](#2-autentikasi)
3. [Format Response & Error](#3-format-response--error)
4. [Hak Akses per Role](#4-hak-akses-per-role)
5. [Referensi Endpoint](#5-referensi-endpoint)
6. [Aturan Bisnis yang Tidak Boleh Dilanggar Mobile](#6-aturan-bisnis-yang-tidak-boleh-dilanggar-mobile)
7. [Panduan Integrasi React Native](#7-panduan-integrasi-react-native)
8. [Contoh Alur Lengkap](#8-contoh-alur-lengkap)
9. [Testing & Akun Demo](#9-testing--akun-demo)
10. [Batasan Saat Ini](#10-batasan-saat-ini)
11. [Roadmap ke Database](#11-roadmap-ke-database)

---

## 1. Ringkasan Cepat

| Item | Nilai |
|---|---|
| Format | JSON (`Content-Type: application/json`) |
| Auth | Bearer token JWT (HS256), berlaku **8 jam** |
| Transaksi tulis | `POST` + header `Idempotency-Key` (wajib untuk data keuangan) |
| Pagination | `?page=1&per_page=10` (maks `per_page=100`) |
| Zona waktu | Semua timestamp **UTC ISO-8601** (`2026-11-14T03:20:00.000Z`), tampilkan di mobile sebagai `Asia/Jakarta` |
| Uang | Rupiah **integer** (`56000` = Rp 56.000), bukan float desimal |
| Berat | kilogram, desimal 1 tempat (`18.1`) |

Contoh panggilan pertama:

```bash
curl -X POST https://pilahyuk-dashboard.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@banksampah.id","password":"operator123"}'
```

---

## 2. Autentikasi

### 2.0 Registrasi

`POST /auth/register` — publik. Mengikuti alur 3 langkah di mobile.

| Field | Wajib | Aturan |
|---|---|---|
| `name` | ✅ | minimal 3 karakter (nama sesuai KTP) |
| `phone` atau `email` | salah satu | phone `08…`/`+62…`; email valid |
| `password` | ✅ | minimal 8 karakter |
| `district` | – | kecamatan |
| `village` | – | kelurahan |
| `rw` | – | contoh `RW 02` |
| `community_id` / `community_name` | – | opsional, butuh persetujuan pengurus |
| `role` | – | `resident` (default) atau `volunteer` |

```json
{
  "name": "Rina Wulandari",
  "phone": "081298765432",
  "password": "rahasia123",
  "district": "Kecamatan Sukmajaya",
  "village": "Kelurahan Mekarjaya",
  "rw": "RW 02",
  "community_name": "Komunitas Hijau Nusantara"
}
```

**Response `201`**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9....",
    "user": { "id": "user-…", "name": "Rina Wulandari", "role": "resident", "contact_verified": false },
    "expires_in": 28800,
    "next_step": "verify_contact",
    "otp": { "channel": "whatsapp", "expires_in": 300, "dev_code": "4821" }
  }
}
```

`dev_code` hanya ada selama gateway WhatsApp belum aktif. Jika mendaftar dengan email saja, `otp` = `null` dan `next_step` = `complete_profile`.

**Error:** `400 VALIDATION_ERROR` (dengan `details` per field), `409 CONFLICT` (nomor/email sudah terdaftar).

### 2.1 Login

`POST /auth/login` — publik.

**Body** — `identifier` boleh email **atau** nomor HP (field lama `email`/`phone` tetap diterima)

```json
{ "identifier": "operator@banksampah.id", "password": "operator123" }
```

```json
{ "identifier": "081200000002", "password": "operator123" }
```

**Response `200`**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9....",
    "user": {
      "id": "user-operator-001",
      "email": "operator@banksampah.id",
      "name": "Budi Santoso",
      "role": "operator_bank_sampah",
      "org_id": "org-001",
      "org_name": "Bank Sampah Berkah Jaya",
      "avatar": null
    },
    "expires_in": 28800
  }
}
```

Server juga men-set cookie `pilahyuk_token` (HttpOnly, Secure, SameSite=Lax) untuk portal web. **Mobile cukup memakai `data.token`** dan mengirimnya sebagai header:

```
Authorization: Bearer <token>
```

**Error**

| Situasi | HTTP | Body |
|---|---|---|
| Email/password kosong | 400 | `{ "error": { "code": "VALIDATION_ERROR", "message": "Email dan password diperlukan" } }` |
| Kredensial salah | 401 | `{ "error": { "code": "INVALID_CREDENTIALS", "message": "Email atau password salah" } }` |

### 2.2 Logout

`POST /auth/logout` — butuh token. Menghapus cookie sesi. Di mobile: hapus token dari secure storage.

### 2.3 Verifikasi kontak (OTP)

`POST /auth/otp/request` — publik.

```json
{ "phone": "081298765432" }
```

Response `200`:

```json
{
  "data": {
    "sent": true,
    "channel": "whatsapp",
    "phone": "081298765432",
    "expires_in": 300,
    "dev_code": "4821"
  }
}
```

`POST /auth/otp/verify` — publik.

```json
{ "phone": "081298765432", "code": "4821" }
```

Response `200`: `{ "data": { "verified": true, "user": { … } } }`

Kode berlaku 5 menit, maksimal 5 percobaan. Error: `OTP_NOT_FOUND`, `OTP_EXPIRED`, `OTP_INVALID`, `OTP_TOO_MANY_ATTEMPTS` (semua HTTP 400).

### 2.4 Lupa & atur ulang kata sandi

`POST /auth/forgot-password` — publik, selalu `200` agar tidak membocorkan akun terdaftar.

```json
{ "identifier": "081298765432" }
```

Response: `{ "data": { "sent": true, "expires_in": 900, "dev_reset_token": "rst_…" } }` (`dev_reset_token` hanya mode demo).

`POST /auth/reset-password`

```json
{ "token": "rst_…", "password": "sandiBaru123" }
```

Response `200`: `{ "data": { "reset": true } }` · token berlaku 15 menit · `400 INVALID_TOKEN` jika kedaluwarsa.

### 2.5 Profil

`GET /me` — butuh token.

```json
{
  "data": {
    "id": "user-operator-001",
    "name": "Budi Santoso",
    "email": "operator@banksampah.id",
    "role": "operator_bank_sampah",
    "org_id": "org-001",
    "org_name": "Bank Sampah Berkah Jaya",
    "phone": "08123456789"
  }
}
```

`PATCH /me` — hanya `name` dan `phone` yang diterima.

```json
{ "name": "Budi Santoso", "phone": "081298765432" }
```

---

## 3. Format Response & Error

### 3.1 Sukses dengan list

```json
{
  "data": [ { "id": "mat-001" } ],
  "meta": { "page": 1, "per_page": 10, "total": 6, "total_pages": 1 }
}
```

### 3.2 Sukses tanpa list

```json
{ "data": { "id": "wtx-123" } }
```

### 3.3 Gagal

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "member_id dan items wajib diisi",
    "details": { "items": ["minimal 1 item"] }
  }
}
```

| Kode | HTTP | Arti | Tindakan mobile |
|---|---|---|---|
| `UNAUTHORIZED` | 401 | Token tidak ada / kedaluwarsa | Hapus token → arahkan ke login |
| `INVALID_CREDENTIALS` | 401 | Login salah | Tampilkan pesan di form |
| `FORBIDDEN` | 403 | Role tidak punya akses | Sembunyikan menu terkait |
| `NOT_FOUND` | 404 | Data tidak ditemukan | Tampilkan empty state |
| `VALIDATION_ERROR` | 400 | Input tidak valid | Tandai field dari `details` |
| `CONFLICT` | 409 | Bentrok data (mis. idempotency beda payload) | Tampilkan diff, jangan auto-timpa |
| `INTERNAL_ERROR` | 500 | Gagal server | Tampilkan tombol "Coba lagi" |

**Jangan** retry `POST` tanpa `Idempotency-Key` — bisa terjadi duplikasi data.

---

## 4. Hak Akses per Role

Role yang sudah aktif di seed:

| Role | Kode |
|---|---|
| Super Admin | `super_admin` |
| Operator Bank Sampah | `operator_bank_sampah` |
| Pengurus Komunitas | `pengurus_komunitas` |

| Endpoint | Siapa yang boleh |
|---|---|
| `GET /materials`, `GET /communities`, `GET /collection-requests`, `GET /batches`, `GET /disputes` | Semua user login |
| `GET /me`, `PATCH /me` | Pemilik token |
| `GET /waste-bank/members/{id}/balance`, `/ledger` | Pemilik `{id}` sendiri, operator bank sampah, super admin |
| `GET /waste-bank/reports/{period}`, `POST /waste-bank/transactions/{id}/adjustments` | Operator bank sampah, super admin |
| `GET /waste-bank/transactions`, `POST /waste-bank/transactions` | Semua user login |
| `POST /batches`, `POST /batches/{id}/events` | Semua user login |
| `POST /sync/batch` | Semua user login |
| `GET /admin/*`, `POST /admin/organizations/{id}/verify` | **Hanya super admin** (403 untuk role lain) |

> Catatan: pembatasan berbasis organisasi (operator hanya data bank sampahnya sendiri) belum ditegakkan di semua endpoint — lihat [Batasan](#10-batasan-saat-ini) poin 4.

---

## 5. Referensi Endpoint

Ringkasan semua endpoint yang tersedia saat ini (**31 method** di 24 route handler):

| # | Method | Path | Auth | Keterangan |
|---|---|---|---|---|
| 1 | POST | `/auth/register` | – | Daftar akun baru (3 langkah + OTP) |
| 2 | POST | `/auth/login` | – | Login email/nomor HP, token 8 jam |
| 3 | POST | `/auth/logout` | ✅ | Hapus sesi |
| 4 | POST | `/auth/otp/request` | – | Kirim kode verifikasi kontak |
| 5 | POST | `/auth/otp/verify` | – | Verifikasi kode OTP 4 digit |
| 6 | POST | `/auth/forgot-password` | – | Minta token pemulihan |
| 7 | POST | `/auth/reset-password` | – | Set kata sandi baru |
| 8 | GET | `/me` | ✅ | Profil user aktif |
| 9 | PATCH | `/me` | ✅ | Ubah nama / no. HP / kata sandi |
| 10 | GET | `/communities` | ✅ | Daftar organisasi tipe komunitas |
| 11 | GET | `/materials` | ✅ | Master material + harga aktif |
| 12 | GET | `/collection-requests` | ✅ | Daftar permintaan penjemputan |
| 13 | POST | `/collection-requests` | ✅ | Buat permintaan penjemputan |
| 14 | GET | `/waste-bank/transactions` | ✅ | Riwayat transaksi timbang |
| 15 | POST | `/waste-bank/transactions` | ✅ | Catat transaksi timbang (idempoten) |
| 16 | GET | `/waste-bank/members/{id}/balance` | ✅ | Saldo anggota (dari ledger) |
| 17 | GET | `/waste-bank/members/{id}/ledger` | ✅ | Riwayat buku tabungan |
| 18 | GET | `/waste-bank/transactions/{id}/adjustments` | ✅ | Daftar koreksi transaksi |
| 19 | POST | `/waste-bank/transactions/{id}/adjustments` | ✅ | Buat koreksi (tidak menghapus asal) |
| 20 | GET | `/waste-bank/reports/{period}` | ✅ | Laporan harian/bulanan |
| 21 | GET | `/batches` | ✅ | Daftar batch material |
| 22 | POST | `/batches` | ✅ | Buat batch |
| 23 | GET | `/batches/{id}/events` | ✅ | Timeline perjalanan batch |
| 24 | POST | `/batches/{id}/events` | ✅ | Tambah event batch |
| 25 | POST | `/sync/batch` | ✅ | Sinkronisasi offline (idempoten) |
| 26 | GET | `/disputes` | ✅ | Daftar sengketa |
| 27 | POST | `/disputes` | ✅ | Ajukan sengketa |
| 28 | GET | `/admin/organizations` | 🔒 | Semua organisasi (super admin) |
| 29 | POST | `/admin/organizations/{id}/verify` | 🔒 | Setujui / tolak organisasi |
| 30 | GET | `/admin/audit-logs` | 🔒 | Jejak audit (append-only) |
| 31 | GET | `/admin/system/health` | 🔒 | Status layanan |

### 5.1 Communities

`GET /communities?page=1&per_page=10&status=verified`

```json
{
  "data": [
    {
      "id": "org-001",
      "name": "Komunitas Hijau RW 05",
      "type": "community",
      "status": "verified",
      "verified_at": "2026-02-01T00:00:00Z",
      "area_name": "Surabaya Timur",
      "member_count": 48,
      "created_at": "2026-01-20T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 10, "total": 2, "total_pages": 1 }
}
```

### 5.2 Materials

`GET /materials?category=plastik_pet&page=1&per_page=50`

```json
{
  "data": [
    {
      "id": "mat-001",
      "name": "Plastik PET",
      "category": "plastik_pet",
      "description": "Botol plastik transparan (kode 1)",
      "prep_guide": "Cuci bersih, pisahkan tutup botol, tekan pipih",
      "current_price": 3500,
      "price_valid_from": "2026-11-01T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 50, "total": 1, "total_pages": 1 }
}
```

Kategori: `plastik_pet`, `plastik_lain`, `kertas`, `kardus`, `logam`, `kaca`, `organik`, `b3`, `lainnya`.

### 5.3 Collection Requests

`GET /collection-requests?page=1&per_page=10&status=submitted&requester_id=usr-004`

Field penting: `id`, `requester_id`, `requester_name`, `organization_id`, `method` (`individual` | `collective` | `dropoff`), `status`, `requested_at`, `slot_start`, `slot_end`, `area_name`, `items[]`.

`POST /collection-requests`

```json
{
  "requester_id": "usr-004",
  "organization_id": "org-001",
  "method": "individual",
  "items": [
    { "material_id": "mat-001", "material_name": "Plastik PET", "estimated_quantity": 2.5 }
  ]
}
```

Response `201` — objek permintaan dengan `status: "draft"`.

**Peta transisi status** (divalidasi server pada rilis berikutnya):

```
draft → submitted | cancelled
submitted → confirmed | cancelled
confirmed → assigned | cancelled
assigned → on_the_way | cancelled
on_the_way → collected
collected → received
received → completed | disputed
disputed → resolved | cancelled
```

### 5.4 Transaksi Bank Sampah

`GET /waste-bank/transactions?page=1&per_page=10&member_id=user-member-001&status=confirmed`

`POST /waste-bank/transactions` — **wajib** `Idempotency-Key` (UUID v4 yang dibuat sekali di device).

Header:

```
Idempotency-Key: 6f1c2a9e-3f4b-4c1d-9a77-2b8e5d0c1a44
```

Body (format yang direkomendasikan — dipakai mobile):

```json
{
  "member_id": "user-member-001",
  "items": [
    { "material_id": "mat-001", "gross": 3.0, "tare": 0.5 },
    { "material_id": "mat-003", "gross": 2.0, "tare": 0.2 }
  ]
}
```

Server menghitung sendiri `net`, `price_snapshot`, dan `value` — **jangan kirim harga dari mobile**.

Response `201`:

```json
{
  "data": {
    "id": "wtx-1794595511432",
    "organization_id": "org-002",
    "member_id": "user-member-001",
    "operator_id": "user-operator-001",
    "transaction_at": "2026-11-14T03:20:00.000Z",
    "status": "confirmed",
    "sync_status": "synced",
    "is_offline_created": false,
    "idempotency_key": "6f1c2a9e-...",
    "items": [
      {
        "material_id": "mat-001",
        "material_name": "Plastik PET",
        "gross": 3.0,
        "tare": 0.5,
        "net": 2.5,
        "price_snapshot": 3500,
        "price_valid_from": "2026-11-01T00:00:00Z",
        "value": 8750
      }
    ],
    "total_net": 4.3,
    "total_value": 12290
  },
  "meta": { "idempotent": false }
}
```

Kirim request yang sama dua kali dengan key sama → response identik, `meta.idempotent: true`, **tidak** membuat transaksi kedua.

### 5.5 Saldo & Ledger

`GET /waste-bank/members/{id}/balance`

```json
{
  "data": {
    "member_id": "user-member-001",
    "total_credit_idr": 19700,
    "total_debit_idr": 15000,
    "computed_balance_idr": 4700,
    "note": "Saldo dihitung dari akumulasi ledger, bukan field tersimpan"
  }
}
```

`GET /waste-bank/members/{id}/ledger`

```json
{
  "data": {
    "member_id": "user-member-001",
    "entries": [
      {
        "id": "led-001",
        "member_id": "user-member-001",
        "entry_type": "deposit",
        "amount_kg": 5.2,
        "material_name": "Kertas HVS",
        "credit_idr": 10400,
        "debit_idr": 0,
        "balance_after": 10400,
        "reference_id": "trx-001",
        "notes": "Setoran timbang",
        "created_at": "2024-11-01T09:00:00Z"
      }
    ],
    "computed_balance_idr": 4700
  },
  "meta": { "total": 3 }
}
```

### 5.6 Koreksi Transaksi

`POST /waste-bank/transactions/{id}/adjustments` — operator/admin. Alasan wajib.

```json
{
  "reason": "Timbangan ulang: tara lebih besar 0,4 kg",
  "amount_kg_delta": -0.4,
  "amount_idr_delta": -1400
}
```

Response `201`:

```json
{
  "data": {
    "id": "adj-1794595511432",
    "original_transaction_id": "wtx-001",
    "reason": "Timbangan ulang: tara lebih besar 0,4 kg",
    "amount_kg_delta": -0.4,
    "amount_idr_delta": -1400,
    "created_by": "user-operator-001",
    "created_at": "2026-11-14T03:25:00.000Z",
    "note": "Koreksi ini tidak mengubah transaksi asal. Saldo dihitung ulang dari ledger."
  }
}
```

`GET /waste-bank/transactions/{id}/adjustments` — daftar koreksi untuk transaksi tersebut.

### 5.7 Laporan

`GET /waste-bank/reports/{period}` — `{period}` = `2026-11` (bulanan) atau `2026-11-14` (harian).

```json
{
  "data": {
    "period": "2026-11-14",
    "org_id": "org-001",
    "period_type": "daily",
    "summary": {
      "total_transactions": 8,
      "total_weight_kg": 42.3,
      "total_value_idr": 84600,
      "unique_members": 6
    },
    "by_material": [
      { "material": "Kertas HVS", "weight_kg": 18.2, "value_idr": 36400 }
    ],
    "generated_at": "2026-11-14T03:30:00.000Z"
  }
}
```

Format salah → `400 VALIDATION_ERROR`.

### 5.8 Batch & Traceability

`GET /batches?page=1&per_page=10&status=diproses&organization_id=org-001`

`POST /batches`

```json
{ "origin_org_id": "org-001", "material_id": "mat-001", "quantity": 45.2 }
```

Response `201` berisi `code` publik dengan format `PY-YYYYMMDD-ORG-XXXX` (dipakai untuk QR).

`GET /batches/{id}/events` → timeline:

```json
{
  "data": [
    {
      "id": "evt-001",
      "batch_id": "batch-001",
      "event_type": "batch_created",
      "actor_id": "user-operator-001",
      "actor_name": "Budi Santoso",
      "notes": "Batch dibuat dari 23 transaksi timbang",
      "created_at": "2024-11-01T08:00:00Z"
    }
  ],
  "meta": { "total": 5, "batch_id": "batch-001" }
}
```

`POST /batches/{id}/events` — `event_type` yang diizinkan:
`material_sorted`, `pickup_scheduled`, `batch_validated`, `batch_completed`, `dispute_raised`, `note_added`.

```json
{ "event_type": "batch_validated", "notes": "Berat sesuai", "evidence_url": "https://..." }
```

> Privasi: timeline publik hanya menampilkan agregat, **tidak pernah** nama/alamat rumah tangga.

### 5.9 Sinkronisasi Offline

`POST /sync/batch` — inti fitur offline-first.

```json
{
  "items": [
    {
      "key": "6f1c2a9e-3f4b-4c1d-9a77-2b8e5d0c1a44",
      "type": "weighing_transaction",
      "payload": {
        "member_id": "user-member-001",
        "items": [{ "material_id": "mat-001", "gross": 3.0, "tare": 0.5, "price_snapshot": 3500 }]
      },
      "client_created_at": "2026-11-14T02:55:00.000Z"
    }
  ]
}
```

Response `200` — status per item:

```json
{
  "data": [
    { "key": "6f1c2a9e-...", "status": "synced", "server_id": "wtx-sync-1794595511432-ab12" }
  ]
}
```

| `status` | Arti | Aksi mobile |
|---|---|---|
| `synced` | Tersimpan di server | Tandai item selesai, hapus dari outbox |
| `failed` | Ditolak validasi | Tampilkan alasan, minta operator perbaiki |
| `conflict` | Harga/data berubah | **Jangan** auto-resolve: tampilkan diff + tombol "Kirim sebagai penyesuaian" |

Aturan penting: key yang sama **tidak akan pernah** diproses dua kali. Kirim ulang seluruh batch setelah koneksi pulih aman.

### 5.10 Sengketa

`GET /disputes?status=open&category=harga&page=1&per_page=10`

`POST /disputes`

```json
{
  "reporter_id": "user-member-001",
  "related_type": "transaction",
  "related_id": "wtx-001",
  "reason": "Berat tidak sesuai timbangan saya",
  "category": "berat"
}
```

`related_type`: `collection` | `transaction` | `batch` | `content` | `user`
`category`: `berat` | `harga` | `kualitas` | `layanan` | `konten`

### 5.11 Admin (Super Admin saja)

`GET /admin/organizations?status=pending_review&q=hijau`

`POST /admin/organizations/{id}/verify`

```json
{ "action": "approve", "reason": null }
```

`action`: `approve` | `reject` (selain itu `400`). Response berisi `status`, `verified_at`, `verified_by`.

`GET /admin/audit-logs?actor_id=usr-002&entity_type=weighing_transaction&page=1&per_page=50`

`GET /admin/system/health`

```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2026-11-14T03:35:00.000Z",
    "services": {
      "database": { "status": "up", "latency_ms": 12 },
      "redis": { "status": "up", "latency_ms": 2 },
      "storage": { "status": "up", "latency_ms": 45 }
    },
    "stats": { "total_users": 847, "active_orgs": 23, "transactions_today": 156, "batches_this_month": 42 }
  }
}
```

---

## 6. Aturan Bisnis yang Tidak Boleh Dilanggar Mobile

1. **Saldo tidak pernah dikirim/disimpan sebagai angka bebas.** Selalu tampilkan `computed_balance_idr` dari server (hasil `SUM(credit) - SUM(debit)`).
2. **Harga adalah snapshot.** Mobile tidak boleh mengirim `price_snapshot`/`value` pada `POST /waste-bank/transactions`; server yang menentukan dari harga berlaku saat itu.
3. **Koreksi, bukan edit/hapus.** Transaksi terkonfirmasi tidak bisa diubah. Semua perbaikan lewat `POST /adjustments` dengan `reason` wajib.
4. **Idempotency wajib.** Satu transaksi = satu `Idempotency-Key` (UUID v4) yang disimpan di device sampai status `synced`.
5. **Konflik tidak auto-resolve.** Status `conflict` dari `/sync/batch` harus ditampilkan ke operator.
6. **Privasi.** Jangan pernah menampilkan nama/alamat rumah tangga pada data batch/traceability publik.
7. **Audit.** Aksi penting (verifikasi, koreksi, keputusan sengketa) selalu tercipta di `audit_logs` di sisi server.

---

## 7. Panduan Integrasi React Native

### 7.1 Client dasar

```ts
// src/lib/api.ts
import * as SecureStore from "expo-secure-store"

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://pilahyuk-dashboard.vercel.app/api/v1"
const TOKEN_KEY = "pilahyuk_token"

export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401) await SecureStore.deleteItemAsync(TOKEN_KEY)
    throw new ApiError(json?.error?.code ?? "UNKNOWN", json?.error?.message ?? "Terjadi kesalahan", res.status)
  }
  return json as T
}

export const api = {
  login: (email: string, password: string) =>
    request<{ data: { token: string; user: unknown } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  materials: (params = "") => request(`/materials${params}`),
  createTransaction: (body: unknown, idempotencyKey: string) =>
    request("/waste-bank/transactions", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    }),
}
```

### 7.2 Menyimpan token

Gunakan `expo-secure-store`, **bukan** `AsyncStorage` biasa:

```ts
await SecureStore.setItemAsync("pilahyuk_token", data.token)
```

### 7.3 Membuat Idempotency-Key

```ts
import * as Crypto from "expo-crypto"
const key = Crypto.randomUUID() // simpan di AsyncStorage bersama payload sampai synced
```

### 7.4 Alur offline

```
Operator menimbang (offline)
  → simpan transaksi di outbox lokal { key, payload, client_created_at, status: "pending" }
  → UI menampilkan badge "Menunggu Sinkronisasi"
Koneksi pulih
  → POST /sync/batch { items: [ ...outbox ] }
  → per item: synced → hapus dari outbox
              failed → tandai gagal + alasan
              conflict → tampilkan diff, jangan timpa
```

### 7.5 Format angka & waktu

```ts
// Uang: integer rupiah
new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(12290)
// Berat: 1 desimal
new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(18.1)
// Waktu: simpan UTC, tampilkan Jakarta
new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(iso))
```

### 7.6 Checklist integrasi mobile

- [ ] Semua request memakai `Authorization: Bearer`
- [ ] Response `401` → logout otomatis + hapus token
- [ ] Semua POST transaksi memakai `Idempotency-Key` unik per transaksi
- [ ] Outbox lokal menyimpan payload + key sampai status `synced`
- [ ] Status `conflict` selalu ditampilkan ke operator
- [ ] Tidak ada kalkulasi harga/saldo final di client (hanya preview)
- [ ] Timestamp dikonversi ke `Asia/Jakarta` saat ditampilkan
- [ ] Angka uang memakai integer, bukan float

---

## 8. Contoh Alur Lengkap

**Skenario:** operator mencatat penimbangan 2 material untuk anggota.

```bash
BASE=https://pilahyuk-dashboard.vercel.app/api/v1

# 1. Login
TOKEN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" \
  -d '{"email":"operator@banksampah.id","password":"operator123"}' | jq -r .data.token)

# 2. Ambil material & harga aktif
curl -s $BASE/materials -H "Authorization: Bearer $TOKEN" | jq '.data[].name'

# 3. Catat transaksi (idempoten)
curl -s -X POST $BASE/waste-bank/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{"member_id":"user-member-001","items":[{"material_id":"mat-001","gross":3.0,"tare":0.5}]}' | jq

# 4. Cek saldo anggota (dihitung dari ledger)
curl -s $BASE/waste-bank/members/user-member-001/balance -H "Authorization: Bearer $TOKEN" | jq

# 5. Laporan harian
curl -s $BASE/waste-bank/reports/2026-11-14 -H "Authorization: Bearer $TOKEN" | jq
```

---

## 9. Testing & Akun Demo

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@pilahyuk.id` | `admin123` |
| Operator Bank Sampah | `operator@banksampah.id` | `operator123` |
| Pengurus Komunitas | `pengurus@komunitas.id` | `pengurus123` |

Cara cepat mengecek API hidup:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://pilahyuk-dashboard.vercel.app/api/v1/materials
# 401 = server hidup dan meminta token (benar)
```

---

## 10. Batasan Saat Ini

Tim mobile **wajib tahu** batasan berikut agar tidak menganggapnya bug:

1. **Data masih mock.** Semua route membaca `src/lib/mock-data.ts`. `POST` mengembalikan objek baru tetapi **tidak tersimpan permanen** (hilang saat instance server restart).
2. **Idempotency disimpan di memori** (`Map`), bukan Redis — cukup untuk demo, bukan produksi.
3. **Belum ada endpoint berikut** (kontrak ada di PRD, implementasi menyusul):
   - `POST /auth/refresh`, `GET /me/roles`
   - `POST /communities/{id}/join-requests`, `GET/PATCH /organizations/{id}/members`
   - `GET/POST /organizations/{id}/events`, `POST /events/{id}/registrations`, `POST /events/{id}/check-in`
   - `GET/POST /organizations/{id}/tasks`, `PATCH /tasks/{id}`
   - `GET /materials/{id}/rules`, `GET/PUT /organizations/{id}/materials/prices`
   - `PATCH /collection-requests/{id}/status`, `/assign`, `/confirm`, `/cancel`
   - `GET /batches/{id}`, `GET /batches/{id}/qr`
   - `PATCH /disputes/{id}` (assign/resolve)
   - Cultural content, impact, notifikasi, upload media
4. **Otorisasi per organisasi belum lengkap.** Saat ini `GET /waste-bank/transactions` bisa dibaca semua user login; scoping "hanya bank sampah sendiri" masuk tahap berikutnya.
5. **Belum ada rate limiting, validasi Zod, dan service layer** — validasi masih manual di route handler.
6. **Akun hasil registrasi disimpan in-memory** — bertahan selama instance server hidup. Setelah Prisma tersambung, akun menjadi persisten.
6. **Belum ada OpenAPI/Swagger** di `/api/docs`.

---

## 11. Roadmap ke Database

Skema database sudah disiapkan di `prisma/schema.prisma` (852 baris, 25+ model) tetapi **belum dipakai** oleh route handler. Urutan pekerjaan yang disarankan:

1. Siapkan PostgreSQL (Neon / Supabase / Docker lokal `docker-compose.yml`).
2. Isi `DATABASE_URL` + `DIRECT_URL`, jalankan `npx prisma db push` lalu `npm run db:seed`.
3. Ganti pembacaan mock di route handler dengan query Prisma lewat `src/server/services/*`.
4. Pindahkan idempotency key ke tabel `sync_idempotency_keys`.
5. Tambah validasi Zod per endpoint + rate limit Redis.
6. Terbitkan OpenAPI spec di `/api/docs` setelah semua endpoint final.

Setelah langkah 3 selesai, **kontrak di dokumen ini tidak berubah** — mobile tidak perlu menyesuaikan ulang.

---

*Dokumen ini dibuat dari implementasi nyata di `src/app/api/v1/**`. Jika ada perbedaan antara dokumen dan response server, response server adalah acuan; laporkan perbedaannya agar dokumen diperbaiki.*
