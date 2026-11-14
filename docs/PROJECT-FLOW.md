# Alur Project PilahYuk 2.0 — End-to-End

> Disusun dari `PilahYuk_2.0_Dokumentasi_Produk_dan_Teknis.md` (PRD 9.1–9.7), `PilahYuk_Flowchart_BPMN.pdf` (7 proses), dan implementasi aktual di repo ini.
> Tujuan: satu dokumen agar tim mobile, backend, dan operasional punya gambaran alur yang sama.
> Legenda status: ✅ sudah jalan · 🟡 sebagian · ❌ belum ada.

---

## 1. Produk dalam satu paragraf

PilahYuk 2.0 adalah ekosistem sirkular berbasis komunitas. Warga memilah material, mengajukan pengumpulan (individual/kolektif/drop-off), mencatat setoran di bank sampah (termasuk saat offline), lalu material dilacak sebagai **batch** sampai diterima pengolah. Setiap angka dampak harus punya bukti, setiap perubahan tercatat di audit log, dan data pribadi tidak pernah tampil publik.

**Tiga permukaan produk:**

| Permukaan | Pengguna | Kode |
|---|---|---|
| Aplikasi mobile (Flutter) | Warga, relawan, pengumpul, operator lapangan | APK `app-release.apk` |
| Partner Portal (web) | Pengurus komunitas, operator bank sampah, pengolah | `src/app/(portal)` |
| Super Admin (web) | Operator platform PilahYuk | `src/app/(admin)` |
| REST API `/api/v1` | Mobile + portal | `src/app/api/v1` |

## 2. Aktor dan peran

| Aktor | Peran sistem | Pekerjaan utama |
|---|---|---|
| Warga | `resident` | Ajukan pickup, lihat dampak, ikut kegiatan |
| Relawan | `volunteer` | Ambil tugas komunitas, bukti selesai |
| Pengurus komunitas | `pengurus_komunitas` | Setujui anggota, kelola agenda/tugas, konten budaya |
| Operator bank sampah | `operator_bank_sampah` | Timbang, catat transaksi, koreksi, ledger |
| Pengumpul | `collector` | Ambil tugas pickup, serah terima |
| Pengolah/recycler | `recycler` | Validasi batch, unggah bukti pemrosesan |
| Kurator budaya | `curator` | Review konten budaya, izin & akses |
| Super Admin | `super_admin` | Verifikasi mitra, sengketa, audit, konfigurasi |

Izin bersifat **per organisasi** (bukan label global): satu user bisa jadi pengurus di komunitas A dan operator di bank sampah B.

## 3. Prinsip data yang mengikat semua alur

| Prinsip | Implementasi |
|---|---|
| Saldo = `SUM(credit) − SUM(debit)` | `GET /waste-bank/members/{id}/balance` menghitung dari ledger ✅ |
| Harga = snapshot saat transaksi | Server mengisi `price_snapshot` dari harga berlaku ✅ |
| Koreksi tidak menghapus data | `POST /waste-bank/transactions/{id}/adjustments` + `reason` wajib ✅ |
| Sinkronisasi idempoten | `Idempotency-Key` + `POST /sync/batch` per-item key ✅ |
| Konflik tidak last-write-wins | status `conflict` pada `/sync/batch` ✅ |
| Audit append-only | tabel audit_logs + endpoint baca ✅ (penulisan otomatis 🟡) |
| Privasi | batch publik hanya agregat, tanpa nama/alamat warga ✅ (aturan UI) |

---

## 4. Tujuh alur BPMN

### Proses 1 — Onboarding & Membership

**Aktor:** Warga, Pengurus Komunitas.

```text
Buka app → sudah punya akun?
  ├─ Ya  → Login → pilih area & preferensi → ajukan membership → pengurus meninjau
  └─ Tidak → Registrasi akun → verifikasi kontak (OTP) → pilih area & preferensi
                                                   → pilih komunitas (opsional)
                                                   → ajukan membership
Pengurus: tinjau permintaan → setujui (aktif) / tolak (alasan) → status terlihat warga
```

**Data:** `users`, `user_profiles`, `organization_members` (status `pending|active|revoked`).

| Langkah | Status | Bukti |
|---|---|---|
| Registrasi (3 langkah + OTP 4 digit) | ✅ | `POST /auth/register`, `/auth/otp/request`, `/auth/otp/verify` |
| Login email/nomor HP | ✅ | `POST /auth/login` |
| Profil & preferensi | 🟡 | `GET/PATCH /me` (nama, HP, password) |
| Pilih area | 🟡 | field `district/village/rw` saat register |
| Ajukan membership | ❌ | `POST /communities/{id}/join-requests` belum ada |
| Persetujuan pengurus | 🟡 | UI antrean ada, aksi belum persist (mock) |
| Lupa password | ✅ | `/auth/forgot-password`, `/auth/reset-password` |

