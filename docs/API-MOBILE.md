# API Mobile — PilahYuk 2.0

Base URL produksi:

```
https://pilahyuk-dashboard.vercel.app/api/v1
```

Semua response memakai envelope:

```json
{ "data": ..., "meta": { "page": 1, "per_page": 20, "total": 0, "total_pages": 0 } }
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```

## 1. Autentikasi

Login mengembalikan **access token** (8 jam) dan **refresh token** (30 hari). Untuk aplikasi mobile, kirim access token sebagai header:

```
Authorization: Bearer <access_token>
```

Web juga mendapat cookie `HttpOnly`; mobile tidak perlu cookie.

| Endpoint | Body | Keterangan |
|---|---|---|
| `POST /auth/login` | `{ identifier, password }` | `identifier` = email atau nomor HP (`08…` / `+62…`) |
| `POST /auth/register` | lihat §2 | 201, langsung dapat token |
| `POST /auth/refresh` | `{ refresh_token }` | Rotasi: refresh lama dicabut, simpan yang baru |
| `POST /auth/logout` | `{ refresh_token }` | Cabut refresh token |
| `GET /me` | – | Profil + role + org aktif |
| `PATCH /me` | `{ name?, phone?, password?, current_password?, district?, village?, rw?, area_id? }` | Ganti HP/password wajib `current_password` |
| `GET /me/roles` | – | Daftar keanggotaan organisasi + role |
| `POST /auth/otp/request` | `{ phone }` | Kirim kode 4 digit (WhatsApp di produksi) |
| `POST /auth/otp/verify` | `{ phone, code }` | Verifikasi kontak |
| `POST /auth/forgot-password` | `{ identifier }` | Produksi: tautan/token dikirim via WhatsApp |
| `POST /auth/reset-password` | `{ token, password }` atau `{ identifier, code, password }` | Token/OTP sekali pakai |

Contoh login:

```bash
curl -X POST https://pilahyuk-dashboard.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"warga@pilahyuk.id","password":"warga123"}'
```

```json
{
  "data": {
    "token": "eyJ...",
    "refresh_token": "F3...",
    "token_type": "Bearer",
    "expires_in": 28800,
    "user": { "id": "usr-warga", "name": "Dewi Lestari", "role": "resident", "org_id": "org-comm-prob" }
  }
}
```

Contoh pemulihan kata sandi (Forgot & Reset Password):

1. Minta kode:
```bash
curl -X POST https://pilahyuk-dashboard.vercel.app/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"identifier":"08123456789"}'
```
Response:
```json
{
  "data": {
    "message": "Instruksi pemulihan kata sandi telah dikirimkan.",
    "channel": "whatsapp",
    "expires_in": 300
  }
}
```

2. Reset dengan OTP:
```bash
curl -X POST https://pilahyuk-dashboard.vercel.app/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"identifier":"08123456789","code":"4821","password":"passwordBaru123"}'
```
Response:
```json
{
  "data": {
    "message": "Kata sandi berhasil diperbarui. Silakan masuk kembali."
  }
}
```

**Rate limit** (persisten di database): login 10×/15 menit per identifier dan 30×/15 menit per IP; OTP 5×/10 menit per nomor; register 5×/jam per IP. Melebihi batas → `429` + header `Retry-After`.

## 2. Registrasi

```json
{
  "name": "Nama Lengkap",
  "phone": "08123456789",
  "password": "minimal8karakter",
  "email": "opsional@email.com",
  "district": "Mayangan",
  "village": "Sukabumi",
  "rw": "RW 05",
  "area_id": "kel-sukabumi",
  "community_id": "org-comm-prob",
  "role": "resident"
}
```

- `phone` **atau** `email` wajib salah satu; `name` ≥3; password ≥8.
- `role` hanya `resident` (default) atau `volunteer`.
- `community_id`/`community_name` membuat keanggotaan **pending**; pengurus harus menyetujui.
- Jika memakai phone, response berisi `next_step: "verify_contact"` dan `otp` (di dev berisi `dev_code`; di produksi tidak).
- Response 201 juga berisi `token` + `refresh_token`.

## 3. Wilayah & multi-daerah

| Endpoint | Keterangan |
|---|---|
| `GET /areas?q=&parent_id=` | Semua wilayah (provinsi → kota → kecamatan → kelurahan) |
| `GET /communities?area_id=&q=` | Komunitas terverifikasi di wilayah (termasuk turunannya) |
| `GET /materials?organization_id=&category=` | Katalog material + harga aktif bank sampah tersebut |

Data seed mencakup **Probolinggo (Jawa Timur)**, **Jakarta Selatan**, dan **Bandung**. Mobile dapat memilih `area_id` dari `/areas`, lalu memuat komunitas/bank sampah di wilayah itu.

Untuk warga, `GET /materials` tanpa `organization_id` otomatis memakai bank sampah terverifikasi di wilayah profil pengguna. Untuk harga pasti, kirim `organization_id`.

## 4. Endpoint operasional

### Permintaan penjemputan

