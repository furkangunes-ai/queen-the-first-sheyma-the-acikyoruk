/**
 * TYT Fizik kazanımlarını ÖSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Fizik Dersi Öğretim Programı (2018)
 * 9. sınıf: sayfa 155-160, 10. sınıf: sayfa 161-167
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-fizik-kazanim.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface KazanimDef {
  code: string;
  subTopicName: string;
  description: string;
  details?: string;
  isKeyKazanim?: boolean;
}

// =====================================================================
// PDF'DEN ÇIKARILMIŞ KAZANIMLAR — TOPIC ADI → KAZANIM LİSTESİ
// =====================================================================

const KAZANIMLAR: Record<string, KazanimDef[]> = {
  // ==================== FİZİK BİLİMİNE GİRİŞ (9.1) ====================
  "Fiziğin Tanımı ve Özellikleri": [
    {
      code: "9.1.1.1",
      subTopicName: "Fizik Biliminin Önemi",
      description:
        "Evrendeki olayların anlaşılmasında fizik biliminin önemini açıklar.",
      details:
        "Fiziğin evren ve evrendeki olayların anlaşılması ve açıklanmasındaki rolü üzerinde durulur.",
    },
  ],

  "Fiziğin Alt Dalları": [
    {
      code: "9.1.2.1",
      subTopicName: "Fiziğin Uygulama Alanları",
      description:
        "Fiziğin uygulama alanlarını, alt dalları ve diğer disiplinlerle ilişkilendirir.",
      details: [
        "a) Fiziğin mekanik, termodinamik, elektromanyetizma, optik, katıhal fiziği, atom fiziği, nükleer fizik, yüksek enerji ve plazma fiziği alt dalları, uygulama alanlarından örneklerle açıklanır. Alt dallar ile ilgili mesleklere örnekler verilir.",
        "b) Fiziğin felsefe, biyoloji, kimya, teknoloji, mühendislik, sanat, spor ve matematik alanları ile olan ilişkisine günlük hayattan örnekler verilir.",
      ].join("\n"),
    },
  ],

  "Fiziğin Diğer Disiplinlerle İlişkisi": [
    {
      code: "9.1.2.1b",
      subTopicName: "Fiziğin Diğer Disiplinlerle İlişkisi",
      description:
        "Fiziğin felsefe, biyoloji, kimya, teknoloji, mühendislik, sanat, spor ve matematik alanları ile olan ilişkisini açıklar.",
    },
  ],

  "Fiziksel Niceliklerin Sınıflandırılması": [
    {
      code: "9.1.3.1",
      subTopicName: "Fiziksel Niceliklerin Sınıflandırılması",
      description: "Fiziksel nicelikleri sınıflandırır.",
      details: [
        "a) Niceliklerin temel ve türetilmiş olarak tanımlanması ve sınıflandırılması sağlanır.",
        "b) Temel büyüklüklerin birimleri SI birim sisteminde tanıtılır. Türetilmiş büyüklükler için fen bilimleri dersinde geçmiş konulardan örnekler verilir.",
        "c) Niceliklerin skaler ve vektörel olarak tanımlanması ve sınıflandırılması sağlanır.",
        "ç) Vektörlerde toplama işlemlerinin tek boyutta yapılması sağlanır. Skaler ve vektörel niceliklerde toplama işlemlerine günlük hayattan örnekler verilerek, karşılaştırma yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Fizik ve Bilim Araştırma Merkezleri": [
    {
      code: "9.1.4.1",
      subTopicName: "Bilim Araştırma Merkezleri",
      description:
        "Bilim araştırma merkezlerinin fizik bilimi için önemini açıklar.",
      details: [
        "a) Bilim araştırma merkezleri TÜBİTAK, TAEK, ASELSAN, CERN, NASA ve ESA ile sınırlandırılır.",
        "b) Bilimsel araştırmalarda etik ilkelere uymanın önemi vurgulanır.",
      ].join("\n"),
    },
  ],

  // ==================== MADDE VE ÖZELLİKLERİ (9.2) ====================
  "Madde ve Özkütle": [
    {
      code: "9.2.1.1",
      subTopicName: "Madde ve Özkütle",
      description:
        "Özkütleyi, kütle ve hacimle ilişkilendirerek açıklar.",
      details: [
        "a) Kütle ve hacim kavramlarına değinilir. Kütle (mg, g, kg ve ton) ve hacim (mL, L, cm³, dm³, m³) için anlamlı birim dönüşümleri yapılır.",
        "b) Düzgün geometrik şekilli cisimlerden küp, dikdörtgenler prizması, silindir, küre ve şekli düzgün olmayan cisimler için hacim hesaplamaları yapılır. Kum-su problemlerine girilmez.",
        "c) Sabit sıcaklık ve basınçta ölçüm yapılarak kütle-hacim grafiğinin çizilmesi; kütle, hacim ve özkütle kavramları arasındaki matematiksel modelin çıkarılması sağlanır.",
        "ç) Kütle-özkütle, hacim-özkütle grafiklerinin çizilmesi ve yorumlanması sağlanır.",
        "d) Eşit kollu terazi ile ilgili matematiksel hesaplamalara girilmez.",
        "e) Karışımların özkütlelerine değinilir. Matematiksel hesaplamalara girilmez.",
        "f) Archimedes ve el-Hazini'nin özkütle ile ilgili yaptığı çalışmalar hakkında kısaca bilgi verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.1.2",
      subTopicName: "Madde ve Özkütle",
      description:
        "Günlük hayatta saf maddelerin ve karışımların özkütlelerinden faydalanılan durumlara örnekler verir.",
      details:
        "Kuyumculuk, porselen yapımı, ebru yapımı gibi özkütleden faydalanılan çalışma alanlarına değinilir.",
    },
  ],

  "Dayanıklılık": [
    {
      code: "9.2.2.1",
      subTopicName: "Dayanıklılık",
      description: "Dayanıklılık kavramını açıklar.",
      details:
        "Düzgün geometrik şekilli cisimlerden küp, dikdörtgenler prizması, silindir ve kürenin kesit alanının hacme oranı dışında dayanıklılık kavramı ile ilgili matematiksel hesaplamalara girilmez.",
    },
  ],

  "Adezyon ve Kohezyon": [
    {
      code: "9.2.3.1",
      subTopicName: "Yapışma ve Birbirini Tutma",
      description:
        "Yapışma (adezyon) ve birbirini tutma (kohezyon) olaylarını örneklerle açıklar.",
      details: [
        "a) Yüzey gerilimi ve kılcallık olayının yapışma ve birbirini tutma olayları ile açıklanması ve günlük hayattan örnekler verilmesi sağlanır.",
        "b) Yüzey gerilimini etkileyen faktörlerin, günlük hayattaki örnekler ile açıklanması sağlanır.",
        "c) Adezyon, kohezyon, yüzey gerilimi ve kılcallık ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== HAREKET VE KUVVET (9.3) ====================
  "Hareket": [
    {
      code: "9.3.1.1",
      subTopicName: "Hareket Türleri",
      description: "Cisimlerin hareketlerini sınıflandırır.",
      details:
        "Deney veya simülasyonlardan yararlanarak öteleme, dönme ve titreşim hareketlerine örnekler verilmesi sağlanır.",
    },
    {
      code: "9.3.1.2",
      subTopicName: "Konum, Yol, Yer Değiştirme",
      description:
        "Konum, alınan yol, yer değiştirme, sürat ve hız kavramlarını birbirleri ile ilişkilendirir.",
      isKeyKazanim: true,
    },
    {
      code: "9.3.1.3",
      subTopicName: "Düzgün Doğrusal Hareket",
      description:
        "Düzgün doğrusal hareket için konum, hız ve zaman kavramlarını ilişkilendirir.",
      details: [
        "a) Öğrencilerin deney yaparak veya simülasyonlarla veriler toplamaları, konum-zaman ve hız-zaman grafiklerini çizmeleri, bunları yorumlamaları ve çizilen grafikler arasında dönüşümler yapmaları sağlanır.",
        "b) Öğrencilerin grafiklerden yararlanarak hareket ile ilgili matematiksel modelleri çıkarmaları ve yorumlamaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.1.4",
      subTopicName: "Ortalama Hız",
      description: "Ortalama hız kavramını açıklar.",
      details:
        "Trafikte yeşil dalga sisteminin çalışma ilkesi üzerinde durulur.",
    },
    {
      code: "9.3.1.5",
      subTopicName: "İvme",
      description:
        "İvme kavramını hızlanma ve yavaşlama olayları ile ilişkilendirir.",
      details: [
        "a) Sabit ivmeli hareket ile sınırlı kalınır.",
        "b) İvmenin matematiksel modelinin çıkarılması sağlanır. Matematiksel hesaplamalara girilmez.",
        "c) Sabit ivmeli hareket için hız-zaman ve ivme-zaman grafiklerini çizmeleri, yorumlamaları sağlanır. Grafikler arasında dönüşümlere girilmez. Konum-zaman grafiği çizdirilmez.",
        "ç) Anlık hız kavramına değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.1.6",
      subTopicName: "Bağıl Hareket",
      description:
        "Bir cismin hareketini farklı referans noktalarına göre açıklar.",
      details:
        "Gözlemlerle hareketin göreceli olduğu çıkarımının yapılması sağlanır.",
    },
  ],

  "Kuvvet": [
    {
      code: "9.3.2.1",
      subTopicName: "Kuvvet",
      description: "Kuvvet kavramını örneklerle açıklar.",
      details: [
        "a) Temas gerektiren ve gerektirmeyen kuvvetlere örnek verilmesi sağlanır.",
        "b) Dört temel kuvvetin hangi kuvvetler olduğu belirtilir.",
        "c) Kütle çekim kuvvetinin bağlı olduğu değişkenler verilir. Matematiksel hesaplamalara girilmez.",
        "ç) Dengelenmiş ve dengelenmemiş kuvvetler vurgulanır.",
      ].join("\n"),
    },
  ],

  "Newton'un Hareket Yasaları": [
    {
      code: "9.3.3.1",
      subTopicName: "Newton'un 1. Yasası",
      description:
        "Dengelenmiş kuvvetlerin etkisindeki cisimlerin hareket durumlarını örneklerle açıklar.",
      details:
        "İbn-i Sina'nın hareket konusunda yaptığı çalışmalar hakkında kısaca bilgi verilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.3.3.2",
      subTopicName: "Newton'un 2. Yasası",
      description:
        "Kuvvet, ivme ve kütle kavramları arasındaki ilişkiyi açıklar.",
      details: [
        "a) Net kuvvet, ivme ve kütle arasındaki matematiksel model verilir.",
        "b) Serbest cisim diyagramı üzerinde cisme etki eden kuvvetler gösterilir. Net kuvvetin büyüklüğü hesaplanarak yönü gösterilir.",
        "c) Hesaplamalarda yatay düzlemde tek kütle ile sınırlı kalınır. Bileşenlere ayırma hesaplamalarına girilmez.",
        "ç) Yer çekimi ivmesi açıklanarak ağırlık hesaplamaları yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.3.3",
      subTopicName: "Newton'un 3. Yasası",
      description: "Etki-tepki kuvvetlerini örneklerle açıklar.",
      details: [
        "a) Yatay ve düşey düzlemlerde etki-tepki kuvvetlerinin gösterilmesi sağlanır.",
        "b) Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  "Sürtünme Kuvveti": [
    {
      code: "9.3.4.1",
      subTopicName: "Sürtünme Kuvveti",
      description:
        "Sürtünme kuvvetinin bağlı olduğu değişkenleri analiz eder.",
      details: [
        "a) Öğrencilerin deney yaparak veya simülasyonlardan elde ettiği verilerden çıkarım yapmaları ve değişkenler arasındaki ilişkiyi belirlemeleri sağlanır. Yatay düzlemle sınırlı kalınır.",
        "b) Statik ve kinetik sürtünme kuvvetlerinin karşılaştırılması sağlanır.",
        "c) Serbest cisim diyagramları üzerinde sürtünme kuvvetinin gösterilmesi sağlanır.",
        "ç) Sürtünme kuvvetinin matematiksel modeli verilir. Matematiksel hesaplamalara girilmez.",
        "d) Sürtünme kuvvetinin günlük hayattaki avantaj ve dezavantajlarına örnekler verilmesi sağlanır.",
        "e) Kayarak ve dönerek ilerleyen cisimlerde sürtünme kuvvetinin yönü, örnekler üzerinden açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ENERJİ (9.4) ====================
  "İş, Güç ve Enerji": [
    {
      code: "9.4.1.1",
      subTopicName: "İş ve Güç",
      description:
        "İş, enerji ve güç kavramlarını birbirleriyle ilişkilendirir.",
      details: [
        "a) İş ile enerji arasındaki ilişki kavramsal olarak verilir.",
        "b) Öğrencilerin iş ve güç kavramlarının matematiksel modellerini incelemeleri sağlanır.",
        "c) Fiziksel anlamda iş ve güç ile günlük hayatta kullanılan iş ve güç kavramlarının farklı olduğu vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.1.2",
      subTopicName: "İş ve Güç",
      description:
        "Mekanik iş ve mekanik güç ile ilgili hesaplamalar yapar.",
      details:
        "Hareket ile aynı doğrultudaki kuvvetlerle sınırlı kalınır.",
    },
  ],

  "Mekanik Enerji": [
    {
      code: "9.4.2.1",
      subTopicName: "Mekanik Enerji",
      description:
        "Öteleme kinetik enerjisi, yer çekimi potansiyel enerjisi ve esneklik potansiyel enerjisinin bağlı olduğu değişkenleri analiz eder.",
      details: [
        "a) Öteleme kinetik enerjisi, yer çekimi potansiyel enerjisi ve esneklik potansiyel enerjisinin matematiksel modelleri verilir. Deney veya simülasyonlar yardımıyla değişkenlerin analiz edilmesi sağlanır. Matematiksel hesaplamalara girilmez.",
        "b) Esneklik potansiyel enerjisinde tek yaylı sistemler dikkate alınmalıdır.",
        "c) Mekanik enerjinin kinetik enerji ve potansiyel enerjinin toplamına eşit olduğu vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Enerjinin Korunumu ve Enerji Dönüşümleri": [
    {
      code: "9.4.3.1",
      subTopicName: "Enerjinin Korunumu",
      description:
        "Enerjinin bir biçimden diğer bir biçime (mekanik, ısı, ışık, ses gibi) dönüşümünde toplam enerjinin korunduğu çıkarımını yapar.",
      details: [
        "a) Sürtünmeden dolayı enerjinin tamamının hedeflenen enerji biçimine dönüştürülemeyeceği vurgulanır.",
        "b) Enerji dönüşüm hesaplamalarına girilmez.",
      ].join("\n"),
    },
    {
      code: "9.4.3.2",
      subTopicName: "Enerji Dönüşümleri",
      description:
        "Canlıların besinlerden kazandıkları enerji ile günlük aktiviteler için harcadıkları enerjiyi karşılaştırır.",
      details:
        "Canlıların fiziksel anlamda iş yapmadan da enerji harcayabildikleri vurgulanır.",
    },
  ],

  "Verim": [
    {
      code: "9.4.4.1",
      subTopicName: "Verim",
      description: "Verim kavramını açıklar.",
      details:
        "Enerji tasarrufu ve enerji verimliliği arasındaki ilişki enerji kimlik belgeleri üzerinden açıklanır.",
      isKeyKazanim: true,
    },
    {
      code: "9.4.4.2",
      subTopicName: "Verim",
      description:
        "Örnek bir sistem veya tasarımın verimini artıracak öneriler geliştirir.",
    },
  ],

  "Enerji Kaynakları": [
    {
      code: "9.4.5.1",
      subTopicName: "Enerji Kaynakları",
      description:
        "Yenilenebilir ve yenilenemez enerji kaynaklarını avantaj ve dezavantajları açısından değerlendirir.",
      details: [
        "a) Enerji kaynaklarının maliyeti, erişilebilirliği, üretim kolaylığı, toplum, teknoloji ve çevresel etkileri göz önünde bulundurulur.",
        "b) Enerji kaynaklarını tasarruflu kullanmanın gerekliliği vurgulanır.",
      ].join("\n"),
    },
  ],

  // ==================== ISI VE SICAKLIK (9.5) ====================
  "Isı ve Sıcaklık": [
    {
      code: "9.5.1.1",
      subTopicName: "Isı, Sıcaklık ve İç Enerji",
      description:
        "Isı, sıcaklık ve iç enerji kavramlarını açıklar.",
      details: [
        "a) Entalpi ve entropi kavramlarına girilmez.",
        "b) Isı ve sıcaklık kavramlarının birimleri ve ölçüm aletlerinin adları verilir.",
      ].join("\n"),
    },
    {
      code: "9.5.1.2",
      subTopicName: "Termometre Çeşitleri",
      description:
        "Termometre çeşitlerini kullanım amaçları açısından karşılaştırır.",
    },
    {
      code: "9.5.1.3",
      subTopicName: "Sıcaklık Birimleri",
      description:
        "Sıcaklık birimleri ile ilgili hesaplamalar yapar.",
      details:
        "°C, °F, K için birim dönüşümleri yapılması sağlanır.",
      isKeyKazanim: true,
    },
    {
      code: "9.5.1.4",
      subTopicName: "Öz Isı ve Isı Sığası",
      description:
        "Öz ısı ve ısı sığası kavramlarını birbiriyle ilişkilendirir.",
      details:
        "Günlük hayattan örnekler (denizlerin karalardan geç ısınıp geç soğuması gibi) verilir.",
    },
    {
      code: "9.5.1.5",
      subTopicName: "Isı-Sıcaklık İlişkisi",
      description:
        "Isı alan veya ısı veren saf maddelerin sıcaklığında meydana gelen değişimin bağlı olduğu değişkenleri analiz eder.",
      details:
        "Deney veya simülasyonlardan yararlanılarak değişkenler arasındaki ilişkiyi belirlemeleri sağlanır. Matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
      isKeyKazanim: true,
    },
  ],

  "Hal Değişimi": [
    {
      code: "9.5.2.1",
      subTopicName: "Hal Değişimi",
      description:
        "Saf maddelerde hal değişimi için gerekli olan ısı miktarının bağlı olduğu değişkenleri analiz eder.",
      details:
        "Deney veya simülasyonlardan yararlanılarak değişkenler arasındaki ilişkiyi belirlemeleri sağlanır. Matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
      isKeyKazanim: true,
    },
  ],

  "Isıl Denge": [
    {
      code: "9.5.3.1",
      subTopicName: "Isıl Denge",
      description:
        "Isıl denge kavramının sıcaklık farkı ve ısı kavramı ile olan ilişkisini analiz eder.",
      details: [
        "a) Deney veya simülasyonlardan yararlanılarak ısıl dengenin sıcaklık değişimi ve ısı ile ilişkisinin belirlenmesi sağlanır.",
        "b) Isıl denge ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  "Enerji İletim Yolları ve Enerji Tüketim Hızı": [
    {
      code: "9.5.4.1",
      subTopicName: "Enerji İletim Yolları",
      description: "Enerji iletim yollarını örneklerle açıklar.",
    },
    {
      code: "9.5.4.2",
      subTopicName: "Enerji İletim Hızı",
      description:
        "Katı maddedeki enerji iletim hızını etkileyen değişkenleri analiz eder.",
      details: [
        "a) Deney veya simülasyonlardan yararlanılarak değişkenler arasındaki ilişkiyi belirlemeleri sağlanır.",
        "b) Günlük hayattan örnekler (ısı yalıtımında izolasyon malzemelerinin kullanılması, soğuk bölgelerde pencerelerin küçük, duvarların kalın olması gibi) verilir.",
        "c) Enerji iletim hızı ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "9.5.4.3",
      subTopicName: "Isı Yalıtımı",
      description:
        "Enerji tasarrufu için yaşam alanlarının yalıtımına yönelik tasarım yapar.",
      details: [
        "a) Enerji tasarrufu için ısı yalıtım sisteminin aile bütçesine ve ülke ekonomisine olan katkısının önemi vurgulanır.",
        "b) Öğrencilerin ısı yalıtımı ile ilgili günlük hayattan bir problem belirlemeleri ve bu problem için çözümler üretmeleri sağlanır.",
        "c) Yapılacak tasarımlarda finans bilincinin geliştirilmesi için bütçe hesaplaması yapılmasının gerekliliği vurgulanmalıdır.",
      ].join("\n"),
    },
    {
      code: "9.5.4.4",
      subTopicName: "Hissedilen Sıcaklık",
      description:
        "Hissedilen ve gerçek sıcaklık arasındaki farkın sebeplerini yorumlar.",
    },
    {
      code: "9.5.4.5",
      subTopicName: "Küresel Isınma",
      description:
        "Küresel ısınmaya karşı alınacak tedbirlere yönelik proje geliştirir.",
      details: [
        "a) Öğrencilerin projelerini poster, broşür veya elektronik sunu ile tanıtmaları sağlanır.",
        "b) Küresel ısınmanın sebeplerine dikkat çekilir.",
        "c) Çevreye karşı duyarlı olmanın gerekliliği ve bireysel olarak yapılabilecek katkılar hakkında tartışılması sağlanır.",
      ].join("\n"),
    },
  ],

  "Genleşme": [
    {
      code: "9.5.5.1",
      subTopicName: "Genleşme",
      description:
        "Katı ve sıvılarda genleşme ve büzülme olaylarının günlük hayattaki etkilerini yorumlar.",
      details: [
        "a) Katı ve sıvıların genleşmesi ve büzülmesinin günlük hayatta oluşturduğu avantaj ve dezavantajların tartışılması sağlanır.",
        "b) Su ve buzun özkütle, öz ısıları karşılaştırılarak günlük hayata etkileri üzerinde durulur.",
        "c) Genleşme ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  // ==================== ELEKTROSTATİK (9.6) ====================
  "Elektrik Yükü": [
    {
      code: "9.6.1.1a",
      subTopicName: "Elektrik Yükleri",
      description:
        "Elektrikle yüklenme çeşitlerini örneklerle açıklar.",
      details: [
        "a) Yük, birim yük ve elektrikle yüklenme kavramları verilir.",
        "b) Elektrikle yüklenmede yüklerin korunumlu olduğu vurgulanmalıdır.",
        "c) Elektroskopun yük cinsinin tayininde kullanılmasına örnekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Elektrikle Yüklenme Çeşitleri": [
    {
      code: "9.6.1.1b",
      subTopicName: "Elektrikle Yüklenme",
      description:
        "Sürtünme, dokunma ve etki ile yüklenme çeşitlerini açıklar.",
      details:
        "Sürtünme, dokunma ve etki ile yüklenme türleri örneklerle açıklanır.",
    },
  ],

  "Elektroskop": [
    {
      code: "9.6.1.1c",
      subTopicName: "Elektroskop",
      description:
        "Elektroskopun yük cinsinin tayininde kullanımını açıklar.",
      details:
        "Elektroskopun yapısı ve çalışma prensibi açıklanır.",
    },
  ],

  "İletken ve Yalıtkanlarda Yük Dağılımı": [
    {
      code: "9.6.1.2",
      subTopicName: "Yük Dağılımı",
      description:
        "Elektriklenen iletken ve yalıtkan maddelerde yük dağılımlarını karşılaştırır.",
      details: [
        "a) Öğrencilerin karşılaştırmayı deneyler yaparak veya simülasyonlar kullanarak yapmaları sağlanır.",
        "b) Faraday kafesi, kullanım alanları ve önemi açıklanır.",
        "c) Topraklama olayı açıklanarak günlük hayattaki önemi vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Topraklama": [
    {
      code: "9.6.1.2b",
      subTopicName: "Topraklama",
      description: "Topraklama olayını açıklar.",
      details:
        "Topraklamanın günlük hayattaki önemi ve kullanım alanları vurgulanır.",
    },
  ],

  "Coulomb Kuvveti": [
    {
      code: "9.6.1.3",
      subTopicName: "Coulomb Kuvveti",
      description:
        "Elektrik yüklü cisimler arasındaki etkileşimi açıklar.",
      details: [
        "a) Deney veya simülasyonlardan yararlanılarak elektrik yüklü cisimler arasındaki etkileşimin (Coulomb Kuvveti) bağlı olduğu değişkenler arasındaki ilişkiyi belirlemeleri sağlanır. Matematiksel model verilir.",
        "b) Yüklerin etkileşimi ile ilgili noktasal yüklerle ve tek boyutta matematiksel hesaplamalar yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Elektrik Alanı": [
    {
      code: "9.6.1.4",
      subTopicName: "Elektrik Alanı",
      description: "Elektrik alan kavramını açıklar.",
      details:
        "Deney veya simülasyonlardan yararlanılarak elektrik alan kavramı ile elektriksel kuvvet arasındaki ilişki açıklanır. Matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
    },
  ],

  // ==================== ELEKTRİK VE MANYETİZMA (10.1) ====================
  "Elektrik Akımı, Potansiyel Farkı ve Direnci": [
    {
      code: "10.1.1.1",
      subTopicName: "Elektrik Akımı, Direnç ve Potansiyel Farkı",
      description:
        "Elektrik akımı, direnç ve potansiyel farkı kavramlarını açıklar.",
      details: [
        "a) Elektrik yükünün hareketi üzerinden elektrik akımı kavramının açıklanması sağlanır.",
        "b) Katı, sıvı, gaz ve plazmalarda elektrik iletimine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.1.2",
      subTopicName: "Direnç ve Değişkenleri",
      description:
        "Katı bir iletkenin direncinin bağlı olduğu değişkenleri analiz eder.",
      details: [
        "a) Deney veya simülasyonlardan yararlanarak değişkenler arasındaki ilişkiyi belirlemeleri ve matematiksel modeli çıkarmaları sağlanır. Matematiksel hesaplamalara girilmez.",
        "b) İletken direncinin sıcaklığa bağlı değişimine ve renk kodlarıyla direnç okuma işlemlerine girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Elektrik Devreleri": [
    {
      code: "10.1.2.1",
      subTopicName: "Ohm Yasası",
      description:
        "Elektrik akımı, direnç ve potansiyel farkı arasındaki ilişkiyi analiz eder.",
      details: [
        "a) Voltmetre ve ampermetrenin direnç özellikleri ile devredeki görevleri açıklanır.",
        "b) Öğrencilerin basit devreler üzerinden deney yaparak elektrik akımı, direnç ve potansiyel farkı arasındaki ilişkinin (Ohm Yasası) matematiksel modelini çıkarmaları sağlanır.",
        "c) Elektrik devrelerinde eşdeğer direnç, direnç, potansiyel farkı ve elektrik akımı ile ilgili matematiksel hesaplamalar yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2.2",
      subTopicName: "Seri ve Paralel Bağlama",
      description:
        "Üreteçlerin seri ve paralel bağlanma gerekçelerini açıklar.",
      details: [
        "a) Öğrencilerin deney veya simülasyonlarla üreteçlerin bağlanma şekillerini incelemeleri ve tükenme sürelerini karşılaştırmaları sağlanır. Üreteçlerin ters bağlanması da dikkate alınır.",
        "b) Elektromotor kuvvetleri farklı üreteçlerin paralele bağlanmasına girilmez.",
        "c) Üreteçlerin iç dirençleri örneklerle açıklanır, iç dirençler ile ilgili matematiksel hesaplamalara girilmez.",
        "ç) Üreteçlerin üretecin keşfi üzerine deneyler yapan bilim insanları Galvani ve Volta'nın bakış açıları arasındaki farkı tartışmaları sağlanır.",
        "d) Kirchhoff Kanunlarına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2.3",
      subTopicName: "Elektrik Enerjisi ve Güç",
      description:
        "Elektrik enerjisi ve elektriksel güç kavramlarını ilişkilendirir.",
      details: [
        "a) Elektrik enerjisi ve elektriksel güç ilişkisi ile mekanik enerji ve mekanik güç ilişkisi arasındaki benzerliğe değinilir.",
        "b) Bir direncin birim zamanda harcadığı elektrik enerjisi ile ilgili hesaplamalar dışında matematiksel hesaplamalara girilmez.",
        "c) Öğrencilerin ısı, iş, mekanik enerji ve elektrik enerjisinin birbirine dönüşümünü açıklamaları sağlanır.",
        "ç) Lamba parlaklıklarının karşılaştırılması sağlanır.",
      ].join("\n"),
    },
    {
      code: "10.1.2.4",
      subTopicName: "Elektrik Güvenliği",
      description:
        "Elektrik akımının oluşturabileceği tehlikelere karşı alınması gereken sağlık ve güvenlik önlemlerini açıklar.",
    },
  ],

  "Mıknatıs ve Manyetik Alan": [
    {
      code: "10.1.3.1",
      subTopicName: "Mıknatıs ve Manyetik Alan",
      description:
        "Mıknatısların oluşturduğu manyetik alanı ve özelliklerini açıklar.",
      details: [
        "a) Öğrencilerin deneyler yaparak veya simülasyonlar kullanarak manyetik alanı incelemeleri sağlanır.",
        "b) Mıknatısların manyetik alanının manyetik alan çizgileri ile temsil edildiği vurgulanır.",
        "c) Mıknatısların itme-çekme kuvvetleri ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  "Akım ve Manyetik Alan": [
    {
      code: "10.1.4.1",
      subTopicName: "Akımın Manyetik Alanı",
      description:
        "Üzerinden akım geçen düz bir iletken telin oluşturduğu manyetik alanı etkileyen değişkenleri analiz eder.",
      details: [
        "a) Öğrencilerin deneyler yaparak veya simülasyonlar kullanarak manyetik alanı etkileyen değişkenleri belirlemeleri sağlanır.",
        "b) Sağ el kuralı verilir. Manyetik alanın yönü ve şiddeti ile ilgili matematiksel hesaplamalara girilmez.",
        "c) Yüksek gerilim hatlarının geçtiği alanlarda oluşan manyetik alanın canlılar üzerindeki etkilerine değinilir.",
        "ç) Elektromıknatıs tanıtılarak kullanım alanlarına örnekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.4.2",
      subTopicName: "Dünya'nın Manyetik Alanı",
      description:
        "Dünya'nın manyetik alanının sonuçlarını açıklar.",
      details: [
        "a) Öğrencilerin pusula ile yön bulmaları sağlanır.",
        "b) Arılar, göçmen kuşlar, bazı büyükbaş hayvanlar gibi canlıların yerin manyetik alanından yararlanarak yön buldukları belirtilir.",
      ].join("\n"),
    },
  ],

  // ==================== BASINÇ VE KALDIRMA KUVVETİ (10.2) ====================
  "Basınç": [
    {
      code: "10.2.1.1",
      subTopicName: "Basınç",
      description:
        "Basınç ve basınç kuvveti kavramlarının katı, durgun sıvı ve gazlarda bağlı olduğu değişkenleri açıklar.",
      details: [
        "a) Öğrencilerin günlük hayattan basıncın hayatımıza etkilerine örnekler vermeleri sağlanır. Basıncın hal değişimine etkileri vurgulanır.",
        "b) Katı ve durgun sıvı basıncı ve basınç kuvveti ile ilgili matematiksel modeller verilir. Bileşenlerine ayırma ve matematiksel hesaplamalara girilmez.",
        "c) Torricelli deneyi açıklanır ve kılcallık ile farkı belirtilir.",
        "ç) Basınç etkisiyle çalışan ölçüm aletlerinden barometre, altimetre, manometre ve batimetre hakkında bilgi verilir.",
        "d) Pascal Prensibine değinilir. Gaz basıncı ve Pascal Prensibi ile ilgili matematiksel modeller verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.1.2",
      subTopicName: "Bernoulli İlkesi",
      description:
        "Akışkanlarda akış sürati ile akışkan basıncı arasında ilişki kurar.",
      details: [
        "a) Deney veya simülasyonlardan yararlanılarak kesit alanı, basınç ve akışkan sürati arasında bağlantı kurulması sağlanır.",
        "b) Bernoulli İlkesinin günlük hayattaki örnekler (çatıların uçması, şemsiyenin ters çevrilmesi, rüzgârlı havalarda kapıların sert kapanması gibi) üzerinden açıklanması sağlanır.",
        "c) Bernoulli İlkesiyle ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  "Kaldırma Kuvveti": [
    {
      code: "10.2.2.1",
      subTopicName: "Kaldırma Kuvveti",
      description:
        "Durgun akışkanlarda cisimlere etki eden kaldırma kuvvetinin basınç kuvveti farkından kaynaklandığını açıklar.",
      details: [
        "a) Archimedes İlkesi açıklanır. Yüzme, askıda kalma ve batma durumlarında kaldırma kuvveti ile cismin ağırlığının büyüklükleri karşılaştırılır.",
        "b) Kaldırma kuvveti ile ilgili matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.2.2",
      subTopicName: "Kaldırma Kuvveti Uygulamaları",
      description:
        "Kaldırma kuvvetiyle ilgili günlük hayattaki problemlere kaldırma kuvveti ve/veya Bernoulli İlkesini kullanarak çözüm önerisi üretir.",
    },
  ],

  // ==================== DALGALAR (10.3) ====================
  "Temel Dalga Bilgileri": [
    {
      code: "10.3.1.1",
      subTopicName: "Dalga Kavramları",
      description:
        "Titreşim, dalga hareketi, dalga boyu, periyot, frekans, hız ve genlik kavramlarını açıklar.",
      details: [
        "a) Deney, gözlem veya simülasyonlarla kavramların açıklanması sağlanır.",
        "b) Periyot ve frekans kavramlarının birbiriyle ilişkilendirilmesi ve matematiksel model oluşturulması sağlanır. Matematiksel hesaplamalara girilmez.",
        "c) Dalganın ilerleme hızı, dalga boyu ve frekans kavramları arasındaki matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
        "ç) Dalganın ilerleme hızının ortama, frekansın kaynağa bağlı olduğu vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.1.2",
      subTopicName: "Dalga Çeşitleri",
      description:
        "Dalgaları taşıdığı enerjiye ve titreşim doğrultusuna göre sınıflandırır.",
      details:
        "Öğrencilerin dalga çeşitlerine örnekler vermeleri sağlanır.",
    },
  ],

  "Yay Dalgası": [
    {
      code: "10.3.2.1",
      subTopicName: "Atma ve Periyodik Dalga",
      description:
        "Atma ve periyodik dalga oluşturarak aralarındaki farkı açıklar.",
      details: [
        "a) Atmanın özelliklerini incelemek için oluşturulduğu vurgulanır.",
        "b) Öğrencilerin deney yaparak veya simülasyonlar kullanarak atma ve periyodik dalgayı incelemeleri sağlanır.",
      ].join("\n"),
    },
    {
      code: "10.3.2.2",
      subTopicName: "Yansıma ve İletilme",
      description:
        "Yaylarda atmanın yansımasını ve iletilmesini analiz eder.",
      details: [
        "a) Öğrencilerin gergin bir yayda oluşturulan atmanın ilerleme hızının bağlı olduğu değişkenleri açıklaması sağlanır. Atmanın ilerleme hızı ile ilgili matematiksel hesaplamalara girilmez.",
        "b) Öğrencilerin deney yaparak veya simülasyonlar kullanarak atmaların sabit ve serbest uçtan yansıma durumlarını incelemeleri sağlanır.",
        "c) Bir ortamdan başka bir ortama geçerken yansıyan ve iletilen atmaların özellikleri üzerinde durulur.",
        "ç) Öğrencilerin deney ya da simülasyonlarla iki atmanın karşılaşması durumunda meydana gelebilecek olayları gözlemlemesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Su Dalgası": [
    {
      code: "10.3.3.1",
      subTopicName: "Su Dalgası Kavramları",
      description:
        "Dalgaların ilerleme yönü, dalga tepesi ve dalga çukuru kavramlarını açıklar.",
      details:
        "Kavramlar doğrusal ve dairesel su dalgaları bağlamında ele alınır.",
    },
    {
      code: "10.3.3.2",
      subTopicName: "Su Dalgası Yansıması",
      description:
        "Doğrusal ve dairesel su dalgalarının yansıma hareketlerini analiz eder.",
      details: [
        "a) Öğrencilerin deney yaparak veya simülasyonlar kullanarak su dalgalarının yansıma hareketlerini çizmeleri sağlanır.",
        "b) Doğrusal su dalgalarının doğrusal ve parabolik engellerden yansıması dikkate alınır.",
        "c) Dairesel su dalgalarının doğrusal engelden yansıması dikkate alınır, parabolik engelden yansımasında ise sadece odak noktası ve merkezden gönderilen dalgalar dikkate alınır.",
        "ç) Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "10.3.3.3",
      subTopicName: "Su Dalgası Hızı",
      description:
        "Ortam derinliği ile su dalgalarının yayılma hızını ilişkilendirir.",
      details: [
        "a) Öğrencilerin deney yaparak veya simülasyonlarla ortam derinliğinin dalganın hızına etkisini incelemeleri ve dalga boyundaki değişimi gözlemlemeleri sağlanır.",
        "b) Ortam değiştiren su dalgalarının dalga boyu ve hız değişimi ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "10.3.3.4",
      subTopicName: "Su Dalgası Kırılması",
      description:
        "Doğrusal su dalgalarının kırılma hareketini analiz eder.",
      details: [
        "a) Öğrencilerin deney yaparak veya simülasyonlar kullanarak su dalgalarının kırılma hareketlerini çizmeleri sağlanır. Su dalgalarının mercek şeklindeki su ortamından geçişi ile ilgili kırılma hareketlerine girilmez.",
        "b) Dairesel su dalgalarının kırılması konusuna girilmez.",
        "c) Su dalgalarının kırılma hareketi ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  "Ses Dalgası": [
    {
      code: "10.3.4.1",
      subTopicName: "Ses Dalgaları",
      description:
        "Ses dalgaları ile ilgili temel kavramları örneklerle açıklar.",
      details: [
        "a) Yükseklik, şiddet, tını, rezonans ve yankı kavramları ile sınırlı kalınır.",
        "b) Uğultu, gürültü ve ses kirliliği kavramlarına değinilir.",
        "c) Farabi'nin ses dalgaları ile ilgili yaptığı çalışmalar hakkında kısaca bilgi verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.4.2",
      subTopicName: "Ses Dalgası Uygulamaları",
      description:
        "Ses dalgalarının tıp, denizcilik, sanat ve coğrafya alanlarında kullanımına örnekler verir.",
    },
  ],

  "Deprem Dalgaları": [
    {
      code: "10.3.5.1",
      subTopicName: "Deprem Dalgası",
      description: "Deprem dalgasını tanımlar.",
      details: [
        "a) Depremin büyüklüğü ve şiddeti ile ilgili bilgi verilir.",
        "b) Depremlerde dalga çeşitlerine girilmez.",
      ].join("\n"),
    },
    {
      code: "10.3.5.2",
      subTopicName: "Deprem Önlemleri",
      description:
        "Deprem kaynaklı can ve mal kayıplarını önlemeye yönelik çözüm önerileri geliştirir.",
    },
  ],

  // ==================== OPTİK (10.4) ====================
  "Aydınlanma": [
    {
      code: "10.4.1.1",
      subTopicName: "Işığın Davranış Modelleri",
      description: "Işığın davranış modellerini açıklar.",
      details: "Modeller açıklanırken ayrıntılara girilmez.",
    },
    {
      code: "10.4.1.2",
      subTopicName: "Aydınlanma Şiddeti",
      description:
        "Işık şiddeti, ışık akısı ve aydınlanma şiddeti kavramları arasında ilişki kurar.",
      details: [
        "a) Deney yaparak veya simülasyonlarla aydınlanma şiddeti, ışık şiddeti, ışık akısı kavramları arasında ilişki kurulur.",
        "b) Işık şiddeti, ışık akısı ve aydınlanma şiddeti kavramları ile ilgili matematiksel modeller verilir. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Gölge": [
    {
      code: "10.4.2.1",
      subTopicName: "Gölge",
      description:
        "Saydam, yarı saydam ve saydam olmayan maddelerin ışık geçirme özelliklerini açıklar.",
      details: [
        "a) Öğrencilerin gölge ve yarı gölge alanlarını çizmeleri ve açıklamaları sağlanır.",
        "b) Gölge ve yarı gölge ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  "Yansıma": [
    {
      code: "10.4.3.1",
      subTopicName: "Yansıma",
      description:
        "Işığın yansımasını, su dalgalarında yansıma olayıyla ilişkilendirir.",
      details: [
        "a) Yansıma Kanunları üzerinde durulur.",
        "b) Işığın düzgün ve dağınık yansımasının çizilerek gösterilmesi sağlanır.",
        "c) Görme olayında yansımanın rolü vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Düzlem Ayna": [
    {
      code: "10.4.4.1",
      subTopicName: "Düzlem Ayna",
      description:
        "Düzlem aynada görüntü oluşumunu açıklar.",
      details: [
        "a) Düzlem aynada görüntü özellikleri yapılan çizimler üzerinden açıklanır.",
        "b) Kesişen ayna, aynanın döndürülmesi, hareketli ayna ve hareketli cisim konularına girilmez.",
        "c) Deney veya simülasyonlarla görüş alanına etki eden değişkenler ile ilgili çıkarım yapılması sağlanır. Çıkarım yapılırken saydam ve saydam olmayan engeller de dikkate alınır. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Kırılma": [
    {
      code: "10.4.6.1",
      subTopicName: "Kırılma",
      description:
        "Işığın kırılmasını, su dalgalarında kırılma olayı ile ilişkilendirir.",
      details: [
        "a) Deney veya simülasyonlar kullanılarak ortam değiştiren ışığın ilerleme doğrultusundan sapma miktarının bağlı olduğu değişkenleri belirlemeleri sağlanır. Snell Yasasının matematiksel modeli verilir.",
        "b) Kırılma indisinin, ışığın ortamdaki ortalama hızı ve boşluktaki hızı ile ilişkili bir bağıl değişken olduğu vurgulanır.",
        "c) Snell Yasası ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.4.6.2",
      subTopicName: "Tam Yansıma ve Sınır Açısı",
      description:
        "Işığın tam yansıma olayını ve sınır açısını analiz eder.",
      details: [
        "a) Öğrencilerin deney veya simülasyonlarla oluşturulan tam yansıma olayını ve sınır açısını yorumlamaları sağlanır.",
        "b) Tam yansımanın gerçekleştiği fiber optik teknolojisi, serap olayı, havuz ışıklandırması örneklerine yer verilir.",
        "c) Tam yansıma ve sınır açısı ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "10.4.6.3",
      subTopicName: "Görünür Uzaklık",
      description:
        "Farklı ortamda bulunan bir cismin görünür uzaklığını etkileyen sebepleri açıklar.",
      details: [
        "a) Öğrencilerin deney yaparak ışığın izlediği yolu çizmeleri ve günlük hayatta gözlemlenen olaylarla ilişki kurmaları sağlanır.",
        "b) Görünür uzaklıkla ilgili matematiksel model verilmez. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  "Mercekler": [
    {
      code: "10.4.7.1",
      subTopicName: "Mercek Çeşitleri",
      description:
        "Merceklerin özelliklerini ve mercek çeşitlerini açıklar.",
      details: [
        "a) Merceklerin odak uzaklığının bağlı olduğu faktörlere değinilir. Matematiksel model verilmez.",
        "b) Cam şişelerin ve cam kırıklarının mercek gibi davranarak orman yangınlarına sebep olduğu açıklanır.",
      ].join("\n"),
    },
    {
      code: "10.4.7.2",
      subTopicName: "Merceklerde Görüntü",
      description:
        "Merceklerin oluşturduğu görüntünün özelliklerini açıklar.",
      details: [
        "a) Merceklerdeki özel ışınlar verilir. Görüntü oluşumlarına dair çizimler yaptırılmaz.",
        "b) Deney veya simülasyonlar yardımıyla merceklerin oluşturduğu görüntü özelliklerinin incelenmesi sağlanır.",
        "c) Öğrencilerin merceklerin nerelerde ve ne tür amaçlar için kullanıldığına örnekler vermeleri sağlanır.",
        "ç) Mercekler ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Prizmalar": [
    {
      code: "10.4.8.1",
      subTopicName: "Işık Prizmalarının Özellikleri",
      description: "Işık prizmalarının özelliklerini açıklar.",
      details: [
        "a) Beyaz ışığın prizmadan geçirilmesiyle oluşan renk tayfı gösterilir.",
        "b) Prizma ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],
};

// =====================================================================
// SEED LOGİĞİ
// =====================================================================

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  if (!tyt) {
    console.log("TYT exam type bulunamadı, atlıyorum.");
    return;
  }

  const fizikSubject = await prisma.subject.findFirst({
    where: { name: "Fizik", examTypeId: tyt.id },
  });
  if (!fizikSubject) {
    console.log("TYT Fizik subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: fizikSubject.id },
    include: { _count: { select: { kazanimlar: true } } },
  });

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [topicName, kazanimList] of Object.entries(KAZANIMLAR)) {
    const topic = topics.find((t) => t.name === topicName);
    if (!topic) {
      console.log(`⚠️  Topic bulunamadı: "${topicName}" — atlanıyor`);
      continue;
    }

    if (topic._count.kazanimlar > 0) {
      console.log(
        `⏭️  "${topicName}" zaten ${topic._count.kazanimlar} kazanıma sahip, atlanıyor`
      );
      totalSkipped += kazanimList.length;
      continue;
    }

    for (let i = 0; i < kazanimList.length; i++) {
      const k = kazanimList[i];
      await prisma.topicKazanim.create({
        data: {
          topicId: topic.id,
          code: k.code,
          subTopicName: k.subTopicName,
          description: k.description,
          details: k.details || null,
          isKeyKazanim: k.isKeyKazanim || false,
          sortOrder: i,
        },
      });
      totalCreated++;
    }

    console.log(
      `✅ "${topicName}" → ${kazanimList.length} kazanım eklendi`
    );
  }

  console.log(
    `\n📊 Toplam: ${totalCreated} kazanım eklendi, ${totalSkipped} atlandı`
  );
}

main()
  .catch((e) => {
    console.error("seed-tyt-fizik-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
