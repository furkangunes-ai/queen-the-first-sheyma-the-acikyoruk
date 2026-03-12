import { NextRequest, NextResponse } from "next/server";
import { getOpenAILong, SYSTEM_PROMPT_VOICE_CORRECTION } from "@/lib/openai";
import { auth } from "@/lib/auth";
import { logApiError } from "@/lib/logger";

const MAX_RETRIES = 2;
const VOICE_MODEL = "gpt-4o";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const { transcript, currentAssessment } = await request.json();

    if (!transcript || !currentAssessment) {
      return NextResponse.json(
        { error: "Transkript ve mevcut değerlendirme gerekli" },
        { status: 400 }
      );
    }

    // Collect valid topicIds from the existing assessment to validate correction output
    const existingTopicIds = new Set<string>();
    const topicNameMap = new Map<string, string>();
    if (Array.isArray(currentAssessment.topics)) {
      for (const t of currentAssessment.topics) {
        if (typeof t.topicId === "string") {
          existingTopicIds.add(t.topicId);
          if (typeof t.topicName === "string") {
            topicNameMap.set(t.topicId, t.topicName);
          }
        }
      }
    }
    // Also include unmentioned topics as valid
    if (Array.isArray(currentAssessment.unmentionedTopics)) {
      for (const id of currentAssessment.unmentionedTopics) {
        if (typeof id === "string") existingTopicIds.add(id);
      }
    }

    const userPrompt = `MEVCUT DEĞERLENDİRME:
${JSON.stringify(currentAssessment, null, 2)}

ÖĞRENCİNİN DÜZELTME TRANSKRİPTİ:
${transcript}

Düzeltmeleri uygula ve güncellenmiş değerlendirmeyi aynı JSON formatında döndür:
{
  "topics": [
    {
      "topicId": "string",
      "topicName": "string",
      "suggestedLevel": 0-5,
      "confidence": "high" | "medium" | "low",
      "reasoning": "string",
      "kazanimlar": [{"kazanimId": "string", "checked": true/false, "note": "optional string"}],
      "wrongAreas": ["string"],
      "needsReview": true/false,
      "studentQuote": "string"
    }
  ],
  "unmentionedTopics": ["topicId"],
  "generalNotes": "string",
  "corrections": ["Yapılan düzeltmelerin listesi"]
}`;

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT_VOICE_CORRECTION },
      { role: "user", content: userPrompt },
    ];

    let lastError: string | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await getOpenAILong().chat.completions.create({
          model: VOICE_MODEL,
          messages,
          temperature: 0.7,
          max_completion_tokens: 16384,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          lastError = "AI yanıt üretemedi";
          continue;
        }

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch {
          logApiError("voice-correction-json-parse", { attempt, content: content.substring(0, 500) });
          lastError = "AI yanıtı geçerli JSON formatında değil";
          continue;
        }

        if (!parsed.topics || !Array.isArray(parsed.topics)) {
          logApiError("voice-correction-bad-structure", { attempt, keys: Object.keys(parsed) });
          lastError = "AI yanıtı beklenen formatta değil";
          continue;
        }

        // Sanitize the correction response
        const sanitized = sanitizeCorrectionResponse(parsed, existingTopicIds, topicNameMap);

        // If AI returned zero topics but we had topics before, fall back to current assessment
        if (sanitized.topics.length === 0 && existingTopicIds.size > 0) {
          logApiError("voice-correction-empty-result", { attempt });
          lastError = "AI düzeltme sonrası boş sonuç döndürdü";
          continue;
        }

        return NextResponse.json(sanitized);
      } catch (aiError) {
        // Network/API errors - log and continue to fallback
        logApiError("voice-correction-api-error", { attempt, error: String(aiError) });
        lastError = aiError instanceof Error ? aiError.message : "AI servisi hatası";
        if (attempt < MAX_RETRIES) continue;
      }
    }

    // All retries exhausted - return current assessment unchanged rather than error
    // This way user never loses their data
    logApiError("voice-correction-all-retries-failed", { lastError });
    return NextResponse.json({
      ...currentAssessment,
      generalNotes: currentAssessment.generalNotes
        ? `${currentAssessment.generalNotes} (Düzeltme uygulanamadı: ${lastError})`
        : `Düzeltme uygulanamadı: ${lastError}`,
    });
  } catch (error) {
    logApiError("voice-correction", error);

    const message =
      error instanceof Error ? error.message : "Bilinmeyen hata";
    const isTimeout = message.includes("timeout") || message.includes("ETIMEDOUT");

    return NextResponse.json(
      {
        error: isTimeout
          ? "AI yanıt vermedi (zaman aşımı). Lütfen tekrar deneyin."
          : "Düzeltme işlenirken hata oluştu",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Sanitize correction response
// ---------------------------------------------------------------------------

function sanitizeCorrectionResponse(
  raw: Record<string, unknown>,
  validTopicIds: Set<string>,
  topicNameMap: Map<string, string>
) {
  const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];

  const topics = rawTopics
    .map((t: any) => sanitizeTopic(t, validTopicIds, topicNameMap))
    .filter((t): t is NonNullable<typeof t> => t !== null);

  // Deduplicate by topicId
  const seen = new Set<string>();
  const uniqueTopics = topics.filter((t) => {
    if (seen.has(t.topicId)) return false;
    seen.add(t.topicId);
    return true;
  });

  const mentionedIds = new Set(uniqueTopics.map((t) => t.topicId));
  const rawUnmentioned = Array.isArray(raw.unmentionedTopics) ? raw.unmentionedTopics : [];
  const unmentionedTopics = rawUnmentioned
    .filter((id): id is string => typeof id === "string" && validTopicIds.has(id) && !mentionedIds.has(id));

  const rawCorrections = Array.isArray(raw.corrections) ? raw.corrections : [];
  const corrections = rawCorrections.filter((c): c is string => typeof c === "string");

  return {
    topics: uniqueTopics,
    unmentionedTopics,
    generalNotes: typeof raw.generalNotes === "string" ? raw.generalNotes : "",
    corrections,
  };
}

function sanitizeTopic(
  raw: any,
  validTopicIds: Set<string>,
  topicNameMap: Map<string, string>
) {
  const topicId = typeof raw?.topicId === "string" ? raw.topicId : "";
  if (!topicId || !validTopicIds.has(topicId)) return null;

  const rawLevel = typeof raw.suggestedLevel === "number" ? raw.suggestedLevel : 0;
  const suggestedLevel = Math.max(0, Math.min(5, Math.round(rawLevel)));

  const validConfidence = ["high", "medium", "low"] as const;
  const confidence = validConfidence.includes(raw.confidence)
    ? (raw.confidence as "high" | "medium" | "low")
    : "low";

  const rawKazanimlar = Array.isArray(raw.kazanimlar) ? raw.kazanimlar : [];
  const kazanimlar = rawKazanimlar
    .filter((k: any) => typeof k?.kazanimId === "string")
    .map((k: any) => ({
      kazanimId: k.kazanimId as string,
      checked: typeof k.checked === "boolean" ? k.checked : false,
      ...(typeof k.note === "string" && k.note ? { note: k.note } : {}),
    }));

  const wrongAreas = Array.isArray(raw.wrongAreas)
    ? raw.wrongAreas.filter((a: any): a is string => typeof a === "string")
    : [];

  return {
    topicId,
    topicName: typeof raw.topicName === "string" && raw.topicName
      ? raw.topicName
      : topicNameMap.get(topicId) || topicId,
    suggestedLevel,
    confidence,
    reasoning: typeof raw.reasoning === "string" ? raw.reasoning : "",
    kazanimlar,
    wrongAreas,
    needsReview: typeof raw.needsReview === "boolean" ? raw.needsReview : false,
    studentQuote: typeof raw.studentQuote === "string" ? raw.studentQuote : "",
  };
}
