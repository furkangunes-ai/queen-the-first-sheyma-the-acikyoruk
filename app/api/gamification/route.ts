import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUserGamificationData, updateDailyStudyStreak } from "@/lib/streak-engine";

/**
 * GET /api/gamification
 * Kullanıcının streak ve rozet verilerini döner.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const data = await getUserGamificationData(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gamification
 * Streak'i güncelle (çalışma kaydedildikten sonra çağrılır).
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;

    const result = await updateDailyStudyStreak(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
