import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    const tasks = await prisma.task.findMany({
      where: {
        assignedById: userId,
        ...(folderId && { folderId }),
      },
      include: {
        folder: true,
        completions: {
          orderBy: { completedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    logApiError("tasks", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { title, description, folderId, priority, dueDate, isRecurring, recurrence } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Görev başlığı gerekli" },
        { status: 400 }
      );
    }

    if (!folderId) {
      return NextResponse.json(
        { error: "Klasör seçimi gerekli" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        folderId,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isRecurring: isRecurring ?? false,
        recurrence,
        assignedById: userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logApiError("tasks", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
