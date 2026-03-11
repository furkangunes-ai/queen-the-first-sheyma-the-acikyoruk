import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Production'da sadece error logla, dev'de warn de göster
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    // Connection pool: DATABASE_URL'de ?connection_limit=20&pool_timeout=10 eklenebilir
    // Prisma default: 10 connection. 10K kullanıcı için 20-30 önerilir.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
