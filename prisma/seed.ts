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
  // PDF'den birebir çıkarılmış konular (28105546_tyt_ayt_konulari.pdf)
  const tytSubjects = [
    { name: "Türkçe", questionCount: 40, topics: [
      "Sözcük Anlamı", "Söz Yorumu", "Deyim ve Atasözü", "Cümle Anlamı", "Cümle Yorumu",
      "Paragrafta Anlatım Teknikleri", "Paragrafta Konu-Ana Düşünce", "Paragrafta Yapı",
      "Paragrafta Yardımcı Düşünce", "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri",
      "Sözcüğün Yapısı", "Sözcük Türleri", "Fiiller", "Sözcük Grupları",
      "Cümlenin Ögeleri", "Cümle Türleri", "Anlatım Bozukluğu",
    ]},
    { name: "Matematik", questionCount: 30, topics: [
      "Sayılar", "Sayı Basamakları", "Bölme ve Bölünebilme", "OBEB-OKEK",
      "Rasyonel Sayılar", "Basit Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar",
      "Köklü Sayılar", "Çarpanlara Ayırma", "Oran Orantı", "Denklem Çözme",
      "Problemler", "Kümeler", "Fonksiyonlar", "Permütasyon", "Kombinasyon",
      "Binom", "Olasılık", "İstatistik", "2. Dereceden Denklemler",
      "Karmaşık Sayılar", "Parabol", "Polinomlar",
    ]},
    { name: "Geometri", questionCount: 10, topics: [
      "Doğruda ve Üçgende Açılar", "Dik ve Özel Üçgenler", "Dik Üçgende Trigonometrik Bağıntılar",
      "İkizkenar ve Eşkenar Üçgen", "Üçgende Alanlar", "Üçgende Açıortay Bağıntıları",
      "Üçgende Kenarortay Bağıntıları", "Üçgende Eşlik ve Benzerlik", "Üçgende Açı-Kenar Bağıntıları",
      "Çokgenler", "Dörtgenler", "Yamuk", "Paralelkenar", "Eşkenar Dörtgen – Deltoid",
      "Dikdörtgen", "Çemberde Açılar", "Çemberde Uzunluk", "Daire", "Prizmalar",
      "Piramitler", "Küre", "Koordinat Düzlemi ve Noktanın Analitiği", "Vektörler-1",
      "Doğrunun Analitiği", "Tekrar Eden, Dönen ve Yansıyan Şekiller", "Uzay Geometri",
      "Dönüşümlerle Geometri", "Trigonometri", "Çemberin Analitiği",
      "Genel Konik Tanımı (Dış Merkezlik)", "Parabol", "Elips", "Hiperbol",
    ]},
    { name: "Fizik", questionCount: 7, topics: [
      "Fiziğin Tanımı ve Özellikleri", "Fiziğin Alt Dalları", "Fiziğin Diğer Disiplinlerle İlişkisi",
      "Fiziksel Niceliklerin Sınıflandırılması", "Fizik ve Bilim Araştırma Merkezleri",
      "Madde ve Özkütle", "Dayanıklılık", "Adezyon ve Kohezyon",
      "Hareket", "Kuvvet", "Newton'un Hareket Yasaları", "Sürtünme Kuvveti",
      "İş, Güç ve Enerji", "Mekanik Enerji", "Enerjinin Korunumu ve Enerji Dönüşümleri", "Verim", "Enerji Kaynakları",
      "Isı ve Sıcaklık", "Hal Değişimi", "Isıl Denge", "Enerji İletim Yolları ve Enerji Tüketim Hızı", "Genleşme",
      "Elektrik Yükü", "Elektrikle Yüklenme Çeşitleri", "Elektroskop",
      "İletken ve Yalıtkanlarda Yük Dağılımı", "Topraklama", "Coulomb Kuvveti", "Elektrik Alanı",
      "Elektrik Akımı, Potansiyel Farkı ve Direnci", "Elektrik Devreleri", "Mıknatıs ve Manyetik Alan", "Akım ve Manyetik Alan",
      "Basınç", "Kaldırma Kuvveti",
      "Temel Dalga Bilgileri", "Yay Dalgası", "Su Dalgası", "Ses Dalgası", "Deprem Dalgaları",
      "Aydınlanma", "Gölge", "Yansıma", "Düzlem Ayna", "Kırılma", "Mercekler", "Prizmalar",
    ]},
    { name: "Kimya", questionCount: 7, topics: [
      "Kimya Bilimi", "Atom ve Yapısı", "Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler",
      "Asitler-Bazlar ve Tuzlar", "Bileşikler", "Kimyasal Tepkimeler", "Kimyanın Temel Yasaları",
      "Maddenin Halleri", "Karışımlar", "Endüstride ve Canlılarda Enerji", "Kimya Her Yerde",
    ]},
    { name: "Biyoloji", questionCount: 6, topics: [
      "Biyoloji Bilimi, İnorganik Bileşikler", "Organik Bileşikler", "Hücre", "Madde Geçişleri",
      "DNA-RNA", "Protein Sentezi", "Enzimler", "Canlıların Sınıflandırılması", "Ekoloji",
      "Hücre Bölünmeleri", "Eşeysiz-Eşeyli Üreme", "İnsanda Üreme ve Gelişme", "Mendel Genetiği",
      "Kan Grupları", "Cinsiyete Bağlı Kalıtım", "Biyoteknoloji Evrim", "Solunum", "Fotosentez",
      "Kemosentez", "Bitki Biyolojisi", "Sistemler", "Duyu Organları",
    ]},
    { name: "Coğrafya", questionCount: 5, topics: [
      "Harita Bilgisi", "Dünyanın Şekli ve Hareketleri", "İklim Bilgisi",
      "Türkiye'nin İklimi ve Yer Şekilleri", "Yer'in Şekillenmesi", "İç ve Dış Kuvvetler",
      "Toprak Tipleri", "Nüfus", "Ortak Payda: Bölge", "Ulaşım Yolları",
      "Çevre ve İnsan", "Doğal Afetler",
    ]},
    { name: "Tarih", questionCount: 5, topics: [
      "Tarih Bilimine Giriş", "Uygarlığın Doğuşu ve İlk Uygarlıklar", "Eski Türk Tarihi",
      "İslam Tarihi", "Türk-İslam Devletleri (10-13. yüzyıllar)", "Türkiye Tarihi (11-13. yüzyıllar)",
      "Beylikten Devlete (1300-1453)", "Dünya Gücü Osmanlı Devleti (1453-1600)",
      "Yeniçağ Avrupası (1453-1789)", "Osmanlı Kültür ve Medeniyeti", "Arayış Yılları (17. yüzyıl)",
      "18. Yüzyılda Değişim ve Diplomasi", "Yakınçağ Avrupası (1789...)",
      "En Uzun Yüzyıl (1800-1922)", "20. Yüzyıl Başlarında Osmanlı Devleti", "1. Dünya Savaşı",
      "Milli Mücadeleye Hazırlık Dönemi", "Kurtuluş Savaşında Cepheler", "Türk İnkılabı",
      "Atatürkçülük ve Atatürk İlkeleri", "Türk Dış Politikası",
    ]},
    { name: "Felsefe", questionCount: 5, topics: [
      "Felsefe'nin Konusu-Alanı", "Bilgi Felsefesi", "Varlık Felsefesi", "Ahlak Felsefesi",
      "Sanat Felsefesi", "Din Felsefesi", "Siyaset Felsefesi", "Bilim Felsefesi",
    ]},
    { name: "Din Kültürü ve Ahlak Bilgisi", questionCount: 5, topics: [
      "Kuran ve Yorumu", "Zekât", "Hz. Muhammed'in Hayatı", "İslam Düşüncesinde Yorumlar",
      "İslam Dinine Göre Kötü Alışkanlıklar", "Hazreti Muhammed", "İslam Düşüncesinde Tasavvuf",
      "Vahiy ve Akıl Kur'an Yorumları", "Yaşayan Dinler ve Benzer Özellikler", "İnanç",
      "İbadet", "Hz. Muhammed (S.A.V)", "Vahiy ve Akıl", "Ahlak ve Değerler",
      "Din ve Laiklik", "Din, Kültür ve Medeniyet",
    ]},
  ];

  for (let i = 0; i < tytSubjects.length; i++) {
    await ensureSubjectTopics(tyt.id, tytSubjects[i], i);
  }

  console.log("✅ TYT dersleri ve konuları oluşturuldu");

  // ==================== AYT DERSLER & KONULAR ====================
  const aytSubjects = [
    { name: "Matematik", questionCount: 40, topics: [
      "Temel Kavramlar", "Sayı Basamakları", "Rasyonel Sayılar", "Ondalıklı Sayılar",
      "Basit Eşitsizlikler", "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar",
      "Çarpanlara Ayırma", "Denklem Çözme", "Oran-Orantı", "Problemler", "Fonksiyonlar",
      "Kümeler", "Permütasyon", "Kombinasyon", "Binom", "Olasılık", "İstatistik",
      "2. Dereceden Denklemler", "Karmaşık Sayılar", "Parabol", "Polinomlar", "Mantık",
      "Modüler Aritmetik", "Eşitsizlikler", "Logaritma", "Diziler", "Seriler",
      "Limit ve Süreklilik", "Türev", "İntegral",
    ]},
    { name: "Fizik", questionCount: 14, topics: [
      "Kuvvet ve Hareket", "Vektörler", "Bağıl Hareket", "Newton'un Hareket Yasaları",
      "Bir Boyutta Sabit İvmeli Hareket", "İki Boyutta Sabit İvmeli Hareket",
      "Enerji ve Hareket", "İtme ve Çizgisel Momentum", "Tork", "Denge", "Basit Makineler",
      "Elektriksel Kuvvet ve Elektrik Alanı", "Elektriksel Potansiyel",
      "Düzgün Elektrik Alanı ve Sığa", "Manyetizma ve Elektromanyetik İndükleme",
      "Alternatif Akım", "Transformatörler",
      "Düzgün Çembersel Hareket", "Dönerek Öteleme Hareketi", "Açısal Momentum",
      "Kütle Çekimi ve Kepler Kanunu", "Basit Harmonik Hareket",
      "Dalgalarda Kırınım, Girişim ve Doppler Olayı", "Elektromanyetik Dalgalar",
      "Atom Kavramının Tarihsel Gelişimi", "Büyük Patlama ve Evrenin Oluşumu", "Radyoaktivite",
      "Özel Görelelik", "Kuantum Fiziğine Giriş", "Fotoelektrik Olayı",
      "Compton Saçılması ve De Broglie Dalga Boyu", "Modern Fiziğin Teknolojideki Uygulamaları",
      "Görüntüleme Teknolojileri", "Yarı İletken Teknolojisi", "Süper İletkenler",
      "Nanoteknoloji", "Lazer Işınları",
    ]},
    { name: "Kimya", questionCount: 13, topics: [
      "Modern Atom Teorisi", "Kimyasal Hesaplamalar", "Gazlar", "Sıvı Çözeltiler",
      "Kimya ve Enerji", "Tepkimelerde Hız", "Kimyasal Denge", "Sıvı Çözeltilerde Denge",
      "Kimya ve Elektrik", "Karbon Kimyasına Giriş", "Organik Bileşikler", "Hayatımızdaki Kimya",
    ]},
    { name: "Edebiyat", questionCount: 24, topics: [
      "Sözcükte Anlam", "Cümlede Anlam",
      "Paragrafta Anlatım, Anlatım Biçimleri, Düşünceyi Geliştirme Yolları",
      "Paragrafta Yapı", "Paragrafta Anlam", "Ses Bilgisi", "Yazım Kuralları",
      "Noktalama İşaretleri", "Sözcükte Yapı", "Ad Soylu Sözcükler", "Fiil",
      "Cümlenin Ögeleri", "Cümle Türleri", "Anlatım Bozuklukları",
      "Güzel Sanatlar ve Edebiyat", "Metinlerin Sınıflandırılması",
      "Coşku ve Heyecanı Dile Getiren Metinler", "Şiir Bilgisi", "Öğretici Metinler",
      "Sözlü Anlatım Türleri", "Edebi Sanatlar (Söz Sanatları)", "Nazım Biçimleri ve Türleri",
      "İslamiyet Kabulü Öncesi Türk Edebiyatı", "İslami Dönem İlk Dil ve Edebiyat Ürünleri",
      "Oğuz Türkçesinin İlk Ürünleri", "Halk Edebiyatı", "Divan Edebiyatı",
      "Tanzimat Edebiyatı", "Servet-i Fünun Edebiyatı", "Fecri-Âti Edebiyatı",
      "Milli Edebiyat", "Cumhuriyet Döneminde Türk Edebiyatı",
      "Türkiye Dışındaki Türk Edebiyatı", "Edebi Akımlar", "Dünya Edebiyatı",
      "Türk Edebiyatı Eser Özetleri", "Türk ve Dünya Edebiyatındaki İlkler",
    ]},
    { name: "Coğrafya", questionCount: 6, topics: [
      "Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Coğrafi Konum", "Harita Bilgisi",
      "İklim Bilgisi", "Yerin Şekillenmesi", "Doğanın Varlıkları",
      "Beşeri Yapı", "Nüfusun Gelişimi, Dağılışı ve Niteliği",
      "Göçlerin Nedenleri ve Sonuçları", "Geçim Tarzları",
      "Türkiye'nin Yeryüzü Şekilleri ve Özellikleri", "Türkiye İklimi ve Özellikleri",
      "Türkiye'nin Doğal Varlıkları", "Türkiye'de Yerleşme, Nüfus ve Göç",
      "Bölge Türleri ve Sınırları", "Konum ve Etkileşim", "Coğrafi Keşifler",
      "Doğa ile İnsan Arasındaki Etkileşim", "Doğal Afetler", "Ekonomik Faaliyetler",
    ]},
    { name: "Tarih", questionCount: 10, topics: [
      "Tarih Bilimi", "Uygarlığın Doğuşu ve İlk Uygarlıklar", "İlk Türk Devletleri",
      "İslam Tarihi ve Uygarlığı", "Türk-İslam Devletleri", "Türkiye Tarihi",
      "Beylikten Devlete (1300-1453)", "Dünya Gücü: Osmanlı Devleti (1453-1600)",
      "Arayış Yılları (17. Yüzyıl)", "Avrupa ve Osmanlı Devleti (18. Yüzyıl)",
      "En Uzun Yüzyıl (1800-1922)", "1881'den 1919'a Mustafa Kemal", "1. Dünya Savaşı",
      "Milli Mücadele'nin Hazırlık Dönemi", "Kurtuluş Savaşı'nda Cepheler", "Türk İnkılabı",
      "Atatürkçülük ve Atatürk İlkeleri", "Atatürk Dönemi Türk Dış Politikası",
      "Atatürk'ün Ölümü", "Yüzyılın Başlarında Dünya", "İkinci Dünya Savaşı",
      "Soğuk Savaş Dönemi", "Yumuşama Dönemi ve Sonrası", "Küreselleşen Dünya",
      "Türklerde Devlet Teşkilatı", "Türklerde Toplum Yapısı", "Türklerde Hukuk",
      "Türklerde Ekonomi", "Türklerde Eğitim", "Türklerde Sanat",
    ]},
    { name: "Felsefe", questionCount: 8, topics: [
      "Felsefenin Alanı", "Bilgi Felsefesi", "Bilim Felsefesi", "Varlık Felsefesi",
      "Ahlak Felsefesi", "Siyaset Felsefesi", "Sanat Felsefesi", "Din Felsefesi",
    ]},
    { name: "Mantık", questionCount: 4, topics: [
      "Mantığa Giriş", "Klasik Mantık", "Mantık ve Dil", "Sembolik Mantık",
    ]},
    { name: "Psikoloji", questionCount: 4, topics: [
      "Psikolojinin Temel Süreçleri", "Öğrenme Bellek Düşünme", "Ruh Sağlığının Temelleri",
    ]},
    { name: "Sosyoloji", questionCount: 4, topics: [
      "Birey ve Toplum", "Toplumsal Yapı", "Toplumsal Değişme ve Gelişme",
      "Toplum ve Kültür", "Toplumsal Kurumlar",
    ]},
    { name: "Din Kültürü ve Ahlak Bilgisi", questionCount: 4, topics: [
      "Kur'an-ı Kerim'in Anlaşılması ve Kavranması", "İnsan ve Din", "İslam ve İbadetler",
      "İslam Düşüncesinde Yorumlar, Mezhepler",
      "Muhammed'in Hayatı, Örnekliği ve Onu Anlama",
      "İslam ve Bilim, Estetik, Barış", "Yaşayan Dinler ve Benzer Özellikleri",
    ]},
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
