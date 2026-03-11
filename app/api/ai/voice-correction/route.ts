import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, AI_MODEL, SYSTEM_PROMPT_VOICE_CORRECTION } from "@/lib/openai";
import { checkAIAccess, isAIGuardError } from "@/lib/ai-guard";
import { logApiError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const guard = await checkAIAccess();
    if (isAIGuardError(guard)) return guard;

    const { transcript, currentAssessment } = await request.json();

    if (!transcript || !currentAssessment) {
      return NextResponse.json(
        { error: "Transkript ve mevcut değerlendirme gerekli" },
        { status: 400 }
      );
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

    const response = await getOpenAI().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_VOICE_CORRECTION },
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
      logApiError("voice-correction-json-parse", parseError);
      return NextResponse.json(
        { error: "AI yanıtı geçerli JSON formatında değil. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    if (!parsed.topics || !Array.isArray(parsed.topics)) {
      return NextResponse.json(
        { error: "AI yanıtı beklenen formatta değil. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
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
