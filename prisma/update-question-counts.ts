/**
 * Soru sayılarını YKS standartlarına göre günceller.
 * Deploy sırasında çalışır. Başarısız olursa build'i kırmaz.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  const ayt = await prisma.examType.findUnique({ where: { slug: "ayt" } });

  if (!tyt || !ayt) {
    console.log("ExamType bulunamadi, atlanıyor.");
    return;
  }

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

  console.log(`Soru sayıları güncellendi (${totalUpdated} ders)`);
}

main()
  .catch((e) => {
    console.error("update-question-counts error:", e);
    // Don't crash the build
  })
  .finally(() => prisma.$disconnect());
