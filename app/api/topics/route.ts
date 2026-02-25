import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Kullanicinin kendi konu eklemesi
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, subjectId } = body;

    if (!name || !subjectId) {
      return NextResponse.json({ error: "Name and subjectId required" }, { status: 400 });
    }

    // Check if topic already exists for this subject
    const existing = await prisma.topic.findFirst({
      where: { name: name.trim(), subjectId },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Get max sortOrder
    const maxTopic = await prisma.topic.findFirst({
      where: { subjectId },
      orderBy: { sortOrder: "desc" },
    });

    const topic = await prisma.topic.create({
      data: {
        name: name.trim(),
        subjectId,
        sortOrder: (maxTopic?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
