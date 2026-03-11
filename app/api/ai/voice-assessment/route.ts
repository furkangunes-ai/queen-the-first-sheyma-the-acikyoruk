import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, AI_MODEL, SYSTEM_PROMPT_VOICE_ASSESSMENT } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { logApiError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;

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

    // Build the curriculum context for the AI
    const curriculumText = buildCurriculumContext(curriculum);

    const userPrompt = `MÜFREDAT KONULARI:
${curriculumText}

ÖĞRENCİ TRANSKRİPTİ:
${transcript}

Aşağıdaki JSON formatında yanıt ver:
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
  "generalNotes": "string"
}`;

    const response = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_VOICE_ASSESSMENT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI yanıt üretemedi" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      logApiError("voice-assessment-json-parse", parseError);
      return NextResponse.json(
        { error: "AI yanıtı geçerli JSON formatında değil. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // Validate expected structure
    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      return NextResponse.json(
        { error: "AI yanıtı beklenen formatta değil. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
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

function buildCurriculumContext(curriculum: CurriculumSubject[]): string {
  const lines: string[] = [];

  for (const subject of curriculum) {
    lines.push(`\n## ${subject.examTypeName} - ${subject.name}`);

    for (let i = 0; i < subject.topics.length; i++) {
      const topic = subject.topics[i];
      lines.push(`  ${i + 1}. [ID:${topic.id}] ${topic.name}`);

      if (topic.kazanimlar && topic.kazanimlar.length > 0) {
        for (const k of topic.kazanimlar) {
          const keyMarker = k.isKeyKazanim ? " ⭐" : "";
          lines.push(`     - [KID:${k.id}] ${k.code}: ${k.description}${keyMarker}`);
        }
      }
    }
  }

  return lines.join("\n");
}
