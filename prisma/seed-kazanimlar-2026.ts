import { PrismaClient } from "@prisma/client";
import { getMatematikTopics } from "./kazanim-data/matematik";
import { getKimyaTopics } from "./kazanim-data/kimya";
import { getFizikTopics } from "./kazanim-data/fizik";
import { getBiyolojiTopics } from "./kazanim-data/biyoloji";
import {
  getEdebiyatTopics,
  getTarihTopics,
  getCografyaTopics,
  getDinKulturuTopics,
  getFelsefeTopics,
  getMantikTopics,
  getSosyolojiTopics,
  getPsikolojiTopics,
} from "./kazanim-data/diger-dersler";

// Railway internal URL sadece deploy'da çalışır. Lokal'den çalıştırırken PUBLIC URL kullan.
const databaseUrl =
  process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (databaseUrl && databaseUrl !== process.env.DATABASE_URL) {
  console.log("🔗 DATABASE_PUBLIC_URL kullanılıyor (lokal erişim)...");
}

const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

// =============================================================================
// Unified interface — normalizes differences between data files
// =============================================================================

interface UnifiedKazanim {
  code: string;
  subTopicName: string;
  description: string;
  details: string[];
  isKeyKazanim: boolean;
}

interface UnifiedTopic {
  examType: "TYT" | "AYT";
  subject: string;
  topicKey: string;
  topicName: string;
  gradeLevel: number;
  learningArea: string;
  sortOrder: number;
  kazanimlar: UnifiedKazanim[];
}

// Infer grade level from kazanim code (e.g., "9.1.1.1" → 9)
function inferGradeLevel(kazanimlar: { code: string }[]): number {
  if (kazanimlar.length === 0) return 9;
  const firstCode = kazanimlar[0].code;
  const grade = parseInt(firstCode.split(".")[0]);
  return isNaN(grade) ? 9 : grade;
}

// Normalize data from any format to UnifiedTopic
function normalizeTopics(
  topics: ReturnType<typeof getMatematikTopics> | ReturnType<typeof getKimyaTopics>
): UnifiedTopic[] {
  return topics.map((t: any) => ({
    examType: t.examType,
    subject: t.subject || t.subjectName || "Unknown",
    topicKey: t.topicKey,
    topicName: t.topicName,
    gradeLevel: t.gradeLevel || inferGradeLevel(t.kazanimlar),
    learningArea: t.learningArea || "",
    sortOrder: t.sortOrder,
    kazanimlar: t.kazanimlar.map((k: any) => ({
      code: k.code,
      subTopicName: k.subTopicName || "",
      description: k.description,
      details: k.details || [],
      isKeyKazanim: k.isKeyKazanim || false,
    })),
  }));
}

// =============================================================================
// Subject name mapping for DB matching
// =============================================================================

const SUBJECT_NAME_MAP: Record<string, Record<string, string[]>> = {
  TYT: {
    Matematik: ["Matematik"],
    Fizik: ["Fen Bilimleri", "Fizik"],
    Kimya: ["Fen Bilimleri", "Kimya"],
    Biyoloji: ["Fen Bilimleri", "Biyoloji"],
    Edebiyat: ["Türkçe", "Edebiyat", "Türk Dili ve Edebiyatı"],
    Tarih: ["Sosyal Bilimler", "Tarih"],
    "Coğrafya": ["Sosyal Bilimler", "Coğrafya"],
    Felsefe: ["Sosyal Bilimler", "Felsefe"],
    "Din Kültürü": ["Sosyal Bilimler", "Din Kültürü", "Din Kültürü ve Ahlak Bilgisi"],
  },
  AYT: {
    Matematik: ["Matematik"],
    Fizik: ["Fizik"],
    Kimya: ["Kimya"],
    Biyoloji: ["Biyoloji"],
    Edebiyat: ["Edebiyat", "Türk Dili ve Edebiyatı"],
    Tarih: ["Tarih"],
    "Coğrafya": ["Coğrafya"],
    Felsefe: ["Felsefe", "Felsefe Grubu"],
    "Mantık": ["Mantık", "Felsefe Grubu"],
    Sosyoloji: ["Sosyoloji", "Felsefe Grubu"],
    Psikoloji: ["Psikoloji", "Felsefe Grubu"],
  },
};

