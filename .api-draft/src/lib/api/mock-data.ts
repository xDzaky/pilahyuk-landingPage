// ============================================================
// PilahYuk 2.0 — Centralised In-Memory Mock Data Store
// ============================================================
import type {
  Organization,
  User,
  Member,
  Material,
  MaterialRule,
  MaterialPrice,
  CollectionRequest,
  WasteBankTransaction,
  LedgerEntry,
  Batch,
  BatchEvent,
  CulturalContent,
  Dispute,
  AuditLog,
  UserRole_,
} from "@/types/api";

// ─── Organizations ────────────────────────────────────────────
export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Komunitas Hijau Kebayoran",
    type: "community",
    status: "active",
    address: "Jl. Kebayoran Lama No. 12",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    lat: -6.2297,
    lng: 106.7903,
    phone: "02121345678",
    email: "hijau@kebayoran.id",
    verified_at: "2024-01-15T07:00:00Z",
    created_at: "2024-01-01T07:00:00Z",
    updated_at: "2024-06-01T07:00:00Z",
  },
  {
    id: "org-002",
    name: "Komunitas Peduli Sampah Depok",
    type: "community",
    status: "active",
    address: "Jl. Margonda Raya No. 45",
    city: "Depok",
    province: "Jawa Barat",
    lat: -6.3728,
    lng: 106.8317,
    phone: "02129876543",
    email: "peduli@sampah-depok.id",
    verified_at: "2024-02-20T07:00:00Z",
    created_at: "2024-02-01T07:00:00Z",
    updated_at: "2024-06-01T07:00:00Z",
  },
  {
    id: "org-003",
    name: "Bank Sampah Sejahtera Mandiri",
    type: "waste_bank",
    status: "active",
    address: "Jl. Pahlawan No. 7",
    city: "Bogor",
    province: "Jawa Barat",
    lat: -6.5971,
    lng: 106.806,
    phone: "02518765432",
    email: "admin@bssm.id",
    verified_at: "2024-01-10T07:00:00Z",
    created_at: "2023-12-01T07:00:00Z",
    updated_at: "2024-06-01T07:00:00Z",
  },
  {
    id: "org-004",
    name: "CV. Angkut Berkah Nusantara",
    type: "collector",
    status: "active",
    address: "Jl. Industri Raya No. 23",
    city: "Tangerang",
    province: "Banten",
    lat: -6.1783,
    lng: 106.6319,
    phone: "02155667788",
    email: "ops@angkut-berkah.id",
    verified_at: "2024-03-05T07:00:00Z",
    created_at: "2024-03-01T07:00:00Z",
    updated_at: "2024-06-01T07:00:00Z",
  },
  {
    id: "org-005",
    name: "PT. Daur Ulang Maju Bersama",
    type: "recycler",
    status: "active",
    address: "Jl. Raya Bekasi KM 25",
    city: "Bekasi",
    province: "Jawa Barat",
    lat: -6.2383,
    lng: 107.0024,
    phone: "02188990011",
    email: "recycle@dumaya.id",
    verified_at: "2024-01-25T07:00:00Z",
    created_at: "2024-01-05T07:00:00Z",
    updated_at: "2024-06-01T07:00:00Z",
  },
];

