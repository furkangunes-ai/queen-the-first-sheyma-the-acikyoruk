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
    const metricId = searchParams.get("metricId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const entries = await prisma.metricEntry.findMany({
      where: {
        metric: { userId },
        ...(metricId && { metricId }),
        ...(startDate || endDate
          ? {
              date: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}),
      },
      include: {
        metric: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching metric entries:", error);
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
    const { metricId, value, date, note } = body;

    if (!metricId || value === undefined) {
      return NextResponse.json(
        { error: "Metric ID and value are required" },
        { status: 400 }
      );
    }

    // Verify the metric definition belongs to the user
    const definition = await prisma.metricDefinition.findFirst({
      where: { id: metricId, userId },
    });

    if (!definition) {
      return NextResponse.json(
        { error: "Metric definition not found" },
        { status: 404 }
      );
    }

    const entryDate = date ? new Date(date) : new Date();

    const entry = await prisma.metricEntry.upsert({
      where: {
        metricId_userId_date: {
          metricId,
          userId,
          date: entryDate,
        },
      },
      update: {
        value,
        ...(note !== undefined && { note }),
      },
      create: {
        metricId,
        userId,
        value,
        date: entryDate,
        note,
      },
      include: {
        metric: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating metric entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
