# Audit Aplikasi Mobile (Reverse Engineering APK)

> **Artefak:** `app-release.apk` (22,6 MB, build `app-release`, 13 Nov 2026)
> **Metode:** unzip + ekstraksi `lib/arm64-v8a/libapp.so` (Dart AOT snapshot), pembacaan string table & manifest; tanpa menjalankan aplikasi.
> **Tujuan:** memetakan fitur yang sudah dibuat tim mobile, lalu menyelaraskannya dengan API `/api/v1`.

---

## 1. Identitas teknis

| Item | Temuan |
|---|---|
| Framework | **Flutter** (bukan React Native) — `libflutter.so`, `libapp.so`, `flutter_assets/` |
| Bahasa | Dart (AOT, snapshot di `libapp.so`) |
| Package Dart | `package:pilahyuk` |
| Arsitektur | Provider + service layer (`core/services`), model & provider per domain |
| State management | `providers/`: auth, collection, community, cultural_knowledge, offline, waste_bank |
| Penyimpanan lokal | `local_storage_service.dart` + `pilahyuk_user_balance_v2` |
| **Base URL API** | `https://pilahyuk2.onrender.com/api` (hardcoded) |
| Endpoint yang benar-benar dipanggil | `/materials`, `/collection-requests`, `/waste-bank/transactions/sync` |
| Data | Masih **dummy/local** (belum semua layar memanggil API) |

## 2. Layar yang sudah ada (41 file sumber terdeteksi)

| Grup | Layar | Status fitur |
|---|---|---|
| Auth | `welcome_screen`, `login_screen`, `register_screen`, `forgot_password_screen` | UI lengkap; register 3 langkah + OTP 4 digit |
| Shell | `main_navigation_shell` | Bottom nav (Beranda, Pilah, Komunitas, Jelajah, Profil) |
| Beranda | `home_screen` | Kartu ringkas, jadwal, status pengumpulan |
| Pilah | `pilah_catalog_screen` | Katalog material + harga |
| Pengumpulan | `request_pickup_screen`, `pickup_detail_tracking_screen`, `handover_confirmation_screen` | Ajukan → lacak → serah terima |
| Pengumpul | `collector_tasks_screen` | Daftar tugas pengumpul |
| Komunitas | `community_explore_screen`, `community_management_screen`, `community_challenge_screen` | Jelajah, kelola, tantangan |
| Budaya | `cultural_explore_screen`, `submit_cultural_story_screen` | Arsip + kirim cerita (moderasi kurator) |
| Dampak | `my_impact_screen` | Dampak personal |
| Notifikasi | `notifications_screen` | Daftar notifikasi |
| Profil | `profile_screen` | Profil, peran, pengaturan |
| Bank sampah | `waste_bank_operator_screen`, `offline_outbox_screen`, `savings_book_ledger_screen` | Penimbangan, outbox offline, buku tabungan |
| Traceability | `waste_passport_batch_screen` | Detail batch + timeline |

Komponen bersama: `curved_header`, `custom_button`, `custom_text_field`, `offline_banner`, `status_badge` — sudah ada ikon mata untuk password (`visiblePassword` / `brieflyShowPassword`).

## 3. Alur registrasi yang diharapkan mobile

Dari string UI di APK:

1. **"Daftar Akun Baru (3 Langkah)"**
   - Nama Lengkap — placeholder *"Masukkan nama sesuai KTP"*
   - Nomor WhatsApp / Email
   - Kata Sandi
   - tombol **"Lanjut ke Wilayah"**
2. **Wilayah** — Kecamatan, Kelurahan & RW → **"Lanjut ke Pemilihan Komunitas"**
3. **"Gabung dengan Komunitas?"** — daftar *"Rekomendasi Komunitas Terdekat"* → **"Selesaikan Registrasi"**
4. **Verifikasi Kontak** — *"Kirim Kode Verifikasi WhatsApp"*, input **"Kode OTP (4 Digit)"**
5. Masuk beranda.

API `POST /api/v1/auth/register` sudah menerima seluruh field di atas (`name`, `phone`/`email`, `password`, `district`, `village`, `rw`, `community_id`/`community_name`) dan mengembalikan `next_step: "verify_contact"` + OTP.

## 4. Ketidaksesuaian yang harus diperbaiki tim mobile

