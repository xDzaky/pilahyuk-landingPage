import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";

export const POST = route(async (req: NextRequest) => {
  const user = await requireAuth(req);

  const updated = await prisma.notification.updateMany({
    where: {
      user_id: user.id,
      read_at: null,
    },
    data: {
      read_at: new Date(),
    },
  });

  return ok({
    marked_count: updated.count,
    message: `${updated.count} notifikasi telah ditandai sudah dibaca`,
  });
});
