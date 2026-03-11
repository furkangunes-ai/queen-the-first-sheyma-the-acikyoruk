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
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "AI yanıt üretemedi" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    logApiError("voice-correction", error);
    return NextResponse.json(
      { error: "Düzeltme işlenirken hata oluştu" },
      { status: 500 }
    );
  }
}