### Proses 2 — Pilah & Pengumpulan Individual

**Aktor:** Warga, Pengumpul/Mitra.

```text
Warga perlu setor → cari material & aturan lokal → pilih cara setor
  ├─ Jemput: isi detail + pilih slot → kirim permintaan → mitra terima/tolak
  │    diterima → pengumpul ditugaskan → on the way → ditimbang → konfirmasi kedua pihak
  │    berat tidak disetujui → ajukan sengketa
  └─ Antar sendiri → antar ke titik setor → lanjut alur bank sampah
```

**Data:** `collection_requests` (status map), `collection_items`, `collection_assignments`, `handover_records`.

| Langkah | Status | Bukti |
|---|---|---|
| Katalog material + harga | ✅ | `GET /materials` |
| Ajukan pickup | ✅ | `POST /collection-requests` |
| Daftar & filter permintaan | ✅ | `GET /collection-requests` |
| Ubah status (transition map) | 🟡 | peta transisi ada di route, `PATCH /{id}/status` belum |
| Assign pengumpul | ❌ | `POST /{id}/assign` |
| Konfirmasi serah terima | ❌ | `POST /{id}/confirm` |
| Sengketa | ✅ | `POST /disputes` |

### Proses 3 — Pengumpulan Kolektif

**Aktor:** Warga (RW), Pengurus, Bank Sampah.

```text
Jadwal kolektif diumumkan → warga mendaftar/ikut → material dikumpulkan di titik RW
  → ditimbang kolektif → dicatat sebagai transaksi per warga atau agregat komunitas
  → masuk ke ledger / batch
```

| Langkah | Status |
|---|---|
| Agenda/kegiatan | ❌ endpoint events |
| Registrasi kegiatan | ❌ |
| Check-in & timbang kolektif | 🟡 UI pengumpulan masih placeholder |

### Proses 4 — Transaksi Bank Sampah, Offline, dan Koreksi

**Aktor:** Operator bank sampah, Warga (anggota).

```text
Operator buka modul timbang → cari anggota → pilih material (multi item)
  → input bruto & tara → net otomatis → harga berlaku tampil → nilai otomatis
  → [Simpan draft] atau [Konfirmasi]
Konfirmasi → transaksi confirmed → ledger entry (credit) → saldo bertambah
Offline → tersimpan di outbox lokal → koneksi kembali → POST /sync/batch
  ├─ synced  → hapus dari outbox
  ├─ failed  → perbaiki data
  └─ conflict→ tinjau, kirim sebagai penyesuaian
Koreksi → adjustment baru (alasan wajib) → ledger entry koreksi → saldo dihitung ulang
```

| Langkah | Status | Bukti |
|---|---|---|
| Form penimbangan | ✅ | halaman `/bank-sampah` |
| Hitung net & nilai (snapshot) | ✅ | `POST /waste-bank/transactions` |
| Idempotensi transaksi | ✅ | header `Idempotency-Key` |
| Outbox offline | ✅ | `POST /sync/batch` + UI outbox |
| Konflik → diff & penyesuaian | 🟡 | status conflict ada, UI diff belum |
| Ledger & saldo | ✅ | `/members/{id}/ledger`, `/balance` |
| Koreksi | ✅ | `POST /transactions/{id}/adjustments` |
| Laporan harian/bulanan | ✅ | `GET /waste-bank/reports/{period}` |
| Export CSV/PDF | 🟡 | tombol ada, file belum dihasilkan |

### Proses 5 — Jejak Batch Material (Waste Passport)

**Aktor:** Bank Sampah, Pengolah, Super Admin.

```text
Batch dibuat dari transaksi/grup (kode PY-YYYYMMDD-ORG-XXXX)
  → diserahkan ke pengumpul → diterima pengolah → divalidasi (berat, kualitas A/B/C)
  → diproses / dipakai ulang / residu → bukti diunggah → batch selesai
Setiap perpindahan = event pada timeline; data rumah tangga disamarkan.
```

| Langkah | Status | Bukti |
|---|---|---|
| Buat batch + kode publik | ✅ | `POST /batches` |
| Daftar & filter batch | ✅ | `GET /batches` |
| Timeline event | ✅ | `GET/POST /batches/{id}/events` |
| Detail batch per id | ❌ | `GET /batches/{id}` |
| QR / scan | ❌ | token QR belum ada |
| Validasi + bukti pemrosesan | 🟡 | modal UI ada, endpoint bukti belum |
| Halaman passport publik | ❌ | URL contoh ada di mobile, rute belum dibuat |

