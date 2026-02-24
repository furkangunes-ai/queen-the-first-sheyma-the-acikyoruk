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

    const definitions = await prisma.metricDefinition.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(definitions);
  } catch (error) {
    console.error("Error fetching metric definitions:", error);
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
    const { name, unit, type, icon, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Metric name is required" },
        { status: 400 }
      );
    }

    const definition = await prisma.metricDefinition.create({
      data: {
        name,
        unit,
        type: type || "number",
        icon,
        color,
        userId,
      },
    });

    return NextResponse.json(definition, { status: 201 });
  } catch (error) {
    console.error("Error creating metric definition:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
