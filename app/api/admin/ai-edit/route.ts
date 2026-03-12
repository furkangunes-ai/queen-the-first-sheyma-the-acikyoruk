import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOpenAI, AI_MODEL } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

function adminGuard(session: any) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin")
    return { error: "Forbidden", status: 403 };
  return null;
}

// ---------------------------------------------------------------------------
// POST — AI-powered bulk edit suggestions
// Body: { message: string, scope: "topics" | "kazanimlar" | "all" }
// Returns: { suggestions: [{ type, id, field, oldValue, newValue, reason }] }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { message, scope = "all" } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json(
        { error: "Düzenleme talimatı gerekli (en az 3 karakter)" },
        { status: 400 }
      );
    }

    // Fetch current data based on scope
    let topicsData: any[] = [];
    let kazanimlarData: any[] = [];

    if (scope === "topics" || scope === "all") {
      topicsData = await prisma.topic.findMany({
        select: {
          id: true,
          name: true,
          subject: { select: { name: true, examType: { select: { name: true } } } },
        },
        orderBy: { sortOrder: "asc" },
      });
    }

    if (scope === "kazanimlar" || scope === "all") {
      kazanimlarData = await prisma.topicKazanim.findMany({
        select: {
          id: true,
          code: true,
          description: true,
          subTopicName: true,
          details: true,
          topic: {
            select: {
              name: true,
              subject: { select: { name: true, examType: { select: { name: true } } } },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
    }

    // Build context for AI
    const topicsList = topicsData.map((t) => ({
      id: t.id,
      name: t.name,
      exam: t.subject.examType.name,
      subject: t.subject.name,
    }));

    const kazanimList = kazanimlarData.map((k) => ({
      id: k.id,
      code: k.code,
      description: k.description,
      subTopicName: k.subTopicName,
      details: k.details,
      topicName: k.topic.name,
      exam: k.topic.subject.examType.name,
      subject: k.topic.subject.name,
    }));

    const systemPrompt = `Sen bir müfredat düzenleme asistanısın. Yönetici sana bir düzenleme talimatı verecek.

Mevcut veriyi analiz et ve SADECE değişiklik gereken kayıtları bul.

KURALLAR:
- Slug, id gibi teknik alanları DEĞİŞTİRME. Sadece görünen metinleri düzenle (name, description, subTopicName, details).
- Türkçe karakter düzeltmeleri: u→ü, o→ö, c→ç, s→ş, g→ğ, i→İ (başta büyük I) gibi.
- Anlam değişikliği yapma, sadece yazım/imla düzelt (talimat özellikle istemiyorsa).
- Mümkün olduğunca çok düzeltme bul, hiçbirini atlama.

YANIT FORMATI (SADECE JSON):
{
  "suggestions": [
    {
      "type": "topic" | "kazanim",
      "id": "kayıt id'si",
      "field": "name" | "description" | "subTopicName" | "details",
      "oldValue": "eski değer",
      "newValue": "yeni değer",
      "reason": "kısa açıklama"
    }
  ]
}

Eğer düzeltilecek bir şey yoksa boş suggestions dizisi döndür.
YANITINI SADECE JSON OLARAK VER.`;

    const userContent = `TALIMAT: ${message}

${topicsList.length > 0 ? `KONULAR (${topicsList.length} adet):\n${JSON.stringify(topicsList, null, 0)}` : ""}

${kazanimList.length > 0 ? `KAZANIMLAR (${kazanimList.length} adet):\n${JSON.stringify(kazanimList, null, 0)}` : ""}`;

    const completion = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
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
    logApiError("admin/ai-edit", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — Apply approved suggestions
// Body: { edits: [{ type, id, field, newValue }] }
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard)
      return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { edits } = await request.json();

    if (!Array.isArray(edits) || edits.length === 0) {
      return NextResponse.json({ error: "Düzenlenecek kayıt yok" }, { status: 400 });
    }

    let updated = 0;
    const errors: string[] = [];

    for (const edit of edits) {
      try {
        if (edit.type === "topic") {
          const allowed = ["name"];
          if (!allowed.includes(edit.field)) {
            errors.push(`Topic ${edit.id}: geçersiz alan "${edit.field}"`);
            continue;
          }
          await prisma.topic.update({
            where: { id: edit.id },
            data: { [edit.field]: edit.newValue },
          });
          updated++;
        } else if (edit.type === "kazanim") {
          const allowed = ["description", "subTopicName", "details"];
          if (!allowed.includes(edit.field)) {
            errors.push(`Kazanım ${edit.id}: geçersiz alan "${edit.field}"`);
            continue;
          }
          await prisma.topicKazanim.update({
            where: { id: edit.id },
            data: { [edit.field]: edit.newValue },
          });
          updated++;
        }
      } catch (e: any) {
        errors.push(`${edit.type} ${edit.id}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      errors: errors.length > 0 ? errors : undefined,
      message: `${updated} kayıt güncellendi${errors.length > 0 ? `, ${errors.length} hata` : ""}`,
    });
  } catch (error) {
    logApiError("admin/ai-edit PATCH", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
