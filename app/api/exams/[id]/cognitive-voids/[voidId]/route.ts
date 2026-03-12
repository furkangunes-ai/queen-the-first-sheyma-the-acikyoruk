import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";
import type { ErrorReasonType } from "@/lib/severity";

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
