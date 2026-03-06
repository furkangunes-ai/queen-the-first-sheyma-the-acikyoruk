/**
 * TYT Geometri kazanımlarını ÖSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Matematik Dersi Öğretim Programı (2018)
 * 9. sınıf Geometri: sayfa 129-131, 10. sınıf Geometri: sayfa 137-138
 * 11. sınıf Geometri: sayfa 139-143
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-geometri-kazanim.ts
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
  // ==================== DOĞRUDA VE ÜÇGENDE AÇILAR (9.4.1.1) ====================
  "Doğruda ve Üçgende Açılar": [
    {
      code: "9.4.1.1",
      subTopicName: "Üçgende Açı Özellikleri",
      description: "Üçgende açı özellikleri ile ilgili işlemler yapar.",
      details: [
        "a) Kültür ve medeniyetimizden geometrinin tarihsel gelişim sürecine katkı sağlamış bilim insanları ve bilim insanlarının yaptığı çalışmalar tanıtılır. Mustafa Kemal Atatürk'ün geometri üzerine yaptığı çalışmalardan bahsedilir.",
        "b) Açı çeşitleri ve paralel iki doğrunun bir kesenle yaptığı açılar hatırlatılır.",
        "c) Üçgende sadece iç ve dış açı özelliklerinin kullanıldığı sorulara yer verilir. İkizkenar ve eşkenar üçgenin açı özellikleri üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DİK VE ÖZEL ÜÇGENLER (9.4.4.1 + 9.4.4.2) ====================
  "Dik ve Özel Üçgenler": [
    {
      code: "9.4.4.1",
      subTopicName: "Pisagor Teoremi",
      description:
        "Dik üçgende Pisagor teoremini elde ederek problemler çözer.",
      details: [
        "a) Teorem elde edilirken model çeşitliliğine yer verilir.",
        "b) Gerçek hayat problemlerine yer verilir.",
        "c) Pythagoras'ın çalışmalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.4.2",
      subTopicName: "Öklid Teoremi",
      description: "Öklid teoremini elde ederek problemler çözer.",
      details: [
        "a) Gerçek hayat problemlerine yer verilir.",
        "b) Euclid'in çalışmalarına yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== DİK ÜÇGENDE TRİGONOMETRİK BAĞINTILAR (9.4.4.3 + 9.4.4.4) ====================
  "Dik Üçgende Trigonometrik Bağıntılar": [
    {
      code: "9.4.4.3",
      subTopicName: "Trigonometrik Oranlar",
      description:
        "Dik üçgende dar açıların trigonometrik oranlarını hesaplar.",
      details: [
        "a) Bir açının sinüs, kosinüs, tanjant ve kotanjant değerleri dik üçgen üzerinde tanımlanır.",
        "b) Dik üçgende; 30°, 45° ve 60° nin trigonometrik değerleri özel üçgenler yardımıyla hesaplanır.",
        "c) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.4.4",
      subTopicName: "Birim Çember",
      description:
        "Birim çemberi tanımlar ve trigonometrik oranları birim çemberin üzerindeki noktanın koordinatlarıyla ilişkilendirir.",
      details: [
        "a) Sadece 0° ve 180° arasındaki açıların trigonometrik oranları birim çember yardımıyla hesaplatılır.",
        "b) Ebu'l Vefa ve Gıyaseddin Cemşid'in trigonometrik oranlarla ilgili çalışmalarından bahsedilir.",
      ].join("\n"),
    },
  ],

  // ==================== İKİZKENAR VE EŞKENAR ÜÇGEN ====================
  "İkizkenar ve Eşkenar Üçgen": [
    {
      code: "9.4.1.1b",
      subTopicName: "İkizkenar ve Eşkenar Üçgen",
      description:
        "İkizkenar ve eşkenar üçgenlerin özelliklerini kullanarak problemler çözer.",
      details:
        "İkizkenar üçgenin taban açıları eşitliği, eşkenar üçgenin tüm açılarının 60° olması ve kenar-açı ilişkileri kullanılarak problemler çözülür.",
      isKeyKazanim: true,
    },
  ],

  // ==================== ÜÇGENDE ALANLAR (9.4.5.1) ====================
  "Üçgende Alanlar": [
    {
      code: "9.4.5.1",
      subTopicName: "Üçgenin Alanı",
      description: "Üçgenin alanı ile ilgili problemler çözer.",
      details: [
        "a) Üçgenin alanı, bir kenarı ile bu kenara ait yükseklik kullanılarak hesaplatılır.",
        "b) İki kenarının uzunluğu ve bu kenarlar arasındaki açının ölçüsü verilen üçgenin alanını hesaplar.",
        "c) Aynı yüksekliğe sahip üçgenlerin alanlarıyla tabanları; aynı tabana sahip üçgenlerin alanlarıyla yükseklikleri arasındaki ilişki vurgulanır.",
        "ç) Benzer üçgenlerin alanları ile benzerlik oranları arasındaki ilişki belirtilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ÜÇGENDE AÇIORTAY BAĞINTILARI (9.4.3.1) ====================
  "Üçgende Açıortay Bağıntıları": [
    {
      code: "9.4.3.1",
      subTopicName: "İç ve Dış Açıortay",
      description:
        "Üçgenin iç ve dış açıortaylarının özelliklerini elde eder.",
      details: [
        "a) Açıortay üzerinde alınan bir noktadan açının kollarına indirilen dikmelerin uzunluklarının eşit olduğu gösterilir.",
        "b) İç ve dış açıortay uzunlukları formülle hesaplatılmaz.",
        "c) Açıortay özelliklerinin gösteriminde pergel-cetvelden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ÜÇGENDE KENARORTAY BAĞINTILARI (9.4.3.2 + 9.4.3.3 + 9.4.3.4) ====================
  "Üçgende Kenarortay Bağıntıları": [
    {
      code: "9.4.3.2",
      subTopicName: "Kenarortay",
      description: "Üçgenin kenarortaylarının özelliklerini elde eder.",
      details: [
        "a) Kenarortayların kesiştiği nokta ile bu noktanın kenarortay üzerinde ayırdığı parçalar arasındaki ilişki üzerinde durulur.",
        "b) Kenarortayların kesiştiği noktanın, üçgenin ağırlık merkezi olduğuna ve üçgenin ağırlık merkeziyle ilgili özelliklerine yer verilir.",
        "c) Dik üçgende, hipotenüse ait kenarortay uzunluğunun hipotenüs uzunluğunun yarısı olduğu gösterilir.",
        "ç) Kenarortay uzunluğu formülle hesaplatılmaz.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.3.3",
      subTopicName: "Kenar Orta Dikme",
      description:
        "Üçgenin kenar orta dikmelerinin bir noktada kesiştiğini gösterir.",
      details: [
        "a) Bir doğru parçasının orta dikmesi üzerinde alınan her noktanın, doğru parçasının uç noktalarına eşit uzaklıkta olduğu ve bunun karşıtının da doğru olduğu gösterilir.",
        "b) Pergel-cetvel veya bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
    },
    {
      code: "9.4.3.4",
      subTopicName: "Yükseklik",
      description:
        "Üçgenin çeşidine göre yüksekliklerinin kesiştiği noktanın konumunu belirler.",
      details: [
        "a) Pergel-cetvel kullanarak veya bilgi ve iletişim teknolojileri yardımıyla bir üçgenin yükseklikleri çizilerek kesişimleri üzerinde durulur.",
        "b) İkizkenar üçgenin tabanında alınan bir noktadan kenarlara çizilen dikmelerin uzunlukları toplamı ile üçgenin eş olan kenarlarına ait yükseklik arasındaki ilişki bulunur.",
        "c) Eşkenar üçgen içerisinde alınan bir noktadan kenarlara indirilen dikmelerin uzunlukları toplamı ile üçgenin yüksekliği arasındaki ilişki bulunur.",
      ].join("\n"),
    },
  ],

  // ==================== ÜÇGENDE EŞLİK VE BENZERLİK (9.4.2) ====================
  "Üçgende Eşlik ve Benzerlik": [
    {
      code: "9.4.2.1",
      subTopicName: "Üçgenlerde Eşlik",
      description:
        "İki üçgenin eş olması için gerekli olan asgari koşulları değerlendirir.",
      details: [
        "a) İki üçgenin eşliği hatırlatılır.",
        "b) Kenar-Açı-Kenar (K.A.K.), Açı-Kenar-Açı (A.K.A.), Kenar-Kenar-Kenar (K.K.K.) eşlik kuralları, ölçümler yapılarak oluşturulur.",
        "c) Eş üçgenlerin karşılıklı yardımcı elemanlarının da eş olduğu gösterilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.2.2",
      subTopicName: "Üçgenlerde Benzerlik",
      description:
        "İki üçgenin benzer olması için gerekli olan asgari koşulları değerlendirir.",
      details: [
        "a) Kenar-Açı-Kenar (K.A.K.), Kenar-Kenar-Kenar (K.K.K.) ve Açı-Açı (A.A.) benzerlik kuralları, ölçümler yapılarak oluşturulur.",
        "b) Eşlik ile benzerlik arasındaki ilişki incelenir.",
        "c) Benzer üçgenlerin karşılıklı yardımcı elemanlarının da aynı benzerlik oranına sahip olduğu gösterilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.2.3",
      subTopicName: "Thales Teoremi",
      description:
        "Üçgenin bir kenarına paralel ve diğer iki kenarı kesecek şekilde çizilen doğrunun ayırdığı doğru parçaları arasındaki ilişkiyi kurar.",
      details: "Thales'in çalışmalarına yer verilir.",
    },
    {
      code: "9.4.2.4",
      subTopicName: "Benzerlik Problemleri",
      description:
        "Üçgenlerin benzerliği ile ilgili problemler çözer.",
      details: "Gerçek hayat problemlerine yer verilir.",
    },
  ],

  // ==================== ÜÇGENDE AÇI-KENAR BAĞINTILARI (9.4.1.2 + 9.4.1.3) ====================
  "Üçgende Açı-Kenar Bağıntıları": [
    {
      code: "9.4.1.2",
      subTopicName: "Kenar-Açı İlişkisi",
      description:
        "Üçgenin kenar uzunlukları ile bu kenarların karşılarındaki açıların ölçülerini ilişkilendirir.",
      details: [
        "a) Bir üçgende en uzun kenarın karşısındaki açının ölçüsünün en büyük olduğu ve bunun tersinin de doğru olduğu gösterilir.",
        "b) Dinamik matematik yazılımları kullanılarak oluşturulan üçgenlerin kenar ve açıları arasındaki ilişkinin gözlemlenmesi sağlanır.",
      ].join("\n"),
    },
    {
      code: "9.4.1.3",
      subTopicName: "Üçgen Eşitsizliği",
      description:
        "Uzunlukları verilen üç doğru parçasının hangi durumlarda üçgen oluşturduğunu değerlendirir.",
      details: [
        "a) İki kenar uzunluğu verilen bir üçgenin üçüncü kenar uzunluğunun hangi aralıkta değerler alabileceğine ilişkin uygulamalar yapılır.",
        "b) Dinamik matematik yazılımlarından yararlanılarak hangi durumlarda üçgen oluşacağının test edilmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ÇOKGENLER (10.5.1) ====================
  "Çokgenler": [
    {
      code: "10.5.1.1",
      subTopicName: "Çokgen Kavramı",
      description: "Çokgen kavramını açıklayarak işlemler yapar.",
      details: [
        "a) İçbükey çokgenlere girilmez.",
        "b) Düzgün çokgenler hatırlatılır, iç ve dış açılarının ölçüleri bulunur.",
        "c) Çokgenlerin köşegenleri ile ilgili özelliklere ve alan problemlerine yer verilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DÖRTGENLER (10.5.2) ====================
  "Dörtgenler": [
    {
      code: "10.5.2.1",
      subTopicName: "Dörtgenin Temel Elemanları",
      description:
        "Dörtgenin temel elemanlarını ve özelliklerini açıklayarak problemler çözer.",
      details: [
        "a) Dışbükey ve içbükey dörtgen kavramları açıklanır.",
        "b) Dörtgenin iç ve dış açılarının ölçüleri toplamı bulunur.",
        "c) Dörtgenin çevresi üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== YAMUK ====================
  Yamuk: [
    {
      code: "10.5.3.1a",
      subTopicName: "Yamuk",
      description:
        "Yamuğun açı, kenar, köşegen ve alan özelliklerini açıklayarak problemler çözer.",
      details:
        "Yamuk ve ikizkenar yamuk özellikleri; açı, kenar, köşegen ve alan bağlamında ele alınır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== PARALELKENAR ====================
  Paralelkenar: [
    {
      code: "10.5.3.1b",
      subTopicName: "Paralelkenar",
      description:
        "Paralelkenarın açı, kenar, köşegen ve alan özelliklerini açıklayarak problemler çözer.",
      details:
        "Hiyerarşik ilişkiye göre paralelkenarın açı, kenar, köşegen ve alan özellikleri ele alınır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== EŞKENAR DÖRTGEN – DELTOİD ====================
  "Eşkenar Dörtgen – Deltoid": [
    {
      code: "10.5.3.1c",
      subTopicName: "Eşkenar Dörtgen ve Deltoid",
      description:
        "Eşkenar dörtgen ve deltoidin açı, kenar, köşegen ve alan özelliklerini açıklayarak problemler çözer.",
      details:
        "Hiyerarşik ilişkiye göre eşkenar dörtgen ve deltoidin açı, kenar, köşegen ve alan özellikleri ele alınır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== DİKDÖRTGEN ====================
  "Dikdörtgen": [
    {
      code: "10.5.3.1d",
      subTopicName: "Dikdörtgen ve Kare",
      description:
        "Dikdörtgen ve karenin açı, kenar, köşegen ve alan özelliklerini açıklayarak problemler çözer.",
      details:
        "Hiyerarşik ilişkiye göre dikdörtgen ve karenin açı, kenar, köşegen ve alan özellikleri ele alınır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== ÇEMBERDE AÇILAR (11.5.2) ====================
  "Çemberde Açılar": [
    {
      code: "11.5.2.1",
      subTopicName: "Çemberde Açılar",
      description:
        "Bir çemberde merkez, çevre, iç, dış ve teğet-kiriş açıların özelliklerini kullanarak işlemler yapar.",
      details: [
        "a) Üçgenin çevrel çemberi çizdirilir.",
        "b) Sinüs teoreminin çevrel çemberin yarıçapı ile ilişkisi üzerinde durulur.",
        "c) Pergel-cetvelden veya bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ÇEMBERDE UZUNLUK (11.5.1 + 11.5.3) ====================
  "Çemberde Uzunluk": [
    {
      code: "11.5.1.1",
      subTopicName: "Çemberin Temel Elemanları",
      description:
        "Çemberde teğet, kiriş, çap, yay ve kesen kavramlarını açıklar.",
      details:
        "Bir çember ile bir doğrunun birbirlerine göre durumları ele alınır.",
    },
    {
      code: "11.5.1.2",
      subTopicName: "Kiriş Özellikleri",
      description:
        "Çemberde kirişin özelliklerini göstererek işlemler yapar.",
      details: [
        "a) Bir çemberde, kirişin orta dikmesinin çemberin merkezinden geçtiği ve bir kirişin orta noktasını çemberin merkezine birleştiren doğrunun kirişe dik olduğu gösterilir.",
        "b) Bir çemberde kirişlerin uzunlukları ile merkeze olan uzaklıkları arasındaki ilişki üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.5.3.1",
      subTopicName: "Teğet Özellikleri",
      description:
        "Çemberde teğetin özelliklerini göstererek işlemler yapar.",
      details: [
        "a) Çemberin dışındaki bir noktadan çizilen teğet parçalarının uzunluklarının eşit olduğu gösterilir.",
        "b) Üçgenin iç teğet ve dış teğet çemberleri çizilir.",
        "c) İki çemberin ortak teğetine girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DAİRE (11.5.4) ====================
  "Daire": [
    {
      code: "11.5.4.1",
      subTopicName: "Dairenin Çevresi ve Alanı",
      description: "Dairenin çevre ve alan bağıntılarını oluşturur.",
      details: [
        "a) Dairenin çevresi ve alanı ile ilgili uygulamalar yapılır.",
        "b) Daire diliminin alanı ve yay uzunluğu bağıntıları buldurularak uygulamalar yapılır.",
        "c) Archimedes'in çalışmalarına yer verilir.",
        "ç) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== PRİZMALAR (10.6.1) ====================
  Prizmalar: [
    {
      code: "10.6.1.1",
      subTopicName: "Dik Prizmalar",
      description:
        "Dik prizmalar ve dik piramitlerin uzunluk, alan ve hacim bağıntılarını oluşturur.",
      details: [
        "a) Üçgen, dörtgen ve altıgen dik prizma/piramit ile sınırlandırılır.",
        "b) Gerçek hayat problemlerine yer verilir.",
        "c) Bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== PİRAMİTLER ====================
  Piramitler: [
    {
      code: "10.6.1.1b",
      subTopicName: "Dik Piramitler",
      description:
        "Dik piramitlerin uzunluk, alan ve hacim bağıntılarını oluşturur.",
      details:
        "Üçgen, dörtgen ve altıgen dik piramit ile sınırlandırılır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== KÜRE (11.6.1) ====================
  "Küre": [
    {
      code: "11.6.1.1",
      subTopicName: "Küre ve Diğer Katı Cisimler",
      description:
        "Küre, dik dairesel silindir ve dik dairesel koninin alan ve hacim bağıntılarını oluşturarak işlemler yapar.",
      details: [
        "a) Gerçek hayat problemlerine yer verilir.",
        "b) Bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== KOORDİNAT DÜZLEMİ VE NOKTANIN ANALİTİĞİ (11.2.1.1 + 11.2.1.2) ====================
  "Koordinat Düzlemi ve Noktanın Analitiği": [
    {
      code: "11.2.1.1",
      subTopicName: "İki Nokta Arası Uzaklık",
      description:
        "Analitik düzlemde iki nokta arasındaki uzaklığı veren bağıntıyı elde ederek problemler çözer.",
      isKeyKazanim: true,
    },
    {
      code: "11.2.1.2",
      subTopicName: "Noktanın Analitiği",
      description:
        "Bir doğru parçasını belli bir oranda (içten veya dıştan) bölen noktanın koordinatlarını hesaplar.",
      details: [
        "a) Bir doğru parçasının orta noktasının koordinatları buldurulur.",
        "b) Bir üçgenin ağırlık merkezinin koordinatları buldurulur.",
      ].join("\n"),
    },
  ],

  // ==================== VEKTÖRLER-1 ====================
  "Vektörler-1": [
    {
      code: "9.1.3.1v",
      subTopicName: "Vektörler",
      description:
        "Vektörel niceliklerde toplama işlemlerini tek boyutta yapar.",
      details:
        "Skaler ve vektörel niceliklerde toplama işlemlerine günlük hayattan örnekler verilerek karşılaştırma yapılması sağlanır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== DOĞRUNUN ANALİTİĞİ (11.2.1.3 + 11.2.1.4) ====================
  "Doğrunun Analitiği": [
    {
      code: "11.2.1.3",
      subTopicName: "Doğrunun Denklemi",
      description:
        "Analitik düzlemde doğruları inceleyerek işlemler yapar.",
      details: [
        "a) Bir doğrunun eğim açısı ve eğimi tanımlanır.",
        "b) Analitik düzlemde bir doğrunun denklemi oluşturulur.",
        "c) Eksenlere paralel ve orijinden geçen doğruların denklemleri bulunur ve bulunan denklemlerin grafikleri yorumlanır.",
        "ç) İki doğrunun birbirine göre durumları incelenir ve kesişen iki doğrunun kesişim noktası bulunur.",
        "d) Bilgi ve iletişim teknolojilerinden yararlanılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.1.4",
      subTopicName: "Noktanın Doğruya Uzaklığı",
      description: "Bir noktanın bir doğruya uzaklığını hesaplar.",
      details:
        "Bir noktanın bir doğruya uzaklığı ve paralel iki doğru arasındaki uzaklık ile ilgili uygulamalar yapılır.",
    },
  ],

  // ==================== TEKRAR EDEN, DÖNEN VE YANSIYAN ŞEKİLLER ====================
  "Tekrar Eden, Dönen ve Yansıyan Şekiller": [
    {
      code: "10.5.3.1e",
      subTopicName: "Süsleme ve Desen",
      description:
        "Geometrik şekillerle oluşturulan tekrar eden, dönen ve yansıyan desenleri inceler.",
      details:
        "Origami, tangram kullanılarak uygulamalar yapılır. Geleneksel mimaride kullanılan motif örneklerinde yer alan çokgen örneklerine yer verilir.",
    },
  ],

  // ==================== UZAY GEOMETRİ ====================
  "Uzay Geometri": [
    {
      code: "10.6.1.1c",
      subTopicName: "Uzay Geometri",
      description:
        "Katı cisimlerin yüzey alanı ve hacim hesaplamalarını yapar.",
      details:
        "Dik prizmaların ve dik piramitlerin yanı sıra küre, silindir ve koni gibi katı cisimlerin alan ve hacim bağıntıları üzerinde durulur.",
      isKeyKazanim: true,
    },
  ],

  // ==================== DÖNÜŞÜMLERLE GEOMETRİ (11.3.3) ====================
  "Dönüşümlerle Geometri": [
    {
      code: "11.3.3.1",
      subTopicName: "Fonksiyonların Dönüşümleri",
      description:
        "Bir fonksiyonun grafiğinden, dönüşümler yardımı ile yeni fonksiyon grafikleri çizer.",
      details: [
        "a) Tek ve çift fonksiyonların grafiğinin simetri özellikleri üzerinde durulur.",
        "b) y = f(x) + b, y = f(x - a), y = k·f(x), y = f(kx), y = -f(x), y = f(-x) dönüşümlerinin grafikleri bilgi ve iletişim teknolojilerinden yararlanılarak verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== TRİGONOMETRİ (11.1) ====================
  Trigonometri: [
    {
      code: "11.1.1.1",
      subTopicName: "Yönlü Açılar",
      description: "Yönlü açıyı açıklar.",
    },
    {
      code: "11.1.1.2",
      subTopicName: "Açı Ölçü Birimleri",
      description:
        "Açı ölçü birimlerini açıklayarak birbiri ile ilişkilendirir.",
      details: [
        "a) Derecenin alt birimleri olan dakika ve saniyeden bahsedilir.",
        "b) Derece ile radyan ilişkilendirilir, grada girilmez.",
        "c) Açının esas ölçüsü bulunur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.2.1",
      subTopicName: "Trigonometrik Fonksiyonlar",
      description:
        "Trigonometrik fonksiyonları birim çember yardımıyla açıklar.",
      details: [
        "a) Trigonometrik fonksiyonlar arasındaki temel özdeşlikler, oluşturulan benzer üçgenler yardımıyla incelenir.",
        "b) Trigonometrik fonksiyonların bölgelere göre işaretleri incelenir.",
        "c) Trigonometrik fonksiyonların açı değerlerine göre sıralanmasına yer verilir.",
        "ç) k∈ℤ⁺ olmak üzere kπ/2 ± θ açılarının trigonometrik değerleri θ dar açısının trigonometrik değerlerinden yararlanarak hesaplanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.2.2",
      subTopicName: "Kosinüs Teoremi",
      description: "Kosinüs teoremiyle ilgili problemler çözer.",
      details: [
        "a) Kosinüs teoremi, Pisagor teoreminden yararlanılarak elde edilir.",
        "b) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.2.3",
      subTopicName: "Sinüs Teoremi",
      description: "Sinüs teoremiyle ilgili problemler çözer.",
      details: [
        "a) Sinüs teoremi, iki kenarının uzunluğu ve bu kenarlar arasındaki açının ölçüsü verilen üçgenin alanından yararlanılarak elde edilir.",
        "b) Sinüs teoremi çevrel çemberle ilişkilendirilmez.",
        "c) Gerçek hayat problemlerine yer verilir.",
      ].join("\n"),
    },
    {
      code: "11.1.2.4",
      subTopicName: "Trigonometrik Fonksiyon Grafikleri",
      description: "Trigonometrik fonksiyon grafiklerini çizer.",
      details: [
        "a) y=sinx ve y=cosx fonksiyonları dışındaki fonksiyonların graf çizimlerinde sadece bilgi ve iletişim teknolojileri kullanılır.",
        "b) Periyodik fonksiyon tanımı verilir, trigonometrik fonksiyonların periyodik oldukları gösterilir.",
        "c) f(x) = a·sin(bx + c) + k türündeki fonksiyonların grafikleri ve katsayılarının grafik üzerindeki etkileri ele alınır.",
      ].join("\n"),
    },
    {
      code: "11.1.2.5",
      subTopicName: "Ters Trigonometrik Fonksiyonlar",
      description:
        "Sinüs, kosinüs, tanjant fonksiyonlarının ters fonksiyonlarını açıklar.",
      details:
        "Ters trigonometrik fonksiyonların grafiklerine yer verilmez.",
    },
  ],

  // ==================== ÇEMBERİN ANALİTİĞİ ====================
  "Çemberin Analitiği": [
    {
      code: "12.2.1.1",
      subTopicName: "Çemberin Denklemi",
      description:
        "Çemberin denklemini oluşturarak çemberle ilgili problemler çözer.",
      details:
        "Merkezi ve yarıçapı bilinen çemberin denkleminin oluşturulması ve çember denklemi verilen çemberin merkez ve yarıçapının bulunması üzerinde durulur.",
      isKeyKazanim: true,
    },
  ],

  // ==================== GENEL KONİK TANIMI (DIŞ MERKEZLİK) ====================
  "Genel Konik Tanımı (Dış Merkezlik)": [
    {
      code: "12.2.2.1",
      subTopicName: "Konik Kesitler",
      description:
        "Konik kesitlerin genel tanımını dış merkezlik kavramı ile açıklar.",
      details:
        "Odak, doğrultman ve dış merkezlik kavramları tanıtılarak konik kesitler sınıflandırılır.",
    },
  ],

  // ==================== PARABOL (12.2) ====================
  Parabol: [
    {
      code: "12.2.3.1",
      subTopicName: "Parabolün Analitiği",
      description:
        "Parabolün analitik düzlemdeki denklemini oluşturarak problemler çözer.",
      details:
        "Tepe noktası orijinde olan ve eksenlere paralel eksenli parabolün denklemi oluşturulur.",
      isKeyKazanim: true,
    },
  ],

  // ==================== ELİPS ====================
  Elips: [
    {
      code: "12.2.4.1",
      subTopicName: "Elipsin Analitiği",
      description:
        "Elipsin analitik düzlemdeki denklemini oluşturarak problemler çözer.",
      details:
        "Merkezi orijinde ve eksenleri koordinat eksenlerine paralel olan elipsin denklemi oluşturulur.",
      isKeyKazanim: true,
    },
  ],

  // ==================== HİPERBOL ====================
  Hiperbol: [
    {
      code: "12.2.5.1",
      subTopicName: "Hiperbolün Analitiği",
      description:
        "Hiperbolün analitik düzlemdeki denklemini oluşturarak problemler çözer.",
      details:
        "Merkezi orijinde ve eksenleri koordinat eksenlerine paralel olan hiperbolün denklemi oluşturulur.",
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

  const geometriSubject = await prisma.subject.findFirst({
    where: { name: "Geometri", examTypeId: tyt.id },
  });
  if (!geometriSubject) {
    console.log("TYT Geometri subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: geometriSubject.id },
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
    console.error("seed-tyt-geometri-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
