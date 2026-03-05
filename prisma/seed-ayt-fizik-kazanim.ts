/**
 * AYT Fizik kazanımlarını ÖSYM PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Fizik Dersi Öğretim Programı (2018), sayfa 168-181
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-ayt-fizik-kazanim.ts
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
  // ==================== VEKTÖRLER (11.1.1) ====================
  Vektörler: [
    {
      code: "11.1.1.1",
      subTopicName: "Vektörler",
      description: "Vektörlerin özelliklerini açıklar.",
    },
    {
      code: "11.1.1.2",
      subTopicName: "Vektörler",
      description:
        "İki ve üç boyutlu kartezyen koordinat sisteminde vektörleri çizer.",
      details: "Birim vektör sistemi (i, j, k) işlemlerine girilmez.",
    },
    {
      code: "11.1.1.3",
      subTopicName: "Vektörler",
      description:
        "Vektörlerin bileşkelerini farklı yöntemleri kullanarak hesaplar.",
      details: [
        "a) Uç uca ekleme ve paralel kenar yöntemleri kullanılmalıdır.",
        "b) Kosinüs teoremi verilerek bileşke vektörün büyüklüğünün bulunması sağlanır.",
        "c) Eşit büyüklükteki vektörlerin bileşkesi hesaplanırken açılara göre özel durumlar verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.1.4",
      subTopicName: "Vektörler",
      description:
        "Bir vektörün iki boyutlu kartezyen koordinat sisteminde bileşenlerini çizerek büyüklüklerini hesaplar.",
    },
  ],

  // ==================== BAĞIL HAREKET (11.1.2) ====================
  "Bağıl Hareket": [
    {
      code: "11.1.2.1",
      subTopicName: "Bağıl Hareket",
      description:
        "Sabit hızlı iki cismin hareketini birbirine göre yorumlar.",
    },
    {
      code: "11.1.2.2",
      subTopicName: "Bağıl Hareket",
      description:
        "Hareketli bir ortamdaki sabit hızlı cisimlerin hareketini farklı gözlem çerçevelerine göre yorumlar.",
    },
    {
      code: "11.1.2.3",
      subTopicName: "Bağıl Hareket",
      description: "Bağıl hareket ile ilgili hesaplamalar yapar.",
    },
  ],

  // ==================== NEWTON'UN HAREKET YASALARI (11.1.3) ====================
  "Newton'un Hareket Yasaları": [
    {
      code: "11.1.3.1",
      subTopicName: "Newton'un Hareket Yasaları",
      description:
        "Net kuvvetin yönünü belirleyerek büyüklüğünü hesaplar.",
      details: [
        "a) Yatay, düşey ve eğik düzlemde sürtünme kuvvetinin yönü belirlenerek büyüklüğünün hesaplanması sağlanır.",
        "b) Sürtünmeli ve sürtünmesiz yüzeylerde serbest cisim diyagramları üzerinde cisme etki eden kuvvetlerin gösterilmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.3.2",
      subTopicName: "Newton'un Hareket Yasaları",
      description:
        "Net kuvvet etkisindeki cismin hareketi ile ilgili hesaplamalar yapar.",
      details: [
        "a) Hesaplamaların günlük hayat örnekleri üzerinden yapılmasına özen gösterilir.",
        "b) Sürtünmeli ve sürtünmesiz yüzeyler dikkate alınmalıdır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== BİR BOYUTTA SABİT İVMELİ HAREKET (11.1.4) ====================
  "Bir Boyutta Sabit İvmeli Hareket": [
    {
      code: "11.1.4.1",
      subTopicName: "Bir Boyutta Sabit İvmeli Hareket",
      description: "Bir boyutta sabit ivmeli hareketi analiz eder.",
      details: [
        "a) Hareket denklemleri verilir.",
        "b) Öğrencilerin sabit ivmeli hareket ile ilgili konum-zaman, hız-zaman ve ivme-zaman grafiklerini çizmeleri, yorumlamaları ve grafikler arasında dönüşüm yapmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.4.2",
      subTopicName: "Bir Boyutta Sabit İvmeli Hareket",
      description:
        "Bir boyutta sabit ivmeli hareket ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.4.3",
      subTopicName: "Serbest Düşme",
      description:
        "Hava direncinin ihmal edildiği ortamda düşen cisimlerin hareketlerini analiz eder.",
      details:
        "İlk hızsız bırakılan cisimler için hareket denklemleri, konum-zaman, hız-zaman ve ivme-zaman grafikleri verilerek matematiksel hesaplamalar yapılması sağlanır.",
    },
    {
      code: "11.1.4.4",
      subTopicName: "Serbest Düşme",
      description:
        "Düşen cisimlere etki eden hava direnç kuvvetinin bağlı olduğu değişkenleri analiz eder.",
    },
    {
      code: "11.1.4.5",
      subTopicName: "Limit Hız",
      description: "Limit hız kavramını açıklar.",
      details: [
        "a) Limit hız kavramı günlük hayattan örneklerle açıklanır.",
        "b) Limit hızın matematiksel modeli verilir. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "11.1.4.6",
      subTopicName: "Düşey Atış",
      description:
        "Düşey doğrultuda ilk hızı olan ve sabit ivmeli hareket yapan cisimlerin hareketlerini analiz eder.",
      details:
        "Düşey doğrultuda (yukarıdan aşağıya ve aşağıdan yukarıya) atış hareket denklemleri, konum-zaman, hız-zaman ve ivme-zaman grafikleri verilerek matematiksel hesaplamalar yapılması sağlanır.",
    },
  ],

  // ==================== İKİ BOYUTTA SABİT İVMELİ HAREKET (11.1.5) ====================
  "İki Boyutta Sabit İvmeli Hareket": [
    {
      code: "11.1.5.1",
      subTopicName: "Yatay ve Eğik Atış",
      description:
        "Atış hareketlerini yatay ve düşey boyutta analiz eder.",
      details:
        "Öğrencilerin deney yaparak veya simülasyonlarla atış hareketlerini incelemeleri ve yorumlamaları sağlanır.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.5.2",
      subTopicName: "Yatay ve Eğik Atış",
      description:
        "İki boyutta sabit ivmeli hareket ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
  ],

  // ==================== ENERJİ VE HAREKET (11.1.6) ====================
  "Enerji ve Hareket": [
    {
      code: "11.1.6.1",
      subTopicName: "İş ve Enerji",
      description:
        "Yapılan iş ile enerji arasındaki ilişkiyi analiz eder.",
      details: [
        "a) Kuvvet-yol grafiğinden faydalanılarak iş hesaplamaları yapılır.",
        "b) Hooke Yasası verilir.",
        "c) Grafiklerden faydalanılarak kinetik, yer çekimi potansiyel ve esneklik potansiyel enerji türlerinin matematiksel modellerine ulaşılması sağlanır.",
        "ç) Matematiksel hesaplamalar yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.6.2",
      subTopicName: "Mekanik Enerjinin Korunumu",
      description:
        "Cisimlerin hareketini mekanik enerjinin korunumunu kullanarak analiz eder.",
      details: [
        "a) Öğrencilerin serbest düşme, atış hareketleri ve esnek yay içeren olayları incelemeler ve mekanik enerjinin korunumunu kullanarak matematiksel hesaplamalar yapmaları sağlanır.",
        "b) Canan Dağdeviren'in yaptığı çalışmalar hakkında bilgi verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.6.3",
      subTopicName: "Mekanik Enerjinin Korunumu",
      description:
        "Sürtünmeli yüzeylerde enerji korunumunu ve dönüşümlerini analiz eder.",
      details:
        "Sürtünmeli yüzeylerde hareket eden cisimlerle ilgili enerji korunumu ve dönüşümü ile ilgili matematiksel hesaplamalar yapılması sağlanır.",
    },
  ],

  // ==================== İTME VE ÇİZGİSEL MOMENTUM (11.1.7) ====================
  "İtme ve Çizgisel Momentum": [
    {
      code: "11.1.7.1",
      subTopicName: "İtme ve Çizgisel Momentum",
      description:
        "İtme ve çizgisel momentum kavramlarını açıklar.",
      details: [
        "a) Çizgisel momentumla ilgili günlük hayattan örnekler verilir.",
        "b) İtme ve çizgisel momentum kavramlarının matematiksel modeli verilir.",
      ].join("\n"),
    },
    {
      code: "11.1.7.2",
      subTopicName: "İtme ve Çizgisel Momentum",
      description:
        "İtme ile çizgisel momentum değişimi arasında ilişki kurar.",
      details: [
        "a) Newton'ın ikinci hareket yasasından faydalanarak itme ve momentum arasındaki matematiksel modeli elde etmeleri sağlanır.",
        "b) Kuvvet-zaman grafiğinden alan hesaplamaları yapmaları ve cismin momentum değişikliği ile ilişkilendirmeleri sağlanır.",
        "c) İtme ve çizgisel momentum değişimi ile ilgili matematiksel hesaplamalar yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.7.3",
      subTopicName: "Çizgisel Momentumun Korunumu",
      description: "Çizgisel momentumun korunumunu analiz eder.",
      details: [
        "a) Öğrencilerin deney yaparak veya simülasyonlar kullanarak çizgisel momentum korunumu ile ilgili çıkarımda bulunmaları sağlanır.",
        "b) Çizgisel momentumun korunumu bir ve iki boyutlu hareketle sınırlandırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.7.4",
      subTopicName: "Çizgisel Momentumun Korunumu",
      description:
        "Çizgisel momentumun korunumu ile ilgili hesaplamalar yapar.",
      details:
        "Enerjinin korunduğu ve korunmadığı durumlar göz önüne alınarak bir ve iki boyutta çizgisel momentumun korunumu, çarpışmalar ve patlamalarla ilgili matematiksel hesaplamalar yapılması sağlanır.",
      isKeyKazanim: true,
    },
  ],

  // ==================== TORK (11.1.8) ====================
  Tork: [
    {
      code: "11.1.8.1",
      subTopicName: "Tork",
      description: "Tork kavramını açıklar.",
      details: "Torkun yönünü belirlemek için sağ el kuralı verilir.",
    },
    {
      code: "11.1.8.2",
      subTopicName: "Tork",
      description: "Torkun bağlı olduğu değişkenleri analiz eder.",
      details: [
        "a) Öğrencilerin deney yaparak veya simülasyonlar kullanarak tork bağlı olduğu değişkenler ile ilgili sonuçlar çıkarmaları sağlanır.",
        "b) Öğrencilerin tork ile ilgili günlük hayattan problem durumları bulmaları ve bunlar için çözüm yolları üretmeleri sağlanır.",
      ].join("\n"),
    },
    {
      code: "11.1.8.3",
      subTopicName: "Tork",
      description: "Tork ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
  ],

  // ==================== DENGE (11.1.9) ====================
  Denge: [
    {
      code: "11.1.9.1",
      subTopicName: "Denge ve Denge Şartları",
      description: "Cisimlerin denge şartlarını açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "11.1.9.2",
      subTopicName: "Kütle Merkezi ve Ağırlık Merkezi",
      description:
        "Kütle merkezi ve ağırlık merkezi kavramlarını açıklar.",
      details:
        "Kütle ve ağırlık merkezi kavramlarının farklı olduğu durumlara değinilir.",
    },
    {
      code: "11.1.9.3",
      subTopicName: "Kütle Merkezi ve Ağırlık Merkezi",
      description:
        "Kütle merkezi ve ağırlık merkezi ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
  ],

  // ==================== BASİT MAKİNELER (11.1.10) ====================
  "Basit Makineler": [
    {
      code: "11.1.10.1",
      subTopicName: "Basit Makineler",
      description:
        "Günlük hayatta kullanılan basit makinelerin işlevlerini açıklar.",
      details:
        "Kaldıraç, sabit ve hareketli makara, palanga, eğik düzlem, vida, çıkrık, çark ve kasnak ile sınırlı kalınır.",
    },
    {
      code: "11.1.10.2",
      subTopicName: "Basit Makineler",
      description: "Basit makineler ile ilgili hesaplamalar yapar.",
      details: [
        "a) İkiden fazla basit makinenin bir arada olduğu sistemlerle ilgili matematiksel hesaplamalara girilmez.",
        "b) Hesaplamaların günlük hayatta kullanılan basit makine örnekleri üzerinden yapılması sağlanır.",
        "c) Basit makinelerde verim ile ilgili matematiksel hesaplamalar yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.10.3",
      subTopicName: "Basit Makineler",
      description:
        "Hayatı kolaylaştırmak amacıyla basit makinelerden oluşan güvenli bir sistem tasarlar.",
    },
  ],

  // ==================== ELEKTRİKSEL KUVVET VE ELEKTRİK ALANI (11.2.1) ====================
  "Elektriksel Kuvvet ve Elektrik Alanı": [
    {
      code: "11.2.1.1",
      subTopicName: "Elektriksel Kuvvet ve Elektrik Alanı",
      description:
        "Yüklü cisimler arasındaki elektriksel kuvveti etkileyen değişkenleri belirler.",
      details: [
        "a) Öğrencilerin deney veya simülasyonlardan yararlanmaları sağlanır.",
        "b) Coulomb sabitinin (k), ortamın elektriksel geçirgenliği ile ilişkisi vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.1.2",
      subTopicName: "Elektriksel Kuvvet ve Elektrik Alanı",
      description: "Noktasal yük için elektrik alanı açıklar.",
    },
    {
      code: "11.2.1.3",
      subTopicName: "Elektriksel Kuvvet ve Elektrik Alanı",
      description:
        "Noktasal yüklerde elektriksel kuvvet ve elektrik alanı ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
  ],

  // ==================== ELEKTRİKSEL POTANSİYEL (11.2.2) ====================
  "Elektriksel Potansiyel": [
    {
      code: "11.2.2.1",
      subTopicName: "Elektriksel Potansiyel",
      description:
        "Noktasal yükler için elektriksel potansiyel enerji, elektriksel potansiyel, elektriksel potansiyel farkı ve elektriksel iş kavramlarını açıklar.",
      details: [
        "a) Kavramların günlük hayat örnekleri ile açıklanması sağlanır.",
        "b) Öğrencilerin, noktasal yüklerin bir noktada oluşturduğu elektrik potansiyeli ve eş potansiyel yüzeylerini tanımlamaları sağlanır.",
      ].join("\n"),
    },
    {
      code: "11.2.2.2",
      subTopicName: "Elektriksel Potansiyel",
      description:
        "Düzgün bir elektrik alan içinde iki nokta arasındaki potansiyel farkını hesaplar.",
      isKeyKazanim: true,
    },
    {
      code: "11.2.2.3",
      subTopicName: "Elektriksel Potansiyel",
      description:
        "Noktasal yükler için elektriksel potansiyel enerji, elektriksel potansiyel, elektriksel potansiyel farkı ve elektriksel iş ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
  ],

  // ==================== DÜZGÜN ELEKTRİK ALANI VE SIĞA (11.2.3) ====================
  "Düzgün Elektrik Alanı ve Sığa": [
    {
      code: "11.2.3.1",
      subTopicName: "Düzgün Elektrik Alanı",
      description:
        "Yüklü, iletken ve paralel levhalar arasında oluşan elektrik alanı, alan çizgilerini çizerek açıklar.",
    },
    {
      code: "11.2.3.2",
      subTopicName: "Düzgün Elektrik Alanı",
      description:
        "Yüklü, iletken ve paralel levhalar arasında oluşan elektrik alanının bağlı olduğu değişkenleri analiz eder.",
    },
    {
      code: "11.2.3.3",
      subTopicName: "Düzgün Elektrik Alanı",
      description:
        "Yüklü parçacıkların düzgün elektrik alandaki davranışını açıklar.",
      details: [
        "a) Alana dik giren parçacıkların sapma yönleri üzerinde durulur. Matematiksel hesaplamalara girilmez.",
        "b) Öğrencilerin yüklü parçacıkların elektrik alandaki davranışının teknolojideki kullanım yerlerini araştırmaları ve sunum yapmaları sağlanır.",
      ].join("\n"),
    },
    {
      code: "11.2.3.4",
      subTopicName: "Sığa (Kapasite)",
      description: "Sığa (kapasite) kavramını açıklar.",
      details: "Matematiksel hesaplamalara girilmez.",
    },
    {
      code: "11.2.3.5",
      subTopicName: "Sığa (Kapasite)",
      description: "Sığanın bağlı olduğu değişkenleri analiz eder.",
      details: [
        "a) Değişkenlerin deney veya simülasyonlarla belirlenmesi sağlanır.",
        "b) Öğrencilerin matematiksel modeli elde etmeleri sağlanır. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "11.2.3.6",
      subTopicName: "Sığa (Kapasite)",
      description:
        "Yüklü levhaların özelliklerinden faydalanarak sığacın (kondansatör) işlevini açıklar.",
    },
  ],

  // ==================== MANYETİZMA VE ELEKTROMANYETİK İNDÜKLEME (11.2.4) ====================
  "Manyetizma ve Elektromanyetik İndükleme": [
    {
      code: "11.2.4.1",
      subTopicName: "Manyetik Alan",
      description:
        "Üzerinden akım geçen iletken düz bir telin çevresinde, halkanın merkezinde ve akım makarasının (bobin) merkez ekseninde oluşan manyetik alanın şiddetini etkileyen değişkenleri analiz eder.",
      details: "Manyetik alan yönünün sağ el kuralıyla gösterilmesi sağlanır.",
    },
    {
      code: "11.2.4.2",
      subTopicName: "Manyetik Alan",
      description:
        "Üzerinden akım geçen iletken düz bir telin çevresinde, halkanın merkezinde ve akım makarasının merkez ekseninde oluşan manyetik alan ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
    {
      code: "11.2.4.3",
      subTopicName: "Manyetik Kuvvet",
      description:
        "Üzerinden akım geçen iletken düz bir tele manyetik alanda etki eden kuvvetin yönünün ve şiddetinin bağlı olduğu değişkenleri analiz eder.",
      details:
        "Manyetik kuvvet büyüklüğünün matematiksel modeli verilir, sağ el kuralının uygulanması sağlanır. Matematiksel hesaplamalara girilmez.",
    },
    {
      code: "11.2.4.4",
      subTopicName: "Manyetik Kuvvet",
      description:
        "Manyetik alan içerisinde akım taşıyan dikdörtgen tel çerçeveye etki eden kuvvetlerin döndürme etkisini açıklar.",
      details: "Dönen çerçeveye etki eden manyetik kuvvetlerin yönünün gösterilmesi sağlanır.",
    },
    {
      code: "11.2.4.5",
      subTopicName: "Manyetik Kuvvet",
      description:
        "Yüklü parçacıkların manyetik alan içindeki hareketini analiz eder.",
      details: [
        "a) Öğrencilerin, sağ el kuralını kullanarak yüklü parçacıklara etki eden manyetik kuvvetin yönünü bulmaları ve bu kuvvetin etkisiyle yükün manyetik alandaki yörüngesini çizmeleri sağlanır.",
        "b) Yüklü parçacıkların manyetik alan içindeki hareketi ile ilgili matematiksel modeller verilmez. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "11.2.4.6",
      subTopicName: "Manyetik Akı",
      description: "Manyetik akı kavramını açıklar.",
      details: "Manyetik akının matematiksel modeli verilir.",
    },
    {
      code: "11.2.4.7",
      subTopicName: "Elektromanyetik İndüklenme",
      description:
        "İndüksiyon akımını oluşturan sebeplere ilişkin çıkarım yapar.",
      details:
        "Çıkarımların deney veya simülasyonlardan yararlanılarak yapılması ve indüksiyon akımının matematiksel modelinin çıkarılması sağlanır.",
    },
    {
      code: "11.2.4.8",
      subTopicName: "Elektromanyetik İndüklenme",
      description:
        "Manyetik akı ve indüksiyon akımı ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
    {
      code: "11.2.4.9",
      subTopicName: "Öz-indüksiyon",
      description: "Öz-indüksiyon akımının oluşum sebebini açıklar.",
      details: "Öz-indüksiyon akımı ile ilgili matematiksel hesaplamalara girilmez.",
    },
    {
      code: "11.2.4.10",
      subTopicName: "Lorentz Kuvveti",
      description:
        "Yüklü parçacıkların manyetik alan ve elektrik alandaki davranışını açıklar.",
      details: [
        "a) Lorentz kuvvetinin matematiksel modeli verilir. Matematiksel hesaplamalara girilmez.",
        "b) Lorentz kuvvetinin günlük hayattaki uygulamalarına örnekler verilir.",
      ].join("\n"),
    },
    {
      code: "11.2.4.11",
      subTopicName: "Elektromotor Kuvveti",
      description:
        "Elektromotor kuvveti oluşturan sebeplere ilişkin çıkarım yapar.",
      details: [
        "a) Deney veya simülasyonlar yardımıyla çıkarımın yapılması sağlanır.",
        "b) Öğrencilerin elektrik motoru ve dinamonun çalışma ilkelerini karşılaştırmaları sağlanır.",
      ].join("\n"),
    },
  ],

  // ==================== ALTERNATİF AKIM (11.2.5) ====================
  "Alternatif Akım": [
    {
      code: "11.2.5.1",
      subTopicName: "Alternatif Akım",
      description: "Alternatif akımı açıklar.",
      details:
        "Öğrencilerin farklı ülkelerin elektrik şebekelerinde kullanılan gerilim değerleri ile ilgili araştırma yapmaları ve bu değerlerin kullanılmasının sebeplerini tartışmaları sağlanır.",
    },
    {
      code: "11.2.5.2",
      subTopicName: "Alternatif Akım",
      description: "Alternatif ve doğru akımı karşılaştırır.",
      details: [
        "a) Alternatif ve doğru akımın kullanıldığı yerler açıklanarak bu akımların karşılaştırılması sağlanır.",
        "b) Edison ve Tesla'nın alternatif akım ve doğru akım ile ilgili görüşlerinin karşılaştırılması sağlanır.",
        "c) Alternatif akımın etkin ve maksimum değerleri vurgulanır.",
      ].join("\n"),
    },
    {
      code: "11.2.5.3",
      subTopicName: "Alternatif Akım Devreleri",
      description:
        "Alternatif ve doğru akım devrelerinde direncin, bobinin ve sığacın davranışını açıklar.",
      details:
        "Öğrencilerin simülasyonlar yardımıyla alternatif ve doğru akım devrelerinde direnç, bobin ve kondansatör davranışlarını ayrı ayrı incelemeleri, değerleri kontrol ederek gerçekleşen değişiklikleri gözlemlemeleri ve yorumlamaları sağlanır.",
    },
    {
      code: "11.2.5.4",
      subTopicName: "Alternatif Akım Devreleri",
      description:
        "İndüktans, kapasitans, rezonans ve empedans kavramlarını açıklar.",
      details: [
        "a) Vektörel gösterim yapılmaz. Akım ve gerilimin zamana bağlı değişim grafiklerine girilmez.",
        "b) Her devre elemanının kendine has bir ohmik direnci olduğu vurgulanır.",
        "c) Alternatif akım devreleri ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  // ==================== TRANSFORMATÖRLER (11.2.6) ====================
  Transformatörler: [
    {
      code: "11.2.6.1",
      subTopicName: "Transformatörler",
      description: "Transformatörlerin çalışma prensibini açıklar.",
      details: [
        "a) Primer ve sekonder gerilimi, primer ve sekonder akım şiddeti, primer ve sekonder güç kavramları açıklanır. Matematiksel hesaplamalara girilmez.",
        "b) İdeal ve ideal olmayan transformatörlerin çalışma ilkesi üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "11.2.6.2",
      subTopicName: "Transformatörler",
      description: "Transformatörlerin kullanım amaçlarını açıklar.",
      details: [
        "a) Öğrencilerin transformatörlerin kullanıldığı yerleri araştırmaları sağlanır.",
        "b) Elektrik enerjisinin taşınma sürecinde transformatörlerin rolü vurgulanır.",
      ].join("\n"),
    },
  ],

  // ==================== DÜZGÜN ÇEMBERSEL HAREKET (12.1.1) ====================
  "Düzgün Çembersel Hareket": [
    {
      code: "12.1.1.1",
      subTopicName: "Düzgün Çembersel Hareket",
      description: "Düzgün çembersel hareketi açıklar.",
      details: [
        "a) Periyot, frekans, çizgisel hız ve açısal hız, merkezcil ivme kavramları verilir.",
        "b) Öğrencilerin düzgün çembersel harekette çizgisel hız vektörünü çember üzerinde iki farklı noktada çizerek merkezcil ivmenin şiddetini bulmaları ve yönünü göstermeleri sağlanır. Çizgisel ivme kavramına girilmez.",
      ].join("\n"),
    },
    {
      code: "12.1.1.2",
      subTopicName: "Düzgün Çembersel Hareket",
      description:
        "Düzgün çembersel harekette merkezcil kuvvetin bağlı olduğu değişkenleri analiz eder.",
      details:
        "Deney yaparak veya simülasyonlarla merkezcil kuvvetin bağlı olduğu değişkenler arasındaki ilişkinin belirlenmesi sağlanır. Matematiksel model verilir. Matematiksel hesaplamalar yapılır.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.1.3",
      subTopicName: "Düzgün Çembersel Hareket",
      description:
        "Düzgün çembersel hareket yapan cisimlerin hareketini analiz eder.",
      details: [
        "a) Yatay ve düşey düzlemde düzgün çembersel hareket yapan cisimlere ait serbest cisim diyagramlarının çizilmesi sağlanır.",
        "b) Düzgün çembersel harekette konum, hız ve ivme hesaplamaları yapılır. Hesaplamalarda trigonometrik fonksiyonlara girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.1.1.4",
      subTopicName: "Düzgün Çembersel Hareket",
      description:
        "Yatay, düşey, eğimli zeminlerde araçların emniyetli dönüş şartları ile ilgili hesaplamalar yapar.",
      details: "Virajlarda emniyetli dönüş için hız sınırına uymanın önemi vurgulanır.",
    },
  ],

  // ==================== DÖNEREK ÖTELEME HAREKETİ (12.1.2) ====================
  "Dönerek Öteleme Hareketi": [
    {
      code: "12.1.2.1",
      subTopicName: "Dönerek Öteleme Hareketi",
      description: "Öteleme ve dönme hareketini karşılaştırır.",
    },
    {
      code: "12.1.2.2",
      subTopicName: "Eylemsizlik Momenti",
      description: "Eylemsizlik momenti kavramını açıklar.",
      details: "Eylemsizlik momenti ile ilgili matematiksel hesaplamalara girilmez.",
    },
    {
      code: "12.1.2.3",
      subTopicName: "Dönerek Öteleme Hareketi",
      description:
        "Dönme ve dönerek öteleme hareketi yapan cismin kinetik enerjisinin bağlı olduğu değişkenleri açıklar.",
      details: "Matematiksel hesaplamalara girilmez.",
    },
  ],

  // ==================== AÇISAL MOMENTUM (12.1.3) ====================
  "Açısal Momentum": [
    {
      code: "12.1.3.1",
      subTopicName: "Açısal Momentum",
      description:
        "Açısal momentumun fiziksel bir nicelik olduğunu açıklar.",
      details: "Açısal momentumun atomik boyutta da fiziksel bir nicelik olduğu belirtilir.",
    },
    {
      code: "12.1.3.2",
      subTopicName: "Açısal Momentum",
      description:
        "Açısal momentumu çizgisel momentum ile ilişkilendirerek açıklar.",
    },
    {
      code: "12.1.3.3",
      subTopicName: "Açısal Momentum",
      description: "Açısal momentumu torkla ilişkilendirir.",
      details: [
        "a) Öğrencilerin, açısal momentumu, eylemsizlik momenti ve açısal hız kavramlarını kullanarak elde etmeleri sağlanır.",
        "b) Öğrencilerin torku, eylemsizlik momenti ve açısal ivme kavramlarını kullanarak elde etmeleri sağlanır.",
      ].join("\n"),
    },
    {
      code: "12.1.3.4",
      subTopicName: "Açısal Momentum",
      description:
        "Açısal momentumun korunumunu günlük hayattan örneklerle açıklar.",
      details: "Açısal momentumun korunumu ile ilgili matematiksel hesaplamalara girilmez.",
    },
  ],

  // ==================== KÜTLE ÇEKİMİ VE KEPLER KANUNU (12.1.4 + 12.1.5) ====================
  "Kütle Çekimi ve Kepler Kanunu": [
    {
      code: "12.1.4.1",
      subTopicName: "Kütle Çekim Kuvveti",
      description: "Kütle çekim kuvvetini açıklar.",
      details: [
        "a) Kütle çekim kuvvetine değinilir. Matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
        "b) Yapay uydular, ay ve gezegenlerin hareketleri açıklanır. Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "12.1.4.2",
      subTopicName: "Kütle Çekim Kuvveti",
      description:
        "Newton'ın Hareket Kanunları'nı kullanarak kütle çekim ivmesinin bağlı olduğu değişkenleri belirler.",
      details: [
        "a) Öğrencilerin yerçekimi ivmesini; dünyanın yarıçapı ve kütlesi cinsinden ifade etmeleri sağlanır.",
        "b) Öğrencilerin homojen bir kürenin içinde, yüzeyinde ve dışındaki çekim alanını gösteren kuvvet çizgilerini çizmeleri sağlanır.",
        "c) Her kütlenin bir kütle çekim alanı oluşturduğu vurgulanır.",
      ].join("\n"),
    },
    {
      code: "12.1.4.3",
      subTopicName: "Kütle Çekim Kuvveti",
      description: "Kütle çekim potansiyel enerjisini açıklar.",
      details: "Bağlanma ve kurtulma enerjisi kavramları üzerinde durulur.",
    },
    {
      code: "12.1.5.1",
      subTopicName: "Kepler Kanunları",
      description: "Kepler Kanunları'nı açıklar.",
      details: [
        "a) Matematiksel hesaplamalara girilmez.",
        "b) Galileo Galilei, Ali Kuşçu ve Uluğ Bey'in gök cisimleri ve gök cisimlerinin hareketleri ile ilgili çalışmalarına yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== BASİT HARMONİK HAREKET (12.2.1) ====================
  "Basit Harmonik Hareket": [
    {
      code: "12.2.1.1",
      subTopicName: "Basit Harmonik Hareket",
      description:
        "Basit harmonik hareketi düzgün çembersel hareketi kullanarak açıklar.",
      details: [
        "a) Basit harmonik harekete günlük hayattan örnekler verilir.",
        "b) Yay sarkacı ve basit sarkaç için uzanım, genlik, periyot, frekans, geri çağırıcı kuvvet ve denge noktası kavramları harmonik hareket örnekleri ile açıklanır.",
        "c) Uzanım, genlik, periyot, frekans ilişkisi ile ilgili matematiksel hesaplamalar yapılır.",
        "ç) Basit harmonik hareket ile ilgili fonksiyonların türevlerine ve işlemlerine girilmez.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.2.1.2",
      subTopicName: "Basit Harmonik Hareket",
      description:
        "Basit harmonik harekette konumun zamana göre değişimini analiz eder.",
      details:
        "Öğrencilerin deney yaparak veya simülasyonlar kullanarak konum-zaman grafiğini çizmeleri ve yorumlamaları sağlanır.",
    },
    {
      code: "12.2.1.3",
      subTopicName: "Basit Harmonik Hareket",
      description:
        "Basit harmonik harekette kuvvet, hız ve ivmenin konuma göre değişimi ile ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
    {
      code: "12.2.1.4",
      subTopicName: "Basit Harmonik Hareket",
      description:
        "Yay sarkacı ve basit sarkaçta periyodun bağlı olduğu değişkenleri belirler.",
      details:
        "Öğrencilerin deney yaparak veya simülasyonlarla periyoda etki eden değişkenleri belirlemeleri sağlanır. Periyodun matematiksel modeli verilir.",
    },
    {
      code: "12.2.1.5",
      subTopicName: "Basit Harmonik Hareket",
      description:
        "Yay sarkacı ve basit sarkacın periyodu ile ilgili hesaplamalar yapar.",
      details: [
        "a) Paralel ve seri bağlı yaylarda eş değer yay sabiti hesaplamalarının yapılması sağlanır.",
        "b) Esnek yayların hareketi tek boyut ile sınırlandırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DALGALARDA KIRINIM, GİRİŞİM VE DOPPLER OLAYI (12.3.1) ====================
  "Dalgalarda Kırınım, Girişim ve Doppler Olayı": [
    {
      code: "12.3.1.1",
      subTopicName: "Kırınım",
      description:
        "Su dalgalarında kırınım olayının dalga boyu ve yarık genişliği ile ilişkisini belirler.",
      details:
        "Öğrencilerin deney yaparak veya simülasyonlar kullanarak elde ettikleri verilerden yararlanarak yorum yapmaları sağlanır.",
    },
    {
      code: "12.3.1.2",
      subTopicName: "Girişim",
      description: "Su dalgalarında girişim olayını açıklar.",
      details: [
        "a) Öğrencilerin girişim desenini deney yaparak veya simülasyonlar kullanarak çizmeleri sağlanır.",
        "b) Girişimle ilgili matematiksel hesaplamalara girilmez.",
        "c) Faz farkı kavramına girilmez.",
      ].join("\n"),
    },
    {
      code: "12.3.1.3",
      subTopicName: "Girişim",
      description:
        "Işığın çift yarıkta girişimine etki eden değişkenleri açıklar.",
      details: [
        "a) Öğrencilerin girişim desenini deney yaparak veya simülasyonlar kullanarak çizmeleri sağlanır.",
        "b) Çift yarıkta girişimle ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "12.3.1.4",
      subTopicName: "Kırınım",
      description:
        "Işığın tek yarıkta kırınımına etki eden değişkenleri açıklar.",
      details: [
        "a) Öğrencilerin kırınım desenini deney yaparak veya simülasyonlar kullanarak çizmeleri sağlanır.",
        "b) Tek yarıkta kırınımla ilgili matematiksel hesaplamalara girilmez.",
        "c) İnce zarlarda girişim, hava kaması ve çözme gücü konularına girilmez.",
      ].join("\n"),
    },
    {
      code: "12.3.1.5",
      subTopicName: "Dalga Doğası",
      description:
        "Kırınım ve girişim olaylarını inceleyerek ışığın dalga doğası hakkında çıkarım yapar.",
    },
    {
      code: "12.3.1.6",
      subTopicName: "Doppler Olayı",
      description:
        "Doppler olayının etkilerini ışık ve ses dalgalarından örneklerle açıklar.",
      details: "Örneklerin günlük hayattan seçilmesine özen gösterilir. Matematiksel hesaplamalara girilmez.",
    },
  ],

  // ==================== ELEKTROMANYETİK DALGALAR (12.3.2) ====================
  "Elektromanyetik Dalgalar": [
    {
      code: "12.3.2.1",
      subTopicName: "Elektromanyetik Dalgalar",
      description:
        "Elektromanyetik dalgaların ortak özelliklerini açıklar.",
      details: "Maxwell'in elektromanyetik teorinin kurucusu olduğu vurgulanır.",
    },
    {
      code: "12.3.2.2",
      subTopicName: "Elektromanyetik Dalgalar",
      description:
        "Elektromanyetik spektrumu günlük hayattan örneklerle ilişkilendirerek açıklar.",
    },
  ],

  // ==================== ATOM KAVRAMININ TARİHSEL GELİŞİMİ (12.4.1) ====================
  "Atom Kavramının Tarihsel Gelişimi": [
    {
      code: "12.4.1.1",
      subTopicName: "Atom Modelleri",
      description: "Atom kavramını açıklar.",
      details: [
        "a) Bohr atom teorisi haricindeki diğer teoriler, ayrıntılara girilmeden tarihsel gelişim süreci içinde verilir.",
        "b) Atom teorilerinin birbirleriyle ilişkili olarak geliştirildiği vurgulanmalıdır.",
        "c) Bohr atom teorisinde; atom yarıçapı, enerji seviyeleri, uyarılma, iyonlaşma ve ışıma kavramları vurgulanır. Matematiksel hesaplamalara girilmez.",
        "ç) Milikan yağ damlası, Thomson'ın e/m tayini, Rutherford saçılması deneyleri ile sınırlı kalınır. Bu deneylerle ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "12.4.1.2",
      subTopicName: "Atom Modelleri",
      description: "Atomun uyarılma yollarını açıklar.",
      details:
        "Atomların birbirleriyle, elektronla, fotonla ve ısıyla uyarılma şartlarının tartışılması sağlanır.",
    },
    {
      code: "12.4.1.3",
      subTopicName: "Atom Modelleri",
      description: "Modern atom teorisinin önemini açıklar.",
      details: [
        "a) Heisenberg Belirsizlik İlkesi, kuantum sayıları, olasılık dalgası ve Schrödinger dalga denklemine değinilir.",
        "b) Matematiksel hesaplamalara girilmez.",
        "c) Feza Gürsey, Asım Orhan Barut ve Behram N. Kurşunoğlu'nun atom fiziği konusunda çalışmalar yaptığı vurgulanır.",
      ].join("\n"),
    },
  ],

  // ==================== BÜYÜK PATLAMA VE EVRENİN OLUŞUMU (12.4.2) ====================
  "Büyük Patlama ve Evrenin Oluşumu": [
    {
      code: "12.4.2.1",
      subTopicName: "Büyük Patlama",
      description: "Büyük patlama teorisini açıklar.",
      details: [
        "a) Evrenin oluşumu ve geleceğiyle ilgili farklı teorilerin de olduğu vurgulanır.",
        "b) Öğrencilerin büyük patlama teorisini destekleyen bilimsel çalışmaları araştırmaları ve sonuçlarını rapor olarak sunmaları sağlanır.",
        "c) Hubble Yasası'na değinilir. Matematiksel modeli verilmez.",
      ].join("\n"),
    },
    {
      code: "12.4.2.2",
      subTopicName: "Atom Altı Parçacıklar",
      description:
        "Atom altı parçacıkların özelliklerini temel düzeyde açıklar.",
      details: [
        "a) Öğrencilerin atom altı parçacıkları standart model çerçevesinde tanımlamaları sağlanır.",
        "b) Korunum yasaları ile ilgili matematiksel hesaplamalara girilmez.",
        "c) Dört temel kuvvetin açıklanması sağlanır.",
        "ç) Abdus Salam, Sheldon Lee Glashow ve Steven Weinberg'in Nobel ödülünü elektromanyetik ve zayıf kuvvetin birleşik bir kuvvet görünümünde olduğunu keşfetmeleri üzerine aldıkları vurgulanır.",
      ].join("\n"),
    },
    {
      code: "12.4.2.3",
      subTopicName: "Madde Oluşumu",
      description: "Madde oluşum sürecini açıklar.",
      details: [
        "a) Atom altı parçacıklardan başlayarak madde oluşumunun modelle açıklanması sağlanır.",
        "b) Higgs bozonuna kısaca değinilir.",
      ].join("\n"),
    },
    {
      code: "12.4.2.4",
      subTopicName: "Madde ve Antimadde",
      description: "Madde ve antimadde kavramlarını açıklar.",
    },
  ],

  // ==================== RADYOAKTİVİTE (12.4.3) ====================
  Radyoaktivite: [
    {
      code: "12.4.3.1",
      subTopicName: "Radyoaktivite",
      description:
        "Kararlı ve kararsız durumdaki atomların özelliklerini karşılaştırır.",
      details: [
        "a) Radyoaktif madde, radyoaktivite, radyoaktif ışıma kavramları üzerinde durulur.",
        "b) Bazı atom çekirdeklerinin çeşitli yollarla ışıma yapabileceği vurgulanır.",
        "c) Marie Curie ve Wilhelm Conrad Röntgen'in radyoaktivite konusunda yaptığı çalışmalara yer verilir.",
      ].join("\n"),
    },
    {
      code: "12.4.3.2",
      subTopicName: "Radyoaktivite",
      description:
        "Radyoaktif bozunma sonucu atomun kütle numarası, atom numarası ve enerjisindeki değişimi açıklar.",
      details: [
        "a) Alfa, beta, gama ışınımları dışındaki bozunma türlerine girilmez.",
        "b) Enerjideki değişim açıklanırken matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "12.4.3.3",
      subTopicName: "Nükleer Fisyon ve Füzyon",
      description: "Nükleer fisyon ve füzyon olaylarını açıklar.",
      details: [
        "a) Nükleer enerji ile çalışan sistemler hakkında araştırma yapılması sağlanır.",
        "b) Nükleer reaktörlerin bilime, teknolojiye, ülke ekonomisine ve çevreye etkileri üzerinde durulur.",
        "c) Atom bombasının yıkıcı etkileri tarihî gerçekler üzerinden açıklanarak nükleer silahsızlanmanın dünya barışı açısından önemi üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "12.4.3.4",
      subTopicName: "Radyasyonun Etkileri",
      description:
        "Radyasyonun canlılar üzerindeki etkilerini açıklar.",
      details: [
        "a) Yaşam alanlarında var olan radyasyon kaynakları, radyasyondan korunma yolları ve radyasyon güvenliğinin araştırılması ve bilgilerin paylaşılması sağlanır.",
        "b) İyonlaştırıcı radyasyona değinilerek kullanıldığı alanlardan ve biyolojik etkilerinden bahsedilir.",
      ].join("\n"),
    },
  ],

  // ==================== ÖZEL GÖRELELİK (12.5.1) ====================
  "Özel Görelelik": [
    {
      code: "12.5.1.1",
      subTopicName: "Özel Görelilik",
      description:
        "Michelson–Morley deneyinin amacını ve sonuçlarını açıklar.",
      details: [
        "a) Deneyin yapılış aşamaları üzerinde durulur.",
        "b) Deneyin farklı bilim insanları tarafından farklı koşullarda çok kez tekrarlanmış olmasının nedeni üzerinde durulur. Bilimsel çalışmalarda sabırlı ve kararlı olmanın önemi vurgulanır.",
        "c) Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "12.5.1.2",
      subTopicName: "Özel Görelilik",
      description:
        "Einstein'ın özel görelilik teorisinin temel postülalarını ifade eder.",
    },
    {
      code: "12.5.1.3",
      subTopicName: "Özel Görelilik",
      description:
        "Göreli zaman ve göreli uzunluk kavramlarını açıklar.",
      details: "Özel görelilikte matematiksel hesaplamalara girilmez.",
    },
    {
      code: "12.5.1.4",
      subTopicName: "Özel Görelilik",
      description: "Kütle-enerji eşdeğerliğini açıklar.",
      details: "Matematiksel hesaplamalara girilmez.",
    },
  ],

  // ==================== KUANTUM FİZİĞİNE GİRİŞ (12.5.2) ====================
  "Kuantum Fiziğine Giriş": [
    {
      code: "12.5.2.1",
      subTopicName: "Siyah Cisim Işıması",
      description: "Siyah cisim ışımasını açıklar.",
      details: [
        "a) Planck hipotezi açıklanır.",
        "b) Dalga boyu-ışıma şiddeti grafiğinden hareketle klasik yaklaşımla modern yaklaşımın çelişkisi ve bu çelişkinin kuantum fiziğinin doğuşuna etkisi vurgulanır.",
        "c) Siyah cisim ışıması ile ilgili matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "12.5.2.2",
      subTopicName: "Siyah Cisim Işıması",
      description:
        "Siyah cisim ışımasının günlük hayattaki uygulamalarına örnekler verir.",
    },
  ],

  // ==================== FOTOELEKTRİK OLAYI (12.5.3) ====================
  "Fotoelektrik Olayı": [
    {
      code: "12.5.3.1",
      subTopicName: "Fotoelektrik Olayı",
      description: "Foton kavramını açıklar.",
    },
    {
      code: "12.5.3.2",
      subTopicName: "Fotoelektrik Olayı",
      description: "Fotoelektrik olayını açıklar.",
      details: [
        "a) Hertz'in çalışmaları üzerinde durulur.",
        "b) Einstein'ın fotoelektrik denklemi üzerinde durulur.",
        "c) Öğrencilerin simülasyonlar yardımıyla fotoelektrik olaya etki eden değişkenleri gözlemlemeleri ve yorumlamaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.5.3.3",
      subTopicName: "Fotoelektrik Olayı",
      description:
        "Farklı metaller için maksimum kinetik enerji-frekans grafiğini çizer.",
      isKeyKazanim: true,
    },
    {
      code: "12.5.3.4",
      subTopicName: "Fotoelektrik Olayı",
      description:
        "Fotoelektronların sahip olduğu maksimum kinetik enerji, durdurma gerilimi ve metalin eşik enerjisi arasındaki matematiksel ilişkiyi açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "12.5.3.5",
      subTopicName: "Fotoelektrik Olayı",
      description:
        "Fotoelektrik olayın günlük hayattaki uygulamalarına örnekler verir.",
    },
    {
      code: "12.5.3.6",
      subTopicName: "Fotoelektrik Olayı",
      description: "Fotoelektrik olayla ilgili hesaplamalar yapar.",
      isKeyKazanim: true,
    },
  ],

  // ==================== COMPTON SAÇILMASI VE DE BROGLIE DALGA BOYU (12.5.4) ====================
  "Compton Saçılması ve De Broglie Dalga Boyu": [
    {
      code: "12.5.4.1",
      subTopicName: "Compton Saçılması",
      description:
        "Compton olayında foton ve elektron etkileşimini açıklar.",
      details:
        "Öğrencilerin model veya simülasyonlar kullanarak Compton saçılmasını açıklamaları sağlanır. Matematiksel hesaplamalara girilmez.",
    },
    {
      code: "12.5.4.2",
      subTopicName: "Işığın İkili Doğası",
      description:
        "Compton ve fotoelektrik olaylarının benzer yönlerini belirterek ışığın tanecik doğası hakkında çıkarım yapar.",
    },
    {
      code: "12.5.4.3",
      subTopicName: "Işığın İkili Doğası",
      description: "Işığın ikili doğasını açıklar.",
      details:
        "Işığın tanecik, dalga, hem tanecik hem de dalga doğası ile açıklanan olaylar vurgulanır.",
    },
    {
      code: "12.5.4.4",
      subTopicName: "De Broglie Dalga Boyu",
      description: "Madde ve dalga arasındaki ilişkiyi açıklar.",
      details: [
        "a) De Broglie bağıntısı verilir.",
        "b) Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
  ],

  // ==================== GÖRÜNTÜLEME TEKNOLOJİLERİ (12.6.1) ====================
  "Görüntüleme Teknolojileri": [
    {
      code: "12.6.1.1",
      subTopicName: "Görüntüleme Teknolojileri",
      description:
        "Görüntüleme cihazlarının çalışma prensiplerini açıklar.",
      details: [
        "a) Öğrencilerin röntgen, MR, PET, tomografi, ultrason, radarlar, sonar, termal kameralar ile ilgili araştırmalar yaparak bu teknolojilerin oluşturulmasında fiziğin rolünü sorgulamaları sağlanır.",
        "b) Görüntüleme cihazlarının çalışma ilkelerine kısaca değinilir.",
      ].join("\n"),
    },
    {
      code: "12.6.1.2",
      subTopicName: "Görüntüleme Teknolojileri",
      description:
        "LCD ve plazma teknolojilerinde fizik biliminin yerini açıklar.",
    },
  ],

  // ==================== YARI İLETKEN TEKNOLOJİSİ (12.6.2) ====================
  "Yarı İletken Teknolojisi": [
    {
      code: "12.6.2.1",
      subTopicName: "Yarı İletken Teknolojisi",
      description:
        "Yarı iletken maddelerin genel özelliklerini açıklar.",
    },
    {
      code: "12.6.2.2",
      subTopicName: "Yarı İletken Teknolojisi",
      description:
        "Yarı iletken malzemelerin teknolojideki önemini açıklar.",
      details: [
        "a) Diyot ve transistörlerin işlevi verilir, çeşitlerine girilmez.",
        "b) Öğrencilerin kumun bir elektronik devre elemanı hâline gelme sürecini araştırmaları ve paylaşmaları sağlanır.",
      ].join("\n"),
    },
    {
      code: "12.6.2.3",
      subTopicName: "LED Teknolojisi",
      description:
        "LED teknolojisinin kullanıldığı yerlere örnekler verir.",
    },
    {
      code: "12.6.2.4",
      subTopicName: "Güneş Pilleri",
      description: "Güneş pillerinin çalışma şeklini açıklar.",
      details: [
        "a) Yapı elemanlarının özelliklerinin detaylarına girilmez.",
        "b) Güneş pillerinin günümüzdeki ve gelecekteki yerinin tartışılması sağlanır.",
      ].join("\n"),
    },
    {
      code: "12.6.2.5",
      subTopicName: "Güneş Pilleri",
      description:
        "Günlük hayatı kolaylaştıran, güneş pillerinin kullanıldığı sistem tasarlar.",
    },
  ],

  // ==================== SÜPER İLETKENLER (12.6.3) ====================
  "Süper İletkenler": [
    {
      code: "12.6.3.1",
      subTopicName: "Süper İletkenler",
      description:
        "Süper iletken maddenin temel özelliklerini açıklar.",
    },
    {
      code: "12.6.3.2",
      subTopicName: "Süper İletkenler",
      description:
        "Süper iletkenlerin teknolojideki kullanım alanlarına örnekler verir.",
      details: "Hızlı trenlerin ve parçacık hızlandırıcılarının çalışma ilkeleri üzerinde durulur.",
    },
  ],

  // ==================== NANOTEKNOLOJİ (12.6.4) ====================
  Nanoteknoloji: [
    {
      code: "12.6.4.1",
      subTopicName: "Nanoteknoloji",
      description: "Nanobilimin temellerini açıklar.",
      details: [
        "a) Fizik bilimi ile nanobilim ve nanoteknolojinin ilişkisi üzerinde durulur.",
        "b) Fonksiyonel ve doğal nanoyapılara sahip sistemlere örnekler verilir.",
      ].join("\n"),
    },
    {
      code: "12.6.4.2",
      subTopicName: "Nanoteknoloji",
      description: "Nanomalzemelerin temel özelliklerini açıklar.",
      details: "Malzemelerin nano boyutlara indirilmesi durumunda yeni özellikler kazandıkları vurgulanır.",
    },
    {
      code: "12.6.4.3",
      subTopicName: "Nanoteknoloji",
      description:
        "Nanomalzemelerin teknolojideki kullanım alanlarına örnekler verir.",
      details: "Nanomalzemelerin bilim ve teknolojinin gelişimine etkisi vurgulanır.",
    },
  ],

  // ==================== LAZER IŞINLARI (12.6.5) ====================
  "Lazer Işınları": [
    {
      code: "12.6.5.1",
      subTopicName: "Lazer Işınları",
      description: "LASER ışınlarının elde edilişini açıklar.",
      details: [
        "a) Simülasyonlar ve videolar yardımıyla LASER ışınının oluşumunun incelenmesi sağlanır.",
        "b) Matematiksel hesaplamalara girilmez.",
      ].join("\n"),
    },
    {
      code: "12.6.5.2",
      subTopicName: "Lazer Işınları",
      description:
        "LASER ışınlarının teknolojideki kullanım alanlarına örnekler verir.",
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

  const fizikSubject = await prisma.subject.findFirst({
    where: { name: "Fizik", examTypeId: ayt.id },
  });
  if (!fizikSubject) {
    console.log("AYT Fizik subject bulunamadı, atlıyorum.");
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
    console.error("seed-ayt-fizik-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
