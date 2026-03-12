import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit-log";
import { logApiError } from "@/lib/logger";
import { getOpenAI } from "@/lib/openai";

// Kavram düğümü oluşturma için güçlü model — konu-kavram eşleştirmesi kritik
const AI_LINK_MODEL = process.env.OPENAI_LINK_MODEL || "gpt-4.1";

function adminGuard(session: any) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin")
    return { error: "Forbidden", status: 403 };
  return null;
}

// ---------------------------------------------------------------------------
// POST — AI-powered concept node suggestions for a subject's topics
// Body: { subjectId: string }
// Returns: { suggestions: [{ topicId, topicName, nodes: [...] }], tokensUsed }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { subjectId } = await request.json();

    if (!subjectId || typeof subjectId !== "string") {
      return NextResponse.json(
        { error: "subjectId gerekli" },
        { status: 400 }
      );
    }

    // Fetch subject with its topics
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        name: true,
        examType: { select: { name: true } },
        topics: {
          select: { id: true, name: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Ders bulunamadı" },
        { status: 404 }
      );
    }

    if (subject.topics.length === 0) {
      return NextResponse.json(
        { error: "Bu dersin konusu yok" },
        { status: 400 }
      );
    }

    // Fetch existing concept nodes for this subject's topics to avoid duplicates
    const existingNodes = await prisma.conceptNode.findMany({
      where: { domain: subject.name },
      select: { name: true, slug: true, parentTopicId: true },
    });

    const existingNames = existingNodes.map((n) => n.name.toLowerCase());
    const existingSlugs = existingNodes.map((n) => n.slug);

    const topicsList = subject.topics.map((t) => ({
      id: t.id,
      name: t.name,
    }));

    const systemPrompt = `Sen bir YKS müfredat uzmanısın. Bir dersin konu listesini alacaksın ve her konu için "kavram düğümü" (concept node) önerileri üreteceksin.

KURALLAR:
- Her konu için KONUNUN KAPSAMINA GÖRE yeterli sayıda kavram düğümü öner:
  - Dar/basit konular (ör: Sayı Basamakları, Bölünebilme): 3-5 düğüm
  - Orta kapsamlı konular (ör: Türev, Fonksiyonlar): 8-15 düğüm
  - Geniş/derin konular (ör: İntegral, Limit, Analitik Geometri): 15-30 düğüm
- Konunun alt başlıklarını, temel kavramları, formülleri, teoremleri, yöntemleri ve uygulama alanlarını ayrı düğüm olarak modellemekten çekinme.
- Kavram düğümleri öğrencinin o konuda ustalaşması gereken temel kavramları temsil eder.
- Her düğüm için şunları üret:
  - "name": Kavram adı (Türkçe, anlaşılır)
  - "slug": ASCII kebab-case (Türkçe karakterleri dönüştür: ç→c, ş→s, ğ→g, ü→u, ö→o, ı→i, İ→i). Boşluklar tire olsun. Örn: "Zincir Kuralı" → "zincir-kurali"
  - "domain": "${subject.name}" (sabit)
  - "examType": "tyt", "ayt" veya "both" (konunun sınav tipine göre)
  - "complexityScore": 1-10 arası zorluk skoru (1=çok kolay, 10=çok zor)

MEVCUT DÜĞÜMLER (tekrar önerme):
${existingNames.length > 0 ? existingNames.join(", ") : "(henüz düğüm yok)"}

MEVCUT SLUG'LAR (aynı slug kullanma):
${existingSlugs.length > 0 ? existingSlugs.join(", ") : "(henüz slug yok)"}

DERS: ${subject.name}
SINAV TİPİ: ${subject.examType.name}

YANIT FORMATI (SADECE JSON):
{
  "suggestions": [
    {
      "topicId": "konu id'si",
      "topicName": "konu adı",
      "nodes": [
        {
          "name": "Kavram Adı",
          "slug": "kavram-adi",
          "domain": "${subject.name}",
          "examType": "tyt" | "ayt" | "both",
          "complexityScore": 5
        }
      ]
    }
  ]
}

YANITINI SADECE JSON OLARAK VER, başka hiçbir şey ekleme.`;

    const userContent = `KONULAR (${topicsList.length} adet):\n${JSON.stringify(topicsList, null, 0)}`;

    const completion = await getOpenAI().chat.completions.create({
      model: AI_LINK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI yanıtı parse edilemedi", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suggestions: parsed.suggestions || [],
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    logApiError("admin/ai-link-nodes POST", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — Apply approved concept node suggestions (bulk create + link)
// Body: { suggestions: [{ topicId, nodes: [{ name, slug, domain, examType, complexityScore }] }] }
// Returns: { success, created, errors }
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { suggestions } = await request.json();

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return NextResponse.json(
        { error: "Uygulanacak öneri yok" },
        { status: 400 }
      );
    }

    let created = 0;
    const errors: string[] = [];

    // Fetch all existing slugs once for conflict resolution
    const existingSlugs = new Set(
      (await prisma.conceptNode.findMany({ select: { slug: true } })).map(
        (n) => n.slug
      )
    );

    for (const suggestion of suggestions) {
      const { topicId, nodes } = suggestion;

      if (!topicId || !Array.isArray(nodes)) {
        errors.push(`Geçersiz öneri formatı: topicId=${topicId}`);
        continue;
      }

      // Verify topic exists
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        select: { id: true },
      });

      if (!topic) {
        errors.push(`Konu bulunamadı: ${topicId}`);
        continue;
      }

      for (const node of nodes) {
        try {
          const { name, slug, domain, examType, complexityScore } = node;

          if (!name || !slug || !domain) {
            errors.push(`Eksik alan: ${JSON.stringify(node)}`);
            continue;
          }

          // Handle slug conflicts by appending a number
          let finalSlug = slug;
          let counter = 1;
          while (existingSlugs.has(finalSlug)) {
            finalSlug = `${slug}-${counter}`;
            counter++;
          }

          await prisma.conceptNode.create({
            data: {
              name,
              slug: finalSlug,
              domain,
              examType: examType || "both",
              complexityScore: complexityScore || 5,
              parentTopicId: topicId,
            },
          });

          existingSlugs.add(finalSlug);
          created++;
        } catch (e: any) {
          errors.push(`Node "${node.name}": ${e.message}`);
        }
      }
    }

    // Log admin action
    await logAdminAction(
      (session!.user as any).id,
      "ai-link-nodes:apply",
      "ConceptNode",
      null,
      { created, errors: errors.length }
    );

    return NextResponse.json({
      success: true,
      created,
      errors: errors.length > 0 ? errors : undefined,
      message: `${created} kavram düğümü oluşturuldu${errors.length > 0 ? `, ${errors.length} hata` : ""}`,
    });
  } catch (error) {
    logApiError("admin/ai-link-nodes PATCH", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
