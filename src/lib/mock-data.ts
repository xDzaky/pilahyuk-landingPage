// src/lib/mock-data.ts
// Mock data for development — clearly labeled, never used in production

import type {
  User, Organization, Material, CollectionRequest,
  WeighingTransaction, LedgerEntry, MaterialBatch,
  Dispute, AuditLog, Notification, ImpactMetric
} from "@/types/api"

// ---- USERS ----
export const MOCK_USERS: User[] = [
  {
    id: "usr-001",
    name: "Ahmad Fauzan",
    email: "superadmin@pilahyuk.id",
    phone: "081234567890",
    status: "active",
    created_at: "2026-01-01T00:00:00Z",
    roles: [{ organization_id: "sys", organization_name: "PilahYuk System", organization_type: "community", role: "Super Admin", scope: "global", status: "active" }],
  },
  {
    id: "usr-002",
    name: "Siti Rahayu",
    email: "operator@pilahyuk.id",
    phone: "082345678901",
    status: "active",
    created_at: "2026-02-10T00:00:00Z",
    roles: [{ organization_id: "org-002", organization_name: "Bank Sampah Melati", organization_type: "waste_bank", role: "Waste Bank Operator", scope: "org-002", status: "active" }],
  },
  {
    id: "usr-003",
    name: "Budi Santoso",
    email: "pengurus@pilahyuk.id",
    phone: "083456789012",
    status: "active",
    created_at: "2026-02-15T00:00:00Z",
    roles: [{ organization_id: "org-001", organization_name: "Komunitas Hijau RW 05", organization_type: "community", role: "Community Admin", scope: "org-001", status: "active" }],
  },
  {
    id: "usr-004",
    name: "Dewi Lestari",
    email: "dewi@email.com",
    phone: "084567890123",
    status: "active",
    created_at: "2026-03-01T00:00:00Z",
    roles: [{ organization_id: "org-001", organization_name: "Komunitas Hijau RW 05", organization_type: "community", role: "Resident", scope: "org-001", status: "active" }],
  },
  {
    id: "usr-005",
    name: "Reza Pratama",
    email: "reza@email.com",
    phone: "085678901234",
    status: "active",
    created_at: "2026-03-10T00:00:00Z",
    roles: [{ organization_id: "org-001", organization_name: "Komunitas Hijau RW 05", organization_type: "community", role: "Volunteer", scope: "org-001", status: "active" }],
  },
  {
    id: "usr-006",
    name: "Nurul Hidayah",
    email: "nurul@email.com",
    phone: "086789012345",
    status: "active",
    created_at: "2026-04-01T00:00:00Z",
    roles: [{ organization_id: "org-002", organization_name: "Bank Sampah Melati", organization_type: "waste_bank", role: "Resident", scope: "org-002", status: "active" }],
  },
  {
    id: "usr-007",
    name: "Hendra Gunawan",
    email: "hendra@email.com",
    phone: "087890123456",
    status: "active",
    created_at: "2026-04-15T00:00:00Z",
    roles: [{ organization_id: "org-003", organization_name: "Pengolah Mandiri", organization_type: "recycler", role: "Recycler", scope: "org-003", status: "active" }],
  },
]

// ---- ORGANIZATIONS ----
export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: "org-001", name: "Komunitas Hijau RW 05", type: "community", status: "verified", verified_at: "2026-02-01T00:00:00Z", area_name: "Surabaya Timur", member_count: 48, created_at: "2026-01-20T00:00:00Z" },
  { id: "org-002", name: "Bank Sampah Melati", type: "waste_bank", status: "verified", verified_at: "2026-02-05T00:00:00Z", area_name: "Surabaya Timur", member_count: 120, created_at: "2026-01-25T00:00:00Z" },
  { id: "org-003", name: "Pengolah Mandiri Jaya", type: "recycler", status: "verified", verified_at: "2026-03-01T00:00:00Z", area_name: "Surabaya Utara", member_count: 12, created_at: "2026-02-10T00:00:00Z" },
  { id: "org-004", name: "Pengumpul Cepat", type: "collector", status: "verified", verified_at: "2026-03-10T00:00:00Z", area_name: "Surabaya", member_count: 8, created_at: "2026-02-20T00:00:00Z" },
  { id: "org-005", name: "Komunitas Budaya Bahari", type: "community", status: "pending_verification", area_name: "Surabaya Utara", member_count: 23, created_at: "2026-10-01T00:00:00Z" },
  { id: "org-006", name: "Bank Sampah Sejahtera", type: "waste_bank", status: "pending_verification", area_name: "Sidoarjo", member_count: 45, created_at: "2026-10-15T00:00:00Z" },
  { id: "org-007", name: "EcoArtisan Surabaya", type: "artisan", status: "unverified", area_name: "Surabaya Pusat", member_count: 5, created_at: "2026-11-01T00:00:00Z" },
]