| # | Temuan | Dampak | Perbaikan |
|---|---|---|---|
| 1 | Base URL `https://pilahyuk2.onrender.com/api` | Memanggil backend lain (Render), bukan API PilahYuk 2.0 di Vercel | Ganti ke `https://pilahyuk-dashboard.vercel.app/api/v1` |
| 2 | Prefix `/api` bukan `/api/v1` | Semua request 404 jika diarahkan ke API ini | Sesuaikan prefix, atau minta rewrite `/api/*` → `/api/v1/*` |
| 3 | Auth belum benar-benar memanggil API | Login/registrasi tidak membuat token nyata | Pakai endpoint auth di `docs/API.md` |
| 4 | Data layar masih dummy | Perubahan tidak tersimpan | Ganti provider ke `ApiService` |
| 5 | Belum ada header `Authorization`/`Idempotency-Key` | Transaksi tidak sah / bisa duplikat | Tambahkan interceptor token + key per transaksi |
| 6 | OTP disimulasikan di klien (`4821`) | Tidak terverifikasi server | Gunakan `/auth/otp/request` + `/auth/otp/verify` (mode demo mengembalikan `dev_code`) |

## 5. Peta layar mobile → endpoint API

| Layar mobile | Endpoint yang dibutuhkan | Status di API |
|---|---|---|
| Login | `POST /auth/login` | ✅ |
| Register | `POST /auth/register` | ✅ (baru) |
| Verifikasi kontak | `POST /auth/otp/request`, `/auth/otp/verify` | ✅ (baru) |
| Lupa kata sandi | `POST /auth/forgot-password`, `/auth/reset-password` | ✅ (baru) |
| Profil | `GET/PATCH /me` | ✅ |
| Beranda | `GET /me`, `GET /disputes`, `GET /collection-requests?requester_id=` | ✅ |
| Pilah katalog | `GET /materials` | ✅ |
| Ajukan pickup | `POST /collection-requests` | ✅ |
| Lacak pickup | `GET /collection-requests` (belum ada detail per id) | 🟡 |
| Serah terima | `POST /collection-requests/{id}/confirm` | ❌ |
| Tugas pengumpul | `GET /organizations/{id}/tasks` | ❌ |
| Jelajah komunitas | `GET /communities` | ✅ |
| Kelola komunitas | `GET /organizations/{id}/members`, join-requests | ❌ |
| Tantangan | `GET /challenges` | ❌ |
| Arsip budaya | `GET /cultural-contents` | ❌ |
| Kirim cerita budaya | `POST /cultural-contents` | ❌ |
| Dampak personal | `GET /organizations/{id}/impact` | ❌ |
| Notifikasi | `GET /notifications` | ❌ |
| Bank sampah operator | `POST /waste-bank/transactions`, `GET /waste-bank/transactions` | ✅ |
| Buku tabungan | `GET /waste-bank/members/{id}/ledger`, `/balance` | ✅ |
| Outbox offline | `POST /sync/batch` | ✅ |
| Waste passport | `GET /batches`, `GET /batches/{id}/events` | ✅ (detail batch ❌) |

## 6. Rekomendasi urutan integrasi mobile

1. **Auth dulu** — ganti base URL, sambungkan login/register/OTP, simpan token di secure storage.
2. **Pilah + pengumpulan** — `GET /materials`, `POST /collection-requests`, lalu daftar permintaan.
3. **Bank sampah + offline** — `POST /waste-bank/transactions` dengan `Idempotency-Key`, outbox lewat `/sync/batch`.
4. **Profil & dampak** — `GET /me`, lalu endpoint impact setelah dibuat.
5. **Komunitas, budaya, notifikasi** — menunggu endpoint baru (lihat daftar ❌ di atas).

## 7. Catatan metode

- Nama layar & label diambil dari string table `libapp.so` (Dart AOT tidak menyimpan source code utuh, tetapi mempertahankan nama file, nama kelas, dan literal UI).
- Isi `flutter_assets` kosong (tanpa gambar), menandakan UI berbasis teks/ikon Material — konsisten dengan aplikasi versi dummy.
- Tidak ada kode Flutter yang dijalankan; temuan di dokumen ini bersifat statis. Untuk verifikasi perilaku runtime, perlu menjalankan APK di emulator/device.
