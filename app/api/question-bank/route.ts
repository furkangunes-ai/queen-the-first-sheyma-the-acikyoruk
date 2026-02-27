import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/question-bank
 * Soru bankası listesi. Query params: type, difficulty, limit, random
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "paragraph";
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20");
    const random = searchParams.get("random") === "true";

    const where: any = { type };
    if (difficulty) {
      where.difficulty = parseInt(difficulty);
    }

    let questionBanks;

    if (random) {
      // Get random items using raw query for better randomization
      const count = await prisma.questionBank.count({ where });
      const skip = Math.max(0, Math.floor(Math.random() * (count - limit)));
      questionBanks = await prisma.questionBank.findMany({
        where,
        include: {
          questions: { orderBy: { sortOrder: "asc" } },
          creator: { select: { displayName: true } },
        },
        skip,
        take: limit,
      });
    } else {
      questionBanks = await prisma.questionBank.findMany({
        where,
        include: {
          questions: { orderBy: { sortOrder: "asc" } },
          creator: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    }

    return NextResponse.json(questionBanks);
  } catch (error) {
    console.error("Error fetching question bank:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/question-bank
 * Yeni paragraf + sorular oluştur (admin only).
 * Body: { type, difficulty, title, content, questions: [{ question, options, correctAnswer, explanation }] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const userRole = (session.user as any).role;

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { type, difficulty, title, content, questions } = await request.json();

    if (!type || !content || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "type, content, and questions are required" },
        { status: 400 }
      );
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json(
          { error: "Each question must have question text and at least 2 options" },
          { status: 400 }
        );
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return NextResponse.json(
          { error: "correctAnswer must be a valid index" },
          { status: 400 }
        );
      }
    }

    const questionBank = await prisma.questionBank.create({
      data: {
        type,
        difficulty: difficulty || 3,
        title: title || null,
        content,
        createdBy: userId,
        questions: {
          create: questions.map((q: any, i: number) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            sortOrder: i,
          })),
        },
      },
      include: {
        questions: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json(questionBank);
  } catch (error) {
    console.error("Error creating question bank:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/question-bank?id=xxx
 * Admin only.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.questionBank.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question bank:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
