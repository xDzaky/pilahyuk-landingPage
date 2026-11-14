import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, ok, HttpError } from "@/server/http";
import { requireAuth } from "@/server/auth/current-user";
import { writeAudit } from "@/server/audit";

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  const { id: challengeId } = await (context.params ?? Promise.resolve({ id: "" }));

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge) throw new HttpError(404, "NOT_FOUND", "Tantangan tidak ditemukan");
  if (challenge.status !== "active") {
    throw new HttpError(400, "CHALLENGE_INACTIVE", "Tantangan sudah tidak aktif");
  }

  const existing = await prisma.challengeParticipant.findUnique({
    where: {
      challenge_id_user_id: {
        challenge_id: challengeId,
        user_id: user.id,
      },
    },
  });

  if (existing) {
    return ok({ message: "Anda sudah terdaftar dalam tantangan ini", participant: existing });
  }

  const participant = await prisma.challengeParticipant.create({
    data: {
      challenge_id: challengeId,
      user_id: user.id,
      score: 0,
    },
  });

  // Notifikasi konfirmasi bergabung
  await prisma.notification.create({
    data: {
      user_id: user.id,
      type: "challenge_joined",
      payload: {
        title: "Tantangan Dimulai!",
        challenge_id: challengeId,
        challenge_title: challenge.title,
      },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "JOIN_CHALLENGE",
    entityType: "challenge_participant",
    entityId: participant.id,
    after: { challengeId, userId: user.id },
    req,
  });

  return ok(
    {
      id: participant.id,
      challenge_id: challenge.id,
      challenge_title: challenge.title,
      user_id: user.id,
      score: participant.score,
      joined_at: participant.joined_at,
      message: "Berhasil bergabung ke tantangan",
    },
    undefined,
    201
  );
});
