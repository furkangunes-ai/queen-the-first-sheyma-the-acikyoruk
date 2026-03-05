/**
 * AYT Matematik kazanımlarını ÖSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Matematik Dersi Öğretim Programı (2018), sayfa 124-148
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-ayt-mat-kazanim.ts
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
  // ==================== MANTIK (9.1) ====================
  Mantık: [
    {
      code: "9.1.1.1",
      subTopicName: "Önermeler ve Bileşik Önermeler",
      description:
        "Önermeyi, önermenin doğruluk değerini, iki önermenin denkliğini ve önermenin değilini açıklar.",
      details: "Boole ve Leibniz'in çalışmalarına yer verilir.",
    },
    {
      code: "9.1.1.2",
      subTopicName: "Önermeler ve Bileşik Önermeler",
      description:
        'Bileşik önermeyi örneklerle açıklar, "ve, veya, ya da" bağlaçları ile kurulan bileşik önermelerin özelliklerini ve De Morgan kurallarını doğruluk tablosu kullanarak gösterir.',
    },
    {
      code: "9.1.1.3",
      subTopicName: "Önermeler ve Bileşik Önermeler",
      description:
        "Koşullu önermeyi ve iki yönlü koşullu önermeyi açıklar.",
      details: [
        "a) Koşullu önermenin karşıtı, tersi, karşıt tersi verilir.",
        'b) p ⇒ q ≡ p\' ∨ q olduğu doğruluk tablosu yardımıyla gösterilir.',
        'c) "ve, veya, ya da, ise" bağlaçları kullanılarak verilen, en fazla üç önerme içeren ve en fazla dört bileşenli bileşik önermelere denk basit önermeler buldurulur.',
        "ç) p ⇔ q ≡ (p ⇒ q) ∧ (q ⇒ p) olduğu doğruluk tablosu ile gösterilir.",
      ].join("\n"),
    },
    {
      code: "9.1.1.4",
      subTopicName: "Önermeler ve Bileşik Önermeler",
      description:
        "Her (∀) ve bazı (∃) niceleyicilerini örneklerle açıklar.",
      details:
        "Sözel olarak verilen ve niceleyici içeren açık önermeler, sembolik mantık diliyle; sembolik mantık diliyle verilen ve niceleyici içeren açık önermeler de sözel olarak ifade edilir.",
    },
    {
      code: "9.1.1.5",
      subTopicName: "Önermeler ve Bileşik Önermeler",
      description:
        "Tanım, aksiyom, teorem ve ispat kavramlarını açıklar.",
      details: "Bir teoremin hipotezi ve hükmü belirtilir.",
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
      subTopicName: "Kümelerde Temel Kavramlar",
      description: "Alt kümeyi kullanarak işlemler yapar.",
      details: [
        "a) Alt küme kavramı ve özellikleri ele alınır.",
        "b) Alt küme kavramıyla ilgili gerçek hayattan örneklere yer verilir.",
        "c) Kombinasyon gerektiren problemlere girilmez.",
      ].join("\n"),
    },
    {
      code: "9.2.1.3",
      subTopicName: "Kümelerde Temel Kavramlar",
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
        "d) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.2.2",
      subTopicName: "Kümelerde İşlemler",
      description:
        "İki kümenin kartezyen çarpımıyla ilgili işlemler yapar.",
      details: [
        "a) Sıralı ikili ve sıralı ikililerin eşitliği örneklerle açıklanır.",
        "b) Kartezyen çarpımın eleman sayısı buldurulur.",
        "c) Sadece sonlu sayıda elemanı olan kümelerin kartezyen çarpımlarının grafik çizimi yapılır.",
      ].join("\n"),
    },
  ],

  // ==================== TEMEL KAVRAMLAR (9.3.1 Sayı Kümeleri + 9.3.2 Bölünebilme) ====================
  "Temel Kavramlar": [
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
    },
    {
      code: "9.3.2.1",
      subTopicName: "Bölünebilme Kuralları",
      description:
        "Tam sayılarda bölünebilme kurallarıyla ilgili problemler çözer.",
      details:
        "2, 3, 4, 5, 8, 9, 10, 11 ile bu sayılardan elde edilen 6, 12, 15 gibi sayıların bölünebilme kuralları ele alınır.",
    },
    {
      code: "9.3.2.2",
      subTopicName: "Bölünebilme Kuralları",
      description:
        "Tam sayılarda EBOB ve EKOK ile ilgili uygulamalar yapar.",
      details: [
        "a) Gerçek hayat problemlerine yer verilir.",
        "b) Elektronik tablolarda bulunan EBOB ve EKOK fonksiyonlarından yararlanılır.",
      ].join("\n"),
    },
    {
      code: "9.3.2.3",
      subTopicName: "Bölünebilme Kuralları",
      description:
        "Gerçek hayatta periyodik olarak tekrar eden durumları içeren problemleri çözer.",
      details:
        "Modüler aritmetiğe girilmeden periyodik durum içeren problemlere yer verilir.",
    },
  ],

  // ==================== BASİT EŞİTSİZLİKLER (9.3.3 kısmen) ====================
  "Basit Eşitsizlikler": [
    {
      code: "9.3.3.1",
      subTopicName: "Birinci Dereceden Denklemler ve Eşitsizlikler",
      description:
        "Gerçek sayılar kümesinde aralık kavramını açıklar.",
      details: [
        "a) Açık, kapalı ve yarı açık aralık kavramları ile bunların gösterimleri üzerinde durulur.",
        "b) Aralıkların kartezyen çarpımlarına yer verilmez.",
      ].join("\n"),
    },
    {
      code: "9.3.3.2",
      subTopicName: "Birinci Dereceden Denklemler ve Eşitsizlikler",
      description:
        "Birinci dereceden bir bilinmeyenli denklem ve eşitsizliklerin çözüm kümelerini bulur.",
      details: [
        "a) Birinci dereceden bir bilinmeyenli denklem ve eşitsizliklerin çözümü hatırlatılır.",
        "b) Harezmî'nin denklemler konusundaki çalışmalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== MUTLAK DEĞER (9.3.3.3) ====================
  "Mutlak Değer": [
    {
      code: "9.3.3.3",
      subTopicName: "Birinci Dereceden Denklemler ve Eşitsizlikler",
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
      subTopicName: "Üslü İfadeler ve Denklemler",
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
      subTopicName: "Üslü İfadeler ve Denklemler",
      description: "Köklü ifadeleri içeren denklemleri çözer.",
      details: [
        "a) Köklü ifadelerin özellikleri üzerinde durulur.",
        "b) x ∈ ℝ⁺ ve m, n ∈ ℤ⁺ için n > 1 olmak üzere ⁿ√(xᵐ) = x^(m/n) olduğu vurgulanarak köklü ifadeler ve üslü ifadeler arasındaki ilişkiler üzerinde durulur.",
        "c) En çok iki terimli köklü ifadelerin eşleniklerine yer verilir.",
        "ç) Köklü ifadelerde sonsuza giden iç içe köklerle yapılan işlemlere yer verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DENKLEM ÇÖZME (9.3.3.4) ====================
  "Denklem Çözme": [
    {
      code: "9.3.3.4",
      subTopicName: "Birinci Dereceden Denklemler ve Eşitsizlikler",
      description:
        "Birinci dereceden iki bilinmeyenli denklem ve eşitsizlik sistemlerinin çözüm kümelerini bulur.",
      details: [
        "a) Birinci dereceden iki bilinmeyenli denklem sistemlerinin çözüm kümeleri bulunurken yerine koyma, yok etme veya grafikle çözüm yöntemlerinden faydalanılır.",
        "b) Birinci dereceden iki bilinmeyenli denklem ve eşitsizlik sistemlerinin çözümü, analitik düzlemde gösterilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ORAN-ORANTI (9.3.5.1) ====================
  "Oran-Orantı": [
    {
      code: "9.3.5.1",
      subTopicName: "Denklemler ve Eşitsizliklerle İlgili Uygulamalar",
      description:
        "Oran ve orantı kavramlarını kullanarak problemler çözer.",
      details: [
        "a) Oran, orantı, doğru orantı, ters orantı kavramları ile oran ve orantıya ait özellikler hatırlatılır.",
        "b) Altın oran tanıtılarak gerçek hayattan örnekler verilir ancak hesaplama yöntemlerine yer verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== PROBLEMLER (9.3.5.2) ====================
  Problemler: [
    {
      code: "9.3.5.2",
      subTopicName: "Denklemler ve Eşitsizliklerle İlgili Uygulamalar",
      description:
        "Denklemler ve eşitsizlikler ile ilgili problemler çözer.",
      details: [
        "a) Gerçek hayat durumlarını temsil eden sözel ifadelerdeki ilişkilerin cebirsel, grafiksel ve sayısal temsilleri ile ilgili uygulamalar yapılır.",
        "b) Farklı problem çözme stratejilerinin uygulanmasını gerektiren oran, orantı kavramlarının kullanıldığı problemlere (elektrik, su vb. fatura ve ödemeler; sayı, kesir, yaş, işçi, alım-satım, kâr-zarar, yüzde ve karışım problemleri; hız ve hareket) yer verilir; faiz, havuz, saat problemlerine girilmez.",
        "c) Rutin olmayan problem türlerine de yer verilerek farklı problem çözme stratejilerinin uygulanmasına imkân verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== FONKSİYONLAR (10.2 + 11.3.1 + 11.3.3) ====================
  Fonksiyonlar: [
    {
      code: "10.2.1.1",
      subTopicName: "Fonksiyon Kavramı ve Gösterimi",
      description: "Fonksiyonlarla ilgili problemler çözer.",
      details: [
        "a) Fonksiyon kavramı açıklanır.",
        "b) Sadece gerçek sayılar üzerinde tanımlanmış fonksiyonlar ele alınır.",
        "c) İçine fonksiyon, örten fonksiyon, bire bir fonksiyon, eşit fonksiyon, birim (özdeşlik) fonksiyon, sabit fonksiyon, doğrusal fonksiyon, tek fonksiyon, çift fonksiyon ve parçalı tanımlı fonksiyon açıklanır.",
        "ç) İki fonksiyonun eşitliği örneklerle açıklanır.",
        "d) f ve g fonksiyonları kullanılarak f + g, f − g, f.g, f/g işlemleri yapılır, ancak parçalı tanımlı fonksiyonlarda bu işlemlere girilmez.",
        "e) Gerçek hayat problemlerine ve tablo-grafik kullanımına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.1.2",
      subTopicName: "Fonksiyon Kavramı ve Gösterimi",
      description: "Fonksiyonların grafiklerini çizer.",
      details: [
        "a) f(x) = ax + b şeklindeki fonksiyonların grafikleri ile ilgili uygulamalar yapılır.",
        "b) Parçalı tanımlı şekilde verilen fonksiyonların grafikleri çizilir.",
        "c) f(x) = ax + b tipindeki fonksiyonların grafiği bilgi ve iletişim teknolojileri yardımıyla çizilerek a ve b katsayıları ile fonksiyon grafiği arasındaki ilişki ele alınır.",
      ].join("\n"),
    },
    {
      code: "10.2.1.3",
      subTopicName: "Fonksiyon Kavramı ve Gösterimi",
      description: "Fonksiyonların grafiklerini yorumlar.",
      details: [
        "a) Grafiği verilen fonksiyonların tanım ve görüntü kümeleri gösterilir.",
        "b) Bir fonksiyon grafiğinde, fonksiyonun x ekseni üzerinde tanımlı olduğu her bir noktadan y eksenine paralel çizilen doğruların, grafiği yalnızca bir noktada kestiğine (düşey/dikey doğru testi) işaret edilir.",
        "c) Bir f fonksiyonunun y = f(x) denkleminin grafiği olduğu ve grafiğin (varsa), x eksenini kestiği noktaların f(x) = 0 denkleminin gerçek sayılardaki çözüm kümesi olduğu vurgulanır.",
      ].join("\n"),
    },
    {
      code: "10.2.1.4",
      subTopicName: "Fonksiyon Kavramı ve Gösterimi",
      description:
        "Gerçek hayat durumlarından doğrusal fonksiyonlarla ifade edilebilenlerin grafik gösterimlerini yapar.",
    },
    {
      code: "10.2.2.1",
      subTopicName: "İki Fonksiyonun Bileşkesi ve Bir Fonksiyonun Tersi",
      description:
        "Bire bir ve örten fonksiyon ile ilgili uygulamalar yapar.",
      details: [
        "a) Bir fonksiyonun bire bir ve örtenliği grafik üzerinde yatay doğru testiyle incelenir ve cebirsel olarak ilişkilendirilir.",
        "b) Bilgi ve iletişim teknolojileri yardımıyla bir fonksiyonun bire bir ve örten olup olmadığı belirlenir.",
      ].join("\n"),
    },
    {
      code: "10.2.2.2",
      subTopicName: "İki Fonksiyonun Bileşkesi ve Bir Fonksiyonun Tersi",
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
      subTopicName: "İki Fonksiyonun Bileşkesi ve Bir Fonksiyonun Tersi",
      description: "Verilen bir fonksiyonun tersini bulur.",
      details: [
        "a) Bir fonksiyonun tersinin de fonksiyon olması için gerekli şartlar belirtilir.",
        "b) Sadece bire bir ve örten doğrusal fonksiyonun tersinin grafiği çizilir; fonksiyonun grafiği ile tersinin grafiğinin y=x doğrusuna göre simetrik olduğu gösterilir.",
        "c) Parçalı tanımlı fonksiyonların tersi verilmez.",
      ].join("\n"),
    },
    {
      code: "11.3.1.1",
      subTopicName: "Fonksiyonlarla İlgili Uygulamalar",
      description:
        "Fonksiyonun grafik ve tablo temsilini kullanarak problem çözer.",
      details: [
        "a) Grafiğin x ve y eksenlerini kestiği noktalar; fonksiyonun pozitif, negatif, artan ve azalan olduğu aralıklar; fonksiyonun maksimum ve minimum değerleri ve bunların (verilen durum bağlamında) anlamları grafik üzerinden açıklanır.",
        "b) Cebirsel ifade, grafik veya tablo ile verilen bir fonksiyonun belli bir aralıktaki ortalama değişim hızı (kesenin eğimi) hesaplanır.",
        "c) Fonksiyonun grafiği bilgi ve iletişim teknolojileri yardımıyla çizilir ve yorumlanır.",
      ].join("\n"),
    },
    {
      code: "11.3.3.1",
      subTopicName: "Fonksiyonların Dönüşümleri",
      description:
        "Bir fonksiyonun grafiğinden, dönüşümler yardımı ile yeni fonksiyon grafikleri çizer.",
      details: [
        "a) Tek ve çift fonksiyonların grafiğinin simetri özellikleri üzerinde durulur.",
        "b) y = f(x) + b, y = f(x − a), y = k f(x), y = f(kx), y = −f(x), y = f(−x) dönüşümlerinin grafikleri bilgi ve iletişim teknolojilerinden yararlanılarak verilir.",
      ].join("\n"),
    },
  ],

  // ==================== POLİNOMLAR (10.3.1) ====================
  Polinomlar: [
    {
      code: "10.3.1.1",
      subTopicName: "Polinom Kavramı ve Polinomlarla İşlemler",
      description: "Bir değişkenli polinom kavramını açıklar.",
      details: [
        "a) Polinomun derecesi, katsayıları ve sabit terimi belirtilir.",
        "b) Sabit polinom, sıfır polinomu ve iki polinomu eşitliği örneklerle açıklanır.",
      ].join("\n"),
    },
    {
      code: "10.3.1.2",
      subTopicName: "Polinom Kavramı ve Polinomlarla İşlemler",
      description:
        "Polinomlarla toplama, çıkarma, çarpma ve bölme işlemlerini yapar.",
      details: [
        "a) Bir P(x) polinomunun x − a ile bölümünden kalan P(a) dır. P(a) = 0 ⇔ x − a, P(x) in bir çarpanı olduğu vurgulanır.",
        "b) Polinomun sıfırı kavramı bölme işlemiyle ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ÇARPANLARA AYIRMA (10.3.2) ====================
  "Çarpanlara Ayırma": [
    {
      code: "10.3.2.1",
      subTopicName: "Polinomların Çarpanlara Ayrılması",
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
      subTopicName: "Polinomların Çarpanlara Ayrılması",
      description:
        "Rasyonel ifadelerin sadeleştirilmesi ile ilgili işlemler yapar.",
      details: [
        "a) Rasyonel ifade kavramı tanıtılır.",
        "b) Çarpanları polinom olmayan ifadelerde çarpanlara ayırma uygulamalarına yer verilmez.",
      ].join("\n"),
    },
  ],

  // ==================== PERMÜTASYON (10.1.1 kısmen) ====================
  Permütasyon: [
    {
      code: "10.1.1.1",
      subTopicName: "Sıralama ve Seçme",
      description:
        "Olayların gerçekleşme sayısını toplama ve çarpma yöntemlerini kullanarak hesaplar.",
      details: [
        "a) Sayma konusunun tarihsel gelişim sürecinden söz edilir ve bu süreçte rol alan Sâbit İbn Kurrâ'nın çalışmalarına yer verilir.",
        "b) Faktöriyel kavramı verilerek saymanın temel ilkesi ile ilişkilendirilir.",
      ].join("\n"),
    },
    {
      code: "10.1.1.2",
      subTopicName: "Sıralama ve Seçme",
      description:
        "n çeşit nesne ile oluşturulabilecek r li dizilişlerin (permütasyonların) kaç farklı şekilde yapılabileceğini hesaplar.",
      isKeyKazanim: true,
    },
    {
      code: "10.1.1.3",
      subTopicName: "Sıralama ve Seçme",
      description:
        "Sınırlı sayıda tekrarlayan nesnelerin dizilişlerini (permütasyonlarını) açıklayarak problemler çözer.",
      details: [
        "a) En az iki tanesi özdeş olan nesnelerin tüm farklı dizilişlerinin sayısı örnekler/problemler bağlamında ele alınır.",
        "b) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== KOMBİNASYON (10.1.1 kısmen) ====================
  Kombinasyon: [
    {
      code: "10.1.1.4",
      subTopicName: "Sıralama ve Seçme",
      description:
        "n elemanlı bir kümenin r tane elemanının kaç farklı şekilde seçilebileceğini hesaplar.",
      details: [
        "a) Kombinasyon kavramı alt küme sayısı ile ilişkilendirilir.",
        "b) Kombinasyon kavramının temel özellikleri incelenir: C(n,r) = C(n,n−r) ve C(n,0) + C(n,1) + ... + C(n,n) = 2ⁿ",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.1.5",
      subTopicName: "Sıralama ve Seçme",
      description: "Pascal üçgenini açıklar.",
      details:
        "Pascal üçgeninin, aralarında Ömer Hayyam'ın da bulunduğu Hint, Çin, İslam medeniyetlerindeki matematikçi ve düşünürler tarafından Pascal'dan çok önceleri ele alındığı; bu çerçevede matematiksel bilginin oluşumunda farklı kültür ve bilim insanlarının rolü vurgulanır.",
    },
  ],

  // ==================== BİNOM (10.1.1.6) ====================
  Binom: [
    {
      code: "10.1.1.6",
      subTopicName: "Sıralama ve Seçme",
      description: "Binom açılımını yapar.",
      details: [
        "a) Binom açılımı Pascal üçgeni ile ilişkilendirilir.",
        "b) Sadece iki terimli ifadelerin açılımı ele alınır.",
        "c) Binom formülü ile ilgili örnekler yapılır ancak (ax + by)ⁿ açılımında n ∈ ℕ, a, b ∈ ℚ' şeklindeki örneklere yer verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== OLASILIK (10.1.2 + 11.7) ====================
  Olasılık: [
    {
      code: "10.1.2.1",
      subTopicName: "Basit Olayların Olasılıkları",
      description:
        "Örnek uzay, deney, çıktı, bir olayın tümleyeni, kesin olay, imkânsız olay, ayrık olay ve ayrık olmayan olay kavramlarını açıklar.",
      details: [
        "a) Örnek uzay, deney, çıktı kavramları eş olası durumlardan yola çıkılarak eş olası olmayan durumlar için de örneklendirilir ve tanımlanır.",
        "b) Ayrık olay ve ayrık olmayan olay üzerinde durulur.",
        "c) El Kindî ve Laplace'ın çalışmalarına yer verilir.",
      ].join("\n"),
    },
    {
      code: "10.1.2.2",
      subTopicName: "Basit Olayların Olasılıkları",
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
      isKeyKazanim: true,
    },
    {
      code: "11.7.1.2",
      subTopicName: "Koşullu Olasılık",
      description:
        "Bağımlı ve bağımsız olayları açıklayarak gerçekleşme olasılıklarını hesaplar.",
      details: "Gerçek hayat problemlerine yer verilir.",
    },
    {
      code: "11.7.1.3",
      subTopicName: "Koşullu Olasılık",
      description:
        "Bileşik olayı açıklayarak gerçekleşme olasılığını hesaplar.",
      details: [
        "a) Ağaç şemasından yararlanılır.",
        "b) En fazla üç aşamalı olaylardan seçim yapılır.",
        'c) "ve, veya" bağlaçları ile oluşturulan olayların olasılıkları hesaplatılır.',
        "ç) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
    },
    {
      code: "11.7.2.1",
      subTopicName: "Deneysel ve Teorik Olasılık",
      description:
        "Deneysel olasılık ile teorik olasılığı ilişkilendirir.",
      details:
        "Bilgi ve iletişim teknolojilerinden yararlanılır.",
    },
  ],

  // ==================== İSTATİSTİK (9.5) ====================
  İstatistik: [
    {
      code: "9.5.1.1",
      subTopicName: "Merkezî Eğilim ve Yayılım Ölçüleri",
      description:
        "Verileri merkezî eğilim ve yayılım ölçüleri hesaplayarak yorumlar.",
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
      subTopicName: "Verilerin Grafikle Gösterilmesi",
      description:
        "Bir veri grubuna ilişkin histogram oluşturur.",
      details: [
        "a) Histogram oluşturulurken veri grubunun açıklığı seçilen grup sayısına bölünür ve aşağıdaki eşitsizliği sağlayan en küçük doğal sayı değeri grup genişliği olarak belirlenir.",
        "b) Veri gruplarının histogramı çizilir.",
      ].join("\n"),
    },
    {
      code: "9.5.2.2",
      subTopicName: "Verilerin Grafikle Gösterilmesi",
      description:
        "Gerçek hayat durumunu yansıtan veri gruplarını uygun grafik türleriyle temsil ederek yorumlar.",
      details: [
        "a) İkiden fazla veri grubunun karşılaştırıldığı durumlara da yer verilir.",
        "b) Serpme ve kutu grafiklerine yer verilmez.",
        "c) Grafik türleri bilgi ve iletişim teknolojileri kullanılarak çizilir.",
        "ç) Tasarruf bilinci kazandırmak amacıyla ekmek israfı, su israfı gibi konulara ilişkin veriler kullanılarak grafik oluşturulması sağlanır.",
      ].join("\n"),
    },
  ],

  // ==================== 2. DERECEDEN DENKLEMLER (10.4.1 + 11.4.1) ====================
  "2. Dereceden Denklemler": [
    {
      code: "10.4.1.1",
      subTopicName: "İkinci Dereceden Bir Bilinmeyenli Denklemler",
      description:
        "İkinci dereceden bir bilinmeyenli denklem kavramını açıklar.",
      details:
        "İkinci dereceden bir bilinmeyenli denklemlerin tarihsel gelişim sürecine ve bu süreçte rol alan Brahmagupta, Harezmî ve Abdulhamid İbn Türk'ün çalışmalarına yer verilir.",
    },
    {
      code: "10.4.1.2",
      subTopicName: "İkinci Dereceden Bir Bilinmeyenli Denklemler",
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
      subTopicName: "İkinci Dereceden Bir Bilinmeyenli Denklemler",
      description:
        "İkinci dereceden bir bilinmeyenli denklemin kökleri ile katsayıları arasındaki ilişkileri kullanarak işlemler yapar.",
      details: [
        "a) Sadece kökler toplamı ve çarpımı ile denklemin katsayıları arasındaki ilişkiler üzerinde durulur.",
        "b) Kökleri verilen ikinci dereceden denklemi elde etme ile ilgili uygulamalara yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.1.1",
      subTopicName: "İkinci Dereceden İki Bilinmeyenli Denklem Sistemleri",
      description:
        "İkinci dereceden iki bilinmeyenli denklem sistemlerinin çözüm kümesini bulur.",
      details:
        "Bilgi ve iletişim teknolojilerinden yararlanılarak çizilen grafikler yardımıyla çözüm yorumlatılır.",
    },
  ],

  // ==================== KARMAŞIK SAYILAR (10.4.1.3) ====================
  "Karmaşık Sayılar": [
    {
      code: "10.4.1.3",
      subTopicName: "İkinci Dereceden Bir Bilinmeyenli Denklemler",
      description:
        "Bir karmaşık sayının a+ib (a,b ∈ ℝ) biçiminde ifade edildiğini açıklar.",
      details: [
        "a) Diskriminantın sıfırdan küçük olduğu durumlarda ikinci dereceden bir bilinmeyenli denklemlerin köklerinin bulunabilmesi için gerçek sayılar kümesini kapsayan yeni bir sayı kümesi tanımlama gereği örneklerle açıklanır.",
        "b) i² = −1 olmak üzere bir karmaşık sayı a + ib (a, b ∈ ℝ) biçiminde gösterilir.",
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
      subTopicName: "İkinci Dereceden Fonksiyonlar ve Grafikleri",
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
      subTopicName: "İkinci Dereceden Fonksiyonlar ve Grafikleri",
      description:
        "İkinci dereceden fonksiyonlarla modellenebilen problemler çözer.",
    },
  ],

  // ==================== EŞİTSİZLİKLER (11.4.2) ====================
  Eşitsizlikler: [
    {
      code: "11.4.2.1",
      subTopicName:
        "İkinci Dereceden Bir Bilinmeyenli Eşitsizlikler ve Eşitsizlik Sistemleri",
      description:
        "İkinci dereceden bir bilinmeyenli eşitsizliklerin çözüm kümesini bulur.",
      details: [
        "a) ax + b veya ax² + bx + c şeklindeki ifadelerin çarpımı veya bölümü biçiminde verilen eşitsizliklerin çözüm kümesi buldurulur.",
        "b) Bilgi ve iletişim teknolojilerinden yararlanılarak çizilen grafikler yardımıyla çözüm yorumlatılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.2.2",
      subTopicName:
        "İkinci Dereceden Bir Bilinmeyenli Eşitsizlikler ve Eşitsizlik Sistemleri",
      description:
        "İkinci dereceden bir bilinmeyenli eşitsizlik sistemlerinin çözüm kümesini bulur.",
    },
  ],

  // ==================== LOGARİTMA (12.1) ====================
  Logaritma: [
    {
      code: "12.1.1.1",
      subTopicName: "Üstel Fonksiyon",
      description: "Üstel fonksiyonu açıklar.",
      details: [
        "a) Üstel fonksiyonlara neden ihtiyaç duyulduğu vurgulanmalıdır.",
        "b) Üslü ifadeler ve bunlarla yapılan işlemlerin özellikleri hatırlatılır.",
        "c) Üstel fonksiyonların bire bir ve örten olduğu grafik yardımıyla gösterilir.",
        "ç) a nın aldığı değerlere göre f(x) = aˣ fonksiyonunun grafiğinin değişimini incelemek için bilgi ve iletişim teknolojilerinden de yararlanılır.",
      ].join("\n"),
    },
    {
      code: "12.1.2.1",
      subTopicName: "Logaritma Fonksiyonu",
      description:
        "Logaritma fonksiyonu ile üstel fonksiyonu ilişkilendirerek problemler çözer.",
      details: [
        "a) a ∈ ℝ⁺ − {1} olmak üzere logaritma fonksiyonunun grafiği üstel fonksiyonun grafiğinden yararlanarak çizilir. y = aˣ ve y = logₐx fonksiyonlarının grafiklerinin y=x doğrusuna göre simetrik olduğu belirtilir.",
        "b) a ∈ ℝ⁺ − {1} olmak üzere f: ℝ⁺ → ℝ, f(x) = logₐx logaritma fonksiyonunun a > 1 için artan fonksiyon, 0 < a < 1 için azalan fonksiyon olduğu verilir.",
        "c) Gelenbevi İsmail Efendi ve John Napier'in çalışmalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.1.2.2",
      subTopicName: "Logaritma Fonksiyonu",
      description:
        "10 ve e tabanında logaritma fonksiyonunu tanımlayarak problemler çözer.",
      details:
        "e sayısının irrasyonel olduğu vurgulanarak matematikte ve diğer bilim dallarında kullanımından bahsedilir.",
    },
    {
      code: "12.1.2.3",
      subTopicName: "Logaritma Fonksiyonu",
      description:
        "Logaritma fonksiyonunun özelliklerini kullanarak işlemler yapar.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.3.1",
      subTopicName: "Üstel, Logaritmik Denklemler ve Eşitsizlikler",
      description:
        "Üstel, logaritmik denklemlerin ve eşitsizliklerin çözüm kümelerini bulur.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.3.2",
      subTopicName: "Üstel, Logaritmik Denklemler ve Eşitsizlikler",
      description:
        "Üstel ve logaritmik fonksiyonları gerçek hayat durumlarını modellemede kullanır.",
      details: [
        "a) Gerçek hayat durumlarından nüfus artışı, bakteri popülasyonu, radyoaktif maddelerin bozunumu (yarı ömür), fosil yaşlarının tayini, deprem şiddeti (Richter ölçeği), pH değeri, ses şiddeti (desibel) gibi örneklere yer verilir.",
        "b) İsraf ve tasarruf kavramları hakkında farkındalık oluşturacak örneklere yer verilir.",
        "c) Bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
    },
  ],

  // ==================== DİZİLER (12.2.1 kısmen) ====================
  Diziler: [
    {
      code: "12.2.1.1",
      subTopicName: "Gerçek Sayı Dizileri",
      description:
        "Dizi kavramını fonksiyon kavramıyla ilişkilendirerek açıklar.",
      details:
        "Sonlu dizi, sabit dizi ve dizilerin eşitliği verilir.",
    },
    {
      code: "12.2.1.2",
      subTopicName: "Gerçek Sayı Dizileri",
      description:
        "Genel terimi veya indirgeme bağıntısı verilen bir sayı dizisinin terimlerini bulur.",
      isKeyKazanim: true,
    },
    {
      code: "12.2.1.4",
      subTopicName: "Gerçek Sayı Dizileri",
      description:
        "Diziler yardımıyla gerçek hayat durumları ile ilgili problemler çözer.",
      details:
        "Aritmetik, geometrik ve Fibonacci dizilerine doğadan, çeşitli sanat dallarından örnekler verilir.",
    },
  ],

  // ==================== SERİLER (12.2.1.3) ====================
  Seriler: [
    {
      code: "12.2.1.3",
      subTopicName: "Gerçek Sayı Dizileri",
      description:
        "Aritmetik ve geometrik dizilerin özelliklerini kullanarak işlemler yapar.",
      details: [
        "a) İlk n terim toplamı bulunur.",
        "b) Toplam sembolü tanıtılır ancak özellikleri verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== LİMİT VE SÜREKLİLİK (12.5.1) ====================
  "Limit ve Süreklilik": [
    {
      code: "12.5.1.1",
      subTopicName: "Limit ve Süreklilik",
      description:
        "Bir fonksiyonun bir noktadaki limiti, soldan limit ve sağdan limit kavramlarını açıklar.",
      details: [
        "a) Limit kavramı bir bağımsız değişkenin verilen bir sayıya yaklaşmasından hareketle, tablo ve grafikler yardımıyla açıklanır.",
        "b) Bilgi ve iletişim teknolojilerinden yararlanılır.",
        "c) Cauchy'nin çalışmalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.5.1.2",
      subTopicName: "Limit ve Süreklilik",
      description:
        "Limit ile ilgili özellikleri belirterek uygulamalar yapar.",
      details: [
        "a) Polinom, köklü, üstel, logaritmik ve trigonometrik fonksiyonlar içeren limit uygulamaları yapılır ancak sonucu ± ∞ olan limit durumlarına girilmez.",
        "b) Sadece pay ve paydasına ayrılarak belirsizliğin kaldırılabileceği limit örneklerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.5.1.3",
      subTopicName: "Limit ve Süreklilik",
      description:
        "Bir fonksiyonun bir noktadaki sürekliliğini açıklar.",
      details: [
        "a) Fonksiyonun grafiği üzerinde sürekli ve süreksiz olduğu noktalar buldurulur.",
        "b) Limitin tarihsel gelişiminden ve Salih Zeki'nin bu alana katkılarından bahsedilir.",
        "c) Bilgi ve iletişim teknolojileri yardımıyla süreklilik uygulamaları yaptırılır.",
      ].join("\n"),
    },
  ],

  // ==================== TÜREV (12.5.2 + 12.5.3) ====================
  Türev: [
    {
      code: "12.5.2.1",
      subTopicName: "Anlık Değişim Oranı ve Türev",
      description:
        "Türev kavramını açıklayarak işlemler yapar.",
      details: [
        "a) Anlık değişim oranı fizik ve geometri modellerinden yararlanılarak açıklanır.",
        "b) Verilen bir fonksiyonun bir noktadaki türev değeri ile o noktadaki teğetin eğimi arasındaki ilişki üzerinde durulur.",
        "c) Bir fonksiyonun bir noktadaki soldan türevi ve sağdan türevi ile türev arasındaki ilişki açıklanır.",
        "ç) f(x) = c, f(x) = axⁿ (a, c ∈ ℝ, n ∈ ℚ) şeklindeki fonksiyonlar için türev kuralları verilir. Bunun dışındaki fonksiyonların (kapalı ve parametrik fonksiyonlar dâhil) türev kurallarına yer verilmez.",
        "d) Rolle'nin çalışmalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.5.2.2",
      subTopicName: "Anlık Değişim Oranı ve Türev",
      description:
        "Bir fonksiyonun bir noktada ve bir aralıkta türevlenebilirliğini değerlendirir.",
      details: [
        "a) Bir fonksiyonun bir noktada türevli olması için gerek ve yeter şartları inceler.",
        "b) Fonksiyonun türevli olmadığı noktalarla grafiği arasında ilişki kurulur.",
      ].join("\n"),
    },
    {
      code: "12.5.2.3",
      subTopicName: "Anlık Değişim Oranı ve Türev",
      description:
        "Türevlenebilen iki fonksiyonun toplamı, farkı, çarpımı ve bölümünün türevine ait kurallar yardımıyla işlemler yapar.",
      isKeyKazanim: true,
    },
    {
      code: "12.5.2.4",
      subTopicName: "Anlık Değişim Oranı ve Türev",
      description:
        "İki fonksiyonun bileşkesinin türevine ait kuralı (zincir kuralı) oluşturularak türev hesabı yapar.",
      isKeyKazanim: true,
    },
    {
      code: "12.5.3.1",
      subTopicName: "Türevin Uygulamaları",
      description:
        "Bir fonksiyonun artan veya azalan olduğu aralıkları türev yardımıyla belirler.",
      isKeyKazanim: true,
    },
    {
      code: "12.5.3.2",
      subTopicName: "Türevin Uygulamaları",
      description:
        "Bir fonksiyonun mutlak maksimum ve mutlak minimum, yerel maksimum, yerel minimum noktalarını belirler.",
      details:
        "Bilgi ve iletişim teknolojilerinden yararlanılarak grafik çizimine yer verilir ve yorumlanır.",
    },
    {
      code: "12.5.3.3",
      subTopicName: "Türevin Uygulamaları",
      description:
        "Türevi yardımıyla bir fonksiyonun grafiğini çizer.",
      details: [
        "a) Grafik çizimleri polinom fonksiyonlarla sınırlandırılır.",
        "b) Bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
    },
    {
      code: "12.5.3.4",
      subTopicName: "Türevin Uygulamaları",
      description:
        "Maksimum ve minimum problemlerini türev yardımıyla çözer.",
      details: "Gerçek hayat problemlerine yer verilir.",
    },
  ],

  // ==================== İNTEGRAL (12.6) ====================
  İntegral: [
    {
      code: "12.6.1.1",
      subTopicName: "Belirsiz İntegral",
      description:
        "Bir fonksiyonun belirsiz integralini açıklayarak integral alma kurallarını oluşturur.",
      details: [
        "a) Belirsiz integral alma kuralları n ≠ −1 olmak üzere f(x) = axⁿ (a, c ∈ ℝ, n ∈ ℚ) şeklindeki fonksiyonlarla sınırlandırılır.",
        "b) Bir fonksiyonun bir sabitle çarpımının, iki fonksiyonun toplamının ve farkının integral alma kuralları verilerek uygulamalar yaptırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.6.1.2",
      subTopicName: "Belirsiz İntegral",
      description:
        "Değişken değiştirme yoluyla integral alma işlemleri yapar.",
    },
    {
      code: "12.6.2.1",
      subTopicName: "Belirli İntegral ve Uygulamaları",
      description:
        "Bir fonksiyonun grafiği ile x ekseni arasında kalan sınırlı bölgenin alanını Riemann toplamı yardımıyla yaklaşık olarak hesaplar.",
      details: [
        "a) Gerçek hayatta karşılaşılan ve değeri alan formülleriyle hesaplanamayan alanların, uygun toplamların limiti olarak ifade edilebileceği açıklanır.",
        "b) Polinom fonksiyonlarla sınırlandırılır.",
        "c) Bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
    },
    {
      code: "12.6.2.2",
      subTopicName: "Belirli İntegral ve Uygulamaları",
      description:
        "Bir fonksiyonun belirli ve belirsiz integralleri arasındaki ilişkiyi açıklayarak işlemler yapar.",
      isKeyKazanim: true,
    },
    {
      code: "12.6.2.3",
      subTopicName: "Belirli İntegral ve Uygulamaları",
      description:
        "Belirli integralin özelliklerini kullanarak işlemler yapar.",
      details: "Parçalı fonksiyonların belirli integraline yer verilir.",
    },
    {
      code: "12.6.2.4",
      subTopicName: "Belirli İntegral ve Uygulamaları",
      description: "Belirli integral ile alan hesabı yapar.",
      details: [
        "a) İki fonksiyonun grafikleri arasında kalan sınırlı bölgenin alanı hesaplanır.",
        "b) Gerçek hayat problemlerine yer verilir.",
        "c) Bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
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

  const matSubject = await prisma.subject.findFirst({
    where: { name: "Matematik", examTypeId: ayt.id },
  });
  if (!matSubject) {
    console.log("AYT Matematik subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: matSubject.id },
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

    // Zaten kazanımı varsa atla (idempotent)
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
    console.error("seed-ayt-mat-kazanim error:", e);
    // Don't crash the build
  })
  .finally(() => prisma.$disconnect());
