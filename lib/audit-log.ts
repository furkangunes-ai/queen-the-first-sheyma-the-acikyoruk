import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

/**
 * Admin işlemlerini audit log'a kaydet.
 * DB hatası ana akışı bozmamalı — fire-and-forget.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId: entityId || null,
        details: details ? (details as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (error) {
    // Audit log yazma hatası ana işlemi engellemez
    logger.warn({ error, adminId, action, entityType }, "Audit log yazma hatası");
  }
}
