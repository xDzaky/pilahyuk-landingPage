import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { getIp, getUserAgent } from "@/server/http";

export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  req?: NextRequest;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id: input.actorId ?? null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId,
        before: input.before === undefined ? undefined : (input.before as object),
        after: input.after === undefined ? undefined : (input.after as object),
        ip: input.req ? getIp(input.req) : null,
        device: input.req ? getUserAgent(input.req) : null,
      },
    });
  } catch (error) {
    // Audit tidak boleh menggagalkan operasi utama, tetapi harus terlihat di log.
    console.error("Audit log gagal:", error);
  }
}
