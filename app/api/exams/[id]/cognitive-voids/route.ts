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
    const { subjectId, topicId, errorReason, source, magnitude, notes, questionNumber } = body;

    if (!subjectId) {
      return NextResponse.json({ error: "Ders seçimi gerekli" }, { status: 400 });
    }

    const validReasons: ErrorReasonType[] = [
      'BILGI_EKSIKLIGI', 'ISLEM_HATASI', 'DIKKATSIZLIK',
      'SURE_YETISMEDI', 'KAVRAM_YANILGISI', 'SORU_KOKUNU_YANLIS_OKUMA'
    ];

    // errorReason nullable — RAW void'lar için null olabilir
    const reason: ErrorReasonType | null = validReasons.includes(errorReason) ? errorReason : null;
    const voidSource = source === 'EMPTY' ? 'EMPTY' : 'WRONG';
    const mag = Math.max(1, Math.round(magnitude || 1));
    const qNum = questionNumber ? Math.max(1, Math.round(questionNumber)) : null;

    // Status: topic ve reason varsa UNRESOLVED, yoksa RAW
    const status = (topicId && reason) ? 'UNRESOLVED' : 'RAW';

    // Topic weight: basit heuristic (topic varsa difficulty'den çek)
    let topicWeight = 2;
    if (topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        select: { difficulty: true },
      });
      if (topic) {
        topicWeight = topic.difficulty <= 2 ? 3 : topic.difficulty <= 3 ? 2 : 1;
      }
    }

    // Recidivism kontrolü: aynı subject+topic+errorReason'da RESOLVED void varsa nüksetme
    let relapseCount = 0;
    if (topicId && reason) {
      const resolvedVoid = await prisma.cognitiveVoid.findFirst({
        where: {
          exam: { userId },
          subjectId,
          topicId,
          errorReason: reason,
          status: 'RESOLVED',
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (resolvedVoid) {
        relapseCount = resolvedVoid.relapseCount + 1;
        // RESOLVED void'u REVIEW'a düşür
        await prisma.cognitiveVoid.update({
          where: { id: resolvedVoid.id },
          data: { status: 'REVIEW' },
        });
      }
    }

    const severity = calculateSeverity(reason, topicWeight, mag, relapseCount);

    // questionNumber bazlı unique: aynı soru iki kez girilmez
    if (qNum) {
      const existing = await prisma.cognitiveVoid.findFirst({
        where: {
          examId: id,
          subjectId,
          questionNumber: qNum,
          source: voidSource,
        },
      });

      if (existing) {
        // Mevcut void'u güncelle (süperpozisyon çökmesi: RAW → sınıflandırılmış)
        const updated = await prisma.cognitiveVoid.update({
          where: { id: existing.id },
          data: {
            ...(topicId && { topicId }),
            ...(reason && { errorReason: reason }),
            ...(status !== 'RAW' && { status }),
            severity,
            relapseCount,
            notes: notes || existing.notes,
          },
          include: { subject: true, topic: true },
        });
        return NextResponse.json(updated);
      }
    }

    // Yeni void oluştur
    const cognitiveVoid = await prisma.cognitiveVoid.create({
      data: {
        examId: id,
        subjectId,
        topicId: topicId || null,
        errorReason: reason,
        source: voidSource,
        magnitude: mag,
        status,
        severity,
        questionNumber: qNum,
        relapseCount,
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
