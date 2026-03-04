import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// DB Connection
// ---------------------------------------------------------------------------
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (databaseUrl && databaseUrl !== process.env.DATABASE_URL) {
  console.log("🔗 DATABASE_PUBLIC_URL kullanılıyor...");
}
const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

const EXCEL_PATH = "/Users/furkangunesi/Downloads/YKS/YKS_2026_Mufredat_Kazanimlar.xlsx";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ExcelKazanim {
  exam: string;
  excelSubject: string;
  grade: number;
  topicName: string;       // From "Konu Adı" (may be empty for broken subjects)
  learningArea: string;    // From "Öğrenme Alanı" (may be empty)
  code: string;
  subTopicName: string | null;
  description: string;
  details: string | null;
  isKey: boolean;
}

// ---------------------------------------------------------------------------
// Subject Mapping: (exam, excelSubject) → DB subject name
// ---------------------------------------------------------------------------
const SUBJECT_MAP: Record<string, Record<string, string>> = {
  TYT: {
    "Matematik": "Matematik",
    "Fizik": "Fen Bilimleri",
    "Kimya": "Fen Bilimleri",
    "Biyoloji": "Fen Bilimleri",
    "Türk Dili ve Edebiyatı": "Türkçe",
    "Tarih": "Sosyal Bilimler",
    "Coğrafya": "Sosyal Bilimler",
    "Din Kültürü ve Ahlak Bilgisi": "Sosyal Bilimler",
    "Felsefe": "Sosyal Bilimler",
  },
  AYT: {
    "Matematik": "Matematik",
    "Fizik": "Fizik",
    "Kimya": "Kimya",
    "Biyoloji": "Biyoloji",
    "Türk Dili ve Edebiyatı": "Edebiyat",
    "Tarih": "Tarih",
    "T.C. İnkılap Tarihi ve Atatürkçülük": "Tarih",
    "Coğrafya": "Coğrafya",
    "Din Kültürü ve Ahlak Bilgisi": "Felsefe",
    "Felsefe": "Felsefe",
    "Mantık": "Felsefe",
    "Sosyoloji": "Felsefe",
    "Psikoloji": "Felsefe",
  },
};

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/İ/g, "i").replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(s: string): string[] {
  const stopWords = new Set([
    "ve", "ile", "da", "de", "bir", "bu", "su", "icin", "olan", "den", "dan",
    "nin", "nun", "lar", "ler", "dir", "tir", "ayt", "tyt", "temel", "duzey",
  ]);
  return norm(s)
    .split(" ")
    .filter(w => w.length >= 3 && !stopWords.has(w));
}

