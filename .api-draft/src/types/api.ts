// ============================================================
// PilahYuk 2.0 — API TypeScript Types
// ============================================================

// ─── Shared / Envelope ───────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginationQuery {
  page?: number;
  per_page?: number;
}

// ─── Enums ────────────────────────────────────────────────────
export type OrgType = "community" | "waste_bank" | "collector" | "recycler";
export type OrgStatus = "active" | "inactive" | "pending_verification";

export type UserRole =
  | "super_admin"
  | "org_admin"
  | "collector"
  | "weigher"
  | "member"
  | "viewer";

export type CollectionStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type BatchStatus =
  | "created"
  | "in_transit"
  | "received"
  | "processed"
  | "rejected";

export type DisputeStatus = "open" | "investigating" | "resolved" | "closed";

export type MaterialCategory =
  | "plastic"
  | "paper"
  | "metal"
  | "glass"
  | "organic"
  | "electronic";

export type TransactionType = "deposit" | "withdrawal" | "adjustment";
export type LedgerEntryType = "credit" | "debit";

export type ContentType = "article" | "video" | "infographic";
export type ContentStatus = "draft" | "pending_review" | "published" | "rejected";

export type SyncStatus = "synced" | "failed" | "conflict";

// ─── Organization ─────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  type: OrgType;
  status: OrgStatus;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── User / Auth ──────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole_ {
  org_id: string;
  org_name: string;
  role: UserRole;
  granted_at: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  idempotency_key?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: "Bearer";
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UpdateMeRequest {
  name?: string;
  phone?: string;
  avatar_url?: string;
}

// ─── Community / Members ─────────────────────────────────────
export interface Member {
  id: string;
  user: Pick<User, "id" | "name" | "email" | "phone" | "avatar_url">;
  org_id: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  joined_at: string;
}

export interface JoinRequestPayload {
  message?: string;
  idempotency_key?: string;
}

export interface UpdateMemberRequest {
  role?: UserRole;
  status?: "active" | "inactive" | "suspended";
}

// ─── Materials ────────────────────────────────────────────────
export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  description: string;
  icon_url: string | null;
  created_at: string;
}

export interface MaterialRule {
  id: string;
  material_id: string;
  min_weight_kg: number;
  max_contamination_pct: number;
  preparation_notes: string;
}

export interface MaterialPrice {
  material_id: string;
  material_name: string;
  price_per_kg: number;
  effective_from: string;
  updated_by: string;
}

export interface UpdateMaterialPriceRequest {
  price_per_kg: number;
  effective_from?: string;
}

// ─── Collection Requests ─────────────────────────────────────
export interface CollectionItem {
  material_id: string;
  estimated_weight_kg: number;
}

export interface CreateCollectionRequest {
  items: CollectionItem[];
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  preferred_time: string;
  notes?: string;
  idempotency_key?: string;
}

export interface CollectionRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  org_id: string | null;
  status: CollectionStatus;
  items: CollectionItem[];
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  preferred_time: string;
  notes: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCollectionStatusRequest {
  status: CollectionStatus;
  reason?: string;
}

export interface AssignCollectionRequest {
  collector_id: string;
}

export interface ConfirmCollectionRequest {
  actual_items: Array<{
    material_id: string;
    actual_weight_kg: number;
  }>;
  notes?: string;
}

export interface CancelCollectionRequest {
  reason: string;
}

// ─── Waste Bank Transactions ─────────────────────────────────
export interface WasteBankTransactionItem {
  material_id: string;
  weight_kg: number;
  price_per_kg: number;
  subtotal: number;
}

export interface CreateWasteBankTransactionRequest {
  member_id: string;
  items: WasteBankTransactionItem[];
  notes?: string;
  idempotency_key?: string;
}

