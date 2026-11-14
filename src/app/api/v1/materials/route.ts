import { NextRequest } from "next/server";
import { MaterialCategory } from "@prisma/client";
import { prisma } from "@/server/db";
import { route, ok, num } from "@/server/http";
import { getAuthUser } from "@/server/auth/current-user";
import { areaIdsWithDescendants } from "@/server/services/areas";

export const GET = route(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const auth = await getAuthUser(req);
  let organizationId = searchParams.get("organization_id")?.trim() || undefined;
  if (!organizationId && auth) {
    if (["resident", "volunteer"].includes(auth.role) && auth.profile?.area_id) {
      // Warga tidak punya harga sendiri: pakai bank sampah terverifikasi di wilayahnya.
      const areaIds = await areaIdsWithDescendants(auth.profile.area_id);
      const bank = await prisma.organization.findFirst({
        where: { type: "waste_bank", status: "verified", deleted_at: null, area_id: { in: areaIds } },
        select: { id: true },
        orderBy: { created_at: "asc" },
      });
      organizationId = bank?.id;
    } else {
      organizationId = auth.org_id ?? undefined;
    }
  }
  const now = new Date();

  const materials = await prisma.material.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(category && Object.values(MaterialCategory).includes(category as MaterialCategory)
        ? { category: category as MaterialCategory }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  let priceByMaterial = new Map<string, { price: number; valid_from: Date }>();
  let ruleByMaterial = new Map<string, { accepted: boolean; conditions: string | null }>();

  if (organizationId) {
    const [prices, rules] = await Promise.all([
      prisma.materialPrice.findMany({
        where: {
          organization_id: organizationId,
          valid_from: { lte: now },
          OR: [{ valid_to: null }, { valid_to: { gt: now } }],
        },
        orderBy: { valid_from: "desc" },
      }),
      prisma.materialRule.findMany({
        where: {
          organization_id: organizationId,
          valid_from: { lte: now },
          OR: [{ valid_to: null }, { valid_to: { gt: now } }],
        },
        orderBy: { valid_from: "desc" },
      }),
    ]);
    priceByMaterial = new Map();
    for (const price of prices) {
      if (!priceByMaterial.has(price.material_id)) {
        priceByMaterial.set(price.material_id, { price: num(price.price), valid_from: price.valid_from });
      }
    }
    ruleByMaterial = new Map();
    for (const rule of rules) {
      if (!ruleByMaterial.has(rule.material_id)) {
        ruleByMaterial.set(rule.material_id, { accepted: rule.accepted, conditions: rule.conditions });
      }
    }
  }

  return ok(
    materials.map((m) => {
      const price = priceByMaterial.get(m.id);
      const rule = ruleByMaterial.get(m.id);
      return {
        id: m.id,
        name: m.name,
        category: m.category,
        description: m.description,
        prep_guide: m.prep_guide,
        ...(organizationId
          ? {
              current_price: price?.price ?? null,
              price_valid_from: price?.valid_from ?? null,
              accepted: rule?.accepted ?? null,
              conditions: rule?.conditions ?? null,
            }
          : {}),
      };
    })
  );
});
