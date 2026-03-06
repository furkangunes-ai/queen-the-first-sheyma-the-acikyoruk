/**
 * TYT Din Kulturu ve Ahlak Bilgisi kazanimlarini MEB PDF'den sisteme ekler.
 * Kaynak: MEB Ortaogretim Din Kulturu ve Ahlak Bilgisi Dersi Ogretim Programi (2018), sayfa 51-74
 *
 * Bu script mevcut konulara kazanim ekler. Mevcut mufredati BOZMAZ.
 * Zaten kazanimi olan topic'leri atlar (idempotent).
 *
 * Calistirmak icin: npx tsx prisma/seed-tyt-din-kazanim.ts
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
// PDF'DEN CIKARILMIS KAZANIMLAR -- TOPIC ADI -> KAZANIM LISTESI
// =====================================================================

const KAZANIMLAR: Record<string, KazanimDef[]> = {
  // ==================== INANC (9.1 Bilgi ve Inanc) ====================
  "İnanç": [
    {
      code: "9.1.1",
      subTopicName: "Bilgi ve İnanç",
      description:
        "İslam'da bilginin kaynaklarını açıklar.",
      details: [
        "İslam'ın bilgi kaynaklarında; selim akıl, doğru haber ve salim duyu organlarının yanı sıra bilgi ve düşünme kaynakları hakkında felsefe ve bilim dünyasındaki yapılan değerlendirmeler, İslam kelamının epistemolojik yaklaşımları bağlamında ele alınır. Rüya, keşif ve ilhamın İslam alimleri nce bilgi kaynağı olarak kabul edilmediğine vurgu yapılır. Ayrıca güncel bilgi kaynaklarına (dijital kayıtlar gibi) değinilir.",
        "Bilgiyi sevme, doğru bilgiye ulaşma ve faydalı bilgi ile bilgi ahlakı, bilginin kullanımı ve muhafazası gibi konulara da değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.2",
      subTopicName: "Bilgi ve İnanç",
      description:
        "İslam inancında imanın mahiyetini araştırır.",
      details: [
        "İman tasdik ilişkisi, iman ikrar ilişkisi, iman bilgi ilişkisi ve iman amel ilişkisi konularına yer verilir.",
        "İslam inancında imanın taklitten kurtarılarak tahkike ulaşmasının önemine de değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.3",
      subTopicName: "Bilgi ve İnanç",
      description:
        "İsra suresi 36. ayet ile Mülk suresi 23. ayetlerinde verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== IBADET (9.3 Islam ve Ibadet) ====================
  "İbadet": [
    {
      code: "9.3.1",
      subTopicName: "İslam ve İbadet",
      description:
        "İslam'da ibadet kavramını ve ibadetin kapsamını açıklar.",
      details:
        "İslam'da ibadetin kapsamı konusunda Allah'ın rızasına dayanan her davranışın ibadet olduğuna, bazı ibadetlerin (namaz, oruç, hac, zekat gibi) belirli bir vaktinin ve uygulanma şeklinin olduğuna, bazı ibadetlerin ise belirli bir vaktinin olmadığına değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.3.2",
      subTopicName: "İslam ve İbadet",
      description:
        "İslam'da ibadetlerin yapılış amacını ve önemini fark eder.",
    },
    {
      code: "9.3.3",
      subTopicName: "İslam ve İbadet",
      description:
        "İbadet yükümlülüğü ile ilgili bazı kavramları sınıflandırır.",
      details:
        "Mükellef ve ef'al-i mükellefine (farz, vacip, sünnet, mendup, mübah, haram ve mekruh) yer verilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.3.4",
      subTopicName: "İslam ve İbadet",
      description:
        "İslam'da ibadetlerin temel ilkelerini değerlendirir.",
      details:
        "İslam'da ibadetlerin temel ilkeleri kapsamında; \"Kur'an ve sünnete uygunluk\", \"niyet\", \"ihlas\" konularına yer verilir. Ayrıca ibadetlerde bidatlerden kaçınmanın önemine değinilir.",
    },
    {
      code: "9.3.5",
      subTopicName: "İslam ve İbadet",
      description:
        "İbadetlerin, bireyin ahlaki gelişimi üzerindeki etkisini yorumlar.",
      details:
        "İbadetlerin teşri hikmeti üzerinde durulur ve ibadetlerin toplumsal yönüne değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.3.6",
      subTopicName: "İslam ve İbadet",
      description:
        "Bakara suresi 177. ayette verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== HZ. MUHAMMED (S.A.V) (10.2 Hz. Muhammed ve Genclik) ====================
  "Hz. Muhammed (S.A.V)": [
    {
      code: "10.2.1",
      subTopicName: "Hz. Muhammed ve Gençlik",
      description:
        "Kur'an-ı Kerim'den gençlerle ilgili ayetlere örnekler verir.",
      isKeyKazanim: true,
    },
    {
      code: "10.2.2",
      subTopicName: "Hz. Muhammed ve Gençlik",
      description:
        "Hz. Muhammed'in gençlik yıllarındaki erdemli davranışlarını kendi hayatıyla ilişkilendirir.",
      isKeyKazanim: true,
    },
    {
      code: "10.2.3",
      subTopicName: "Hz. Muhammed ve Gençlik",
      description:
        "Hz. Muhammed ile genç sahabiler arasındaki iletişimi değerlendirir.",
    },
  ],

  // ==================== VAHIY VE AKIL (9.2 Din ve Islam) ====================
  "Vahiy ve Akıl": [
    {
      code: "9.2.1",
      subTopicName: "Din ve İslam",
      description:
        "Kaynağı ve unsurları bakımından din tanımlarını karşılaştırır.",
      details: [
        "Kur'an-ı Kerim'de din kavramının farklı anlamları ele alınır ve İslam alimleri nce yapılan din tanımlarına örnekler verilir.",
        "Çeşitli disiplinlere (felsefe, sosyoloji, antropoloji, dinler tarihi) göre din tanımlarına birer örnek verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.2",
      subTopicName: "Din ve İslam",
      description:
        "İnsanın doğası ile din arasında ilişki kurar.",
      details:
        "İnsan doğasının maddi ve manevi yönüne değinilir; tarih boyunca insanın inanma ihtiyacının nedenleri Kur'an-ı Kerim'den ilgili ayetlerle ele alınır; dinin insan hayatındaki yeri ve önemi örneklerle açıklanır.",
    },
    {
      code: "9.2.3",
      subTopicName: "Din ve İslam",
      description:
        "İman ve İslam kavramları arasındaki ilişkiyi fark eder.",
      isKeyKazanim: true,
    },
    {
      code: "9.2.4",
      subTopicName: "Din ve İslam",
      description:
        "İslam'ın inanç esaslarının özelliklerini ayet ve hadisler ışığında analiz eder.",
      details: [
        "İslam inancının sade ve yalın olması, kul ile Allah arasında hiçbir aracı kişi ve kuruma izin vermemesi, dogmatik olmaması, hür iradeyi esas alması, ebedi kurtuluş için korku ve ümit arasında yaşamayı tavsiye etmesi gibi konulara değinilir.",
        "İslam inancında tevhidin önemi ile tevhid inancının yerleşmesinde Allah'ın isim ve sıfatlarını doğru anlamanın yeri ayetlerle ele alınır; inanç esasları ile ilgili ayrıntılara girilmez.",
        "İslam inanç esasları arasındaki bütünselliğin önemine değinilir; İslam inançlarını parçacı bir yaklaşımla ele almanın sakıncaları örneklerle açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.5",
      subTopicName: "Din ve İslam",
      description:
        "Nisa suresi 136. ayette verilen mesajları değerlendirir.",
      details: [
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
        "Ayet ele alınırken Cibril hadisine de yer verilir.",
      ].join("\n"),
    },
  ],

  // ==================== AHLAK VE DEGERLER (9.4 Genclik ve Degerler) ====================
  "Ahlak ve Değerler": [
    {
      code: "9.4.1",
      subTopicName: "Gençlik ve Değerler",
      description:
        "Değerlerin oluşumuna etki eden unsurları analiz eder.",
      details:
        "Değer kavramının analizi yapılır; değerlerin oluşumunda; dinin, örf ve adetlerin etkisine yer verilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.4.2",
      subTopicName: "Gençlik ve Değerler",
      description:
        "Gençlerin kişilik gelişiminde dini ve ahlaki değerler ile örf ve adetlerin yerini tartışır.",
      details:
        "Gençlerin kişilik gelişimine değerlerin etkisi günlük hayattan örneklerle açıklanır.",
    },
    {
      code: "9.4.3",
      subTopicName: "Gençlik ve Değerler",
      description:
        "Temel değerleri ayet ve hadislerle ilişkilendirir.",
      details:
        "İslam düşünce geleneğinde öne çıkan temel \"insani erdem ve değerler\"den hikmet, adalet, iffet ve şecaat konularına yer verilir. İnsanın düşünme, arzu ve gazap gibi konularda ölçülü olması, itidal üzere hareket etmesi, bedeni ve maddi hazlara aşırı düşkünlükten korunması, gönül tokluğu gibi anlamlara gelen iffet kavramı, ahlaki ve felsefi boyutlarıyla ele alınır.",
      isKeyKazanim: true,
    },
    {
      code: "9.4.4",
      subTopicName: "Gençlik ve Değerler",
      description:
        "İsra suresi 23-29. ayetlerde verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== KURAN VE YORUMU (10.1 Allah Insan Iliskisi) ====================
  "Kuran ve Yorumu": [
    {
      code: "10.1.1",
      subTopicName: "Allah İnsan İlişkisi",
      description:
        "Allah inancının insan hayatındaki yeri ve önemini yorumlar.",
      isKeyKazanim: true,
    },
    {
      code: "10.1.2",
      subTopicName: "Allah İnsan İlişkisi",
      description:
        "Allah'ın varlığı ve birliği konusunda akli ve nakli delilleri analiz eder.",
      details:
        "\"Gaye ve nizam\", \"ekmel varlık\" delilleri ile sınırlandırılır.",
      isKeyKazanim: true,
    },
    {
      code: "10.1.3",
      subTopicName: "Allah İnsan İlişkisi",
      description:
        "İsim ve sıfatlarının yansımalarıyla Allah'ı tanır.",
      details:
        "Allah'ın isim ve sıfatlarını kavramanın, O'nu tanımadaki önemine değinilir; isim ve sıfatların kainatta tecellisi üzerinde durulur. İsim ve sıfatlar, Allah insan ilişkisi bağlamında; Bakara suresi 255. ayet, Haşr suresi 22-24. ayetler ve İhlas suresi kapsamında işlenir.",
    },
    {
      code: "10.1.4",
      subTopicName: "Allah İnsan İlişkisi",
      description:
        "İnsanın özelliklerini ayetlerle açıklar.",
      details:
        "Kazanım kapsamında insanın olumlu özellikleri öne çıkarılır.",
    },
    {
      code: "10.1.5",
      subTopicName: "Allah İnsan İlişkisi",
      description:
        "İnsanın Allah ile irtibat yollarını fark eder.",
      details: [
        "Kazanım; dua, ibadet, Kur'an okuma, tövbe ve istiğfar konuları ile sınırlandırılır.",
        "Allah ile insan arasındaki ilişkinin dayandığı temel ilkelere yer verilir; temel ilkeler Yaradan-yaradılan ilişkisi çerçevesinde ele alınır; Allah'ın \"ilah\" ve \"rab\" olma vasfının insan üzerindeki etkisine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.6",
      subTopicName: "Allah İnsan İlişkisi",
      description:
        "Rum suresi 18-27. ayetlerde verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== ZEKAT (9.3 Ibadet - zekat ile ilgili kazanimlar) ====================
  "Zekât": [
    {
      code: "9.3.4",
      subTopicName: "İslam ve İbadet",
      description:
        "İslam'da ibadetlerin temel ilkelerini değerlendirir.",
      details:
        "İslam'da ibadetlerin temel ilkeleri kapsamında; \"Kur'an ve sünnete uygunluk\", \"niyet\", \"ihlas\" konularına yer verilir. Ayrıca ibadetlerde bidatlerden kaçınmanın önemine değinilir. Zekat ibadetinin ihlasla ve samimiyetle yerine getirilmesi üzerinde durulur.",
      isKeyKazanim: true,
    },
    {
      code: "9.3.5",
      subTopicName: "İslam ve İbadet",
      description:
        "İbadetlerin, bireyin ahlaki gelişimi üzerindeki etkisini yorumlar.",
      details:
        "İbadetlerin teşri hikmeti üzerinde durulur ve ibadetlerin toplumsal yönüne değinilir. Zekatın toplumsal dayanışma ve yardımlaşmadaki rolü vurgulanır.",
      isKeyKazanim: true,
    },
    {
      code: "9.3.1",
      subTopicName: "İslam ve İbadet",
      description:
        "İslam'da ibadet kavramını ve ibadetin kapsamını açıklar.",
      details:
        "İslam'da ibadetin kapsamı konusunda Allah'ın rızasına dayanan her davranışın ibadet olduğuna, bazı ibadetlerin (namaz, oruç, hac, zekat gibi) belirli bir vaktinin ve uygulanma şeklinin olduğuna, bazı ibadetlerin ise belirli bir vaktinin olmadığına değinilir.",
    },
  ],

  // ==================== HZ. MUHAMMED'IN HAYATI (11.2 Kur'an'a Gore Hz. Muhammed) ====================
  "Hz. Muhammed'in Hayatı": [
    {
      code: "11.2.1",
      subTopicName: "Kur'an'a Göre Hz. Muhammed",
      description:
        "Hz. Muhammed'in örnek şahsiyetini tanır.",
      details: [
        "Hz. Muhammed'in beşeri yönü ile ilgili ayetlerden örnek verilmesine özen gösterilir.",
        "Hz. Muhammed'in ahlaki özellikleri örneklerle ele alınır.",
        "Öğrencilerin, İslam'ı anlamada Hz. Muhammed'in örnek şahsiyetinin yerini analiz edebileceği etkinliklere yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.2",
      subTopicName: "Kur'an'a Göre Hz. Muhammed",
      description:
        "Hz. Muhammed'in peygamberlikle ilgili görevlerini açıklar.",
      details:
        "Hz. Muhammed'in tebliğ, tebyin, teşri ve temsil (İslam'ı anlama ve yaşama konusundaki örnekliği) görevlerine değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "11.2.3",
      subTopicName: "Kur'an'a Göre Hz. Muhammed",
      description:
        "Hz. Peygamber'e bağlılık ve itaati ayet ve hadislerden hareketle yorumlar.",
      details: [
        "Hadis ve sünnet kavramlarına, İslam'ın anlaşılmasında sünnetin önemine ve kültürümüzde Peygamber ve Ehl-i Beyt sevgisine de değinilir.",
        "Hadis kaynaklarından Kütüb-i tis'a ve müellifleri isim olarak listelenir.",
      ].join("\n"),
    },
    {
      code: "11.2.4",
      subTopicName: "Kur'an'a Göre Hz. Muhammed",
      description:
        "Ahzab suresi 45-46. ayetlerde verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== ISLAM DUSUNCESINDE YORUMLAR (10.5 Itikadi, Siyasi ve Fikhi Yorumlar) ====================
  "İslam Düşüncesinde Yorumlar": [
    {
      code: "10.5.1",
      subTopicName: "İtikadi, Siyasi ve Fıkhi Yorumlar",
      description:
        "Din ve dinin yorumu arasındaki farkı ayırt eder.",
      details: [
        "Dinin farklı yorum biçimleri olabileceğine vurgu yapılır; dinin yanlış yorumlanmasından doğan sorunların, dinin kendisinden kaynaklanmadığına değinilir.",
        "Din anlayışındaki yorum farklılıklarının sebepleri düzeye uygun bir biçimde ayrıntıya girilmeden ele alınır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.2",
      subTopicName: "İtikadi, Siyasi ve Fıkhi Yorumlar",
      description:
        "İslam düşüncesindeki yorum farklılıklarının sebeplerini tartışır.",
      details:
        "Yorum farklılıkları; insan unsuru; sosyal, siyasi, kültürel ve coğrafi ortam ile dini metinlere yaklaşım ve onları yorumlama farklılıklarından kaynaklanan sebepler ile sınırlandırılır.",
    },
    {
      code: "10.5.3",
      subTopicName: "İtikadi, Siyasi ve Fıkhi Yorumlar",
      description:
        "Dini yorumlarla ilgili bazı kavramları değerlendirir.",
      details:
        "İtikad, fıkıh, mezhep ve fırka kavramları öğrencilerin seviyeleri ve kültürel altyapıları göz önünde bulundurularak ele alınır.",
      isKeyKazanim: true,
    },
    {
      code: "10.5.4",
      subTopicName: "İtikadi, Siyasi ve Fıkhi Yorumlar",
      description:
        "İslam düşüncesinde itikadi ve siyasi yorumları genel özelliklerine göre sınıflandırır.",
      details:
        "Kazanım Ehl-i sünnet (Eşarilik ve Maturidilik) ve Şia (İmamiye ve Zeydiye) ile sınırlandırılır.",
      isKeyKazanim: true,
    },
    {
      code: "10.5.5",
      subTopicName: "İtikadi, Siyasi ve Fıkhi Yorumlar",
      description:
        "İslam düşüncesindeki ameli fıkhi yorumları tanır.",
      details:
        "İslam düşüncesindeki ameli fıkhi yorumlarda; Hanefilik, Malikilik, Şafiilik ve Hanbelilik mezheplerine yer verilir. Ayrıca Caferilik mezhebine de değinilir, bu mezhebin İmamiye Şiası'nın ameli/fıkhi yorumu olduğuna vurgu yapılır.",
    },
    {
      code: "10.5.6",
      subTopicName: "İtikadi, Siyasi ve Fıkhi Yorumlar",
      description:
        "Nisa suresi 59. ayette verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== ISLAM DININE GORE KOTU ALISKANLIKLAR (10.4 Ahlaki Tutum ve Davranislar) ====================
  "İslam Dinine Göre Kötü Alışkanlıklar": [
    {
      code: "10.4.1",
      subTopicName: "Ahlaki Tutum ve Davranışlar",
      description:
        "İslam ahlakının konusu ve gayesini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "10.4.2",
      subTopicName: "Ahlaki Tutum ve Davranışlar",
      description:
        "Ahlak ile terbiye arasındaki ilişki kurar.",
      details:
        "Duygu yönetimi, düşünce yönetimi, davranış yönetimi, irade yönetimi gibi konular ayet ve hadislerle ilişkilendirilerek ele alınır.",
    },
    {
      code: "10.4.3",
      subTopicName: "Ahlaki Tutum ve Davranışlar",
      description:
        "İslam ahlakında yerilen bazı davranışları ayet ve hadislerle açıklar.",
      details: [
        "Kazanım kapsamında yalan ve iftira, mahremiyetin ihlali (tecessüs), gıybet, haset, suizan, hile ve israf konularına değinilir.",
        "Öğrencilerin İslam ahlakında yerilen bazı davranışların, bireysel ve toplumsal zararlarını değerlendirmelerine yönelik etkinliklere yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.4.4",
      subTopicName: "Ahlaki Tutum ve Davranışlar",
      description:
        "Tutum ve davranışlarında ölçülü olmaya özen gösterir.",
    },
    {
      code: "10.4.5",
      subTopicName: "Ahlaki Tutum ve Davranışlar",
      description:
        "Hucurat suresi 11-12. ayetlerde verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== HAZRETI MUHAMMED (10.2 Hz. Muhammed ve Genclik - farkli yonler) ====================
  "Hazreti Muhammed": [
    {
      code: "10.2.4",
      subTopicName: "Hz. Muhammed ve Gençlik",
      description:
        "Bazı genç sahabilerin öne çıkan özelliklerini örnek alır.",
      details:
        "\"Bilge ve Kahraman Bir Genç: Hz. Ali\", \"Genç Bir Davetçi: Erkam b. Ebi'l-Erkam\", \"Genç Bir Öğretmen: Mus'ab b. Umeyr\", \"Genç Bir Komutan: Usame b. Zeyd\", \"Genç Bir Yönetici: Muaz b. Cebel\", \"Genç Bir Alim: Hz. Aişe\", \"Genç Bir Anne: Hz. Fatıma\", \"Sorumluluk Sahibi Bir Genç: Esma binti Ebi Bekir\", \"Habeş Kralının Huzurunda Bir Genç: Cafer b. Ebi Talib\" konularına yer verilir.",
      isKeyKazanim: true,
    },
    {
      code: "10.2.5",
      subTopicName: "Hz. Muhammed ve Gençlik",
      description:
        "Al-i İmran suresi 159. ayette verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== ISLAM DUSUNCESINDE TASAVVUF (12.3 Tasavvufi Yorumlar) ====================
  "İslam Düşüncesinde Tasavvuf": [
    {
      code: "12.3.1",
      subTopicName: "Tasavvufi Yorumlar",
      description:
        "İslam düşüncesinde tasavvufi düşüncenin oluşum sürecini değerlendirir.",
      isKeyKazanim: true,
    },
    {
      code: "12.3.2",
      subTopicName: "Tasavvufi Yorumlar",
      description:
        "Tasavvufi düşüncede ahlaki boyutun önemini fark eder.",
      details:
        "Edep ve insan-ı kamil kavramlarının tasavvufi düşüncedeki yerine de değinilir.",
    },
    {
      code: "12.3.3",
      subTopicName: "Tasavvufi Yorumlar",
      description:
        "Kültürümüzde etkin olan bazı tasavvufi yorumları tanır.",
      details:
        "Yesevilik, Kadirilik, Rifailik, Mevlevilik, Nakşibendilik ve Alevilik-Bektaşilik konularına yer verilir.",
      isKeyKazanim: true,
    },
    {
      code: "12.3.4",
      subTopicName: "Tasavvufi Yorumlar",
      description:
        "Alevilik-Bektaşilikteki temel kavram ve erkanları tanır.",
      details: [
        "Cem ve cemevi, musahiplik, razılık ve kul hakkının sorulması, cemde on iki hizmet, semah, gülbank, Hızır ve Muharrem orucu konularına yer verilir.",
        "Hacı Bektaş Veli'nin, Bektaşiliğin oluşumu ve Aleviliğin gelişimindeki rolüne, Alevilik-Bektaşilikteki \"ocak kültürü\"ne, \"el ele, el hakka ikrarı\"na ve \"dört kapı kırk makam\"a yer verilir; Bektaşilikte musahipliğe \"ikrar ve nasip alma\" da denildiğine ve bu kavramın İslam tarihindeki muhacir ensar kardeşliğine dayandırıldığına değinilir.",
        "Cemevi; ayin-i cem erkanının yapıldığı, \"yol, adap ve erkan yeri\" olarak nitelendirilir; Bektaşilikte ise cemevi yerine \"meydan evi\" ifadesinin kullanıldığına da değinilir. \"Düşkünlükten kaldırma cemi\", \"Dardan indirme cemi\" ile \"Abdal Musa cemi\"nden bahsedilir.",
        "Alevilik-Bektaşilikte duaların başında, \"Bismişah\", sonunda ise \"Allah Allah\" lafzının söylendiğine değinilir. \"Gülbank\" konusunda ise \"Lokma Duası\"na da yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.3.5",
      subTopicName: "Tasavvufi Yorumlar",
      description:
        "Hucurat Suresi 10. ayette verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== VAHIY VE AKIL KUR'AN YORUMLARI (11.3 Kur'an'da Bazi Kavramlar) ====================
  "Vahiy ve Akıl Kur'an Yorumları": [
    {
      code: "11.3.1",
      subTopicName: "Kur'an'da Bazı Kavramlar",
      description:
        "Kur'an'ı Kerim'de geçen bazı kavramları yorumlar.",
      details:
        "Cihat kavramı; anlam genişliği göz önünde bulundurularak salt savaş ile sınırlandırılmadan tüm boyutlarıyla ve Mekki ve Medeni ayetlerin bu kavrama yüklediği anlamlar bağlamında ele alınır. Cihadın bir ibadet olarak farzı ayın ve farz-ı kifaye olduğu durumlara değinilir. Bu kapsamda ceht, mücahede, davet, tebliğ, irşat, emr-i bi'l-maruf ve nehy-i ani'l-münker, kıtal/mukatele ve şehadet kavramlarına yer verilir.",
      isKeyKazanim: true,
    },
    {
      code: "11.3.2",
      subTopicName: "Kur'an'da Bazı Kavramlar",
      description:
        "Kur'an'ı Kerim'de geçen kavramları tanımanın İslam'ı doğru anlamadaki önemini fark eder.",
      isKeyKazanim: true,
    },
    {
      code: "11.3.3",
      subTopicName: "Kur'an'da Bazı Kavramlar",
      description:
        "Kehf suresi 107-110. ayetlerde verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== YASAYAN DINLER VE BENZER OZELLIKLER (11.5 Yahudilik ve Hristiyanlik) ====================
  "Yaşayan Dinler ve Benzer Özellikler": [
    {
      code: "11.5.1",
      subTopicName: "Yahudilik ve Hristiyanlık",
      description:
        "Yahudiliğin doğuşunu ve gelişim sürecini özetler.",
      details:
        "Yahudiliğin; tarihçesine, inanç esaslarına, ritüellerine, sembollerine ve kutsal mekanlarına; İbrani, İsrail, Yahudi ve Musevi kavramlarına; Yahudilerin kitap ve peygamber anlayışına ve günümüz Yahudi mezheplerine yer verilir. Ayrıca \"Siyonizm\" konusuna değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "11.5.2",
      subTopicName: "Yahudilik ve Hristiyanlık",
      description:
        "Hristiyanlığın doğuşunu ve gelişim sürecini özetler.",
      details:
        "Hristiyanlığın; tarihçesine, inanç esaslarına, ritüellerine, sembollerine ve kutsal mekanlarına; Hristiyanlığın kurumsallaşmasında ve inanç esaslarının oluşmasında Pavlus'un rolüne; Hristiyanların vahiy ve peygamber anlayışına ve Hristiyan gruplara (Katoliklik, Ortodoksluk ve Protestanlık) yer verilir. Ayrıca \"evanjelik akımlar\"dan kısaca bahsedilir.",
      isKeyKazanim: true,
    },
  ],

  // ==================== DIN VE LAIKLIK (10.3 Din ve Hayat) ====================
  "Din ve Laiklik": [
    {
      code: "10.3.1",
      subTopicName: "Din ve Hayat",
      description:
        "İslam dininin aile kurumuna verdiği önemi fark eder.",
      isKeyKazanim: true,
    },
    {
      code: "10.3.2",
      subTopicName: "Din ve Hayat",
      description:
        "İslam dininin kültür, sanat ve düşünce üzerindeki etkilerini analiz eder.",
      details:
        "İslam dininin kültürel hayatımızın zenginleşmesindeki katkılarına ve İslam medeniyetinde öne çıkan sanat dallarına kısaca yer verilir. Ayrıca \"Eşyada asıl olan ibahadır.\" ilkesinin sanat alanında da geçerli olduğuna değinilir.",
    },
    {
      code: "10.3.3",
      subTopicName: "Din ve Hayat",
      description:
        "İslam dininin çevre sorunlarına yaklaşımını ve çözüm önerilerini değerlendirir.",
    },
    {
      code: "10.3.4",
      subTopicName: "Din ve Hayat",
      description:
        "İslam dini ve sosyal değişim arasında ilişki kurar.",
      details:
        "Dinin sabiteleri ve değişkenleri üzerinde durulur; bazı dini hüküm ve yorumların zamana ve mekana göre değişebileceğine değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "10.3.5",
      subTopicName: "Din ve Hayat",
      description:
        "İslam dininin ekonomik hayatla ilgili ilkelerini yorumlar.",
    },
    {
      code: "10.3.6",
      subTopicName: "Din ve Hayat",
      description:
        "İslam dininin sosyal adaletle ilgili ilkelerini açıklar.",
      isKeyKazanim: true,
    },
    {
      code: "10.3.7",
      subTopicName: "Din ve Hayat",
      description:
        "Al-i İmran suresi 103-105. ayetlerdeki mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],

  // ==================== DIN, KULTUR VE MEDENIYET (9.5 + 12.1 + 12.2) ====================
  "Din, Kültür ve Medeniyet": [
    // 9.5 Gonul Cografyamiz
    {
      code: "9.5.1",
      subTopicName: "Gönül Coğrafyamız",
      description:
        "İslam medeniyeti kavramını izah eder.",
      details:
        "Kültür ve medeniyet kavramları öğrenci seviyesine göre ana hatlarıyla ele alınır; İslam medeniyeti kavramı analiz edilir.",
      isKeyKazanim: true,
    },
    {
      code: "9.5.2",
      subTopicName: "Gönül Coğrafyamız",
      description:
        "İslam medeniyetinin, dünyanın farklı bölgelerindeki etkilerini fark eder.",
      details: [
        "Hicaz Bölgesi, Kudüs ve Çevresi, Şam ve Bağdat Bölgesi; İran, Horasan, Türkistan ve Maveraünnehir Bölgesi; Hint Alt Kıtası; Anadolu ve Balkanlar; Kuzey Afrika (Mısır ve Mağrip Bölgesi) ve Endülüs gibi İslam medeniyetinin tarihi süreçte hayat bulduğu ilim ve kültür havzaları ele alınır.",
        "İslam medeniyetinin bu havzalara İslam'ın taşınmasına öncülük eden alimler, komutanlar ve tüccarlara kısaca yer verilir.",
        "İslam medeniyetine değer katan ana dillere (Türkçe, Arapça, Farsça) değinilir.",
        "İslam medeniyetinin Anadolu ve Balkanlara taşınmasında Horasan, Anadolu ve Rumeli erenlerinin de rolüne kısaca değinilir.",
        "Öğrencilerin Türkiye ile gönül coğrafyamız arasındaki tarihi ve kültürel bağların güçlenmesine yönelik sözlü ve yazılı önerilerde bulunabilecekleri etkinliklere yer verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.5.3",
      subTopicName: "Gönül Coğrafyamız",
      description:
        "Hucurat suresi 13. ayette verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
    // 12.1 Islam ve Bilim
    {
      code: "12.1.1",
      subTopicName: "İslam ve Bilim",
      description:
        "Din-bilim ilişkisini tartışır.",
      details:
        "İlim öğrenmeyi teşvik eden ayet ve hadislerden örnekler verilir.",
    },
    {
      code: "12.1.2",
      subTopicName: "İslam ve Bilim",
      description:
        "İslam medeniyetinde bilim ve düşüncenin gelişim sürecini değerlendirir.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.3",
      subTopicName: "İslam ve Bilim",
      description:
        "İslam medeniyetinde öne çıkan eğitim ve bilim kurumlarını tanır.",
      details:
        "Kurumlar; cami, mescit, mektep, medrese, daru'l-kurra, daru'l-hadis, beytü'l-hikme kütüphane, rasathane ve şifahane ile sınırlandırılır.",
    },
    {
      code: "12.1.4",
      subTopicName: "İslam ve Bilim",
      description:
        "Müslümanların bilim alanında yaptığı özgün çalışmaları sınıflandırır.",
      details:
        "Geçmişten günümüze Müslümanların bilim alanında yaptığı öncü ve özgün çalışmalara (dil, fıkıh, kelam, tefsir, hadis, tarih, felsefe, coğrafya, tıp, astronomi, matematik, fizik, kimya) ana hatlarıyla yer verilir ve bu çalışmaların diğer medeniyetlerdeki ilmi gelişmelere olan etkisine değinilir.",
      isKeyKazanim: true,
    },
    {
      code: "12.1.5",
      subTopicName: "İslam ve Bilim",
      description:
        "Fatır suresi 27-28. ayette verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
    // 12.2 Anadolu'da Islam
    {
      code: "12.2.1",
      subTopicName: "Anadolu'da İslam",
      description:
        "Türklerin Müslüman olma sürecini açıklar.",
      details:
        "Horasan, Anadolu ve Balkanlar'da İslamiyet'in yayılmasında ribatların, fütüvvet ve ahilik teşkilatlarının rolüne de kısaca değinilir.",
    },
    {
      code: "12.2.2",
      subTopicName: "Anadolu'da İslam",
      description:
        "Dini anlayış ve kültürümüzün oluşmasında etkili olan bazı şahsiyetleri tanır.",
      details: [
        "Dini anlayış ve kültürümüzün oluşmasında etkili olan şahsiyetlerden; Ebu Hanife, Cafer es-Sadık, Maturidi, Şafii, Eş'ari, Ahmet Yesevi, Mevlana Celaleddin-i Rumi, Hacı Evran, Ahi Bektaş-ı Veli, Yunus Emre, Sarı Saltuk, Hacı Bayram-ı Veli'ye öğrenci seviyesine göre yer verilir.",
        "Dini anlayış ve kültürümüzün oluşmasında etkili olan şahsiyetlerin ortak değerimiz olduğuna değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "12.2.3",
      subTopicName: "Anadolu'da İslam",
      description:
        "Nisa suresi 69. ayette verilen mesajları değerlendirir.",
      details:
        "Kazanım; öğrencilerin Kur'an-ı Kerim mealini kullanma, Kur'an-ı Kerim'i anlama ve yorumlama, ayetlerde geçen şahıs, yer, konu ve kavramları belirleme becerilerini geliştirici etkinliklerle desteklenir. Bu kapsamda ayetlerin (nüzul sebebi, ana konuları gibi) kısa açıklamalarına öğrenci seviyesine göre yer verilir.",
    },
  ],
};

// =====================================================================
// SEED LOGIGI
// =====================================================================

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  if (!tyt) {
    console.log("TYT exam type bulunamadı, atlıyorum.");
    return;
  }

  const dinSubject = await prisma.subject.findFirst({
    where: { name: "Din Kültürü ve Ahlak Bilgisi", examTypeId: tyt.id },
  });
  if (!dinSubject) {
    console.log("TYT Din Kültürü ve Ahlak Bilgisi subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: dinSubject.id },
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
    console.error("seed-tyt-din-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