// ---- MATERIALS ----
export const MOCK_MATERIALS: Material[] = [
  { id: "mat-001", name: "Plastik PET", category: "plastik_pet", description: "Botol plastik transparan (kode 1)", prep_guide: "Cuci bersih, pisahkan tutup botol, tekan pipih", current_price: 3500, price_valid_from: "2026-11-01T00:00:00Z" },
  { id: "mat-002", name: "Plastik HDPE", category: "plastik_lain", description: "Botol detergen, jerigen (kode 2)", prep_guide: "Cuci bersih dari sisa cairan", current_price: 2000, price_valid_from: "2026-11-01T00:00:00Z" },
  { id: "mat-003", name: "Kertas HVS", category: "kertas", description: "Kertas putih, fotokopi, buku tulis", prep_guide: "Pisahkan dari staples dan klip logam", current_price: 1800, price_valid_from: "2026-11-01T00:00:00Z" },
  { id: "mat-004", name: "Kardus", category: "kardus", description: "Dus kemasan, karton bergelombang", prep_guide: "Lipat rata, pisahkan dari selotip", current_price: 1500, price_valid_from: "2026-11-01T00:00:00Z" },
  { id: "mat-005", name: "Logam Aluminium", category: "logam", description: "Kaleng minuman, foil", prep_guide: "Tekan pipih kaleng, bersihkan sisa minuman", current_price: 12000, price_valid_from: "2026-11-01T00:00:00Z" },
  { id: "mat-006", name: "Organik Basah", category: "organik", description: "Sisa sayur, buah, kulit", prep_guide: "Tiriskan air, masukkan dalam wadah tertutup", current_price: 500, price_valid_from: "2026-11-01T00:00:00Z" },
]

// ---- COLLECTION REQUESTS ----
export const MOCK_COLLECTION_REQUESTS: CollectionRequest[] = [
  {
    id: "col-001", requester_id: "usr-004", requester_name: "Dewi Lestari",
    organization_id: "org-001", method: "individual", area_name: "RW 05 Blok A",
    status: "submitted", requested_at: "2026-11-13T08:00:00Z",
    slot_start: "2026-11-14T09:00:00Z", slot_end: "2026-11-14T11:00:00Z",
    items: [{ material_id: "mat-001", material_name: "Plastik PET", estimated_quantity: 2.5 }, { material_id: "mat-003", material_name: "Kertas HVS", estimated_quantity: 1.2 }],
  },
  {
    id: "col-002", requester_id: "usr-006", requester_name: "Nurul Hidayah",
    organization_id: "org-001", method: "individual", area_name: "RW 05 Blok B",
    status: "assigned", requested_at: "2026-11-12T09:00:00Z",
    slot_start: "2026-11-13T13:00:00Z", slot_end: "2026-11-13T15:00:00Z",
    items: [{ material_id: "mat-004", material_name: "Kardus", estimated_quantity: 5.0 }],
  },
  {
    id: "col-003", requester_id: "usr-005", requester_name: "Reza Pratama",
    organization_id: "org-001", method: "collective", area_name: "RW 05",
    status: "completed", requested_at: "2026-11-10T10:00:00Z",
    slot_start: "2026-11-11T08:00:00Z", slot_end: "2026-11-11T10:00:00Z",
    items: [{ material_id: "mat-001", material_name: "Plastik PET", estimated_quantity: 8.0, actual_quantity: 7.6 }, { material_id: "mat-005", material_name: "Logam Aluminium", estimated_quantity: 1.5, actual_quantity: 1.3 }],
  },
  {
    id: "col-004", requester_id: "usr-004", requester_name: "Dewi Lestari",
    organization_id: "org-001", method: "dropoff", area_name: "Titik Setor RW 05",
    status: "disputed", requested_at: "2026-11-08T11:00:00Z",
    items: [{ material_id: "mat-002", material_name: "Plastik HDPE", estimated_quantity: 3.0, actual_quantity: 1.8 }],
  },
  {
    id: "col-005", requester_id: "usr-006", requester_name: "Nurul Hidayah",
    organization_id: "org-001", method: "individual", area_name: "RW 05 Blok C",
    status: "on_the_way", requested_at: "2026-11-13T07:00:00Z",
    slot_start: "2026-11-13T10:00:00Z", slot_end: "2026-11-13T12:00:00Z",
    items: [{ material_id: "mat-006", material_name: "Organik Basah", estimated_quantity: 3.5 }],
  },
]

