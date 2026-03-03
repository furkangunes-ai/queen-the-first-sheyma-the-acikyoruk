import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// DB Connection (public URL for local access)
// ---------------------------------------------------------------------------
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (databaseUrl && databaseUrl !== process.env.DATABASE_URL) {
  console.log("🔗 DATABASE_PUBLIC_URL kullanılıyor (lokal erişim)...");
}
const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ExcelRow {
  Sınav: string;
  Ders: string;
  Sınıf: number;
  "Öğrenme Alanı": string;
  "Konu Sıra": string | number;
  "Konu Adı": string;
  "Kazanım Kodu": string;
  "Alt Konu"?: string;
  "Kazanım Açıklama": string;
  "Anahtar Kazanım"?: string;
  Detaylar?: string;
}

interface ParsedTopic {
  examType: string;
  subjectName: string; // DB subject name
  topicName: string;
  gradeLevel: number;
  learningArea: string;
  sortOrder: number;
  kazanimlar: {
    code: string;
    subTopicName: string | null;
    description: string;
    details: string | null;
    isKeyKazanim: boolean;
  }[];
}

// ---------------------------------------------------------------------------
// Subject name mapping: Excel → DB
// ---------------------------------------------------------------------------
const SUBJECT_NAME_MAP: Record<string, Record<string, string[]>> = {
  TYT: {
    Matematik: ["Matematik"],
    Fizik: ["Fizik"],
    Kimya: ["Kimya"],
    Biyoloji: ["Biyoloji"],
    "Türk Dili ve Edebiyatı": ["Edebiyat", "Türk Dili ve Edebiyatı"],
    Tarih: ["Tarih"],
    "T.C. İnkılap Tarihi ve Atatürkçülük": ["Tarih"], // merge into Tarih
    Coğrafya: ["Coğrafya"],
    "Din Kültürü ve Ahlak Bilgisi": ["Din Kültürü", "Din Kültürü ve Ahlak Bilgisi"],
    Felsefe: ["Felsefe"],
  },
  AYT: {
    Matematik: ["Matematik"],
    Fizik: ["Fizik"],
    Kimya: ["Kimya"],
    Biyoloji: ["Biyoloji"],
    "Türk Dili ve Edebiyatı": ["Edebiyat", "Türk Dili ve Edebiyatı"],
    Tarih: ["Tarih"],
    "T.C. İnkılap Tarihi ve Atatürkçülük": ["Tarih"],
    Coğrafya: ["Coğrafya"],
    "Din Kültürü ve Ahlak Bilgisi": ["Din Kültürü", "Din Kültürü ve Ahlak Bilgisi"],
    Felsefe: ["Felsefe", "Felsefe Grubu"],
    Mantık: ["Mantık", "Felsefe Grubu"],
    Sosyoloji: ["Sosyoloji", "Felsefe Grubu"],
    Psikoloji: ["Psikoloji", "Felsefe Grubu"],
  },
};

// ---------------------------------------------------------------------------
// Well-structured subjects (use Konu Adı as topic)
// ---------------------------------------------------------------------------
const WELL_STRUCTURED = new Set([
  "Matematik", "Fizik", "Kimya", "Biyoloji",
]);

// Subjects where each row = 1 kazanım and Konu Adı = ünite name
const ONE_KAZ_PER_ROW = new Set([
  "Mantık", "Sosyoloji", "Psikoloji",
]);

// Subjects where everything is in 1 "topic" and Öğrenme Alanı = real topic
const GROUP_BY_LEARNING_AREA = new Set([
  "Türk Dili ve Edebiyatı", "Tarih", "T.C. İnkılap Tarihi ve Atatürkçülük",
  "Coğrafya", "Din Kültürü ve Ahlak Bilgisi", "Felsefe",
]);

// ---------------------------------------------------------------------------
// Turkish title case
// ---------------------------------------------------------------------------
function titleCase(s: string): string {
  if (!s) return s;
  const lower = s.toLowerCase();
  // Keep small words lowercase unless first word
  const smallWords = new Set(["ve", "ile", "da", "de", "mi", "mu", "bir"]);
  return lower
    .split(" ")
    .map((w, i) => {
      if (i > 0 && smallWords.has(w)) return w;
      if (w.length === 0) return w;
      // Turkish İ handling
      const first = w[0];
      const upper = first === "i" ? "İ" : first === "ı" ? "I" : first.toUpperCase();
      return upper + w.slice(1);
    })
    .join(" ");
}

