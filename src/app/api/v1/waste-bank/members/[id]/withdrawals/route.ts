import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { route, readJson, ok, HttpError, num } from "@/server/http";
import { requireAuth, requireRole } from "@/server/auth/current-user";
import { assertLedgerAccess } from "@/server/services/waste-bank";
import { writeAudit } from "@/server/audit";

interface WithdrawalBody {
  amount?: unknown;
  notes?: unknown;
  method?: unknown; // tunai | transfer | sembako | dll
}

export const POST = route(async (req: NextRequest, context) => {
  const user = await requireAuth(req);
  requireRole(user, ["operator_bank_sampah", "super_admin"]);

  const { id } = await (context.params ?? Promise.resolve({ id: "" }));
  await assertLedgerAccess(user, id);

  const member = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, phone: true, email: true },
  });
  if (!member) throw new HttpError(404, "NOT_FOUND", "Nasabah tidak ditemukan");

  const body = await readJson<WithdrawalBody>(req);
  const amount = Math.floor(num(body.amount));
  if (amount <= 0) {
    throw new HttpError(400, "VALIDATION_ERROR", "Jumlah penarikan harus lebih dari 0");
  }

  const notes = typeof body.notes === "string" ? body.notes.trim() : "Penarikan saldo tabungan";
  const method = typeof body.method === "string" ? body.method.trim() : "tunai";

  const result = await prisma.$transaction(async (tx) => {
    const aggregate = await tx.ledgerEntry.aggregate({
      where: { member_id: id },
      _sum: { amount: true },
    });
    const currentBalance = num(aggregate._sum.amount);

    if (currentBalance < amount) {
      throw new HttpError(
        400,
        "INSUFFICIENT_BALANCE",
        `Saldo nasabah tidak mencukupi (Saldo: Rp ${currentBalance.toLocaleString("id-ID")}, Penarikan: Rp ${amount.toLocaleString("id-ID")})`,
        { current_balance: currentBalance, requested_amount: amount }
      );
    }

    const newBalance = currentBalance - amount;

    const entry = await tx.ledgerEntry.create({
      data: {
        member_id: id,
        entry_type: "withdrawal",
        amount: -amount,
        balance_after: newBalance,
        actor_id: user.id,
      },
    });

    // Buat notifikasi otomatis ke nasabah
    await tx.notification.create({
      data: {
        user_id: id,
        type: "withdrawal_processed",
        payload: {
          title: "Penarikan Saldo Berhasil",
          amount,
          method,
          notes,
          balance_after: newBalance,
          operator_id: user.id,
        },
      },
    });

    return { entry, currentBalance, newBalance };
  });

  await writeAudit({
    actorId: user.id,
    action: "WITHDRAW_WASTE_BANK_BALANCE",
    entityType: "ledger_entry",
    entityId: result.entry.id,
    before: { balance: result.currentBalance },
    after: {
      amount,
      balance_after: result.newBalance,
      member_id: id,
      method,
      notes,
    },
    req,
  });

  return ok(
    {
      id: result.entry.id,
      member_id: id,
      member_name: member.name,
      entry_type: "withdrawal",
      amount_debited: amount,
      balance_after: result.newBalance,
      method,
      notes,
      created_at: result.entry.created_at,
      actor_id: user.id,
    },
    undefined,
    201
  );
});
