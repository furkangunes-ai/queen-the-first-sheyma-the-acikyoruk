import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔺 AYT Geometri dersi ekleniyor...");

  // AYT sınav türünü bul
  const ayt = await prisma.examType.findUnique({ where: { slug: "ayt" } });
  if (!ayt) {
    throw new Error("AYT sınav türü bulunamadı!");
  }

  // AYT Matematik questionCount'u 30'a güncelle
  const aytMatematik = await prisma.subject.findFirst({
    where: { name: "Matematik", examTypeId: ayt.id },
  });
  if (aytMatematik && aytMatematik.questionCount !== 30) {
    await prisma.subject.update({
      where: { id: aytMatematik.id },
      data: { questionCount: 30 },
    });
    console.log("✅ AYT Matematik soru sayısı 40 → 30 olarak güncellendi");
  }

  // AYT Geometri zaten var mı kontrol et
  let geometri = await prisma.subject.findFirst({
    where: { name: "Geometri", examTypeId: ayt.id },
  });

  if (!geometri) {
    // sortOrder: mevcut en yüksek + 1
    const maxSort = await prisma.subject.aggregate({
      where: { examTypeId: ayt.id },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    geometri = await prisma.subject.create({
      data: {
        name: "Geometri",
        questionCount: 10,
        examTypeId: ayt.id,
        sortOrder: nextSort,
      },
    });
    console.log("✅ AYT Geometri dersi oluşturuldu");
  } else {
    console.log("ℹ️  AYT Geometri dersi zaten mevcut");
  }

  // Konular
  const topics = [
    "Temel Kavramlar",
    "Doğruda Açılar",
    "Üçgende Açılar",
    "Özel Üçgenler - Dik Üçgen",
    "Özel Üçgenler - İkizkenar Üçgen",
    "Özel Üçgenler - Eşkenar Üçgen",
    "Açıortay",
    "Kenarortay",
    "Üçgende Alan",
    "Üçgende Benzerlik",
    "Açı Kenar Bağıntıları",
    "Çokgenler",
    "Özel Dörtgenler",
    "Dörtgenler - Deltoid",
    "Dörtgenler - Paralelkenar",
    "Dörtgenler - Eşkenar Dörtgen",
    "Dörtgenler - Dikdörtgen",
    "Dörtgenler - Kare",
    "Dörtgenler - İkizkenar Yamuk",
    "Dörtgenler - Yamuk",
    "Çember ve Daire",
    "Analitik Geometri - Noktanın Analitiği",
    "Analitik Geometri - Doğrunun Analitiği",
    "Analitik Geometri - Dönüşüm Geometrisi",
    "Katı Cisimler - Dikdörtgenler Prizması",
    "Katı Cisimler - Küp",
    "Katı Cisimler - Silindir",
    "Katı Cisimler - Piramit",
    "Katı Cisimler - Koni",
    "Katı Cisimler - Küre",
    "Çemberin Analitiği",
  ];

  // Mevcut konuları al
  const existingTopics = await prisma.topic.findMany({
    where: { subjectId: geometri.id },
    select: { name: true },
  });
  const existingNames = new Set(existingTopics.map((t) => t.name));
  let nextOrder = existingTopics.length;
  let created = 0;

  for (const topicName of topics) {
    if (!existingNames.has(topicName)) {
      await prisma.topic.create({
        data: {
          name: topicName,
          subjectId: geometri.id,
          sortOrder: nextOrder++,
        },
      });
      created++;
    }
  }

  console.log(`✅ ${created} konu eklendi (${topics.length - created} zaten mevcuttu)`);
  console.log("\n🎉 AYT Geometri müfredatı başarıyla eklendi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
