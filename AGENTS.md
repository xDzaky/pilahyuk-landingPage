# PilahYuk 2.0 — API Reference (v1)

Base URL: `https://dashboard.pilahyuk.id/api/v1`  
Auth: Bearer token (JWT, 8 jam) via `Authorization` header atau cookie `pilahyuk_token`

## Response Format
```json
{ "data": ..., "meta": { "total": 0, "page": 1, "per_page": 20 }, "error": { "code": "...", "message": "..." } }
```

---

## Auth

| Method | Path | Deskripsi |
|--------|------|-----------|
| `POST` | `/auth/login` | Login dengan email + password |
| `POST` | `/auth/logout` | Logout (hapus cookie) |
| `GET` | `/me` | Profil pengguna aktif |
| `PATCH` | `/me` | Update nama / no. HP |

**Demo accounts:**
| Email | Password | Role |
|-------|----------|------|
| `admin@pilahyuk.id` | `admin123` | Super Admin |
| `operator@banksampah.id` | `operator123` | Operator Bank Sampah |
| `pengurus@komunitas.id` | `pengurus123` | Pengurus Komunitas |

---

## Communities
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/communities` | Daftar komunitas |
| `GET` | `/organizations/{id}/members` | Anggota organisasi |
| `GET` | `/organizations/{id}/impact` | Dampak lingkungan organisasi |

---

## Materials
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/materials` | Master material + harga |

---

## Collection Requests (Penjemputan)
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/collection-requests` | Daftar permintaan |
| `POST` | `/collection-requests` | Buat permintaan baru |

---

## Waste Bank (Bank Sampah)
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/waste-bank/transactions` | Transaksi timbang |
| `POST` | `/waste-bank/transactions` | Tambah transaksi (idempoten via `idempotency_key`) |
| `POST` | `/waste-bank/transactions/{id}/adjustments` | Koreksi transaksi (tidak hapus asal) |
| `GET` | `/waste-bank/members/{id}/ledger` | Buku tabungan anggota |
| `GET` | `/waste-bank/members/{id}/balance` | Saldo (computed dari ledger SUM) |
| `GET` | `/waste-bank/reports/{period}` | Laporan periode (`2024-11` atau `2024-11-13`) |

---

## Batches (Jejak Batch)
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/batches` | Daftar batch |
| `GET` | `/batches/{id}/events` | Timeline event batch |
| `POST` | `/batches/{id}/events` | Tambah event batch |

---

## Sync (Offline-first)
| Method | Path | Deskripsi |
|--------|------|-----------|
| `POST` | `/sync/batch` | Sinkronisasi batch offline (idempoten, conflict detection) |

---

## Disputes (Sengketa)
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/disputes` | Daftar sengketa |

---

## Admin (Super Admin only — 403 jika bukan super_admin)
| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/admin/organizations` | Semua organisasi |
| `POST` | `/admin/organizations/{id}/verify` | Verifikasi/tolak org |
| `GET` | `/admin/audit-logs` | Jejak audit (append-only) |
| `GET` | `/admin/system/health` | Status layanan |

---

## Error Codes
| Code | HTTP | Deskripsi |
|------|------|-----------|
| `UNAUTHORIZED` | 401 | Token tidak ada atau tidak valid |
| `FORBIDDEN` | 403 | Role tidak punya akses |
| `NOT_FOUND` | 404 | Data tidak ditemukan |
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `CONFLICT` | 409 | Duplikasi / konflik data |
| `INTERNAL_ERROR` | 500 | Error server |

---

## Business Rules (penting!)
1. **Saldo** selalu dihitung dari `SUM(ledger.credit) - SUM(ledger.debit)` — tidak pernah dari field tersimpan
2. **Harga** disimpan sebagai snapshot saat timbang — perubahan harga tidak mempengaruhi transaksi lama
3. **Koreksi** menghasilkan record adjustment baru yang mereferensikan transaksi asal — tidak pernah hapus/edit asal
4. **Audit log** append-only — tidak ada UPDATE atau DELETE
5. **Sync** idempoten — kirim `idempotency_key` yang sama dua kali aman, tidak duplikasi
6. **Privasi** — data individu tidak pernah muncul di tampilan batch/jejak (hanya agregat)