| Method | Path | Role |
|---|---|---|
| GET | `/collection-requests` | Warga: milik sendiri; operator/pengurus: organisasinya; collector: yang ditugaskan; admin: semua |
| POST | `/collection-requests` | Semua user login; `requester_id` **diambil dari token**, bukan body |
| GET | `/collection-requests/{id}` | Pemilik, petugas organisasi, collector yang ditugaskan, admin |
| PATCH | `/collection-requests/{id}/status` | Transisi tervalidasi (lihat bawah) |
| POST | `/collection-requests/{id}/assign` | Operator/pengurus organisasi |
| POST | `/collection-requests/{id}/confirm` | Petugas/collector terkait; body `items[{material_id, actual_quantity}]` |
| POST | `/collection-requests/{id}/cancel` | Pemilik/petugas/admin |

Body create:

```json
{
  "organization_id": "org-bank-prob",
  "method": "individual",
  "area_id": "kel-sukabumi",
  "address": "Jl. Sukabumi No. 12",
  "slot_start": "2026-11-20T09:00:00Z",
  "slot_end": "2026-11-20T11:00:00Z",
  "items": [{ "material_id": "mat-pet", "estimated_quantity": 2.5 }]
}
```

`address` opsional untuk kompatibilitas app lama, tetapi sangat disarankan agar petugas bisa menemukan lokasi. Alamat hanya terlihat oleh pemilik/petugas terkait.

Transisi: `draft → submitted → confirmed → assigned → on_the_way → collected → received → completed` (atau `cancelled`/`disputed`).

### Bank sampah

| Method | Path | Role |
|---|---|---|
| GET | `/waste-bank/transactions` | Warga: milik sendiri; operator: organisasinya; admin: semua |
| POST | `/waste-bank/transactions` | Operator/admin; wajib `Idempotency-Key` (disarankan) |
| GET | `/waste-bank/transactions/{id}` | Pemilik/operator/admin |
| GET | `/waste-bank/members/{id}/ledger` | Pemilik/operator anggota itu/admin |
| GET | `/waste-bank/members/{id}/balance` | Sama; saldo = `SUM(ledger.entries.amount)` |
| GET | `/waste-bank/transactions/{id}/adjustments` | Pemilik/operator/admin |
| POST | `/waste-bank/transactions/{id}/adjustments` | Operator/admin; alasan wajib |
| GET | `/waste-bank/reports/{YYYY-MM}` | Operator/admin |
| GET | `/waste-bank/reports/{YYYY-MM-DD}` | Operator/admin |
| POST | `/waste-bank/members/{id}/withdrawals` | Operator/admin; tarik tunai/sembako tabungan |
| PUT | `/organizations/{id}/materials/prices` | Operator/admin; perbarui harga beli material |

Body transaksi:

```json
{
  "organization_id": "org-bank-prob",
  "member_id": "usr-warga",
  "items": [
    { "material_id": "mat-pet", "gross": 3.0, "tare": 0.2 },
    { "material_id": "mat-kardus", "gross": 2.0, "tare": 0.1 }
  ],
  "device_id": "android-abc",
  "is_offline_created": false
}
```

Server menghitung `net = gross - tare`, mengambil **harga snapshot** yang berlaku saat transaksi, dan menulis ledger. Harga di client tidak dipercaya. Kirim `Idempotency-Key` yang sama dua kali → transaksi tidak duplikat; response kedua diberi `idempotent: true`.

Koreksi:

```json
{ "reason": "Tara salah input", "amount_idr_delta": -500, "amount_kg_delta": 0 }
```

Transaksi asal tidak diubah/dihapus; status menjadi `adjusted` dan ledger mendapat entri `adjustment`.

### Batch & jejak material

| Method | Path | Role |
|---|---|---|
| GET | `/batches` | Semua user login (agregat, tanpa data pribadi) |
| POST | `/batches` | Operator/pengurus/admin organisasi |
| GET | `/batches/{id}` | Semua user login |
| GET | `/batches/{id}/events` | Semua user login |
| POST | `/batches/{id}/events` | Operator/pengurus asal untuk event pengumpulan; recycler untuk penerimaan/pemrosesan |
| GET | `/batches/{id}/qr` | Semua user login |

```json
{ "origin_org_id": "org-bank-prob", "material_id": "mat-kardus", "quantity": 10 }
```

Event: `dikumpulkan`, `ditimbang`, `digabung`, `diserahkan` (asal) dan `diterima`, `ditolak`, `diproses`, `residu`, `dipakai_ulang` (pengolah).

### Sengketa

| Method | Path | Role |
|---|---|---|
| GET | `/disputes` | Warga: miliknya; pengurus/operator: anggota/organisasinya; admin: semua |
| POST | `/disputes` | Pelapor = token; `related_type` = `transaction`/`collection`/`batch`/`content` |
| PATCH | `/disputes/{id}` | Pengurus/operator: `assigned`/`in_review`; admin: `resolved`/`rejected` (+`resolution`) |

