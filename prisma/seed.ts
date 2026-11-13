// prisma/seed.ts — Seed data untuk development
import { PrismaClient } from "@prisma/client"
import * as crypto from "crypto"

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function main() {
  console.log("🌱 Seeding PilahYuk 2.0 database...")

  // ── ROLES ────────────────────────────────────────────────────
  const roleNames = [
    "Guest", "Resident", "Volunteer", "Community Admin",
    "Waste Bank Operator", "Collector", "Recycler",
    "Cultural Curator", "Artisan", "Educator", "Super Admin",
  ]

  const roles: Record<string, { id: string; name: string }> = {}
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      create: { name },
      update: {},
    })
    roles[name] = role
    console.log(`  ✓ Role: ${name}`)
  }

  // ── AREAS ────────────────────────────────────────────────────
  const areaJawaTimur = await prisma.area.upsert({
    where: { id: "area-jatim" },
    create: { id: "area-jatim", name: "Jawa Timur" },
    update: {},
  })

  const areaSurabaya = await prisma.area.upsert({
    where: { id: "area-sby" },
    create: { id: "area-sby", name: "Surabaya", parent_id: areaJawaTimur.id },
    update: {},
  })

  const areaTimur = await prisma.area.upsert({
    where: { id: "area-sby-timur" },
    create: { id: "area-sby-timur", name: "Surabaya Timur", parent_id: areaSurabaya.id },
    update: {},
  })

  console.log("  ✓ Areas: Jawa Timur → Surabaya → Surabaya Timur")

  // ── USERS ────────────────────────────────────────────────────
  const pwHash = await hashPassword("password123")

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@pilahyuk.id" },
    create: {
      id: "usr-001",
      name: "Ahmad Fauzan",
      email: "superadmin@pilahyuk.id",
      password_hash: pwHash,
      status: "active",
    },
    update: {},
  })

  const operator = await prisma.user.upsert({
    where: { email: "operator@pilahyuk.id" },
    create: {
      id: "usr-002",
      name: "Siti Rahayu",
      email: "operator@pilahyuk.id",
      password_hash: pwHash,
      status: "active",
    },
    update: {},
  })

  const pengurus = await prisma.user.upsert({
    where: { email: "pengurus@pilahyuk.id" },
    create: {
      id: "usr-003",
      name: "Budi Santoso",
      email: "pengurus@pilahyuk.id",
      password_hash: pwHash,
      status: "active",
    },
    update: {},
  })

  const members = await Promise.all([
    prisma.user.upsert({
      where: { email: "dewi@email.com" },
      create: { id: "usr-004", name: "Dewi Lestari", email: "dewi@email.com", password_hash: pwHash, status: "active" },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "reza@email.com" },
      create: { id: "usr-005", name: "Reza Pratama", email: "reza@email.com", password_hash: pwHash, status: "active" },
      update: {},
    }),
  ])

  console.log("  ✓ Users: 5 akun (superadmin, operator, pengurus, 2 anggota)")

  // ── ORGANIZATIONS ────────────────────────────────────────────
  const komunitas = await prisma.organization.upsert({
    where: { id: "org-001" },
    create: {
      id: "org-001",
      name: "Komunitas Hijau RW 05",
      type: "community",
      status: "verified",
      verified_at: new Date("2026-02-01"),
      area_id: areaTimur.id,
    },
    update: {},
  })

  const bankSampah = await prisma.organization.upsert({
    where: { id: "org-002" },
    create: {
      id: "org-002",
      name: "Bank Sampah Melati",
      type: "waste_bank",
      status: "verified",
      verified_at: new Date("2026-02-05"),
      area_id: areaTimur.id,
    },
    update: {},
  })

  const pengolah = await prisma.organization.upsert({
    where: { id: "org-003" },
    create: {
      id: "org-003",
      name: "Pengolah Mandiri Jaya",
      type: "recycler",
      status: "verified",
      verified_at: new Date("2026-03-01"),
      area_id: areaSurabaya.id,
    },
    update: {},
  })

  // Org menunggu verifikasi
  await prisma.organization.upsert({
    where: { id: "org-005" },
    create: {
      id: "org-005",
      name: "Komunitas Budaya Bahari",
      type: "community",
      status: "pending_verification",
      area_id: areaSurabaya.id,
    },
    update: {},
  })

  console.log("  ✓ Organizations: 3 verified, 1 pending")

  // ── ORGANIZATION MEMBERS ──────────────────────────────────────
  await prisma.organizationMember.upsert({
    where: { id: "mem-001" },
    create: {
      id: "mem-001",
      organization_id: komunitas.id,
      user_id: pengurus.id,
      role_id: roles["Community Admin"].id,
      status: "active",
      joined_at: new Date("2026-02-15"),
    },
    update: {},
  })

  await prisma.organizationMember.upsert({
    where: { id: "mem-002" },
    create: {
      id: "mem-002",
      organization_id: bankSampah.id,
      user_id: operator.id,
      role_id: roles["Waste Bank Operator"].id,
      status: "active",
      joined_at: new Date("2026-02-10"),
    },
    update: {},
  })

  for (const [i, member] of members.entries()) {
    await prisma.organizationMember.upsert({
      where: { id: `mem-10${i + 3}` },
      create: {
        id: `mem-10${i + 3}`,
        organization_id: komunitas.id,
        user_id: member.id,
        role_id: roles["Resident"].id,
        status: "active",
        joined_at: new Date("2026-03-01"),
      },
      update: {},
    })
  }

  console.log("  ✓ Organization members: linked")

  // ── MATERIALS & PRICES ────────────────────────────────────────
  const materialData = [
    { id: "mat-001", name: "Plastik PET", category: "plastik_pet" as const, price: 3500 },
    { id: "mat-002", name: "Plastik HDPE", category: "plastik_lain" as const, price: 2000 },
    { id: "mat-003", name: "Kertas HVS", category: "kertas" as const, price: 1800 },
    { id: "mat-004", name: "Kardus", category: "kardus" as const, price: 1500 },
    { id: "mat-005", name: "Logam Aluminium", category: "logam" as const, price: 12000 },
    { id: "mat-006", name: "Organik Basah", category: "organik" as const, price: 500 },
  ]

  for (const mat of materialData) {
    const material = await prisma.material.upsert({
      where: { id: mat.id },
      create: { id: mat.id, name: mat.name, category: mat.category },
      update: {},
    })

    await prisma.materialPrice.upsert({
      where: { id: `price-${mat.id}` },
      create: {
        id: `price-${mat.id}`,
        organization_id: bankSampah.id,
        material_id: material.id,
        price: mat.price,
        unit: "kg",
        valid_from: new Date("2026-11-01"),
      },
      update: {},
    })
  }

  console.log("  ✓ Materials: 6 jenis dengan harga berlaku")

  // ── WEIGHING TRANSACTIONS ─────────────────────────────────────
  const wtxData = [
    { id: "wtx-001", member: members[0], items: [{ mat: "mat-001", gross: 3.2, tare: 0.3, price: 3500 }, { mat: "mat-003", gross: 1.8, tare: 0.1, price: 1800 }], status: "confirmed" as const, offline: false },
    { id: "wtx-002", member: members[1], items: [{ mat: "mat-004", gross: 7.5, tare: 0.5, price: 1500 }], status: "confirmed" as const, offline: false },
    { id: "wtx-003", member: members[0], items: [{ mat: "mat-005", gross: 2.1, tare: 0.1, price: 12000 }], status: "draft" as const, offline: true },
  ]

  for (const wtx of wtxData) {
    const existing = await prisma.weighingTransaction.findUnique({ where: { id: wtx.id } })
    if (!existing) {
      const tx = await prisma.weighingTransaction.create({
        data: {
          id: wtx.id,
          organization_id: bankSampah.id,
          member_id: operator.id,
          operator_id: operator.id,
          transaction_at: new Date(),
          status: wtx.status,
          is_offline_created: wtx.offline,
          sync_status: wtx.offline ? "pending" : "synced",
        },
      })

      let totalNet = 0
      let totalValue = 0

      for (const item of wtx.items) {
        const net = item.gross - item.tare
        const value = net * item.price
        totalNet += net
        totalValue += value

        await prisma.weighingItem.create({
          data: {
            transaction_id: tx.id,
            material_id: item.mat,
            gross: item.gross,
            tare: item.tare,
            net,
            price_snapshot: item.price,
            value,
          },
        })
      }

      // Create ledger entry for confirmed transactions
      if (wtx.status === "confirmed") {
        const prevEntries = await prisma.ledgerEntry.findMany({
          where: { member_id: wtx.member.id },
          orderBy: { created_at: "desc" },
          take: 1,
        })
        const prevBalance = prevEntries[0]?.balance_after.toNumber() ?? 0

        await prisma.ledgerEntry.create({
          data: {
            member_id: wtx.member.id,
            transaction_id: tx.id,
            entry_type: "deposit",
            amount: totalValue,
            balance_after: prevBalance + totalValue,
            actor_id: operator.id,
          },
        })
      }
    }
  }

  console.log("  ✓ Weighing transactions: 3 (2 confirmed, 1 draft offline)")

  // ── MATERIAL BATCHES ──────────────────────────────────────────
  const batchData = [
    {
      id: "bat-001",
      code: "PY-20261113-MELATI-001",
      material_id: "mat-001",
      quantity: 42.6,
      status: "diserahkan" as const,
    },
    {
      id: "bat-002",
      code: "PY-20261112-MELATI-002",
      material_id: "mat-004",
      quantity: 85.0,
      status: "menunggu_bukti" as const,
    },
  ]

  for (const batch of batchData) {
    await prisma.materialBatch.upsert({
      where: { id: batch.id },
      create: {
        id: batch.id,
        code: batch.code,
        origin_org_id: bankSampah.id,
        material_id: batch.material_id,
        quantity: batch.quantity,
        status: batch.status,
      },
      update: {},
    })
  }

  console.log("  ✓ Material batches: 2 batch seed")

  // ── AUDIT LOG SEED ────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      actor_id: superAdmin.id,
      action: "SEED_INIT",
      entity_type: "system",
      entity_id: "seed",
      after: { message: "Database seeded successfully" },
    },
  })

  console.log("  ✓ Audit log: seed entry")
  console.log("\n✅ Seeding selesai!")
  console.log("\nAkun demo:")
  console.log("  superadmin@pilahyuk.id / password123 → Super Admin")
  console.log("  operator@pilahyuk.id / password123   → Waste Bank Operator")
  console.log("  pengurus@pilahyuk.id / password123   → Community Admin")
}

main()
  .catch(e => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