// ---- WEIGHING TRANSACTIONS ----
export const MOCK_WEIGHING_TRANSACTIONS: WeighingTransaction[] = [
  {
    id: "wtx-001", organization_id: "org-002", member_id: "usr-004", member_name: "Dewi Lestari",
    operator_id: "usr-002", transaction_at: "2026-11-13T08:30:00Z", status: "confirmed",
    sync_status: "synced", is_offline_created: false,
    items: [
      { material_id: "mat-001", material_name: "Plastik PET", gross: 3.2, tare: 0.3, net: 2.9, price_snapshot: 3500, value: 10150 },
      { material_id: "mat-003", material_name: "Kertas HVS", gross: 1.8, tare: 0.1, net: 1.7, price_snapshot: 1800, value: 3060 },
    ],
    total_net: 4.6, total_value: 13210,
  },
  {
    id: "wtx-002", organization_id: "org-002", member_id: "usr-006", member_name: "Nurul Hidayah",
    operator_id: "usr-002", transaction_at: "2026-11-13T09:15:00Z", status: "confirmed",
    sync_status: "synced", is_offline_created: false,
    items: [
      { material_id: "mat-004", material_name: "Kardus", gross: 7.5, tare: 0.5, net: 7.0, price_snapshot: 1500, value: 10500 },
    ],
    total_net: 7.0, total_value: 10500,
  },
  {
    id: "wtx-003", organization_id: "org-002", member_id: "usr-005", member_name: "Reza Pratama",
    operator_id: "usr-002", transaction_at: "2026-11-13T10:00:00Z", status: "draft",
    sync_status: "pending", is_offline_created: true,
    items: [
      { material_id: "mat-005", material_name: "Logam Aluminium", gross: 2.1, tare: 0.1, net: 2.0, price_snapshot: 12000, value: 24000 },
    ],
    total_net: 2.0, total_value: 24000,
  },
  {
    id: "wtx-004", organization_id: "org-002", member_id: "usr-004", member_name: "Dewi Lestari",
    operator_id: "usr-002", transaction_at: "2026-11-12T14:30:00Z", status: "adjusted",
    sync_status: "synced", is_offline_created: false,
    items: [
      { material_id: "mat-001", material_name: "Plastik PET", gross: 2.0, tare: 0.2, net: 1.8, price_snapshot: 3500, value: 6300 },
    ],
    total_net: 1.8, total_value: 6300,
  },
  {
    id: "wtx-005", organization_id: "org-002", member_id: "usr-006", member_name: "Nurul Hidayah",
    operator_id: "usr-002", transaction_at: "2026-11-13T11:45:00Z", status: "draft",
    sync_status: "pending", is_offline_created: true,
    items: [
      { material_id: "mat-006", material_name: "Organik Basah", gross: 5.0, tare: 0.5, net: 4.5, price_snapshot: 500, value: 2250 },
    ],
    total_net: 4.5, total_value: 2250,
  },
]

// ---- LEDGER ENTRIES ----
export const MOCK_LEDGER: LedgerEntry[] = [
  { id: "led-001", member_id: "usr-004", member_name: "Dewi Lestari", entry_type: "deposit", amount: 13210, balance_after: 13210, created_at: "2026-11-13T08:30:00Z", transaction_id: "wtx-001" },
  { id: "led-002", member_id: "usr-006", member_name: "Nurul Hidayah", entry_type: "deposit", amount: 10500, balance_after: 10500, created_at: "2026-11-13T09:15:00Z", transaction_id: "wtx-002" },
  { id: "led-003", member_id: "usr-004", member_name: "Dewi Lestari", entry_type: "deposit", amount: 6300, balance_after: 19510, created_at: "2026-11-12T14:30:00Z", transaction_id: "wtx-004" },
  { id: "led-004", member_id: "usr-004", member_name: "Dewi Lestari", entry_type: "adjustment", amount: -1200, balance_after: 18310, created_at: "2026-11-12T16:00:00Z", description: "Koreksi dari wtx-004 · harga tidak sesuai", transaction_id: "wtx-004" },
  { id: "led-005", member_id: "usr-005", member_name: "Reza Pratama", entry_type: "deposit", amount: 8750, balance_after: 8750, created_at: "2026-11-11T10:00:00Z" },
]

