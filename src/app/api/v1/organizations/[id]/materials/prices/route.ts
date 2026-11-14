import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, num } from "@/server/http";
import { requireAuth, requireOrgAccess, requireRole } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

interface PriceItemInput {
  material_id: string;
  price: number;
  unit?: string;
}

interface UpdatePricesBody {
  prices?: unknown;
}

export const PUT = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id: organizationId } = await (context.params ?? Promise.resolve({ id: "" }));

  requireRole(user, ["operator_bank_sampah", "super_admin"]);
  await requireOrgAccess(user, organizationId);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, type: true },
  });
  if (!org) throw new HttpError(404, "NOT_FOUND", "Organisasi tidak ditemukan");

  const body = await readJson<UpdatePricesBody>(req);
  if (!Array.isArray(body.prices) || body.prices.length === 0) {
    throw new HttpError(400, "VALIDATION_ERROR", "prices harus berupa array yang tidak kosong");
  }

  const now = new Date();
  const validItems: PriceItemInput[] = [];

  for (const item of body.prices) {
    if (!item || typeof item !== "object") continue;
    const materialId = String((item as Record<string, unknown>).material_id ?? "").trim();
    const priceVal = num((item as Record<string, unknown>).price);
    const unit = String((item as Record<string, unknown>).unit ?? "kg").trim();

    if (!materialId || priceVal <= 0) {
      throw new HttpError(400, "VALIDATION_ERROR", "material_id dan price (> 0) wajib diisi untuk setiap item");
    }
    validItems.push({ material_id: materialId, price: priceVal, unit });
  }

  const materialIds = validItems.map((v) => v.material_id);
  const existingMaterials = await prisma.material.findMany({
    where: { id: { in: materialIds } },
    select: { id: true, name: true },
  });
  const foundSet = new Set(existingMaterials.map((m) => m.id));
  for (const mid of materialIds) {
    if (!foundSet.has(mid)) {
      throw new HttpError(400, "VALIDATION_ERROR", `Material dengan ID ${mid} tidak ditemukan`);
    }
  }

  const updatedPrices = await prisma.$transaction(async (tx) => {
    const results = [];
    for (const item of validItems) {
      // Tutup harga aktif sebelumnya
      await tx.materialPrice.updateMany({
        where: {
          organization_id: organizationId,
          material_id: item.material_id,
          OR: [{ valid_to: null }, { valid_to: { gt: now } }],
        },
        data: {
          valid_to: now,
        },
      });

      // Tambahkan harga baru
      const created = await tx.materialPrice.create({
        data: {
          organization_id: organizationId,
          material_id: item.material_id,
          price: item.price,
          unit: item.unit ?? "kg",
          valid_from: now,
          valid_to: null,
        },
        include: {
          material: { select: { id: true, name: true, category: true } },
        },
      });
      results.push(created);
    }
    return results;
  });

  await writeAudit({
    actorId: user.id,
    action: "UPDATE_MATERIAL_PRICES",
    entityType: "material_price",
    entityId: organizationId,
    after: {
      organization_id: organizationId,
      prices: validItems,
    },
    req,
  });

  return ok({
    organization_id: organizationId,
    organization_name: org.name,
    updated_count: updatedPrices.length,
    prices: updatedPrices.map((p) => ({
      id: p.id,
      material_id: p.material_id,
      material_name: p.material.name,
      category: p.material.category,
      price: num(p.price),
      unit: p.unit,
      valid_from: p.valid_from,
    })),
    message: "Harga material berhasil diperbarui",
  });
});
