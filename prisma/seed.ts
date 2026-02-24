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
    update: {},
    create: {
      username: "seyda",
      displayName: "Şeyda A.",
      role: "user",
      passwordHash: await bcrypt.hash("seyda123", 10),
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
        "Veri Analizi",
      ],
    },
    {
      name: "Fen Bilimleri",
      questionCount: 20,
      topics: [
        "Fizik - Kuvvet ve Hareket", "Fizik - Enerji",
        "Fizik - Isı ve Sıcaklık", "Fizik - Optik",
        "Fizik - Elektrik", "Fizik - Dalga",
        "Kimya - Atom ve Periyodik Tablo", "Kimya - Kimyasal Bağlar",
        "Kimya - Madde ve Özellikleri", "Kimya - Karışımlar",
        "Kimya - Kimyasal Tepkimeler", "Kimya - Asit-Baz",
        "Biyoloji - Hücre", "Biyoloji - Canlıların Sınıflandırılması",
        "Biyoloji - Kalıtım", "Biyoloji - Ekosistem",
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
        "Coğrafya - Doğa ve İnsan", "Coğrafya - Dünya Coğrafyası",
        "Coğrafya - Türkiye Coğrafyası", "Coğrafya - Beşeri Coğrafya",
        "Felsefe - Felsefeye Giriş", "Felsefe - Bilgi Felsefesi",
        "Din Kültürü",
      ],
    },
  ];

  for (let i = 0; i < tytSubjects.length; i++) {
    const subj = tytSubjects[i];
    const subject = await prisma.subject.create({
      data: {
        name: subj.name,
        questionCount: subj.questionCount,
        examTypeId: tyt.id,
        sortOrder: i,
      },
    });

    for (let j = 0; j < subj.topics.length; j++) {
      await prisma.topic.create({
        data: {
          name: subj.topics[j],
          subjectId: subject.id,
          sortOrder: j,
        },
      });
    }
  }

  console.log("✅ TYT dersleri ve konuları oluşturuldu");

  // ==================== AYT DERSLER & KONULAR ====================
  const aytSubjects = [
    {
      name: "Matematik",
      questionCount: 40,
      topics: [
        "Fonksiyonlar", "Polinomlar", "İkinci Dereceden Denklemler",
        "Parabol", "Trigonometri", "Logaritma",
        "Diziler ve Seriler", "Limit", "Türev", "İntegral",
        "Olasılık", "Kombinatorik",
      ],
    },
    {
      name: "Fizik",
      questionCount: 14,
      topics: [
        "Vektörler", "Kuvvet-Denge", "Tork",
        "Elektrik Alan ve Potansiyel", "Manyetizma",
        "İndüksiyon", "Dalgalar", "Atom Fiziği",
        "Modern Fizik",
      ],
    },
    {
      name: "Kimya",
      questionCount: 13,
      topics: [
        "Mol Kavramı", "Kimyasal Hesaplamalar",
        "Gazlar", "Çözeltiler", "Kimyasal Denge",
        "Asitler ve Bazlar", "Elektrokimya",
        "Organik Kimya",
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
        "Roman/Hikaye Analizi",
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
      ],
    },
    {
      name: "Coğrafya",
      questionCount: 6,
      topics: [
        "Türkiye'nin Yer Şekilleri", "İklim ve Bitki Örtüsü",
        "Nüfus ve Yerleşme", "Ekonomik Coğrafya",
        "Bölgesel Coğrafya",
      ],
    },
  ];

  for (let i = 0; i < aytSubjects.length; i++) {
    const subj = aytSubjects[i];
    const subject = await prisma.subject.create({
      data: {
        name: subj.name,
        questionCount: subj.questionCount,
        examTypeId: ayt.id,
        sortOrder: i,
      },
    });

    for (let j = 0; j < subj.topics.length; j++) {
      await prisma.topic.create({
        data: {
          name: subj.topics[j],
          subjectId: subject.id,
          sortOrder: j,
        },
      });
    }
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
