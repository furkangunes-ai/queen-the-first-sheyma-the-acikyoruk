import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/student/subjects?examType=tyt|ayt|both
 *
 * Öğrencinin sınav türüne göre ders listesini döndürür.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const examType = request.nextUrl.searchParams.get("examType") || "both";

    // Kullanıcının examTrack'i
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examTrack: true },
    });
    const examTrack = user?.examTrack;

    // Sınav türü filtresi
    const examTypeFilter: Record<string, string[]> = {
      tyt: ["TYT", "tyt"],
      ayt: ["AYT", "ayt"],
      both: ["TYT", "tyt", "AYT", "ayt"],
    };

    const slugFilter = examTypeFilter[examType] || examTypeFilter.both;

    const subjects = await prisma.subject.findMany({
      where: {
        examType: {
          OR: [
            { slug: { in: slugFilter } },
            { name: { in: slugFilter } },
          ],
        },
      },
      include: {
        examType: { select: { name: true, id: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    // examTrack filtresi (AYT dersleri)
    const excluded: Record<string, string[]> = {
      sayisal: ["Edebiyat", "Tarih-2", "Coğrafya-2", "Felsefe Grubu"],
      ea: ["Fizik", "Kimya", "Biyoloji"],
      sozel: ["Fizik", "Kimya", "Biyoloji", "Matematik"],
    };
    const excludeList = examTrack ? (excluded[examTrack] || []) : [];

    const filtered = subjects.filter((s) => {
      const isAYT = s.examType.name === "AYT";
      if (isAYT && excludeList.includes(s.name)) return false;
      return true;
    });

    return NextResponse.json({
      subjects: filtered.map((s) => ({
        id: s.id,
        name: s.name,
        examTypeName: s.examType.name,
        examTypeId: s.examType.id,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
