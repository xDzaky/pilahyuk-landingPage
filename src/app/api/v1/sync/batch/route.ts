import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, num } from "@/server/http";
import { requireAuth, requireOrgAccess } from "@/server/auth/current-user";
import { enforceRateLimit } from "@/server/rate-limit";
import { createWeighingTransaction, currentPrice, serializeTransaction } from "@/server/services/waste-bank";
import { writeAudit } from "@/server/audit";

interface SyncItem {
  key: string;
  type: string;
  payload: Record<string, unknown>;
  client_created_at?: string;
}

interface SyncResult {
  key: string;
  status: "synced" | "failed" | "conflict";
  server_id?: string;
  reason?: string;
}

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);
  await enforceRateLimit(`sync:user:${user.id}`, 60, 600);

  const body = await readJson<{ items?: unknown }>(req);
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > 100) {
    throw new HttpError(400, "VALIDATION_ERROR", "items harus 1–100 baris");
  }

  const results: SyncResult[] = [];

  for (const raw of rawItems) {
    if (!raw || typeof raw !== "object") {
      results.push({ key: "", status: "failed", reason: "Item tidak valid" });
      continue;
    }
    const item = raw as unknown as SyncItem;
    const key = String(item.key ?? "");
    if (!key) {
      results.push({ key: "", status: "failed", reason: "key idempotency wajib diisi" });
      continue;
    }

    const existing = await prisma.syncIdempotencyKey.findUnique({ where: { key } });
    if (existing) {
      if (existing.user_id && existing.user_id !== user.id) {
        results.push({ key, status: "conflict", reason: "Key sudah dipakai pengguna lain" });
      } else if (existing.result) {
        results.push(existing.result as unknown as SyncResult);
      } else {
        results.push({ key, status: "conflict", reason: "Item dengan key ini sedang diproses" });
      }
      continue;
    }

    let result: SyncResult;
    let reference: string | null = null;

    try {
      if (item.type === "weighing_transaction") {
        if (!["operator_bank_sampah", "super_admin"].includes(user.role)) {
          throw new HttpError(403, "FORBIDDEN", "Hanya operator yang dapat menyinkronkan penimbangan");
        }
        const payload = item.payload ?? {};
        const organizationId = String(payload.organization_id ?? user.org_id ?? "");
        const memberId = String(payload.member_id ?? "");
        const items = Array.isArray(payload.items) ? payload.items : [];
        if (!organizationId || !memberId || items.length === 0) throw new HttpError(400, "VALIDATION_ERROR", "organization_id, member_id, items wajib diisi");
        await requireOrgAccess(user, organizationId);

        const at = item.client_created_at ? new Date(item.client_created_at) : new Date();
        for (const rawItem of items) {
          const entry = rawItem as Record<string, unknown>;
          const materialId = String(entry.material_id ?? "");
          const clientPrice = entry.price_snapshot !== undefined ? Number(entry.price_snapshot) : null;
          if (materialId && clientPrice !== null && Number.isFinite(clientPrice)) {
            const price = await currentPrice(organizationId, materialId, at);
            if (price && Math.abs(num(price.price) - clientPrice) > 0.01) {
              throw new HttpError(409, "PRICE_CHANGED", "Harga material sudah berubah — perlu penyesuaian");
            }
          }
        }

        const trx = await createWeighingTransaction({
          organizationId, memberId, operatorId: user.id,
          items: items.map((rawItem) => {
            const entry = rawItem as Record<string, unknown>;
            return { material_id: String(entry.material_id ?? ""), gross: Number(entry.gross ?? 0), tare: Number(entry.tare ?? 0) };
          }),
          deviceId: payload.device_id ? String(payload.device_id) : null,
          isOfflineCreated: true,
          transactionAt: at,
        });
        result = { key, status: "synced", server_id: trx.id };
        reference = trx.id;
      } else if (item.type === "collection_request") {
        if (!["resident", "volunteer"].includes(user.role)) {
          throw new HttpError(403, "FORBIDDEN", "Hanya warga yang dapat menyinkronkan permintaan penjemputan");
        }
        const payload = item.payload ?? {};
        const organizationId = String(payload.organization_id ?? "");
        const items = Array.isArray(payload.items) ? payload.items : [];
        if (!organizationId || items.length === 0) throw new HttpError(400, "VALIDATION_ERROR", "organization_id dan items wajib diisi");
        const org = await prisma.organization.findFirst({ where: { id: organizationId, status: "verified", deleted_at: null } });
        if (!org) throw new HttpError(404, "NOT_FOUND", "Organisasi tidak ditemukan");
        const collection = await prisma.collectionRequest.create({
          data: {
            requester_id: user.id,
            organization_id: organizationId,
            method: (String(payload.method ?? "individual") as "individual" | "collective" | "dropoff"),
            area_id: payload.area_id ? String(payload.area_id) : null,
            address: payload.address ? String(payload.address) : null,
            notes: payload.notes ? String(payload.notes) : null,
            slot_start: payload.slot_start ? new Date(String(payload.slot_start)) : null,
            slot_end: payload.slot_end ? new Date(String(payload.slot_end)) : null,
            status: "submitted",
            status_changed_at: new Date(),
            items: {
              create: items.map((rawItem) => {
                const entry = rawItem as Record<string, unknown>;
                return { material_id: String(entry.material_id ?? ""), estimated_quantity: Number(entry.estimated_quantity ?? entry.quantity ?? 0) };
              }),
            },
          },
        });
        result = { key, status: "synced", server_id: collection.id };
        reference = collection.id;
      } else {
        result = { key, status: "failed", reason: `Tipe tidak didukung: ${item.type}` };
      }
    } catch (error) {
      if (error instanceof HttpError) {
        result = { key, status: error.status === 409 ? "conflict" : "failed", reason: error.message };
      } else {
        result = { key, status: "failed", reason: "Gagal memproses item" };
      }
    }

    await prisma.syncIdempotencyKey.create({
      data: {
        key,
        user_id: user.id,
        endpoint: "POST /sync/batch",
        response_reference: reference,
        result: result as unknown as object,
      },
    }).catch(() => undefined);

    await writeAudit({ actorId: user.id, action: "SYNC_ITEM", entityType: "sync", entityId: key, after: result as unknown as object, req });
    results.push(result);
  }

  return ok(results, { total: results.length, synced: results.filter((r) => r.status === "synced").length });
});
