# Panduan Lengkap Integrasi API — Tim Mobile PilahYuk 2.0 (Flutter)

> **Untuk:** Developer Mobile App (`app-release.apk` / Flutter)  
> **Base URL Produksi:** `https://pilahyuk-dashboard.vercel.app/api/v1`  
> **Base URL Lokal:** `http://localhost:3000/api/v1` (atau IP LAN laptop saat pengujian)  
> **Database:** Live PostgreSQL Neon (Real DB + Persisten)

---

## 1. Aturan Umum & Protokol Komunikasi

1. **Ganti Base URL:**
   - Di APK lama masih hardcoded: `https://pilahyuk2.onrender.com/api`.
   - **WAJIB GANTI KE:** `https://pilahyuk-dashboard.vercel.app/api/v1` (perhatikan prefix `/api/v1`).
2. **Format Response:**
   Semua endpoint mengembalikan standar envelope JSON:
   ```json
   // Sukses:
   {
     "data": { ... } atau [ ... ],
     "meta": { "page": 1, "per_page": 20, "total": 45, "total_pages": 3 } // opsional jika paginasi
   }

   // Gagal:
   {
     "error": {
       "code": "VALIDATION_ERROR",
       "message": "Pesan ramah pengguna dalam Bahasa Indonesia",
       "details": {}
     }
   }
   ```
