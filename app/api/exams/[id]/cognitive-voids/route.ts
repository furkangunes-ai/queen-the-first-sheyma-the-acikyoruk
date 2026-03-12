import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { recordStudyForTopic } from "@/lib/cognitive-engine";
import { logApiError } from "@/lib/logger";
import { calculateSeverity, type ErrorReasonType } from "@/lib/severity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 });
    }

    const voids = await prisma.cognitiveVoid.findMany({
      where: { examId: id },
      include: {
        subject: true,
        topic: true,
      },
      orderBy: [{ severity: "desc" }, { magnitude: "desc" }],
    });

    return NextResponse.json(voids);
  } catch (error) {
    logApiError("exams/:id/cognitive-voids", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 });
    }

    const body = await request.json();
    const { subjectId, topicId, errorReason, source, magnitude, notes } = body;

    if (!subjectId) {
      return NextResponse.json({ error: "Ders seçimi gerekli" }, { status: 400 });
    }

    const validReasons: ErrorReasonType[] = [
      'BILGI_EKSIKLIGI', 'ISLEM_HATASI', 'DIKKATSIZLIK',
      'SURE_YETISMEDI', 'KAVRAM_YANILGISI', 'SORU_KOKUNU_YANLIS_OKUMA'
    ];
    const reason = validReasons.includes(errorReason) ? errorReason : 'BILGI_EKSIKLIGI';
    const voidSource = source === 'EMPTY' ? 'EMPTY' : 'WRONG';
    const mag = Math.max(1, Math.round(magnitude || 1));

    // Topic weight: basit heuristic (topic varsa difficulty'den çek)
    let topicWeight = 2;
    if (topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        select: { difficulty: true },
      });
      if (topic) {
        // Düşük zorluk + prerequisite = temel konu = yüksek ağırlık
        topicWeight = topic.difficulty <= 2 ? 3 : topic.difficulty <= 3 ? 2 : 1;
      }
    }

    const severity = calculateSeverity(reason, topicWeight, mag);

    // Upsert: Aynı composite key varsa magnitude güncelle
    const cognitiveVoid = await prisma.cognitiveVoid.upsert({
      where: {
        examId_subjectId_topicId_errorReason_source: {
          examId: id,
          subjectId,
          topicId: topicId || null,
          errorReason: reason,
          source: voidSource,
        },
      },
      update: {
        magnitude: { increment: mag },
        severity: { increment: severity },
        notes: notes || undefined,
      },
      create: {
        examId: id,
        subjectId,
        topicId: topicId || null,
        errorReason: reason,
        source: voidSource,
        magnitude: mag,
        severity,
        notes: notes || null,
      },
      include: {
        subject: true,
        topic: true,
      },
    });

    // Bilişsel çizge: zafiyet → mastery düşür
    if (topicId) {
      recordStudyForTopic(userId, topicId, 0.0).catch((err) =>
        logApiError("exams/:id/cognitive-voids", err)
      );
    }

    return NextResponse.json(cognitiveVoid, { status: 201 });
  } catch (error) {
    logApiError("exams/:id/cognitive-voids", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
