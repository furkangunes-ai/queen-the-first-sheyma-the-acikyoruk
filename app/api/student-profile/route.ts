import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

// GET — Mevcut profili getir
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const [profile, user] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { examTrack: true } }),
    ]);

    return NextResponse.json({ ...profile, examTrack: user?.examTrack ?? null });
  } catch (error) {
    logApiError("student-profile", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// PATCH — Tekil alan güncelleme (dailyStudyHours, examDate vs.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { dailyStudyHours, availableDays, studyRegularity, breakPreference, examDate, targetRank, examTrack } = body;

    // examTrack -> User model
    if (examTrack !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { examTrack: examTrack || null },
      });
    }

    const updateData: any = {};
    if (dailyStudyHours !== undefined) updateData.dailyStudyHours = dailyStudyHours;
    if (availableDays !== undefined) updateData.availableDays = availableDays;
    if (studyRegularity !== undefined) updateData.studyRegularity = studyRegularity;
    if (breakPreference !== undefined) updateData.breakPreference = breakPreference;
    if (examDate !== undefined) updateData.examDate = examDate ? new Date(examDate) : null;
    if (targetRank !== undefined) updateData.targetRank = targetRank;

    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examTrack: true },
    });

    return NextResponse.json({ ...profile, examTrack: user?.examTrack ?? null });
  } catch (error) {
    logApiError("student-profile PATCH", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// PUT — Profil oluştur veya güncelle (upsert)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { dailyStudyHours, availableDays, studyRegularity, breakPreference, examDate, targetRank, examTrack } = body;

    // examTrack is stored on User model, not StudentProfile
    if (examTrack !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { examTrack: examTrack || null },
      });
    }

    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...(dailyStudyHours !== undefined && { dailyStudyHours }),
        ...(availableDays !== undefined && { availableDays }),
        ...(studyRegularity !== undefined && { studyRegularity }),
        ...(breakPreference !== undefined && { breakPreference }),
        ...(examDate !== undefined && { examDate: examDate ? new Date(examDate) : null }),
        ...(targetRank !== undefined && { targetRank }),
      },
      create: {
        userId,
        dailyStudyHours,
        availableDays,
        studyRegularity,
        breakPreference,
        examDate: examDate ? new Date(examDate) : null,
        targetRank,
      },
    });

    // Return profile with examTrack from User
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examTrack: true },
    });

    return NextResponse.json({ ...profile, examTrack: user?.examTrack ?? null });
  } catch (error) {
    logApiError("student-profile", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