### Agenda & Gotong Royong Komunitas (Events)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/organizations/{id}/events` | Semua user login | Daftar agenda gotong royong/kegiatan komunitas |
| POST | `/organizations/{id}/events` | Pengurus komunitas/admin | Buat agenda kegiatan baru |
| POST | `/events/{id}/registrations` | Warga/relawan | Mendaftar keikutsertaan kegiatan |
| POST | `/events/{id}/check-in` | Warga/pengurus | Presensi kehadiran di lokasi kegiatan |

### Notifikasi In-App

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/notifications` | Semua user login | Daftar notifikasi (status jemput, setoran, saldo, agenda) |
| PATCH | `/notifications/{id}` | Pemilik notifikasi | Tandai notifikasi spesifik sudah dibaca |
| POST | `/notifications/read-all` | Pemilik notifikasi | Tandai semua notifikasi sudah dibaca |

### Tantangan Memilah & Gamifikasi (Challenges)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/challenges` | Semua user login | Daftar tantangan aksi memilah komunitas |
| POST | `/challenges` | Pengurus komunitas/admin | Buat tantangan baru |
| POST | `/challenges/{id}/join` | Warga/relawan | Gabung ke tantangan |

### Arsip Budaya & Pengetahuan Lokal (Cultural Content)

| Method | Path | Role | Keterangan |
|---|---|---|---|
| GET | `/cultural-contents` | Semua user login | Arsip cerita, kearifan lokal memilah & daur ulang |
| POST | `/cultural-contents` | Warga/pengurus | Kirim cerita budaya & pengetahuan lokal |
| PATCH | `/cultural-contents/{id}` | Kurator budaya/admin | Moderasi & kurasi konten (approve/revise/reject) |

### Sinkronisasi offline

`POST /sync/batch` (semua role sesuai tipe):

```json
{
  "items": [
    {
      "key": "uuid-idempoten-device",
      "type": "weighing_transaction",
      "payload": {
        "organization_id": "org-bank-prob",
        "member_id": "usr-warga",
        "items": [{ "material_id": "mat-pet", "gross": 2.5, "tare": 0.2, "price_snapshot": 3500 }]
      },
      "client_created_at": "2026-11-14T10:00:00Z"
    }
  ]
}
```

Response per item: `{ key, status: "synced" | "failed" | "conflict", server_id?, reason? }`.
Key disimpan di database; kirim ulang key yang sama → hasil sama, tidak duplikat. Jika `price_snapshot` berbeda dari harga server → `conflict` (tidak menimpa data keuangan).

### Admin (Super Admin)

`GET /admin/organizations`, `POST /admin/organizations/{id}/verify`, `GET /admin/audit-logs`, `GET /admin/system/health`, `GET /admin/users`.

## 5. Role

| Kode | Akses utama |
|---|---|
| `resident` / `volunteer` | Profil, permintaan sendiri, transaksi/ledger sendiri, dampak |
| `pengurus_komunitas` | Anggota, agenda, tugas, sengketa anggota, dampak komunitas |
| `operator_bank_sampah` | Penimbangan, ledger, koreksi, laporan, batch asal |
| `collector` | Tugas jemput yang ditugaskan, status pengambilan, serah terima |
| `recycler` | Penerimaan/pemrosesan batch |
| `curator` | Konten budaya (endpoint konten menyusul) |
| `super_admin` | Semua + verifikasi + audit + kesehatan sistem |

**Akses diperiksa di server**, bukan hanya UI. Warga tidak bisa membaca transaksi/permintaan anggota lain; operator hanya data organisasinya; admin hanya super admin.

## 6. Error code

| Code | HTTP | Arti |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body/parameter tidak valid; `details` berisi field |
| `UNAUTHORIZED` | 401 | Token tidak ada/invalid/kedaluwarsa |
| `INVALID_CREDENTIALS` | 401 | Email/HP atau password salah |
| `FORBIDDEN` | 403 | Role/ownership tidak mengizinkan |
| `NOT_FOUND` | 404 | Resource tidak ada |
| `CONFLICT` | 409 | Duplikat/idempotency/status bentrok |
| `PRICE_NOT_FOUND` | 422 | Harga material belum diatur untuk org |
| `RATE_LIMITED` | 429 | Terlalu banyak percobaan; cek `Retry-After` |
| `INTERNAL_ERROR` | 500 | Kesalahan server (tidak membocorkan detail internal) |

## 7. Catatan produksi

- `AUTH_DEV_MODE` tidak diaktifkan di produksi: kode OTP tidak pernah dikembalikan di response. OTP dan token reset dikirim ke WhatsApp pemilik nomor melalui Fonnte. Untuk pengembangan lokal, `.env.local` memakai `AUTH_DEV_MODE="true"` agar `dev_code`/`dev_reset_token` bisa diuji.
- Semua waktu UTC (ISO 8601); tampilkan di zona Asia/Jakarta.
- Data seed mencakup 3 wilayah, 9 organisasi, 8 material, transaksi/ledger, batch, sengketa, agenda.
- Halaman dashboard web masih memakai data contoh untuk beberapa modul; API-nya sudah nyata dan siap dipakai mobile. Penyambungan halaman web ke API adalah pekerjaan terpisah.
