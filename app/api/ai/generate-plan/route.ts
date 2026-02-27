import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const SYSTEM_PROMPT_PLAN = `Sen bir YKS haftalık plan oluşturma asistanısın. Türkçe konuş.
Öğrencinin zayıf konularına, son deneme sonuçlarına ve geçmiş çalışma verilerine göre
kişiselleştirilmiş bir haftalık çalışma planı oluştur.

KURALLAR:
- Haftalık toplam 15-25 saat arası olmalı
- Zayıf konulara (bilgi seviyesi 0-2) daha fazla ağırlık ver
- Her gün 2-4 ders arası olmalı
- Hafta sonları biraz daha yoğun olabilir
- Ders süreleri 30-90 dakika arası olmalı
- Konu belirtilmemişse sadece ders adı yeterli

Eğer öğrenci tercihleri verilmişse bunları mutlaka dikkate al:
- Müsait olmayan günlere az veya hiç konu koyma
- Fazladan çalışılabilecek günlere daha fazla yükle
- Günlük çalışma saatine göre toplam süreyi ayarla (örn: 2-3 saat diyorsa haftalık 14-21 saat arası)
- Plana uyum düşükse daha esnek ve hafif bir plan yap
- Çalışma düzeni düzensizse motivasyon artırıcı kısa oturumlar öner
- Dinlenme tercihine uygun ders süreleri belirle (sık mola istiyorsa 30-40dk, uzun oturum istiyorsa 60-90dk)

JSON formatında yanıt ver, başka bir şey yazma. Format:
{
  "title": "Haftalık Plan Başlığı",
  "items": [
    {
      "dayOfWeek": 0,
      "subjectName": "Matematik",
      "topicName": "Türev",
      "duration": 60,
      "notes": "Kısa not (opsiyonel)"
    }
  ],
  "explanation": "Neden bu planı oluşturduğuna dair 2-3 cümle açıklama"
}

dayOfWeek: 0=Pazartesi, 1=Salı, 2=Çarşamba, 3=Perşembe, 4=Cuma, 5=Cumartesi, 6=Pazar`;

interface PlanItem {
  dayOfWeek: number;
  subjectName: string;
  topicName?: string;
  duration: number;
  notes?: string;
}

interface AIPlanResponse {
  title: string;
  items: PlanItem[];
  explanation: string;
}

