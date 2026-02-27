import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ==================== KULLANICILAR ====================
  const furkan = await prisma.user.upsert({
    where: { username: "furkan" },
    update: {},
    create: {
      username: "furkan",
      displayName: "Furkan K.",
      role: "admin",
      passwordHash: await bcrypt.hash("furkan123", 10),
    },
  });

  const seyda = await prisma.user.upsert({
    where: { username: "seyda" },
    update: { aiEnabled: true },
    create: {
      username: "seyda",
      displayName: "Şeyda A.",
      role: "user",
      passwordHash: await bcrypt.hash("seyda123", 10),
      aiEnabled: true,
    },
  });

  console.log("✅ Kullanıcılar oluşturuldu");

  // ==================== SINAV TÜRLERİ ====================
  const tyt = await prisma.examType.upsert({
    where: { slug: "tyt" },
    update: {},
    create: { name: "TYT", slug: "tyt" },
  });

  const ayt = await prisma.examType.upsert({
    where: { slug: "ayt" },
    update: {},
    create: { name: "AYT", slug: "ayt" },
  });

  console.log("✅ Sınav türleri oluşturuldu");

  // ==================== DERS & KONU EKLEME HELPER ====================
  // Mevcut dersleri korur, sadece eksik konuları ekler (idempotent)
  async function ensureSubjectTopics(
    examTypeId: string,
    subjectDef: { name: string; questionCount: number; topics: string[] },
    sortOrder: number
  ) {
    let subject = await prisma.subject.findFirst({
      where: { name: subjectDef.name, examTypeId },
    });
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: subjectDef.name,
          questionCount: subjectDef.questionCount,
          examTypeId,
          sortOrder,
        },
      });
    }

    const existingTopics = await prisma.topic.findMany({
      where: { subjectId: subject.id },
      select: { name: true },
    });
    const existingNames = new Set(existingTopics.map((t) => t.name));
    let nextOrder = existingTopics.length;

    for (const topicName of subjectDef.topics) {
      if (!existingNames.has(topicName)) {
        await prisma.topic.create({
          data: {
            name: topicName,
            subjectId: subject.id,
            sortOrder: nextOrder++,
          },
        });
      }
    }
    return subject;
  }

  // ==================== TYT DERSLER & KONULAR ====================
  const tytSubjects = [
    {
      name: "Türkçe",
      questionCount: 40,
      topics: [
        "Sözcükte Anlam", "Cümlede Anlam", "Paragraf",
        "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri",
        "Sözcük Türleri", "Cümle Türleri", "Cümlenin Ögeleri",
        "Anlatım Bozuklukları", "Dil Bilgisi (Genel)",
        "Fiiller (Eylemler)", "Ekler (Yapım-Çekim)", "Söz Sanatları",
        "Metin Türleri", "Anlatım Türleri ve Biçimleri",
      ],
    },
    {
      name: "Matematik",
      questionCount: 40,
      topics: [
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
    },
    {
      name: "Fen Bilimleri",
      questionCount: 20,
      topics: [
        "Fizik - Kuvvet ve Hareket", "Fizik - Enerji",
        "Fizik - Isı ve Sıcaklık", "Fizik - Optik",
        "Fizik - Elektrik", "Fizik - Dalga",
        "Fizik - Basınç", "Fizik - Madde ve Özellikleri",
        "Kimya - Atom ve Periyodik Tablo", "Kimya - Kimyasal Bağlar",
        "Kimya - Madde ve Özellikleri", "Kimya - Karışımlar",
        "Kimya - Kimyasal Tepkimeler", "Kimya - Asit-Baz",
        "Kimya - Mol Kavramı (Temel)",
        "Biyoloji - Hücre", "Biyoloji - Canlıların Sınıflandırılması",
        "Biyoloji - Kalıtım", "Biyoloji - Ekosistem",
        "Biyoloji - Sinir Sistemi", "Biyoloji - Dolaşım Sistemi",
        "Biyoloji - Solunum Sistemi",
      ],
    },
    {
      name: "Sosyal Bilimler",
      questionCount: 20,
      topics: [
        "Tarih - İlk Uygarlıklar", "Tarih - İslam Tarihi",
        "Tarih - Türk-İslam Devletleri", "Tarih - Osmanlı Kuruluş",
        "Tarih - Osmanlı Yükselme", "Tarih - Osmanlı Duraklama",
        "Tarih - Kurtuluş Savaşı", "Tarih - İnkılap Tarihi",
        "Tarih - Atatürk İlkeleri",
        "Coğrafya - Doğa ve İnsan", "Coğrafya - Dünya Coğrafyası",
        "Coğrafya - Türkiye Coğrafyası", "Coğrafya - Beşeri Coğrafya",
        "Coğrafya - Harita Bilgisi",
        "Felsefe - Felsefeye Giriş", "Felsefe - Bilgi Felsefesi",
        "Felsefe - Ahlak Felsefesi", "Felsefe - Bilim Felsefesi",
        "Din Kültürü - İbadetler", "Din Kültürü - Hz. Muhammed",
        "Din Kültürü - Ahlak ve Değerler",
      ],
    },
  ];

  for (let i = 0; i < tytSubjects.length; i++) {
    await ensureSubjectTopics(tyt.id, tytSubjects[i], i);
  }

  console.log("✅ TYT dersleri ve konuları oluşturuldu");

  // ==================== AYT DERSLER & KONULAR ====================
  const aytSubjects = [
    {
      name: "Matematik",
      questionCount: 40,
      topics: [
        "Fonksiyonlar", "Bileşke ve Ters Fonksiyon",
        "Polinomlar", "Polinomların Çarpanlara Ayrılması",
        "İkinci Dereceden Denklemler", "Parabol",
        "Trigonometri", "Trigonometrik Fonksiyonlar", "Trigonometrik Denklemler",
        "Logaritma", "Üstel ve Logaritmik Fonksiyonlar",
        "Diziler ve Seriler", "Aritmetik Dizi", "Geometrik Dizi",
        "Limit", "Süreklilik",
        "Türev", "Türev Uygulamaları",
        "İntegral", "Belirli İntegral", "İntegral Uygulamaları",
        "Olasılık", "Koşullu Olasılık",
        "Karmaşık Sayılar", "Matrisler", "Determinant",
        "Doğrusal Denklem Sistemleri",
        "Analitik Geometri", "Doğru Denklemleri", "Çember",
        "Elips", "Hiperbol",
        "Dönüşüm Geometrisi", "Uzay Geometri",
      ],
    },
    {
      name: "Fizik",
      questionCount: 14,
      topics: [
        "Vektörler", "Kuvvet-Denge", "Tork",
        "Elektrik Alan ve Potansiyel", "Manyetizma",
        "İndüksiyon", "Dalgalar", "Atom Fiziği",
        "Modern Fizik", "Çembersel Hareket",
        "Basit Harmonik Hareket", "Dalga Mekaniği",
        "Elektrik Devreleri", "Optik (Aynalar ve Mercekler)",
        "Akışkanlar Mekaniği",
      ],
    },
    {
      name: "Kimya",
      questionCount: 13,
      topics: [
        "Mol Kavramı", "Kimyasal Hesaplamalar",
        "Gazlar", "Çözeltiler", "Kimyasal Denge",
        "Asitler ve Bazlar", "Elektrokimya",
        "Organik Kimya", "Termokimya",
        "Kimyasal Kinetik", "Çözünürlük Dengesi",
        "Fonksiyonel Gruplar", "Polimerler",
        "Endüstriyel Kimya",
      ],
    },
    {
      name: "Biyoloji",
      questionCount: 13,
      topics: [
        "Hücre Bölünmesi", "Kalıtım",
        "Genetik Mühendisliği", "Ekoloji",
        "Bitki Biyolojisi", "Solunum",
        "Fotosentez", "İnsan Fizyolojisi",
        "Protein Sentezi", "DNA Replikasyonu",
        "Endokrin Sistem", "Sindirim Sistemi",
        "Boşaltım Sistemi", "Duyu Organları",
        "Komünite ve Popülasyon Ekolojisi",
      ],
    },
    {
      name: "Edebiyat",
      questionCount: 24,
      topics: [
        "Şiir Bilgisi", "Edebi Akımlar",
        "Tanzimat Edebiyatı", "Servet-i Fünun",
        "Milli Edebiyat", "Cumhuriyet Dönemi",
        "Halk Edebiyatı", "Divan Edebiyatı",
        "Roman/Hikaye Analizi", "Fecr-i Ati",
        "Yedi Meşaleciler", "Garip Akımı",
        "İkinci Yeni", "Sözlü Edebiyat Dönemi",
        "Edebi Sanatlar (Söz Sanatları)",
      ],
    },
    {
      name: "Tarih",
      questionCount: 10,
      topics: [
        "Osmanlı Devleti (Gerileme-Yıkılış)",
        "I. Dünya Savaşı", "Kurtuluş Savaşı",
        "Atatürk İlkeleri", "Çağdaş Türk-Dünya Tarihi",
        "II. Dünya Savaşı", "Soğuk Savaş Dönemi",
        "Türk Devrim Tarihi", "Demokratikleşme Süreci",
        "Türkiye'nin Dış Politikası", "Çağdaş Dünya Tarihi",
        "Osmanlı Kültür ve Medeniyeti",
      ],
    },
    {
      name: "Coğrafya",
      questionCount: 6,
      topics: [
        "Türkiye'nin Yer Şekilleri", "İklim ve Bitki Örtüsü",
        "Nüfus ve Yerleşme", "Ekonomik Coğrafya",
        "Bölgesel Coğrafya", "Harita Bilgisi",
        "Toprak ve Su Kaynakları", "Çevre Sorunları",
        "Doğal Afetler", "Ulaşım",
      ],
    },
  ];

  for (let i = 0; i < aytSubjects.length; i++) {
    await ensureSubjectTopics(ayt.id, aytSubjects[i], i);
  }

  console.log("✅ AYT dersleri ve konuları oluşturuldu");

  // ==================== HATA NEDENLERİ ====================
  const errorReasons = [
    "Bilgi eksikliği",
    "Dikkatsizlik / Acelecilik",
    "Soruyu yanlış anlama",
    "Süre yetmedi",
    "Konuyu hiç bilmiyorum",
    "Formül karıştırma",
  ];

  for (const label of errorReasons) {
    await prisma.errorReason.create({
      data: { label, isDefault: true },
    });
  }

  console.log("✅ Hata nedenleri oluşturuldu");

  // ==================== KLASÖRLER ====================
  const folders = [
    { name: "Matematik", color: "bg-blue-100" },
    { name: "Edebiyat", color: "bg-amber-100" },
    { name: "Tarih", color: "bg-emerald-100" },
    { name: "Genel Tekrar", color: "bg-rose-100" },
  ];

  const createdFolders: Record<string, string> = {};
  for (let i = 0; i < folders.length; i++) {
    const folder = await prisma.folder.create({
      data: {
        name: folders[i].name,
        color: folders[i].color,
        userId: seyda.id,
        sortOrder: i,
      },
    });
    createdFolders[folders[i].name] = folder.id;
  }

  console.log("✅ Klasörler oluşturuldu");

  // ==================== ÖRNEK GÖREVLER ====================
  await prisma.task.createMany({
    data: [
      {
        title: "Türev testini çöz",
        folderId: createdFolders["Matematik"],
        assignedById: furkan.id,
      },
      {
        title: "Cumhuriyet dönemi roman özeti",
        completed: true,
        folderId: createdFolders["Edebiyat"],
        assignedById: seyda.id,
      },
      {
        title: "Deneme analizi yap",
        folderId: createdFolders["Genel Tekrar"],
        assignedById: furkan.id,
      },
    ],
  });

  console.log("✅ Örnek görevler oluşturuldu");

  // ==================== METRİK TANIMLARI ====================
  const metrics = [
    { name: "Kilo", unit: "kg", icon: "scale", color: "#3b82f6", type: "number" },
    { name: "Ruh Hali", unit: null, icon: "smile", color: "#f59e0b", type: "rating" },
    { name: "Uyku Süresi", unit: "saat", icon: "moon", color: "#8b5cf6", type: "duration" },
    { name: "Su Tüketimi", unit: "bardak", icon: "droplets", color: "#06b6d4", type: "number" },
    { name: "Egzersiz", unit: null, icon: "dumbbell", color: "#10b981", type: "boolean" },
  ];

  for (let i = 0; i < metrics.length; i++) {
    await prisma.metricDefinition.create({
      data: {
        ...metrics[i],
        userId: seyda.id,
        sortOrder: i,
      },
    });
  }

  console.log("✅ Metrik tanımları oluşturuldu");

  // ==================== HOŞGELDİN BİLDİRİMİ ====================
  await prisma.notification.create({
    data: {
      type: "encouragement",
      title: "Hoş geldin! 🎉",
      message: "Yaşam Takibi uygulamasına hoş geldin Şeyda! Hedeflerine ulaşmak için harika bir araç olacak.",
      recipientId: seyda.id,
      senderId: furkan.id,
    },
  });

  console.log("✅ Hoşgeldin bildirimi oluşturuldu");
  console.log("\n🎉 Seed tamamlandı!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
