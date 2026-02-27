import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔗 Konu ön-koşulları ekleniyor...\n");

  const prereqs = [
    { topic: "İntegral", prereq: "Türev", strength: "hard" },
    { topic: "Türev", prereq: "Limit", strength: "hard" },
    { topic: "Limit", prereq: "Fonksiyonlar", strength: "soft" },
    { topic: "Belirli İntegral", prereq: "İntegral", strength: "hard" },
    { topic: "Türev Uygulamaları", prereq: "Türev", strength: "hard" },
    { topic: "Trigonometrik Denklemler", prereq: "Trigonometri", strength: "hard" },
    { topic: "Üstel ve Logaritmik Fonksiyonlar", prereq: "Logaritma", strength: "hard" },
    { topic: "Genetik Mühendisliği", prereq: "Kalıtım", strength: "hard" },
    { topic: "Organik Kimya", prereq: "Karbon Kimyası", strength: "hard" },
    { topic: "Elektrokimya", prereq: "Asitler ve Bazlar", strength: "soft" },
    { topic: "Koşullu Olasılık", prereq: "Olasılık", strength: "hard" },
  ];

  let created = 0;
  let skipped = 0;

  for (const p of prereqs) {
    const topic = await prisma.topic.findFirst({
      where: { name: { contains: p.topic } },
    });
    const prereq = await prisma.topic.findFirst({
      where: { name: { contains: p.prereq } },
    });

    if (topic && prereq) {
      await prisma.topicPrerequisite.upsert({
        where: {
          topicId_prerequisiteId: {
            topicId: topic.id,
            prerequisiteId: prereq.id,
          },
        },
        update: { strength: p.strength },
        create: {
          topicId: topic.id,
          prerequisiteId: prereq.id,
          strength: p.strength,
        },
      });
      console.log(`  ✓ ${p.topic} → ${p.prereq} (${p.strength})`);
      created++;
    } else {
      console.log(`  ✗ Bulunamadı: ${!topic ? p.topic : p.prereq}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Tamamlandı! ${created} ön-koşul eklendi, ${skipped} atlandı.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
