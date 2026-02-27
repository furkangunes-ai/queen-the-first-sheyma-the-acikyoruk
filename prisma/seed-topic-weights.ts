import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚖️ Konu zorluk ve tahmini saat güncelleniyor...\n");

  const weights = [
    { pattern: "Türev", difficulty: 5, estimatedHours: 6 },
    { pattern: "İntegral", difficulty: 5, estimatedHours: 8 },
    { pattern: "Limit", difficulty: 4, estimatedHours: 3 },
    { pattern: "Olasılık", difficulty: 4, estimatedHours: 4 },
    { pattern: "Trigonometri", difficulty: 4, estimatedHours: 5 },
    { pattern: "Logaritma", difficulty: 3, estimatedHours: 3 },
    { pattern: "Fonksiyonlar", difficulty: 4, estimatedHours: 5 },
    { pattern: "Organik Kimya", difficulty: 5, estimatedHours: 6 },
    { pattern: "Elektrokimya", difficulty: 4, estimatedHours: 4 },
    { pattern: "Genetik", difficulty: 4, estimatedHours: 4 },
    { pattern: "Paragraf", difficulty: 2, estimatedHours: 3 },
    { pattern: "Ses Bilgisi", difficulty: 1, estimatedHours: 1 },
    { pattern: "Sözcükte Anlam", difficulty: 1, estimatedHours: 1.5 },
    { pattern: "Vektörler", difficulty: 3, estimatedHours: 2 },
    { pattern: "Madde ve Özellikleri", difficulty: 2, estimatedHours: 2 },
    { pattern: "Kuvvet ve Hareket", difficulty: 3, estimatedHours: 4 },
    { pattern: "Elektrik", difficulty: 4, estimatedHours: 5 },
    { pattern: "Kimyasal Hesaplamalar", difficulty: 3, estimatedHours: 3 },
    { pattern: "Denklemler ve Eşitsizlikler", difficulty: 3, estimatedHours: 3 },
    { pattern: "Sayılar", difficulty: 2, estimatedHours: 2 },
    { pattern: "Cumhuriyet Dönemi", difficulty: 4, estimatedHours: 5 },
    { pattern: "Osmanlı", difficulty: 3, estimatedHours: 4 },
  ];

  let updated = 0;
  let skipped = 0;

  for (const w of weights) {
    const topics = await prisma.topic.findMany({
      where: { name: { contains: w.pattern } },
    });

    if (topics.length > 0) {
      for (const topic of topics) {
        await prisma.topic.update({
          where: { id: topic.id },
          data: {
            difficulty: w.difficulty,
            estimatedHours: w.estimatedHours,
          },
        });
        console.log(
          `  ✓ ${topic.name} → zorluk: ${w.difficulty}, saat: ${w.estimatedHours}`
        );
        updated++;
      }
    } else {
      console.log(`  ✗ Eşleşen konu bulunamadı: "${w.pattern}"`);
      skipped++;
    }
  }

  console.log(
    `\n🎉 Tamamlandı! ${updated} konu güncellendi, ${skipped} pattern atlandı.`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
