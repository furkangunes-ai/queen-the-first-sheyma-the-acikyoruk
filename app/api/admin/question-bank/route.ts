import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

function adminGuard(session: any) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin")
    return { error: "Forbidden", status: 403 };
  return null;
}

// ---------------------------------------------------------------------------
// GET — List question banks with counts, filterable by subject/topic
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const topicId = searchParams.get("topicId");

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (topicId) where.topicId = topicId;

    const banks = await prisma.questionBank.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(banks);
  } catch (error) {
    logApiError("admin/question-bank GET", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Bulk import questions as JSON
// Body: { title?, subjectId, topicId?, difficulty?, questions: [{question, options, correctAnswer, explanation?}] }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const userId = (session!.user as any).id;
    const body = await request.json();
    const { title, subjectId, topicId, difficulty, questions } = body;

    if (!subjectId) {
      return NextResponse.json({ error: "subjectId gerekli" }, { status: 400 });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "questions dizisi boş olamaz" }, { status: 400 });
    }

    // Validate each question
    const errors: string[] = [];
    questions.forEach((q: any, i: number) => {
      if (!q.question || typeof q.question !== "string") {
        errors.push(`Soru ${i + 1}: 'question' alanı eksik`);
      }
      if (!Array.isArray(q.options) || q.options.length < 4 || q.options.length > 5) {
        errors.push(`Soru ${i + 1}: 'options' 4 veya 5 şık olmalı`);
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer >= (q.options?.length || 5)) {
        errors.push(`Soru ${i + 1}: 'correctAnswer' geçersiz (0-${(q.options?.length || 5) - 1} arası)`);
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: "Doğrulama hataları", details: errors }, { status: 400 });
    }

    // Create QuestionBank with items in a transaction
    const bank = await prisma.questionBank.create({
      data: {
        type: "mcq",
        title: title || `Import — ${new Date().toLocaleDateString("tr-TR")}`,
        difficulty: difficulty || 3,
        subjectId,
        topicId: topicId || null,
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
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json(bank, { status: 201 });
  } catch (error) {
    logApiError("admin/question-bank POST", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — Delete a question bank and all its questions
// Query: ?id=xxx
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

    await prisma.questionBank.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("admin/question-bank DELETE", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
