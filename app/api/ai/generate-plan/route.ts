import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const SYSTEM_PROMPT_PLAN_BASE = `Sen bir YKS haftalık plan oluşturma asistanısın. Türkçe konuş.
Öğrencinin zayıf konularına, son deneme sonuçlarına ve geçmiş çalışma verilerine göre
kişiselleştirilmiş bir haftalık çalışma planı oluştur.

KURALLAR:
- Zayıf konulara (bilgi seviyesi 0-2) daha fazla ağırlık ver
- Her gün 2-4 ders arası olmalı
- Hafta sonları biraz daha yoğun olabilir
- Ders süreleri 30-90 dakika arası olmalı
- HER plan maddesi için MUTLAKA topicName belirt (sadece ders adı yeterli DEĞİL, konu da ŞART)
- Mevcut konu listesine sadık kal, yeni konu uydurma

Eğer öğrenci tercihleri/cevapları verilmişse bunları mutlaka dikkate al:
- Müsait olmayan günlere az veya hiç konu koyma
- Fazladan çalışılabilecek günlere daha fazla yükle
- Günlük çalışma saatine göre toplam süreyi ayarla
- Çalışma düzeni düzensizse motivasyon artırıcı kısa oturumlar öner
- Dinlenme tercihine uygun ders süreleri belirle

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

dayOfWeek: 0=Pazartesi, 1=Salı, 2=Çarşamba, 3=Perşembe, 4=Cuma, 5=Cumartesi, 6=Pazar

ÖNEMLİ: topicName her maddede ZORUNLUDUR. Eğer bir konunun tam adını bilmiyorsan, en yakın konu adını yaz.

ZORUNLU KONU DAĞITIM KURALLARI:
- Her gün için bilinmeyen (seviye 0-1) konu sayısı EN FAZLA 1 olsun
- Her günde en az 1 bilinen konu (seviye 4-5) tekrar olarak konulsun (motivasyon)
- Gün içi sıralama: kolay konu → zor konu → kolay konu (nefes aldırma prensibi)
- Öğrenci 3 konu çalışacaksa: 1 bilinmeyen + 1 orta + 1 bilinen ideal dağılımdır

KONU ÖN-KOŞUL KURALLARI:
- İntegral planlamak için Türev en az seviye 2 olmalı
- Eğer ön-koşul bu hafta yeni öğreniliyorsa (seviye 0-1), bağımlı konuyu EN ERKEN 2 gün sonraya planla
- "hard" ön-koşullar kesinlikle uyulmalı, "soft" önerilir ama esnetilebilir

MÜFREDAT SIRASI KURALI (ÇOK ÖNEMLİ):
- Konular ÖSYM müfredat sırasına göre verilmiştir (en temelden en ileri seviyeye).
- Öğrencinin kazanım tamamlama oranı %70'in üzerindeki konuları "tamamlanmış" say.
- Tamamlanmış konulardan sonraki ilk "tamamlanmamış" konudan başlayarak plan yap.
- Sırayı atlamadan ilerle: Türev'i bitirmeden İntegral'e geçme, Kümeler'i bitirmeden Fonksiyonlar'a geçme.
- Eğer öğrenci müfredatın ortasındaysa, gerideki eksik konuları da plana al ama ağırlık ileriye olsun.
- Her ders için ayrı müfredat sırası takip et (Matematik sırası, Fizik sırası, vb.)

KONU AĞIRLIK KURALLARI:
- Zorluk 5 konulara tek oturumda en fazla 90dk ver, birden fazla güne yay
- Zorluk 1-2 konular tek oturumda tamamlanabilir (30-60dk)
- Tahmini toplam saati dikkate al: Türev ~6 saat, tek seferde bitirilemez
- Her konunun "duration" önerisini zorluk seviyesine göre belirle`;

interface ProfileInfo {
  dailyStudyHours: number;
  availableDays: number[];
  breakPreference: string | null;
  studyRegularity: string | null;
  targetRank: number | null;
  examDate: Date | null;
}

