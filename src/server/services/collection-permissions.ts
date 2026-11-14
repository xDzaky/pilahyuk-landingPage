import type { AuthUser } from "@/server/auth/current-user";
import type { CollectionWithRelations } from "./collections";

export const COLLECTION_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["on_the_way", "cancelled"],
  on_the_way: ["collected"],
  collected: ["received"],
  received: ["completed", "disputed"],
  completed: [],
  cancelled: [],
  disputed: ["resolved", "cancelled"],
};

export function canTransition(
  user: AuthUser,
  collection: CollectionWithRelations,
  next: string
): boolean {
  const from = collection.status;
  if (!COLLECTION_TRANSITIONS[from]?.includes(next)) return false;
  if (user.role === "super_admin") return true;

  const staff = ["operator_bank_sampah", "pengurus_komunitas"].includes(user.role) && user.org_id === collection.organization_id;
  const collector = user.role === "collector" && collection.assignments.some((a) => a.collector_id === user.org_id);
  const owner = collection.requester_id === user.id;

  if (next === "cancelled") return owner || staff;
  if (next === "confirmed") return staff;
  if (next === "assigned") return staff;
  if (next === "on_the_way" || next === "collected") return staff || collector;
  if (next === "received" || next === "completed") return staff;
  if (next === "disputed") return owner || staff;
  if (next === "resolved") return staff;
  return false;
}
