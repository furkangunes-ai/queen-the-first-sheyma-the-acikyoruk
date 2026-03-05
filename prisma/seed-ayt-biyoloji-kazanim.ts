/**
 * AYT Biyoloji kazanimlarini OSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaogretim Biyoloji Dersi Ogretim Programi (2018), sayfa 211-225
 *
 * Bu script mevcut konulara kazanim ekler. Mevcut mufredati BOZMAZ.
 * Zaten kazanimi olan topic'leri atlar (idempotent).
 *
 * Calistirmak icin: npx tsx prisma/seed-ayt-biyoloji-kazanim.ts
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
  // ==================== HUCRE BOLUNMELERI (10.1.1 + 10.1.2) ====================
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
        "c) Hücre bölünmesinin kontrolü ve bunun canlılar için önemi üzerinde durulur. Hücre bölünmesini kontrol eden moleküllerin isimleri verilmez.",
        "ç) Hücre bölünmesinin kanserle ilişkisi kurulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2.1",
      subTopicName: "Mayoz",
      description: "Mayozu açıklar.",
      details: [
        "a) Mayozun evreleri temel düzeyde işlenir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ESEYSIZ-ESEYLI UREME (10.1.1 + 10.1.2) ====================
  "Eşeysiz-Eşeyli Üreme": [
    {
      code: "10.1.1.3",
      subTopicName: "Eşeysiz Üreme",
      description: "Eşeysiz üremeyi örneklerle açıklar.",
      details: [
        "a) Eşeysiz üreme bağlamında bölünerek üreme, tomurcuklanma, sporla üreme, rejenerasyon, partenogenez ve bitkilerde vejetatif üreme örnekleri verilir. Sporla üremede sadece örnek verilir, döl almaşına girilmez.",
        "b) Eşeysiz üreme tekniklerinin bahçecilik ve tarım sektörlerindeki uygulamaları (çelikle ve soğanla üreme şekilleri) örneklendirilir.",
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

  // ==================== MENDEL GENETİĞİ (10.2.1) ====================
  "Mendel Genetiği": [
    {
      code: "10.2.1.1a",
      subTopicName: "Kalıtımın Genel Esasları",
      description: "Kalıtımın genel esaslarını açıklar.",
      details: [
        "a) Mendel ilkeleri örneklerle açıklanır.",
        "b) Monohibrit, dihibrit ve kontrol çaprazlamaları, eş baskınlık, çok alellilik örnekler üzerinden işlenir. Eksik baskınlık ve pleiotropizme girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KAN GRUPLARI (10.2.1) ====================
  "Kan Grupları": [
    {
      code: "10.2.1.1b",
      subTopicName: "Kan Gruplarının Kalıtımı",
      description:
        "Kan gruplarının kalıtımını çok alellilik ile ilişkilendirerek açıklar.",
      details:
        "Kan gruplarıyla ilişkilendirilerek çok alellilik örnekler üzerinden işlenir.",
      isKeyKazanim: true,
    },
  ],

  // ==================== CİNSİYETE BAĞLI KALITIM (10.2.1) ====================
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
        "a) Varyasyonların kaynaklarının (mutasyon, kromozomların bağımsız dağılımı ve krossing over) tartışılması sağlanır. Mutasyon çeşitlerine girilmez.",
        "b) Biyolojik çeşitliliğin canlıların genotiplerindeki farklılıklardan kaynaklandığı açıklanır.",
      ].join("\n"),
    },
  ],

  // ==================== SİSTEMLER (11.1.1–11.1.6) ====================
  Sistemler: [
    // --- 11.1.1 Sinir Sistemi (Duyu Organları hariç) ---
    {
      code: "11.1.1.1",
      subTopicName: "Sinir Sistemi",
      description:
        "Sinir sisteminin yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Sinir doku belirtilir. Yapılarına göre nöron çeşitlerine girilmez.",
        "b) İmpuls iletiminin elektriksel ve kimyasal olduğu vurgulanır.",
        "c) Sinir Sistemi merkezî ve çevresel sinir sistemi olarak verilir. Merkezî sinir sisteminin bölümlerinden beyin için; ön beyin (uç ve ara beyin), orta beyin ve arka beynin (pons, omurilik soğanı, beyincik) görevleri kısaca açıklanarak beynin alt yapı ve görevlerine girilmez. Omuriliğin görevleri ile refleks yayı açıklanır ve refleks insan yaşamı için önemi vurgulanır.",
        "ç) Çevresel sinir sisteminde, somatik ve otonom sinir sisteminin genel özellikleri verilir. Sempatik ve parasempatik sinirler ayrımına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.1.2",
      subTopicName: "Endokrin Sistem",
      description:
        "Endokrin bezleri ve bu bezlerin salgıladıkları hormonları açıklar.",
      details: [
        "a) Endokrin bezleri ve bu bezlerin salgıladıkları hormonlar işlenirken görsel ögeler, grafik düzenleyiciler, e-öğrenme nesnesi ve uygulamalarından yararlanılır.",
        "b) Hormonların yapısına girilmez.",
        "c) Homeostasi örnekleri (vücut sıcaklığının, kandaki kalsiyum ve glikoz oranının düzenlenmesi) açıklanır.",
        "ç) Hormonların yaşam kalitesi üzerine etkilerinin örnek bir hastalık üzerinden tartışılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.1.3",
      subTopicName: "Sinir Sistemi Rahatsızlıkları",
      description: "Sinir sistemi rahatsızlıklarına örnekler verir.",
      details: [
        "a) Multipl skleroz (MS), Parkinson, Alzheimer, epilepsi (sara), depresyon üzerinde durulur.",
        "b) Sinir sistemi rahatsızlıklarının tedavisiyle ilgili teknolojik gelişmelerin araştırılması sağlanır.",
      ].join("\n"),
    },
    {
      code: "11.1.1.4",
      subTopicName: "Sinir Sistemi Sağlığı",
      description:
        "Sinir sisteminin sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
    },
    // --- 11.1.2 Destek ve Hareket Sistemi ---
    {
      code: "11.1.2.1",
      subTopicName: "Destek ve Hareket Sistemi",
      description:
        "Destek ve hareket sisteminin yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Kemik, kıkırdak ve kas doku açıklanır.",
        "b) Kemik ve kas çeşitleri açıklanır.",
        "c) Kıkırdak ve eklem çeşitleri ile vücutta bulunduğu yerlere örnekler verilir. Yapılarına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.2.2",
      subTopicName: "Destek ve Hareket Sistemi Rahatsızlıkları",
      description:
        "Destek ve hareket sistemi rahatsızlıklarını açıklar.",
      details:
        "Kırık, çıkık, burkulma, menisküs ve eklem rahatsızlıklarının araştırılması ve paylaşılması sağlanır.",
    },
    {
      code: "11.1.2.3",
      subTopicName: "Destek ve Hareket Sistemi Sağlığı",
      description:
        "Destek ve hareket sisteminin sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
      details:
        "Destek ve hareket sistemi sağlığı açısından sporun, beslenmenin ve uygun duruşun önemi tartışılır.",
    },
    // --- 11.1.3 Sindirim Sistemi ---
    {
      code: "11.1.3.1",
      subTopicName: "Sindirim Sistemi",
      description:
        "Sindirim sisteminin yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Sindirim sisteminin yapısı işlenirken görsel ögeler, grafik düzenleyiciler, e-öğrenme nesnesi ve uygulamalarından yararlanılır.",
        "b) Sindirime yardımcı yapı ve organların (karaciğer, pankreas ve tükürük bezleri) görevleri üzerinde durulur. Yapılarına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.3.2",
      subTopicName: "Sindirim Sistemi Rahatsızlıkları",
      description: "Sindirim sistemi rahatsızlıklarını açıklar.",
      details:
        "Reflü, gastrit, ülser, hemoroit, kabızlık, ishal örnekleri verilir.",
    },
    {
      code: "11.1.3.3",
      subTopicName: "Sindirim Sistemi Sağlığı",
      description:
        "Sindirim sisteminin sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
      details: [
        "a) Fiziksel etkinliklerin sindirim sisteminin sağlığına olumlu etkisi belirtilir.",
        "b) Tüketilen besinlerin temizliği, lif açısından zengin gıdalarla doğal beslenmenin önemi vurgulanır.",
        "c) Asitli içecekler tüketilmesinin ve fast-food beslenmenin sindirim sistemi üzerindeki etkilerinin tartışılması sağlanır.",
        "ç) Antibiyotik kullanımının bağırsak florasına etkileri ve bilinçsiz antibiyotik kullanımının zararları belirtilir.",
      ].join("\n"),
    },
    // --- 11.1.4 Dolaşım Sistemleri ---
    {
      code: "11.1.4.1",
      subTopicName: "Dolaşım Sistemi",
      description:
        "Kalp, kan ve damarların yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Kan doku açıklanır.",
        "b) Kalbin çalışmasına etki eden faktörler (adrenalin, tiroksin, kafein, tein, asetilkolin, vagus siniri) üzerinde durulur.",
        "c) Alyuvar, akyuvar ve kan pulcukları üzerinde durulur. Akyuvar çeşitleri B ve T lenfositleri ile sınırlandırılır.",
        "ç) Kan grupları üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.4.2",
      subTopicName: "Lenf Dolaşımı",
      description: "Lenf dolaşımını açıklar.",
      details: [
        "a) Lenf dolaşımı kan dolaşımı ile ilişkilendirilerek ele alınır.",
        "b) Ödem oluşumu üzerinde durulur.",
        "c) Lenf dolaşımının bağışıklık ile ilişkisi açıklanır.",
      ].join("\n"),
    },
    {
      code: "11.1.4.3",
      subTopicName: "Dolaşım Sistemi Rahatsızlıkları",
      description: "Dolaşım sistemi rahatsızlıklarını açıklar.",
      details:
        "Kalp krizi, damar tıkanıklığı, yüksek tansiyon, varis, kangren, anemi ve lösemi hastalıkları üzerinde durulur.",
    },
    {
      code: "11.1.4.4",
      subTopicName: "Dolaşım Sistemi Sağlığı",
      description:
        "Dolaşım sisteminin sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
    },
    {
      code: "11.1.4.5",
      subTopicName: "Bağışıklık",
      description:
        "Bağışıklık çeşitlerini ve vücudun doğal savunma mekanizmalarını açıklar.",
      details: [
        "a) Hastalık yapan organizmalar ve yabancı maddelere karşı deri, tükürük, mide öz suyu, mukus ve gözyaşının vücut savunmasındaki rolleri örneklendirilir.",
        "b) Enfeksiyon ve alerji gibi durumların bağışıklık ile ilişkisi örnekler üzerinden açıklanır.",
        "c) İmmünoglobulinler verilmez.",
        "ç) Aşılanmanın önemi üzerinde durulur.",
        "d) Hastalık yapan organizmaların genetik yapılarının hızlı değişimi nedeniyle insan sağlığına sürekli bir tehdit oluşturduğu vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // --- 11.1.5 Solunum Sistemi ---
    {
      code: "11.1.5.1",
      subTopicName: "Solunum Sistemi",
      description:
        "Solunum sisteminin yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Solunum sisteminin yapısı işlenirken görsel ögeler, grafik düzenleyiciler, e-öğrenme nesnesi ve uygulamalarından yararlanılır.",
        "b) Soluk alıp verme mekanizması üzerinde açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.5.2",
      subTopicName: "Gaz Taşınması",
      description:
        "Alveollerden dokulara ve dokulardan alveollere gaz taşınmasını açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.5.3",
      subTopicName: "Solunum Sistemi Hastalıkları",
      description: "Solunum sistemi hastalıklarına örnekler verir.",
      details:
        "KOAH, astım, verem, akciğer ve gırtlak kanseri, zatürre hastalıkları belirtilir.",
    },
    {
      code: "11.1.5.4",
      subTopicName: "Solunum Sistemi Sağlığı",
      description:
        "Solunum sisteminin sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
    },
    // --- 11.1.6 Üriner Sistem ---
    {
      code: "11.1.6.1",
      subTopicName: "Üriner Sistem",
      description: "Üriner sistemin yapı, görev ve işleyişini açıklar.",
      details: [
        "a) Üriner sistemin yapısı işlenirken görsel ögeler, grafik düzenleyiciler, e-öğrenme nesnesi ve uygulamalarından yararlanılır.",
        "b) Böbreğin alyuvar üretimine etkisi üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.6.2",
      subTopicName: "Homeostasi ve Böbrekler",
      description:
        "Homeostasinin sağlanmasında böbreklerin rolünü belirtir.",
    },
    {
      code: "11.1.6.3",
      subTopicName: "Üriner Sistem Rahatsızlıkları",
      description: "Üriner Sistem rahatsızlıklarına örnekler verir.",
      details: [
        "a) Böbrek taşı, böbrek yetmezliği, idrar yolu enfeksiyonu belirtilir.",
        "b) Diyaliz kısaca açıklanarak, diyalize bağımlı hastaların yaşadıkları problemler ve böbrek bağışının önemi vurgulanır.",
      ].join("\n"),
    },
    {
      code: "11.1.6.4",
      subTopicName: "Üriner Sistem Sağlığı",
      description:
        "Üriner sistemin sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
    },
  ],

  // ==================== DUYU ORGANLARI (11.1.1.5–11.1.1.7) ====================
  "Duyu Organları": [
    {
      code: "11.1.1.5",
      subTopicName: "Duyu Organlarının Yapısı",
      description:
        "Duyu organlarının yapısını ve işleyişini açıklar.",
      details: [
        "a) Dokunma duyusu olan deri verilirken epitel ve temel bağ doku kısaca açıklanır.",
        "b) Duyu organlarının yapısı şema üzerinde gösterilerek açıklanır.",
        "c) Göz küresi bölümleri sert tabaka, damar tabaka, ağ tabaka olarak verilir, ayrıntılı yapılarına girilmez.",
        "ç) Kulak bölümleri dış kulak, orta kulak ve iç kulak olarak verilip ayrıntılı yapılarına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.1.6",
      subTopicName: "Duyu Organları Rahatsızlıkları",
      description: "Duyu organları rahatsızlıklarını açıklar.",
      details: [
        "a) Renk körlüğü, miyopi, hipermetropi, astigmatizm, işitme kaybı ve denge kaybı gibi rahatsızlıkların araştırılıp sunulması sağlanır.",
        "b) Görme ve işitme engelli kişilerin karşılaştığı sorunlara dikkat çekmek ve çevresindeki bireyleri bilinçlendirmek amacıyla sosyal farkındalık etkinlikleri hazırlamaları sağlanır.",
      ].join("\n"),
    },
    {
      code: "11.1.1.7",
      subTopicName: "Duyu Organları Sağlığı",
      description:
        "Duyu organlarının sağlıklı yapısının korunması için yapılması gerekenlere ilişkin çıkarımlarda bulunur.",
      details:
        "Duyu organları rahatsızlıklarının tedavisiyle ilgili teknolojik gelişmelerin araştırılması sağlanır.",
    },
  ],

  // ==================== İNSANDA ÜREME VE GELİŞME (11.1.7) ====================
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
        "b) Hamilelikte bebeğin gelişimini olumsuz etkileyen faktörler (antibiyotik dahil erken hamilelik döneminde ilaç kullanımı, yoğun stres, folik asit yetersizliği, X ışınımına maruz kalma) belirtilir.",
        "c) Hamileliğin izlenmesinin bebeğin ve annenin sağlığı açısından önemi vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KOMÜNİTE VE POPÜLASYON EKOLOJİSİ (10.3 + 11.2) ====================
  "Komünite ve Popülasyon Ekolojisi": [
    // --- 10.3.1 Ekosistem Ekolojisi ---
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
      description:
        "Ekosistemde madde ve enerji akışını analiz eder.",
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
    // --- 11.2.1 Komünite Ekolojisi ---
    {
      code: "11.2.1.1",
      subTopicName: "Komünite Ekolojisi",
      description:
        "Komünitenin yapısına etki eden faktörleri açıklar.",
      details:
        "Komünitelerin içerdiği biyolojik çeşitliliğin karasal ekosistemlerde enlem, sucul ekosistemlerde ise suyun derinliği ve suyun kirliliği ile ilişkili olduğu vurgulanır.",
    },
    {
      code: "11.2.1.2",
      subTopicName: "Tür İçi ve Türler Arası Rekabet",
      description:
        "Komünitede tür içi ve türler arasındaki rekabeti örneklerle açıklar.",
      details: "Komünitelerde av-avcı ilişkisi vurgulanır.",
      isKeyKazanim: true,
    },
    {
      code: "11.2.1.3",
      subTopicName: "Simbiyotik İlişkiler",
      description:
        "Komünitede türler arasında simbiyotik ilişkileri örneklerle açıklar.",
      details:
        "Parazitlik ve mutualizm insan sağlığı ile ilişkilendirilir (bit, pire, kene, tenya, bağırsak florası).",
    },
    {
      code: "11.2.1.4",
      subTopicName: "Süksesyon",
      description:
        "Komünitelerdeki süksesyonu örneklerle açıklar.",
      details: "Süksesyonun evrelerine girilmez.",
    },
    // --- 11.2.2 Popülasyon Ekolojisi ---
    {
      code: "11.2.2.1",
      subTopicName: "Popülasyon Dinamiği",
      description:
        "Popülasyon dinamiğine etki eden faktörleri analiz eder.",
      details: [
        "a) İnsan yaş piramitleri üzerinde durulur.",
        "b) Popülasyon büyümesine ilişkin farklı büyüme eğrileri (S ve J) çizilir.",
        "c) Dünyada ve ülkemizde nüfus değişiminin grafikler üzerinden analiz edilmesi ve olası sonuçlarının tartışılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== BİYOTEKNOLOJİ VE EVRİM (12.1 + 12.4) ====================
  "Biyoteknoloji ve Evrim": [
    // --- 12.1.1 Nükleik Asitler ---
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
        "b) Aziz Sancar'ın biyoloji bilimine katkısı, vatanseverliği ve bir bilim insanının genel özellikleri bağlamında şahsına vurgu yapılan bir okuma parçası verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // --- 12.1.2 Genetik Şifre ve Protein Sentezi ---
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
    {
      code: "12.1.2.2",
      subTopicName: "Genetik Mühendisliği ve Biyoteknoloji",
      description:
        "Genetik mühendisliği ve biyoteknoloji kavramlarını açıklar.",
      details:
        "Genetik mühendisliği ve biyoteknoloji arasındaki farkların tartışılması sağlanır.",
    },
    {
      code: "12.1.2.3",
      subTopicName: "Biyoteknoloji Uygulamaları",
      description:
        "Genetik mühendisliği ve biyoteknoloji uygulamalarını açıklar.",
      details: [
        "a) Gen teknolojileri, DNA parmak izi analizi, kök hücre teknolojilerinin ve bunların kullanım alanlarının araştırılması ve sonuçlarının paylaşılması sağlanır.",
        "b) Model organizmaların özellikleri tartışılır.",
        "c) Model organizmaların genetik ve biyoteknolojik araştırmalarda kullanılmasına ilişkin örnekler verilir.",
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
        "b) Klonlama çalışmalarının ve organizmaların genetiğinin değiştirilmesinin olası sonuçları belirtilir.",
        "c) Biyogüvenlik ve biyoetik konularının tartışılması sağlanır.",
        "ç) Sosyo-ekonomik ve kültürel bağlamın, biyolojinin gelişimini etkilediği vurgulanır.",
      ].join("\n"),
    },
    // --- 12.4.1 Canlılar ve Çevre (Evrim) ---
    {
      code: "12.4.1.1",
      subTopicName: "Evrim ve Doğal Seçilim",
      description:
        "Çevre şartlarının genetik değişimlerin sürekliliğine olan etkisini açıklar.",
      details: [
        "a) Varyasyon, adaptasyon, mutasyon, doğal ve yapay seçilim kavramları vurgulanır.",
        "b) Bakterilerin antibiyotiklere karşı direnç geliştirmesinin nedenleri vurgulanır.",
        "c) Herbisit ve pestisitlerin zaman içerisinde etkilerini kaybetmelerinin nedenleri üzerinde durulur.",
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

  // ==================== FOTOSENTEZ (12.2.2) ====================
  Fotosentez: [
    {
      code: "12.2.2.1",
      subTopicName: "Fotosentezin Önemi",
      description:
        "Fotosentezin canlılar açısından önemini sorgular.",
      details:
        "Fotosentez sürecinin anlaşılmasına katkı sağlayan bilim insanlarına örnekler verilerek kısaca çalışmalarına değinilir.",
    },
    {
      code: "12.2.2.2",
      subTopicName: "Fotosentez Süreci",
      description:
        "Fotosentez sürecini şema üzerinde açıklar.",
      details: [
        "a) Klorofil a ve klorofil b'nin yapısı verilmez.",
        "b) Suyun fotolizi belirtilir.",
        "c) Işığa bağımlı ve ışıktan bağımsız reaksiyonlar, ürün açısından karşılaştırılır. Reaksiyonların basamaklarına girilmez ve matematiksel hesaplamalara yer verilmez.",
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
        "b) Fotosentez hızını etkileyen faktörlerle ilgili kontrollü deney yaparken bilimsel yöntem basamakları kullanılır.",
        "c) Tarımsal ürün miktarını artırmada yapay ışıklandırma uygulamalarının araştırılması ve paylaşılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KEMOSENTEZ (12.2.3) ====================
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

  // ==================== SOLUNUM (12.2.4) ====================
  Solunum: [
    {
      code: "12.2.4.1",
      subTopicName: "Hücresel Solunum",
      description: "Hücresel solunumu açıklar.",
      details: [
        "a) Oksijenli solunum; glikoliz, krebs döngüsü ve ETS-oksidatif fosforilasyon olarak verilir.",
        "b) Tepkimelerdeki NADH, FADH₂, ATP üretim ve tüketimi matematiksel hesaplamalara girilmeden verilir.",
        "c) Tüm canlılarda glikozun çeşitli tepkimeler zinciri ile pirüvik asite parçalandığı vurgulanır. Pirüvik asite kadar olan ara basamaklara ve ara ürünlere değinilmez.",
        "ç) Etil alkol-laktik asit fermantasyonu açıklanarak günlük hayattan örnekler verilir.",
        "d) Oksijensiz solunumda, elektronun oksijen dışında bir moleküle (sülfat, kükürt, nitrat, karbondioksit, demir) aktarıldığı belirtilir.",
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
        "b) Fotosentez ve solunum olaylarının bir arada gözlemlenebileceği deney deney tasarlanması ve yapılması sağlanır.",
        "c) Fotosentez ve oksijenli solunumda enerji üretim mekanizması ile ilgili olarak kemiosmotik görüş şema üzerinde verilerek kısaca tanıtılır.",
      ].join("\n"),
    },
  ],

  // ==================== BİTKİ BİYOLOJİSİ (12.3) ====================
  "Bitki Biyolojisi": [
    // --- 12.3.1 Bitkilerin Yapısı ---
    {
      code: "12.3.1.1",
      subTopicName: "Bitkilerin Yapısı",
      description:
        "Çiçekli bir bitkinin temel kısımlarının yapı ve görevlerini açıklar.",
      details: [
        "a) Kök, gövde, yaprak kesitlerinde başlıca dokuların incelenmesi sağlanır ve bunların görevleri açıklanır.",
        "b) Uç ve yanal meristemlerin büyümedeki rolü vurgulanarak yaş halkaları ile bağlantı kurulur.",
        "c) Prokambiyum, protoderm ve temel meristem konularına girilmez.",
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
      code: "12.3.1.3",
      subTopicName: "Bitki Hareketleri",
      description:
        "Bitki hareketlerini gözlemleyebileceği kontrollü deney yapar.",
      details: [
        "a) Nasti ve tropizma hareketleri gözlemlenerek bu hareketlere ilişkin gözlemlerin paylaşılması sağlanır.",
        "b) Oksin hormonunun tropizmadaki etkisi vurgulanır.",
      ].join("\n"),
    },
    // --- 12.3.2 Bitkilerde Madde Taşınması ---
    {
      code: "12.3.2.1",
      subTopicName: "Su ve Mineral Emilimi",
      description: "Köklerde su ve mineral emilimini açıklar.",
      details: [
        "a) Su ve minerallerin bitkiler için önemi vurgulanır.",
        "b) Minerallerin topraktan alınması, nodül ve mikoriza oluşumu üzerinde durulur.",
        "c) İyonların emilim mekanizmasına girilmez.",
        "ç) Bitkilerin büyüme ve gelişmesinde gerekli olan minerallerin isimleri verilir. Ayrı ayrı görevlerine girilmez.",
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
      code: "12.3.2.3",
      subTopicName: "Fotosentez Ürünlerinin Taşınması",
      description:
        "Bitkilerde fotosentez ürünlerinin taşınma mekanizmasını açıklar.",
    },
    {
      code: "12.3.2.4",
      subTopicName: "Madde Taşınması Deneyi",
      description:
        "Bitkilerde su ve madde taşınması ile ilgili deney tasarlar.",
    },
    // --- 12.3.3 Bitkilerde Eşeyli Üreme ---
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
      details: [
        "a) Bitkilerde eşeyli üreme kapalı tohumlu bir bitki örneği üzerinden görsel ögeler, grafik düzenleyiciler, e-öğrenme nesnesi ve uygulamalarından faydalanılarak işlenir.",
        "b) Bitkilerin üreme ve yayılmasında tohum ve meyvenin rolü örneklerle ele alınır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.3.3.3",
      subTopicName: "Tohum Çimlenmesi",
      description:
        "Tohum çimlenmesini gözleyebileceği deney tasarlar.",
      details:
        "Çimlenmeye etki eden faktörlerin tespit edilmesi sağlanır.",
    },
    {
      code: "12.3.3.4",
      subTopicName: "Dormansi ve Çimlenme",
      description: "Dormansi ve çimlenme arasında ilişki kurar.",
    },
  ],
};

// =====================================================================
// SEED LOGİĞİ
// =====================================================================

async function main() {
  const ayt = await prisma.examType.findUnique({ where: { slug: "ayt" } });
  if (!ayt) {
    console.log("AYT exam type bulunamadı, atlıyorum.");
    return;
  }

  const biyoSubject = await prisma.subject.findFirst({
    where: { name: "Biyoloji", examTypeId: ayt.id },
  });
  if (!biyoSubject) {
    console.log("AYT Biyoloji subject bulunamadı, atlıyorum.");
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
    console.error("seed-ayt-biyoloji-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
