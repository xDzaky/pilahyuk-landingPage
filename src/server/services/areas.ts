import { prisma } from "@/server/db";

export async function areaIdsWithDescendants(areaId: string): Promise<string[]> {
  const areas = await prisma.area.findMany({ select: { id: true, parent_id: true } });
  const children = new Map<string, string[]>();
  for (const area of areas) {
    if (!area.parent_id) continue;
    const list = children.get(area.parent_id) ?? [];
    list.push(area.id);
    children.set(area.parent_id, list);
  }
  const result: string[] = [];
  const queue = [areaId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    result.push(current);
    for (const child of children.get(current) ?? []) queue.push(child);
  }
  return result;
}
