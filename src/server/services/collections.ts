import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { HttpError, num } from "@/server/http";
import type { AuthUser } from "@/server/auth/current-user";

export const collectionInclude = {
  items: { include: { material: true } },
  organization: true,
  area: true,
  assignments: { include: { collector: true } },
  requester: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.CollectionRequestInclude;

export type CollectionWithRelations = Prisma.CollectionRequestGetPayload<{ include: typeof collectionInclude }>;

const ORG_STAFF = ["operator_bank_sampah", "pengurus_komunitas"];

export function isCollectionOrgStaff(user: AuthUser, collection: { organization_id: string }): boolean {
  return user.role === "super_admin" || (ORG_STAFF.includes(user.role) && user.org_id === collection.organization_id);
}

export function isAssignedCollector(user: AuthUser, collection: CollectionWithRelations): boolean {
  return user.role === "collector" && Boolean(user.org_id) &&
    collection.assignments.some((a) => a.collector_id === user.org_id);
}

export function canViewCollection(user: AuthUser, collection: CollectionWithRelations): boolean {
  return (
    user.role === "super_admin" ||
    collection.requester_id === user.id ||
    isCollectionOrgStaff(user, collection) ||
    isAssignedCollector(user, collection)
  );
}

export function canViewPrivateDetails(user: AuthUser, collection: CollectionWithRelations): boolean {
  return canViewCollection(user, collection);
}

export async function loadCollection(id: string): Promise<CollectionWithRelations> {
  const collection = await prisma.collectionRequest.findUnique({ where: { id }, include: collectionInclude });
  if (!collection) throw new HttpError(404, "NOT_FOUND", "Permintaan pengumpulan tidak ditemukan");
  return collection;
}

export function serializeCollection(collection: CollectionWithRelations, user: AuthUser) {
  const privateDetails = canViewPrivateDetails(user, collection);
  return {
    id: collection.id,
    status: collection.status,
    method: collection.method,
    requested_at: collection.requested_at,
    slot_start: collection.slot_start,
    slot_end: collection.slot_end,
    area_id: collection.area_id,
    area_name: collection.area?.name ?? null,
    organization_id: collection.organization_id,
    organization_name: collection.organization.name,
    requester: {
      id: collection.requester.id,
      name: collection.requester.name,
      ...(privateDetails ? { phone: collection.requester.phone } : {}),
    },
    ...(privateDetails ? { address: collection.address, notes: collection.notes, latitude: collection.latitude ? num(collection.latitude) : null, longitude: collection.longitude ? num(collection.longitude) : null } : {}),
    items: collection.items.map((item) => ({
      id: item.id,
      material_id: item.material_id,
      material_name: item.material.name,
      estimated_quantity: item.estimated_quantity ? num(item.estimated_quantity) : null,
      actual_quantity: item.actual_quantity ? num(item.actual_quantity) : null,
    })),
    assignments: collection.assignments.map((a) => ({
      collector_id: a.collector_id,
      collector_name: a.collector.name,
      status: a.status,
      assigned_at: a.assigned_at,
    })),
    created_at: collection.created_at,
    updated_at: collection.updated_at,
  };
}
