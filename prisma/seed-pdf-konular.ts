/**
 * PDF'den birebir çıkarılmış TYT ve AYT konuları.
 * Kaynak: 28105546_tyt_ayt_konulari.pdf (Sümeyye HALİLOĞLU/Kâğıthane Anadolu Lisesi)
 *
 * Bu script mevcut tüm konu/ders verilerini sıfırlar ve PDF'deki konuları ekler.
 * Çalıştırmak için: npx tsx prisma/seed-pdf-konular.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =====================================================================
// PDF'DEN BİREBİR ÇIKARILMIŞ KONU LİSTELERİ
// =====================================================================

interface SubjectDef {
  name: string;
  questionCount: number;
  topics: string[];
}

// ==================== TYT ====================

const TYT_SUBJECTS: SubjectDef[] = [
  {
    name: "Türkçe",
    questionCount: 40,
    topics: [
      "Sözcük Anlamı",
      "Söz Yorumu",
      "Deyim ve Atasözü",
      "Cümle Anlamı",
      "Cümle Yorumu",
      "Paragrafta Anlatım Teknikleri",
      "Paragrafta Konu-Ana Düşünce",
      "Paragrafta Yapı",
      "Paragrafta Yardımcı Düşünce",
      "Ses Bilgisi",
      "Yazım Kuralları",
      "Noktalama İşaretleri",
      "Sözcüğün Yapısı",
      "Sözcük Türleri",
      "Fiiller",
      "Sözcük Grupları",
      "Cümlenin Ögeleri",
      "Cümle Türleri",
      "Anlatım Bozukluğu",
    ],
  },
  {
    name: "Matematik",
    questionCount: 30,
    topics: [
      "Sayılar",
      "Sayı Basamakları",
      "Bölme ve Bölünebilme",
      "OBEB-OKEK",
      "Rasyonel Sayılar",
      "Basit Eşitsizlikler",
      "Mutlak Değer",
      "Üslü Sayılar",
      "Köklü Sayılar",
      "Çarpanlara Ayırma",
      "Oran Orantı",
      "Denklem Çözme",
      "Problemler",
      "Kümeler",
      "Fonksiyonlar",
      "Permütasyon",
      "Kombinasyon",
      "Binom",
      "Olasılık",
      "İstatistik",
      "2. Dereceden Denklemler",
      "Karmaşık Sayılar",
      "Parabol",
      "Polinomlar",
    ],
  },
  {
    name: "Geometri",
    questionCount: 10,
    topics: [
      // GEOMETRİ TYT ve AYT ORTAK KONULAR (PDF sayfa 4)
      "Doğruda ve Üçgende Açılar",
      "Dik ve Özel Üçgenler",
      "Dik Üçgende Trigonometrik Bağıntılar",
      "İkizkenar ve Eşkenar Üçgen",
      "Üçgende Alanlar",
      "Üçgende Açıortay Bağıntıları",
      "Üçgende Kenarortay Bağıntıları",
      "Üçgende Eşlik ve Benzerlik",
      "Üçgende Açı-Kenar Bağıntıları",
      "Çokgenler",
      "Dörtgenler",
      "Yamuk",
      "Paralelkenar",
      "Eşkenar Dörtgen – Deltoid",
      "Dikdörtgen",
      "Çemberde Açılar",
      "Çemberde Uzunluk",
      "Daire",
      "Prizmalar",
      "Piramitler",
      "Küre",
      "Koordinat Düzlemi ve Noktanın Analitiği",
      "Vektörler-1",
      "Doğrunun Analitiği",
      "Tekrar Eden, Dönen ve Yansıyan Şekiller",
      "Uzay Geometri",
      "Dönüşümlerle Geometri",
      "Trigonometri",
      "Çemberin Analitiği",
      "Genel Konik Tanımı (Dış Merkezlik)",
      "Parabol",
      "Elips",
      "Hiperbol",
    ],
  },
  {
    name: "Fizik",
    questionCount: 7,
    topics: [
      // FİZİK BİLİMİNE GİRİŞ
      "Fiziğin Tanımı ve Özellikleri",
      "Fiziğin Alt Dalları",
      "Fiziğin Diğer Disiplinlerle İlişkisi",
      "Fiziksel Niceliklerin Sınıflandırılması",
      "Fizik ve Bilim Araştırma Merkezleri",
      // MADDE VE ÖZELLİKLERİ
      "Madde ve Özkütle",
      "Dayanıklılık",
      "Adezyon ve Kohezyon",
      // HAREKET VE KUVVET
      "Hareket",
      "Kuvvet",
      "Newton'un Hareket Yasaları",
      "Sürtünme Kuvveti",
      // ENERJİ
      "İş, Güç ve Enerji",
      "Mekanik Enerji",
      "Enerjinin Korunumu ve Enerji Dönüşümleri",
      "Verim",
      "Enerji Kaynakları",
      // ISI VE SICAKLIK
      "Isı ve Sıcaklık",
      "Hal Değişimi",
      "Isıl Denge",
      "Enerji İletim Yolları ve Enerji Tüketim Hızı",
      "Genleşme",
      // ELEKTROSTATİK
      "Elektrik Yükü",
      "Elektrikle Yüklenme Çeşitleri",
      "Elektroskop",
      "İletken ve Yalıtkanlarda Yük Dağılımı",
      "Topraklama",
      "Coulomb Kuvveti",
      "Elektrik Alanı",
      // ELEKTRİK VE MANYETİZMA
      "Elektrik Akımı, Potansiyel Farkı ve Direnci",
      "Elektrik Devreleri",
      "Mıknatıs ve Manyetik Alan",
      "Akım ve Manyetik Alan",
      // BASINÇ VE KALDIRMA KUVVETİ
      "Basınç",
      "Kaldırma Kuvveti",
      // DALGALAR
      "Temel Dalga Bilgileri",
      "Yay Dalgası",
      "Su Dalgası",
      "Ses Dalgası",
      "Deprem Dalgaları",
      // AYDINLANMA
      "Aydınlanma",
      "Gölge",
      "Yansıma",
      "Düzlem Ayna",
      "Kırılma",
      "Mercekler",
      "Prizmalar",
    ],
  },
  {
    name: "Kimya",
    questionCount: 7,
    topics: [
      "Kimya Bilimi",
      "Atom ve Yapısı",
      "Periyodik Sistem",
      "Kimyasal Türler Arası Etkileşimler",
      "Asitler-Bazlar ve Tuzlar",
      "Bileşikler",
      "Kimyasal Tepkimeler",
      "Kimyanın Temel Yasaları",
      "Maddenin Halleri",
      "Karışımlar",
      "Endüstride ve Canlılarda Enerji",
      "Kimya Her Yerde",
    ],
  },
  {
    name: "Biyoloji",
    questionCount: 6,
    topics: [
      // BİYOLOJİ TYT ve AYT ORTAK KONULARI (PDF sayfa 4)
      "Biyoloji Bilimi, İnorganik Bileşikler",
      "Organik Bileşikler",
      "Hücre",
      "Madde Geçişleri",
      "DNA-RNA",
      "Protein Sentezi",
      "Enzimler",
      "Canlıların Sınıflandırılması",
      "Ekoloji",
      "Hücre Bölünmeleri",
      "Eşeysiz-Eşeyli Üreme",
      "İnsanda Üreme ve Gelişme",
      "Mendel Genetiği",
      "Kan Grupları",
      "Cinsiyete Bağlı Kalıtım",
      "Biyoteknoloji Evrim",
      "Solunum",
      "Fotosentez",
      "Kemosentez",
      "Bitki Biyolojisi",
      "Sistemler",
      "Duyu Organları",
    ],
  },
  {
    name: "Coğrafya",
    questionCount: 5,
    topics: [
      "Harita Bilgisi",
      "Dünyanın Şekli ve Hareketleri",
      "İklim Bilgisi",
      "Türkiye'nin İklimi ve Yer Şekilleri",
      "Yer'in Şekillenmesi",
      "İç ve Dış Kuvvetler",
      "Toprak Tipleri",
      "Nüfus",
      "Ortak Payda: Bölge",
      "Ulaşım Yolları",
      "Çevre ve İnsan",
      "Doğal Afetler",
    ],
  },
  {
    name: "Tarih",
    questionCount: 5,
    topics: [
      "Tarih Bilimine Giriş",
      "Uygarlığın Doğuşu ve İlk Uygarlıklar",
      "Eski Türk Tarihi",
      "İslam Tarihi",
      "Türk-İslam Devletleri (10-13. yüzyıllar)",
      "Türkiye Tarihi (11-13. yüzyıllar)",
      "Beylikten Devlete (1300-1453)",
      "Dünya Gücü Osmanlı Devleti (1453-1600)",
      "Yeniçağ Avrupası (1453-1789)",
      "Osmanlı Kültür ve Medeniyeti",
      "Arayış Yılları (17. yüzyıl)",
      "18. Yüzyılda Değişim ve Diplomasi",
      "Yakınçağ Avrupası (1789...)",
      "En Uzun Yüzyıl (1800-1922)",
      "20. Yüzyıl Başlarında Osmanlı Devleti",
      "1. Dünya Savaşı",
      "Milli Mücadeleye Hazırlık Dönemi",
      "Kurtuluş Savaşında Cepheler",
      "Türk İnkılabı",
      "Atatürkçülük ve Atatürk İlkeleri",
      "Türk Dış Politikası",
    ],
  },
  {
    name: "Felsefe",
    questionCount: 5,
    topics: [
      "Felsefe'nin Konusu-Alanı",
      "Bilgi Felsefesi",
      "Varlık Felsefesi",
      "Ahlak Felsefesi",
      "Sanat Felsefesi",
      "Din Felsefesi",
      "Siyaset Felsefesi",
      "Bilim Felsefesi",
    ],
  },
  {
    name: "Din Kültürü ve Ahlak Bilgisi",
    questionCount: 5,
    topics: [
      "Kuran ve Yorumu",
      "Zekât",
      "Hz. Muhammed'in Hayatı",
      "İslam Düşüncesinde Yorumlar",
      "İslam Dinine Göre Kötü Alışkanlıklar",
      "Hazreti Muhammed",
      "İslam Düşüncesinde Tasavvuf",
      "Vahiy ve Akıl Kur'an Yorumları",
      "Yaşayan Dinler ve Benzer Özellikler",
      "İnanç",
      "İbadet",
      "Hz. Muhammed (S.A.V)",
      "Vahiy ve Akıl",
      "Ahlak ve Değerler",
      "Din ve Laiklik",
      "Din, Kültür ve Medeniyet",
    ],
  },
];

// ==================== AYT ====================

const AYT_SUBJECTS: SubjectDef[] = [
  {
    name: "Matematik",
    questionCount: 40,
    topics: [
      "Temel Kavramlar",
      "Sayı Basamakları",
      "Rasyonel Sayılar",
      "Ondalıklı Sayılar",
      "Basit Eşitsizlikler",
      "Mutlak Değer",
      "Üslü Sayılar",
      "Köklü Sayılar",
      "Çarpanlara Ayırma",
      "Denklem Çözme",
      "Oran-Orantı",
      "Problemler",
      "Fonksiyonlar",
      "Kümeler",
      "Permütasyon",
      "Kombinasyon",
      "Binom",
      "Olasılık",
      "İstatistik",
      "2. Dereceden Denklemler",
      "Karmaşık Sayılar",
      "Parabol",
      "Polinomlar",
      "Mantık",
      "Modüler Aritmetik",
      "Eşitsizlikler",
      "Logaritma",
      "Diziler",
      "Seriler",
      "Limit ve Süreklilik",
      "Türev",
      "İntegral",
    ],
  },
  {
    name: "Fizik",
    questionCount: 14,
    topics: [
      // İlk bölüm (Kuvvet ve Hareket)
      "Kuvvet ve Hareket",
      "Vektörler",
      "Bağıl Hareket",
      "Newton'un Hareket Yasaları",
      "Bir Boyutta Sabit İvmeli Hareket",
      "İki Boyutta Sabit İvmeli Hareket",
      "Enerji ve Hareket",
      "İtme ve Çizgisel Momentum",
      "Tork",
      "Denge",
      "Basit Makineler",
      // ELEKTRİK VE MANYETİZMA
      "Elektriksel Kuvvet ve Elektrik Alanı",
      "Elektriksel Potansiyel",
      "Düzgün Elektrik Alanı ve Sığa",
      "Manyetizma ve Elektromanyetik İndükleme",
      "Alternatif Akım",
      "Transformatörler",
      // DÜZGÜN ÇEMBERSEL HAREKET
      "Düzgün Çembersel Hareket",
      "Dönerek Öteleme Hareketi",
      "Açısal Momentum",
      "Kütle Çekimi ve Kepler Kanunu",
      // BASİT HARMONİK HAREKET
      "Basit Harmonik Hareket",
      // DALGA MEKANİĞİ
      "Dalgalarda Kırınım, Girişim ve Doppler Olayı",
      "Elektromanyetik Dalgalar",
      // ATOM FİZİĞİNE GİRİŞ ve RADYOAKTİVİTE
      "Atom Kavramının Tarihsel Gelişimi",
      "Büyük Patlama ve Evrenin Oluşumu",
      "Radyoaktivite",
      // MODERN FİZİK
      "Özel Görelelik",
      "Kuantum Fiziğine Giriş",
      "Fotoelektrik Olayı",
      "Compton Saçılması ve De Broglie Dalga Boyu",
      "Modern Fiziğin Teknolojideki Uygulamaları",
      "Görüntüleme Teknolojileri",
      "Yarı İletken Teknolojisi",
      "Süper İletkenler",
      "Nanoteknoloji",
      "Lazer Işınları",
    ],
  },
  {
    name: "Kimya",
    questionCount: 13,
    topics: [
      "Modern Atom Teorisi",
      "Kimyasal Hesaplamalar",
      "Gazlar",
      "Sıvı Çözeltiler",
      "Kimya ve Enerji",
      "Tepkimelerde Hız",
      "Kimyasal Denge",
      "Sıvı Çözeltilerde Denge",
      "Kimya ve Elektrik",
      "Karbon Kimyasına Giriş",
      "Organik Bileşikler",
      "Hayatımızdaki Kimya",
    ],
  },
  {
    name: "Edebiyat",
    questionCount: 24,
    topics: [
      // TÜRK DİLİ ve EDEBİYATI AYT KONULARI (PDF sayfa 5)
      "Sözcükte Anlam",
      "Cümlede Anlam",
      "Paragrafta Anlatım, Anlatım Biçimleri, Düşünceyi Geliştirme Yolları",
      "Paragrafta Yapı",
      "Paragrafta Anlam",
      "Ses Bilgisi",
      "Yazım Kuralları",
      "Noktalama İşaretleri",
      "Sözcükte Yapı",
      "Ad Soylu Sözcükler",
      "Fiil",
      "Cümlenin Ögeleri",
      "Cümle Türleri",
      "Anlatım Bozuklukları",
      "Güzel Sanatlar ve Edebiyat",
      "Metinlerin Sınıflandırılması",
      "Coşku ve Heyecanı Dile Getiren Metinler",
      "Şiir Bilgisi",
      "Öğretici Metinler",
      "Sözlü Anlatım Türleri",
      "Edebi Sanatlar (Söz Sanatları)",
      "Nazım Biçimleri ve Türleri",
      "İslamiyet Kabulü Öncesi Türk Edebiyatı",
      "İslami Dönem İlk Dil ve Edebiyat Ürünleri",
      "Oğuz Türkçesinin İlk Ürünleri",
      "Halk Edebiyatı",
      "Divan Edebiyatı",
      "Tanzimat Edebiyatı",
      "Servet-i Fünun Edebiyatı",
      "Fecri-Âti Edebiyatı",
      "Milli Edebiyat",
      "Cumhuriyet Döneminde Türk Edebiyatı",
      "Türkiye Dışındaki Türk Edebiyatı",
      "Edebi Akımlar",
      "Dünya Edebiyatı",
      "Türk Edebiyatı Eser Özetleri",
      "Türk ve Dünya Edebiyatındaki İlkler",
    ],
  },
  {
    name: "Coğrafya",
    questionCount: 6,
    topics: [
      // COĞRAFYA AYT KONULARI (PDF sayfa 6, Coğrafya-1 ve -2 birleşik)
      // DOĞAL SİSTEMLER
      "Doğa ve İnsan",
      "Dünya'nın Şekli ve Hareketleri",
      "Coğrafi Konum",
      "Harita Bilgisi",
      "İklim Bilgisi",
      "Yerin Şekillenmesi",
      "Doğanın Varlıkları",
      // BEŞERİ SİSTEMLER
      "Beşeri Yapı",
      "Nüfusun Gelişimi, Dağılışı ve Niteliği",
      "Göçlerin Nedenleri ve Sonuçları",
      "Geçim Tarzları",
      // MEKÂNSAL BİR SENTEZ: TÜRKİYE
      "Türkiye'nin Yeryüzü Şekilleri ve Özellikleri",
      "Türkiye İklimi ve Özellikleri",
      "Türkiye'nin Doğal Varlıkları",
      "Türkiye'de Yerleşme, Nüfus ve Göç",
      // KÜRESEL ORTAM: BÖLGELER ve ÜLKELER
      "Bölge Türleri ve Sınırları",
      "Konum ve Etkileşim",
      "Coğrafi Keşifler",
      // ÇEVRE ve TOPLUM
      "Doğa ile İnsan Arasındaki Etkileşim",
      "Doğal Afetler",
      "Ekonomik Faaliyetler",
    ],
  },
  {
    name: "Tarih",
    questionCount: 10,
    topics: [
      // TARİH AYT KONULARI (PDF sayfa 7-8, Tarih-1 ve -2 aynı)
      "Tarih Bilimi",
      "Uygarlığın Doğuşu ve İlk Uygarlıklar",
      "İlk Türk Devletleri",
      "İslam Tarihi ve Uygarlığı",
      "Türk-İslam Devletleri",
      "Türkiye Tarihi",
      "Beylikten Devlete (1300-1453)",
      "Dünya Gücü: Osmanlı Devleti (1453-1600)",
      "Arayış Yılları (17. Yüzyıl)",
      "Avrupa ve Osmanlı Devleti (18. Yüzyıl)",
      "En Uzun Yüzyıl (1800-1922)",
      "1881'den 1919'a Mustafa Kemal",
      "1. Dünya Savaşı",
      "Milli Mücadele'nin Hazırlık Dönemi",
      "Kurtuluş Savaşı'nda Cepheler",
      "Türk İnkılabı",
      "Atatürkçülük ve Atatürk İlkeleri",
      "Atatürk Dönemi Türk Dış Politikası",
      "Atatürk'ün Ölümü",
      "Yüzyılın Başlarında Dünya",
      "İkinci Dünya Savaşı",
      "Soğuk Savaş Dönemi",
      "Yumuşama Dönemi ve Sonrası",
      "Küreselleşen Dünya",
      "Türklerde Devlet Teşkilatı",
      "Türklerde Toplum Yapısı",
      "Türklerde Hukuk",
      "Türklerde Ekonomi",
      "Türklerde Eğitim",
      "Türklerde Sanat",
    ],
  },
  {
    name: "Felsefe",
    questionCount: 8,
    topics: [
      "Felsefenin Alanı",
      "Bilgi Felsefesi",
      "Bilim Felsefesi",
      "Varlık Felsefesi",
      "Ahlak Felsefesi",
      "Siyaset Felsefesi",
      "Sanat Felsefesi",
      "Din Felsefesi",
    ],
  },
  {
    name: "Mantık",
    questionCount: 4,
    topics: [
      "Mantığa Giriş",
      "Klasik Mantık",
      "Mantık ve Dil",
      "Sembolik Mantık",
    ],
  },
  {
    name: "Psikoloji",
    questionCount: 4,
    topics: [
      "Psikolojinin Temel Süreçleri",
      "Öğrenme Bellek Düşünme",
      "Ruh Sağlığının Temelleri",
    ],
  },
  {
    name: "Sosyoloji",
    questionCount: 4,
    topics: [
      "Birey ve Toplum",
      "Toplumsal Yapı",
      "Toplumsal Değişme ve Gelişme",
      "Toplum ve Kültür",
      "Toplumsal Kurumlar",
    ],
  },
  {
    name: "Din Kültürü ve Ahlak Bilgisi",
    questionCount: 4,
    topics: [
      "Kur'an-ı Kerim'in Anlaşılması ve Kavranması",
      "İnsan ve Din",
      "İslam ve İbadetler",
      "İslam Düşüncesinde Yorumlar, Mezhepler",
      "Muhammed'in Hayatı, Örnekliği ve Onu Anlama",
      "İslam ve Bilim, Estetik, Barış",
      "Yaşayan Dinler ve Benzer Özellikleri",
    ],
  },
];

// =====================================================================
// MİGRASYON
// =====================================================================

async function main() {
  console.log("🗑️  Mevcut konu verileri temizleniyor...\n");

  // 1. Kazanım verilerini sil
  const kazanimProgressCount = await prisma.kazanimProgress.deleteMany();
  console.log(`   Silindi: ${kazanimProgressCount.count} kazanım ilerleme kaydı`);

  const kazanimCount = await prisma.topicKazanim.deleteMany();
  console.log(`   Silindi: ${kazanimCount.count} kazanım`);

  // 2. Konu bağımlı verileri sil
  const conceptCount = await prisma.topicConcept.deleteMany();
  console.log(`   Silindi: ${conceptCount.count} anahtar kavram`);

  const prereqCount = await prisma.topicPrerequisite.deleteMany();
  console.log(`   Silindi: ${prereqCount.count} ön-koşul`);

  const knowledgeCount = await prisma.topicKnowledge.deleteMany();
  console.log(`   Silindi: ${knowledgeCount.count} bilgi seviyesi kaydı`);

  const reviewCount = await prisma.topicReview.deleteMany();
  console.log(`   Silindi: ${reviewCount.count} konu tekrar kaydı`);

  // 3. Opsiyonel topic referanslarını null yap
  await prisma.examWrongQuestion.updateMany({ data: { topicId: null } });
  await prisma.examEmptyQuestion.updateMany({ data: { topicId: null } });
  await prisma.dailyStudy.updateMany({ data: { topicId: null } });
  await prisma.weeklyPlanItem.updateMany({ data: { topicId: null } });
  await prisma.spacedRepetitionItem.updateMany({ data: { topicId: null } });
  console.log("   Topic referansları null yapıldı");

  // 4. Tüm topic'leri sil
  const topicCount = await prisma.topic.deleteMany();
  console.log(`   Silindi: ${topicCount.count} konu`);

  // 5. Subject bağımlı verileri sil (required FK'ler)
  await prisma.targetScore.deleteMany();
  await prisma.spacedRepetitionItem.deleteMany();
  await prisma.weeklyPlanItem.deleteMany();
  await prisma.dailyStudy.deleteMany();
  await prisma.examEmptyQuestion.deleteMany();
  await prisma.examWrongQuestion.deleteMany();
  await prisma.examSubjectResult.deleteMany();
  console.log("   Subject bağımlı veriler temizlendi");

  // 6. Tüm subject'leri sil
  const subjectCount = await prisma.subject.deleteMany();
  console.log(`   Silindi: ${subjectCount.count} ders\n`);

  // ==================== YENİ VERİLERİ EKLE ====================

  console.log("📚 PDF'den konular ekleniyor...\n");

  // ExamType'ları al
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  const ayt = await prisma.examType.findUnique({ where: { slug: "ayt" } });

  if (!tyt || !ayt) {
    throw new Error("ExamType TYT veya AYT bulunamadı! Önce seed.ts çalıştırın.");
  }

  // TYT derslerini ve konularını ekle
  let totalTopics = 0;
  for (let si = 0; si < TYT_SUBJECTS.length; si++) {
    const subDef = TYT_SUBJECTS[si];
    const subject = await prisma.subject.create({
      data: {
        name: subDef.name,
        questionCount: subDef.questionCount,
        examTypeId: tyt.id,
        sortOrder: si,
      },
    });

    for (let ti = 0; ti < subDef.topics.length; ti++) {
      await prisma.topic.create({
        data: {
          name: subDef.topics[ti],
          subjectId: subject.id,
          sortOrder: ti,
        },
      });
      totalTopics++;
    }

    console.log(`   TYT ${subDef.name}: ${subDef.topics.length} konu eklendi`);
  }

  // AYT derslerini ve konularını ekle
  for (let si = 0; si < AYT_SUBJECTS.length; si++) {
    const subDef = AYT_SUBJECTS[si];
    const subject = await prisma.subject.create({
      data: {
        name: subDef.name,
        questionCount: subDef.questionCount,
        examTypeId: ayt.id,
        sortOrder: si,
      },
    });

    for (let ti = 0; ti < subDef.topics.length; ti++) {
      await prisma.topic.create({
        data: {
          name: subDef.topics[ti],
          subjectId: subject.id,
          sortOrder: ti,
        },
      });
      totalTopics++;
    }

    console.log(`   AYT ${subDef.name}: ${subDef.topics.length} konu eklendi`);
  }

  console.log(`\n✅ Toplam ${totalTopics} konu başarıyla eklendi!`);
  console.log(
    `   TYT: ${TYT_SUBJECTS.length} ders, ${TYT_SUBJECTS.reduce((s, d) => s + d.topics.length, 0)} konu`
  );
  console.log(
    `   AYT: ${AYT_SUBJECTS.length} ders, ${AYT_SUBJECTS.reduce((s, d) => s + d.topics.length, 0)} konu`
  );
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