// ---- MATERIAL BATCHES ----
export const MOCK_BATCHES: MaterialBatch[] = [
  {
    id: "bat-001", code: "PY-20261113-MELATI-001",
    origin_org_id: "org-002", origin_org_name: "Bank Sampah Melati",
    material_id: "mat-001", material_name: "Plastik PET",
    quantity: 42.6, status: "diserahkan", created_at: "2026-11-13T07:00:00Z",
    events: [
      { id: "bev-001", batch_id: "bat-001", event_type: "dikumpulkan", actor_org_name: "Bank Sampah Melati", actor_user_name: "Siti Rahayu", occurred_at: "2026-11-12T14:00:00Z", weight: 42.6 },
      { id: "bev-002", batch_id: "bat-001", event_type: "ditimbang", actor_org_name: "Bank Sampah Melati", actor_user_name: "Siti Rahayu", occurred_at: "2026-11-13T07:00:00Z", weight: 42.6, quality: "A" },
      { id: "bev-003", batch_id: "bat-001", event_type: "diserahkan", actor_org_name: "Bank Sampah Melati", actor_user_name: "Siti Rahayu", occurred_at: "2026-11-13T07:30:00Z" },
    ],
  },
  {
    id: "bat-002", code: "PY-20261112-MELATI-002",
    origin_org_id: "org-002", origin_org_name: "Bank Sampah Melati",
    material_id: "mat-004", material_name: "Kardus",
    quantity: 85.0, status: "menunggu_bukti", created_at: "2026-11-12T08:00:00Z",
    events: [
      { id: "bev-004", batch_id: "bat-002", event_type: "dikumpulkan", actor_org_name: "Bank Sampah Melati", actor_user_name: "Siti Rahayu", occurred_at: "2026-11-11T10:00:00Z", weight: 85.0 },
      { id: "bev-005", batch_id: "bat-002", event_type: "diterima", actor_org_name: "Pengolah Mandiri Jaya", actor_user_name: "Hendra Gunawan", occurred_at: "2026-11-12T09:00:00Z", weight: 83.5, quality: "B" },
    ],
  },
  {
    id: "bat-003", code: "PY-20261110-MELATI-003",
    origin_org_id: "org-002", origin_org_name: "Bank Sampah Melati",
    material_id: "mat-005", material_name: "Logam Aluminium",
    quantity: 15.3, status: "diproses", created_at: "2026-11-10T08:00:00Z",
    events: [
      { id: "bev-006", batch_id: "bat-003", event_type: "dikumpulkan", actor_org_name: "Bank Sampah Melati", actor_user_name: "Siti Rahayu", occurred_at: "2026-11-09T14:00:00Z", weight: 15.3 },
      { id: "bev-007", batch_id: "bat-003", event_type: "diterima", actor_org_name: "Pengolah Mandiri Jaya", actor_user_name: "Hendra Gunawan", occurred_at: "2026-11-10T09:00:00Z", weight: 15.0, quality: "A" },
      { id: "bev-008", batch_id: "bat-003", event_type: "diproses", actor_org_name: "Pengolah Mandiri Jaya", actor_user_name: "Hendra Gunawan", occurred_at: "2026-11-11T14:00:00Z", weight: 14.8, notes: "Dileburkan menjadi ingot aluminium" },
    ],
  },
]

// ---- DISPUTES ----
export const MOCK_DISPUTES: Dispute[] = [
  { id: "dis-001", reporter_id: "usr-004", reporter_name: "Dewi Lestari", related_type: "transaction", related_id: "wtx-004", reason: "Berat tercatat berbeda dengan berat aktual saat penimbangan", category: "berat", status: "open", created_at: "2026-11-12T17:00:00Z" },
  { id: "dis-002", reporter_id: "usr-006", reporter_name: "Nurul Hidayah", related_type: "collection", related_id: "col-004", reason: "Pengumpul mengklaim berat lebih rendah dari yang diserahkan", category: "berat", status: "in_review", assigned_to: "Ahmad Fauzan", created_at: "2026-11-09T10:00:00Z" },
  { id: "dis-003", reporter_id: "usr-005", reporter_name: "Reza Pratama", related_type: "transaction", related_id: "wtx-001", reason: "Harga yang dicatat berbeda dengan harga yang diumumkan", category: "harga", status: "resolved", resolution: "Harga benar sesuai periode berlaku, perbedaan karena material kotor", created_at: "2026-11-05T09:00:00Z", resolved_at: "2026-11-07T11:00:00Z" },
]

