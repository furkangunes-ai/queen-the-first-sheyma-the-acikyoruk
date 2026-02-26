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
    const weekStartDate = searchParams.get("weekStartDate");

    if (!weekStartDate) {
      // Return latest analysis
      const analysis = await prisma.weeklyAnalysis.findFirst({
        where: { userId },
        orderBy: { weekStartDate: "desc" },
      });
      return NextResponse.json(analysis);
    }

    const analysis = await prisma.weeklyAnalysis.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: new Date(weekStartDate),
        },
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error fetching weekly analysis:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