// ---------------------------------------------------------------------------
// Clean learning area (remove "9. SINIF ÜNİTE..." etc.)
// ---------------------------------------------------------------------------
function cleanLearningArea(area: string | undefined): string {
  if (!area) return "";
  // Remove patterns like "9. SINIF ÜNİTE, KONU, KAZANIM VE AÇIKLAMALARI"
  if (/^\d+\.?\s*SINIF\s+ÜNİTE/i.test(area)) return "";
  // Remove leading "9.1.1." style prefixes
  const cleaned = area.replace(/^\d+\.\d+\.\d+\.\s*/, "").trim();
  return cleaned;
}

// ---------------------------------------------------------------------------
// Fuzzy matching helpers
// ---------------------------------------------------------------------------
function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[İ]/g, "i").replace(/[ı]/g, "i")
    .replace(/[Ö]/g, "o").replace(/[ö]/g, "o")
    .replace(/[Ü]/g, "u").replace(/[ü]/g, "u")
    .replace(/[Ç]/g, "c").replace(/[ç]/g, "c")
    .replace(/[Ş]/g, "s").replace(/[ş]/g, "s")
    .replace(/[Ğ]/g, "g").replace(/[ğ]/g, "g")
    .replace(/[^a-z0-9]/g, "");
}

function topicMatchScore(dbName: string, excelName: string): number {
  const a = normalizeForSearch(dbName);
  const b = normalizeForSearch(excelName);
  if (a === b) return 1000;
  // Both contain each other
  if (a.includes(b) || b.includes(a)) {
    const ratio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return Math.round(ratio * 100);
  }
  // Prefix match
  if (a.length >= 8 && b.length >= 8 && a.substring(0, 8) === b.substring(0, 8)) {
    return 30;
  }
  return 0;
}

