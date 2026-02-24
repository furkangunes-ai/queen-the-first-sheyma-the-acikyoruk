import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { mood, energy, sleep, gratitude, notes, date } = body;

    // Use provided date or default to today
    const checkInDate = date ? new Date(date) : new Date();
    const dateOnly = new Date(
      checkInDate.getFullYear(),
      checkInDate.getMonth(),
      checkInDate.getDate()
    );

    // Upsert: create or update the check-in for this date
    const checkIn = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId,
          date: dateOnly,
        },
      },
      update: {
        ...(mood !== undefined && { mood }),
        ...(energy !== undefined && { energy }),
        ...(sleep !== undefined && { sleep }),
        ...(gratitude !== undefined && { gratitude }),
        ...(notes !== undefined && { notes }),
      },
      create: {
        userId,
        date: dateOnly,
        mood,
        energy,
        sleep,
        gratitude,
        notes,
      },
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating check-in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
