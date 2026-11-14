import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { __pilahyukPrisma?: PrismaClient };

export const prisma =
  globalForPrisma.__pilahyukPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__pilahyukPrisma = prisma;
}
