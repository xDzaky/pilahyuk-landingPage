import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { HttpError, num } from "@/server/http";

export const transactionInclude = {
  items: { include: { material: true } },
  member: { select: { id: true, name: true } },
  operator: { select: { id: true, name: true } },
  organization: true,
} satisfies Prisma.WeighingTransactionInclude;

export type TransactionWithRelations = Prisma.WeighingTransactionGetPayload<{ include: typeof transactionInclude }>;

export function serializeTransaction(trx: TransactionWithRelations) {
  const totalNet = trx.items.reduce((sum, item) => sum + num(item.net), 0);
  const totalValue = trx.items.reduce((sum, item) => sum + num(item.value), 0);
  return {
    id: trx.id,
    organization_id: trx.organization_id,
    organization_name: trx.organization.name,
    member: trx.member,
    operator: trx.operator,
    transaction_at: trx.transaction_at,
    status: trx.status,
    sync_status: trx.sync_status,
    is_offline_created: trx.is_offline_created,
    device_id: trx.device_id,
    items: trx.items.map((item) => ({
      id: item.id,
      material_id: item.material_id,
      material_name: item.material.name,
      gross: num(item.gross),
      tare: num(item.tare),
      net: num(item.net),
      price_snapshot: num(item.price_snapshot),
      price_valid_from: item.price_valid_from,
      value: num(item.value),
    })),
    total_net: totalNet,
    total_value: totalValue,
  };
}

export async function currentPrice(organizationId: string, materialId: string, at: Date = new Date()) {
  return prisma.materialPrice.findFirst({
    where: {
      organization_id: organizationId,
      material_id: materialId,
      valid_from: { lte: at },
      OR: [{ valid_to: null }, { valid_to: { gt: at } }],
    },
    orderBy: { valid_from: "desc" },
  });
}

export interface IncomingItem {
  material_id: string;
  gross: number;
  tare: number;
}

export async function createWeighingTransaction(input: {
  organizationId: string;
  memberId: string;
  operatorId: string;
  items: IncomingItem[];
  deviceId?: string | null;
  isOfflineCreated?: boolean;
  transactionAt?: Date;
}) {
  if (input.items.length === 0 || input.items.length > 50) {
    throw new HttpError(400, "VALIDATION_ERROR", "items harus 1–50 baris");
  }

  const membership = await prisma.wasteBankMember.findFirst({
    where: { organization_id: input.organizationId, user_id: input.memberId, status: "active", deleted_at: null },
    select: { id: true },
  });
  if (!membership) throw new HttpError(400, "VALIDATION_ERROR", "Anggota bukan anggota bank sampah organisasi ini");

  const at = input.transactionAt ?? new Date();
  const prepared: Array<{ material_id: string; gross: number; tare: number; net: number; price: number; validFrom: Date; value: number }> = [];
  for (const item of input.items) {
    const gross = Number(item.gross);
    const tare = Number(item.tare ?? 0);
    if (!item.material_id || !Number.isFinite(gross) || !Number.isFinite(tare) || gross <= 0 || tare < 0 || tare > gross || gross > 10000) {
      throw new HttpError(400, "VALIDATION_ERROR", "Berat tidak valid: gross > 0, tare ≥ 0, tare ≤ gross");
    }
    const material = await prisma.material.findUnique({ where: { id: item.material_id }, select: { id: true } });
    if (!material) throw new HttpError(400, "VALIDATION_ERROR", `Material ${item.material_id} tidak ditemukan`);
    const price = await currentPrice(input.organizationId, item.material_id, at);
    if (!price) throw new HttpError(422, "PRICE_NOT_FOUND", `Harga material ${item.material_id} belum diatur untuk organisasi ini`);
    const net = gross - tare;
    prepared.push({
      material_id: item.material_id, gross, tare, net,
      price: num(price.price), validFrom: price.valid_from, value: net * num(price.price),
    });
  }

  const totalValue = prepared.reduce((sum, item) => sum + item.value, 0);

  return prisma.$transaction(async (tx) => {
    const balanceAgg = await tx.ledgerEntry.aggregate({ where: { member_id: input.memberId }, _sum: { amount: true } });
    const currentBalance = Number(balanceAgg._sum.amount ?? 0);
    const trx = await tx.weighingTransaction.create({
      data: {
        organization_id: input.organizationId,
        member_id: input.memberId,
        operator_id: input.operatorId,
        transaction_at: at,
        status: "confirmed",
        status_changed_at: at,
        sync_status: "synced",
        device_id: input.deviceId ?? null,
        is_offline_created: Boolean(input.isOfflineCreated),
        items: {
          create: prepared.map((item) => ({
            material_id: item.material_id,
            gross: item.gross,
            tare: item.tare,
            net: item.net,
            price_snapshot: item.price,
            price_valid_from: item.validFrom,
            value: item.value,
          })),
        },
      },
    });
    await tx.ledgerEntry.create({
      data: {
        member_id: input.memberId,
        transaction_id: trx.id,
        entry_type: "deposit",
        amount: totalValue,
        balance_after: currentBalance + totalValue,
        actor_id: input.operatorId,
      },
    });
    return tx.weighingTransaction.findUniqueOrThrow({ where: { id: trx.id }, include: transactionInclude });
  });
}

export function periodRange(period: string): { start: Date; end: Date; type: "daily" | "monthly" } {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    const start = new Date(`${period}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end, type: "daily" };
  }
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end, type: "monthly" };
  }
  throw new HttpError(400, "VALIDATION_ERROR", "Format period: YYYY-MM atau YYYY-MM-DD");
}

export async function assertLedgerAccess(
  user: { id: string; role: string; org_id: string | null },
  memberId: string
): Promise<void> {
  if (user.role === "super_admin" || user.id === memberId) return;
  if (user.role === "operator_bank_sampah" && user.org_id) {
    const membership = await prisma.wasteBankMember.findFirst({
      where: { organization_id: user.org_id, user_id: memberId, status: "active", deleted_at: null },
      select: { id: true },
    });
    if (membership) return;
  }
  throw new HttpError(403, "FORBIDDEN", "Anda tidak berhak melihat ledger anggota ini");
}

export async function loadTransactionForUser(id: string, user: { id: string; role: string; org_id: string | null }) {
  const trx = await prisma.weighingTransaction.findUnique({ where: { id }, include: transactionInclude });
  if (!trx) throw new HttpError(404, "NOT_FOUND", "Transaksi tidak ditemukan");
  const allowed =
    user.role === "super_admin" ||
    trx.member_id === user.id ||
    (user.role === "operator_bank_sampah" && trx.organization_id === user.org_id);
  if (!allowed) throw new HttpError(403, "FORBIDDEN", "Anda tidak berhak melihat transaksi ini");
  return trx;
}
