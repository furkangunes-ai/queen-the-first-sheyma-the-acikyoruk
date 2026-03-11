#!/usr/bin/env tsx
// ==================== Müfredat Atomize Etme Script'i ====================
//
// Bu script, ders konularını LLM kullanarak atomik kavramlara (ConceptNode)
// böler ve aralarındaki bağımlılıkları (DependencyEdge) belirler.
//
// Kullanım:
//   OPENAI_API_KEY=... npx tsx scripts/seed-concepts.ts <ders-adı>
//
// Çıktı: prisma/seed-data/<ders-slug>.json
//
// Sonraki adım: Admin panelden JSON import veya:
//   curl -X POST http://localhost:3000/api/cognitive/seed \
//     -H "Content-Type: application/json" \
//     -d @prisma/seed-data/matematik.json

import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";

// ==================== Yapılandırma ====================

const DERS_KONULARI: Record<string, { examType: string; topics: string[] }> = {
  Matematik: {
    examType: "both",
    topics: [
      "Temel Kavramlar", "Sayı Basamakları", "Bölme ve Bölünebilme",
      "EBOB-EKOK", "Rasyonel Sayılar", "Basit Eşitsizlikler",
      "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar",
      "Çarpanlara Ayırma", "Oran-Orantı", "Denklem Çözme",
      "Problemler", "Kümeler", "Fonksiyonlar",
      "Polinomlar", "İkinci Dereceden Denklemler",
      "Permütasyon-Kombinasyon", "Olasılık", "İstatistik",
      "Trigonometri", "Logaritma", "Diziler", "Limit", "Türev", "İntegral",
    ],
  },
  Fizik: {
    examType: "both",
    topics: [
      "Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet",
      "Enerji", "Isı ve Sıcaklık", "Elektrostatik", "Elektrik Akımı",
      "Manyetizma", "Dalgalar", "Optik", "Modern Fizik",
    ],
  },
  Kimya: {
    examType: "both",
    topics: [
      "Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler",
      "Maddenin Halleri", "Mol Kavramı", "Karışımlar",
      "Kimyasal Tepkimeler", "Asitler ve Bazlar", "Kimyasal Denge",
      "Çözünürlük Dengesi", "Elektrokimya", "Organik Kimya",
    ],
  },
  Biyoloji: {
    examType: "both",
    topics: [
      "Canlıların Ortak Özellikleri", "Hücre", "Canlıların Sınıflandırılması",
      "Kalıtım", "Ekosistem", "Sindirim Sistemi", "Dolaşım Sistemi",
      "Solunum Sistemi", "Boşaltım Sistemi", "Destek ve Hareket",
      "Sinir Sistemi", "Endokrin Sistem", "Üreme ve Gelişme",
    ],
  },
  Geometri: {
    examType: "both",
    topics: [
      "Temel Kavramlar", "Doğruda Açılar", "Üçgenler",
      "Üçgenlerde Benzerlik", "Üçgenlerde Alan", "Çokgenler",
      "Dörtgenler", "Çember ve Daire", "Analitik Geometri",
      "Katı Cisimler", "Dönüşüm Geometrisi",
    ],
  },
};

const SYSTEM_PROMPT = `Sen bir eğitim müfredatı uzmanısın. Verilen konu listesini atomik kavramlara ayırıyorsun.

KURALLAR:
1. Her konuyu 3-8 atomik kavrama böl (toplam konu başına ortalama 5)
2. Her kavram tek bir öğrenilebilir birim olmalı (1-2 saatte öğrenilebilir)
3. Kavramlar arası bağımlılıkları belirle (hangi kavram hangi kavramın ön koşulu)
4. Bağımlılık ağırlığı (W): 0.3=zayıf ilişki, 0.5=orta, 0.7=güçlü, 0.9=zorunlu ön koşul
5. Karmaşıklık skoru (1-10): 1=çok kolay, 5=orta, 10=çok zor
6. Slug formatı: turkce-karaktersiz-kucuk-harf-tire-ayirici

JSON formatında yanıt ver:
{
  "nodes": [
    { "name": "Kavram Adı", "slug": "kavram-adi", "domain": "Ders", "examType": "both", "complexityScore": 5 }
  ],
  "edges": [
    { "parentSlug": "on-kosul-slug", "childSlug": "bagimli-slug", "dependencyWeight": 0.7 }
  ]
}

SADECE JSON döndür, başka açıklama yapma.`;

// ==================== Ana Fonksiyon ====================

async function seedConcepts(dersAdi: string) {
  const ders = DERS_KONULARI[dersAdi];
  if (!ders) {
    console.error(`Geçersiz ders: ${dersAdi}`);
    console.log(`Mevcut dersler: ${Object.keys(DERS_KONULARI).join(", ")}`);
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY ortam değişkeni gerekli");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  console.log(`\n=== ${dersAdi} Kavram Üretimi ===`);
  console.log(`Konu sayısı: ${ders.topics.length}`);
  console.log(`Hedef kavram: ~${ders.topics.length * 5}\n`);

  const userPrompt = `Ders: ${dersAdi}
Sınav tipi: ${ders.examType}

Konular (müfredat sırasıyla):
${ders.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Bu konuları atomik kavramlara böl. Her konudan en az 3, en fazla 8 kavram çıkar.
Konular arası ön koşul bağımlılıklarını da belirle (önceki konulardan sonrakilere).
Domain olarak "${dersAdi}" kullan.`;

  try {
    console.log("LLM'e istek gönderiliyor...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    });

    const rawResponse = completion.choices[0]?.message?.content || "";

    // JSON çıkar
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("LLM yanıtında JSON bulunamadı");
      console.log("Ham yanıt:", rawResponse.substring(0, 500));
      process.exit(1);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const nodeCount = parsed.nodes?.length || 0;
    const edgeCount = parsed.edges?.length || 0;

    console.log(`Üretilen kavram: ${nodeCount}`);
    console.log(`Üretilen bağlantı: ${edgeCount}`);

    // Dosyaya yaz
    const slug = dersAdi
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-");

    const outDir = path.join(process.cwd(), "prisma", "seed-data");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, `${slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), "utf-8");

    console.log(`\nKaydedildi: ${outPath}`);
    console.log(`\nDoğrulamak için: npx tsx scripts/validate-dag.ts ${outPath}`);
    console.log(`Import etmek için: Admin Panel > Bilişsel Çizge > Toplu Import`);
  } catch (err: any) {
    console.error("Hata:", err.message);
    process.exit(1);
  }
}

// CLI
const dersAdi = process.argv[2];
if (!dersAdi) {
  console.log("Kullanım: OPENAI_API_KEY=... npx tsx scripts/seed-concepts.ts <ders-adı>");
  console.log(`Mevcut dersler: ${Object.keys(DERS_KONULARI).join(", ")}`);
  process.exit(0);
}

seedConcepts(dersAdi);