// ─── Users ────────────────────────────────────────────────────
export const mockUsers: (User & { password_hash: string })[] = [
  { id: "usr-001", name: "Budi Santoso", email: "budi@example.com", phone: "081234567890", avatar_url: null, password_hash: "hashed_password_1", created_at: "2024-01-10T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-002", name: "Sari Dewi", email: "sari@example.com", phone: "081234567891", avatar_url: null, password_hash: "hashed_password_2", created_at: "2024-01-11T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-003", name: "Ahmad Fauzi", email: "ahmad@example.com", phone: "081234567892", avatar_url: null, password_hash: "hashed_password_3", created_at: "2024-01-12T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-004", name: "Rina Marlina", email: "rina@example.com", phone: "081234567893", avatar_url: null, password_hash: "hashed_password_4", created_at: "2024-01-13T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-005", name: "Dian Pratama", email: "dian@example.com", phone: "081234567894", avatar_url: null, password_hash: "hashed_password_5", created_at: "2024-01-14T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-006", name: "Hendra Wijaya", email: "hendra@example.com", phone: "081234567895", avatar_url: null, password_hash: "hashed_password_6", created_at: "2024-01-15T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-007", name: "Yuni Astuti", email: "yuni@example.com", phone: "081234567896", avatar_url: null, password_hash: "hashed_password_7", created_at: "2024-01-16T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-008", name: "Rudi Hermawan", email: "rudi@example.com", phone: "081234567897", avatar_url: null, password_hash: "hashed_password_8", created_at: "2024-01-17T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-009", name: "Nina Suhartini", email: "nina@example.com", phone: "081234567898", avatar_url: null, password_hash: "hashed_password_9", created_at: "2024-01-18T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-010", name: "Agus Purnomo", email: "agus@example.com", phone: "081234567899", avatar_url: null, password_hash: "hashed_password_10", created_at: "2024-01-19T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-011", name: "Fitri Handayani", email: "fitri@example.com", phone: "081234567800", avatar_url: null, password_hash: "hashed_password_11", created_at: "2024-02-01T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-012", name: "Bayu Nugroho", email: "bayu@example.com", phone: "081234567801", avatar_url: null, password_hash: "hashed_password_12", created_at: "2024-02-05T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-013", name: "Lestari Rahayu", email: "lestari@example.com", phone: "081234567802", avatar_url: null, password_hash: "hashed_password_13", created_at: "2024-02-10T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-014", name: "Wahyu Setiawan", email: "wahyu@example.com", phone: "081234567803", avatar_url: null, password_hash: "hashed_password_14", created_at: "2024-02-15T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-015", name: "Endah Susanti", email: "endah@example.com", phone: "081234567804", avatar_url: null, password_hash: "hashed_password_15", created_at: "2024-02-20T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-016", name: "Joko Prayitno", email: "joko@example.com", phone: "081234567805", avatar_url: null, password_hash: "hashed_password_16", created_at: "2024-03-01T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-017", name: "Mega Lestari", email: "mega@example.com", phone: "081234567806", avatar_url: null, password_hash: "hashed_password_17", created_at: "2024-03-05T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-018", name: "Anton Budiman", email: "anton@example.com", phone: "081234567807", avatar_url: null, password_hash: "hashed_password_18", created_at: "2024-03-10T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-019", name: "Widi Astuti", email: "widi@example.com", phone: "081234567808", avatar_url: null, password_hash: "hashed_password_19", created_at: "2024-03-15T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
  { id: "usr-020", name: "Super Admin", email: "admin@pilahyuk.id", phone: "081000000000", avatar_url: null, password_hash: "hashed_admin_password", created_at: "2023-12-01T07:00:00Z", updated_at: "2024-06-01T07:00:00Z" },
];

// ─── User Roles ───────────────────────────────────────────────
export const mockUserRoles: Array<UserRole_ & { user_id: string }> = [
  { user_id: "usr-020", org_id: "system", org_name: "System", role: "super_admin", granted_at: "2023-12-01T07:00:00Z" },
  { user_id: "usr-001", org_id: "org-001", org_name: "Komunitas Hijau Kebayoran", role: "org_admin", granted_at: "2024-01-10T07:00:00Z" },
  { user_id: "usr-002", org_id: "org-001", org_name: "Komunitas Hijau Kebayoran", role: "member", granted_at: "2024-01-11T07:00:00Z" },
  { user_id: "usr-003", org_id: "org-002", org_name: "Komunitas Peduli Sampah Depok", role: "org_admin", granted_at: "2024-02-01T07:00:00Z" },
  { user_id: "usr-004", org_id: "org-003", org_name: "Bank Sampah Sejahtera Mandiri", role: "org_admin", granted_at: "2024-01-10T07:00:00Z" },
  { user_id: "usr-005", org_id: "org-003", org_name: "Bank Sampah Sejahtera Mandiri", role: "weigher", granted_at: "2024-01-14T07:00:00Z" },
  { user_id: "usr-006", org_id: "org-004", org_name: "CV. Angkut Berkah Nusantara", role: "org_admin", granted_at: "2024-03-01T07:00:00Z" },
  { user_id: "usr-007", org_id: "org-004", org_name: "CV. Angkut Berkah Nusantara", role: "collector", granted_at: "2024-03-02T07:00:00Z" },
  { user_id: "usr-008", org_id: "org-005", org_name: "PT. Daur Ulang Maju Bersama", role: "org_admin", granted_at: "2024-01-05T07:00:00Z" },
  { user_id: "usr-001", org_id: "org-003", org_name: "Bank Sampah Sejahtera Mandiri", role: "member", granted_at: "2024-01-15T07:00:00Z" },
  { user_id: "usr-002", org_id: "org-003", org_name: "Bank Sampah Sejahtera Mandiri", role: "member", granted_at: "2024-01-16T07:00:00Z" },
  { user_id: "usr-009", org_id: "org-003", org_name: "Bank Sampah Sejahtera Mandiri", role: "member", granted_at: "2024-01-18T07:00:00Z" },
  { user_id: "usr-010", org_id: "org-003", org_name: "Bank Sampah Sejahtera Mandiri", role: "member", granted_at: "2024-01-19T07:00:00Z" },
];

// ─── Members ──────────────────────────────────────────────────
export const mockMembers: Member[] = mockUserRoles
  .filter(r => r.org_id !== "system")
  .map((r, i) => {
    const user = mockUsers.find(u => u.id === r.user_id)!;
    return {
      id: `mem-${String(i + 1).padStart(3, "0")}`,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar_url: user.avatar_url },
      org_id: r.org_id,
      role: r.role as Member["role"],
      status: "active",
      joined_at: r.granted_at,
    };
  });