### Proses 6 — Pengetahuan Budaya

**Aktor:** Kontributor/warga, Kurator komunitas, Super Admin.

```text
Kontributor kirim cerita/praktik → status submitted
Kurator tinjau: setujui / minta revisi / batasi akses / tolak (alasan wajib)
Konten disetujui tayang sesuai access_level (publik / anggota / terbatas / privat)
Pemilik konten bisa menarik konten (withdraw)
```

| Langkah | Status |
|---|---|
| Endpoint cultural-contents | ❌ |
| Halaman arsip & kirim cerita (mobile) | ✅ UI, dummy data |
| Moderasi di admin | 🟡 placeholder |

### Proses 7 — Pemantauan Komunitas & Dampak

**Aktor:** Pengurus, Super Admin, Warga.

```text
Data transaksi & kegiatan → agregasi dampak (kg terverifikasi, partisipasi, konten)
  → ditampilkan dengan label Terverifikasi / Perkiraan + sumber + periode
  → laporan komunitas dibagikan sesuai akses
```

| Langkah | Status |
|---|---|
| Kartu dampak di dashboard | ✅ (mock) |
| Endpoint `GET /organizations/{id}/impact` | ❌ (folder ada, route belum) |
| Flag `verified` per metrik | 🟡 label UI ada, kontrak API belum |
| Laporan/export | 🟡 |

---

## 5. Role → modul yang boleh diakses

| Modul | Warga | Relawan | Pengurus | Operator BS | Pengolah | Super Admin |
|---|---|---|---|---|---|---|
| Dashboard personal / dampak | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ajukan pickup | ✅ | ✅ | ✅ | – | – | – |
| Tugas relawan | – | ✅ | ✅ | – | – | – |
| Kelola anggota & agenda | – | – | ✅ | – | – | ✅ |
| Penimbangan & ledger | – | – | – | ✅ | – | ✅ |
| Validasi batch / passport | Lihat | – | Lihat | ✅ | ✅ | ✅ |
| Verifikasi mitra, sengketa, audit | – | – | – | – | – | ✅ |

---

## 6. Kondisi implementasi saat ini

| Lapisan | Sudah | Belum |
|---|---|---|
| Web portal | 14 halaman (shell, dashboard, bank sampah, batch, dampak, laporan, pengaturan) | Material & Pengumpulan masih placeholder |
| Web admin | Overview, users, organisasi, audit, sengketa, material, konfigurasi | Verifikasi terpusat, moderasi konten, template, roles |
| API | 32 method: auth lengkap, me, communities, materials, collections, waste bank, batches, sync, disputes, admin | Impact, events/tasks, join-requests, cultural, batch detail/QR, notifikasi, disputes PATCH |
| Database | Schema Prisma 37 model + seed | Belum tersambung; semua route masih mock |
| Mobile | 20 layar Flutter (UI + dummy data) | Integrasi API (base URL masih ke backend lama) |

## 7. Urutan pengerjaan yang disarankan

**P0 — agar alur inti bisa didemokan end-to-end**

1. Sambungkan Prisma ke PostgreSQL + migrasi + seed (`docs/API.md` bagian 11).
2. Pindahkan semua route mock → service Prisma.
3. Samakan base URL mobile ke `/api/v1`, sambungkan auth + material + pickup + timbang + sync.
4. `POST /collection-requests/{id}/status|assign|confirm` agar pickup tuntas.
5. `GET /organizations/{id}/impact` dengan flag `verified`.

**P1 — melengkapi ekosistem**

6. Join-requests + approval anggota.
7. Events/tasks komunitas.
8. Batch detail + QR + bukti pemrosesan.
9. Cultural contents + moderasi.
10. Notifikasi.

**P2 — produksi**

11. Rate limit, Sentry, structured logging, OpenAPI.
12. Audit log otomatis untuk semua aksi tulis.
13. Role selector multi-organisasi.

---

## 8. Referensi

- PRD: `PilahYuk_2.0_Dokumentasi_Produk_dan_Teknis.md`
- BPMN: `PilahYuk_Flowchart_BPMN.pdf` (7 proses), prompt: `PilahYuk_Prompt_BPMN.pdf`
- Kontrak API: `docs/API.md`
- Akun demo: `docs/ACCOUNTS.md`
- Audit mobile: `docs/MOBILE-APP-AUDIT.md`
- Audit implementasi prompt: `docs/IMPLEMENTASI-CHECKLIST.md`
