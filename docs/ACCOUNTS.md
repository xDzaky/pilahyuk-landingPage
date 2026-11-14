# Akun Demo & Alur Registrasi — PilahYuk 2.0

> Terakhir diperbarui: 14 November 2026
> Dokumen ini menggantikan kotak "Demo — klik untuk isi otomatis" yang sudah dihapus dari halaman login.

---

## 1. Akun yang tersedia

Semua akun bisa dipakai di **dashboard web** maupun **API** (mobile memakai endpoint yang sama).

| Peran | Nama | Email | Nomor HP | Password | Halaman awal |
|---|---|---|---|---|---|
| Super Admin | Super Admin | `admin@pilahyuk.id` | `081200000001` | `admin123` | `/admin/overview` |
| Operator Bank Sampah | Budi Santoso | `operator@banksampah.id` | `081200000002` | `operator123` | `/dashboard` |
| Pengurus Komunitas | Siti Rahayu | `pengurus@komunitas.id` | `081200000003` | `pengurus123` | `/dashboard` |
| Warga (resident) | Dewi Lestari | `warga@pilahyuk.id` | `081200000004` | `warga123` | `/dampak` |
| Pengumpul (collector) | Joko Prasetyo | `collector@pilahyuk.id` | `081200000007` | `collector123` | `/pengumpulan` |
| Mitra pengolah (recycler) | Hendra Gunawan | `recycler@pilahyuk.id` | `081200000008` | `recycler123` | `/batch` |
| Kurator budaya | Maya Anggraini | `kurator@pilahyuk.id` | `081200000009` | `kurator123` | `/pengetahuan` |

Login menerima **email atau nomor HP** di kolom yang sama:

```bash
# via email
curl -X POST https://pilahyuk-dashboard.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"operator@banksampah.id","password":"operator123"}'

# via nomor HP
curl -X POST https://pilahyuk-dashboard.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"081200000002","password":"operator123"}'
```

> ⚠️ Password di atas hanya untuk demo/pilot. Ganti sebelum dipakai publik.

---

## 2. Registrasi mandiri (self-service)

Pengguna baru **tidak perlu akun bawaan** — bisa daftar sendiri lewat:

- Web: https://pilahyuk-dashboard.vercel.app/register
- Mobile: layar `Register` (3 langkah) → endpoint `POST /api/v1/auth/register`

### 2.1 Input registrasi (urutan sesuai alur mobile)

| Langkah | Field | Wajib | Aturan | Catatan |
|---|---|---|---|---|
| 1 | `name` — Nama Lengkap | ✅ | minimal 3 karakter | "Nama sesuai KTP" |
| 1 | `phone` **atau** `email` | ✅ (salah satu) | phone: `08xxxxxxxxxx` / `+62`; email valid | Mobile memakai "Nomor WhatsApp / Email" satu kolom |
| 1 | `password` — Kata Sandi | ✅ | minimal 8 karakter | Dashboard punya ikon mata untuk lihat password |
| 2 | `district` — Kecamatan | opsional | teks bebas | Dipakai untuk rekomendasi komunitas |
| 2 | `village` — Kelurahan | opsional | teks bebas | |
| 2 | `rw` | opsional | teks bebas | contoh `RW 02` |
| 3 | `community_id` atau `community_name` | opsional | id atau nama komunitas | Bergabung butuh persetujuan pengurus |
| 3 | `role` | opsional | `resident` (default) / `volunteer` | Role lain hanya lewat admin |

### 2.2 Setelah registrasi

```
POST /auth/register
  → 201 { token, user, next_step: "verify_contact", otp: { dev_code } }
  → mobile menyimpan token, lalu tampil layar "Verifikasi Kontak"
POST /auth/otp/verify { phone, code }
  → { verified: true, user }
  → user masuk ke beranda
```

Jika hanya mendaftar dengan email, `otp` bernilai `null` dan `next_step` = `complete_profile`.

### 2.3 Kode OTP

- Panjang **4 digit**, berlaku **5 menit**, maksimal 5 percobaan.
- Di produksi, kode dikirim ke WhatsApp pemilik nomor melalui Fonnte; `dev_code` **tidak** dikembalikan.
- Di lokal (`AUTH_DEV_MODE=true`), kode dikembalikan di `dev_code` untuk pengujian.
- Minta ulang: `POST /api/v1/auth/otp/request { phone }`.

### 2.4 Lupa password

```
POST /auth/forgot-password { identifier }   → selalu 200; di produksi token dikirim via WhatsApp
POST /auth/reset-password { token, password } → 200 jika token valid (15 menit)
# Alternatif mobile: POST /auth/reset-password { identifier, code, password }
```

---

## 3. Akun untuk mobile app

Mobile memakai akun yang sama. Untuk pengujian cepat di HP:

| Skenario | Akun |
|---|---|
| Warga biasa (fitur dampak, pengumpulan, komunitas) | `warga@pilahyuk.id` / `081200000004` / `warga123` |
| Operator bank sampah (penimbangan, ledger, outbox) | `operator@banksampah.id` / `081200000002` / `operator123` |
| Pengurus komunitas (membership, agenda, tugas) | `pengurus@komunitas.id` / `081200000003` / `pengurus123` |

Atau daftar akun baru langsung dari aplikasi.

> Catatan teknis: akun, OTP, refresh token, dan rate limit sekarang disimpan di **PostgreSQL (Neon)** melalui Prisma. Akun hasil registrasi persisten dan dipakai bersama oleh web + mobile.

> Wilayah seed: **Kota Probolinggo (Jawa Timur)**, **Jakarta Selatan**, dan **Kota Bandung**. Akun demo berada di Probolinggo; akun warga Jakarta/Bandung tersedia untuk uji multi-daerah (`rina@example.com` / `asep@example.com`, password `warga123`).

---

## 4. Ringkasan endpoint autentikasi

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/v1/auth/register` | Daftar akun baru |
| POST | `/api/v1/auth/login` | Login (email atau nomor HP) |
| POST | `/api/v1/auth/logout` | Hapus sesi |
| POST | `/api/v1/auth/otp/request` | Kirim kode verifikasi kontak |
| POST | `/api/v1/auth/otp/verify` | Verifikasi kode |
| POST | `/api/v1/auth/forgot-password` | Minta tautan pemulihan |
| POST | `/api/v1/auth/reset-password` | Set kata sandi baru |
| GET/PATCH | `/api/v1/me` | Profil (baca/ubah nama, no. HP, password) |
