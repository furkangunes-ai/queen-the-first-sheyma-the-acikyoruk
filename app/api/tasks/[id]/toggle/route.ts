import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const task = await prisma.task.findFirst({
      where: { id, assignedById: userId },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Check if there is already a completion for today
    const existingCompletion = await prisma.taskCompletion.findFirst({
      where: {
        taskId: id,
        completedAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    if (existingCompletion) {
      // Undo: delete today's completion
      await prisma.taskCompletion.delete({
        where: { id: existingCompletion.id },
      });

      // If task is not recurring, toggle completed back to false
      if (!task.isRecurring) {
        await prisma.task.update({
          where: { id },
          data: { completed: false },
        });
      }

      return NextResponse.json({
        toggled: false,
        message: "Task completion removed for today",
      });
    } else {
      // Complete: create a new completion record
      const completion = await prisma.taskCompletion.create({
        data: {
          taskId: id,
          userId,
          completedAt: now,
        },
      });

      // If task is not recurring, mark as completed
      if (!task.isRecurring) {
        await prisma.task.update({
          where: { id },
          data: { completed: true },
        });
      }

      return NextResponse.json({
        toggled: true,
        completion,
        message: "Task completed for today",
      });
    }
  } catch (error) {
    console.error("Error toggling task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
