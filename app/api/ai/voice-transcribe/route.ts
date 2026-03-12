import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { auth } from "@/lib/auth";
import { logApiError } from "@/lib/logger";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper limit)

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Ses dosyası gerekli" },
        { status: 400 }
      );
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ses dosyası çok büyük (max 25MB)" },
        { status: 400 }
      );
    }

    if (audioFile.size < 1000) {
      return NextResponse.json(
        { error: "Ses dosyası çok kısa" },
        { status: 400 }
      );
    }

    const transcription = await getOpenAI().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "tr",
      response_format: "text",
      prompt: "Bu bir YKS sınavı müfredat değerlendirmesi ses kaydıdır. Öğrenci matematik, fizik, kimya, biyoloji, türkçe, tarih, coğrafya gibi dersler hakkında konuşuyor.",
    });

    return NextResponse.json({
      transcript: typeof transcription === "string" ? transcription : String(transcription),
    });
  } catch (error) {
    logApiError("voice-transcribe", error);

    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    const isQuota = message.includes("quota") || message.includes("rate");

    return NextResponse.json(
      {
        error: isQuota
          ? "AI servisi meşgul, lütfen tekrar deneyin."
          : "Ses tanıma işlenirken hata oluştu",
      },
      { status: 500 }
    );
  }
}
