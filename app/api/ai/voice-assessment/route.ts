import { NextRequest, NextResponse } from "next/server";
import { getOpenAILong, SYSTEM_PROMPT_VOICE_ASSESSMENT } from "@/lib/openai";
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

    const { transcript, curriculum } = await request.json();

    if (!transcript || !curriculum) {
      return NextResponse.json(
        { error: "Transkript ve müfredat bilgisi gerekli" },
        { status: 400 }
      );
    }

    if (!transcript.trim() || transcript.trim().length < 5) {
      return NextResponse.json(
        { error: "Transkript çok kısa. Lütfen konuları hakkında daha fazla bilgi verin." },
        { status: 400 }
      );
    }

    if (transcript.length > 50000) {
      return NextResponse.json(
        { error: "Transkript çok uzun. Lütfen daha kısa bir kayıt yapın." },
        { status: 400 }
      );
    }

    // Collect valid topic/kazanim IDs from curriculum for validation
    const validTopicIds = new Set<string>();
    const validKazanimIds = new Set<string>();
    const topicNameMap = new Map<string, string>();
    for (const subject of curriculum as CurriculumSubject[]) {
      for (const topic of subject.topics) {
        validTopicIds.add(topic.id);
        topicNameMap.set(topic.id, topic.name);
        if (topic.kazanimlar) {
          for (const k of topic.kazanimlar) {
            validKazanimIds.add(k.id);
          }
        }
      }
    }

    // Build the curriculum context for the AI
    // For large curricula, omit kazanım details to keep context manageable
    const topicCount = validTopicIds.size;
    const isLarge = topicCount > 80;
    const curriculumText = buildCurriculumContext(curriculum, isLarge);

    // For large curricula, simplify the output format (skip kazanım-level detail)
    const jsonFormat = isLarge
      ? `{
  "topics": [
    {
      "topicId": "string",
      "topicName": "string",
      "suggestedLevel": 0-5,
      "confidence": "high" | "medium" | "low",
      "reasoning": "kısa açıklama",
      "needsReview": true/false
    }
  ],
  "unmentionedTopics": ["topicId"],
  "generalNotes": "string"
}`
      : `{
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
  "generalNotes": "string"
}`;

    const userPrompt = `MÜFREDAT KONULARI (${topicCount} konu):
${curriculumText}

ÖĞRENCİ TRANSKRİPTİ:
${transcript}

Aşağıdaki JSON formatında yanıt ver:
${jsonFormat}`;

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT_VOICE_ASSESSMENT },
      { role: "user", content: userPrompt },
    ];

    // Try AI call with retry on parse/validation failure
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
          logApiError("voice-assessment-json-parse", { attempt, content: content.substring(0, 500) });
          lastError = "AI yanıtı geçerli JSON formatında değil";
          continue;
        }

        if (!parsed.topics || !Array.isArray(parsed.topics)) {
          logApiError("voice-assessment-bad-structure", { attempt, keys: Object.keys(parsed) });
          lastError = "AI yanıtı beklenen formatta değil";
          continue;
        }

        // Sanitize and validate - never crash, always return usable data
        const sanitized = sanitizeAssessment(parsed, validTopicIds, validKazanimIds, topicNameMap);
        return NextResponse.json(sanitized);
      } catch (aiError) {
        // Network/API errors - log and retry if possible
        logApiError("voice-assessment-api-error", { attempt, error: String(aiError) });
        lastError = aiError instanceof Error ? aiError.message : "AI servisi hatası";
        if (attempt < MAX_RETRIES) continue;
      }
    }

    // All retries exhausted
    return NextResponse.json(
      { error: `${lastError}. Lütfen tekrar deneyin.` },
      { status: 500 }
    );
  } catch (error) {
    logApiError("voice-assessment", error);

    const message =
      error instanceof Error ? error.message : "Bilinmeyen hata";
    const isTimeout = message.includes("timeout") || message.includes("ETIMEDOUT");
    const isApiKey = message.includes("API key") || message.includes("auth");

    return NextResponse.json(
      {
        error: isTimeout
          ? "AI yanıt vermedi (zaman aşımı). Lütfen tekrar deneyin."
          : isApiKey
          ? "AI servisi yapılandırma hatası. Yöneticiye başvurun."
          : "Sesli değerlendirme işlenirken hata oluştu",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Sanitize AI response - ensures every field is valid, never crashes client
// ---------------------------------------------------------------------------

interface RawTopic {
  topicId?: unknown;
  topicName?: unknown;
  suggestedLevel?: unknown;
  confidence?: unknown;
  reasoning?: unknown;
  kazanimlar?: unknown;
  wrongAreas?: unknown;
  needsReview?: unknown;
  studentQuote?: unknown;
}

function sanitizeAssessment(
  raw: Record<string, unknown>,
  validTopicIds: Set<string>,
  validKazanimIds: Set<string>,
  topicNameMap: Map<string, string>
) {
  const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];

  const topics = rawTopics
    .map((t: RawTopic) => sanitizeTopic(t, validTopicIds, validKazanimIds, topicNameMap))
    .filter((t): t is NonNullable<typeof t> => t !== null);

  // Deduplicate by topicId - keep first occurrence
  const seen = new Set<string>();
  const uniqueTopics = topics.filter((t) => {
    if (seen.has(t.topicId)) return false;
    seen.add(t.topicId);
    return true;
  });

  // Sanitize unmentionedTopics - only keep valid IDs not already in topics
  const mentionedIds = new Set(uniqueTopics.map((t) => t.topicId));
  const rawUnmentioned = Array.isArray(raw.unmentionedTopics) ? raw.unmentionedTopics : [];
  const unmentionedTopics = rawUnmentioned
    .filter((id): id is string => typeof id === "string" && validTopicIds.has(id) && !mentionedIds.has(id));

  return {
    topics: uniqueTopics,
    unmentionedTopics,
    generalNotes: typeof raw.generalNotes === "string" ? raw.generalNotes : "",
  };
}

function sanitizeTopic(
  raw: RawTopic,
  validTopicIds: Set<string>,
  validKazanimIds: Set<string>,
  topicNameMap: Map<string, string>
) {
  // topicId must be a valid string from curriculum
  const topicId = typeof raw.topicId === "string" ? raw.topicId : "";
  if (!topicId || !validTopicIds.has(topicId)) return null;

  // Clamp level to 0-5
  const rawLevel = typeof raw.suggestedLevel === "number" ? raw.suggestedLevel : 0;
  const suggestedLevel = Math.max(0, Math.min(5, Math.round(rawLevel)));

  // Confidence must be one of the valid values
  const validConfidence = ["high", "medium", "low"] as const;
  const confidence = validConfidence.includes(raw.confidence as typeof validConfidence[number])
    ? (raw.confidence as "high" | "medium" | "low")
    : "low";

  // Sanitize kazanimlar
  const rawKazanimlar = Array.isArray(raw.kazanimlar) ? raw.kazanimlar : [];
  const kazanimlar = rawKazanimlar
    .filter((k: any) => typeof k?.kazanimId === "string" && validKazanimIds.has(k.kazanimId))
    .map((k: any) => ({
      kazanimId: k.kazanimId as string,
      checked: typeof k.checked === "boolean" ? k.checked : false,
      ...(typeof k.note === "string" && k.note ? { note: k.note } : {}),
    }));

  // wrongAreas - filter to strings only
  const wrongAreas = Array.isArray(raw.wrongAreas)
    ? raw.wrongAreas.filter((a): a is string => typeof a === "string")
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

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

interface CurriculumTopic {
  id: string;
  name: string;
  sortOrder: number;
  kazanimlar?: Array<{
    id: string;
    code: string;
    description: string;
    isKeyKazanim: boolean;
  }>;
}

interface CurriculumSubject {
  id: string;
  name: string;
  examTypeName: string;
  topics: CurriculumTopic[];
}

function buildCurriculumContext(curriculum: CurriculumSubject[], compact = false): string {
  const lines: string[] = [];

  for (const subject of curriculum) {
    lines.push(`\n## ${subject.examTypeName} - ${subject.name}`);

    for (let i = 0; i < subject.topics.length; i++) {
      const topic = subject.topics[i];
      lines.push(`  ${i + 1}. [ID:${topic.id}] ${topic.name}`);

      // In compact mode (large curricula), skip kazanım details to save tokens
      if (!compact && topic.kazanimlar && topic.kazanimlar.length > 0) {
        for (const k of topic.kazanimlar) {
          const keyMarker = k.isKeyKazanim ? " ⭐" : "";
          lines.push(`     - [KID:${k.id}] ${k.code}: ${k.description}${keyMarker}`);
        }
      }
    }
  }

  return lines.join("\n");
}
