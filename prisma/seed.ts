// prisma/seed.ts — Data nyata multi-daerah (Probolinggo, Jakarta, Bandung)
// Idempoten: aman dijalankan berulang. Password di-hash bcrypt.
import { PrismaClient, type Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const hash = (password: string) => bcrypt.hashSync(password, 10)

const ROLES = [
  "Guest", "Resident", "Volunteer", "Community Admin",
  "Waste Bank Operator", "Collector", "Recycler",
  "Cultural Curator", "Artisan", "Educator", "Super Admin",
] as const

async function main() {
  console.log("🌱 Seeding PilahYuk — real data")

  // ── ROLES & PERMISSIONS ────────────────────────────────────────────────
  const roles: Record<string, string> = {}
  for (const name of ROLES) {
    const role = await prisma.role.upsert({ where: { name }, create: { name }, update: {} })
    roles[name] = role.id
  }

  const permissions = [
    ["org.verify", "Super Admin"],
    ["weighing.create", "Waste Bank Operator"],
    ["weighing.create", "Super Admin"],
    ["member.approve", "Community Admin"],
    ["event.create", "Community Admin"],
    ["ledger.view_all", "Waste Bank Operator"],
    ["cultural.review", "Cultural Curator"],
    ["admin.access", "Super Admin"],
  ]
  for (const [key, roleName] of permissions) {
    await prisma.permission.upsert({
      where: {
        role_id_permission_key_scope: {
          role_id: roles[roleName],
          permission_key: key,
          scope: "global",
        },
      },
      create: { role_id: roles[roleName], permission_key: key, scope: "global" },
      update: {},
    })
  }

  // ── AREAS (hierarki wilayah) ───────────────────────────────────────────
  const area = async (id: string, name: string, parent_id: string | null = null) =>
    prisma.area.upsert({ where: { id }, create: { id, name, parent_id }, update: { name, parent_id } })

  await area("prov-jatim", "Jawa Timur")
  await area("city-prob", "Kota Probolinggo", "prov-jatim")
  await area("kec-mayangan", "Kecamatan Mayangan", "city-prob")
  await area("kel-sukabumi", "Kelurahan Sukabumi", "kec-mayangan")
  await area("kec-kanigaran", "Kecamatan Kanigaran", "city-prob")
  await area("kel-tisnonegaran", "Kelurahan Tisnonegaran", "kec-kanigaran")

  await area("prov-dki", "DKI Jakarta")
  await area("city-jkt", "Jakarta Selatan", "prov-dki")
  await area("kec-cilandak", "Kecamatan Cilandak", "city-jkt")
  await area("kel-cilandak", "Kelurahan Cilandak Barat", "kec-cilandak")

  await area("prov-jabar", "Jawa Barat")
  await area("city-bdg", "Kota Bandung", "prov-jabar")
  await area("kec-coblong", "Kecamatan Coblong", "city-bdg")
  await area("kel-dago", "Kelurahan Dago", "kec-coblong")

  // ── ORGANISASI ─────────────────────────────────────────────────────────
  const org = async (
    id: string,
    name: string,
    type: "community" | "waste_bank" | "collector" | "recycler" | "artisan" | "school",
    area_id: string,
    status: "verified" | "pending_verification" = "verified",
  ) =>
    prisma.organization.upsert({
      where: { id },
      create: {
        id, name, type, area_id, status,
        verified_at: status === "verified" ? new Date("2026-02-01T00:00:00Z") : null,
        status_changed_at: new Date("2026-02-01T00:00:00Z"),
      },
      update: { name, type, area_id, status },
    })

  await org("org-comm-prob", "Komunitas Pilah Probolinggo", "community", "kel-sukabumi")
  await org("org-bank-prob", "Bank Sampah Mayangan", "waste_bank", "kel-sukabumi")
  await org("org-collector-prob", "Pengumpul Mayangan", "collector", "kel-sukabumi")
  await org("org-recycler-prob", "Pengolah Mandiri Probolinggo", "recycler", "kel-tisnonegaran")

  await org("org-comm-jkt", "Komunitas Hijau Cilandak", "community", "kel-cilandak")
  await org("org-bank-jkt", "Bank Sampah Melati Cilandak", "waste_bank", "kel-cilandak")

  await org("org-comm-bdg", "Komunitas Dago Bersih", "community", "kel-dago")
  await org("org-bank-bdg", "Bank Sampah Dago", "waste_bank", "kel-dago")

  await org("org-comm-pending", "Komunitas Baru Tisnonegaran", "community", "kel-tisnonegaran", "pending_verification")

  // ── USERS ──────────────────────────────────────────────────────────────
  type SeedUser = {
    id: string; name: string; email: string; phone: string; password: string
    role: string; org_id: string | null; area_id: string
    district: string; village: string; rw: string
  }
  const users: SeedUser[] = [
    { id: "usr-admin", name: "Super Admin", email: "admin@pilahyuk.id", phone: "081200000001", password: "admin123", role: "super_admin", org_id: null, area_id: "kel-sukabumi", district: "Mayangan", village: "Sukabumi", rw: "RW 01" },
    { id: "usr-operator", name: "Budi Santoso", email: "operator@banksampah.id", phone: "081200000002", password: "operator123", role: "operator_bank_sampah", org_id: "org-bank-prob", area_id: "kel-sukabumi", district: "Mayangan", village: "Sukabumi", rw: "RW 02" },
    { id: "usr-pengurus", name: "Siti Rahayu", email: "pengurus@komunitas.id", phone: "081200000003", password: "pengurus123", role: "pengurus_komunitas", org_id: "org-comm-prob", area_id: "kel-sukabumi", district: "Mayangan", village: "Sukabumi", rw: "RW 03" },
    { id: "usr-warga", name: "Dewi Lestari", email: "warga@pilahyuk.id", phone: "081200000004", password: "warga123", role: "resident", org_id: "org-comm-prob", area_id: "kel-sukabumi", district: "Mayangan", village: "Sukabumi", rw: "RW 05" },
    { id: "usr-warga-jkt", name: "Rina Kartika", email: "rina@example.com", phone: "081200000005", password: "warga123", role: "resident", org_id: "org-comm-jkt", area_id: "kel-cilandak", district: "Cilandak", village: "Cilandak Barat", rw: "RW 04" },
    { id: "usr-warga-bdg", name: "Asep Sunandar", email: "asep@example.com", phone: "081200000006", password: "warga123", role: "resident", org_id: "org-comm-bdg", area_id: "kel-dago", district: "Coblong", village: "Dago", rw: "RW 02" },
    { id: "usr-collector", name: "Joko Prasetyo", email: "collector@pilahyuk.id", phone: "081200000007", password: "collector123", role: "collector", org_id: "org-collector-prob", area_id: "kel-sukabumi", district: "Mayangan", village: "Sukabumi", rw: "RW 02" },
    { id: "usr-recycler", name: "Hendra Gunawan", email: "recycler@pilahyuk.id", phone: "081200000008", password: "recycler123", role: "recycler", org_id: "org-recycler-prob", area_id: "kel-tisnonegaran", district: "Kanigaran", village: "Tisnonegaran", rw: "RW 01" },
    { id: "usr-curator", name: "Maya Anggraini", email: "kurator@pilahyuk.id", phone: "081200000009", password: "kurator123", role: "curator", org_id: "org-comm-prob", area_id: "kel-sukabumi", district: "Mayangan", village: "Sukabumi", rw: "RW 03" },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id: u.id, name: u.name, email: u.email, phone: u.phone,
        password_hash: hash(u.password), role: u.role, org_id: u.org_id, status: "active",
        contact_verified: true,
      },
      update: {
        name: u.name, phone: u.phone, role: u.role, org_id: u.org_id,
        password_hash: hash(u.password), status: "active", contact_verified: true,
      },
    })
    await prisma.userProfile.upsert({
      where: { user_id: u.id },
      create: { user_id: u.id, area_id: u.area_id, district: u.district, village: u.village, rw: u.rw },
      update: { area_id: u.area_id, district: u.district, village: u.village, rw: u.rw },
    })
  }

  // ── KEANGGOTAAN ORGANISASI ─────────────────────────────────────────────
  const memberships: Array<[string, string, string, keyof typeof roles]> = [
    ["mem-operator", "org-bank-prob", "usr-operator", "Waste Bank Operator"],
    ["mem-pengurus", "org-comm-prob", "usr-pengurus", "Community Admin"],
    ["mem-warga", "org-comm-prob", "usr-warga", "Resident"],
    ["mem-warga-jkt", "org-comm-jkt", "usr-warga-jkt", "Resident"],
    ["mem-warga-bdg", "org-comm-bdg", "usr-warga-bdg", "Resident"],
    ["mem-collector", "org-collector-prob", "usr-collector", "Collector"],
    ["mem-recycler", "org-recycler-prob", "usr-recycler", "Recycler"],
    ["mem-curator", "org-comm-prob", "usr-curator", "Cultural Curator"],
  ]
  for (const [id, organization_id, user_id, roleName] of memberships) {
    await prisma.organizationMember.upsert({
      where: { id },
      create: { id, organization_id, user_id, role_id: roles[roleName], status: "active", joined_at: new Date("2026-03-01T00:00:00Z") },
      update: { organization_id, user_id, role_id: roles[roleName], status: "active", joined_at: new Date("2026-03-01T00:00:00Z") },
    })
  }

  // ── MATERIAL & HARGA ───────────────────────────────────────────────────
  const materials: Array<[string, string, Prisma.MaterialCreateInput["category"]]> = [
    ["mat-pet", "Plastik PET", "plastik_pet"],
    ["mat-hdpe", "Plastik HDPE", "plastik_lain"],
    ["mat-hvs", "Kertas HVS", "kertas"],
    ["mat-kardus", "Kardus", "kardus"],
    ["mat-alum", "Logam Aluminium", "logam"],
    ["mat-kaca", "Kaca", "kaca"],
    ["mat-organik", "Organik", "organik"],
    ["mat-b3", "B3 / Elektronik", "b3"],
  ]
  for (const [id, name, category] of materials) {
    await prisma.material.upsert({
      where: { id },
      create: { id, name, category, prep_guide: "Bersihkan, keringkan, dan pisahkan sesuai jenis." },
      update: { name, category },
    })
  }

  const prices: Array<[string, string, string, number]> = [
    ["price-prob-pet", "org-bank-prob", "mat-pet", 3500],
    ["price-prob-hdpe", "org-bank-prob", "mat-hdpe", 4200],
    ["price-prob-hvs", "org-bank-prob", "mat-hvs", 1800],
    ["price-prob-kardus", "org-bank-prob", "mat-kardus", 1500],
    ["price-prob-alum", "org-bank-prob", "mat-alum", 12000],
    ["price-prob-kaca", "org-bank-prob", "mat-kaca", 500],
    ["price-prob-organik", "org-bank-prob", "mat-organik", 300],
    ["price-jkt-pet", "org-bank-jkt", "mat-pet", 3600],
    ["price-jkt-hvs", "org-bank-jkt", "mat-hvs", 1900],
    ["price-jkt-kardus", "org-bank-jkt", "mat-kardus", 1600],
    ["price-bdg-pet", "org-bank-bdg", "mat-pet", 3400],
    ["price-bdg-kardus", "org-bank-bdg", "mat-kardus", 1550],
  ]
  for (const [id, organization_id, material_id, price] of prices) {
    await prisma.materialPrice.upsert({
      where: { id },
      create: { id, organization_id, material_id, price, valid_from: new Date("2026-01-01T00:00:00Z") },
      update: { price, valid_from: new Date("2026-01-01T00:00:00Z") },
    })
    await prisma.materialRule.upsert({
      where: { id: `rule-${id}` },
      create: { id: `rule-${id}`, organization_id, material_id, accepted: true, conditions: "Bersih dan kering.", valid_from: new Date("2026-01-01T00:00:00Z") },
      update: { accepted: true },
    })
  }

  // ── ANGGOTA BANK SAMPAH ────────────────────────────────────────────────
  const wbMembers: Array<[string, string, string, string]> = [
    ["wbm-prob-warga", "org-bank-prob", "usr-warga", "PY-PROB-0001"],
    ["wbm-jkt-rina", "org-bank-jkt", "usr-warga-jkt", "PY-JKT-0001"],
    ["wbm-bdg-asep", "org-bank-bdg", "usr-warga-bdg", "PY-BDG-0001"],
  ]
  for (const [id, organization_id, user_id, member_code] of wbMembers) {
    await prisma.wasteBankMember.upsert({
      where: { id },
      create: { id, organization_id, user_id, member_code, status: "active" },
      update: { member_code, status: "active" },
    })
  }

  // ── TRANSAKSI TIMBANG + LEDGER ─────────────────────────────────────────
  type SeedTxn = {
    id: string; organization_id: string; member_id: string; operator_id: string
    transaction_at: string; items: Array<{ material_id: string; gross: number; tare: number; price: number }>
    withdrawal?: number
  }
  const txns: SeedTxn[] = [
    {
      id: "trx-prob-001", organization_id: "org-bank-prob", member_id: "usr-warga", operator_id: "usr-operator",
      transaction_at: "2026-11-10T08:30:00Z",
      items: [
        { material_id: "mat-pet", gross: 3.2, tare: 0.3, price: 3500 },
        { material_id: "mat-hvs", gross: 1.8, tare: 0.1, price: 1800 },
      ],
    },
    {
      id: "trx-prob-002", organization_id: "org-bank-prob", member_id: "usr-warga", operator_id: "usr-operator",
      transaction_at: "2026-11-12T09:15:00Z",
      items: [{ material_id: "mat-kardus", gross: 5.0, tare: 0.2, price: 1500 }],
      withdrawal: 15000,
    },
    {
      id: "trx-jkt-001", organization_id: "org-bank-jkt", member_id: "usr-warga-jkt", operator_id: "usr-operator",
      transaction_at: "2026-11-11T10:00:00Z",
      items: [{ material_id: "mat-kardus", gross: 6.0, tare: 0.0, price: 1600 }],
    },
    {
      id: "trx-bdg-001", organization_id: "org-bank-bdg", member_id: "usr-warga-bdg", operator_id: "usr-operator",
      transaction_at: "2026-11-13T07:45:00Z",
      items: [{ material_id: "mat-pet", gross: 4.0, tare: 0.2, price: 3400 }],
    },
  ]

  for (const t of txns) {
    let totalValue = 0
    const items = t.items.map((it, idx) => {
      const net = Math.max(0, it.gross - it.tare)
      const value = net * it.price
      totalValue += value
      return {
        id: `txi-${t.id}-${idx + 1}`,
        material_id: it.material_id,
        gross: it.gross, tare: it.tare, net,
        price_snapshot: it.price,
        price_valid_from: new Date("2026-01-01T00:00:00Z"),
        value,
      }
    })

    await prisma.weighingTransaction.upsert({
      where: { id: t.id },
      create: {
        id: t.id, organization_id: t.organization_id, member_id: t.member_id,
        operator_id: t.operator_id, transaction_at: new Date(t.transaction_at),
        status: "confirmed", sync_status: "synced", status_changed_at: new Date(t.transaction_at),
        items: { create: items },
      },
      update: {
        organization_id: t.organization_id, member_id: t.member_id, operator_id: t.operator_id,
        transaction_at: new Date(t.transaction_at), status: "confirmed", sync_status: "synced",
      },
    })

    // ledger: deposit + optional withdrawal, balance computed from SUM
    const existing = await prisma.ledgerEntry.aggregate({
      where: { member_id: t.member_id },
      _sum: { amount: true },
    })
    let balance = Number(existing._sum.amount ?? 0)
    const depositId = `led-${t.id}-deposit`
    balance += totalValue
    await prisma.ledgerEntry.upsert({
      where: { id: depositId },
      create: {
        id: depositId, member_id: t.member_id, transaction_id: t.id,
        entry_type: "deposit", amount: totalValue, balance_after: balance,
        actor_id: t.operator_id, created_at: new Date(t.transaction_at),
      },
      update: { amount: totalValue, balance_after: balance },
    })
    if (t.withdrawal) {
      const wdId = `led-${t.id}-withdrawal`
      balance -= t.withdrawal
      await prisma.ledgerEntry.upsert({
        where: { id: wdId },
        create: {
          id: wdId, member_id: t.member_id, entry_type: "withdrawal",
          amount: -t.withdrawal, balance_after: balance,
          actor_id: t.operator_id, created_at: new Date("2026-11-12T13:00:00Z"),
        },
        update: { amount: -t.withdrawal, balance_after: balance },
      })
    }
  }

  // ── PERMINTAAN PENJEMPUTAN ─────────────────────────────────────────────
  const collectionSeeds = [
    { id: "col-prob-001", requester_id: "usr-warga", org: "org-bank-prob", area: "kel-sukabumi", status: "submitted" as const, address: "Jl. Sukabumi No. 12, RT 03/RW 05", start: "2026-11-16T09:00:00Z", end: "2026-11-16T11:00:00Z", items: [{ material_id: "mat-pet", estimated: 2.5 }] },
    { id: "col-prob-002", requester_id: "usr-warga", org: "org-comm-prob", area: "kel-sukabumi", status: "assigned" as const, address: "Jl. Sukabumi No. 12, RT 03/RW 05", start: "2026-11-17T13:00:00Z", end: "2026-11-17T15:00:00Z", items: [{ material_id: "mat-kardus", estimated: 5 }] },
    { id: "col-jkt-001", requester_id: "usr-warga-jkt", org: "org-bank-jkt", area: "kel-cilandak", status: "submitted" as const, address: "Jl. Cilandak Barat No. 8", start: "2026-11-16T08:00:00Z", end: "2026-11-16T10:00:00Z", items: [{ material_id: "mat-hvs", estimated: 3 }] },
    { id: "col-bdg-001", requester_id: "usr-warga-bdg", org: "org-bank-bdg", area: "kel-dago", status: "completed" as const, address: "Jl. Dago No. 21", start: "2026-11-10T09:00:00Z", end: "2026-11-10T11:00:00Z", items: [{ material_id: "mat-pet", estimated: 4 }] },
  ]
  for (const c of collectionSeeds) {
    await prisma.collectionRequest.upsert({
      where: { id: c.id },
      create: {
        id: c.id, requester_id: c.requester_id, organization_id: c.org, method: "individual",
        area_id: c.area, status: c.status, address: c.address,
        slot_start: new Date(c.start), slot_end: new Date(c.end),
        requested_at: new Date("2026-11-14T07:00:00Z"),
        status_changed_at: new Date("2026-11-14T07:00:00Z"),
      },
      update: { status: c.status, address: c.address, slot_start: new Date(c.start), slot_end: new Date(c.end) },
    })
    for (let i = 0; i < c.items.length; i++) {
      const item = c.items[i]
      await prisma.collectionItem.upsert({
        where: { id: `coli-${c.id}-${i + 1}` },
        create: { id: `coli-${c.id}-${i + 1}`, collection_request_id: c.id, material_id: item.material_id, estimated_quantity: item.estimated },
        update: { estimated_quantity: item.estimated },
      })
    }
  }
  await prisma.collectionAssignment.upsert({
    where: { id: "cola-prob-002" },
    create: { id: "cola-prob-002", collection_request_id: "col-prob-002", collector_id: "org-collector-prob", status: "assigned" },
    update: { collector_id: "org-collector-prob", status: "assigned" },
  })

  // ── BATCH MATERIAL ─────────────────────────────────────────────────────
  const batchSeeds = [
    { id: "bat-prob-001", code: "PY-20261110-PROB-001", org: "org-bank-prob", material: "mat-pet", qty: 42.6, status: "diserahkan" as const },
    { id: "bat-jkt-001", code: "PY-20261111-JKT-001", org: "org-bank-jkt", material: "mat-kardus", qty: 85.0, status: "menunggu_bukti" as const },
  ]
  for (const b of batchSeeds) {
    await prisma.materialBatch.upsert({
      where: { id: b.id },
      create: { id: b.id, code: b.code, origin_org_id: b.org, material_id: b.material, quantity: b.qty, status: b.status, status_changed_at: new Date("2026-11-12T07:00:00Z") },
      update: { quantity: b.qty, status: b.status },
    })
  }
  const batchEvents = [
    { id: "bev-prob-001", batch_id: "bat-prob-001", type: "dikumpulkan" as const, payload: { weight: 42.6 }, at: "2026-11-10T08:00:00Z" },
    { id: "bev-prob-002", batch_id: "bat-prob-001", type: "ditimbang" as const, payload: { weight: 42.6, quality: "A" }, at: "2026-11-11T07:00:00Z" },
    { id: "bev-prob-003", batch_id: "bat-prob-001", type: "diserahkan" as const, payload: { to: "org-recycler-prob" }, at: "2026-11-12T07:30:00Z" },
    { id: "bev-jkt-001", batch_id: "bat-jkt-001", type: "diterima" as const, payload: { weight: 83.5, quality: "B" }, at: "2026-11-12T09:00:00Z" },
  ]
  for (const e of batchEvents) {
    await prisma.batchEvent.upsert({
      where: { id: e.id },
      create: { id: e.id, batch_id: e.batch_id, event_type: e.type, actor_org_id: e.batch_id === "bat-prob-001" ? "org-bank-prob" : "org-recycler-prob", actor_user_id: "usr-operator", occurred_at: new Date(e.at), payload: e.payload },
      update: { payload: e.payload, occurred_at: new Date(e.at) },
    })
  }

  // ── SENGKETA ───────────────────────────────────────────────────────────
  const disputes = [
    { id: "dis-prob-001", reporter: "usr-warga", type: "transaction", related: "trx-prob-002", reason: "Berat kardus terasa berbeda saat ditimbang ulang.", category: "berat" as const, status: "open" as const, collection: null },
    { id: "dis-jkt-001", reporter: "usr-warga-jkt", type: "collection", related: "col-jkt-001", reason: "Pengumpul belum datang sesuai slot.", category: "layanan" as const, status: "resolved" as const, collection: "col-jkt-001" },
  ]
  for (const d of disputes) {
    await prisma.dispute.upsert({
      where: { id: d.id },
      create: { id: d.id, reporter_id: d.reporter, related_type: d.type, related_id: d.related, collection_request_id: d.collection, reason: d.reason, category: d.category, status: d.status, resolution: d.status === "resolved" ? "Disepakati penjadwalan ulang." : null, resolved_at: d.status === "resolved" ? new Date("2026-11-13T10:00:00Z") : null },
      update: { status: d.status, resolution: d.status === "resolved" ? "Disepakati penjadwalan ulang." : null },
    })
  }

  // ── EVENT, TUGAS, BUDAYA ───────────────────────────────────────────────
  await prisma.event.upsert({
    where: { id: "evt-prob-001" },
    create: { id: "evt-prob-001", organization_id: "org-comm-prob", title: "Kerja Bakti Bersih Kali", description: "Membersihkan saluran air bersama warga.", start_at: new Date("2026-11-20T07:00:00Z"), end_at: new Date("2026-11-20T10:00:00Z"), location: "Balai RW 05 Sukabumi", capacity: 30, status: "upcoming" },
    update: { title: "Kerja Bakti Bersih Kali", start_at: new Date("2026-11-20T07:00:00Z"), status: "upcoming" },
  })
  await prisma.event.upsert({
    where: { id: "evt-jkt-001" },
    create: { id: "evt-jkt-001", organization_id: "org-comm-jkt", title: "Pelatihan Memilah untuk Keluarga", start_at: new Date("2026-11-22T09:00:00Z"), location: "Balai Cilandak Barat", capacity: 40, status: "upcoming" },
    update: { start_at: new Date("2026-11-22T09:00:00Z"), status: "upcoming" },
  })
  await prisma.task.upsert({
    where: { id: "task-prob-001" },
    create: { id: "task-prob-001", organization_id: "org-comm-prob", title: "Siapkan alat kerja bakti", assignee_id: "usr-warga", pic_id: "usr-pengurus", due_at: new Date("2026-11-19T10:00:00Z"), status: "berjalan" },
    update: { status: "berjalan", due_at: new Date("2026-11-19T10:00:00Z") },
  })
  await prisma.culturalContent.upsert({
    where: { id: "cult-prob-001" },
    create: { id: "cult-prob-001", organization_id: "org-comm-prob", title: "Anyaman dari Plastik Bekas", body: "Warga RW 05 menganyam tas dari plastik bekas.", access_level: "publik", status: "approved" },
    update: { status: "approved", access_level: "publik" },
  })
  await prisma.contentContributor.upsert({
    where: { id: "cc-prob-001" },
    create: { id: "cc-prob-001", content_id: "cult-prob-001", user_id: "usr-warga", name: "Dewi Lestari", attribution_preference: "nama" },
    update: { name: "Dewi Lestari" },
  })
  await prisma.contentConsent.upsert({
    where: { id: "consent-prob-001" },
    create: { id: "consent-prob-001", content_id: "cult-prob-001", consent_type: "publish", scope: "publik", granted_at: new Date("2026-10-01T00:00:00Z") },
    update: { scope: "publik" },
  })

  // ── AUDIT LOG & NOTIFIKASI ─────────────────────────────────────────────
  await prisma.auditLog.upsert({
    where: { id: "aud-prob-001" },
    create: { id: "aud-prob-001", actor_id: "usr-operator", action: "CREATE_TRANSACTION", entity_type: "weighing_transaction", entity_id: "trx-prob-001", after: { total: 13210 }, ip: "127.0.0.1", device: "seed", occurred_at: new Date("2026-11-10T08:30:00Z") },
    update: {},
  })
  await prisma.notification.upsert({
    where: { id: "notif-prob-001" },
    create: { id: "notif-prob-001", user_id: "usr-warga", type: "collection", payload: { collection_id: "col-prob-001", status: "submitted" }, created_at: new Date("2026-11-14T07:00:00Z") },
    update: { payload: { collection_id: "col-prob-001", status: "submitted" } },
  })

  const counts = await prisma.$transaction([
    prisma.user.count(), prisma.organization.count(), prisma.material.count(),
    prisma.weighingTransaction.count(), prisma.collectionRequest.count(),
    prisma.materialBatch.count(),
  ])
  console.log("✅ Seed selesai:", { users: counts[0], orgs: counts[1], materials: counts[2], transactions: counts[3], collections: counts[4], batches: counts[5] })
}

main()
  .catch((error) => {
    console.error("❌ Seed gagal:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
