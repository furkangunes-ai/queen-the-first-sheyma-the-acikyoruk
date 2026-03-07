/**
 * TYT Matematik kazanımlarını ÖSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Matematik Dersi Öğretim Programı (2018)
 * 9. sınıf: sayfa 125-132, 10. sınıf: sayfa 133-137
 * 11-12. sınıf: sayfa 139-144
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-matematik-kazanim.ts
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
  // ==================== SAYILAR (9.3.1 Sayı Kümeleri) ====================
  Sayılar: [
    {
      code: "9.3.1.1",
      subTopicName: "Sayı Kümeleri",
      description: "Sayı kümelerini birbiriyle ilişkilendirir.",
      details: [
        "a) Doğal sayı, tam sayı, rasyonel sayı, irrasyonel sayı ve gerçek sayı kümelerinin sembolleri tanıtılarak bu sayı kümeleri arasındaki ilişki üzerinde durulur.",
        "b) √2, √3, √5 gibi sayıların sayı doğrusundaki yeri belirlenir.",
        "c) Gerçek sayılar kümesinde toplama ve çarpma işlemlerinin özellikleri üzerinde durulur.",
        "ç) ℝ nin geometrik temsilinin sayı doğrusu, ℝ×ℝ nin geometrik temsilinin de kartezyen koordinat sistemi olduğu vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== SAYI BASAMAKLARI ====================
  "Sayı Basamakları": [
    {
      code: "9.3.1.1b",
      subTopicName: "Sayı Basamakları",
      description: "Sayı basamakları ile ilgili problemler çözer.",
      details:
        "Doğal sayılarda basamak kavramı, basamak değeri ve sayı değeri üzerinde durulur.",
      isKeyKazanim: true,
    },
  ],

  // ==================== BÖLME VE BÖLÜNEBİLME (9.3.2.1) ====================
  "Bölme ve Bölünebilme": [
    {
      code: "9.3.2.1",
      subTopicName: "Bölünebilme Kuralları",
      description:
        "Tam sayılarda bölünebilme kurallarıyla ilgili problemler çözer.",
      details:
        "2, 3, 4, 5, 8, 9, 10, 11 ile bu sayılardan elde edilen 6, 12, 15 gibi sayıların bölünebilme kuralları ele alınır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== OBEB-OKEK (9.3.2.2 + 9.3.2.3) ====================
  "OBEB-OKEK": [
    {
      code: "9.3.2.2",
      subTopicName: "EBOB ve EKOK",
      description:
        "Tam sayılarda EBOB ve EKOK ile ilgili uygulamalar yapar.",
      details: [
        "a) Gerçek hayat problemlerine yer verilir.",
        "b) Elektronik tablolarda bulunan EBOB ve EKOK fonksiyonlarından yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.2.3",
      subTopicName: "Periyodik Durumlar",
      description:
        "Gerçek hayatta periyodik olarak tekrar eden durumları içeren problemleri çözer.",
      details:
        "Modüler aritmetiğe girilmeden periyodik durum içeren problemlere yer verilir.",
    },
  ],

  // ==================== RASYONEL SAYILAR ====================
  "Rasyonel Sayılar": [
    {
      code: "9.3.1.1c",
      subTopicName: "Rasyonel Sayılar",
      description:
        "Rasyonel sayılarla ilgili işlemler ve problemler çözer.",
      details:
        "Rasyonel sayıların ondalık gösterimi, kesir işlemleri ve gerçek hayat problemleri üzerinde durulur.",
      isKeyKazanim: true,
    },
  ],

  // ==================== BASİT EŞİTSİZLİKLER (9.3.3.1 + 9.3.3.2) ====================
  "Basit Eşitsizlikler": [
    {
      code: "9.3.3.1",
      subTopicName: "Aralık Kavramı",
      description:
        "Gerçek sayılar kümesinde aralık kavramını açıklar.",
      details: [
        "a) Açık, kapalı ve yarı açık aralık kavramları ile bunların gösterimleri üzerinde durulur.",
        "b) Aralıkların kartezyen çarpımlarına yer verilmez.",
      ].join("\n"),
    },
    {
      code: "9.3.3.2",
      subTopicName: "Birinci Dereceden Denklem ve Eşitsizlikler",
      description:
        "Birinci dereceden bir bilinmeyenli denklem ve eşitsizliklerin çözüm kümelerini bulur.",
      details: [
        "a) Birinci dereceden bir bilinmeyenli denklem ve eşitsizliklerin çözümü hatırlatılır.",
        "b) Harezmi'nin denklemler konusundaki çalışmalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== MUTLAK DEĞER (9.3.3.3) ====================
  "Mutlak Değer": [
    {
      code: "9.3.3.3",
      subTopicName: "Mutlak Değer İçeren Denklem ve Eşitsizlikler",
      description:
        "Mutlak değer içeren birinci dereceden bir bilinmeyenli denklem ve eşitsizliklerin çözüm kümelerini bulur.",
      details: [
        "a) Bir gerçek sayının mutlak değeri hatırlatılarak mutlak değer özellikleri verilir.",
        "b) İkiden çok mutlak değer içeren denklem ve eşitsizliklere girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ÜSLÜ SAYILAR (9.3.4.1) ====================
  "Üslü Sayılar": [
    {
      code: "9.3.4.1",
      subTopicName: "Üslü İfadeler",
      description: "Üslü ifadeleri içeren denklemleri çözer.",
      details: [
        "a) Üslü ifade kavramı hatırlatılır.",
        "b) Bir gerçek sayının tam sayı kuvveti ile ilgili uygulamalar yapılır.",
        "c) Üslü ifadelerin özellikleri üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KÖKLÜ SAYILAR (9.3.4.2) ====================
  "Köklü Sayılar": [
    {
      code: "9.3.4.2",
      subTopicName: "Köklü İfadeler",
      description: "Köklü ifadeleri içeren denklemleri çözer.",
      details: [
        "a) Köklü ifadelerin özellikleri üzerinde durulur.",
        "b) Köklü ifadeler ve üslü ifadeler arasındaki ilişkiler üzerinde durulur.",
        "c) En çok iki terimli köklü ifadelerin eşleniklerine yer verilir.",
        "ç) Köklü ifadelerde sonsuza giden iç içe köklerle yapılan işlemlere yer verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ÇARPANLARA AYIRMA (10.3.2) ====================
  "Çarpanlara Ayırma": [
    {
      code: "10.3.2.1",
      subTopicName: "Çarpanlara Ayırma",
      description: "Bir polinomu çarpanlarına ayırır.",
      details: [
        "a) Ortak çarpan parantezine alma ve değişken değiştirme yöntemleri kullanılarak çarpanlara ayırma uygulamaları yapılır.",
        "b) Tam kare, iki kare farkı, iki terimin toplamının ve farkının küpü, iki terimin küplerinin toplamı ve farkına ait özdeşlikler kullanılarak çarpanlara ayırma uygulamaları yapılır.",
        "c) ax² + bx + c biçimindeki ifadeler çarpanlarına ayrılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.2.2",
      subTopicName: "Rasyonel İfadeler",
      description:
        "Rasyonel ifadelerin sadeleştirilmesi ile ilgili işlemler yapar.",
      details: [
        "a) Rasyonel ifade kavramı tanıtılır.",
        "b) Çarpanları polinom olmayan ifadelerde çarpanlara ayırma uygulamalarına yer verilmez.",
      ].join("\n"),
    },
  ],

  // ==================== ORAN ORANTI (9.3.5.1) ====================
  "Oran Orantı": [
    {
      code: "9.3.5.1",
      subTopicName: "Oran ve Orantı",
      description:
        "Oran ve orantı kavramlarını kullanarak problemler çözer.",
      details: [
        "a) Oran, orantı, doğru orantı, ters orantı kavramları ile oran ve orantıya ait özellikler hatırlatılır.",
        "b) Altın oran tanıtılarak gerçek hayattan örnekler verilir ancak hesaplama yöntemlerine yer verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DENKLEM ÇÖZME (9.3.3.2 + 9.3.3.4) ====================
  "Denklem Çözme": [
    {
      code: "9.3.3.4",
      subTopicName: "Denklem Sistemleri",
      description:
        "Birinci dereceden iki bilinmeyenli denklem ve eşitsizlik sistemlerinin çözüm kümelerini bulur.",
      details: [
        "a) Birinci dereceden iki bilinmeyenli denklem sistemlerinin çözüm kümeleri bulunurken yerine koyma, yok etme veya grafikle çözüm yöntemlerinden faydalanılır.",
        "b) Birinci dereceden iki bilinmeyenli denklem ve eşitsizlik sistemlerinin çözümü, analitik düzlemde gösterilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== PROBLEMLER (9.3.5.2) ====================
  Problemler: [
    {
      code: "9.3.5.2",
      subTopicName: "Problemler",
      description:
        "Denklemler ve eşitsizlikler ile ilgili problemler çözer.",
      details: [
        "a) Gerçek hayat durumlarını temsil eden sözel ifadelerdeki ilişkilerin cebirsel, grafiksel ve sayısal temsilleri ile ilgili uygulamalar yapılır.",
        "b) Farklı problem çözme stratejilerinin uygulanmasını gerektiren oran, orantı kavramlarının kullanıldığı problemlere (örneğin elektrik, su vb. fatura ve ödemeler; sayı, kesir, yaş, işçi, alım-satım, kâr-zarar, yüzde ve karışım problemleri; hız ve hareket) yer verilir; faiz, havuz, saat problemlerine girilmez.",
        "c) Rutin olmayan problem türlerine de yer verilerek farklı problem çözme stratejilerinin uygulanmasına imkân verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KÜMELER (9.2) ====================
  Kümeler: [
    {
      code: "9.2.1.1",
      subTopicName: "Kümelerde Temel Kavramlar",
      description:
        "Kümeler ile ilgili temel kavramlar hatırlatılır.",
      details: [
        "a) Kümelerle ilgili gerçek hayattan örneklere yer verilir.",
        "b) Kümelerin farklı gösterimlerine yer verilir.",
        "c) Cantor'un çalışmalarına yer verilir.",
      ].join("\n"),
    },
    {
      code: "9.2.1.2",
      subTopicName: "Alt Küme",
      description: "Alt kümeyi kullanarak işlemler yapar.",
      details: [
        "a) Alt küme kavramı ve özellikleri ele alınır.",
        "b) Alt küme kavramıyla ilgili gerçek hayattan örneklere yer verilir.",
        "c) Kombinasyon gerektiren problemlere girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.1.3",
      subTopicName: "Küme Eşitliği",
      description:
        "İki kümenin eşitliğini kullanarak işlemler yapar.",
      details: [
        "a) İki kümenin eşitliği kavramı alt küme ile ilişkilendirilir.",
        "b) Denk küme kavramı verilmez.",
      ].join("\n"),
    },
    {
      code: "9.2.2.1",
      subTopicName: "Kümelerde İşlemler",
      description:
        "Kümelerde birleşim, kesişim, fark, tümleme işlemleri yardımıyla problemler çözer.",
      details: [
        "a) Kümelerin birleşim, kesişim, fark ve tümleme işlemlerinin özellikleri verilir.",
        "b) Ayrık küme kavramına yer verilir.",
        "c) En fazla üç kümenin birleşiminin eleman sayısını veren ilişkiler üzerinde durulur.",
        "ç) Kümelerle yapılan işlemler ve sembolik mantıkta kullanılan sembol, gösterim ve bunlarla ifade edilen işlemler arasında ilişkilendirmeler yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.2.2",
      subTopicName: "Kartezyen Çarpım",
      description:
        "İki kümenin kartezyen çarpımıyla ilgili işlemler yapar.",
      details: [
        "a) Sıralı ikili ve sıralı ikililerin eşitliği örneklerle açıklanır.",
        "b) Kartezyen çarpımın eleman sayısı buldurulur.",
        "c) Sadece sonlu sayıda elemanı olan kümelerin kartezyen çarpımlarının grafik çizimi yapılır.",
      ].join("\n"),
    },
  ],

  // ==================== FONKSİYONLAR (10.2) ====================
  Fonksiyonlar: [
    {
      code: "10.2.1.1",
      subTopicName: "Fonksiyon Kavramı",
      description: "Fonksiyonlarla ilgili problemler çözer.",
      details: [
        "a) Fonksiyon kavramı açıklanır.",
        "b) Sadece gerçek sayılar üzerinde tanımlanmış fonksiyonlar ele alınır.",
        "c) İçine fonksiyon, örten fonksiyon, bire bir fonksiyon, eşit fonksiyon, birim (özdeşlik) fonksiyon, sabit fonksiyon, doğrusal fonksiyon, tek fonksiyon, çift fonksiyon ve parçalı tanımlı fonksiyon açıklanır.",
        "ç) İki fonksiyonun eşitliği örneklerle açıklanır.",
        "d) f ve g fonksiyonları kullanılarak f+g, f-g, f.g, f/g işlemleri yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.1.2",
      subTopicName: "Fonksiyon Grafikleri",
      description: "Fonksiyonların grafiklerini çizer.",
      details: [
        "a) f(x) = ax + b şeklindeki fonksiyonların grafikleri ile ilgili uygulamalar yapılır.",
        "b) Parçalı tanımlı şekilde verilen fonksiyonların grafikleri çizilir.",
      ].join("\n"),
    },
    {
      code: "10.2.1.3",
      subTopicName: "Fonksiyon Grafikleri",
      description: "Fonksiyonların grafiklerini yorumlar.",
      details: [
        "a) Grafiği verilen fonksiyonların tanım ve görüntü kümeleri gösterilir.",
        "b) Bir fonksiyon grafiğinde, fonksiyonun x ekseni üzerinde tanımlı olduğu her bir noktadan y eksenine paralel çizilen doğruların, grafiği yalnızca bir noktada kestiğine (düşey/dikey doğru testi) işaret edilir.",
        "c) Bir f fonksiyonunun y = f(x) denkleminin grafiği olduğu ve grafiğin (varsa) x eksenini kestiği noktaların f(x) = 0 denkleminin gerçek sayılardaki çözüm kümesi olduğu vurgulanır.",
      ].join("\n"),
    },
    {
      code: "10.2.2.1",
      subTopicName: "Bire Bir ve Örten Fonksiyon",
      description:
        "Bire bir ve örten fonksiyonlar ile ilgili uygulamalar yapar.",
      details: [
        "a) Bir fonksiyonun bire bir ve örtenliği grafik üzerinde yatay doğru testiyle incelenir ve cebirsel olarak ilişkilendirilir.",
        "b) Bilgi ve iletişim teknolojileri yardımıyla bir fonksiyonun bire bir ve örten olup olmadığı belirlenir.",
      ].join("\n"),
    },
    {
      code: "10.2.2.2",
      subTopicName: "Bileşke Fonksiyon",
      description:
        "Fonksiyonlarda bileşke işlemiyle ilgili işlemler yapar.",
      details: [
        "a) Bileşke işlemi, fonksiyonların cebirsel ve grafik gösterimleri ile ilişkilendirilerek ele alınır.",
        "b) Fonksiyonlarda bileşke işleminin birleşme özelliğinin olduğu belirtilir, değişme özelliğinin olmadığı örneklerle gösterilir.",
        "c) Parçalı tanımlı fonksiyonların bileşkesine girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.2.3",
      subTopicName: "Ters Fonksiyon",
      description: "Verilen bir fonksiyonun tersini bulur.",
      details: [
        "a) Bir fonksiyonun tersinin de fonksiyon olması için gerekli şartlar belirtilir.",
        "b) Sadece bire bir ve örten doğrusal fonksiyonun tersinin grafiği çizilir; fonksiyonun grafiği ile tersinin grafiğinin y=x doğrusuna göre simetrik olduğu gösterilir.",
        "c) Parçalı tanımlı fonksiyonların tersi verilmez.",
      ].join("\n"),
    },
  ],

  // ==================== PERMÜTASYON (10.1.1.1 + 10.1.1.2 + 10.1.1.3) ====================
  Permütasyon: [
    {
      code: "10.1.1.1",
      subTopicName: "Sayma Yöntemleri",
      description:
        "Olayların gerçekleşme sayısını toplama ve çarpma yöntemlerini kullanarak hesaplar.",
      details: [
        "a) Sayma konusunun tarihsel gelişim sürecinden söz edilir ve bu süreçte rol alan Sâbit İbn Kurrâ'nın çalışmalarına yer verilir.",
        "b) Faktöriyel kavramı verilerek saymanın temel ilkesi ile ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.1.2",
      subTopicName: "Permütasyon",
      description:
        "n çeşit nesne ile oluşturulabilecek r'li dizilişlerin (permütasyonların) kaç farklı şekilde yapılabileceğini hesaplar.",
      isKeyKazanim: true,
    },
    {
      code: "10.1.1.3",
      subTopicName: "Tekrarlı Permütasyon",
      description:
        "Sınırlı sayıda tekrarlayan nesnelerin dizilişlerini (permütasyonlarını) açıklayarak problemler çözer.",
      details: [
        "a) En az iki tanesi özdeş olan nesnelerin tüm farklı dizilişlerinin sayısı örnekler/problemler bağlamında ele alınır.",
        "b) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== KOMBİNASYON (10.1.1.4) ====================
  Kombinasyon: [
    {
      code: "10.1.1.4",
      subTopicName: "Kombinasyon",
      description:
        "n elemanlı bir kümenin r tane elemanının kaç farklı şekilde seçilebileceğini hesaplar.",
      details: [
        "a) Kombinasyon kavramı alt küme sayısı ile ilişkilendirilir.",
        "b) Kombinasyon kavramının temel özellikleri: C(n,r) = C(n,n-r) ve C(n,0) + C(n,1) + ... + C(n,n) = 2ⁿ incelenir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== BİNOM (10.1.1.5 + 10.1.1.6) ====================
  Binom: [
    {
      code: "10.1.1.5",
      subTopicName: "Pascal Üçgeni",
      description: "Pascal üçgenini açıklar.",
      details:
        "Pascal üçgeninin, aralarında Ömer Hayyam'ın da bulunduğu Hint, Çin, İslam medeniyetlerindeki matematikçi ve düşünürler tarafından Pascal'dan çok önceleri ele alındığı vurgulanır.",
    },
    {
      code: "10.1.1.6",
      subTopicName: "Binom Açılımı",
      description: "Binom açılımını yapar.",
      details: [
        "a) Binom açılımı Pascal üçgeni ile ilişkilendirilir.",
        "b) Sadece iki terimli ifadelerin açılımı ele alınır.",
        "c) Binom formülü ile ilgili örnekler yapılır ancak (ax + by)ⁿ açılımında n ∈ ℕ, a,b ∈ ℚ' şeklindeki örneklere yer verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== OLASILIK (10.1.2 + 11.7) ====================
  Olasılık: [
    {
      code: "10.1.2.1",
      subTopicName: "Temel Olasılık Kavramları",
      description:
        "Örnek uzay, deney, çıktı, bir olayın tümleyeni, kesin olay, imkânsız olay, ayrık olay ve ayrık olmayan olay kavramlarını açıklar.",
      details: [
        "a) Örnek uzay, deney, çıktı kavramları eş olası durumlardan yola çıkılarak eş olası olmayan durumlar için de örneklendirilir ve tanımlanır.",
        "b) Ayrık olay ve ayrık olmayan olay üzerinde durulur.",
        "c) El Kindî ve Laplace'ın çalışmalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2.2",
      subTopicName: "Olasılık Uygulamaları",
      description:
        "Olasılık kavramı ile ilgili uygulamalar yapar.",
      details: [
        "a) Eş olası olan ve olmayan olayların olasılıkları hesaplanır.",
        "b) Tümleyen, ayrık olay ve ayrık olmayan olay ile ilgili olasılıklar hesaplanır.",
        "c) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.7.1.1",
      subTopicName: "Koşullu Olasılık",
      description:
        "Koşullu olasılığı açıklayarak problemler çözer.",
      details: [
        "a) Olasılık konusunun tarihsel gelişim sürecinden bahsedilir.",
        "b) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
    },
    {
      code: "11.7.1.2",
      subTopicName: "Bağımlı ve Bağımsız Olaylar",
      description:
        "Bağımlı ve bağımsız olayları açıklayarak gerçekleşme olasılıklarını hesaplar.",
      details: "Gerçek hayat problemlerine yer verilir.",
    },
    {
      code: "11.7.1.3",
      subTopicName: "Bileşik Olay",
      description:
        "Bileşik olayı açıklayarak gerçekleşme olasılığını hesaplar.",
      details: [
        "a) Ağaç şemasından yararlanılır.",
        "b) En fazla üç aşamalı olaylardan seçim yapılır.",
        "c) 've, veya' bağlaçları ile oluşturulan olayların olasılıkları hesaplatılır.",
        "ç) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
    },
    {
      code: "11.7.2.1",
      subTopicName: "Deneysel ve Teorik Olasılık",
      description:
        "Deneysel olasılık ile teorik olasılığı ilişkilendirir.",
      details: "Bilgi ve iletişim teknolojilerinden yararlanılır.",
    },
  ],

  // ==================== İSTATİSTİK (9.5) ====================
  İstatistik: [
    {
      code: "9.5.1.1",
      subTopicName: "Merkezî Eğilim ve Yayılım Ölçüleri",
      description:
        "Verileri merkezî eğilim ve yayılım ölçülerini hesaplayarak yorumlar.",
      details: [
        "a) Veri kavramı, kesikli veri ve sürekli veri çeşitleri verilir.",
        "b) Aritmetik ortalama, ortanca, tepe değer, en büyük değer, en küçük değer ve açıklık kavramları verilir.",
        "c) Alt çeyrek, üst çeyrek ve çeyrekler açıklığına yer verilmez.",
        "ç) Veri sayısı en fazla beş olan veri grupları için standart sapma hesaplanır.",
        "d) Gerçek hayat durumlarında aritmetik ortalama, ortanca, tepe değer kavramları birlikte yorumlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.5.2.1",
      subTopicName: "Histogram",
      description:
        "Bir veri grubuna ilişkin histogram oluşturur.",
      details: [
        "a) Histogram oluştururken veri grubunun açıklığı seçilen grup sayısına bölünür ve aşağıdaki eşitsizliği sağlayan en küçük doğal sayı değeri grup genişliği olarak belirlenir.",
        "b) Veri gruplarının histogramı çizilir.",
      ].join("\n"),
    },
    {
      code: "9.5.2.2",
      subTopicName: "Grafik Gösterimi",
      description:
        "Gerçek hayat durumunu yansıtan veri gruplarını uygun grafik türleriyle temsil ederek yorumlar.",
      details: [
        "a) İkiden fazla veri grubunun karşılaştırıldığı durumlara da yer verilir.",
        "b) Serpme ve kutu grafiklerine yer verilmez.",
        "c) Grafik türleri bilgi ve iletişim teknolojileri kullanılarak çizilir.",
      ].join("\n"),
    },
  ],

  // ==================== 2. DERECEDEN DENKLEMLER (10.4.1) ====================
  "2. Dereceden Denklemler": [
    {
      code: "10.4.1.1",
      subTopicName: "İkinci Dereceden Denklem Kavramı",
      description:
        "İkinci dereceden bir bilinmeyenli denklem kavramını açıklar.",
      details:
        "İkinci dereceden bir bilinmeyenli denklemlerin tarihsel gelişim sürecine ve bu süreçte rol alan Brahmagupta, Harezmi ve Abdulhamid İbn Türk'ün çalışmalarına yer verilir.",
    },
    {
      code: "10.4.1.2",
      subTopicName: "İkinci Dereceden Denklemlerin Çözümü",
      description:
        "İkinci dereceden bir bilinmeyenli denklemleri çözer.",
      details: [
        "a) ax² + bx + c biçimindeki cebirsel ifadelerin; tam kare ve iki kare farkına ait özdeşlikler kullanılarak çarpanlara ayrılmasıyla ilgili uygulamalar yapılır.",
        "b) Denklemlerin çözümünde farklı yöntemlerden (çarpanlara ayırma, tam kareye tamamlama, değişken değiştirme, iki kare farkı, diskriminant) yararlanılır.",
        "c) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.4.1.4",
      subTopicName: "Kökler ve Katsayılar",
      description:
        "İkinci dereceden bir bilinmeyenli denklemin kökleri ile katsayıları arasındaki ilişkileri kullanarak işlemler yapar.",
      details: [
        "a) Sadece kökler toplamı ve çarpımı ile denklemin katsayıları arasındaki ilişkiler üzerinde durulur.",
        "b) Kökleri verilen ikinci dereceden denklemi elde etme ile ilgili uygulamalara yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KARMAŞIK SAYILAR (10.4.1.3) ====================
  "Karmaşık Sayılar": [
    {
      code: "10.4.1.3",
      subTopicName: "Karmaşık Sayılar",
      description:
        "Bir karmaşık sayının a+ib (a,b ∈ ℝ) biçiminde ifade edildiğini açıklar.",
      details: [
        "a) Diskriminantın sıfırdan küçük olduğu durumlarda ikinci dereceden bir bilinmeyenli denklemlerin köklerinin bulunabilmesi için gerçek sayılar kümesini kapsayan yeni bir sayı kümesi tanımlama gereği örneklerle açıklanır.",
        "b) i² = -1 olmak üzere bir karmaşık sayı a + ib (a, b ∈ ℝ) biçiminde gösterilir.",
        "c) Köklerin birbirinin eşleniği olduğu belirtilir.",
        "ç) Karmaşık sayının eşleniği dışındaki özelliklere ve işlemlere girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== PARABOL (11.3.2) ====================
  Parabol: [
    {
      code: "11.3.2.1",
      subTopicName: "Parabolün Grafiği",
      description:
        "İkinci dereceden bir değişkenli fonksiyonun grafiğini çizerek yorumlar.",
      details: [
        "a) Fonksiyonun grafiğinin tepe noktası, eksenleri kestiği noktalar ve simetri ekseni buldurulur.",
        "b) Fonksiyonun grafiğinin tepe noktası ile fonksiyonun en küçük ya da en büyük değeri ilişkilendirilir.",
        "c) Fonksiyonun katsayılarındaki değişimin, fonksiyonun grafiği üzerine etkisi bilgi ve iletişim teknolojilerinden yararlanılarak yorumlanır.",
        "ç) Biri tepe noktası olmak üzere iki noktası verilen veya biri y ekseni üzerinde olmak üzere üç noktası verilen ikinci dereceden fonksiyon oluşturulur.",
        "d) Bir doğru ile bir parabolün birbirine göre durumları incelenir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.3.2.2",
      subTopicName: "Parabol Problemleri",
      description:
        "İkinci dereceden fonksiyonlarla modellenebilen problemleri çözer.",
    },
  ],

  // ==================== POLİNOMLAR (10.3.1) ====================
  Polinomlar: [
    {
      code: "10.3.1.1",
      subTopicName: "Polinom Kavramı",
      description:
        "Bir değişkenli polinom kavramını açıklar.",
      details: [
        "a) Polinomun derecesi, katsayıları ve sabit terimi belirtilir.",
        "b) Sabit polinom, sıfır polinomu ve iki polinomun eşitliği örneklerle açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.1.2",
      subTopicName: "Polinom İşlemleri",
      description:
        "Polinomlarla toplama, çıkarma, çarpma ve bölme işlemlerini yapar.",
      details: [
        "a) Bir P(x) polinomunun x – a ile bölümünden kalan P(a) dır. P(a) = 0 ⟺ x – a, P(x) in bir çarpanı olduğu vurgulanır.",
        "b) Polinomun sıfırı kavramı bölme işlemiyle ilişkilendirilir.",
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

  const matematikSubject = await prisma.subject.findFirst({
    where: { name: "Matematik", examTypeId: tyt.id },
  });
  if (!matematikSubject) {
    console.log("TYT Matematik subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: matematikSubject.id },
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
    console.error("seed-tyt-matematik-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
