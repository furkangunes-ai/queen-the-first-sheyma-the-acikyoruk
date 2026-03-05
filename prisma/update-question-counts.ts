/**
 * Soru sayılarını YKS standartlarına göre günceller ve eksik dersleri ekler.
 * Deploy sırasında çalışır. Başarısız olursa build'i kırmaz.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  const ayt = await prisma.examType.findUnique({ where: { slug: "ayt" } });

  if (!tyt || !ayt) {
    console.log("ExamType bulunamadi, atlaniyor.");
    return;
  }

  // 1. Soru sayılarını güncelle
  const updates = [
    // TYT
    { name: "Felsefe", examTypeId: tyt.id, questionCount: 5 },
    { name: "Din Kültürü ve Ahlak Bilgisi", examTypeId: tyt.id, questionCount: 5 },
    // AYT
    { name: "Felsefe", examTypeId: ayt.id, questionCount: 8 },
    { name: "Mantık", examTypeId: ayt.id, questionCount: 4 },
    { name: "Psikoloji", examTypeId: ayt.id, questionCount: 4 },
    { name: "Sosyoloji", examTypeId: ayt.id, questionCount: 4 },
    { name: "Din Kültürü ve Ahlak Bilgisi", examTypeId: ayt.id, questionCount: 4 },
  ];

  let totalUpdated = 0;
  for (const u of updates) {
    const result = await prisma.subject.updateMany({
      where: { name: u.name, examTypeId: u.examTypeId },
      data: { questionCount: u.questionCount },
    });
    totalUpdated += result.count;
  }

  // 2. AYT Biyoloji yoksa oluştur
  const aytBio = await prisma.subject.findFirst({
    where: { name: "Biyoloji", examTypeId: ayt.id },
  });

  if (!aytBio) {
    // sortOrder: Kimya'dan sonra (2 → Fizik=0, Kimya=1, Biyoloji=2... ama mevcut yapıya göre ayarla)
    const aytSubjectCount = await prisma.subject.count({ where: { examTypeId: ayt.id } });

    const newBio = await prisma.subject.create({
      data: {
        name: "Biyoloji",
        questionCount: 13,
        examTypeId: ayt.id,
        sortOrder: 2, // Fizik(0), Kimya(1), Biyoloji(2)
      },
    });

    const aytBioTopics = [
      "Hücre Bölünmeleri",
      "Eşeysiz-Eşeyli Üreme",
      "İnsanda Üreme ve Gelişme",
      "Mendel Genetiği",
      "Kan Grupları",
      "Cinsiyete Bağlı Kalıtım",
      "Biyoteknoloji ve Evrim",
      "Solunum",
      "Fotosentez",
      "Kemosentez",
      "Bitki Biyolojisi",
      "Sistemler",
      "Duyu Organları",
      "Komünite ve Popülasyon Ekolojisi",
    ];

    for (let i = 0; i < aytBioTopics.length; i++) {
      await prisma.topic.create({
        data: {
          name: aytBioTopics[i],
          subjectId: newBio.id,
          sortOrder: i,
        },
      });
    }

    // Diğer AYT derslerinin sortOrder'ını kaydır (Edebiyat, Coğrafya, Tarih, vs.)
    await prisma.subject.updateMany({
      where: {
        examTypeId: ayt.id,
        sortOrder: { gte: 2 },
        id: { not: newBio.id },
      },
      data: { sortOrder: { increment: 1 } },
    });

    console.log(`AYT Biyoloji oluşturuldu (${aytBioTopics.length} konu)`);
    totalUpdated++;
  }

  console.log(`Soru sayilari guncellendi (${totalUpdated} ders)`);
}

main()
  .catch((e) => {
    console.error("update-question-counts error:", e);
    // Don't crash the build
  })
  .finally(() => prisma.$disconnect());