// ---- AUDIT LOGS ----
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: "aud-001", actor_id: "usr-002", actor_name: "Siti Rahayu", action: "CREATE", entity_type: "weighing_transaction", entity_id: "wtx-001", after: { status: "confirmed", total_net: 4.6 }, ip: "192.168.1.10", device: "Chrome/Windows", occurred_at: "2026-11-13T08:30:00Z" },
  { id: "aud-002", actor_id: "usr-003", actor_name: "Budi Santoso", action: "APPROVE_MEMBER", entity_type: "organization_member", entity_id: "usr-006", before: { status: "pending" }, after: { status: "active" }, ip: "192.168.1.5", device: "Safari/macOS", occurred_at: "2026-11-13T09:00:00Z" },
  { id: "aud-003", actor_id: "usr-001", actor_name: "Ahmad Fauzan", action: "VERIFY_ORG", entity_type: "organization", entity_id: "org-003", before: { status: "pending_verification" }, after: { status: "verified" }, ip: "10.0.0.1", device: "Firefox/Linux", occurred_at: "2026-11-12T14:00:00Z" },
  { id: "aud-004", actor_id: "usr-002", actor_name: "Siti Rahayu", action: "CREATE_ADJUSTMENT", entity_type: "transaction_adjustment", entity_id: "wtx-004", before: { total_value: 7500 }, after: { total_value: 6300, reason: "Koreksi harga material" }, ip: "192.168.1.10", device: "Chrome/Windows", occurred_at: "2026-11-12T16:00:00Z" },
  { id: "aud-005", actor_id: "usr-001", actor_name: "Ahmad Fauzan", action: "ASSIGN_DISPUTE", entity_type: "dispute", entity_id: "dis-002", before: { status: "open" }, after: { status: "in_review", assigned_to: "Ahmad Fauzan" }, ip: "10.0.0.1", device: "Firefox/Linux", occurred_at: "2026-11-10T09:00:00Z" },
]

// ---- NOTIFICATIONS ----
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "notif-001", type: "join_request", title: "Permintaan bergabung baru", body: "Rendi Kurniawan ingin bergabung ke Komunitas Hijau RW 05", created_at: "2026-11-13T10:30:00Z" },
  { id: "notif-002", type: "sync_conflict", title: "Konflik sinkronisasi", body: "Transaksi wtx-003 mengalami konflik saat sinkronisasi", created_at: "2026-11-13T09:45:00Z" },
  { id: "notif-003", type: "batch_received", title: "Batch diterima", body: "Batch PY-20261112-MELATI-002 sudah diterima pengolah", created_at: "2026-11-12T09:00:00Z", read_at: "2026-11-12T10:00:00Z" },
]

// ---- IMPACT METRICS ----
export const MOCK_IMPACT: ImpactMetric[] = [
  { key: "total_weight", label: "Total Material Terkumpul", value: 342.6, unit: "kg", source: "weighing_transactions", verified: true, method: "sum_net_weight", period: "2026-11-01/2026-11-13" },
  { key: "active_members", label: "Anggota Aktif", value: 87, unit: "orang", source: "organization_members", verified: true, method: "count_active_members", period: "2026-11" },
  { key: "co2_reduction", label: "Estimasi Pengurangan CO2", value: 1024.5, unit: "kg CO2e", source: "external_emission_factor", verified: false, method: "emission_factor_estimate", period: "2026-11-01/2026-11-13" },
  { key: "transactions_count", label: "Transaksi Bank Sampah", value: 48, unit: "transaksi", source: "weighing_transactions", verified: true, method: "count_confirmed", period: "2026-11" },
  { key: "cultural_content", label: "Konten Budaya Tayang", value: 12, unit: "konten", source: "cultural_contents", verified: true, method: "count_approved", period: "2026-11" },
]

