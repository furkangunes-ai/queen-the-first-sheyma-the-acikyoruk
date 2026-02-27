import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — Mevcut profili getir
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT — Profil oluştur veya güncelle (upsert)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { dailyStudyHours, availableDays, studyRegularity, breakPreference, examDate, targetRank } = body;

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

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