// Check if keyword (or a 5+ char prefix) appears in text
function keywordInText(keyword: string, text: string): boolean {
  if (keyword.length <= 4) return text.includes(keyword);
  // Try the full keyword first, then progressively shorter prefixes (min 5 chars)
  for (let len = keyword.length; len >= 5; len--) {
    if (text.includes(keyword.substring(0, len))) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Sub-subject detection for composite subjects (Fen Bilimleri, Sosyal Bilimler)
// ---------------------------------------------------------------------------
const FIZIK_KW = [
  "fizik", "hareket", "kuvvet", "enerji", "sicaklik", "elektrostatik",
  "elektrik", "manyetizma", "basinc", "kaldirma", "dalga", "optik",
  "momentum", "newton", "tork", "vektor", "ses", "isik", "kirilma",
  "mercek", "ayna", "girisim", "kirini", "induksiyon", "alternatif",
  "transformator", "elektromanyetik",
];
const KIMYA_KW = [
  "kimya", "atom", "periyodik", "madde", "mol", "gaz", "cozelti", "cozunurluk",
  "asit", "baz", "tuz", "karisim", "bilesik", "element", "tepkime",
  "endotermik", "ekzotermik", "karbon", "organik", "polimer", "ester",
  "hidrokarbon", "fonksiyonel", "izomer", "termodinamik", "entalpi", "entropi",
  "koligatif", "derisim", "tampon", "titrasyon", "pil", "elektroliz",
  "korozyon", "standart", "elektrot",
];
const BIYO_KW = [
  "biyoloji", "hucre", "canli", "sindirim", "dolasim", "bosaltim", "sinir",
  "solunum", "ureme", "ekosistem", "dna", "rna", "protein", "mitoz", "mayoz",
  "endokrin", "kas", "iskelet", "kalitim", "fotosentez", "fermantasyon",
  "genetik", "mutasyon", "biyoteknoloji", "klonlama", "gdo", "populas",
  "komunite", "biyom", "bitki", "hormon", "bagisiklik", "duyu",
];
const TARIH_KW = [
  "tarih", "osmanli", "selcuk", "savas", "ataturk", "inkilap", "mesrutiyet",
  "tanzimat", "kurtulus", "ortacag", "devlet", "medeniyet", "hacli",
  "gokturk", "uygur", "mondros", "sevr", "cumhuriyet", "halifelik", "lozan",
  "trablusgarp", "balkan", "islami", "tbmm", "kuvayi", "nato", "kibris",
  "soguk", "kuresellesme", "zaman", "insanlik",
];
const COG_KW = [
  "cografya", "iklim", "nufus", "harita", "dogal", "toprak", "bitki",
  "ekonomik", "ulasim", "ticaret", "goc", "yerlesme", "deprem", "volkan",
  "biyom", "jeomorfoloji", "levha", "tektonik", "koordinat", "sicaklik",
  "yagis", "hidrografya", "akarsu", "gol", "sanayi", "tarim", "hayvancilik",
  "madencilik", "turizm", "bolge",
];
const DIN_KW = [
  "din", "islam", "ibadet", "kuran", "muhammed", "ahlak", "allah",
  "peygamber", "iman",
];
const FEL_KW = [
  "felsefe", "varlik", "bilgi", "dusunce", "ahlak felse",
];

function detectSubSubject(topicName: string, parentSubject: string): string | null {
  const n = norm(topicName);

  if (parentSubject === "Fen Bilimleri") {
    if (n.startsWith("fizik")) return "Fizik";
    if (n.startsWith("kimya")) return "Kimya";
    if (n.startsWith("biyoloji")) return "Biyoloji";
    // Special non-prefixed topics
    if (n.includes("yasam bilimi")) return "Biyoloji";

    const fz = FIZIK_KW.filter(k => n.includes(k)).length;
    const km = KIMYA_KW.filter(k => n.includes(k)).length;
    const by = BIYO_KW.filter(k => n.includes(k)).length;
    const max = Math.max(fz, km, by);
    if (max === 0) return null;
    if (fz === max) return "Fizik";
    if (km === max) return "Kimya";
    return "Biyoloji";
  }

  if (parentSubject === "Sosyal Bilimler") {
    if (n.startsWith("tarih")) return "Tarih";
    if (n.startsWith("cografya")) return "Coğrafya";
    if (n.startsWith("din")) return "Din Kültürü ve Ahlak Bilgisi";
    if (n.startsWith("felsefe")) return "Felsefe";

    const ta = TARIH_KW.filter(k => n.includes(k)).length;
    const co = COG_KW.filter(k => n.includes(k)).length;
    const di = DIN_KW.filter(k => n.includes(k)).length;
    const fe = FEL_KW.filter(k => n.includes(k)).length;
    const max = Math.max(ta, co, di, fe);
    if (max === 0) return null;
    if (ta === max) return "Tarih";
    if (co === max) return "Coğrafya";
    if (di === max) return "Din Kültürü ve Ahlak Bilgisi";
    return "Felsefe";
  }

  return null;
}

// ---------------------------------------------------------------------------
// Scoring: How well does a kazanım match a DB topic?
// ---------------------------------------------------------------------------
function scoreKazanim(
  topicKeywords: string[],
  kazDesc: string,
  kazTopicName: string,
  kazLearningArea: string,
  kazDetails: string | null,
): number {
  if (topicKeywords.length === 0) return 0;

  const descNorm = norm(kazDesc);
  const topicNameNorm = norm(kazTopicName);
  const areaNorm = norm(kazLearningArea);
  const detailsNorm = kazDetails ? norm(kazDetails) : "";
  const allText = `${descNorm} ${topicNameNorm} ${areaNorm} ${detailsNorm}`;

  let descMatches = 0;
  let contextMatches = 0;

  for (const kw of topicKeywords) {
    if (keywordInText(kw, descNorm) || keywordInText(kw, detailsNorm)) {
      descMatches++;
    } else if (keywordInText(kw, topicNameNorm) || keywordInText(kw, areaNorm)) {
      contextMatches++;
    }
  }

  if (descMatches === 0 && contextMatches === 0) return 0;

  // Description matches are worth more than context (topic name / area) matches
  const totalMatches = descMatches + contextMatches;
  const score =
    descMatches * 10 +
    contextMatches * 3 +
    (totalMatches / topicKeywords.length) * 5;

  return score;
}

// ---------------------------------------------------------------------------
// Parse Excel
// ---------------------------------------------------------------------------
function parseExcel(): ExcelKazanim[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

  const result: ExcelKazanim[] = [];
  let idx = 0;

  for (const row of rows) {
    idx++;
    const exam = String(row["Sınav"] || "");
    const subject = String(row["Ders"] || "");
    const grade = Number(row["Sınıf"]) || 0;
    const topicName = row["Konu Adı"];
    const area = row["Öğrenme Alanı"];
    const code = String(row["Kazanım Kodu"] || `${grade}.${idx}`);
    const subTopic = row["Alt Konu"];
    const desc = String(row["Kazanım Açıklama"] || "");
    const details = row["Detaylar"];
    const isKey = row["Anahtar Kazanım"] === "E";

    // Skip rows with no exam or subject
    if (!exam || !subject) continue;

    result.push({
      exam,
      excelSubject: subject,
      grade,
      topicName: topicName && String(topicName) !== "undefined" ? String(topicName) : "",
      learningArea: area && String(area) !== "undefined" ? String(area) : "",
      code,
      subTopicName: subTopic && String(subTopic) !== "undefined" ? String(subTopic) : null,
      description: desc,
      details: details ? String(details).split(" | ").join("\n") : null,
      isKey,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log("🎯 ÖSYM 2026 Excel → DB Seed (DB-Topic-Centric)\n");

  // ========== Step 1: Parse Excel ==========
  const allKazanimlar = parseExcel();
  console.log(`📄 ${allKazanimlar.length} kazanım parsed from Excel`);

  // Group by (exam, dbSubject)
  const kazBySubject: Record<string, ExcelKazanim[]> = {};
  for (const k of allKazanimlar) {
    const dbSubj = SUBJECT_MAP[k.exam]?.[k.excelSubject];
    if (!dbSubj) continue;
    const key = `${k.exam}|${dbSubj}`;
    if (!kazBySubject[key]) kazBySubject[key] = [];
    kazBySubject[key].push(k);
  }

  console.log("\nExcel → DB Subject Mapping:");
  for (const [key, kazList] of Object.entries(kazBySubject)) {
    console.log(`  ${key}: ${kazList.length} kazanım`);
  }

  // ========== Step 2: Load DB structure ==========
  const examTypes = await prisma.examType.findMany({
    include: { subjects: true },
  });
  const examTypeMap: Record<string, typeof examTypes[0]> = {};
  for (const et of examTypes) examTypeMap[et.name] = et;

  // ========== Step 3: Delete existing kazanımlar ==========
  console.log("\n🗑️  Mevcut veriler siliniyor...");
  try {
    const delP = await prisma.kazanimProgress.deleteMany({});
    console.log(`   KazanimProgress: ${delP.count}`);
  } catch (e) {
    console.log("   KazanimProgress: (skip)");
  }
  const delK = await prisma.topicKazanim.deleteMany({});
  console.log(`   TopicKazanim: ${delK.count}`);

  // ========== Step 4: Process each (exam, subject) ==========
  let totalAssigned = 0;
  let totalTopics = 0;
  let emptyTopics = 0;

  for (const examName of ["TYT", "AYT"]) {
    const examType = examTypeMap[examName];
    if (!examType) continue;

    for (const subject of examType.subjects) {
      const key = `${examName}|${subject.name}`;
      const excelKaz = kazBySubject[key] || [];

      console.log(`\n${"─".repeat(55)}`);
      console.log(`📘 ${examName} > ${subject.name}`);
      console.log(`   Excel: ${excelKaz.length} kazanım`);

      if (excelKaz.length === 0) {
        console.log("   ⚠️  Excel'de kazanım yok, atlanıyor");
        continue;
      }

      // Get all DB topics
      const dbTopics = await prisma.topic.findMany({
        where: { subjectId: subject.id },
        orderBy: { sortOrder: "asc" },
      });
      console.log(`   DB:    ${dbTopics.length} topic`);
      totalTopics += dbTopics.length;

      const isComposite = ["Fen Bilimleri", "Sosyal Bilimler"].includes(subject.name);

      // ---------- PHASE 1: Score all (kazanım, topic) pairs ----------
      // For each kazanım, find the best-matching topic

      // Build topic keyword map (strip prefix for composite subjects)
      const topicKwMap = new Map<string, string[]>();
      const topicSubSubject = new Map<string, string | null>();

      for (const t of dbTopics) {
        let cleanName = t.name;
        if (isComposite) {
          const prefixMatch = cleanName.match(
            /^(Fizik|Kimya|Biyoloji|Tarih|Coğrafya|Cografya|Din Kültürü|Felsefe)\s*[-–]\s*/i
          );
          if (prefixMatch) {
            cleanName = cleanName.substring(prefixMatch[0].length);
          }
        }
        topicKwMap.set(t.id, extractKeywords(cleanName));
        topicSubSubject.set(t.id, isComposite ? detectSubSubject(t.name, subject.name) : null);
      }

      // Assignment map: topicId → list of kazanımlar
      const assignments = new Map<string, ExcelKazanim[]>();
      for (const t of dbTopics) {
        assignments.set(t.id, []);
      }

      // Track which kazanımlar were assigned
      const assignedKazIdx = new Set<number>();

      // For each kazanım, find the best topic
      for (let ki = 0; ki < excelKaz.length; ki++) {
        const kaz = excelKaz[ki];
        let bestScore = 0;
        let bestTopicId: string | null = null;

        for (const t of dbTopics) {
          const topicKw = topicKwMap.get(t.id) || [];
          if (topicKw.length === 0) continue;

          // For composite subjects, filter by sub-subject
          const topicSub = topicSubSubject.get(t.id);
          if (isComposite && topicSub) {
            // Only score if kazanım is from the same sub-subject
            const kazNormSubj = norm(kaz.excelSubject);
            const topicNormSub = norm(topicSub);
            if (!kazNormSubj.includes(topicNormSub) && !topicNormSub.includes(kazNormSubj)) {
              continue;
            }
          }

          const score = scoreKazanim(
            topicKw,
            kaz.description,
            kaz.topicName,
            kaz.learningArea,
            kaz.details,
          );

          if (score > bestScore) {
            bestScore = score;
            bestTopicId = t.id;
          }
        }

        if (bestTopicId && bestScore > 0) {
          assignments.get(bestTopicId)!.push(kaz);
          assignedKazIdx.add(ki);
        }
      }

      // ---------- PHASE 2: Distribute unassigned kazanımlar ----------
      // Kazanımlar that didn't match any topic go to the closest available topic
      const unassigned = excelKaz.filter((_, i) => !assignedKazIdx.has(i));

      if (unassigned.length > 0) {
        console.log(`   ⚡ ${unassigned.length} kazanım Phase 1'de eşleşmedi, dağıtılıyor...`);

        for (const kaz of unassigned) {
          // Find the DB topic with the best fuzzy name match to the kazanım's Excel topic
          let bestScore = 0;
          let bestTopicId: string | null = null;

          const searchText = norm(`${kaz.topicName} ${kaz.learningArea}`);

          for (const t of dbTopics) {
            // For composite, check sub-subject match
            if (isComposite) {
              const topicSub = topicSubSubject.get(t.id);
              if (topicSub) {
                const kazSubNorm = norm(kaz.excelSubject);
                const topicSubNorm = norm(topicSub);
                if (!kazSubNorm.includes(topicSubNorm) && !topicSubNorm.includes(kazSubNorm)) {
                  continue;
                }
              }
            }

            // Score by name similarity
            const tNorm = norm(t.name);
            let score = 0;

            // Check if topic name appears in search text or vice versa
            if (tNorm.includes(searchText) || searchText.includes(tNorm)) {
              score += 50;
            }

            // Keyword overlap
            const tKw = topicKwMap.get(t.id) || [];
            for (const kw of tKw) {
              if (keywordInText(kw, searchText)) score += 10;
            }

            // Also check description
            const descNorm = norm(kaz.description);
            for (const kw of tKw) {
              if (keywordInText(kw, descNorm)) score += 5;
            }

            if (score > bestScore) {
              bestScore = score;
              bestTopicId = t.id;
            }
          }

          if (bestTopicId && bestScore > 0) {
            assignments.get(bestTopicId)!.push(kaz);
          } else {
            // Last resort: find the topic with the fewest assignments that accepts this sub-subject
            let minCount = Infinity;
            let minTopicId: string | null = null;
            for (const t of dbTopics) {
              if (isComposite) {
                const topicSub = topicSubSubject.get(t.id);
                if (topicSub && norm(topicSub) !== norm(kaz.excelSubject)) continue;
              }
              const count = assignments.get(t.id)!.length;
              if (count < minCount) {
                minCount = count;
                minTopicId = t.id;
              }
            }
            if (minTopicId) {
              assignments.get(minTopicId)!.push(kaz);
            }
          }
        }
      }

      // ---------- PHASE 3: Fill empty topics ----------
      // For topics that still have 0 kazanımlar, search ALL kazanımlar by description keywords
      const stillEmpty = dbTopics.filter(t => assignments.get(t.id)!.length === 0);

      if (stillEmpty.length > 0) {
        console.log(`   🔍 ${stillEmpty.length} topic hala boş, genişletilmiş arama yapılıyor...`);

        for (const emptyTopic of stillEmpty) {
          const topicKw = topicKwMap.get(emptyTopic.id) || [];
          if (topicKw.length === 0) continue;

          // Search ALL kazanımlar in the subject pool (allowing duplicates)
          const scored: { kaz: ExcelKazanim; score: number }[] = [];

          for (const kaz of excelKaz) {
            // Sub-subject filter for composite
            if (isComposite) {
              const topicSub = topicSubSubject.get(emptyTopic.id);
              if (topicSub) {
                const kazSubNorm = norm(kaz.excelSubject);
                const topicSubNorm = norm(topicSub);
                if (!kazSubNorm.includes(topicSubNorm) && !topicSubNorm.includes(kazSubNorm)) {
                  continue;
                }
              }
            }

            const score = scoreKazanim(
              topicKw,
              kaz.description,
              kaz.topicName,
              kaz.learningArea,
              kaz.details,
            );

            if (score > 0) {
              scored.push({ kaz, score });
            }
          }

          if (scored.length > 0) {
            // Sort by score descending, take top matches
            scored.sort((a, b) => b.score - a.score);
            // Only take kazanımlar with score >= 10 (at least one description keyword match)
            // and limit to top 8 per topic to avoid inflated counts
            const filtered = scored.filter(s => s.score >= 10);
            const best = (filtered.length > 0 ? filtered : scored.slice(0, 3))
              .slice(0, 8)
              .map(s => s.kaz);
            assignments.set(emptyTopic.id, best);
          }
        }
      }

      // ---------- PHASE 4: Write to DB ----------
      const kazanimsToCreate: {
        topicId: string;
        code: string;
        subTopicName: string | null;
        description: string;
        details: string | null;
        isKeyKazanim: boolean;
        sortOrder: number;
      }[] = [];

      const topicUpdates: {
        id: string;
        gradeLevel: number | null;
        learningArea: string | null;
      }[] = [];

      for (const t of dbTopics) {
        const kazList = assignments.get(t.id) || [];

        if (kazList.length > 0) {
          // Determine metadata from assigned kazanımlar
          const grades = kazList.map(k => k.grade).filter(g => g > 0);
          const areas = kazList.map(k => k.learningArea).filter(a => a.length > 0);

          const gradeLevel = grades.length > 0 ? grades[0] : null;
          const learningArea = areas.length > 0 ? areas[0] : null;

          topicUpdates.push({ id: t.id, gradeLevel, learningArea });

          // Deduplicate kazanımlar by code
          const seenCodes = new Set<string>();
          let sortIdx = 0;
          for (const k of kazList) {
            const dedup = `${k.code}|${k.description}`;
            if (seenCodes.has(dedup)) continue;
            seenCodes.add(dedup);
            sortIdx++;

            kazanimsToCreate.push({
              topicId: t.id,
              code: k.code,
              subTopicName: k.subTopicName,
              description: k.description,
              details: k.details,
              isKeyKazanim: k.isKey,
              sortOrder: sortIdx,
            });
          }

          console.log(`   ✅ "${t.name}" → ${sortIdx} kazanım`);
          totalAssigned += sortIdx;
        } else {
          console.log(`   ❌ "${t.name}" → 0`);
          emptyTopics++;
        }
      }

      // Batch write kazanımlar (chunks of 100)
      for (let i = 0; i < kazanimsToCreate.length; i += 100) {
        const chunk = kazanimsToCreate.slice(i, i + 100);
        await prisma.topicKazanim.createMany({ data: chunk });
      }

      // Update topic metadata
      for (const upd of topicUpdates) {
        await prisma.topic.update({
          where: { id: upd.id },
          data: {
            gradeLevel: upd.gradeLevel ?? undefined,
            learningArea: upd.learningArea ?? undefined,
          },
        });
      }
    }
  }

  // ========== Summary ==========
  console.log("\n" + "═".repeat(55));
  console.log("🎉 Seed tamamlandı!");
  console.log(`   ✅ Toplam kazanım: ${totalAssigned}`);
  console.log(`   📁 Toplam topic: ${totalTopics}`);
  console.log(`   ❌ Boş topic: ${emptyTopics}`);
  console.log(`   📊 Doluluk: ${((totalTopics - emptyTopics) / totalTopics * 100).toFixed(1)}%`);
  console.log("═".repeat(55));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