// ---- JOIN REQUESTS (pending) ----
export const MOCK_JOIN_REQUESTS = [
  { id: "jr-001", user_id: "usr-new-01", name: "Rendi Kurniawan", submitted_at: "2026-11-13T10:00:00Z", message: "Ingin berkontribusi dalam kegiatan lingkungan" },
  { id: "jr-002", user_id: "usr-new-02", name: "Fitri Amalia", submitted_at: "2026-11-13T08:30:00Z", message: "Sudah lama ingin bergabung komunitas ini" },
  { id: "jr-003", user_id: "usr-new-03", name: "Wahyu Hidayat", submitted_at: "2026-11-12T16:00:00Z", message: "" },
]

// ---- EVENTS ----
export const MOCK_EVENTS = [
  { id: "evt-001", title: "Kerja Bakti RW 05", description: "Bersih-bersih lingkungan bersama", start_at: "2026-11-15T07:00:00Z", location: "Lapangan RW 05", capacity: 50, registered: 38, status: "upcoming" },
  { id: "evt-002", title: "Pelatihan Pemilahan Sampah", description: "Workshop cara memilah yang benar", start_at: "2026-11-18T09:00:00Z", location: "Balai RW 05", capacity: 30, registered: 24, status: "upcoming" },
  { id: "evt-003", title: "Penyerahan Batch Bulanan", description: "Penyerahan batch ke pengolah", start_at: "2026-11-20T08:00:00Z", location: "Gudang Bank Sampah Melati", capacity: 10, registered: 8, status: "upcoming" },
]

// ---- TASKS ----
export const MOCK_TASKS = [
  { id: "tsk-001", title: "Verifikasi laporan dampak bulan Oktober", assignee: "Reza Pratama", pic: "Budi Santoso", due_at: "2026-11-14T17:00:00Z", status: "berjalan", evidence_url: null },
  { id: "tsk-002", title: "Update daftar harga material November", assignee: "Siti Rahayu", pic: "Budi Santoso", due_at: "2026-11-13T12:00:00Z", status: "terlambat", evidence_url: null },
  { id: "tsk-003", title: "Koordinasi jadwal pengumpulan kolektif", assignee: "Reza Pratama", pic: "Budi Santoso", due_at: "2026-11-15T17:00:00Z", status: "belum", evidence_url: null },
  { id: "tsk-004", title: "Dokumentasi kegiatan kerja bakti", assignee: "Dewi Lestari", pic: "Budi Santoso", due_at: "2026-11-11T17:00:00Z", status: "selesai", evidence_url: "/evidence/tsk-004.jpg" },
  { id: "tsk-005", title: "Rekap data anggota baru bulan ini", assignee: "Reza Pratama", pic: "Budi Santoso", due_at: "2026-11-30T17:00:00Z", status: "belum", evidence_url: null },
]

// ---- MATERIAL VOLUME TREND (last 30 days) ----
export const MOCK_VOLUME_TREND = Array.from({ length: 30 }, (_, i) => {
  const date = new Date("2026-10-14")
  date.setDate(date.getDate() + i)
  const isEstimated = i > 25
  return {
    date: date.toISOString().slice(0, 10),
    plastik: isEstimated ? null : Math.floor(Math.random() * 15 + 5),
    kertas: isEstimated ? null : Math.floor(Math.random() * 10 + 3),
    logam: isEstimated ? null : Math.floor(Math.random() * 5 + 1),
    plastik_est: isEstimated ? Math.floor(Math.random() * 15 + 5) : null,
    kertas_est: isEstimated ? Math.floor(Math.random() * 10 + 3) : null,
  }
})

// Summary helper
export function getTodaySummary() {
  const todayTxns = MOCK_WEIGHING_TRANSACTIONS.filter(tx => tx.transaction_at.startsWith("2026-11-13"))
  const totalNet = todayTxns.reduce((s, t) => s + t.total_net, 0)
  const pendingSync = todayTxns.filter(t => t.sync_status === "pending").length
  const confirmedCount = todayTxns.filter(t => t.status === "confirmed").length
  return { totalNet, pendingSync, confirmedCount, totalCount: todayTxns.length }
}

export function getMemberBalance(memberId: string) {
  const entries = MOCK_LEDGER.filter(e => e.member_id === memberId)
  if (entries.length === 0) return 0
  return entries[entries.length - 1].balance_after
}
