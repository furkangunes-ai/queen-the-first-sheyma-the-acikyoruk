/**
 * TYT Biyoloji kazanimlarini OSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaogretim Biyoloji Dersi Ogretim Programi (2018)
 * 9. sinif: sayfa 208-214, 10-12. sinif: AYT ile ayni kazanimlar
 *
 * Bu script mevcut konulara kazanim ekler. Mevcut mufredati BOZMAZ.
 * Zaten kazanimi olan topic'leri atlar (idempotent).
 *
 * Calistirmak icin: npx tsx prisma/seed-tyt-biyoloji-kazanim.ts
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
// PDF'DEN CIKARILMIS KAZANIMLAR — TOPIC ADI → KAZANIM LISTESI
// =====================================================================

const KAZANIMLAR: Record<string, KazanimDef[]> = {
  // ==================== 9. SINIF KONULARI ====================

  // --- BİYOLOJİ BİLİMİ, İNORGANİK BİLEŞİKLER (9.1.1 + 9.1.2 inorganik) ---
  "Biyoloji Bilimi, İnorganik Bileşikler": [
    {
      code: "9.1.1.1",
      subTopicName: "Biyoloji ve Canlıların Ortak Özellikleri",
      description: "Canlıların ortak özelliklerini irdeler.",
      details: [
        "a) Canlı kavramı üzerinden biyolojinin günümüzdeki anlamı ile nasıl kullanıldığı kısaca belirtilir.",
        "b) Canlıların; hücresel yapı, beslenme, solunum, boşaltım, hareket, uyarılara tepki, metabolizma, homeostazi, uyum, organizasyon, üreme, büyüme ve gelişme özellikleri vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.2.1a",
      subTopicName: "İnorganik Bileşikler",
      description:
        "Canlıların yapısını oluşturan inorganik bileşikleri açıklar.",
      details: [
        "a) Su, mineraller, asitler, bazlar ve tuzların canlılar için önemi belirtilir.",
        "b) Kalsiyum, potasyum, demir, iyot, flor, magnezyum, sodyum, fosfor, klor, kükürt, çinko minerallerinin canlılar için önemi vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // --- ORGANİK BİLEŞİKLER (9.1.2 organik kısım) ---
  "Organik Bileşikler": [
    {
      code: "9.1.2.1b",
      subTopicName: "Organik Bileşikler",
      description:
        "Canlıların yapısını oluşturan organik bileşikleri açıklar.",
      details: [
        "a) Karbonhidratların, lipitlerin, proteinlerin, nükleik asitlerin, enzimlerin yapısı, görevi ve canlılar için önemi belirtilir.",
        "b) ATP'nin ve hormonların kimyasal formüllerine yer verilmeden canlılar için önemi sorgulanır.",
        "c) Vitaminlerin genel özellikleri verilir. A, D, E, K, B ve C vitaminlerinin görevleri ve canlılar için önemi belirtilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.2.2",
      subTopicName: "Sağlıklı Beslenme",
      description:
        "Lipit, karbonhidrat, protein, vitamin, su ve minerallerin sağlıklı beslenme ile ilişkisini kurar.",
      details: [
        "a) İnsülin direnci, diyabet ve obeziteye sağlıklı beslenme bağlamında değinilir.",
        "b) Öğrencilerin kendi yaş grubu için bir haftalık sağlıklı beslenme programı hazırlamaları sağlanır.",
      ].join("\n"),
    },
  ],

  // --- HÜCRE (9.2.1) ---
  Hücre: [
    {
      code: "9.2.1.1",
      subTopicName: "Hücre Teorisi",
      description: "Hücre teorisine ilişkin çalışmaları açıklar.",
      details: [
        "a) Hücreye ilişkin bilgilere tarihsel süreç içerisinde katkı sağlayan bilim insanlarına (Robert Hooke, Antonie van Leeuwenhoek, Matthias Schleiden, Theodor Schwann ve Rudolf Virchow) örnekler verilir.",
        "b) Mikroskop çeşitleri ve ileri görüntüleme teknolojilerinin kullanmasının hücre teorisine katkıları araştırılır.",
      ].join("\n"),
    },
    {
      code: "9.2.1.2",
      subTopicName: "Hücresel Yapılar",
      description: "Hücresel yapıları ve görevlerini açıklar.",
      details: [
        "a) Prokaryot hücrelerin kısımları gösterilir.",
        "b) Ökaryot hücrelerin yapısı ve bu yapıyı oluşturan kısımlar gösterilir.",
        "c) Organellerin hücrede aldıkları görevler bakımından incelenmesi sağlanır.",
        "ç) Hücre örneklerinin mikroskop ile incelenmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // --- MADDE GEÇİŞLERİ (9.2.1.3) ---
  "Madde Geçişleri": [
    {
      code: "9.2.1.3",
      subTopicName: "Hücre Zarından Madde Geçişi",
      description:
        "Hücre zarından madde geçişine ilişkin kontrollü bir deney yapar.",
      details: [
        "a) Hücre zarından madde geçişine ilişkin deney öncesi bilimsel yöntem basamakları bir örnekle açıklanır.",
        "b) Biyoloji laboratuvarında kullanılan temel araç gereçler tanıtılarak laboratuvar güvenliği vurgulanır.",
        "c) Hücre zarından madde geçişini etkileyen faktörlerden (yüzey alanı, konsantrasyon farkı, sıcaklık) biri hakkında kontrollü deney yaptırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // --- DNA-RNA (9.1.2 + 12.1.1) ---
  "DNA-RNA": [
    {
      code: "9.1.2.1c",
      subTopicName: "Nükleik Asitler (Temel)",
      description:
        "DNA'nın tüm canlı türlerinde bulunduğunu ve aynı nükleotitleri içerdiğini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.1.1",
      subTopicName: "Nükleik Asitlerin Keşfi",
      description: "Nükleik asitlerin keşif sürecini özetler.",
      details:
        "Rosalind Franklin, James Watson, Francis Crick çalışmaları kısaca açıklanır ancak bu isimlerin ezberlenmesi ve kronolojik sırasının bilinmesi beklenmez.",
    },
    {
      code: "12.1.1.2",
      subTopicName: "Nükleik Asitlerin Görevleri",
      description:
        "Nükleik asitlerin çeşitlerini ve görevlerini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.1.3",
      subTopicName: "Genetik Materyal Organizasyonu",
      description:
        "Hücredeki genetik materyalin organizasyonunda parça bütün ilişkisi kurar.",
      details: [
        "a) Nükleotitten DNA ve kromozoma genetik materyal organizasyonunun modellenmesi sağlanır.",
        "b) Gen ve DNA ilişkisi üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.1.1.4",
      subTopicName: "DNA Replikasyonu",
      description: "DNA'nın kendini eşlemesini açıklar.",
      details: [
        "a) Helikaz, DNA polimeraz ve DNA ligaz dışındaki enzimler verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // --- PROTEİN SENTEZİ (12.1.2) ---
  "Protein Sentezi": [
    {
      code: "12.1.2.1",
      subTopicName: "Protein Sentezi",
      description: "Protein sentezinin mekanizmasını açıklar.",
      details: [
        "a) Genetik şifre ve protein sentezi arasındaki ilişki üzerinde durulur.",
        "b) Protein sentezi açıklanırken görsel ögeler, grafik düzenleyiciler, e-öğrenme nesnesi ve uygulamalarından yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // --- ENZİMLER (9.1.2) ---
  Enzimler: [
    {
      code: "9.1.2.1d",
      subTopicName: "Enzimler",
      description:
        "Enzimlerin yapısı, görevi ve canlılar için önemini açıklar.",
      details: [
        "a) Enzimlerin yapısı ve görevi belirtilir.",
        "b) Enzim aktivitesine etki eden faktörlerle ilgili deneyler yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // --- CANLILAR SINIFLANDIRMASI (9.3.1 + 9.3.2) ---
  "Canlıların Sınıflandırılması": [
    {
      code: "9.3.1.1",
      subTopicName: "Sınıflandırmanın Önemi",
      description:
        "Canlıların çeşitliliğinin anlaşılmasında sınıflandırmanın önemini açıklar.",
      details: [
        "a) Canlıların sınıflandırılmasında bilim insanlarının kullandığı farklı ölçüt ve yaklaşımlar tartışılır.",
        "b) Canlı çeşitliliğindeki değişimler nesli tükenmiş canlılar örneği üzerinden tartışılır.",
      ].join("\n"),
    },
    {
      code: "9.3.1.2",
      subTopicName: "Sınıflandırma Kategorileri",
      description:
        "Canlıların sınıflandırılmasında kullanılan kategorileri ve bu kategoriler arasındaki hiyerarşiyi örneklerle açıklar.",
      details: [
        "a) Canlıların sınıflandırılmasında sadece tür, cins, aile, takım, sınıf, şube ve âlem kategorilerinin genel özelliklerine değinilir.",
        "b) Carolus Linnaeus'un sınıflandırmayla ilgili çalışmalarına değinilir.",
        "c) Hiyerarşik kategoriler dikkate alınarak çevreden seçilecek canlı türleriyle ilgili ikili adlandırma örnekleri verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.2.1",
      subTopicName: "Canlı Âlemleri",
      description:
        "Canlıların sınıflandırılmasında kullanılan âlemleri ve bu âlemlerin genel özelliklerini açıklar.",
      details: [
        "a) Bakteriler, arkeler, protistler, bitkiler, mantarlar, hayvanlar âlemlerinin genel özellikleri açıklanarak örnekler verilir.",
        "b) Hayvanlar âleminin; omurgasız hayvanlar ve omurgalı hayvanlar şubelerinin, sınıflarına ait genel özellikler belirtilerek örnekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.2.2",
      subTopicName: "Biyolojik Süreçlere Katkılar",
      description:
        "Canlıların biyolojik süreçlere, ekonomiye ve teknolojiye katkılarını örneklerle açıklar.",
      details:
        "Canlılardan esinlenilerek geliştirilen teknolojilere örnekler verilir.",
    },
    {
      code: "9.3.2.3",
      subTopicName: "Virüsler",
      description: "Virüslerin genel özelliklerini açıklar.",
      details: [
        "a) Virüslerin biyolojik sınıflandırma kategorileri içine alınmamasının nedenleri üzerinde durulur.",
        "b) Virüslerin insan sağlığı üzerine etkilerinin kuduz, hepatit, grip, uçuk ve AIDS hastalıkları üzerinden tartışılması sağlanır.",
        "c) Virüslerin genetik mühendisliği alanında yapılan çalışmalar için yeni imkânlar sunduğu vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // --- EKOLOJİ (10.3.1 + 10.3.2 + 10.3.3) ---
  Ekoloji: [
    {
      code: "10.3.1.1",
      subTopicName: "Ekosistem Ekolojisi",
      description:
        "Ekosistemin canlı ve cansız bileşenleri arasındaki ilişkiyi açıklar.",
      details: [
        "a) Popülasyon, komünite ve ekosistem arasındaki ilişki örneklerle açıklanır.",
        "b) Ekosistemde oluşabilecek herhangi bir değişikliğin sistemdeki olası sonuçları üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.1.2",
      subTopicName: "Beslenme İlişkileri",
      description:
        "Canlılardaki beslenme şekillerini örneklerle açıklar.",
      details: "Simbiyotik yaşama girilmez.",
    },
    {
      code: "10.3.1.3",
      subTopicName: "Madde ve Enerji Akışı",
      description: "Ekosistemde madde ve enerji akışını analiz eder.",
      details: [
        "a) Madde ve enerji akışında üretici, tüketici ve ayrıştırıcıların rolünün incelenmesi sağlanır.",
        "b) Ekosistemlerde madde ve enerji akışı; besin zinciri, besin ağı ve besin piramidi ile ilişkilendirilerek örneklendirilir.",
        "c) Biyolojik birikimin insan sağlığı ve diğer canlılar üzerine olumsuz etkilerinin araştırılması ve tartışılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.1.4",
      subTopicName: "Madde Döngüleri",
      description:
        "Madde döngüleri ve hayatın sürdürülebilirliği arasında ilişki kurar.",
      details: [
        "a) Azot, karbon ve su döngüleri hatırlatılır.",
        "b) Azot döngüsünde yer alan mikroorganizmaların tür isimleri verilmez.",
      ].join("\n"),
    },
    {
      code: "10.3.2.1",
      subTopicName: "Güncel Çevre Sorunları",
      description:
        "Güncel çevre sorunlarının sebeplerini ve olası sonuçlarını değerlendirir.",
      details: [
        "a) Güncel çevre sorunları (biyolojik çeşitliliğin azalması, hava kirliliği, su kirliliği, toprak kirliliği, radyoaktif kirlilik, ses kirliliği, küresel iklim değişikliği, erozyon, doğal hayat alanlarının tahribi ve orman yangınları) özetlenerek bu sorunların canlılar üzerindeki olumsuz etkileri belirtilir.",
        "b) Çevre sorunları nedeniyle ortaya çıkan hastalıklara vurgu yapılır.",
      ].join("\n"),
    },
    {
      code: "10.3.3.2",
      subTopicName: "Biyolojik Çeşitlilik",
      description:
        "Biyolojik çeşitliliğin yaşam için önemini sorgular.",
      details: [
        "a) Türkiye'nin biyolojik çeşitlilik açısından zengin olmasını sağlayan faktörlerin tartışılması sağlanır.",
        "b) Endemik türlerin biyolojik çeşitlilik açısından değeri ve önemi üzerinde durularak sağlık ve ekonomiye katkılarına ilişkin örneklere yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== 10-12. SINIF KONULARI (AYT ile aynı) ====================

  "Hücre Bölünmeleri": [
    {
      code: "10.1.1.1",
      subTopicName: "Mitoz ve Eşeysiz Üreme",
      description:
        "Canlılarda hücre bölünmesinin gerekliliğini açıklar.",
      details: [
        "a) Hücre bölünmesinin canlılarda üreme, büyüme ve gelişme ile ilişkilendirilerek açıklanması sağlanır.",
        "b) Bölünmenin hücresel gerekçeleri üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "10.1.1.2",
      subTopicName: "Mitoz",
      description: "Mitozu açıklar.",
      details: [
        "a) İnterfaz temel düzeyde işlenir.",
        "b) Mitozun evreleri temel düzeyde işlenir.",
        "c) Hücre bölünmesinin kontrolü ve bunun canlılar için önemi üzerinde durulur.",
        "ç) Hücre bölünmesinin kanserle ilişkisi kurulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2.1",
      subTopicName: "Mayoz",
      description: "Mayozu açıklar.",
      details: "a) Mayozun evreleri temel düzeyde işlenir.",
      isKeyKazanim: true,
    },
  ],

  "Eşeysiz-Eşeyli Üreme": [
    {
      code: "10.1.1.3",
      subTopicName: "Eşeysiz Üreme",
      description: "Eşeysiz üremeyi örneklerle açıklar.",
      details: [
        "a) Eşeysiz üreme bağlamında bölünerek üreme, tomurcuklanma, sporla üreme, rejenerasyon, partenogenez ve bitkilerde vejetatif üreme örnekleri verilir.",
        "b) Eşeysiz üreme tekniklerinin bahçecilik ve tarım sektörlerindeki uygulamaları örneklendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2.2",
      subTopicName: "Eşeyli Üreme",
      description: "Eşeyli üremeyi örneklerle açıklar.",
      details: [
        "a) Dış döllenme ve iç döllenme konusu verilmez.",
        "b) Eşeyli üremenin temelinin mayoz ve döllenme olduğu açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "İnsanda Üreme ve Gelişme": [
    {
      code: "11.1.7.1",
      subTopicName: "Üreme Sistemi",
      description:
        "Üreme sisteminin yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Dişi ve erkek üreme sisteminin yapısı işlenirken görsel ögeler, grafik düzenleyiciler, e-öğrenme nesnesi ve uygulamalarından yararlanılır.",
        "b) Menstrual döngüyü düzenleyen hormonlarla ilgili grafiklere yer verilir.",
        "c) In vitro fertilizasyon yöntemleri kısaca açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.7.2",
      subTopicName: "Üreme Sistemi Sağlığı",
      description:
        "Üreme sisteminin sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
    },
    {
      code: "11.1.7.3",
      subTopicName: "Embriyonik Gelişim",
      description: "İnsanda embriyonik gelişim sürecini açıklar.",
      details: [
        "a) Embriyonik tabakalardan meydana gelen organlar verilmez.",
        "b) Hamilelikte bebeğin gelişimini olumsuz etkileyen faktörler belirtilir.",
        "c) Hamileliğin izlenmesinin bebeğin ve annenin sağlığı açısından önemi vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Mendel Genetiği": [
    {
      code: "10.2.1.1a",
      subTopicName: "Kalıtımın Genel Esasları",
      description: "Kalıtımın genel esaslarını açıklar.",
      details: [
        "a) Mendel ilkeleri örneklerle açıklanır.",
        "b) Monohibrit, dihibrit ve kontrol çaprazlamaları, eş baskınlık, çok alellilik örnekler üzerinden işlenir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Kan Grupları": [
    {
      code: "10.2.1.1b",
      subTopicName: "Kan Gruplarının Kalıtımı",
      description:
        "Kan gruplarının kalıtımını çok alellilik ile ilişkilendirerek açıklar.",
      isKeyKazanim: true,
    },
  ],

  "Cinsiyete Bağlı Kalıtım": [
    {
      code: "10.2.1.1c",
      subTopicName: "Eşeye Bağlı Kalıtım",
      description: "Eşeye bağlı kalıtımı örneklerle açıklar.",
      details: [
        "a) Hemofili ve kısmi renk körlüğü hastalıkları bağlamında ele alınır.",
        "b) Eşeye bağlı kalıtımın Y kromozomunda da görüldüğü belirtilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.1.1d",
      subTopicName: "Soyağacı Analizi",
      description: "Soyağacı örneklerle açıklanır.",
      isKeyKazanim: true,
    },
    {
      code: "10.2.1.1e",
      subTopicName: "Kalıtsal Hastalıklar",
      description:
        "Kalıtsal hastalıkların ortaya çıkma olasılığının akraba evlilikleri sonucunda arttığı vurgusu yapılır.",
    },
    {
      code: "10.2.1.2",
      subTopicName: "Genetik Varyasyonlar",
      description:
        "Genetik varyasyonların biyolojik çeşitliliği açıklamadaki rolünü sorgular.",
      details: [
        "a) Varyasyonların kaynaklarının (mutasyon, kromozomların bağımsız dağılımı ve krossing over) tartışılması sağlanır.",
        "b) Biyolojik çeşitliliğin canlıların genotiplerindeki farklılıklardan kaynaklandığı açıklanır.",
      ].join("\n"),
    },
  ],

  // NOT: DB'de "Biyoteknoloji Evrim" (ve yok), AYT'de "Biyoteknoloji ve Evrim"
  "Biyoteknoloji Evrim": [
    {
      code: "12.1.1.2",
      subTopicName: "Nükleik Asitlerin Görevleri",
      description:
        "Nükleik asitlerin çeşitlerini ve görevlerini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.2.2",
      subTopicName: "Genetik Mühendisliği ve Biyoteknoloji",
      description:
        "Genetik mühendisliği ve biyoteknoloji kavramlarını açıklar.",
    },
    {
      code: "12.1.2.3",
      subTopicName: "Biyoteknoloji Uygulamaları",
      description:
        "Genetik mühendisliği ve biyoteknoloji uygulamalarını açıklar.",
      details: [
        "a) Gen teknolojileri, DNA parmak izi analizi, kök hücre teknolojilerinin ve bunların kullanım alanlarının araştırılması sağlanır.",
        "b) Model organizmaların özellikleri tartışılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.1.2.4",
      subTopicName: "Biyoteknolojinin İnsan Hayatına Etkisi",
      description:
        "Genetik mühendisliği ve biyoteknoloji uygulamalarının insan hayatına etkisini değerlendirir.",
      details: [
        "a) Aşı, antibiyotik, insülin, interferon üretimi, kanser tedavisi ve gen terapisi uygulamaları kısaca açıklanır.",
        "b) Klonlama çalışmalarının olası sonuçları belirtilir.",
        "c) Biyogüvenlik ve biyoetik konularının tartışılması sağlanır.",
      ].join("\n"),
    },
    {
      code: "12.4.1.1",
      subTopicName: "Evrim ve Doğal Seçilim",
      description:
        "Çevre şartlarının genetik değişimlerin sürekliliğine olan etkisini açıklar.",
      details: [
        "a) Varyasyon, adaptasyon, mutasyon, doğal ve yapay seçilim kavramları vurgulanır.",
        "b) Bakterilerin antibiyotiklere karşı direnç geliştirmesinin nedenleri vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.4.1.2",
      subTopicName: "Yapay Seçilim",
      description:
        "Tarım ve hayvancılıkta yapay seçilim uygulamalarına örnekler verir.",
    },
  ],

  Solunum: [
    {
      code: "12.2.4.1",
      subTopicName: "Hücresel Solunum",
      description: "Hücresel solunumu açıklar.",
      details: [
        "a) Oksijenli solunum; glikoliz, krebs döngüsü ve ETS-oksidatif fosforilasyon olarak verilir.",
        "b) Tepkimelerdeki NADH, FADH₂, ATP üretim ve tüketimi matematiksel hesaplamalara girilmeden verilir.",
        "c) Tüm canlılarda glikozun çeşitli tepkimeler zinciri ile pirüvik asite parçalandığı vurgulanır.",
        "ç) Etil alkol-laktik asit fermantasyonu açıklanarak günlük hayattan örnekler verilir.",
        "d) Oksijensiz solunumda, elektronun oksijen dışında bir moleküle aktarıldığı belirtilir.",
        "e) Oksijenli solunumda fermantasyona göre enerji verimliliğinin daha fazla olmasının nedenleri üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.2.4.2",
      subTopicName: "Oksijenli Solunum Deneyi",
      description:
        "Oksijenli solunumda reaksiyona girenler ve reaksiyon sonunda açığa çıkan son ürünlere ilişkin deney yapar.",
    },
    {
      code: "12.2.4.3",
      subTopicName: "Fotosentez ve Solunum İlişkisi",
      description:
        "Fotosentez ve solunum ilişkisi ile ilgili çıkarımlarda bulunur.",
      details: [
        "a) Fotosentez ve solunumun doğadaki madde ve enerji dengesinin sağlanmasındaki önemi vurgulanır.",
        "b) Fotosentez ve oksijenli solunumda enerji üretim mekanizması ile ilgili kemiosmotik görüş şema üzerinde verilerek kısaca tanıtılır.",
      ].join("\n"),
    },
  ],

  Fotosentez: [
    {
      code: "12.2.2.1",
      subTopicName: "Fotosentezin Önemi",
      description:
        "Fotosentezin canlılar açısından önemini sorgular.",
    },
    {
      code: "12.2.2.2",
      subTopicName: "Fotosentez Süreci",
      description: "Fotosentez sürecini şema üzerinde açıklar.",
      details: [
        "a) Klorofil a ve klorofil b'nin yapısı verilmez.",
        "b) Suyun fotolizi belirtilir.",
        "c) Işığa bağımlı ve ışıktan bağımsız reaksiyonlar, ürün açısından karşılaştırılır.",
        "ç) CAM ve C4 bitkileri verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.2.2.3",
      subTopicName: "Fotosentez Hızını Etkileyen Faktörler",
      description:
        "Fotosentez hızını etkileyen faktörleri değerlendirir.",
      details: [
        "a) Fotosentez hızını etkileyen faktörlerden ışık şiddeti, ışığın dalga boyu, sıcaklık, klorofil miktarı ve karbondioksit yoğunluğu verilir.",
        "b) Fotosentez hızını etkileyen faktörlerle ilgili kontrollü deney yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  Kemosentez: [
    {
      code: "12.2.3.1",
      subTopicName: "Kemosentez",
      description: "Kemosentez olayını açıklar.",
      details: [
        "a) Kemosentez yapan canlılara örnekler verilir.",
        "b) Kemosentezin madde döngüsüne katkıları ve endüstriyel alanlarda kullanımı özetlenir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Bitki Biyolojisi": [
    {
      code: "12.3.1.1",
      subTopicName: "Bitkilerin Yapısı",
      description:
        "Çiçekli bir bitkinin temel kısımlarının yapı ve görevlerini açıklar.",
      details: [
        "a) Kök, gövde, yaprak kesitlerinde başlıca dokuların incelenmesi sağlanır ve bunların görevleri açıklanır.",
        "b) Uç ve yanal meristemlerin büyümedeki rolü vurgulanarak yaş halkaları ile bağlantı kurulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.3.1.2",
      subTopicName: "Bitki Hormonları",
      description:
        "Bitki gelişiminde hormonların etkisini örneklerle açıklar.",
    },
    {
      code: "12.3.2.1",
      subTopicName: "Su ve Mineral Emilimi",
      description: "Köklerde su ve mineral emilimini açıklar.",
      details: [
        "a) Su ve minerallerin bitkiler için önemi vurgulanır.",
        "b) Minerallerin topraktan alınması, nodül ve mikoriza oluşumu üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.3.2.2",
      subTopicName: "Su ve Mineral Taşınması",
      description:
        "Bitkilerde su ve mineral taşınma mekanizmasını açıklar.",
      details: [
        "a) Suyun taşınmasında kohezyon gerilim teorisi, kök basıncı, adhezyon ve gutasyon olayları açıklanır.",
        "b) Suyun taşınmasında stomaların rolüne değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.3.3.1",
      subTopicName: "Çiçeğin Yapısı",
      description:
        "Çiçeğin kısımlarını ve bu kısımların görevlerini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "12.3.3.2",
      subTopicName: "Döllenme, Tohum ve Meyve",
      description:
        "Çiçekli bitkilerde döllenmeyi, tohum ve meyvenin oluşumunu açıklar.",
      isKeyKazanim: true,
    },
  ],

  Sistemler: [
    {
      code: "11.1.1.1",
      subTopicName: "Sinir Sistemi",
      description:
        "Sinir sisteminin yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Sinir doku belirtilir.",
        "b) İmpuls iletiminin elektriksel ve kimyasal olduğu vurgulanır.",
        "c) Sinir Sistemi merkezî ve çevresel sinir sistemi olarak verilir.",
        "ç) Çevresel sinir sisteminde, somatik ve otonom sinir sisteminin genel özellikleri verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.1.2",
      subTopicName: "Endokrin Sistem",
      description:
        "Endokrin bezleri ve bu bezlerin salgıladıkları hormonları açıklar.",
      details: [
        "a) Hormonların yapısına girilmez.",
        "b) Homeostasi örnekleri (vücut sıcaklığının, kandaki kalsiyum ve glikoz oranının düzenlenmesi) açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.2.1",
      subTopicName: "Destek ve Hareket Sistemi",
      description:
        "Destek ve hareket sisteminin yapı, görev ve işleyişini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.3.1",
      subTopicName: "Sindirim Sistemi",
      description:
        "Sindirim sisteminin yapı, görev ve işleyişini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.4.1",
      subTopicName: "Dolaşım Sistemi",
      description:
        "Kalp, kan ve damarların yapı, görev ve işleyişini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.4.5",
      subTopicName: "Bağışıklık",
      description:
        "Bağışıklık çeşitlerini ve vücudun doğal savunma mekanizmalarını açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.5.1",
      subTopicName: "Solunum Sistemi",
      description:
        "Solunum sisteminin yapı, görev ve işleyişini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.6.1",
      subTopicName: "Üriner Sistem",
      description: "Üriner sistemin yapı, görev ve işleyişini açıklar.",
      isKeyKazanim: true,
    },
  ],

  "Duyu Organları": [
    {
      code: "11.1.1.5",
      subTopicName: "Duyu Organlarının Yapısı",
      description:
        "Duyu organlarının yapısını ve işleyişini açıklar.",
      details: [
        "a) Dokunma duyusu olan deri verilirken epitel ve temel bağ doku kısaca açıklanır.",
        "b) Duyu organlarının yapısı şema üzerinde gösterilerek açıklanır.",
        "c) Göz küresi bölümleri sert tabaka, damar tabaka, ağ tabaka olarak verilir.",
        "ç) Kulak bölümleri dış kulak, orta kulak ve iç kulak olarak verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.1.6",
      subTopicName: "Duyu Organları Rahatsızlıkları",
      description: "Duyu organları rahatsızlıklarını açıklar.",
      details:
        "Renk körlüğü, miyopi, hipermetropi, astigmatizm, işitme kaybı ve denge kaybı gibi rahatsızlıkların araştırılıp sunulması sağlanır.",
    },
    {
      code: "11.1.1.7",
      subTopicName: "Duyu Organları Sağlığı",
      description:
        "Duyu organlarının sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
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

  const biyoSubject = await prisma.subject.findFirst({
    where: { name: "Biyoloji", examTypeId: tyt.id },
  });
  if (!biyoSubject) {
    console.log("TYT Biyoloji subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: biyoSubject.id },
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
    console.error("seed-tyt-biyoloji-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
