import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

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
      return NextResponse.json(
        { error: "Sınav bulunamadı" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { results } = body;

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Sonuç dizisi gerekli" },
        { status: 400 }
      );
    }
    if (results.length > 30) {
      return NextResponse.json(
        { error: "En fazla 30 ders sonucu gönderilebilir" },
        { status: 400 }
      );
    }

    // Validate each result entry
    for (const result of results) {
      if (!result.subjectId || result.correctCount === undefined || result.wrongCount === undefined || result.emptyCount === undefined) {
        return NextResponse.json(
          { error: "Her sonuçta subjectId, correctCount, wrongCount ve emptyCount olmalı" },
          { status: 400 }
        );
      }
      // Sayısal validasyon
      const { correctCount, wrongCount, emptyCount } = result;
      if (!Number.isInteger(correctCount) || !Number.isInteger(wrongCount) || !Number.isInteger(emptyCount)) {
        return NextResponse.json(
          { error: "correctCount, wrongCount ve emptyCount tam sayı olmalı" },
          { status: 400 }
        );
      }
      if (correctCount < 0 || wrongCount < 0 || emptyCount < 0) {
        return NextResponse.json(
          { error: "Sayılar negatif olamaz" },
          { status: 400 }
        );
      }
    }

    // Validate all subjectIds exist and belong to the exam's examType
    const subjectIds = results.map((r: any) => r.subjectId);
    const validSubjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds }, examTypeId: exam.examTypeId },
      select: { id: true },
    });
    const validSubjectIds = new Set(validSubjects.map((s) => s.id));
    const invalidIds = subjectIds.filter((id: string) => !validSubjectIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: "Geçersiz ders seçimi: bazı dersler bu sınav türüne ait değil" },
        { status: 400 }
      );
    }

    // ── Fetch old results for void sync comparison ──
    const oldResults = await prisma.examSubjectResult.findMany({
      where: { examId: id },
      select: { subjectId: true, wrongCount: true, emptyCount: true },
    });
    const oldMap = new Map(oldResults.map(r => [r.subjectId, r]));

    // Delete existing results for this exam, then create new ones
    await prisma.examSubjectResult.deleteMany({
      where: { examId: id },
    });

    const subjectResults = await prisma.examSubjectResult.createMany({
      data: results.map((result: { subjectId: string; correctCount: number; wrongCount: number; emptyCount: number }) => ({
        examId: id,
        subjectId: result.subjectId,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        emptyCount: result.emptyCount,
        netScore: result.correctCount - (result.wrongCount / 4),
      })),
    });

    // ── Void Senkronizasyonu ──
    // Yanlış/boş sayısı arttıysa yeni RAW void oluştur
    // Azaldıysa fazla RAW void'ları sil (en düşük bilgi değerindekileri)
    const voidSyncSummary: Array<{ subjectId: string; created: number; removed: number }> = [];

    for (const result of results as Array<{ subjectId: string; correctCount: number; wrongCount: number; emptyCount: number }>) {
      const old = oldMap.get(result.subjectId);
      const oldWrong = old?.wrongCount ?? 0;
      const oldEmpty = old?.emptyCount ?? 0;
      const newWrong = result.wrongCount;
      const newEmpty = result.emptyCount;

      let created = 0;
      let removed = 0;

      // Handle WRONG count changes
      const wrongDiff = newWrong - oldWrong;
      if (wrongDiff > 0) {
        // Create new RAW voids for added wrong answers
        const voidData = Array.from({ length: wrongDiff }, () => ({
          examId: id,
          subjectId: result.subjectId,
          source: "WRONG" as const,
          status: "RAW" as const,
          magnitude: 1,
          severity: 0.1,
          relapseCount: 0,
        }));
        await prisma.cognitiveVoid.createMany({ data: voidData });
        created += wrongDiff;
      } else if (wrongDiff < 0) {
        // Remove excess RAW WRONG voids (only unclassified ones)
        const excessRawVoids = await prisma.cognitiveVoid.findMany({
          where: {
            examId: id,
            subjectId: result.subjectId,
            source: "WRONG",
            status: "RAW",
            topicId: null,
            errorReason: null,
          },
          orderBy: { createdAt: "desc" },
          take: Math.abs(wrongDiff),
          select: { id: true },
        });
        if (excessRawVoids.length > 0) {
          await prisma.cognitiveVoid.deleteMany({
            where: { id: { in: excessRawVoids.map(v => v.id) } },
          });
          removed += excessRawVoids.length;
        }
      }

      // Handle EMPTY count changes
      const emptyDiff = newEmpty - oldEmpty;
      if (emptyDiff > 0) {
        const voidData = Array.from({ length: emptyDiff }, () => ({
          examId: id,
          subjectId: result.subjectId,
          source: "EMPTY" as const,
          status: "RAW" as const,
          magnitude: 1,
          severity: 0.1,
          relapseCount: 0,
        }));
        await prisma.cognitiveVoid.createMany({ data: voidData });
        created += emptyDiff;
      } else if (emptyDiff < 0) {
        const excessRawVoids = await prisma.cognitiveVoid.findMany({
          where: {
            examId: id,
            subjectId: result.subjectId,
            source: "EMPTY",
            status: "RAW",
            topicId: null,
            errorReason: null,
          },
          orderBy: { createdAt: "desc" },
          take: Math.abs(emptyDiff),
          select: { id: true },
        });
        if (excessRawVoids.length > 0) {
          await prisma.cognitiveVoid.deleteMany({
            where: { id: { in: excessRawVoids.map(v => v.id) } },
          });
          removed += excessRawVoids.length;
        }
      }

      if (created > 0 || removed > 0) {
        voidSyncSummary.push({ subjectId: result.subjectId, created, removed });
      }
    }

    // Compute total net score locally for the response
    const totalNet = results.reduce(
      (sum: number, r: { correctCount: number; wrongCount: number }) =>
        sum + (r.correctCount - (r.wrongCount / 4)),
      0
    );

    // Fetch the created results with relations
    const createdResults = await prisma.examSubjectResult.findMany({
      where: { examId: id },
      include: { subject: true },
    });

    // Fetch updated voids
    const updatedVoids = await prisma.cognitiveVoid.findMany({
      where: { examId: id },
      include: { subject: true, topic: true },
      orderBy: [{ severity: "desc" }, { magnitude: "desc" }],
    });

    return NextResponse.json(
      { results: createdResults, totalNet, voidSyncSummary, cognitiveVoids: updatedVoids },
      { status: 201 }
    );
  } catch (error) {
    logApiError("exams/:id/results", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
