import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ConceptDef {
  name: string;
  description: string;
}

async function main() {
  console.log("📚 Anahtar kavramlar ekleniyor...\n");

  const topicConcepts: Record<string, ConceptDef[]> = {
    Türev: [
      {
        name: "Limit tanımı ile türev",
        description: "Türevin limit kullanılarak tanımlanması: f'(x) = lim(h→0) [f(x+h)-f(x)]/h",
      },
      {
        name: "Türev kuralları (çarpım/bölüm/zincir)",
        description: "Çarpım kuralı, bölüm kuralı ve zincir kuralı ile türev alma teknikleri",
      },
      {
        name: "L'Hôpital kuralı",
        description: "0/0 veya ∞/∞ belirsizliklerinde limit hesaplama yöntemi",
      },
      {
        name: "Maksimum-minimum",
        description: "Fonksiyonun yerel ve mutlak en büyük/en küçük değerlerinin bulunması",
      },
      {
        name: "Eğim ve teğet",
        description: "Bir eğrinin belirli noktadaki teğet doğrusunun eğiminin türev ile hesaplanması",
      },
    ],
    İntegral: [
      {
        name: "Belirsiz integral",
        description: "Ters türev alma işlemi ve belirsiz integral teknikleri",
      },
      {
        name: "Belirli integral",
        description: "Belirli aralıkta integralin hesaplanması ve temel teorem",
      },
      {
        name: "Alan hesabı",
        description: "İki eğri arasındaki alanın belirli integral ile hesaplanması",
      },
      {
        name: "Hacim hesabı",
        description: "Dönel cisimlerin hacminin integral ile hesaplanması",
      },
      {
        name: "İntegral teknikleri",
        description: "Değişken dönüşümü, kısmi integral ve parçalara ayırma yöntemleri",
      },
    ],
    Olasılık: [
      {
        name: "Örneklem uzayı",
        description: "Bir deneyde tüm olası sonuçların kümesi",
      },
      {
        name: "Bağımsız olay",
        description: "Birinin sonucunun diğerini etkilemediği olaylar ve çarpım kuralı",
      },
      {
        name: "Koşullu olasılık",
        description: "Bir olayın başka bir olay gerçekleştiğinde olma olasılığı: P(A|B)",
      },
      {
        name: "Bayes teoremi",
        description: "Koşullu olasılıkları tersine çevirme yöntemi",
      },
      {
        name: "Permütasyon/Kombinasyon",
        description: "Sıralı (P) ve sırasız (C) seçim ile sayma teknikleri",
      },
    ],
    Genetik: [
      {
        name: "DNA yapısı",
        description: "DNA'nın çift sarmal yapısı, nükleotidler ve baz eşleşmesi",
      },
      {
        name: "Mendel yasaları",
        description: "Ayrılma ve bağımsız dağılım yasaları ile kalıtım temelleri",
      },
      {
        name: "Genotip/Fenotip",
        description: "Genetik yapı (genotip) ile gözlemlenebilir özellikler (fenotip) arasındaki ilişki",
      },
      {
        name: "Çaprazlama",
        description: "Monohibrit ve dihibrit çaprazlama ile Punnett karesi uygulamaları",
      },
      {
        name: "Mutasyon",
        description: "DNA dizisindeki değişiklikler, türleri ve etkileri",
      },
    ],
    Trigonometri: [
      {
        name: "Sin/Cos/Tan tanımları",
        description: "Temel trigonometrik oranlar ve dik üçgende tanımları",
      },
      {
        name: "Birim çember",
        description: "Yarıçapı 1 olan çemberde trigonometrik fonksiyonların geometrik yorumu",
      },
      {
        name: "Trigonometrik özdeşlikler",
        description: "sin²x + cos²x = 1 gibi temel özdeşlikler ve dönüşümler",
      },
      {
        name: "Toplam-fark formülleri",
        description: "sin(a±b), cos(a±b), tan(a±b) açılım formülleri",
      },
      {
        name: "Ters trigonometrik fonksiyonlar",
        description: "arcsin, arccos, arctan fonksiyonları ve tanım kümeleri",
      },
    ],
    Fonksiyonlar: [
      {
        name: "Tanım-değer kümesi",
        description: "Fonksiyonun tanımlı olduğu küme ve aldığı değerler kümesi",
      },
      {
        name: "Bire-bir/Örten",
        description: "Bire-bir (injektif) ve örten (sürjektif) fonksiyon kavramları",
      },
      {
        name: "Bileşke fonksiyon",
        description: "İki fonksiyonun ard arda uygulanması: (f∘g)(x) = f(g(x))",
      },
      {
        name: "Ters fonksiyon",
        description: "Bire-bir fonksiyonun tersinin bulunması ve özellikleri",
      },
      {
        name: "Parçalı fonksiyon",
        description: "Farklı aralıklarda farklı kurallarla tanımlanan fonksiyonlar",
      },
    ],
    "Organik Kimya": [
      {
        name: "Hidrokarbonlar",
        description: "Alkanlar, alkenler, alkinler ve aromatik bileşiklerin yapısı",
      },
      {
        name: "Fonksiyonel gruplar",
        description: "Alkol, aldehit, keton, karboksilik asit, ester, amin grupları",
      },
      {
        name: "İzomeri",
        description: "Yapısal izomeri, geometrik izomeri ve optik izomeri türleri",
      },
      {
        name: "Adlandırma",
        description: "IUPAC kurallarına göre organik bileşiklerin sistematik adlandırılması",
      },
      {
        name: "Polimerler",
        description: "Katılma ve yoğunlaşma polimerizasyonu, doğal ve sentetik polimerler",
      },
    ],
  };

  let created = 0;
  let skipped = 0;

  for (const [topicPattern, concepts] of Object.entries(topicConcepts)) {
    const topic = await prisma.topic.findFirst({
      where: { name: { contains: topicPattern } },
    });

    if (!topic) {
      console.log(`  ✗ Konu bulunamadı: "${topicPattern}"`);
      skipped += concepts.length;
      continue;
    }

    console.log(`  📖 ${topic.name}:`);

    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];

      // Aynı isimde kavram varsa güncelle, yoksa oluştur
      const existing = await prisma.topicConcept.findFirst({
        where: {
          topicId: topic.id,
          name: concept.name,
        },
      });

      if (existing) {
        await prisma.topicConcept.update({
          where: { id: existing.id },
          data: {
            description: concept.description,
            sortOrder: i,
          },
        });
        console.log(`    ↻ ${concept.name} (güncellendi)`);
      } else {
        await prisma.topicConcept.create({
          data: {
            topicId: topic.id,
            name: concept.name,
            description: concept.description,
            sortOrder: i,
          },
        });
        console.log(`    ✓ ${concept.name}`);
      }
      created++;
    }
  }

  console.log(
    `\n🎉 Tamamlandı! ${created} kavram işlendi, ${skipped} atlandı.`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