3. **Header Wajib:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <access_token>` (setelah login untuk semua endpoint privat)
   - `Idempotency-Key: <UUID>` (disarankan pada transaksi keuangan dan sinkronisasi agar tidak duplikat saat koneksi putus-nyambung)
4. **Mata Uang & Satuan:**
   - Uang: **Rupiah Integer** (`56000` = Rp 56.000). Jangan kirim desimal/koma.
   - Berat: **Kilogram Float** (`2.5` = 2,5 kg).
   - Waktu: **ISO-8601 UTC** (`2026-11-14T07:00:00Z`). Di HP Flutter tampilkan dengan waktu lokal (`Asia/Jakarta`).

---

## 2. Akun Demo untuk Testing di Aplikasi Mobile

| Peran | Email | Nomor HP | Password | Peruntukan Layar Mobile |
|---|---|---|---|---|
| **Warga (Resident)** | `warga@pilahyuk.id` | `081200000004` | `warga123` | Beranda, Pilah, Minta Jemput, Buku Tabungan, Dampak, Agenda Gotong Royong |
| **Operator Bank Sampah** | `operator@banksampah.id` | `081200000002` | `operator123` | Penimbangan Timbang Cepat, Tarik Saldo Nasabah, Outbox Offline, Paspor Batch |
| **Pengurus Komunitas** | `pengurus@komunitas.id` | `081200000003` | `pengurus123` | Buat Agenda Gotong Royong, Verifikasi Anggota, Buat Tantangan Pilah |
| **Pengumpul (Collector)** | `collector@pilahyuk.id` | `081200000007` | `collector123` | Daftar Tugas Penjemputan, Navigasi Alamat, Serah Terima Sampah |

*Catatan: Login menerima **email** maupun **nomor HP** di field `identifier` yang sama.*

---

## 3. Peta Layar Flutter & Endpoint yang Harus Dipanggil

### A. Autentikasi & Akun Baru

#### 1. Registrasi 3 Langkah (`register_screen.dart`)
- **Method & Path:** `POST /auth/register`
- **Request Body:**
  ```json
  {
    "name": "Dewi Lestari",
    "phone": "081234567890",
    "password": "password123",
    "email": "dewi@example.com",
    "district": "Mayangan",
    "village": "Sukabumi",
    "rw": "RW 05",
    "area_id": "kel-sukabumi",
    "community_id": "org-comm-prob",
    "role": "resident"
  }
  ```
- **Response 201:**
  ```json
  {
    "data": {
      "token": "eyJ...",
      "refresh_token": "rt_...",
      "next_step": "verify_contact",
      "user": { "id": "usr-...", "name": "Dewi Lestari", "role": "resident" }
    }
  }
  ```

#### 2. Verifikasi Kontak OTP (`register_screen.dart` / Layar OTP)
- **Minta OTP:** `POST /auth/otp/request`  
  `Body: { "phone": "081234567890" }`
- **Verifikasi OTP:** `POST /auth/otp/verify`  
  `Body: { "phone": "081234567890", "code": "4821" }`
  *(Di lokal/staging mode dev mengembalikan `dev_code`, di produksi dikirim ke WhatsApp nasabah)*

#### 3. Login (`login_screen.dart`)
- **Method & Path:** `POST /auth/login`
- **Body:** `{ "identifier": "081200000004", "password": "warga123" }`
- **Simpan:** `token` (access token 8 jam) & `refresh_token` (30 hari) di `FlutterSecureStorage`.

#### 4. Lupa Kata Sandi & Reset Password (`forgot_password_screen.dart` / `reset_password_screen.dart`)
- **Langkah 1 (Minta Kode Pemulihan):** `POST /auth/forgot-password`
  - **Body:** `{ "identifier": "081234567890" }` atau `{ "identifier": "user@example.com" }`
  - **Keterangan:** Kode OTP 4 digit akan dikirimkan ke WhatsApp/Email pengguna (masa berlaku 5 menit).
  - **Response 200:**
    ```json
    {
      "data": {
        "message": "Instruksi pemulihan kata sandi telah dikirimkan.",
        "channel": "whatsapp",
        "expires_in": 300
      }
    }
    ```
- **Langkah 2 (Eksekusi Reset Kata Sandi Baru):** `POST /auth/reset-password`
  - **Body via OTP WhatsApp:**
    ```json
    {
      "identifier": "081234567890",
      "code": "4821",
      "password": "passwordBaru123"
    }
    ```
  - **Body via Reset Token (Link Email/Admin):**
    ```json
    {
      "token": "reset_token_dari_link",
      "password": "passwordBaru123"
    }
    ```
  - **Response 200:**
    ```json
    {
      "data": {
        "message": "Kata sandi berhasil diperbarui. Silakan masuk kembali."
      }
    }
    ```
  - **Keterangan:** Semua sesi login lama akan otomatis dicabut (*revoked*) demi keamanan akun.

#### 4. Refresh Token (Rotasi Otomatis saat 401)
- **Method & Path:** `POST /auth/refresh`
- **Body:** `{ "refresh_token": "rt_..." }`
- **Hasil:** Token baru tanpa perlu user login ulang.

---

### B. Katalog Material & Panduan Pemilahan (`pilah_catalog_screen.dart`)

- **Method & Path:** `GET /materials`
  - Opsional query: `?category=plastik_pet` atau `?q=botol`
- **Keterangan:** Otomatis menampilkan harga beli aktif di bank sampah wilayah tempat tinggal user, lengkap dengan panduan cara membersihkan/memilah (`prep_guide`).
- **Response:**
  ```json
  {
    "data": [
      {
        "id": "mat-pet",
        "name": "Plastik PET (Botol Bening)",
        "category": "plastik_pet",
        "description": "Botol air mineral transparan tanpa label",
        "prep_guide": "Cuci bersih, lepaskan tutup, remukkan",
        "current_price": 3500,
        "price_valid_from": "2026-11-01T00:00:00Z",
        "accepted": true
      }
    ]
  }
  ```

---

### C. Penjemputan Sampah Warga (`request_pickup_screen.dart` & `pickup_detail_tracking_screen.dart`)

#### 1. Warga Ajukan Jemput Sampah
- **Method & Path:** `POST /collection-requests`
- **Body:**
  ```json
  {
    "organization_id": "org-bank-prob",
    "method": "individual",
    "address": "Jl. Ikan Paus No. 12, RT 02/RW 05",
    "slot_start": "2026-11-15T09:00:00Z",
    "slot_end": "2026-11-15T11:00:00Z",
    "items": [
      { "material_id": "mat-pet", "estimated_quantity": 3.5 }
    ]
  }
  ```
- **Status Awal:** `"submitted"`

#### 2. Lacak Permintaan Penjemputan
- **Daftar Milik Sendiri:** `GET /collection-requests`
- **Detail & Status Live:** `GET /collection-requests/{id}`
- **Alur Transisi Status:**
  `submitted` ➔ `confirmed` (bank sampah setuju) ➔ `assigned` (petugas ditunjuk) ➔ `on_the_way` (petugas jalan) ➔ `collected` ➔ `completed`.

#### 3. Konfirmasi Serah Terima (`handover_confirmation_screen.dart`)
- **Method & Path:** `POST /collection-requests/{id}/confirm`
- **Dipanggil oleh:** Petugas pengumpul/collector saat menimbang di rumah warga.
- **Body:**
  ```json
  {
    "items": [
      { "material_id": "mat-pet", "actual_quantity": 3.2 }
    ],
    "notes": "Botol bersih dan kering"
  }
  ```

---

### D. Operasional Bank Sampah & Buku Tabungan

#### 1. Catat Transaksi Timbang (`waste_bank_operator_screen.dart`)
- **Method & Path:** `POST /waste-bank/transactions`
- **Header:** `Idempotency-Key: <UUID>`
- **Body:**
  ```json
  {
    "organization_id": "org-bank-prob",
    "member_id": "usr-warga",
    "items": [
      { "material_id": "mat-pet", "gross": 5.0, "tare": 0.2 },
      { "material_id": "mat-kardus", "gross": 10.0, "tare": 0.5 }
    ],
    "device_id": "android-oppo-a5",
    "is_offline_created": false
  }
  ```
- **Keterangan:** Server otomatis menghitung `net = gross - tare`, mengambil harga snapshot resmi saat itu, dan langsung menambahkan saldo ke buku tabungan nasabah.

#### 2. Buku Tabungan Nasabah (`savings_book_ledger_screen.dart`)
- **Cek Saldo:** `GET /waste-bank/members/{id}/balance`
  - Mengembalikan total saldo integer Rupiah (misal: `Rp 47.000`).
- **Riwayat Buku Tabungan:** `GET /waste-bank/members/{id}/ledger`
  - Mengembalikan daftar mutasi: `deposit` (+), `withdrawal` (-), `adjustment` (+/-).

#### 3. Tarik Saldo / Pencairan Tabungan Nasabah ⭐ *(Fitur Baru)*
- **Method & Path:** `POST /waste-bank/members/{id}/withdrawals`
- **Dipanggil oleh:** Operator bank sampah saat warga mencairkan uangnya.
- **Body:**
  ```json
  {
    "amount": 25000,
    "method": "tunai",
    "notes": "Penarikan tabungan untuk iuran RT"
  }
  ```
- **Hasil:** Saldo nasabah otomatis berkurang, tercatat di mutasi buku tabungan, dan nasabah menerima notifikasi di HP-nya.

#### 4. Atur Harga Beli Material Bank Sampah ⭐ *(Fitur Baru)*
- **Method & Path:** `PUT /organizations/{id}/materials/prices`
- **Dipanggil oleh:** Operator bank sampah untuk update harga beli mereka sendiri.
- **Body:**
  ```json
  {
    "prices": [
      { "material_id": "mat-pet", "price": 4000, "unit": "kg" },
      { "material_id": "mat-kardus", "price": 2700, "unit": "kg" }
    ]
  }
  ```

---

### E. Gotong Royong & Agenda Komunitas (`community_management_screen.dart`) ⭐

*Fitur kebudayaan gotong royong utama untuk BUDAYA GO! 2026:*

#### 1. Lihat Agenda Gotong Royong / Bersih Desa
- **Method & Path:** `GET /organizations/{organization_id}/events`
- **Menampilkan:** Daftar agenda gotong royong (jadwal, tempat, jumlah warga yang mendaftar, status kehadiran diri sendiri).

#### 2. Pengurus Buat Jadwal Gotong Royong
- **Method & Path:** `POST /organizations/{organization_id}/events`
- **Body:**
  ```json
  {
    "title": "Kerja Bakti Bersih Selokan & Pilah Sampah RW 05",
    "description": "Tradisi bersih lingkungan menyambut bulan Ramadhan. Bawa karung sendiri.",
    "start_at": "2026-11-20T06:30:00Z",
    "end_at": "2026-11-20T10:00:00Z",
    "location": "Balai RW 05 Mayangan",
    "capacity": 50
  }
  ```

#### 3. Warga / Relawan Daftar Ikut Kegiatan
- **Method & Path:** `POST /events/{event_id}/registrations`
- **Hasil:** Warga tercatat resmi dalam daftar relawan kegiatan.

#### 4. Presensi Kehadiran di Lokasi (Check-In)
- **Method & Path:** `POST /events/{event_id}/check-in`
- **Hasil:** Status terverifikasi `"attended"` dan jam presensi tercatat otomatis.

---

### F. Tantangan Memilah & Gamifikasi (`community_challenge_screen.dart`) ⭐

- **Daftar Tantangan Aktif:** `GET /challenges`
  - Contoh: *"Tantangan 7 Hari Sedekah Sampah Anorganik"*, *"Zero Plastic Week"*.
- **Gabung Tantangan:** `POST /challenges/{challenge_id}/join`

---

### G. Notifikasi Pengguna (`notifications_screen.dart`) ⭐

- **Ambil Daftar Notifikasi:** `GET /notifications` (opsional `?unread_only=true`)
  - Meta mengembalikan `unread_count` (untuk badge merah di lonceng notifikasi).
- **Tandai 1 Dibaca:** `PATCH /notifications/{id}`
- **Tandai Semua Dibaca:** `POST /notifications/read-all`

---

### H. Mode Offline & Outbox (`offline_outbox_screen.dart`)

Untuk kondisi daerah minim sinyal (timbangan di lapangan):
- Aplikasi menyimpan transaksi di SQLite / Isar lokal.
- Saat kembali dapat sinyal, kirim sekaligus (batch):
- **Method & Path:** `POST /sync/batch`
- **Body:**
  ```json
  {
    "items": [
      {
        "key": "uuid-device-tx-001",
        "type": "weighing_transaction",
        "payload": {
          "organization_id": "org-bank-prob",
          "member_id": "usr-warga",
          "items": [{ "material_id": "mat-pet", "gross": 3.0, "tare": 0.2, "price_snapshot": 3500 }]
        },
        "client_created_at": "2026-11-14T08:00:00Z"
      }
    ]
  }
  ```
- **Hasil:** Tiap item dilaporkan statusnya: `"synced"`, `"failed"`, atau `"conflict"`. Item yang `"synced"` aman dihapus dari outbox lokal.

---

### I. Paspor Jejak Sampah / QR Batch (`waste_passport_batch_screen.dart`)

- **Detail Batch:** `GET /batches/{id}`
- **Timeline Jejak Perjalanan Sampah:** `GET /batches/{id}/events`
- **Data QR Publik:** `GET /batches/{id}/qr`
  - Scan QR di karung sampah untuk melihat riwayat dari pemilahan warga hingga diterima pabrik daur ulang tanpa membocorkan data pribadi.

---

## 4. Checklist untuk Developer Mobile

- [ ] Ganti Base URL ke `https://pilahyuk-dashboard.vercel.app/api/v1`
- [ ] Pasang Interceptor Dio / Http Client untuk menyertakan `Authorization: Bearer <token>`
- [ ] Tangani error code `401` dengan memanggil `POST /auth/refresh`
- [ ] Sambungkan layar `waste_bank_operator_screen` dan `savings_book_ledger_screen` ke endpoint transaksi & saldo riil
- [ ] Sambungkan layar `community_management_screen` ke endpoint `events` (Gotong Royong)
- [ ] Sambungkan layar `notifications_screen` ke endpoint `notifications`
- [ ] Uji alur penarikan saldo nasabah dengan `POST /waste-bank/members/{id}/withdrawals`
