import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. AI features will not work."
      );
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

export const AI_MODEL = "gpt-5-mini";

export const SYSTEM_PROMPT_CHAT = `Sen bir YKS hazırlık asistanısın. Adın "Strateji Asistanı". Türkçe konuş.
Öğrencinin deneme sonuçlarını, konu hakimiyet düzeylerini ve çalışma verilerini analiz ederek
kişiselleştirilmiş tavsiyelerde bulun. Motivasyon ver ama gerçekçi ol.
Kısa ve öz cevaplar ver. Markdown formatında yanıtla.
Konuşma tarzın samimi, destekleyici ama profesyonel olsun.`;

export const SYSTEM_PROMPT_ANALYSIS = `Sen bir YKS performans analistisin. Türkçe konuş.
Haftalık çalışma verilerini analiz et. Planlanan vs gerçekleşen karşılaştır.
Net değişimlerini yorumla. Gelecek hafta için somut öneriler sun.
Kısa ve öz ol. Markdown formatında yanıtla.
Başlıklar, listeler ve kalın metin kullan.`;
