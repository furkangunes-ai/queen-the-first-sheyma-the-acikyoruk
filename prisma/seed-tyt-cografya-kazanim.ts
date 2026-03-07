/**
 * TYT Coğrafya kazanımlarını MEB PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Coğrafya Dersi Öğretim Programı (9-10. sınıf), sayfa 112-116
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-cografya-kazanim.ts
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
  // ==================== HARİTA BİLGİSİ (9.1.6-9.1.8) ====================
  "Harita Bilgisi": [
    {
      code: "9.1.6",
      subTopicName: "Haritayı Oluşturan Unsurlar",
      description:
        "Haritayı oluşturan unsurlardan yararlanarak harita kullanır.",
      details: [
        "a) Harita Projeksiyonlarına yer verilir.",
        "b) Farklı harita türlerine ve kullanım amaçlarına yer verilir.",
        "c) Ölçek ile uzunluk ve alan ilişkilerinde basit örneklere yer verilir. Alan hesaplamalarında sadece gerçek alan hesaplamalarına yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.7",
      subTopicName: "Bilgileri Haritalara Aktarma",
      description:
        "Bilgileri haritalara aktarmada kullanılan yöntem ve teknikleri açıklar.",
      details: [
        "a) Haritacılık tarihinde önemli olan Türk ve Müslüman bilim insanları ve çalışmaları üzerinde durulur.",
        "b) Coğrafi Bilgi Sistemlerine (CBS) ve uzaktan algılama tekniklerine yer verilir.",
        "c) Mekânsal verilerin haritaya aktarımında nokta, çizgi ve alansal gösterimlerden yararlanılması sağlanır.",
      ].join("\n"),
    },
    {
      code: "9.1.8",
      subTopicName: "Haritalarda Yer Şekilleri",
      description:
        "Haritalarda yer şekillerinin gösteriminde kullanılan yöntem ve teknikleri açıklar.",
      details: [
        "a) Eş yükselti eğrilerinin özelliklerine yer verilir.",
        "b) Eş yükselti eğrileri ile çizilmiş haritalar üzerinde yer şekillerinin ayırt edilmesine yer verilir.",
        "c) Haritalarda yer şekillerini gösterme yöntemlerinden renklendirme ve kabartma yöntemlerine yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== DÜNYANIN ŞEKLİ VE HAREKETLERİ (9.1.4-9.1.5) ====================
  "Dünyanın Şekli ve Hareketleri": [
    {
      code: "9.1.4",
      subTopicName: "Dünya'nın Şekli ve Hareketleri",
      description:
        "Dünya'nın şekli ve hareketlerinin etkilerini değerlendirir.",
      details:
        "Dünya'nın Güneş Sistemi içindeki yerine kısaca değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.1.5",
      subTopicName: "Koordinat Sistemi",
      description:
        "Koordinat sistemini kullanarak zaman ve yere ait özellikler hakkında çıkarımlarda bulunur.",
      details: [
        "a) Mutlak ve göreceli konum kavramlarına yer verilir.",
        "b) Türkiye'nin konumuna yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== İKLİM BİLGİSİ (9.1.9-9.1.12) ====================
  "İklim Bilgisi": [
    {
      code: "9.1.9",
      subTopicName: "Atmosfer ve Hava Olayları",
      description:
        "Atmosferin katmanları ve özellikleri ile hava olaylarını ilişkilendirir.",
    },
    {
      code: "9.1.10",
      subTopicName: "Hava Durumu ve İklim",
      description:
        "Örneklerden yararlanarak hava durumu ile iklim özelliklerini etkileri açısından karşılaştırır.",
    },
    {
      code: "9.1.11",
      subTopicName: "İklim Elemanları",
      description:
        "İklim elemanlarının oluşumunu ve dağılışını açıklar.",
      details: [
        "a) İklim elemanlarına ait temel kavramlara ve iklim elamanlarını etkileyen faktörlere yer verilir.",
        "b) İklim elemanlarının günlük hayata etkilerine örnekler üzerinden yer verilir.",
        "c) Yaşanılan yerdeki iklim elemanlarına ait verilerden yararlanılarak tablo ve grafikler çizilir ve günlük hayatla ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.12",
      subTopicName: "İklim Tipleri",
      description:
        "Yeryüzündeki farklı iklim tiplerinin özellikleri ve dağılışları hakkında çıkarımlarda bulunur.",
      details:
        "Gerçek istasyonlara ait klimatolojik verilerin yer aldığı iklim grafiklerine yer verilir.",
    },
  ],

  // ==================== TÜRKİYE'NİN İKLİMİ VE YER ŞEKİLLERİ (9.1.13 + 10.1.8) ====================
  "Türkiye'nin İklimi ve Yer Şekilleri": [
    {
      code: "9.1.13",
      subTopicName: "Türkiye'nin İklimi",
      description:
        "Türkiye'de görülen iklim tiplerinin özellikleri hakkında çıkarımlarda bulunur.",
      details: [
        "a) Türkiye'nin iklimini etkileyen faktörlere yer verilir.",
        "b) Türkiye'deki iklim elemanlarının özellikleri üzerinde durulur.",
        "c) Türkiye'de görülen iklim tipleri ve özelliklerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.8",
      subTopicName: "Türkiye'nin Yer Şekilleri",
      description:
        "Türkiye'deki ana yer şekillerini temel özellikleri ve dağılışları açısından değerlendirir.",
      details: "Dağ, ova ve platolar ele alınır.",
    },
  ],

  // ==================== YER'İN ŞEKİLLENMESİ (10.1.1-10.1.2) ====================
  "Yer'in Şekillenmesi": [
    {
      code: "10.1.1",
      subTopicName: "Dünya'nın Tektonik Oluşumu",
      description: "Dünya'nın tektonik oluşumunu açıklar.",
      details: [
        "a) Dünya'nın iç yapısı ile ilgili temel bilgiler verilir.",
        "b) Levha tektoniği kuramına yer verilir.",
      ].join("\n"),
    },
    {
      code: "10.1.2",
      subTopicName: "Jeolojik Zamanlar",
      description:
        "Jeolojik zamanların özelliklerini tektonik olaylarla ilişkilendirerek açıklar.",
      details: [
        "a) Jeolojik zamanların adlandırılması Türkçe olarak da yapılır.",
        "b) Jeolojik zamanların özelliklerine yer verilirken Türkiye'nin jeolojik geçmişine değinilir.",
        "c) Türkiye'nin tektonizmasına yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== İÇ VE DIŞ KUVVETLER (10.1.3-10.1.7) ====================
  "İç ve Dış Kuvvetler": [
    {
      code: "10.1.3",
      subTopicName: "İç Kuvvetler",
      description:
        "İç kuvvetleri; yer şekillerinin oluşum sürecine etkileri açısından açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "10.1.4",
      subTopicName: "Kayaçlar ve Yer Şekilleri",
      description:
        "Kayaçların özellikleri ile yeryüzü şekillerinin oluşum süreçlerini ilişkilendirir.",
      details: "Kayaçların kullanım alanlarına yönelik örneklere yer verilir.",
    },
    {
      code: "10.1.5",
      subTopicName: "Türkiye'de İç Kuvvetler",
      description:
        "Türkiye'deki yer şekillerinin oluşum sürecine iç kuvvetlerin etkisini açıklar.",
      details:
        "Türkiye'deki faylar, levha hareketleri ve depremler arasındaki ilişkiye yer verilir.",
    },
    {
      code: "10.1.6",
      subTopicName: "Dış Kuvvetler",
      description:
        "Dış kuvvetleri yer şekillerinin oluşum sürecine etkileri açısından açıklar.",
    },
    {
      code: "10.1.7",
      subTopicName: "Türkiye'de Dış Kuvvetler",
      description:
        "Türkiye'deki yer şekillerinin oluşum sürecine dış kuvvetlerin etkisini açıklar.",
    },
  ],

  // ==================== TOPRAK TİPLERİ (10.1.12-10.1.14) ====================
  "Toprak Tipleri": [
    {
      code: "10.1.12",
      subTopicName: "Toprak Çeşitliliği",
      description:
        "Yeryüzündeki toprak çeşitliliğini oluşum süreçleri ile ilişkilendirir.",
      isKeyKazanim: true,
    },
    {
      code: "10.1.13",
      subTopicName: "Türkiye'de Toprak Tipleri",
      description:
        "Türkiye'deki toprakların dağılışını etkileyen faktörler ile toprak tiplerini ilişkilendirir.",
    },
    {
      code: "10.1.14",
      subTopicName: "Türkiye'de Toprak Kullanımı",
      description:
        "Türkiye topraklarının kullanımını verimlilik açısından değerlendirir.",
      details: [
        "a) Türkiye'de erozyonun etkisine vurgu yapılır.",
        "b) Gelecek nesillere daha yaşanabilir bir ülke bırakabilmek için topraklarımızın korunmasının gerekliliğine değinilir.",
      ].join("\n"),
    },
  ],

  // ==================== NÜFUS (10.2.1-10.2.10) ====================
  Nüfus: [
    {
      code: "10.2.1",
      subTopicName: "Nüfus Özellikleri",
      description:
        "İstatistiki verilerden yararlanarak nüfus özellikleri ve nüfusun önemi hakkında çıkarımlarda bulunur.",
      details: [
        "a) Nüfus artış ve azalışının olumlu ve olumsuz etkilerine örnek ülkeler üzerinden yer verilir.",
        "b) Nitelikli genç nüfusun ülkelerin kalkınmasındaki önemi vurgulanır.",
        "c) Nüfus artış hızı ile ülkelerin kalkınması arasındaki ilişkiye yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.2",
      subTopicName: "Dünya Nüfusunun Tarihsel Değişimi",
      description:
        "İstatistiki verilerden yararlanarak dünya nüfusunun tarihsel süreçteki değişimine ilişkin çıkarımlarda bulunur.",
    },
    {
      code: "10.2.3",
      subTopicName: "Nüfus Dağılışı",
      description:
        "Nüfus dağılışı üzerinde etkili olan faktörler ile dünya nüfusunun dağılışını ilişkilendirir.",
      details:
        "Nüfus yoğunluğunu hesaplama yöntemlerinden sadece \"Aritmetik Nüfus Yoğunluğu\"na yer verilir.",
    },
    {
      code: "10.2.4",
      subTopicName: "Nüfus Piramitleri",
      description:
        "Nüfus piramitlerinden hareketle nüfusun yapısıyla ilgili çıkarımlarda bulunur.",
      details: [
        "a) Temel nüfus piramitlerinin özellikleri verilir.",
        "b) Nüfus piramidi oluşturulması sağlanır.",
      ].join("\n"),
    },
    {
      code: "10.2.5",
      subTopicName: "Türkiye Nüfusu Tarihsel Seyir",
      description:
        "Türkiye'de nüfusun tarihsel seyrini sosyal ve ekonomik faktörler açısından değerlendirir.",
    },
    {
      code: "10.2.6",
      subTopicName: "Türkiye Nüfus Dağılışı",
      description:
        "Türkiye'de nüfusun dağılışını, nüfusun dağılışında etkili olan faktörler açısından değerlendirir.",
    },
    {
      code: "10.2.7",
      subTopicName: "Türkiye Nüfus Yapısı",
      description:
        "Güncel verilerden yararlanarak Türkiye nüfusunun yapısal özelliklerini analiz eder.",
      details:
        "Türkiye nüfusunun cinsiyet yapısı verilirken toplumsal cinsiyet adaleti ve eşitliğine değinilir.",
    },
    {
      code: "10.2.8",
      subTopicName: "Göçler",
      description:
        "Tarihî metin, belge ve haritalardan yararlanarak dünyadaki göçlerin nedenleri ve sonuçları hakkında çıkarımlarda bulunur.",
      details: [
        "a) Tarihteki önemli Türk göçlerinin sebepleri üzerinde durulur.",
        "b) Güncel mülteci göçlerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.9",
      subTopicName: "Türkiye'deki Göçler",
      description:
        "Türkiye'deki göçleri sebep ve sonuçları açısından değerlendirir.",
      details: [
        "a) Cumhuriyet'ten günümüze gerçekleşen iç ve dış göçlerin ekonomik, sosyal ve kültürel etkilerine yer verilir.",
        "b) Türkiye'ye göç etmek zorunda kalan topluluklara karşı saygılı ve paylaşımcı bir tutum sergilemenin gerekliliği vurgulanır.",
      ].join("\n"),
    },
    {
      code: "10.2.10",
      subTopicName: "Göçün Mekânsal Etkileri",
      description:
        "Göçün mekânsal etkilerini Türkiye'den örneklerle açıklar.",
    },
  ],

  // ==================== ORTAK PAYDA: BÖLGE (9.3.1-9.3.3) ====================
  "Ortak Payda: Bölge": [
    {
      code: "9.3.1",
      subTopicName: "Bölge Kavramı",
      description:
        "Dünyadaki farklı bölge örneklerini, özellikleri ve bölge belirlemede kullanılan kriterler açısından değerlendirir.",
      details: [
        "a) Şekilsel ve işlevsel bölge ayrımına yer verilir.",
        "b) Türkiye'den ve dünyadan farklı bölge örneklerine yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.3.2",
      subTopicName: "Bölge Sınırları",
      description:
        "Bölge sınırlarının amaca göre değişebilirliğini örneklerle açıklar.",
    },
    {
      code: "9.3.3",
      subTopicName: "Bölgelerin Sınıflandırılması",
      description:
        "Harita kullanarak çeşitli coğrafi kriterlerle belirlenmiş bölgelerde bulunan ülkeleri sınıflandırır.",
    },
  ],

  // ==================== ULAŞIM YOLLARI (10.3.1) ====================
  "Ulaşım Yolları": [
    {
      code: "10.3.1",
      subTopicName: "Uluslararası Ulaşım Hatları",
      description:
        "Uluslararası ulaşım hatlarını bölgesel ve küresel etkileri açısından analiz eder.",
      details:
        "İstanbul'daki 3. Hava Limanı ve Kanal İstanbul projelerinin bölgesel ve küresel etkilerine yer verilir.",
      isKeyKazanim: true,
    },
  ],

  // ==================== ÇEVRE VE İNSAN (9.4.1-9.4.2) ====================
  "Çevre ve İnsan": [
    {
      code: "9.4.1",
      subTopicName: "Doğal Çevreyi Kullanma",
      description:
        "İnsanların doğal çevreyi kullanma biçimlerini örneklendirir.",
      details:
        "Karadeniz Sahil Yolu, Maltepe Sahil Parkı, Avrasya Tüneli, Osman Gazi Köprüsü, Ordu-Giresun Hava Limanı, Marmaray ve BAE-Dubai Palmiye gibi örneklere değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.4.2",
      subTopicName: "İnsan Etkisi ve Doğal Değişimler",
      description:
        "Doğal ortamda insan etkisiyle meydana gelen değişimleri sonuçları açısından değerlendirir.",
      details: [
        "a) Örnek olaylardan hareketle insanın atmosfer, litosfer, hidrosfer ve biyosfer üzerindeki etkilerine yer verilir.",
        "b) İnsanların doğal ortam üzerinde gerçekleştirdikleri değişimlerde, doğaya karşı duyarlı olmalarının gerekliliği vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DOĞAL AFETLER (10.4.1-10.4.4) ====================
  "Doğal Afetler": [
    {
      code: "10.4.1",
      subTopicName: "Afetlerin Oluşumu",
      description:
        "Afetlerin oluşum nedenlerini ve özelliklerini açıklar.",
      details:
        "Coğrafi problemlerin çözümünde CBS ve diğer mekânsal teknolojilerden yararlanıldığına dair örneklere yer verilir.",
      isKeyKazanim: true,
    },
    {
      code: "10.4.2",
      subTopicName: "Afetlerin Dağılışı",
      description:
        "Afetlerin dağılışları ile etkilerini ilişkilendirir.",
    },
    {
      code: "10.4.3",
      subTopicName: "Türkiye'deki Afetler",
      description:
        "Türkiye'deki afetlerin dağılışları ile etkilerini ilişkilendirir.",
      isKeyKazanim: true,
    },
    {
      code: "10.4.4",
      subTopicName: "Afetlerden Korunma",
      description: "Afetlerden korunma yöntemlerini açıklar.",
      details: [
        "a) Farklı ülkelerde doğal afetlere karşı yapılan uygulamalara yer verilir.",
        "b) Ülkemizde depremler başta olmak üzere, afetlere karşı bilinç oluşturmanın önemi üzerinde durulur.",
        "c) Afetlerin meydana gelme sürecinde bireylere düşen sorumluluklara değinilir.",
      ].join("\n"),
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

  const cografyaSubject = await prisma.subject.findFirst({
    where: { name: "Coğrafya", examTypeId: tyt.id },
  });
  if (!cografyaSubject) {
    console.log("TYT Coğrafya subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: cografyaSubject.id },
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
    console.error("seed-tyt-cografya-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