// ─── Materials ────────────────────────────────────────────────
export const mockMaterials: Material[] = [
  { id: "mat-001", name: "Plastik PET", category: "plastic", unit: "kg", description: "Botol plastik PET bening dan berwarna", icon_url: null, created_at: "2023-12-01T07:00:00Z" },
  { id: "mat-002", name: "Kertas HVS", category: "paper", unit: "kg", description: "Kertas putih, koran, kardus", icon_url: null, created_at: "2023-12-01T07:00:00Z" },
  { id: "mat-003", name: "Aluminium", category: "metal", unit: "kg", description: "Kaleng minuman, foil aluminium", icon_url: null, created_at: "2023-12-01T07:00:00Z" },
  { id: "mat-004", name: "Besi Tua", category: "metal", unit: "kg", description: "Besi, baja, peralatan logam bekas", icon_url: null, created_at: "2023-12-01T07:00:00Z" },
  { id: "mat-005", name: "Kaca", category: "glass", unit: "kg", description: "Botol kaca, pecahan kaca", icon_url: null, created_at: "2023-12-01T07:00:00Z" },
  { id: "mat-006", name: "Elektronik Bekas", category: "electronic", unit: "kg", description: "HP, komputer, peralatan elektronik bekas", icon_url: null, created_at: "2023-12-01T07:00:00Z" },
];

export const mockMaterialRules: MaterialRule[] = [
  { id: "rule-001", material_id: "mat-001", min_weight_kg: 0.5, max_contamination_pct: 5, preparation_notes: "Cuci bersih, buang tutup dan label" },
  { id: "rule-002", material_id: "mat-002", min_weight_kg: 1.0, max_contamination_pct: 2, preparation_notes: "Kering, bebas dari makanan" },
  { id: "rule-003", material_id: "mat-003", min_weight_kg: 0.2, max_contamination_pct: 1, preparation_notes: "Gepengkan kaleng, bersih dari cairan" },
  { id: "rule-004", material_id: "mat-004", min_weight_kg: 2.0, max_contamination_pct: 10, preparation_notes: "Bebas dari karat berlebihan" },
  { id: "rule-005", material_id: "mat-005", min_weight_kg: 1.0, max_contamination_pct: 0, preparation_notes: "Hati-hati, bungkus rapat sebelum disetor" },
  { id: "rule-006", material_id: "mat-006", min_weight_kg: 0.1, max_contamination_pct: 0, preparation_notes: "Data harus dihapus sebelum disetor" },
];

