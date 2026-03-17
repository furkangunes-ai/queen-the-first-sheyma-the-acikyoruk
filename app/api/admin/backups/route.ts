import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit-log";
import { logApiError } from "@/lib/logger";
import {
  createUserBackup,
  createAllUsersBackup,
  cleanupExpiredBackups,
  getAvailableBackups,
  getBackupData,
  restoreFromBackup,
} from "@/lib/backup-engine";

function adminGuard(session: any) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin")
    return { error: "Forbidden", status: 403 };
  return null;
}

// ---------------------------------------------------------------------------
// GET — List backups
// Query: ?userId=xxx (specific user) or ?mode=summary (overall stats)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const mode = searchParams.get("mode");

    if (mode === "summary") {
      // Genel yedekleme istatistikleri
      const [totalBackups, totalSize, byType, recentBackups] = await Promise.all([
        prisma.dataBackup.count(),
        prisma.dataBackup.aggregate({ _sum: { sizeBytes: true } }),
        prisma.dataBackup.groupBy({
          by: ["backupType"],
          _count: true,
          _sum: { sizeBytes: true },
        }),
        prisma.dataBackup.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            backupType: true,
            dataType: true,
            recordCount: true,
            sizeBytes: true,
            createdAt: true,
            expiresAt: true,
            user: { select: { displayName: true, username: true } },
          },
        }),
      ]);

      return NextResponse.json({
        totalBackups,
        totalSizeBytes: totalSize._sum.sizeBytes || 0,
        byType,
        recentBackups,
      });
    }

    if (userId) {
      const backups = await getAvailableBackups(userId);
      return NextResponse.json(backups);
    }

    // Tüm kullanıcılar için özet
    const backups = await prisma.dataBackup.findMany({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        backupType: true,
        dataType: true,
        recordCount: true,
        sizeBytes: true,
        createdAt: true,
        expiresAt: true,
        user: { select: { id: true, displayName: true, username: true } },
      },
    });

    return NextResponse.json(backups);
  } catch (error) {
    logApiError("admin/backups GET", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Manual backup trigger or restore
// Body: { action: "backup_user", userId, backupType }
//    or { action: "backup_all", backupType }
//    or { action: "restore_preview", backupId, userId }
//    or { action: "cleanup" }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const body = await request.json();
    const { action } = body;
    const adminId = (session!.user as any).id;

    if (action === "backup_user") {
      const { userId, backupType = "daily" } = body;
      if (!userId) return NextResponse.json({ error: "userId gerekli" }, { status: 400 });

      const result = await createUserBackup(userId, backupType);
      await logAdminAction(adminId, "manual_backup_user", "DataBackup", userId, {
        backupType,
        snapshotCount: result.snapshots.length,
      });

      return NextResponse.json({ success: true, result });
    }

    if (action === "backup_all") {
      const { backupType = "daily" } = body;
      const results = await createAllUsersBackup(backupType);
      await logAdminAction(adminId, "manual_backup_all", "DataBackup", null, {
        backupType,
        userCount: results.length,
      });

      return NextResponse.json({
        success: true,
        userCount: results.length,
        totalSnapshots: results.reduce((s, r) => s + r.snapshots.length, 0),
        results,
      });
    }

    if (action === "restore_preview") {
      const { backupId, userId } = body;
      if (!backupId || !userId) {
        return NextResponse.json({ error: "backupId ve userId gerekli" }, { status: 400 });
      }

      const backup = await getBackupData(backupId, userId);
      if (!backup) {
        return NextResponse.json({ error: "Yedek bulunamadı" }, { status: 404 });
      }

      return NextResponse.json({
        id: backup.id,
        backupType: backup.backupType,
        dataType: backup.dataType,
        recordCount: backup.recordCount,
        sizeBytes: backup.sizeBytes,
        createdAt: backup.createdAt,
        preview: Array.isArray(backup.data) ? (backup.data as any[]).slice(0, 5) : backup.data,
        totalRecords: Array.isArray(backup.data) ? (backup.data as any[]).length : 1,
      });
    }

    if (action === "restore") {
      const { backupId, userId } = body;
      if (!backupId || !userId) {
        return NextResponse.json({ error: "backupId ve userId gerekli" }, { status: 400 });
      }

      // Güvenlik: Geri yükleme öncesi otomatik yedek al
      await createUserBackup(userId, "daily");

      const restoreResult = await restoreFromBackup(backupId, userId);
      await logAdminAction(adminId, "restore_backup", "DataBackup", backupId, {
        userId,
        dataType: restoreResult.dataType,
        restored: restoreResult.restored,
        skipped: restoreResult.skipped,
        errors: restoreResult.errors.length,
      });

      return NextResponse.json({ success: true, result: restoreResult });
    }

    if (action === "cleanup") {
      const cleaned = await cleanupExpiredBackups();
      await logAdminAction(adminId, "cleanup_backups", "DataBackup", null, { cleaned });
      return NextResponse.json({ success: true, cleanedCount: cleaned });
    }

    return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
  } catch (error) {
    logApiError("admin/backups POST", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
