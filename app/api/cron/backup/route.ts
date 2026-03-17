/**
 * Cron Backup Endpoint
 *
 * Günlük otomatik yedekleme yapılır. Pazartesi günleri haftalık,
 * ayın 1'inde aylık yedek de alınır.
 *
 * Güvenlik: CRON_SECRET environment variable ile korunur.
 * Railway Cron veya harici cron servisinden çağrılır.
 *
 * Çağrı: GET /api/cron/backup?secret=xxx
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createAllUsersBackup,
  cleanupExpiredBackups,
  getBackupTypesForToday,
} from "@/lib/backup-engine";
import { logApiError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Güvenlik: CRON_SECRET ile korunur
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backupTypes = getBackupTypesForToday();
    const allResults = [];

    for (const type of backupTypes) {
      const results = await createAllUsersBackup(type);
      allResults.push({ type, users: results.length, results });
    }

    // Süresi dolmuş yedekleri temizle
    const cleanedCount = await cleanupExpiredBackups();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      backupTypes,
      totalBackups: allResults.reduce(
        (sum, r) => sum + r.results.reduce((s, u) => s + u.snapshots.length, 0),
        0
      ),
      cleanedExpired: cleanedCount,
      details: allResults,
    });
  } catch (error) {
    logApiError("cron/backup", error);
    return NextResponse.json({ error: "Backup hatası" }, { status: 500 });
  }
}
