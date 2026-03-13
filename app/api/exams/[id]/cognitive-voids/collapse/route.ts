import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

/**
 * Süperpozisyon Çökmesi Endpoint'i
 *
 * Makro girişte oluşan null-questionNumber void'ları,
 * mikro girişlerle eşleştirir (questionNumber atar).
 *
 * POST /api/exams/{id}/cognitive-voids/collapse
 * Body: { subjectId, questionNumber, source }
 *
 * 1. Aynı exam+subject+source'da questionNumber=null olan bir void bul
 * 2. Varsa questionNumber'ı ata → void artık mikro
 * 3. Yoksa (tüm null void'lar tükendiyse) → yeni void oluştur + ExamSubjectResult güncelle
 */
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
    const { subjectId, questionNumber, source } = body;

    if (!subjectId || !questionNumber || !source) {
      return NextResponse.json(
        { error: "subjectId, questionNumber ve source gerekli" },
        { status: 400 }
      );
    }

    const voidSource = source === 'EMPTY' ? 'EMPTY' : 'WRONG';
    const qNum = Math.max(1, Math.round(questionNumber));

    // Aynı soru zaten var mı kontrol et
    const existing = await prisma.cognitiveVoid.findFirst({
      where: {
        examId: id,
        subjectId,
        questionNumber: qNum,
        source: voidSource,
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Null-questionNumber void bul (makro girişten kalan)
    const nullVoid = await prisma.cognitiveVoid.findFirst({
      where: {
        examId: id,
        subjectId,
        questionNumber: null,
        source: voidSource,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (nullVoid) {
      // Süperpozisyon çökmesi: questionNumber ata
      const updated = await prisma.cognitiveVoid.update({
        where: { id: nullVoid.id },
        data: { questionNumber: qNum },
        include: { subject: true, topic: true },
      });
      return NextResponse.json(updated);
    }

    // Tüm null void'lar tükenmiş → yeni void oluştur
    const newVoid = await prisma.cognitiveVoid.create({
      data: {
        examId: id,
        subjectId,
        source: voidSource,
        questionNumber: qNum,
        status: 'RAW',
        severity: 0.1,
        magnitude: 1,
        relapseCount: 0,
      },
      include: { subject: true, topic: true },
    });

    // ExamSubjectResult'taki count'u güncelle
    const countField = voidSource === 'WRONG' ? 'wrongCount' : 'emptyCount';
    await prisma.examSubjectResult.updateMany({
      where: { examId: id, subjectId },
      data: { [countField]: { increment: 1 } },
    });

    return NextResponse.json(newVoid, { status: 201 });
  } catch (error) {
    logApiError("exams/:id/cognitive-voids/collapse", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