function findBestMatch(
  dbTopics: { id: string; name: string }[],
  targetName: string,
  usedIds: Set<string>
): { topic: { id: string; name: string }; score: number } | null {
  let bestScore = 0;
  let bestMatch: { id: string; name: string } | null = null;

  for (const t of dbTopics) {
    if (usedIds.has(t.id)) continue;
    const score = topicMatchScore(t.name, targetName);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = t;
    }
  }

  if (bestScore >= 40 && bestMatch) {
    return { topic: bestMatch, score: bestScore };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Parse Excel into structured topics
// ---------------------------------------------------------------------------
function parseExcel(filePath: string): ParsedTopic[] {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(ws);

  console.log(`📄 Excel'den ${rows.length} satır okundu.\n`);

  const topics: ParsedTopic[] = [];

  // Group rows by exam+subject
  const grouped: Record<string, ExcelRow[]> = {};
  for (const row of rows) {
    const key = `${row.Sınav}|${row.Ders}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  for (const [key, subjectRows] of Object.entries(grouped)) {
    const [examType, excelSubject] = key.split("|");
    const dbSubjectName = SUBJECT_NAME_MAP[examType]?.[excelSubject]?.[0] || excelSubject;

    if (WELL_STRUCTURED.has(excelSubject)) {
      // --- WELL STRUCTURED: Group by Konu Adı ---
      const topicMap = new Map<string, ExcelRow[]>();
      for (const row of subjectRows) {
        const topicKey = `${row["Konu Sıra"]}|${row["Konu Adı"]}`;
        if (!topicMap.has(topicKey)) topicMap.set(topicKey, []);
        topicMap.get(topicKey)!.push(row);
      }

      let sortIdx = 0;
      for (const [topicKey, kazRows] of topicMap) {
        sortIdx++;
        const firstRow = kazRows[0];
        let topicName = firstRow["Konu Adı"] || "Bilinmeyen Konu";

        // Title-case for non-Matematik subjects (they're UPPERCASE in Excel)
        if (excelSubject !== "Matematik" && excelSubject !== "Biyoloji") {
          topicName = titleCase(topicName);
        }

        const area = cleanLearningArea(firstRow["Öğrenme Alanı"]);

        topics.push({
          examType,
          subjectName: dbSubjectName,
          topicName,
          gradeLevel: firstRow.Sınıf,
          learningArea: area,
          sortOrder: sortIdx,
          kazanimlar: kazRows.map((r, i) => ({
            code: r["Kazanım Kodu"] || `${r.Sınıf}.${sortIdx}.${i + 1}`,
            subTopicName: r["Alt Konu"] || null,
            description: r["Kazanım Açıklama"] || "",
            details: r.Detaylar ? r.Detaylar.split(" | ").join("\n") : null,
            isKeyKazanim: r["Anahtar Kazanım"] === "E",
          })),
        });
      }
    } else if (ONE_KAZ_PER_ROW.has(excelSubject)) {
      // --- ONE KAZ PER ROW: Group by Konu Adı (= ünite name) ---
      const topicMap = new Map<string, ExcelRow[]>();
      for (const row of subjectRows) {
        const konuAdi = row["Konu Adı"] || "Bilinmeyen";
        if (!topicMap.has(konuAdi)) topicMap.set(konuAdi, []);
        topicMap.get(konuAdi)!.push(row);
      }

      let sortIdx = 0;
      for (const [konuAdi, kazRows] of topicMap) {
        sortIdx++;
        topics.push({
          examType,
          subjectName: dbSubjectName,
          topicName: titleCase(konuAdi),
          gradeLevel: kazRows[0].Sınıf,
          learningArea: titleCase(konuAdi),
          sortOrder: sortIdx,
          kazanimlar: kazRows.map((r, i) => ({
            code: r["Kazanım Kodu"] || `${r.Sınıf}.${sortIdx}.${i + 1}`,
            subTopicName: null,
            description: r["Kazanım Açıklama"] || "",
            details: r.Detaylar ? r.Detaylar.split(" | ").join("\n") : null,
            isKeyKazanim: r["Anahtar Kazanım"] === "E",
          })),
        });
      }
    } else if (GROUP_BY_LEARNING_AREA.has(excelSubject)) {
      // --- GROUP BY LEARNING AREA ---
      const topicMap = new Map<string, ExcelRow[]>();
      for (const row of subjectRows) {
        let area = row["Öğrenme Alanı"] || row["Konu Adı"] || "Genel";
        if (!area || area === "undefined") area = "Genel";
        if (!topicMap.has(area)) topicMap.set(area, []);
        topicMap.get(area)!.push(row);
      }

      let sortIdx = 0;
      for (const [area, kazRows] of topicMap) {
        sortIdx++;
        // Clean up the area name to use as topic name
        let topicName = area
          .replace(/^\d+\.\s*/, "") // remove leading "1. "
          .replace(/\s*\(.*?\)\s*$/, "") // remove trailing (...)
          .trim();
        if (topicName.length > 60) topicName = topicName.substring(0, 60);
        topicName = titleCase(topicName);

        topics.push({
          examType,
          subjectName: dbSubjectName,
          topicName,
          gradeLevel: kazRows[0].Sınıf,
          learningArea: titleCase(area),
          sortOrder: sortIdx,
          kazanimlar: kazRows.map((r, i) => ({
            code: r["Kazanım Kodu"] || `${r.Sınıf}.${sortIdx}.${i + 1}`,
            subTopicName: r["Alt Konu"] || null,
            description: r["Kazanım Açıklama"] || "",
            details: r.Detaylar ? r.Detaylar.split(" | ").join("\n") : null,
            isKeyKazanim: r["Anahtar Kazanım"] === "E",
          })),
        });
      }
    }
  }

  return topics;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log("🎯 ÖSYM 2026 Excel → DB Seed başlıyor...\n");

  // Step 1: Parse Excel
  const excelTopics = parseExcel("/Users/furkangunesi/Downloads/YKS/YKS_2026_Mufredat_Kazanimlar.xlsx");

  // Count
  const totalKazFromExcel = excelTopics.reduce((sum, t) => sum + t.kazanimlar.length, 0);
  console.log(`📊 Parse edildi: ${excelTopics.length} konu, ${totalKazFromExcel} kazanım\n`);

  // Step 2: Load DB structure
  const examTypes = await prisma.examType.findMany();
  const examTypeMap: Record<string, string> = {};
  for (const et of examTypes) examTypeMap[et.name] = et.id;

  if (!examTypeMap["TYT"] || !examTypeMap["AYT"]) {
    console.error("❌ TYT/AYT bulunamadı!");
    process.exit(1);
  }

  // Step 3: Delete ALL existing kazanımlar
  console.log("🗑️  Mevcut kazanımlar siliniyor...");
  const del = await prisma.topicKazanim.deleteMany({});
  console.log(`   Silinen: ${del.count} kazanım\n`);

  // Step 4: Group Excel topics by exam+subject
  const grouped: Record<string, ParsedTopic[]> = {};
  for (const t of excelTopics) {
    const key = `${t.examType}|${t.subjectName}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  }

  let totalKazanim = 0;
  let totalUpdated = 0;
  let totalCreated = 0;
  let totalUnmatched = 0;

  // Step 5: Process each exam+subject
  for (const [groupKey, topics] of Object.entries(grouped)) {
    const [examTypeName, subjectName] = groupKey.split("|");
    const examTypeId = examTypeMap[examTypeName];
    if (!examTypeId) {
      console.warn(`⚠️  ExamType "${examTypeName}" bulunamadı`);
      continue;
    }

    console.log(`\n📘 ${examTypeName} > ${subjectName}`);

    // Find subject in DB
    const possibleNames = SUBJECT_NAME_MAP[examTypeName]?.[subjectName] ||
      Object.values(SUBJECT_NAME_MAP[examTypeName] || {}).flat().filter(n => n === subjectName);
    if (possibleNames.length === 0) possibleNames.push(subjectName);

    let subject = null;
    for (const name of possibleNames) {
      subject = await prisma.subject.findFirst({ where: { examTypeId, name } });
      if (subject) break;
    }

    if (!subject) {
      // Try fuzzy match
      const allSubs = await prisma.subject.findMany({ where: { examTypeId } });
      for (const s of allSubs) {
        for (const pn of possibleNames) {
          if (normalizeForSearch(s.name).includes(normalizeForSearch(pn)) ||
              normalizeForSearch(pn).includes(normalizeForSearch(s.name))) {
            subject = s;
            break;
          }
        }
        if (subject) break;
      }
    }

    if (!subject) {
      console.log(`  ⚠️  Ders bulunamadı: ${subjectName} (atlanıyor)`);
      continue;
    }

    // Load all topics for this subject
    const dbTopics = await prisma.topic.findMany({ where: { subjectId: subject.id } });
    const usedIds = new Set<string>();

    for (const topicData of topics) {
      // Find best match
      let match = findBestMatch(dbTopics, topicData.topicName, usedIds);

      // Also try subject-prefixed name
      if (!match) {
        match = findBestMatch(dbTopics, `${subjectName} - ${topicData.topicName}`, usedIds);
      }

      let topicId: string;

      if (match) {
        usedIds.add(match.topic.id);
        topicId = match.topic.id;

        await prisma.topic.update({
          where: { id: topicId },
          data: {
            sortOrder: topicData.sortOrder,
            gradeLevel: topicData.gradeLevel || undefined,
            learningArea: topicData.learningArea || undefined,
          },
        });
        totalUpdated++;

        const scoreLabel = match.score >= 1000 ? "✅" : match.score >= 70 ? "🟡" : "🟠";
        console.log(`  ${scoreLabel} [${match.score}] "${topicData.topicName}" → "${match.topic.name}" (${topicData.kazanimlar.length} kaz)`);
      } else {
        // Create new topic
        const created = await prisma.topic.create({
          data: {
            name: topicData.topicName,
            subjectId: subject.id,
            sortOrder: topicData.sortOrder,
            gradeLevel: topicData.gradeLevel || undefined,
            learningArea: topicData.learningArea || undefined,
          },
        });
        topicId = created.id;
        totalCreated++;
        totalUnmatched++;
        console.log(`  📝 YENİ: "${topicData.topicName}" (${topicData.kazanimlar.length} kaz)`);
      }

      // Create kazanımlar
      for (let i = 0; i < topicData.kazanimlar.length; i++) {
        const k = topicData.kazanimlar[i];
        await prisma.topicKazanim.create({
          data: {
            topicId,
            code: k.code,
            subTopicName: k.subTopicName,
            description: k.description,
            details: k.details,
            isKeyKazanim: k.isKeyKazanim,
            sortOrder: i + 1,
          },
        });
        totalKazanim++;
      }
    }

    // Log unmatched DB topics (topics that exist in DB but no Excel data matched them)
    const unmatchedDb = dbTopics.filter(t => !usedIds.has(t.id));
    if (unmatchedDb.length > 0) {
      console.log(`  ⚪ Eşleşmeyen DB konuları: ${unmatchedDb.map(t => t.name).join(", ")}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Seed tamamlandı!");
  console.log(`   📊 Toplam kazanım: ${totalKazanim}`);
  console.log(`   📁 Güncellenen konu: ${totalUpdated}`);
  console.log(`   📝 Oluşturulan yeni konu: ${totalCreated}`);
  if (totalUnmatched > 0) {
    console.log(`   ⚠️  Eşleşemeyen: ${totalUnmatched}`);
  }
  console.log("=".repeat(60));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