function buildProfilePromptAddon(profile: ProfileInfo): string {
  const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const daysStr = profile.availableDays.map((d) => DAY_LABELS[d] || `${d}`).join(", ");
  const availCount = profile.availableDays.length;
  const maxWeeklyHours = profile.dailyStudyHours * availCount;

  const breakLabel = profile.breakPreference === "25_5" ? "25/5 Pomodoro (kısa oturumlar)"
    : profile.breakPreference === "45_15" ? "45/15 (orta oturumlar)"
    : profile.breakPreference === "60_15" ? "60/15 (uzun oturumlar)"
    : null;

  let addon = `

=== ÖĞRENCİ PROFİL BİLGİLERİ ===
Öğrenci günlük ${profile.dailyStudyHours} saat çalışıyor.
Müsait günler: ${daysStr} (${availCount} gün)
Haftalık toplam planı ${maxWeeklyHours} saati AŞMAMALI.
Müsait olmayan günlere (${DAY_LABELS.filter((_, i) => !profile.availableDays.includes(i)).join(", ") || "yok"}) ders KOYMA.`;

  if (breakLabel) {
    addon += `\nMola tercihi: ${breakLabel} — ders sürelerini buna göre ayarla.`;
  }
  if (profile.studyRegularity === "duzensiz") {
    addon += `\nÇalışma düzeni düzensiz — motivasyon artırıcı kısa ve çeşitli oturumlar öner.`;
  }
  if (profile.targetRank) {
    addon += `\nHedef sıralama: ${profile.targetRank} — plan yoğunluğunu buna göre ayarla.`;
  }

  return addon;
}

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

interface WizardAnswer {
  questionId: string;
  question: string;
  selectedOption: string;
  customNote?: string;
}

interface FixedSubject {
  id: string;
  name: string;
  examType: string;
}

interface FixedAnswersContext {
  examScope: "tyt" | "ayt" | "both";
  selectedSubjects: FixedSubject[];
}

interface StudentProfileContext {
  dailyStudyHours: number | null;
  availableDays: number[];
  studyRegularity: string | null;
  breakPreference: string | null;
  examDate: string | null;
  targetRank: number | null;
}

interface WizardContext {
  analysis: string;
  weakAreas: string[];
  strongAreas?: string[];
  questions: WizardAnswer[];
  fixedAnswers?: FixedAnswersContext;
  studentProfile?: StudentProfileContext;
}