export interface WasteBankTransaction {
  id: string;
  member_id: string;
  member_name: string;
  org_id: string;
  items: WasteBankTransactionItem[];
  total_weight_kg: number;
  total_value: number;
  type: TransactionType;
  status: "pending" | "confirmed" | "voided";
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  member_id: string;
  transaction_id: string | null;
  type: LedgerEntryType;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface MemberBalance {
  member_id: string;
  member_name: string;
  balance: number;
  last_transaction_at: string | null;
}

export interface AdjustmentRequest {
  amount: number;
  reason: string;
  idempotency_key?: string;
}

export interface DailyReport {
  date: string;
  total_transactions: number;
  total_weight_kg: number;
  total_value: number;
  members_served: number;
  materials: Array<{
    material_id: string;
    material_name: string;
    weight_kg: number;
    value: number;
  }>;
}

export interface MonthlyReport {
  year: number;
  month: number;
  total_transactions: number;
  total_weight_kg: number;
  total_value: number;
  total_members: number;
  daily_breakdown: Array<{
    date: string;
    weight_kg: number;
    value: number;
  }>;
}

// ─── Sync ─────────────────────────────────────────────────────
export interface SyncItem {
  key: string;
  entity_type: "collection_request" | "waste_bank_transaction" | "batch_event";
  entity_id?: string;
  operation: "create" | "update";
  payload: Record<string, unknown>;
  client_updated_at: string;
}

export interface SyncBatchRequest {
  items: SyncItem[];
  idempotency_key: string;
}

export interface SyncItemResult {
  key: string;
  status: SyncStatus;
  server_id?: string;
  reason?: string;
}

export interface SyncBatchResponse {
  results: SyncItemResult[];
  processed_at: string;
}

// ─── Batches ──────────────────────────────────────────────────
export interface BatchItem {
  material_id: string;
  weight_kg: number;
  collection_request_ids: string[];
}

export interface CreateBatchRequest {
  items: BatchItem[];
  origin_org_id: string;
  destination_org_id: string;
  notes?: string;
  idempotency_key?: string;
}

export interface Batch {
  id: string;
  status: BatchStatus;
  items: BatchItem[];
  origin_org_id: string;
  origin_org_name: string;
  destination_org_id: string;
  destination_org_name: string;
  total_weight_kg: number;
  notes: string | null;
  events: BatchEvent[];
  qr_code_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BatchEvent {
  id: string;
  batch_id: string;
  type: "created" | "dispatched" | "received" | "processed" | "rejected";
  description: string;
  location?: string;
  recorded_by: string;
  recorded_at: string;
}

export interface CreateBatchEventRequest {
  type: BatchEvent["type"];
  description: string;
  location?: string;
}

// ─── Cultural Contents ────────────────────────────────────────
export interface CulturalContent {
  id: string;
  title: string;
  content_type: ContentType;
  status: ContentStatus;
  body: string;
  cover_url: string | null;
  tags: string[];
  author_id: string;
  author_name: string;
  reviewer_id: string | null;
  reviewer_name: string | null;
  review_note: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCulturalContentRequest {
  title: string;
  content_type: ContentType;
  body: string;
  cover_url?: string;
  tags?: string[];
  idempotency_key?: string;
}

export interface UpdateCulturalContentRequest {
  title?: string;
  body?: string;
  cover_url?: string;
  tags?: string[];
}

export interface ReviewCulturalContentRequest {
  action: "approve" | "reject";
  note?: string;
}

// ─── Impact ───────────────────────────────────────────────────
export interface OrgImpact {
  org_id: string;
  org_name: string;
  period_start: string;
  period_end: string;
  total_weight_kg: number;
  co2_saved_kg: number;
  trees_equivalent: number;
  water_saved_liters: number;
  members_active: number;
  collection_requests_completed: number;
  by_material: Array<{
    material_id: string;
    material_name: string;
    weight_kg: number;
    co2_saved_kg: number;
  }>;
}

// ─── Disputes ─────────────────────────────────────────────────
export interface Dispute {
  id: string;
  reporter_id: string;
  reporter_name: string;
  entity_type: "collection_request" | "waste_bank_transaction" | "batch";
  entity_id: string;
  status: DisputeStatus;
  description: string;
  resolution: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface CreateDisputeRequest {
  entity_type: Dispute["entity_type"];
  entity_id: string;
  description: string;
  idempotency_key?: string;
}

export interface UpdateDisputeRequest {
  status?: DisputeStatus;
  resolution?: string;
  assigned_to?: string;
}

// ─── Audit Log ────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  org_id: string | null;
  ip_address: string;
  user_agent: string;
  details: Record<string, unknown>;
  created_at: string;
}

// ─── Admin ────────────────────────────────────────────────────
export interface VerifyOrgRequest {
  verified: boolean;
  note?: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  version: string;
  uptime_seconds: number;
  services: Array<{
    name: string;
    status: "healthy" | "degraded" | "down";
    latency_ms?: number;
  }>;
  checked_at: string;
}
