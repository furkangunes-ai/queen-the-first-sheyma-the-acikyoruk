import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import { calculateSeverity, type ErrorReasonType } from "@/lib/severity";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; voidId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id, voidId } = await params;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.cognitiveVoid.findFirst({
      where: { id: voidId, examId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Zafiyet bulunamadı" }, { status: 404 });
    }

    const body = await request.json();
    const { status, topicId, errorReason, notes } = body;

    const updateData: Record<string, any> = {};

    // Status güncellemesi (tek dokunuşluk durum değiştirme)
    const validStatuses = ['UNRESOLVED', 'REVIEW', 'RESOLVED'];
    if (status && validStatuses.includes(status)) {
      updateData.status = status;
    }

    if (topicId !== undefined) updateData.topicId = topicId || null;

    const validReasons: ErrorReasonType[] = [
      'BILGI_EKSIKLIGI', 'ISLEM_HATASI', 'DIKKATSIZLIK',
      'SURE_YETISMEDI', 'KAVRAM_YANILGISI', 'SORU_KOKUNU_YANLIS_OKUMA'
    ];
    if (errorReason && validReasons.includes(errorReason)) {
      updateData.errorReason = errorReason;
    }

    if (notes !== undefined) updateData.notes = notes || null;

    // RAW → UNRESOLVED: topic ve reason ikisi de verilmişse otomatik geçiş
    const finalTopicId = updateData.topicId !== undefined ? updateData.topicId : existing.topicId;
    const finalReason = updateData.errorReason || existing.errorReason;
    if (existing.status === 'RAW' && finalTopicId && finalReason && !updateData.status) {
      updateData.status = 'UNRESOLVED';
    }

    // Severity yeniden hesapla (reason değiştiyse veya topic eklendiyse)
    if (updateData.errorReason || updateData.topicId) {
      let topicWeight = 2;
      const tid = finalTopicId;
      if (tid) {
        const topic = await prisma.topic.findUnique({
          where: { id: tid },
          select: { difficulty: true },
        });
        if (topic) {
          topicWeight = topic.difficulty <= 2 ? 3 : topic.difficulty <= 3 ? 2 : 1;
        }
      }
      updateData.severity = calculateSeverity(
        finalReason as ErrorReasonType | null,
        topicWeight,
        existing.magnitude,
        existing.relapseCount
      );
    }

    const updated = await prisma.cognitiveVoid.update({
      where: { id: voidId },
      data: updateData,
      include: {
        subject: true,
        topic: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logApiError("exams/:id/cognitive-voids/:voidId", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; voidId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id, voidId } = await params;

    const exam = await prisma.exam.findFirst({
      where: { id, userId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 });
    }

    await prisma.cognitiveVoid.delete({
      where: { id: voidId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("exams/:id/cognitive-voids/:voidId", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