export async function POST(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    const { weekStartDate, weekEndDate, preferences } = await request.json();
    if (!weekStartDate || !weekEndDate) {
      return NextResponse.json(
        { error: "weekStartDate and weekEndDate required" },
        { status: 400 }
      );
    }

    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);

    // Check if plan already exists for this week
    const existingPlan = await prisma.weeklyPlan.findFirst({
      where: {
        userId,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
    if (existingPlan) {
      return NextResponse.json(
        { error: "Bu hafta için zaten bir plan mevcut. Önce mevcut planı silin." },
        { status: 409 }
      );
    }

    // 1. Gather context data in parallel (token-efficient)
    const [weakTopics, recentExam, studyDistribution, recentInsights, allSubjects] =
      await Promise.all([
        // Weak topics (knowledge level 0-3)
        prisma.topicKnowledge.findMany({
          where: { userId, level: { lte: 3 } },
          include: { topic: { include: { subject: { include: { examType: true } } } } },
          orderBy: { level: "asc" },
          take: 20,
        }),
        // Most recent exam
        prisma.exam.findFirst({
          where: { userId },
          include: {
            subjectResults: { include: { subject: true } },
            examType: true,
          },
          orderBy: { date: "desc" },
        }),
        // Last 2 weeks study distribution
        prisma.dailyStudy.groupBy({
          by: ["subjectId"],
          where: {
            userId,
            date: {
              gte: new Date(start.getTime() - 14 * 24 * 60 * 60 * 1000),
              lt: start,
            },
          },
          _sum: { duration: true, questionCount: true },
        }),
        // Recent AI insights (last 2, brief)
        prisma.aIInsight.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 2,
          select: { title: true, content: true },
        }),
        // All subjects for ID matching
        prisma.subject.findMany({
          include: { topics: true, examType: true },
        }),
      ]);

    // Build subject name → ID map
    const subjectNameMap = new Map<string, string>();
    const topicNameMap = new Map<string, string>(); // "SubjectName-TopicName" → topicId
    for (const subject of allSubjects) {
      subjectNameMap.set(subject.name.toLowerCase(), subject.id);
      // Also map with exam type prefix for disambiguation
      subjectNameMap.set(
        `${subject.examType.name.toLowerCase()}-${subject.name.toLowerCase()}`,
        subject.id
      );
      for (const topic of subject.topics) {
        topicNameMap.set(
          `${subject.name.toLowerCase()}-${topic.name.toLowerCase()}`,
          topic.id
        );
      }
    }

    // Get subject names for study distribution
    const subjectIds = studyDistribution.map((s) => s.subjectId);
    const subjectNames = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true },
    });
    const subjectIdToName = new Map(subjectNames.map((s) => [s.id, s.name]));

    // 2. Build compact context (~800 tokens max)
    const weakTopicsStr = weakTopics
      .map(
        (tk) =>
          `${tk.topic.subject.name}-${tk.topic.name}(${tk.level})`
      )
      .join(", ");

    const examStr = recentExam
      ? `Son deneme (${recentExam.examType.name}): ${recentExam.subjectResults
          .map((r) => `${r.subject.name}:${r.netScore.toFixed(1)}`)
          .join(", ")}`
      : "Henüz deneme kaydı yok.";

    const studyStr = studyDistribution
      .map((s) => {
        const name = subjectIdToName.get(s.subjectId) || "?";
        return `${name}:${s._sum.duration || 0}dk/${s._sum.questionCount || 0}soru`;
      })
      .join(", ");

    const insightsStr = recentInsights
      .map((i) => i.content.split(" ").slice(0, 50).join(" "))
      .join(" | ");

    // Build preferences context if provided by wizard
    const preferencesStr = preferences ? `

Öğrenci Tercihleri:
- Çalışma düzeni: ${preferences.study_regularity || "Belirtilmedi"}${preferences.study_regularity_note ? ` (Not: ${preferences.study_regularity_note})` : ""}
- Plana uyum: ${preferences.plan_adherence || "Belirtilmedi"}${preferences.plan_adherence_note ? ` (Not: ${preferences.plan_adherence_note})` : ""}
- Günlük çalışma: ${preferences.daily_hours || "Belirtilmedi"}${preferences.daily_hours_note ? ` (Not: ${preferences.daily_hours_note})` : ""}
- Dinlenme tercihi: ${preferences.break_preference || "Belirtilmedi"}${preferences.break_preference_note ? ` (Not: ${preferences.break_preference_note})` : ""}
- Müsait olmayan günler: ${preferences.unavailable_days || "Belirtilmedi"}${preferences.unavailable_days_note ? ` (Not: ${preferences.unavailable_days_note})` : ""}
- Fazladan çalışılabilecek günler: ${preferences.extra_days || "Belirtilmedi"}${preferences.extra_days_note ? ` (Not: ${preferences.extra_days_note})` : ""}` : "";

    const contextMessage = `Hafta: ${format(start, "d MMMM", { locale: tr })} - ${format(end, "d MMMM yyyy", { locale: tr })}

Zayıf konular (seviye 0-3): ${weakTopicsStr || "Henüz belirlenmemiş"}

${examStr}

Son 2 hafta çalışma dağılımı: ${studyStr || "Veri yok"}

${insightsStr ? `Geçmiş AI önerileri: ${insightsStr}` : ""}${preferencesStr}`.trim();

    // 3. Call OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_PLAN },
        { role: "user", content: contextMessage },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content || "";

    // 4. Parse JSON response
    let parsed: AIPlanResponse;
    try {
      // Extract JSON from response (in case AI wraps it in markdown code blocks)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI plan response:", rawResponse);
      return NextResponse.json(
        { error: "AI yanıtı işlenemedi. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // 5. Map AI subject/topic names to database IDs and create plan
    const plan = await prisma.$transaction(async (tx) => {
      const newPlan = await tx.weeklyPlan.create({
        data: {
          userId,
          title: parsed.title || `AI Planı — ${format(start, "d MMM", { locale: tr })}`,
          startDate: start,
          endDate: end,
          notes: parsed.explanation || undefined,
        },
      });

      let sortOrder = 0;
      for (const item of parsed.items) {
        // Find subject ID by name (case-insensitive)
        const subjectId = findSubjectId(item.subjectName, subjectNameMap, allSubjects);
        if (!subjectId) {
          console.warn(`Subject not found: ${item.subjectName}, skipping`);
          continue;
        }

        // Find topic ID if topic name provided
        let topicId: string | undefined;
        if (item.topicName) {
          const key = `${item.subjectName.toLowerCase()}-${item.topicName.toLowerCase()}`;
          topicId = topicNameMap.get(key) || undefined;
        }

        await tx.weeklyPlanItem.create({
          data: {
            weeklyPlanId: newPlan.id,
            dayOfWeek: Math.max(0, Math.min(6, item.dayOfWeek)),
            subjectId,
            topicId: topicId || undefined,
            duration: item.duration || 60,
            notes: item.notes || undefined,
            sortOrder: sortOrder++,
          },
        });
      }

      return tx.weeklyPlan.findUnique({
        where: { id: newPlan.id },
        include: {
          items: {
            include: { subject: true, topic: true },
            orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }],
          },
        },
      });
    });

    // 6. Save as AI Insight
    try {
      await prisma.aIInsight.create({
        data: {
          userId,
          type: "plan_generation",
          title: `AI Plan — ${format(start, "d MMM", { locale: tr })} - ${format(end, "d MMM", { locale: tr })}`,
          content: parsed.explanation || "AI tarafından oluşturulan haftalık plan.",
          context: { weakTopicsCount: weakTopics.length, examStr, itemCount: parsed.items.length },
          metadata: { planId: plan?.id, weekStart: weekStartDate, weekEnd: weekEndDate },
        },
      });
    } catch {
      // Insight save error shouldn't block the response
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error generating AI plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Fuzzy match subject name to ID. Tries exact match first, then partial.
 */
function findSubjectId(
  name: string,
  nameMap: Map<string, string>,
  allSubjects: { id: string; name: string }[]
): string | undefined {
  // Exact match (case-insensitive)
  const exact = nameMap.get(name.toLowerCase());
  if (exact) return exact;

  // Partial match
  for (const subject of allSubjects) {
    if (
      subject.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(subject.name.toLowerCase())
    ) {
      return subject.id;
    }
  }

  return undefined;
}
