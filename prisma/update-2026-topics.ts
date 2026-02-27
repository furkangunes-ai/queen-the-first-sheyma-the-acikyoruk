/**
 * 2026 YKS Müfredat Güncelleme Script'i
 *
 * Bu script mevcut veritabanındaki konuları günceller:
 * 1. "Konikler (Elips, Hiperbol)" → ayrı "Elips" ve "Hiperbol" konuları
 * 2. "Matris ve Determinant" → ayrı "Matrisler" ve "Determinant" konuları
 * 3. "Kombinatorik" → "Koşullu Olasılık" olarak güncelleme
 * 4. Eksik konuları ekler (idempotent)
 *
 * Kullanım: railway run npx tsx prisma/update-2026-topics.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎓 2026 YKS Müfredat Güncellemesi başlıyor...\n");

  // ==================== AYT MATEMATİK: Konikler split ====================
  const aytMat = await prisma.subject.findFirst({
    where: { name: "Matematik", examType: { slug: "ayt" } },
    include: { topics: true },
  });

  if (aytMat) {
    const topicNames = new Set(aytMat.topics.map((t) => t.name));
    const maxSort = aytMat.topics.length > 0
      ? Math.max(...aytMat.topics.map((t) => t.sortOrder))
      : -1;
    let nextSort = maxSort + 1;

    // --- Split "Konikler (Elips, Hiperbol)" ---
    const konikler = aytMat.topics.find((t) => t.name === "Konikler (Elips, Hiperbol)");
    if (konikler) {
      // Create "Elips" if not exists
      if (!topicNames.has("Elips")) {
        await prisma.topic.create({
          data: { name: "Elips", subjectId: aytMat.id, sortOrder: nextSort++ },
        });
        console.log("  ✅ 'Elips' konusu oluşturuldu");
      }

      // Create "Hiperbol" if not exists
      if (!topicNames.has("Hiperbol")) {
        await prisma.topic.create({
          data: { name: "Hiperbol", subjectId: aytMat.id, sortOrder: nextSort++ },
        });
        console.log("  ✅ 'Hiperbol' konusu oluşturuldu");
      }

      // Find the new Elips topic to transfer references
      const elipsTopic = await prisma.topic.findFirst({
        where: { name: "Elips", subjectId: aytMat.id },
      });

      if (elipsTopic) {
        // Transfer DailyStudy references
        const dsCount = await prisma.dailyStudy.updateMany({
          where: { topicId: konikler.id },
          data: { topicId: elipsTopic.id },
        });

        // Transfer TopicReview references
        const trCount = await prisma.topicReview.updateMany({
          where: { topicId: konikler.id },
          data: { topicId: elipsTopic.id },
        });

        // Transfer TopicKnowledge references
        const tkCount = await prisma.topicKnowledge.updateMany({
          where: { topicId: konikler.id },
          data: { topicId: elipsTopic.id },
        });

        // Transfer WeeklyPlanItem references
        const wpCount = await prisma.weeklyPlanItem.updateMany({
          where: { topicId: konikler.id },
          data: { topicId: elipsTopic.id },
        });

        // Transfer ExamWrongQuestion references
        const ewCount = await prisma.examWrongQuestion.updateMany({
          where: { topicId: konikler.id },
          data: { topicId: elipsTopic.id },
        });

        // Transfer ExamEmptyQuestion references
        const eeCount = await prisma.examEmptyQuestion.updateMany({
          where: { topicId: konikler.id },
          data: { topicId: elipsTopic.id },
        });

        console.log(`  📦 Konikler → Elips referansları taşındı (ds:${dsCount.count}, tr:${trCount.count}, tk:${tkCount.count}, wp:${wpCount.count}, ew:${ewCount.count}, ee:${eeCount.count})`);
      }

      // Delete old "Konikler (Elips, Hiperbol)" topic
      await prisma.topic.delete({ where: { id: konikler.id } });
      console.log("  🗑️ 'Konikler (Elips, Hiperbol)' silindi");
    }

    // --- Split "Matris ve Determinant" ---
    const matrisDet = aytMat.topics.find((t) => t.name === "Matris ve Determinant");
    if (matrisDet) {
      if (!topicNames.has("Matrisler")) {
        await prisma.topic.create({
          data: { name: "Matrisler", subjectId: aytMat.id, sortOrder: nextSort++ },
        });
        console.log("  ✅ 'Matrisler' konusu oluşturuldu");
      }
      if (!topicNames.has("Determinant")) {
        await prisma.topic.create({
          data: { name: "Determinant", subjectId: aytMat.id, sortOrder: nextSort++ },
        });
        console.log("  ✅ 'Determinant' konusu oluşturuldu");
      }

      // Transfer references to Matrisler
      const matTopic = await prisma.topic.findFirst({
        where: { name: "Matrisler", subjectId: aytMat.id },
      });
      if (matTopic) {
        await prisma.dailyStudy.updateMany({ where: { topicId: matrisDet.id }, data: { topicId: matTopic.id } });
        await prisma.topicReview.updateMany({ where: { topicId: matrisDet.id }, data: { topicId: matTopic.id } });
        await prisma.topicKnowledge.updateMany({ where: { topicId: matrisDet.id }, data: { topicId: matTopic.id } });
        await prisma.weeklyPlanItem.updateMany({ where: { topicId: matrisDet.id }, data: { topicId: matTopic.id } });
        await prisma.examWrongQuestion.updateMany({ where: { topicId: matrisDet.id }, data: { topicId: matTopic.id } });
        await prisma.examEmptyQuestion.updateMany({ where: { topicId: matrisDet.id }, data: { topicId: matTopic.id } });
        console.log("  📦 'Matris ve Determinant' → 'Matrisler' referansları taşındı");
      }
      await prisma.topic.delete({ where: { id: matrisDet.id } });
      console.log("  🗑️ 'Matris ve Determinant' silindi");
    }

    // --- Add missing AYT Matematik topics ---
    const missingTopics = [
      "Bileşke ve Ters Fonksiyon",
      "Polinomların Çarpanlara Ayrılması",
      "Trigonometrik Fonksiyonlar", "Trigonometrik Denklemler",
      "Üstel ve Logaritmik Fonksiyonlar",
      "Aritmetik Dizi", "Geometrik Dizi",
      "Süreklilik",
      "Belirli İntegral",
      "Koşullu Olasılık",
      "Doğru Denklemleri", "Çember",
    ];

    // Refresh topic names
    const refreshed = await prisma.topic.findMany({
      where: { subjectId: aytMat.id },
      select: { name: true },
    });
    const currentNames = new Set(refreshed.map((t) => t.name));

    let added = 0;
    for (const name of missingTopics) {
      if (!currentNames.has(name)) {
        await prisma.topic.create({
          data: { name, subjectId: aytMat.id, sortOrder: nextSort++ },
        });
        added++;
      }
    }
    console.log(`✅ AYT Matematik: ${added} yeni konu eklendi\n`);
  } else {
    console.log("⚠️ AYT Matematik bulunamadı!\n");
  }

  // ==================== TYT konuları kontrol ====================
  // Seed'deki tüm konuları kontrol et ve eksik olanları ekle
  const tytSubjectTopics: Record<string, string[]> = {
    "Türkçe": [
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf",
      "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri",
      "Sözcük Türleri", "Cümle Türleri", "Cümlenin Ögeleri",
      "Anlatım Bozuklukları", "Dil Bilgisi (Genel)",
      "Fiiller (Eylemler)", "Ekler (Yapım-Çekim)", "Söz Sanatları",
      "Metin Türleri", "Anlatım Türleri ve Biçimleri",
    ],
    "Matematik": [
      "Temel Kavramlar", "Sayı Basamakları", "Bölünebilme Kuralları",
      "EBOB-EKOK", "Rasyonel Sayılar", "Basit Eşitsizlikler",
      "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar",
      "Çarpanlara Ayırma", "Oran-Orantı", "Denklem Çözme",
      "Problemler (Sayı)", "Problemler (Kesir)", "Problemler (Yaş)",
      "Problemler (İşçi-Havuz)", "Problemler (Hareket)",
      "Yüzde-Kâr-Zarar", "Kümeler", "Fonksiyonlar",
      "Polinomlar", "İkinci Dereceden Denklemler",
      "Permütasyon-Kombinasyon", "Olasılık", "İstatistik",
      "Veri Analizi", "Mantık", "Problemler (Faiz)",
      "Problemler (Karışım)", "Grafik Okuma ve Yorumlama",
    ],
  };

  for (const [subjectName, topics] of Object.entries(tytSubjectTopics)) {
    const subject = await prisma.subject.findFirst({
      where: { name: subjectName, examType: { slug: "tyt" } },
      include: { topics: true },
    });
    if (!subject) continue;

    const existing = new Set(subject.topics.map((t) => t.name));
    const max = subject.topics.length > 0
      ? Math.max(...subject.topics.map((t) => t.sortOrder))
      : -1;
    let ns = max + 1;
    let count = 0;
    for (const t of topics) {
      if (!existing.has(t)) {
        await prisma.topic.create({
          data: { name: t, subjectId: subject.id, sortOrder: ns++ },
        });
        count++;
      }
    }
    if (count > 0) console.log(`✅ TYT ${subjectName}: ${count} yeni konu eklendi`);
  }

  // ==================== AYT diğer dersler kontrol ====================
  const aytSubjectTopics: Record<string, string[]> = {
    "Fizik": [
      "Vektörler", "Kuvvet-Denge", "Tork",
      "Elektrik Alan ve Potansiyel", "Manyetizma",
      "İndüksiyon", "Dalgalar", "Atom Fiziği",
      "Modern Fizik", "Çembersel Hareket",
      "Basit Harmonik Hareket", "Dalga Mekaniği",
      "Elektrik Devreleri", "Optik (Aynalar ve Mercekler)",
      "Akışkanlar Mekaniği",
    ],
    "Kimya": [
      "Mol Kavramı", "Kimyasal Hesaplamalar",
      "Gazlar", "Çözeltiler", "Kimyasal Denge",
      "Asitler ve Bazlar", "Elektrokimya",
      "Organik Kimya", "Termokimya",
      "Kimyasal Kinetik", "Çözünürlük Dengesi",
      "Fonksiyonel Gruplar", "Polimerler",
      "Endüstriyel Kimya",
    ],
    "Biyoloji": [
      "Hücre Bölünmesi", "Kalıtım",
      "Genetik Mühendisliği", "Ekoloji",
      "Bitki Biyolojisi", "Solunum",
      "Fotosentez", "İnsan Fizyolojisi",
      "Protein Sentezi", "DNA Replikasyonu",
      "Endokrin Sistem", "Sindirim Sistemi",
      "Boşaltım Sistemi", "Duyu Organları",
      "Komünite ve Popülasyon Ekolojisi",
    ],
    "Edebiyat": [
      "Şiir Bilgisi", "Edebi Akımlar",
      "Tanzimat Edebiyatı", "Servet-i Fünun",
      "Milli Edebiyat", "Cumhuriyet Dönemi",
      "Halk Edebiyatı", "Divan Edebiyatı",
      "Roman/Hikaye Analizi", "Fecr-i Ati",
      "Yedi Meşaleciler", "Garip Akımı",
      "İkinci Yeni", "Sözlü Edebiyat Dönemi",
      "Edebi Sanatlar (Söz Sanatları)",
    ],
    "Tarih": [
      "Osmanlı Devleti (Gerileme-Yıkılış)",
      "I. Dünya Savaşı", "Kurtuluş Savaşı",
      "Atatürk İlkeleri", "Çağdaş Türk-Dünya Tarihi",
      "II. Dünya Savaşı", "Soğuk Savaş Dönemi",
      "Türk Devrim Tarihi", "Demokratikleşme Süreci",
      "Türkiye'nin Dış Politikası", "Çağdaş Dünya Tarihi",
      "Osmanlı Kültür ve Medeniyeti",
    ],
    "Coğrafya": [
      "Türkiye'nin Yer Şekilleri", "İklim ve Bitki Örtüsü",
      "Nüfus ve Yerleşme", "Ekonomik Coğrafya",
      "Bölgesel Coğrafya", "Harita Bilgisi",
      "Toprak ve Su Kaynakları", "Çevre Sorunları",
      "Doğal Afetler", "Ulaşım",
    ],
  };

  for (const [subjectName, topics] of Object.entries(aytSubjectTopics)) {
    const subject = await prisma.subject.findFirst({
      where: { name: subjectName, examType: { slug: "ayt" } },
      include: { topics: true },
    });
    if (!subject) continue;

    const existing = new Set(subject.topics.map((t) => t.name));
    const max = subject.topics.length > 0
      ? Math.max(...subject.topics.map((t) => t.sortOrder))
      : -1;
    let ns = max + 1;
    let count = 0;
    for (const t of topics) {
      if (!existing.has(t)) {
        await prisma.topic.create({
          data: { name: t, subjectId: subject.id, sortOrder: ns++ },
        });
        count++;
      }
    }
    if (count > 0) console.log(`✅ AYT ${subjectName}: ${count} yeni konu eklendi`);
  }

  // ==================== DÜZELTME: Kimya'da yanlış konuları sil ====================
  console.log("\n--- Yanlış ders atamaları düzeltiliyor ---");

  // "Karbonhidratlar-Yağlar-Proteinler" Kimya'da değil, Biyoloji'de olmalı
  const kimyaSubjects = await prisma.subject.findMany({
    where: { name: "Kimya" },
    include: { topics: true },
  });
  for (const kimya of kimyaSubjects) {
    for (const topic of kimya.topics) {
      if (topic.name.includes("Karbonhidrat") || topic.name.includes("Protein")) {
        // Check if there are references
        const refs = await Promise.all([
          prisma.dailyStudy.count({ where: { topicId: topic.id } }),
          prisma.topicKnowledge.count({ where: { topicId: topic.id } }),
          prisma.weeklyPlanItem.count({ where: { topicId: topic.id } }),
          prisma.examWrongQuestion.count({ where: { topicId: topic.id } }),
        ]);
        const totalRefs = refs.reduce((a, b) => a + b, 0);

        if (totalRefs === 0) {
          await prisma.topic.delete({ where: { id: topic.id } });
          console.log(`  🗑️ Kimya'dan '${topic.name}' silindi (referans yok)`);
        } else {
          console.log(`  ⚠️ Kimya'da '${topic.name}' ${totalRefs} referansa sahip — taşınması gerekiyor`);
          // Try to find the Biyoloji equivalent and transfer
          const bioSubject = await prisma.subject.findFirst({
            where: { name: "Biyoloji", examType: { slug: kimya.topics[0] ? "tyt" : "ayt" } },
          });
          if (bioSubject) {
            await prisma.topic.update({
              where: { id: topic.id },
              data: { subjectId: bioSubject.id },
            });
            console.log(`  📦 '${topic.name}' Kimya → Biyoloji'ye taşındı`);
          }
        }
      }
    }
  }

  // ==================== DÜZELTME: Duplike konuları birleştir ====================
  console.log("\n--- Duplike konular birleştiriliyor ---");

  // "Solunum" vs "Hücresel Solunum" vs "Solunum Sistemi" duplikasyonu
  // Biyoloji derslerindeki solunum konularını kontrol et
  const bioSubjects = await prisma.subject.findMany({
    where: { name: "Biyoloji" },
    include: { topics: true },
  });

  for (const bio of bioSubjects) {
    const solunumTopics = bio.topics.filter(
      (t) => t.name.includes("Solunum") && !t.name.includes("Sistem")
    );
    if (solunumTopics.length > 1) {
      // Keep the first, merge others into it
      const keeper = solunumTopics[0];
      for (let i = 1; i < solunumTopics.length; i++) {
        const dup = solunumTopics[i];
        // Transfer all references
        await prisma.dailyStudy.updateMany({ where: { topicId: dup.id }, data: { topicId: keeper.id } });
        await prisma.topicReview.updateMany({ where: { topicId: dup.id }, data: { topicId: keeper.id } });
        // TopicKnowledge has unique constraint, so delete duplicates first
        const existingTk = await prisma.topicKnowledge.findMany({ where: { topicId: dup.id } });
        for (const tk of existingTk) {
          const already = await prisma.topicKnowledge.findFirst({
            where: { topicId: keeper.id, userId: tk.userId },
          });
          if (already) {
            // Keep the higher level
            if (tk.level > already.level) {
              await prisma.topicKnowledge.update({ where: { id: already.id }, data: { level: tk.level } });
            }
            await prisma.topicKnowledge.delete({ where: { id: tk.id } });
          } else {
            await prisma.topicKnowledge.update({ where: { id: tk.id }, data: { topicId: keeper.id } });
          }
        }
        await prisma.weeklyPlanItem.updateMany({ where: { topicId: dup.id }, data: { topicId: keeper.id } });
        await prisma.examWrongQuestion.updateMany({ where: { topicId: dup.id }, data: { topicId: keeper.id } });
        await prisma.examEmptyQuestion.updateMany({ where: { topicId: dup.id }, data: { topicId: keeper.id } });
        await prisma.topic.delete({ where: { id: dup.id } });
        console.log(`  🔀 '${dup.name}' → '${keeper.name}' birleştirildi ve silindi`);
      }
    }
  }

  console.log("\n🎉 2026 YKS müfredat güncellemesi tamamlandı!");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