function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[İ]/g, "i")
    .replace(/[ı]/g, "i")
    .replace(/[Ö]/g, "o")
    .replace(/[ö]/g, "o")
    .replace(/[Ü]/g, "u")
    .replace(/[ü]/g, "u")
    .replace(/[Ç]/g, "c")
    .replace(/[ç]/g, "c")
    .replace(/[Ş]/g, "s")
    .replace(/[ş]/g, "s")
    .replace(/[Ğ]/g, "g")
    .replace(/[ğ]/g, "g")
    .replace(/[^a-z0-9]/g, "");
}

function topicMatchScore(dbName: string, curriculumName: string): number {
  const a = normalizeForSearch(dbName);
  const b = normalizeForSearch(curriculumName);

  // Exact match → highest score
  if (a === b) return 1000;

  // Includes match — score by length similarity (closer lengths = better match)
  if (a.includes(b) || b.includes(a)) {
    const ratio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    return Math.round(ratio * 100); // 0-100
  }

  // Prefix match (first 8 chars)
  if (a.length >= 8 && b.length >= 8 && a.substring(0, 8) === b.substring(0, 8)) {
    return 30;
  }

  return 0;
}

function findBestMatch(
  existingTopics: { id: string; name: string }[],
  targetName: string,
  alreadyMatchedIds: Set<string>
): { id: string; name: string } | null {
  let bestScore = 0;
  let bestMatch: { id: string; name: string } | null = null;

  for (const t of existingTopics) {
    if (alreadyMatchedIds.has(t.id)) continue; // Skip already matched
    const score = topicMatchScore(t.name, targetName);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = t;
    }
  }

  // Also try with subject prefix (e.g., "Fizik - Enerji")
  // Only if we haven't found a good match yet
  if (bestScore < 40) {
    return null;
  }

  return bestMatch;
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function main() {
  console.log("🎯 ÖSYM 2026 Kazanım Seed Script (v2) başlıyor...\n");

  // Collect ALL topic data from all subjects
  const allTopics: UnifiedTopic[] = [
    ...normalizeTopics(getMatematikTopics()),
    ...normalizeTopics(getFizikTopics()),
    ...normalizeTopics(getKimyaTopics()),
    ...normalizeTopics(getBiyolojiTopics()),
    ...normalizeTopics(getEdebiyatTopics()),
    ...normalizeTopics(getTarihTopics()),
    ...normalizeTopics(getCografyaTopics()),
    ...normalizeTopics(getDinKulturuTopics()),
    ...normalizeTopics(getFelsefeTopics()),
    ...normalizeTopics(getMantikTopics()),
    ...normalizeTopics(getSosyolojiTopics()),
    ...normalizeTopics(getPsikolojiTopics()),
  ];

  console.log(`📊 Toplam ${allTopics.length} konu verisi yüklendi.\n`);

  // Get exam types
  const examTypes = await prisma.examType.findMany();
  const examTypeMap: Record<string, string> = {};
  for (const et of examTypes) {
    examTypeMap[et.name] = et.id;
  }

  if (!examTypeMap["TYT"] || !examTypeMap["AYT"]) {
    console.error("❌ ExamType TYT veya AYT bulunamadı! Önce seed.ts çalıştırın.");
    process.exit(1);
  }

  // ---- Phase 1: Delete existing kazanımlar ----
  console.log("🗑️  Mevcut kazanımlar siliniyor...");
  const deleteResult = await prisma.topicKazanim.deleteMany({});
  console.log(`   Silinen: ${deleteResult.count} kazanım\n`);

  // ---- Phase 2: Group topics by exam+subject ----
  const grouped: Record<string, UnifiedTopic[]> = {};
  for (const topic of allTopics) {
    const key = `${topic.examType}::${topic.subject}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(topic);
  }

  let totalKazanim = 0;
  let totalTopicUpdated = 0;
  let totalTopicCreated = 0;

  // ---- Phase 3: Process each exam+subject group ----
  for (const [groupKey, topics] of Object.entries(grouped)) {
    const [examTypeName, subjectName] = groupKey.split("::");
    const examTypeId = examTypeMap[examTypeName];
    if (!examTypeId) {
      console.warn(`⚠️  ExamType "${examTypeName}" bulunamadı, atlanıyor.`);
      continue;
    }

    console.log(`\n📘 ${examTypeName} > ${subjectName}`);

    // Find subject in DB
    const possibleNames = SUBJECT_NAME_MAP[examTypeName]?.[subjectName] || [subjectName];
    let subject = null;

    for (const name of possibleNames) {
      subject = await prisma.subject.findFirst({
        where: { examTypeId, name },
      });
      if (subject) break;
    }

    if (!subject) {
      const allSubjects = await prisma.subject.findMany({ where: { examTypeId } });
      subject =
        allSubjects.find((s) => possibleNames.some((pn) => fuzzyTopicMatch(s.name, pn))) || null;
    }

    if (!subject) {
      console.log(`  📝 Ders oluşturuluyor: ${subjectName}`);
      subject = await prisma.subject.create({
        data: {
          name: subjectName,
          examTypeId,
          questionCount: 10,
          sortOrder: 99,
        },
      });
    }

    // Load all existing topics for this subject ONCE
    const existingTopics = await prisma.topic.findMany({
      where: { subjectId: subject.id },
    });
    const matchedTopicIds = new Set<string>();

    // Process each topic
    for (const topicData of topics) {
      const { topicName, topicKey, sortOrder, gradeLevel, learningArea, kazanimlar } = topicData;

      // Find best matching topic in DB (avoids double-matching)
      let topic = findBestMatch(existingTopics, topicName, matchedTopicIds);

      // Also try with subject prefix (e.g., "Fizik - Enerji")
      if (!topic) {
        const prefixedName = `${subjectName} - ${topicName}`;
        topic = findBestMatch(existingTopics, prefixedName, matchedTopicIds);
      }

      if (topic) {
        matchedTopicIds.add(topic.id); // Prevent re-use

        // Update topic with new data
        await prisma.topic.update({
          where: { id: topic.id },
          data: {
            sortOrder,
            gradeLevel: gradeLevel || undefined,
            learningArea: learningArea || undefined,
          },
        });
        totalTopicUpdated++;

        const score = topicMatchScore(topic.name, topicName);
        console.log(
          `  ✅ Konu güncellendi: ${topic.name} (sıra: ${sortOrder}, sınıf: ${gradeLevel}, skor: ${score})`
        );
      } else {
        const created = await prisma.topic.create({
          data: {
            name: topicName,
            subjectId: subject.id,
            sortOrder,
            gradeLevel: gradeLevel || undefined,
            learningArea: learningArea || undefined,
          },
        });
        topic = created;
        matchedTopicIds.add(created.id);
        totalTopicCreated++;
        console.log(
          `  📝 Konu oluşturuldu: ${topicName} (sıra: ${sortOrder}, sınıf: ${gradeLevel})`
        );
      }

      // Create kazanımlar
      for (let i = 0; i < kazanimlar.length; i++) {
        const k = kazanimlar[i];

        await prisma.topicKazanim.create({
          data: {
            topicId: topic.id,
            code: k.code,
            subTopicName: k.subTopicName || null,
            description: k.description,
            details: k.details.length > 0 ? k.details.join("\n") : null,
            isKeyKazanim: k.isKeyKazanim,
            sortOrder: i + 1,
          },
        });
        totalKazanim++;
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🎉 Seed tamamlandı!`);
  console.log(`   📊 Toplam kazanım: ${totalKazanim}`);
  console.log(`   📁 Güncellenen konu: ${totalTopicUpdated}`);
  console.log(`   📝 Oluşturulan konu: ${totalTopicCreated}`);
  console.log("=".repeat(60));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
