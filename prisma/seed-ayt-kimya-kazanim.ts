/**
 * AYT Kimya kazanımlarını ÖSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Kimya Dersi Öğretim Programı (2018), sayfa 189-205
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-ayt-kimya-kazanim.ts
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
  // ==================== KİMYASAL HESAPLAMALAR (10.1) ====================
  "Kimyasal Hesaplamalar": [
    {
      code: "10.1.1.1",
      subTopicName: "Kimyanın Temel Kanunları",
      description: "Kimyanın temel kanunlarını açıklar.",
      details: [
        "a) Kütlenin korunumu, sabit oranlar ve katlı oranlar kanunları ile ilgili hesaplamalar yapılır.",
        "b) Demir(II) sülfür bileşiğinin elde edilmesi deneyi yaptırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2.1",
      subTopicName: "Mol Kavramı",
      description: "Mol kavramını açıklar.",
      details: [
        "a) Mol kavramının tarihsel süreç içerisindeki değişimi üzerinde durulur.",
        "b) Bağıl atom kütlesi tanımlanır.",
        "c) İzotop kavramı ve bazı elementlerin mol kütlelerinin tam sayı çıkmayışının nedeni örneklerle açıklanır.",
        "ç) Mol hesaplamaları yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.3.1",
      subTopicName: "Kimyasal Tepkimeler ve Denklemler",
      description: "Kimyasal tepkimeleri açıklar.",
      details: [
        "a) Kimyasal tepkime denklemlerinin denkleştirilmesi sağlanır. Redoks tepkimelerine girilmez.",
        "b) Yanma, sentez (oluşum), analiz (ayrışma), asit-baz, çözünme-çökelme tepkimeleri örneklerle açıklanır.",
        "c) Kurşun(II) iyodürün çökmesi deneyi yaptırılır.",
        "ç) Kimyasal tepkimelerin açıklanmasında bilişim teknolojilerinden yararlanılır.",
      ].join("\n"),
    },
    {
      code: "10.1.4.1",
      subTopicName: "Kimyasal Tepkimelerde Hesaplamalar",
      description:
        "Kütle, mol sayısı, molekül sayısı, atom sayısı ve gazlar için normal şartlarda hacim kavramlarını birbirleriyle ilişkilendirerek hesaplamalar yapar.",
      details: [
        "a) Sınırlayıcı bileşen hesapları üzerinde durulur.",
        "b) Tepkime denklemleri temelinde % verim hesapları yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== MODERN ATOM TEORİSİ (11.1) ====================
  "Modern Atom Teorisi": [
    {
      code: "11.1.1.1",
      subTopicName: "Atomun Kuantum Modeli",
      description: "Atomu kuantum modeliyle açıklar.",
      details: [
        "a) Bohr atom modelinin deney ve gözlemlerden elde edilen bulguları açıklamadaki sınırlılıkları vurgulanarak modern atom teorisinin (bulut modelinin) önemi üzerinde durulur.",
        "b) Tek elektronlu atomlar/iyonlar için orbital kavramı elektronların bulunma olasılığı ile ilişkilendirilir.",
        "c) Yörünge ve orbital kavramları karşılaştırılır.",
        "ç) Kuantum sayıları orbitallerle ilişkilendirilir.",
        "d) Çok elektronlu atomlarda orbitallerin enerji seviyeleri açıklanır.",
      ].join("\n"),
    },
    {
      code: "11.1.2.1",
      subTopicName: "Periyodik Sistem ve Elektron Dizilimleri",
      description:
        "Nötr atomların elektron dizilimleriyle periyodik sistemdeki yerleri arasında ilişki kurar.",
      details: [
        "a) Hund Kuralı, Pauli İlkesi ve Aufbau Prensibi açıklanır.",
        "b) Atomların ve iyonların elektron dizilimlerine örnekler verilir. Atom numarası 36 ve daha küçük türlerin elektron dizilimleri esas alınır.",
        "c) Değerlik orbital ve değerlik elektronu kavramları açıklanır.",
        "ç) Elektron dizilimleriyle elementin ait olduğu blok ilişkilendirilerek grup ve periyot belirlenir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.3.1",
      subTopicName: "Periyodik Özellikler",
      description:
        "Periyodik özelliklerdeki değişim eğilimlerini sebepleriyle açıklar.",
      details: [
        "a) Kovalent yarıçap, van der Waals yarıçapı ve iyonik yarıçapın farkları üzerinde durulur.",
        "b) Periyodik özellikler arasında metallik/ametallik, atom/iyon yarıçapı, iyonlaşma enerjisi, elektron ilgisi, elektronegatiflik ve oksit/hidroksit bileşiklerinin asitlik/bazlık eğilimleri üzerinde durulur.",
        "c) Ardışık iyonlaşma enerjilerinin grup numarasıyla ilişkisi örneklerle gösterilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.4.1",
      subTopicName: "Elementleri Tanıyalım",
      description:
        "Elementlerin periyodik sistemdeki konumu ile özellikleri arasındaki ilişkileri açıklar.",
      details: [
        "a) s, p, d bloku elementlerinin metal/ametal karakteri, iyon yükleri, aktiflikleri ve yaptıkları kimyasal bağ tipi elektron dizilimiyle ilişkilendirilir.",
        "b) f blok elementlerinin periyodik sistemdeki konumlarıyla ilgili özel durumlar vurgulanır.",
        "c) Asal gaz özellikleri elektron dizilimleriyle ilişkilendirilir.",
      ].join("\n"),
    },
    {
      code: "11.1.5.1",
      subTopicName: "Yükseltgenme Basamakları",
      description:
        "Yükseltgenme basamakları ile elektron dizilimleri arasındaki ilişkiyi açıklar.",
      details: [
        "a) Ametallerin anyon hâlindeki yükleriyle yükseltgenme basamakları arasındaki fark örneklendirilir.",
        "b) d bloku elementlerinin birden çok yükseltgenme basamağında bulunabilmeleri, elektron dizilimleriyle ilişkilendirilir.",
      ].join("\n"),
    },
  ],

  // ==================== GAZLAR (11.2) ====================
  Gazlar: [
    {
      code: "11.2.1.1",
      subTopicName: "Gazların Özellikleri ve Gaz Yasaları",
      description:
        "Gazların betimlenmesinde kullanılan özellikleri açıklar.",
      details: [
        "a) Basınç birimleri (atm, Torr, mmHg) ve hacim birimleri (L, m³) ile bunların ondalık ast ve üst katları kısaca açıklanır.",
        "b) Gazların özelliklerinin ölçme yöntemleri üzerinde durulur. Manometrelerle ilgili hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "11.2.1.2",
      subTopicName: "Gazların Özellikleri ve Gaz Yasaları",
      description: "Gaz yasalarını açıklar.",
      details: [
        "a) Gazların özelliklerine ilişkin yasalar (Boyle, Charles, Gay Lussac ve Avogadro) üzerinde durulur.",
        "b) Öğrencilerin hazır veriler kullanılarak gaz yasaları ile ilgili grafikler çizmeleri ve yorumlamaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.2.1",
      subTopicName: "İdeal Gaz Yasası",
      description:
        "Deneysel yoldan türetilmiş gaz yasaları ile ideal gaz yasası arasındaki ilişkiyi açıklar.",
      details: [
        "a) Boyle, Charles ve Avogadro yasalarından yola çıkılarak ideal gaz denklemi türetilir.",
        "b) İdeal gaz denklemi kullanılarak örnek hesaplamalar yapılır.",
        "c) Normal şartlarda gaz hacimleri kütle ve mol sayısıyla ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.3.1",
      subTopicName: "Gazlarda Kinetik Teori",
      description: "Gaz davranışlarını kinetik teori ile açıklar.",
      details: [
        "a) Kinetik teorinin temel varsayımları üzerinde durulur.",
        "b) Kinetik teorinin temel varsayımları kullanılarak Graham Difüzyon ve Efüzyon Yasası türetilir.",
        "c) Difüzyon deneyi yaptırılır.",
      ].join("\n"),
    },
    {
      code: "11.2.4.1",
      subTopicName: "Gaz Karışımları",
      description:
        "Gaz karışımlarının kısmi basınçlarını günlük hayattan örneklerle açıklar.",
      details:
        "Sıvıların doygun buhar basınçları kısmi basınç kavramıyla ilişkilendirilerek su üzerinde toplanan gazlarla ilgili hesaplamalar yapılır.",
      isKeyKazanim: true,
    },
    {
      code: "11.2.5.1",
      subTopicName: "Gerçek Gazlar",
      description:
        "Gazların sıkışma/genleşme sürecinde gerçek gaz ve ideal gaz kavramlarını karşılaştırır.",
      details: [
        "a) Gerçek gazların hangi durumlarda ideallikten saptığı belirtilir.",
        "b) Karbon dioksitin ve suyun faz diyagramı açıklanarak buhar ve gaz kavramları arasındaki fark vurgulanır.",
        "c) Suyun farklı kristal yapılarını gösteren faz diyagramlarına girilmez.",
        "ç) Günlük hayatta yaygın kullanılan ve gerçek gazların hâl değişimlerinin uygulamaları olan soğutma sistemleri (Joule-Thomson olayı) örnekleriyle açıklanır.",
      ].join("\n"),
    },
  ],

  // ==================== SIVI ÇÖZELTİLER (11.3) ====================
  "Sıvı Çözeltiler": [
    {
      code: "11.3.1.1",
      subTopicName: "Çözücü Çözünen Etkileşimleri",
      description:
        "Kimyasal türler arası etkileşimleri kullanarak sıvı ortamda çözünme olayını açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.3.2.1",
      subTopicName: "Derişim Birimleri",
      description:
        "Çözünen madde miktarı ile farklı derişim birimlerini ilişkilendirir.",
      details: [
        "a) Derişim birimleri olarak molarite ve molalite tanıtılır.",
        "b) Normalite ve formalite tanımlarına girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.3.2.2",
      subTopicName: "Derişim Birimleri",
      description: "Farklı derişimlerde çözeltiler hazırlar.",
      details:
        "Derişimle ilgili hesaplamalar yapılarak hesaplamalarda molarite ve molalite yanında kütlece yüzde, hacimce yüzde, mol kesri ve ppm kavramları da kullanılır.",
      isKeyKazanim: true,
    },
    {
      code: "11.3.3.1",
      subTopicName: "Koligatif Özellikler",
      description:
        "Çözeltilerin koligatif özellikleri ile derişimleri arasında ilişki kurar.",
      details: [
        "a) Koligatif özelliklerden buhar basıncı alçalması, donma noktası alçalması (kriyoskopi), kaynama noktası yükselmesi (ebülyoskopi) ve osmotik basınç üzerinde durulur.",
        "b) Osmotik basınç ile ilgili hesaplamalara girilmez.",
        "c) Ters osmoz yöntemiyle su arıtımı hakkında kısaca bilgi verilir.",
        "ç) Saf suyun ve farklı derişimlerdeki sulu çözeltilerin kaynama noktası tayini deneyleri yaptırılır.",
      ].join("\n"),
    },
    {
      code: "11.3.4.1",
      subTopicName: "Çözünürlük",
      description:
        "Çözeltileri çözünürlük kavramı temelinde sınıflandırır.",
      details: [
        "a) Seyreltik, derişik, doygun, aşırı doygun ve doymamış çözelti kavramları üzerinde durulur.",
        "b) Çözünürlükler g/100 g su birimi cinsinden verilir.",
        "c) Çözünürlükle ilgili hesaplamalar yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.3.5.1",
      subTopicName: "Çözünürlüğe Etki Eden Faktörler",
      description:
        "Çözünürlüğün sıcaklık ve basınçla ilişkisini açıklar.",
      details: [
        "a) Farklı tuzların sıcaklığa bağlı çözünürlük eğrilerinin yorumlanması sağlanır.",
        "b) Tuzların farklı sıcaklıklardaki çözünürlüklerinden faydalanılarak deriştime ve kristallendirme ile ilgili hesaplamalar yapılır.",
        "c) Gazların çözünürlüklerinin basınç ve sıcaklıkla değişimi üzerinde durulur.",
      ].join("\n"),
    },
  ],

  // ==================== KİMYA VE ENERJİ (11.4) ====================
  "Kimya ve Enerji": [
    {
      code: "11.4.1.1",
      subTopicName: "Tepkimelerde Isı Değişimi",
      description:
        "Tepkimelerde meydana gelen enerji değişimlerini açıklar.",
      details: [
        "a) Tepkimelerin ekzotermik ve endotermik olması ısı alışverişiyle ilişkilendirilir.",
        "b) Ekzotermik ve endotermik tepkimelerin açıklanmasında bilişim teknolojilerinden yararlanılır.",
      ].join("\n"),
    },
    {
      code: "11.4.2.1",
      subTopicName: "Oluşum Entalpisi",
      description:
        "Standart oluşum entalpileri üzerinden tepkime entalpilerini hesaplar.",
      details: [
        "a) Standart oluşum entalpileri tanımlanır.",
        "b) Tepkime entalpisi potansiyel enerji-tepkime koordinatı grafiği üzerinden açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.3.1",
      subTopicName: "Bağ Enerjileri",
      description:
        "Bağ enerjileri ile tepkime entalpisi arasındaki ilişkiyi açıklar.",
      details:
        "Oluşan ve kırılan bağ enerjileri üzerinden tepkime entalpisi hesaplamaları yapılır.",
      isKeyKazanim: true,
    },
    {
      code: "11.4.4.1",
      subTopicName: "Tepkime Isılarının Toplanabilirliği",
      description: "Hess Yasasını açıklar.",
      details: "Hess Yasası ile ilgili hesaplamalar yapılır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== TEPKİMELERDE HIZ (11.5) ====================
  "Tepkimelerde Hız": [
    {
      code: "11.5.1.1",
      subTopicName: "Tepkime Hızları",
      description:
        "Kimyasal tepkimeler ile tanecik çarpışmaları arasındaki ilişkiyi açıklar.",
    },
    {
      code: "11.5.1.2",
      subTopicName: "Tepkime Hızları",
      description: "Kimyasal tepkimelerin hızlarını açıklar.",
      details: [
        "a) Madde miktarı (derişim, mol, kütle, gaz maddeler için normal şartlarda hacim) ile tepkime hızı ilişkilendirilir.",
        "b) Ortalama tepkime hızı kavramı açıklanır.",
        "c) Homojen ve heterojen faz tepkimelerine örnekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.5.2.1",
      subTopicName: "Tepkime Hızını Etkileyen Faktörler",
      description: "Tepkime hızına etki eden faktörleri açıklar.",
      details: [
        "a) Tek basamaklı tepkimelerde, her iki yöndeki tepkime hızının derişime bağlı ifadeleri verilir.",
        "b) Çok basamaklı tepkimeler için hız belirleyici basamağın üzerinde durulur.",
        "c) Madde cinsi, derişim, sıcaklık, katalizör ve temas yüzeyinin tepkime hızına etkisi üzerinde durulur. Arrhenius bağıntısına girilmez.",
        "ç) Oktay Sinanoğlu'nun kısa biyografisini ve tepkime mekanizmaları üzerine yaptığı çalışmaları tanıtan okuma parçasına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KİMYASAL DENGE (11.6.1–11.6.2) ====================
  "Kimyasal Denge": [
    {
      code: "11.6.1.1",
      subTopicName: "Kimyasal Denge",
      description:
        "Fiziksel ve kimyasal değişimlerde dengeyi açıklar.",
      details: [
        "a) Maksimum düzensizlik ve minimum enerji eğilimleri üzerinden denge açıklanır.",
        "b) İleri ve geri tepkime hızları üzerinden denge açıklanır.",
        "c) Tersinir reaksiyonlar için derişim ve basınç cinsinden denge ifadeleri türetilerek hesaplamalar yapılır.",
        "ç) Farklı denge sabitleri arasındaki ilişki incelenir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.6.2.1",
      subTopicName: "Dengeyi Etkileyen Faktörler",
      description: "Dengeyi etkileyen faktörleri açıklar.",
      details: [
        "a) Sıcaklığın, derişimin, hacmin, kısmi basınçların ve toplam basıncın dengeye etkisi denge ifadesi üzerinden açıklanır.",
        "b) Le Chatelier İlkesi örnekler üzerinden irdelenir.",
        "c) Katalizör-denge ilişkisi vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== SIVI ÇÖZELTİLERDE DENGE (11.6.3) ====================
  "Sıvı Çözeltilerde Denge": [
    {
      code: "11.6.3.1",
      subTopicName: "Sulu Çözelti Dengeleri",
      description:
        "pH ve pOH kavramlarını suyun oto-iyonizasyonu üzerinden açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.6.3.2",
      subTopicName: "Sulu Çözelti Dengeleri",
      description: "Brönsted-Lowry asitlerini/bazlarını karşılaştırır.",
    },
    {
      code: "11.6.3.3",
      subTopicName: "Sulu Çözelti Dengeleri",
      description:
        "Katyonların asitliğini ve anyonların bazlığını su ile etkileşimleri temelinde açıklar.",
      details: [
        "a) Kuvvetli/zayıf asitler ve bazlar tanıtılır; konjuge asit-baz çiftlerine örnekler verilir.",
        "b) Asit gibi davranan katyonların ve baz gibi davranan anyonların su ile etkileşimleri üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "11.6.3.4",
      subTopicName: "Sulu Çözelti Dengeleri",
      description:
        "Asitlik/bazlık gücü ile ayrışma denge sabitleri arasında ilişki kurar.",
      details:
        "Asitlerin/bazların iyonlaşma oranlarının denge sabitleriyle ilişkilendirilmesi sağlanır.",
    },
    {
      code: "11.6.3.5",
      subTopicName: "Sulu Çözelti Dengeleri",
      description:
        "Kuvvetli ve zayıf monoprotik asit/baz çözeltilerinin pH değerlerini hesaplar.",
      details: [
        "a) Çok derişik ve çok seyreltik asit/baz çözeltilerinin pH değerlerine girilmez.",
        "b) Zayıf asitler/bazlar için [H⁺] = (Ka·Ca)^(1/2) ve [OH⁻] = (Kb·Cb)^(1/2) eşitlikleri esas alınır.",
        "c) Poliprotik asitlere girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.6.3.6",
      subTopicName: "Tampon Çözeltiler",
      description:
        "Tampon çözeltilerin özellikleri ile günlük kullanım alanlarını ilişkilendirir.",
      details: [
        "a) Tampon çözeltilerin pH değerlerinin seyrelme ve asit/baz ilavesi ile fazla değişmemesi ortamdaki dengeler üzerinden açıklanır. Henderson formülü ve tampon kapasitesine girilmez.",
        "b) Tampon çözeltilerin canlı organizmalar açısından önemine değinilir.",
      ].join("\n"),
    },
    {
      code: "11.6.3.7",
      subTopicName: "Tuz Çözeltileri",
      description:
        "Tuz çözeltilerinin asitlik/bazlık özelliklerini açıklar.",
      details: [
        "a) Asidik, bazik ve nötr tuz kavramları açıklanır.",
        "b) Anyonu zayıf baz olan tuzlara örnekler verilir.",
        "c) Katyonu NH₄⁺ veya anyonu HSO₄⁻ olan tuzların asitliği üzerinde durulur.",
        "ç) Hidroliz hesaplamalarına girilmez.",
      ].join("\n"),
    },
    {
      code: "11.6.3.8",
      subTopicName: "Titrasyon",
      description:
        "Kuvvetli asit/baz derişimlerini titrasyon yöntemiyle belirler.",
      details: [
        "a) Titrasyon deneyi yaptırılıp sonuçların grafik üzerinden gösterilerek yorumlanması sağlanır.",
        "b) Titrasyonla ilgili hesaplama örnekleri verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.6.3.9",
      subTopicName: "Çözünme-Çökelme Dengeleri",
      description:
        "Sulu ortamlarda çözünme-çökelme dengelerini açıklar.",
      details: [
        "a) Çözünme-çökelme denge örneklerine yer verilir; çözünürlük çarpımı (Kçç) ve çözünürlük (s) kavramları ilişkilendirilir.",
        "b) Tuzların çözünürlüğüne etki eden faktörlerden sıcaklık ve ortak iyon etkisi üzerinde durulur.",
        "c) Ortak iyon etkisi hesaplamaları yapılır.",
      ].join("\n"),
    },
  ],

  // ==================== KİMYA VE ELEKTRİK (12.1) ====================
  "Kimya ve Elektrik": [
    {
      code: "12.1.1.1",
      subTopicName: "İndirgenme-Yükseltgenme Tepkimelerinde Elektrik Akımı",
      description: "Redoks tepkimelerini tanır.",
      details: [
        "a) Yükseltgenme ve indirgenme kavramları üzerinde durulur.",
        "b) Redoks tepkimeleri denkleştirilerek yaygın yükseltgenler ve indirgenler tanıtılır.",
        "c) İyonik redoks tepkimelerinin denkleştirilmesine girilmez.",
      ].join("\n"),
    },
    {
      code: "12.1.1.2",
      subTopicName: "İndirgenme-Yükseltgenme Tepkimelerinde Elektrik Akımı",
      description:
        "Redoks tepkimeleriyle elektrik enerjisi arasındaki ilişkiyi açıklar.",
      details: [
        "a) İndirgen-yükseltgen arasındaki elektron alışverişinin doğrudan temas dışında bir yolla mümkün olup olmayacağının üzerinde durulur.",
        "b) Elektrik enerjisi ile redoks tepkimesinin istemliliik/istemsizlik durumu ilişkilendirilir.",
      ].join("\n"),
    },
    {
      code: "12.1.2.1",
      subTopicName: "Elektrotlar ve Elektrokimyasal Hücreler",
      description:
        "Elektrot ve elektrokimyasal hücre kavramlarını açıklar.",
      details: [
        "a) Katot ve anot kavramları, indirgenme-yükseltgenme ile ilişkilendirilerek ele alınır.",
        "b) Elektrot, yarı-hücre ve hücre kavramları üzerinde durulur.",
        "c) İnert elektrotların hangi durumlarda gerekli olduğu belirtilir.",
        "ç) Pillerde tuz köprüsünün işlevi açıklanır.",
        "d) Zn/Cu elektrokimyasal pili deneyi yaptırılır.",
      ].join("\n"),
    },
    {
      code: "12.1.3.1",
      subTopicName: "Elektrot Potansiyelleri",
      description:
        "Redoks tepkimelerinin istemliliğini standart elektrot potansiyellerini kullanarak açıklar.",
      details: [
        "a) Standart yarı hücre indirgenme potansiyelleri, standart hidrojen yarı hücresi ile ilişkilendirilir.",
        "b) Metallerin aktiflik sırası üzerinde durulur.",
        "c) İki ayrı yarı hücre arasındaki istemli redoks tepkimesinin, standart indirgenme potansiyelleri ile ilişkilendirilmesi sağlanır.",
        "ç) Standart olmayan koşullarda elektrot potansiyellerinin hesaplanmasına yönelik çalışmalara yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.1.4.1",
      subTopicName: "Kimyasallardan Elektrik Üretimi",
      description:
        "Standart koşullarda galvanik pillerin voltajını ve kullanım ömrünü örnekler vererek açıklar.",
    },
    {
      code: "12.1.4.2",
      subTopicName: "Kimyasallardan Elektrik Üretimi",
      description:
        "Lityum iyon pillerinin önemini kullanım alanlarıyla ilişkilendirerek açıklar.",
    },
    {
      code: "12.1.5.1",
      subTopicName: "Elektroliz",
      description:
        "Elektroliz olayını elektrik akımı, zaman ve değişime uğrayan madde kütlesi açısından açıklar.",
      details: [
        "a) 1 mol elektronun toplam yükü üzerinden elektrik yükü-kütle ilişkisi kurulması sağlanır.",
        "b) Yük birimi Coulomb (C) tanımlanır.",
        "c) Faraday bağıntısı açıklanarak bu bağıntının kullanıldığı hesaplamalar yapılır.",
        "d) Kaplama deneyi yaptırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.1.5.2",
      subTopicName: "Elektroliz",
      description:
        "Kimyasal maddelerin elektroliz yöntemiyle elde ediliş sürecini açıklar.",
      details: "Suyun elektrolizi ile hidrojen ve oksijen eldesi deneyi yaptırılır.",
    },
    {
      code: "12.1.6.1",
      subTopicName: "Korozyon",
      description:
        "Korozyon önleme yöntemlerinin elektrokimyasal temellerini açıklar.",
      details: [
        "a) Korozyon kavramı açıklanır.",
        "b) Korozyondan koruma süreci metallerin aktiflik sırası ile ilişkilendirilir; kurban elektrot kavramı üzerinde durulur.",
        "c) Kurban elektrotun kullanım alanlarına örnekler verilir.",
      ].join("\n"),
    },
  ],

  // ==================== KARBON KİMYASINA GİRİŞ (12.2) ====================
  "Karbon Kimyasına Giriş": [
    {
      code: "12.2.1.1",
      subTopicName: "Anorganik ve Organik Bileşikler",
      description: "Anorganik ve organik bileşikleri ayırt eder.",
      details: [
        "a) Organik bileşik kavramının tarihsel gelişimi açıklanır.",
        "b) Anorganik ve organik bileşiklerin özellikleri vurgulanır.",
      ].join("\n"),
    },
    {
      code: "12.2.2.1",
      subTopicName: "Basit Formül ve Molekül Formülü",
      description:
        "Organik bileşiklerin basit ve molekül formüllerinin bulunması ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
    {
      code: "12.2.3.1",
      subTopicName: "Doğada Karbon",
      description:
        "Karbon allotroplarının özelliklerini yapılarıyla ilişkilendirir.",
      details: [
        "a) Karbon elementinin çok sayıda bileşik oluşturma özelliği ile bağ yapma özelliği arasında ilişki kurulur.",
        "b) Elmas ve grafitin incelenmesi sağlanarak fulleren, nanotüp ve grafenin yapıları ve önemleri üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "12.2.4.1",
      subTopicName: "Lewis Formülleri",
      description:
        "Kovalent bağlı kimyasal türlerin Lewis formüllerini yazar.",
      details: "Oktetin aşıldığı moleküller kapsam dışıdır.",
      isKeyKazanim: true,
    },
    {
      code: "12.2.5.1",
      subTopicName: "Hibritleşme-Molekül Geometrileri",
      description:
        "Tek, çift ve üçlü bağların oluşumunu hibrit ve atom orbitalleri temelinde açıklar.",
    },
    {
      code: "12.2.5.2",
      subTopicName: "Hibritleşme-Molekül Geometrileri",
      description:
        "Moleküllerin geometrilerini merkez atomu orbitallerinin hibritleşmesi esasına göre belirler.",
      details: [
        "a) Hibritleşme ve VSEPR yaklaşımı üzerinde durulur.",
        "b) 2. periyot elementlerinin hidrojenle yaptığı bileşikler dışındakiler verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ORGANİK BİLEŞİKLER (12.3) ====================
  "Organik Bileşikler": [
    {
      code: "12.3.1.1",
      subTopicName: "Hidrokarbonlar",
      description: "Hidrokarbon türlerini ayırt eder.",
    },
    {
      code: "12.3.1.2",
      subTopicName: "Hidrokarbonlar",
      description:
        "Basit alkanların adlarını, formüllerini, özelliklerini ve kullanım alanlarını açıklar.",
      details: [
        "a) Yanma ve halojenlerle yer değiştirme özellikleri üzerinde durulur.",
        "b) Yapısal izomerlik ve çeşitleri üzerinde durulur.",
        "c) Alkanların yakıtlarda kullanıldığı vurgulanır.",
        "ç) Benzinlerde oktan sayısı hakkında okuma parçası verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.3.1.3",
      subTopicName: "Hidrokarbonlar",
      description:
        "Basit alkenlerin adlarını, formüllerini, özelliklerini ve kullanım alanlarını açıklar.",
      details: [
        "a) Cis-trans izomerlik üzerinde durulur.",
        "b) Alkenlerin kullanım alanı olarak alkil halojenür ve alkoller için ham madde oldukları vurgulanır.",
        "c) Alkenlerin gıda endüstrisindeki kullanımları ve polimerleşme özellikleri hakkında bilgi verilir.",
      ].join("\n"),
    },
    {
      code: "12.3.1.4",
      subTopicName: "Hidrokarbonlar",
      description:
        "Basit alkinlerin adlarını, formüllerini, özelliklerini ve kullanım alanlarını açıklar.",
      details:
        "Asetilenin üretimi, kullanım alanları, katılma özellikleri ve birincil patlayıcı tuzları üzerinde durulur.",
    },
    {
      code: "12.3.1.5",
      subTopicName: "Hidrokarbonlar",
      description:
        "Basit aromatik bileşiklerin adlarını, formüllerini ve kullanım alanlarını açıklar.",
      details:
        "Benzen, naftalin, anilin, toluen ve fenol bileşikleri tanıtılarak yapıları ve kullanım alanlarına değinilir.",
    },
    {
      code: "12.3.2.1",
      subTopicName: "Fonksiyonel Gruplar",
      description:
        "Organik bileşikleri fonksiyonel gruplarına göre sınıflandırır.",
      details:
        "Alkil-gruplarına, hidroksi-, alkoksi-, halo-, karbonil-, karboksil-, amino-, nitro-, fenil- grupları bağlanınca oluşan bileşikler genel olarak tanıtılır.",
    },
    {
      code: "12.3.3.1",
      subTopicName: "Alkoller",
      description:
        "Alkolleri sınıflandırarak adlarını, formüllerini, özelliklerini ve kullanım alanlarını açıklar.",
      details: [
        "a) Etanolün fermantasyon yöntemi ile elde edilişi açıklanır.",
        "b) Etanolün alkil halojenürlerden ve alkenlerden elde edilişi üzerinde durulur.",
        "c) Alkollerin hidroksil sayısına ve alfa karbonundaki alkil sayısına göre sınıflandırılması sağlanır.",
        "ç) 1-4 karbonlu mono alkoller, etandiol (glikol) ve propantriol (gliserin) üzerinde durulur.",
        "d) Metanolün zehirli özellikleri vurgulanır.",
        "e) Etanolün sağlık alanında kullanımına vurgu yapılır.",
        "f) Etanolün biyoyakıt işlevi gördüğü ve çözücü olarak kullanıldığı vurgulanır.",
      ].join("\n"),
    },
    {
      code: "12.3.4.1",
      subTopicName: "Eterler",
      description:
        "Eterleri sınıflandırarak adlarını, formüllerini, özelliklerini ve kullanım alanlarını açıklar.",
      details: [
        "a) Asimetrik-simetrik eter ayrımı yapılır.",
        "b) Eterlerin çözücü özelliklerine vurgu yapılır.",
        "c) Fonksiyonel grup izomerliği açıklanarak eterlerin alkollerle izomerliğine değinilir.",
      ].join("\n"),
    },
    {
      code: "12.3.5.1",
      subTopicName: "Karbonil Bileşikleri",
      description:
        "Karbonil bileşiklerini sınıflandırarak adlarını, formüllerini, özelliklerini ve kullanım alanlarını açıklar.",
      details: [
        "a) Aldehit ve ketonları ayırt edecek düzeyde yapısal ilişki kurularak indirgenme-yükseltgenme özelliklerinin karşılaştırılması sağlanır.",
        "b) Aldehitlere örnek olarak formaldehit, asetaldehit ve benzaldehit; ketonlara örnek olarak aseton verilir.",
        "c) Aldehit ve ketonların fonksiyonel grup izomerliklerine değinilir.",
        "ç) Aldehit ve ketonların gıda ve kozmetik sanayinde nasıl kullanıldıkları üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "12.3.6.1",
      subTopicName: "Karboksilik Asitler",
      description:
        "Karboksilik asitleri sınıflandırarak adlarını, formüllerini ve kullanım alanlarını açıklar.",
      details: [
        "a) Formik asit, asetik asit, salisilik asit, ftalik asit, sitrik asit, malik asit, folik asit ve benzoik asit tanıtılır.",
        "b) Doymuş ve doymamış yağ asitleri tanıtılır.",
        "c) Yağ asidi tuzlarının sabun olarak kullanıldığı vurgulanır.",
        "ç) Benzoik asidin ve benzoatların gıda koruyucu maddesi olarak kullanıldığı vurgulanır.",
      ].join("\n"),
    },
    {
      code: "12.3.7.1",
      subTopicName: "Esterler",
      description:
        "Esterlerin adlarını, formüllerini ve kullanım alanlarını açıklar.",
      details: [
        "a) Esterleşme tepkimesine örnek verilir.",
        "b) Esterlerin yer aldığı doğal maddelere örnek olarak lanolin, balmumu ve balsam verilir.",
        "c) Esterlerin çözücü olarak kullanımlarına ilişkin örnekler verilir.",
        "ç) Karboksilik asit ve esterlerin fonksiyonel grup izomerliklerine değinilir.",
        "d) Sabun eldesi deneyi yaptırılır.",
      ].join("\n"),
    },
  ],

  // ==================== HAYATIMIZDAKİ KİMYA (12.4) ====================
  "Hayatımızdaki Kimya": [
    {
      code: "12.4.1.1",
      subTopicName: "Fosil Yakıtlar",
      description:
        "Fosil yakıtların çevreye zararlı etkilerini azaltmak için çözüm önerilerinde bulunur.",
    },
    {
      code: "12.4.2.1",
      subTopicName: "Alternatif Enerji Kaynakları",
      description: "Alternatif enerji kaynaklarını tanır.",
      details: [
        "a) Güneş, rüzgâr, hidrojen, jeotermal ve biyokütle enerji kaynaklarına değinilir.",
        "b) Bor mineralinden hidrojen eldesinin ülkemizin kalkınması için önemi vurgulanır.",
      ].join("\n"),
    },
    {
      code: "12.4.2.2",
      subTopicName: "Nükleer Enerji",
      description:
        "Nükleer enerji kullanımını bilim, toplum, teknoloji, çevre ve ekonomi açısından değerlendirir.",
    },
    {
      code: "12.4.3.1",
      subTopicName: "Sürdürülebilirlik",
      description:
        "Sürdürülebilir hayat ve kalkınmanın toplum ve çevre için önemini kimya bilimi ile ilişkilendirerek açıklar.",
      details:
        "Enerji, polimer, kâğıt ve metal sektörlerinin sürdürülebilir hayat üzerindeki etkilerine değinilir.",
    },
    {
      code: "12.4.4.1",
      subTopicName: "Nanoteknoloji",
      description:
        "Nanoteknoloji alanındaki gelişmeleri bilim, toplum, teknoloji, çevre ve ekonomiye etkileri açısından değerlendirir.",
      details: "Nanoteknoloji kavramı örnekler üzerinden açıklanır.",
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

  const kimyaSubject = await prisma.subject.findFirst({
    where: { name: "Kimya", examTypeId: ayt.id },
  });
  if (!kimyaSubject) {
    console.log("AYT Kimya subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: kimyaSubject.id },
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
    console.error("seed-ayt-kimya-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