export async function POST(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;
    const { userId } = guard;

    // Fetch user's exam track and student profile
    const [user, studentProfile] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { examTrack: true } }),
      prisma.studentProfile.findUnique({ where: { userId } }),
    ]);
    const examTrack = user?.examTrack;

    const { weekStartDate, weekEndDate, preferences, wizardContext } = await request.json();
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
    const [weakTopics, allTopicKnowledge, recentExam, studyDistribution, recentInsights, allSubjects, prerequisites, kazanimCounts] =
      await Promise.all([
        // Weak topics (knowledge level 0-3)
        prisma.topicKnowledge.findMany({
          where: { userId, level: { lte: 3 } },
          include: { topic: { include: { subject: { include: { examType: true } } } } },
          orderBy: { level: "asc" },
          take: 20,
        }),
        // ALL topic knowledge for categorized view (Faz 4B)
        prisma.topicKnowledge.findMany({
          where: { userId },
          include: { topic: { include: { subject: true } } },
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
        // All subjects for ID matching (include topics with difficulty/estimatedHours for available topic list)
        prisma.subject.findMany({
          include: { topics: { orderBy: { sortOrder: "asc" } }, examType: true },
        }),
        // Topic prerequisites (Faz 4C)
        prisma.topicPrerequisite.findMany({
          include: { topic: true, prerequisite: true },
        }),
        // Kazanım completion counts per topic (for "kaldığı yerden devam" logic)
        prisma.$queryRaw<Array<{ topicId: string; total: bigint; checked: bigint }>>`
          SELECT tk."topicId",
                 COUNT(tk.id) as total,
                 COUNT(CASE WHEN kp.checked = true THEN 1 END) as checked
          FROM "TopicKazanim" tk
          LEFT JOIN "KazanimProgress" kp ON kp."kazanimId" = tk.id AND kp."userId" = ${userId}
          GROUP BY tk."topicId"
        `,
      ]);

    // Filter subjects by exam track
    // TYT subjects always shown; AYT subjects filtered by track
    const filteredSubjects = examTrack ? allSubjects.filter(s => {
      const isAYT = s.examType.slug === "ayt" || s.examType.name === "AYT";
      if (!isAYT) return true;
      const excluded: Record<string, string[]> = {
        sayisal: ["Edebiyat", "Tarih", "Coğrafya"],
        ea: ["Fizik", "Kimya", "Biyoloji"],
        sozel: ["Fizik", "Kimya", "Biyoloji", "Matematik"],
      };
      return !(excluded[examTrack] || []).includes(s.name);
    }) : allSubjects;

    // Build subject name → ID map
    const subjectNameMap = new Map<string, string>();
    const topicNameMap = new Map<string, string>(); // "SubjectName-TopicName" → topicId
    for (const subject of filteredSubjects) {
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

    // 2. Build compact context
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

    // Build kazanım completion map: topicId → { total, checked, pct }
    const kazanimCompletionMap = new Map<string, { total: number; checked: number; pct: number }>();
    for (const row of kazanimCounts) {
      const total = Number(row.total);
      const checked = Number(row.checked);
      const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
      kazanimCompletionMap.set(row.topicId, { total, checked, pct });
    }

    // Build available topics list for AI reference (with difficulty, hours, and curriculum ordering)
    // Topics are already sorted by sortOrder from the query
    const availableTopicsStr = filteredSubjects
      .map((s) => {
        const topicsStr = s.topics.map((t, idx) => {
          const completion = kazanimCompletionMap.get(t.id);
          const completionTag = completion
            ? ` (kazanım: ${completion.checked}/${completion.total}, %${completion.pct}${completion.pct >= 70 ? " ✓TAMAMLANDI" : ""})`
            : "";
          return `${idx + 1}. ${t.name} [zorluk:${t.difficulty}, ~${t.estimatedHours}sa]${completionTag}`;
        }).join(", ");
        return `${s.examType.name} ${s.name}: ${topicsStr}`;
      })
      .join("\n");

    // Categorize topic knowledge by level for balanced planning (Faz 4B)
    const topicsByLevel = {
      bilinmeyen: allTopicKnowledge.filter(t => t.level <= 1).map(t => `${t.topic.name} (${t.topic.subject.name})`),
      orta: allTopicKnowledge.filter(t => t.level >= 2 && t.level <= 3).map(t => `${t.topic.name} (${t.topic.subject.name})`),
      bilinen: allTopicKnowledge.filter(t => t.level >= 4).map(t => `${t.topic.name} (${t.topic.subject.name})`),
    };
    const topicsByLevelStr = `=== KONU BİLGİ SEVİYELERİ (DAĞITIM İÇİN KULLAN) ===
Bilinmeyen (seviye 0-1): ${topicsByLevel.bilinmeyen.join(", ") || "Yok"}
Orta (seviye 2-3): ${topicsByLevel.orta.join(", ") || "Yok"}
Bilinen (seviye 4-5): ${topicsByLevel.bilinen.join(", ") || "Yok"}`;

    // Format prerequisites for AI context (Faz 4C)
    const prerequisitesStr = prerequisites.length > 0
      ? `=== ÖN-KOŞUL LİSTESİ ===\n${prerequisites.map(p => `- ${p.topic.name} → ${p.prerequisite.name} (${p.strength === "hard" ? "zorunlu" : "önerilen"})`).join("\n")}`
      : "";

    // Format topic difficulty & estimated hours for AI context (Faz 4D)
    const allTopicsWithDifficulty = filteredSubjects.flatMap(s =>
      s.topics.filter(t => t.difficulty >= 4 || t.estimatedHours >= 4).map(t => `${t.name} (${s.name}): zorluk ${t.difficulty}/5, ~${t.estimatedHours} saat`)
    );
    const difficultyStr = allTopicsWithDifficulty.length > 0
      ? `=== ZOR / UZUN KONULAR (DİKKAT) ===\n${allTopicsWithDifficulty.join("\n")}`
      : "";

    // Build context based on wizard type (dynamic wizard or legacy preferences)
    let wizardStr = "";

    if (wizardContext) {
      // New dynamic wizard: AI analysis + student answers + fixed choices
      const typedCtx = wizardContext as WizardContext;
      const answersStr = typedCtx.questions
        .map((a) => `Soru: ${a.question}\nCevap: ${a.selectedOption}${a.customNote ? ` (Not: ${a.customNote})` : ""}`)
        .join("\n\n");

      // Fixed answers from wizard
      let fixedStr = "";
      if (typedCtx.fixedAnswers) {
        const scopeLabel = typedCtx.fixedAnswers.examScope === "tyt" ? "Sadece TYT"
          : typedCtx.fixedAnswers.examScope === "ayt" ? "Sadece AYT"
          : "TYT ve AYT birlikte";
        const subjectNames = typedCtx.fixedAnswers.selectedSubjects
          .map((s) => `${s.examType} - ${s.name}`)
          .join(", ");
        fixedStr = `
=== ÖĞRENCİ TERCİHLERİ ===
Çalışma kapsamı: ${scopeLabel}
Seçilen dersler: ${subjectNames || "Belirtilmedi"}

ÖNEMLİ: Sadece öğrencinin seçtiği derslere çalışma planı oluştur. Seçilmeyen dersleri EKLEME.`;
      }

      wizardStr = `
=== AI ANALİZ ÖZETİ ===
${typedCtx.analysis}

Zayıf alanlar: ${typedCtx.weakAreas?.join(", ") || "Belirtilmedi"}
${typedCtx.strongAreas ? `Güçlü alanlar: ${typedCtx.strongAreas.join(", ")}` : ""}
${fixedStr}

=== ÖĞRENCİ CEVAPLARI ===
${answersStr}`;
    } else if (preferences) {
      // Legacy fixed wizard (backward compatible)
      wizardStr = `
Öğrenci Tercihleri:
- Çalışma düzeni: ${preferences.study_regularity || "Belirtilmedi"}${preferences.study_regularity_note ? ` (Not: ${preferences.study_regularity_note})` : ""}
- Plana uyum: ${preferences.plan_adherence || "Belirtilmedi"}${preferences.plan_adherence_note ? ` (Not: ${preferences.plan_adherence_note})` : ""}
- Günlük çalışma: ${preferences.daily_hours || "Belirtilmedi"}${preferences.daily_hours_note ? ` (Not: ${preferences.daily_hours_note})` : ""}
- Dinlenme tercihi: ${preferences.break_preference || "Belirtilmedi"}${preferences.break_preference_note ? ` (Not: ${preferences.break_preference_note})` : ""}
- Müsait olmayan günler: ${preferences.unavailable_days || "Belirtilmedi"}${preferences.unavailable_days_note ? ` (Not: ${preferences.unavailable_days_note})` : ""}
- Fazladan çalışılabilecek günler: ${preferences.extra_days || "Belirtilmedi"}${preferences.extra_days_note ? ` (Not: ${preferences.extra_days_note})` : ""}`;
    }

    const examTrackLabel = examTrack === "sayisal" ? "Sayısal" : examTrack === "ea" ? "Eşit Ağırlık" : examTrack === "sozel" ? "Sözel" : "Belirlenmedi";
    const contextMessage = `Hafta: ${format(start, "d MMMM", { locale: tr })} - ${format(end, "d MMMM yyyy", { locale: tr })}
Alan: ${examTrackLabel}

Zayıf konular (seviye 0-3): ${weakTopicsStr || "Henüz belirlenmemiş"}

${topicsByLevelStr}

${examStr}

Son 2 hafta çalışma dağılımı: ${studyStr || "Veri yok"}

${insightsStr ? `Geçmiş AI önerileri: ${insightsStr}` : ""}

=== MEVCUT KONU LİSTESİ — MÜFREDAT SIRASINA GÖRE (SADECE BUNLARI KULLAN) ===
Aşağıdaki konular ÖSYM müfredat sırasıyla numaralandırılmıştır. "✓TAMAMLANDI" işaretli konular %70+ kazanım tamamlamış demektir.
Tamamlanmamış ilk konudan başlayarak plan yap. Sırayı atlama!
${availableTopicsStr}
${prerequisitesStr ? `\n${prerequisitesStr}` : ""}
${difficultyStr ? `\n${difficultyStr}` : ""}
${wizardStr}`.trim();

    // 3. Build dynamic system prompt with profile data
    let systemPrompt = SYSTEM_PROMPT_PLAN_BASE;

    // Add profile info from DB or from wizard context
    const profileFromWizard = wizardContext?.studentProfile as StudentProfileContext | undefined;
    if (studentProfile && studentProfile.dailyStudyHours != null) {
      const availDays = Array.isArray(studentProfile.availableDays) ? (studentProfile.availableDays as number[]) : [];
      systemPrompt += buildProfilePromptAddon({
        dailyStudyHours: studentProfile.dailyStudyHours,
        availableDays: availDays,
        breakPreference: studentProfile.breakPreference,
        studyRegularity: studentProfile.studyRegularity,
        targetRank: studentProfile.targetRank,
        examDate: studentProfile.examDate,
      });
    } else if (profileFromWizard && profileFromWizard.dailyStudyHours != null) {
      // Fallback: use profile data sent from frontend wizard context
      systemPrompt += buildProfilePromptAddon({
        dailyStudyHours: profileFromWizard.dailyStudyHours,
        availableDays: Array.isArray(profileFromWizard.availableDays) ? profileFromWizard.availableDays : [],
        breakPreference: profileFromWizard.breakPreference,
        studyRegularity: profileFromWizard.studyRegularity,
        targetRank: profileFromWizard.targetRank,
        examDate: profileFromWizard.examDate ? new Date(profileFromWizard.examDate) : null,
      });
    } else {
      // No profile — use default range
      systemPrompt += `\n\nHaftalık toplam 15-25 saat arası olmalı (öğrenci cevaplarına göre ayarla).`;
    }

    // 4. Call OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextMessage },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content || "";

    // 5. Parse JSON response
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

    // 6. Map AI subject/topic names to database IDs and create plan
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
        const subjectId = findSubjectId(item.subjectName, subjectNameMap, filteredSubjects);
        if (!subjectId) {
          console.warn(`Subject not found: ${item.subjectName}, skipping`);
          continue;
        }

        // Find topic ID if topic name provided
        let topicId: string | undefined;
        if (item.topicName) {
          // Try exact key first
          const key = `${item.subjectName.toLowerCase()}-${item.topicName.toLowerCase()}`;
          topicId = topicNameMap.get(key);

          // If not found, try fuzzy match on topic name alone within this subject
          if (!topicId) {
            const subject = filteredSubjects.find((s) => s.id === subjectId);
            if (subject) {
              const matchedTopic = subject.topics.find(
                (t) =>
                  t.name.toLowerCase().includes(item.topicName!.toLowerCase()) ||
                  item.topicName!.toLowerCase().includes(t.name.toLowerCase())
              );
              if (matchedTopic) topicId = matchedTopic.id;
            }
          }
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

    // 7. Save as AI Insight
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
