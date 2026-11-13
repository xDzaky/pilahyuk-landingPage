// src/types/api.ts
export type ApiResponse<T> = {
  data: T
  meta?: PaginationMeta
  error?: ApiError
}

export type PaginationMeta = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type ApiError = {
  code: string
  message: string
  details?: Record<string, string[]>
}

// ---- ENUMS ----
export type OrgType = "community" | "waste_bank" | "collector" | "recycler" | "artisan" | "school"
export type OrgStatus = "unverified" | "pending_verification" | "verified" | "suspended"
export type MemberStatus = "pending" | "active" | "revoked"
export type CollectionStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "assigned"
  | "on_the_way"
  | "collected"
  | "received"
  | "completed"
  | "cancelled"
  | "disputed"

export type WeighingStatus = "draft" | "confirmed" | "adjusted" | "void"
export type SyncStatus = "pending" | "synced" | "failed" | "conflict"
export type BatchStatus =
  | "dibuat"
  | "diserahkan"
  | "diterima"
  | "ditolak"
  | "diproses"
  | "dipakai_ulang"
  | "residu"
  | "menunggu_bukti"

export type DisputeCategory = "berat" | "harga" | "kualitas" | "layanan" | "konten"
export type DisputeStatus = "open" | "assigned" | "in_review" | "resolved" | "rejected"
export type ContentStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "revised"
  | "restricted"
  | "rejected"
  | "withdrawn"

export type LedgerEntryType = "deposit" | "withdrawal" | "adjustment" | "reversal"
export type MaterialCategory =
  | "plastik_pet"
  | "plastik_lain"
  | "kertas"
  | "kardus"
  | "logam"
  | "kaca"
  | "organik"
  | "b3"
  | "lainnya"

export type TaskStatus = "belum" | "berjalan" | "selesai" | "terlambat"

// ---- ENTITIES ----
export type User = {
  id: string
  name: string
  email?: string
  phone?: string
  status: "active" | "suspended"
  created_at: string
  avatar_url?: string
  roles: UserRole[]
}

export type UserRole = {
  organization_id: string
  organization_name: string
  organization_type: OrgType
  role: string
  scope: string
  status: MemberStatus
}

export type Organization = {
  id: string
  name: string
  type: OrgType
  status: OrgStatus
  verified_at?: string
  area_id?: string
  area_name?: string
  member_count?: number
  created_at: string
}

export type Material = {
  id: string
  name: string
  category: MaterialCategory
  description?: string
  prep_guide?: string
  current_price?: number
  price_valid_from?: string
}

export type CollectionRequest = {
  id: string
  requester_id: string
  requester_name: string
  organization_id: string
  method: "individual" | "collective" | "dropoff"
  area_name?: string
  status: CollectionStatus
  requested_at: string
  slot_start?: string
  slot_end?: string
  notes?: string
  items: CollectionItem[]
}

export type CollectionItem = {
  material_id: string
  material_name: string
  estimated_quantity?: number
  actual_quantity?: number
}

export type WeighingTransaction = {
  id: string
  organization_id: string
  member_id: string
  member_name: string
  operator_id: string
  transaction_at: string
  status: WeighingStatus
  sync_status?: SyncStatus
  device_id?: string
  is_offline_created: boolean
  items: WeighingItem[]
  total_net: number
  total_value: number
}

export type WeighingItem = {
  material_id: string
  material_name: string
  gross: number
  tare: number
  net: number
  price_snapshot: number
  value: number
}

export type LedgerEntry = {
  id: string
  member_id: string
  member_name: string
  entry_type: LedgerEntryType
  amount: number
  balance_after: number
  created_at: string
  description?: string
  transaction_id?: string
  adjustment_id?: string
}

export type MaterialBatch = {
  id: string
  code: string
  origin_org_id: string
  origin_org_name: string
  material_id: string
  material_name: string
  quantity: number
  status: BatchStatus
  created_at: string
  events: BatchEvent[]
}

export type BatchEvent = {
  id: string
  batch_id: string
  event_type: string
  actor_org_name: string
  actor_user_name: string
  occurred_at: string
  weight?: number
  quality?: string
  notes?: string
  evidence_url?: string
}

export type Dispute = {
  id: string
  reporter_id: string
  reporter_name: string
  related_type: "collection" | "transaction" | "batch" | "content" | "user"
  related_id: string
  reason: string
  category: DisputeCategory
  status: DisputeStatus
  assigned_to?: string
  resolution?: string
  created_at: string
  resolved_at?: string
}

export type ImpactMetric = {
  key: string
  label: string
  value: number
  unit: string
  source: string
  verified: boolean
  method: string
  period: string
}

export type AuditLog = {
  id: string
  actor_id: string
  actor_name: string
  action: string
  entity_type: string
  entity_id: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ip?: string
  device?: string
  occurred_at: string
}

export type SyncBatchItem = {
  key: string
  type: string
  payload: Record<string, unknown>
  client_created_at: string
}

export type SyncBatchResponse = {
  key: string
  status: "synced" | "failed" | "conflict"
  server_id?: string
  reason?: string
}

export type Notification = {
  id: string
  type: string
  title: string
  body: string
  read_at?: string
  created_at: string
  payload?: Record<string, unknown>
}
