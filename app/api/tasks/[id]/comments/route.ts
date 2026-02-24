import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    // Verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: { id, assignedById: userId },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId: id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Verify the task exists and user is authorized to comment
    const task = await prisma.task.findFirst({
      where: { id },
      include: { folder: { select: { userId: true } } },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Allow comment if user is the task assigner, the task assignee (folder owner), or admin
    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isTaskAssigner = task.assignedById === userId;
    const isTaskOwner = task.folder?.userId === userId;
    const isAdmin = currentUser?.role === 'admin';

    if (!isTaskAssigner && !isTaskOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Not authorized to comment on this task" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, isEncouragement } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    const comment = await prisma.taskComment.create({
      data: {
        content,
        isEncouragement: isEncouragement ?? false,
        taskId: id,
        authorId: userId,
      },
      include: { author: true },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