export const mockMaterialPrices: Array<MaterialPrice & { org_id: string }> = [
  { org_id: "org-003", material_id: "mat-001", material_name: "Plastik PET", price_per_kg: 3500, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-004" },
  { org_id: "org-003", material_id: "mat-002", material_name: "Kertas HVS", price_per_kg: 1500, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-004" },
  { org_id: "org-003", material_id: "mat-003", material_name: "Aluminium", price_per_kg: 15000, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-004" },
  { org_id: "org-003", material_id: "mat-004", material_name: "Besi Tua", price_per_kg: 2500, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-004" },
  { org_id: "org-003", material_id: "mat-005", material_name: "Kaca", price_per_kg: 500, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-004" },
  { org_id: "org-003", material_id: "mat-006", material_name: "Elektronik Bekas", price_per_kg: 25000, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-004" },
  { org_id: "org-005", material_id: "mat-001", material_name: "Plastik PET", price_per_kg: 4000, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-008" },
  { org_id: "org-005", material_id: "mat-003", material_name: "Aluminium", price_per_kg: 17000, effective_from: "2024-06-01T00:00:00Z", updated_by: "usr-008" },
];

// ─── Collection Requests ──────────────────────────────────────
const crStatuses: CollectionRequest["status"][] = ["pending", "assigned", "in_progress", "completed", "cancelled"];
export const mockCollectionRequests: CollectionRequest[] = Array.from({ length: 20 }, (_, i) => {
  const status = crStatuses[i % crStatuses.length];
  return {
    id: `cr-${String(i + 1).padStart(3, "0")}`,
    requester_id: `usr-${String((i % 10) + 1).padStart(3, "0")}`,
    requester_name: mockUsers[i % 10].name,
    org_id: i < 10 ? "org-001" : "org-002",
    status,
    items: [
      { material_id: "mat-001", estimated_weight_kg: 2 + i * 0.3 },
      { material_id: "mat-002", estimated_weight_kg: 1 + i * 0.2 },
    ],
    pickup_address: `Jl. Contoh No. ${i + 1}, Jakarta`,
    pickup_lat: -6.2 - i * 0.01,
    pickup_lng: 106.8 + i * 0.01,
    preferred_time: `2024-07-${String(i + 1).padStart(2, "0")}T09:00:00Z`,
    notes: i % 3 === 0 ? "Mohon datang pagi hari" : null,
    assigned_to: ["assigned", "in_progress", "completed"].includes(status) ? "usr-007" : null,
    assigned_name: ["assigned", "in_progress", "completed"].includes(status) ? "Yuni Astuti" : null,
    confirmed_at: status === "completed" ? `2024-07-${String(i + 1).padStart(2, "0")}T10:00:00Z` : null,
    completed_at: status === "completed" ? `2024-07-${String(i + 1).padStart(2, "0")}T11:00:00Z` : null,
    cancelled_at: status === "cancelled" ? `2024-07-${String(i + 1).padStart(2, "0")}T08:00:00Z` : null,
    cancel_reason: status === "cancelled" ? "Jadwal bentrok" : null,
    created_at: `2024-07-${String(i + 1).padStart(2, "0")}T07:00:00Z`,
    updated_at: `2024-07-${String(i + 1).padStart(2, "0")}T07:00:00Z`,
  };
});

// ─── Waste Bank Transactions ──────────────────────────────────
export const mockWasteBankTransactions: WasteBankTransaction[] = Array.from({ length: 15 }, (_, i) => {
  const items = [
    { material_id: "mat-001", weight_kg: 1.5 + i * 0.1, price_per_kg: 3500, subtotal: (1.5 + i * 0.1) * 3500 },
    { material_id: "mat-002", weight_kg: 0.8 + i * 0.05, price_per_kg: 1500, subtotal: (0.8 + i * 0.05) * 1500 },
  ];
  const totalValue = items.reduce((s, it) => s + it.subtotal, 0);
  return {
    id: `wbt-${String(i + 1).padStart(3, "0")}`,
    member_id: `usr-${String((i % 10) + 1).padStart(3, "0")}`,
    member_name: mockUsers[i % 10].name,
    org_id: "org-003",
    items,
    total_weight_kg: items.reduce((s, it) => s + it.weight_kg, 0),
    total_value: totalValue,
    type: "deposit",
    status: i < 12 ? "confirmed" : "pending",
    notes: i % 4 === 0 ? "Sampah sudah disortir" : null,
    created_by: "usr-005",
    created_at: `2024-07-${String(i + 1).padStart(2, "0")}T08:00:00Z`,
    updated_at: `2024-07-${String(i + 1).padStart(2, "0")}T08:30:00Z`,
  };
});

// ─── Ledger ───────────────────────────────────────────────────
let runningBalance = 0;
export const mockLedgerEntries: LedgerEntry[] = mockWasteBankTransactions
  .filter(t => t.status === "confirmed")
  .map((t, i) => {
    runningBalance += t.total_value;
    return {
      id: `led-${String(i + 1).padStart(3, "0")}`,
      member_id: t.member_id,
      transaction_id: t.id,
      type: "credit",
      amount: t.total_value,
      balance_after: runningBalance,
      description: `Setor sampah — ${t.items.length} jenis`,
      created_at: t.created_at,
    };
  });

// ─── Batches ──────────────────────────────────────────────────
const batchStatuses: Batch["status"][] = ["created", "in_transit", "received", "processed", "rejected"];
export const mockBatches: Batch[] = Array.from({ length: 5 }, (_, i) => {
  const events: BatchEvent[] = [
    { id: `bev-${i * 2 + 1}`, batch_id: `bat-${String(i + 1).padStart(3, "0")}`, type: "created", description: "Batch dibuat", recorded_by: "usr-006", recorded_at: `2024-07-${String(i + 1).padStart(2, "0")}T07:00:00Z` },
  ];
  if (i > 0) events.push({ id: `bev-${i * 2 + 2}`, batch_id: `bat-${String(i + 1).padStart(3, "0")}`, type: "dispatched", description: "Dikirim ke fasilitas daur ulang", location: "Tangerang → Bekasi", recorded_by: "usr-007", recorded_at: `2024-07-${String(i + 1).padStart(2, "0")}T14:00:00Z` });
  return {
    id: `bat-${String(i + 1).padStart(3, "0")}`,
    status: batchStatuses[i],
    items: [
      { material_id: "mat-001", weight_kg: 50 + i * 10, collection_request_ids: [`cr-${String(i * 2 + 1).padStart(3, "0")}`] },
      { material_id: "mat-003", weight_kg: 20 + i * 5, collection_request_ids: [`cr-${String(i * 2 + 2).padStart(3, "0")}`] },
    ],
    origin_org_id: "org-004",
    origin_org_name: "CV. Angkut Berkah Nusantara",
    destination_org_id: "org-005",
    destination_org_name: "PT. Daur Ulang Maju Bersama",
    total_weight_kg: 70 + i * 15,
    notes: i % 2 === 0 ? "Prioritas pengiriman" : null,
    events,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=BATCH-${String(i + 1).padStart(3, "0")}&size=200x200`,
    created_by: "usr-006",
    created_at: `2024-07-${String(i + 1).padStart(2, "0")}T07:00:00Z`,
    updated_at: `2024-07-${String(i + 1).padStart(2, "0")}T14:00:00Z`,
  };
});

// ─── Cultural Content ─────────────────────────────────────────
export const mockCulturalContents: CulturalContent[] = [
  {
    id: "cc-001", title: "Cara Memilah Sampah yang Benar", content_type: "article", status: "published",
    body: "Memilah sampah adalah langkah pertama yang penting...", cover_url: null, tags: ["edukasi", "sampah"],
    author_id: "usr-001", author_name: "Budi Santoso", reviewer_id: "usr-020", reviewer_name: "Super Admin",
    review_note: "Bagus, disetujui", published_at: "2024-06-01T07:00:00Z", created_at: "2024-05-25T07:00:00Z", updated_at: "2024-06-01T07:00:00Z",
  },
  {
    id: "cc-002", title: "Manfaat Bank Sampah bagi Lingkungan", content_type: "article", status: "published",
    body: "Bank sampah memberikan banyak manfaat...", cover_url: null, tags: ["bank-sampah", "lingkungan"],
    author_id: "usr-003", author_name: "Ahmad Fauzi", reviewer_id: "usr-020", reviewer_name: "Super Admin",
    review_note: "Disetujui", published_at: "2024-06-05T07:00:00Z", created_at: "2024-06-01T07:00:00Z", updated_at: "2024-06-05T07:00:00Z",
  },
  {
    id: "cc-003", title: "Video Tutorial: Daur Ulang Plastik", content_type: "video", status: "pending_review",
    body: "Video tutorial cara mendaur ulang plastik di rumah", cover_url: null, tags: ["daur-ulang", "plastik"],
    author_id: "usr-002", author_name: "Sari Dewi", reviewer_id: null, reviewer_name: null,
    review_note: null, published_at: null, created_at: "2024-07-01T07:00:00Z", updated_at: "2024-07-01T07:00:00Z",
  },
];

// ─── Disputes ─────────────────────────────────────────────────
const disputeStatuses: Dispute["status"][] = ["open", "investigating", "resolved", "closed"];
export const mockDisputes: Dispute[] = Array.from({ length: 10 }, (_, i) => ({
  id: `dis-${String(i + 1).padStart(3, "0")}`,
  reporter_id: `usr-${String((i % 10) + 1).padStart(3, "0")}`,
  reporter_name: mockUsers[i % 10].name,
  entity_type: (["collection_request", "waste_bank_transaction", "batch"] as const)[i % 3],
  entity_id: [`cr-00${i + 1}`, `wbt-00${i + 1}`, `bat-00${(i % 5) + 1}`][i % 3],
  status: disputeStatuses[i % 4],
  description: `Terjadi masalah pada transaksi — ${["berat tidak sesuai", "pembayaran kurang", "barang rusak"][i % 3]}`,
  resolution: i % 4 >= 2 ? "Masalah telah diselesaikan melalui mediasi" : null,
  assigned_to: i % 2 === 0 ? "usr-020" : null,
  created_at: `2024-07-${String(i + 1).padStart(2, "0")}T09:00:00Z`,
  updated_at: `2024-07-${String(i + 1).padStart(2, "0")}T09:00:00Z`,
  resolved_at: i % 4 >= 2 ? `2024-07-${String(i + 2).padStart(2, "0")}T14:00:00Z` : null,
}));

// ─── Audit Logs ───────────────────────────────────────────────
const auditActions = [
  "user.login", "user.logout", "user.register", "collection_request.create", "collection_request.assign",
  "collection_request.complete", "collection_request.cancel", "waste_bank.transaction.create",
  "waste_bank.adjustment.create", "batch.create", "batch.dispatch", "dispute.create", "dispute.resolve",
  "org.verify", "content.publish",
];
export const mockAuditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
  id: `aud-${String(i + 1).padStart(3, "0")}`,
  actor_id: `usr-${String((i % 20) + 1).padStart(3, "0")}`,
  actor_name: mockUsers[i % 20].name,
  action: auditActions[i % auditActions.length],
  entity_type: ["user", "collection_request", "waste_bank_transaction", "batch", "dispute"][i % 5],
  entity_id: `entity-${String(i + 1).padStart(3, "0")}`,
  org_id: ["org-001", "org-002", "org-003", "org-004", "org-005", null][i % 6] as string | null,
  ip_address: `192.168.1.${(i % 254) + 1}`,
  user_agent: "Mozilla/5.0 (Linux; Android 12) PilahYuk/2.0",
  details: { result: "success", timestamp: `2024-07-${String((i % 30) + 1).padStart(2, "0")}T${String((i % 24)).padStart(2, "0")}:00:00Z` },
  created_at: `2024-07-${String((i % 30) + 1).padStart(2, "0")}T${String((i % 24)).padStart(2, "0")}:00:00Z`,
}));

// ─── In-Memory Token Store ────────────────────────────────────
export interface TokenRecord {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix ms
}
export const tokenStore: Map<string, TokenRecord> = new Map();
export const refreshTokenIndex: Map<string, string> = new Map(); // refresh_token → access_token

// ─── Idempotency Key Store ────────────────────────────────────
export const idempotencyStore: Map<string, { processed_at: string; response: unknown }> = new Map();

// ─── Rate Limiting Store ──────────────────────────────────────
export interface RateLimitEntry { count: number; window_start: number }
export const rateLimitStore: Map<string, RateLimitEntry> = new Map();

// ─── Mutable state (pushed into on write endpoints) ──────────────────────────
export const collectionRequestsStore: CollectionRequest[] = [...mockCollectionRequests];
export const wasteBankTransactionsStore: WasteBankTransaction[] = [...mockWasteBankTransactions];
export const ledgerStore: LedgerEntry[] = [...mockLedgerEntries];
export const batchesStore: Batch[] = [...mockBatches];
export const culturalContentsStore: CulturalContent[] = [...mockCulturalContents];
export const disputesStore: Dispute[] = [...mockDisputes];
export const auditLogsStore: AuditLog[] = [...mockAuditLogs];
export const usersStore: (User & { password_hash: string })[] = [...mockUsers];
export const membersStore: Member[] = [...mockMembers];
export const materialPricesStore: Array<MaterialPrice & { org_id: string }> = [...mockMaterialPrices];
export const userRolesStore: Array<UserRole_ & { user_id: string }> = [...mockUserRoles];
