/**
 * Vektörel Soru İşaretleme Parser
 *
 * Syntax örnekleri:
 *   "3y, 5b, 12y"        → 3 yanlış, 5 boş, 12 yanlış
 *   "3-7y"                → 3,4,5,6,7 hepsi yanlış
 *   "3y 5b"               → boşlukla ayrılmış
 *   "3Y, 5B"              → büyük harf toleransı
 *   "3y,5b,,12y"          → fazla virgül toleransı
 *   "3 y, 5 b"            → sayı-harf arası boşluk toleransı
 *
 * Kaos toleranslı: parse edilemeyenler invalid'e atılır, geri kalanlar çalışır.
 */

export type QuestionSource = 'WRONG' | 'EMPTY';

export interface ParsedQuestion {
  questionNumber: number;
  source: QuestionSource;
}

export interface ParseResult {
  valid: ParsedQuestion[];
  invalid: string[];
}

// Tek token'ı parse et: "3y" → {3, WRONG}, "5b" → {5, EMPTY}
// Range: "3-7y" → [{3,WRONG}, {4,WRONG}, ..., {7,WRONG}]
function parseToken(token: string): { valid: ParsedQuestion[]; invalid?: string } {
  const cleaned = token.replace(/\s+/g, '').toLowerCase();
  if (!cleaned) return { valid: [] };

  // Range pattern: 3-7y veya 3-7b
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)([yb])$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const source: QuestionSource = rangeMatch[3] === 'y' ? 'WRONG' : 'EMPTY';

    if (start < 1 || end < 1 || start > end || end - start > 100) {
      return { valid: [], invalid: token };
    }

    const questions: ParsedQuestion[] = [];
    for (let i = start; i <= end; i++) {
      questions.push({ questionNumber: i, source });
    }
    return { valid: questions };
  }

  // Single pattern: 3y veya 5b
  const singleMatch = cleaned.match(/^(\d+)([yb])$/);
  if (singleMatch) {
    const num = parseInt(singleMatch[1], 10);
    const source: QuestionSource = singleMatch[2] === 'y' ? 'WRONG' : 'EMPTY';

    if (num < 1 || num > 999) {
      return { valid: [], invalid: token };
    }

    return { valid: [{ questionNumber: num, source }] };
  }

  return { valid: [], invalid: token };
}

export function parseVectorInput(input: string): ParseResult {
  if (!input.trim()) return { valid: [], invalid: [] };

  // Virgül ve boşlukla tokenize et
  const tokens = input
    .split(/[,\s]+/)
    .map(t => t.trim())
    .filter(Boolean);

  const allValid: ParsedQuestion[] = [];
  const allInvalid: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const result = parseToken(token);
    for (const q of result.valid) {
      const key = `${q.questionNumber}-${q.source}`;
      if (!seen.has(key)) {
        seen.add(key);
        allValid.push(q);
      }
    }
    if (result.invalid) {
      allInvalid.push(result.invalid);
    }
  }

  // Soru numarasına göre sırala
  allValid.sort((a, b) => a.questionNumber - b.questionNumber);

  return { valid: allValid, invalid: allInvalid };
}

/**
 * ParsedQuestion dizisinden soru durumları map'i oluştur
 * questionNumber → source
 */
export function questionsToMap(questions: ParsedQuestion[]): Map<number, QuestionSource> {
  const map = new Map<number, QuestionSource>();
  for (const q of questions) {
    map.set(q.questionNumber, q.source);
  }
  return map;
}
