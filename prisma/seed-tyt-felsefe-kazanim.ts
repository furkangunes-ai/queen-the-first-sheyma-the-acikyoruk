/**
 * TYT Felsefe kazanımlarını MEB PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Felsefe Dersi Öğretim Programı (2018), sayfa 227-238
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-felsefe-kazanim.ts
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
// PDF'DEN ÇIKARILMIŞ KAZANIMLAR — TOPIC ADI -> KAZANIM LİSTESİ
// =====================================================================

const KAZANIMLAR: Record<string, KazanimDef[]> = {
  // ==================== FELSEFE'NIN KONUSU-ALANI ====================
  // 10. sınıf Ü1: Felsefeyi Tanıma (10.1.1-10.1.3)
  // + Ü2: Felsefe ile Düşünme (10.2.1-10.2.4) - genel felsefi düşünme
  // + Ü4: Felsefi Okuma ve Yazma (10.4.1-10.4.4) - genel felsefi okuma/yazma
  // + 11. sınıf genel felsefe tarihi giriş kazanımları
  "Felsefe'nin Konusu-Alanı": [
    {
      code: "10.1.1",
      subTopicName: "Felsefeyi Tanıma",
      description: "Felsefenin anlamını açıklar.",
      details: [
        "a) Çeşitli sorulardan (Bilgi nedir?, Bilinç nedir?, Öz bilinç nedir?) hareketle düşünmenin önemi ve gerekliliğinin tartışılması sağlanır.",
        "b) Felsefe (philosophia) terimi kapsamında geçen sevgi, arayış, bilgi, hakikat ve hikmet (bilgelik/sophia) kavramlarının felsefeyle ilişkisine değinilir.",
        "c) Farklı düşünürlerin (Platon, Aristoteles, el-Kindî, Farabî, İbn Sina, I. Kant, K. Jaspers, Hilmi Ziya Ülken ve Takiyettin Mengüşoğlu) felsefe tanımlarına yer verilerek bu tanımların benzer ve farklı noktalarının belirtilmesi sağlanır.",
        "d) Bilişim teknolojileri kullanılarak \"Filozof kimdir?\" sorusuna ilişkin bir sunum hazırlanması ve sunumun sınıf ortamında paylaşılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2",
      subTopicName: "Felsefeyi Tanıma",
      description: "Felsefi düşüncenin özelliklerini açıklar.",
      details: [
        "a) Felsefi düşüncenin ortaya çıkışı üzerinde kısaca durulur.",
        "b) Felsefenin sorgulama, merak etme, şüphe duyma, hayret etme, yığılımlı ilerleme, eleştirel, refleksif, rasyonel, sistemli, tutarlı ve evrensel olma özellikleri vurgulanır.",
        "c) N. Uygur'un \"Bir Felsefe Sorusu Nedir?\" adlı makalesinden alınan veya derlenen bir metinden hareketle felsefi soruların özelliklerinin yorumlanması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.3",
      subTopicName: "Felsefeyi Tanıma",
      description:
        "Felsefenin insan ve toplum hayatı üzerindeki rolünü örneklerle açıklar.",
      details: [
        "a) Felsefenin bireysel ve toplumsal işlevlerine değinilir.",
        "b) Felsefe hayat ilişkisinin günlük hayattan örneklerle yorumlanması sağlanır.",
      ].join("\n"),
    },
    {
      code: "10.2.1",
      subTopicName: "Felsefe ile Düşünme",
      description:
        "Düşünme ve akıl yürütmeye ilişkin kavramları açıklar.",
      details: [
        "a) Görüş, argüman, önerme, tümdengelim, tümevarım, analoji, tutarlılık, çelişiklik, gerçeklik, doğruluk ve temellendirme kavramları üzerinde durulur.",
        "b) Örnek metinler verilerek bu metinlerdeki akıl yürütme biçimlerinin, tutarlı ve çelişik ifadelerin belirlenmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.2",
      subTopicName: "Felsefe ile Düşünme",
      description:
        "Düşünme ve akıl yürütmede dili doğru kullanmanın önemini açıklar.",
      details: [
        "a) Dilin ifade etme ve kavramlaştırma işlevi üzerinde durulur.",
        "b) Kavramları yanlış kullanmanın, anlamı nasıl değiştirdiğine ilişkin günlük hayattan örnekler verilmesi sağlanır.",
      ].join("\n"),
    },
    {
      code: "10.2.3",
      subTopicName: "Felsefe ile Düşünme",
      description: "Bir konuyla ilgili felsefi sorular oluşturur.",
      details:
        "Seçilen konu örnekleri üzerinden öğrencilere sorular yöneltilerek öğrencilerin konuya ilişkin kendi sorularını yapılandırmaları sağlanır.",
    },
    {
      code: "10.2.4",
      subTopicName: "Felsefe ile Düşünme",
      description: "Felsefi bir görüşü veya argümanı sorgular.",
      details: [
        "a) Bir konuşma veya bir metin seçilerek konuşmacının yahut yazarın ileri sürdüğü görüş ve argümanların tespit edilmesi ve tartışılması sağlanır.",
        "b) Öğrencilerin gazete, dergi, roman, televizyon haberi, tartışma programı veya filmlerde geçen felsefi bir görüşü tespit etmeleri ve bu görüşü temellendiren argümanları sınıf ortamında tartışmaları sağlanır.",
      ].join("\n"),
    },
    {
      code: "10.4.1",
      subTopicName: "Felsefi Okuma ve Yazma",
      description: "Felsefi bir metni analiz eder.",
      details:
        "Felsefi bir metin örneğinde; \"Metinde hangi felsefi kavramlar geçmektedir?\", \"Metinde hangi felsefi problem veya problemler ele alınmaktadır?\", \"Felsefi probleme veya problemlere filozofun bakış açısı nasıldır?\", \"Kullanılan kavramlar ve savunulan görüşler, güncel sorunların anlaşılması ve çözümlenmesi için nasıl bir katkı sunabilir?\" soruları yoluyla analiz ve değerlendirme yapılması sağlanır.",
    },
    {
      code: "10.4.2",
      subTopicName: "Felsefi Okuma ve Yazma",
      description: "Verilen konu hakkında alternatif görüşler geliştirir.",
      details:
        "Metin alıntılarına yer verilerek öğrencilerin bu alıntılardaki konu veya durumla ilgili öne sürülen görüşleri belirlemeleri ve \"Bu konuya farklı bir açıdan bakılabilir mi?\", \"Bu konuyla ilgili sizden görüş öne sürmeniz istenseydi görüşünüz ne olurdu?\" gibi sorulardan hareketle aynı konuyla ilgili özgün görüşler geliştirmeleri sağlanır.",
    },
    {
      code: "10.4.3",
      subTopicName: "Felsefi Okuma ve Yazma",
      description: "Bir konu hakkında felsefi bir deneme yazar.",
      details: [
        "a) Felsefi denemenin ne olduğu ve nasıl yazıldığı açıklanır.",
        "b) Tutarlı, sistematik ve temellendirilmiş bir felsefi denemenin yazılması sağlanır.",
      ].join("\n"),
    },
    {
      code: "10.4.4",
      subTopicName: "Felsefi Okuma ve Yazma",
      description:
        "Felsefi akıl yürütme becerilerini diğer alanlarda kullanır.",
      details:
        "Felsefeden farklı bir konuda yazılmış bir metni, felsefenin varlık, bilgi ve değer alanları üzerinden yorumlanması sağlanır.",
    },
    // 11. sınıf - felsefe tarihine genel giriş kazanımları
    {
      code: "11.1.1",
      subTopicName: "MÖ 6. Yüzyıl-MS 2. Yüzyıl Felsefesi",
      description:
        "Felsefenin ortaya çıkışını hazırlayan düşünce ortamını açıklar.",
      details: [
        "a) Sümer, Mezopotamya, Mısır, Çin, Hint ve İran medeniyetlerinde varlık, bilgi ve değer anlayışlarının felsefenin doğuşundaki etkilerine değinilir.",
        "b) Anadolu'da yaşamış filozofların (Thales, Anaksimandros, Anaksimenes, Anaksagoras, Herakleitos, Epiktetos, Diogenes, Lukianos, Ksenofanes ve Aristoteles) doğduğu ve yaşadığı yer vurgulanarak kısaca biyografik bilgi verilir.",
      ].join("\n"),
    },
  ],

  // ==================== BILGI FELSEFESI ====================
  // 10. sınıf Ü3 (10.3.2) + ilgili 11. sınıf epistemoloji kazanımları
  "Bilgi Felsefesi": [
    {
      code: "10.3.2",
      subTopicName: "Felsefenin Temel Konuları ve Problemleri",
      description:
        "Bilgi felsefesinin konusunu ve problemlerini açıklar.",
      details: [
        "a) \"Doğru bilgi mümkün müdür?\", \"Bilginin kaynağı nedir?\", \"Bilginin sınırları ve doğru bilginin ölçütleri nelerdir?\" problemlerinden hareketle bilgi felsefesinin konusu kısaca açıklanır.",
        "b) Felsefi bir metnin üzerinden doğruluk ve gerçeklik kavramları arasındaki ilişkinin tartışılması sağlanır.",
        "c) Öğrencilerin dergi ve gazete haberleri, internet, sosyal medya veya TV programlarında paylaşılan bilgileri, bilginin değeri ve güvenilirliği açısından tartışmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.1.2b - Sokrates ve Sofistlerin bilgi anlayışları
    {
      code: "11.1.2",
      subTopicName: "MÖ 6. Yüzyıl-MS 2. Yüzyıl Felsefesi",
      description:
        "MÖ 6. yüzyıl-MS 2. yüzyıl felsefesinin karakteristik özelliklerini açıklar.",
      details: [
        "a) Filozofların ilk neden hakkındaki düşünceleri (Thales, Anaksimandros, Anaksimenes, Empedokles ve Demokritos) ve değişim düşüncesi (Lao Tse, Herakleitos ve Parmenides) ele alınır.",
        "b) Sokrates ve Sofistlerin (Protagoras ve Gorgias) bilgi ve ahlak anlayışları ele alınır.",
        "c) Platon ve Aristoteles'in varlık, bilgi ve değer anlayışları ele alınır.",
      ].join("\n"),
    },
    // 11.2.3d - Gazali'nin bilgi görüşü
    {
      code: "11.2.3",
      subTopicName: "MS 2. Yüzyıl-MS 15. Yüzyıl Felsefesi",
      description:
        "Örnek felsefi metinlerden hareketle MS 2. yüzyıl-MS 15. yüzyıl filozoflarının felsefi görüşlerini analiz eder.",
      details: [
        "a) St. Augustinus'un \"İtiraflar\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun \"Tanrı ve evren\" ile ilgili görüşlerinin irdelenmesi sağlanır.",
        "b) Farabî'nin \"el-Medinetü'l-Fâzıla\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun ahlak ve siyaset görüşlerinin irdelenmesi sağlanır.",
        "c) İbn Sina'nın \"Salaman ve Absal\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun varlık görüşünün irdelenmesi sağlanır.",
        "d) Gazalî'nin \"el-Munkız mine'd-dalâl\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun bilgi görüşünün irdelenmesi sağlanır.",
        "e) İbn Rüşd'ün \"Tehâfüt et-Tehâfüt el-Felâsife\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun \"din felsefe ilişkisi\" ile ilgili görüşlerinin irdelenmesi sağlanır.",
      ].join("\n"),
    },
    // 11.4.3a - Locke'un bilginin kaynağı görüşleri
    {
      code: "11.4.3",
      subTopicName: "18. Yüzyıl-19. Yüzyıl Felsefesi",
      description:
        "Örnek felsefi metinlerden hareketle 18. yüzyıl-19. yüzyıl filozoflarının felsefi görüşlerini analiz eder.",
      details: [
        "a) J. Locke'un \"İnsan Zihni Üzerine Bir Deneme\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun bilginin kaynağı konusundaki görüşlerinin irdelenmesi sağlanır.",
        "b) I. Kant'ın \"Ahlak Metafiziğinin Temellendirilmesi\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun \"ödev ahlakı\" anlayışının irdelenmesi sağlanır.",
        "c) F. Hegel'in \"Tinin Fenomenolojisi\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun \"diyalektik idealizm\" anlayışının irdelenmesi sağlanır.",
      ].join("\n"),
    },
    // 11.5.3b - Bergson'un bilginin kaynağı düşünceleri
    {
      code: "11.5.3",
      subTopicName: "20. Yüzyıl Felsefesi",
      description:
        "Örnek felsefi metinlerden hareketle 20. yüzyıl filozoflarının felsefi görüşlerini analiz eder.",
      details: [
        "a) F. Nietzsche'nin \"Böyle Buyurdu Zerdüşt\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun \"yeni değerler inşası ve güç istenci\" görüşlerinin irdelenmesi sağlanır.",
        "b) H. Bergson'un \"Bilincin Dolaysız Verileri Üzerine Deneme\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun bilginin kaynağı konusundaki düşüncelerinin irdelenmesi sağlanır.",
        "c) J. P. Sartre'ın \"Varoluşçuluk\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun \"varoluş\" görüşlerinin irdelenmesi sağlanır.",
        "d) T. Kuhn'un \"Bilimsel Devrimlerin Yapısı\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun bilim anlayışının irdelenmesi sağlanır.",
      ].join("\n"),
    },
  ],

  // ==================== VARLIK FELSEFESI ====================
  // 10. sınıf Ü3 (10.3.1) + ilgili 11. sınıf ontoloji kazanımları
  "Varlık Felsefesi": [
    {
      code: "10.3.1",
      subTopicName: "Felsefenin Temel Konuları ve Problemleri",
      description:
        "Varlık felsefesinin konusunu ve problemlerini açıklar.",
      details: [
        "a) \"Varlık var mıdır?\", \"Varlığın mahiyeti nedir?\", \"Evrende amaçlılık var mıdır?\" problemlerinden hareketle varlık felsefesinin konusu kısaca açıklanır.",
        "b) Felsefi bir metin üzerinden varlık türlerinin sınıflandırılması sağlanır.",
        "c) Öğrencilerin hikâye, roman, kısa film veya belgesellerden birinde işlenen konuyu varlık felsefesi açısından değerlendirmeleri ve sınıfta paylaşmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.1.3c - Platon'un varlık, bilgi ve siyaset görüşleri
    {
      code: "11.1.3",
      subTopicName: "MÖ 6. Yüzyıl-MS 2. Yüzyıl Felsefesi",
      description:
        "Örnek felsefi metinlerden hareketle MÖ 6. yüzyıl-MS 2. yüzyıl filozoflarının felsefi görüşlerini analiz eder.",
      details: [
        "a) Konfüçyüs'ün \"İdeal Bir İnsan ve Topluma Dair Konuşmalar\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun ahlak görüşünün irdelenmesi sağlanır.",
        "b) Platon'un \"Sokrates'in Savunması\" adlı eserinden alınan veya derlenen bir metinden hareketle Sokrates'in \"bilgelik ve erdem\" anlayışının irdelenmesi sağlanır.",
        "c) Platon'un \"Devlet\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun varlık, bilgi ve siyaset görüşlerinin irdelenmesi sağlanır.",
        "d) Aristoteles'in \"Nikomakhos'a Etik\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun \"altın orta\" düşüncesinin irdelenmesi sağlanır.",
      ].join("\n"),
    },
    // 11.3.3a - Descartes'in bilgi ve varlık görüşleri
    {
      code: "11.3.3",
      subTopicName: "15. Yüzyıl-17. Yüzyıl Felsefesi",
      description:
        "Örnek felsefi metinlerden hareketle 15. yüzyıl-17. yüzyıl filozoflarının felsefi görüşlerini analiz eder.",
      details: [
        "a) R. Descartes'in \"Felsefenin İlkeleri\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun bilgi ve varlık görüşlerinin irdelenmesi sağlanır.",
        "b) B. Spinoza'nın \"Ethica\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun ahlak görüşünün irdelenmesi sağlanır.",
        "c) T. Hobbes'un \"Leviathan\" adlı eserinden alınan veya derlenen bir metinden hareketle filozofun siyaset görüşlerinin irdelenmesi sağlanır.",
      ].join("\n"),
    },
    // 11.4.3c - Hegel'in diyalektik idealizm anlayışı (ontoloji)
    {
      code: "11.4.2",
      subTopicName: "18. Yüzyıl-19. Yüzyıl Felsefesi",
      description:
        "18. yüzyıl-19. yüzyıl felsefesinin karakteristik özelliklerini açıklar.",
      details: [
        "a) 18. yüzyıl-19. yüzyıl felsefesinin temel özellikleri ve problemleri üzerinde durulur.",
        "b) 18. yüzyıl-19. yüzyıl felsefesinin, dönemin dil ve edebiyatla ilişkisine değinilir.",
      ].join("\n"),
    },
    // 11.5.3c - Sartre'ın varoluş görüşleri (ontoloji)
    {
      code: "11.5.2",
      subTopicName: "20. Yüzyıl Felsefesi",
      description:
        "20. yüzyıl felsefesinin karakteristik özelliklerini açıklar.",
      details: [
        "a) 20. yüzyıl felsefesinin temel özellikleri, problemleri ve bazı ana akımları (fenomenoloji, hermeneutik, varoluşçuluk, diyalektik materyalizm, mantıksal pozitivizm, yeni ontoloji) üzerinde durulur.",
        "b) Türkiye'de felsefi düşünceye katkıda bulunan felsefeciler üzerinde durulur.",
      ].join("\n"),
    },
  ],

  // ==================== AHLAK FELSEFESI ====================
  // 10. sınıf Ü3 (10.3.4) + ilgili 11. sınıf etik kazanımları
  "Ahlak Felsefesi": [
    {
      code: "10.3.4",
      subTopicName: "Felsefenin Temel Konuları ve Problemleri",
      description:
        "Ahlak felsefesinin konusunu ve problemlerini açıklar.",
      details: [
        "a) \"İyi ve kötünün ölçütü nedir?\", \"Özgürlük ve sorumluluk arasında nasıl bir ilişki vardır?\", \"Evrensel bir ahlak yasası var mıdır?\" problemlerinden hareketle ahlak felsefesinin konusu kısaca açıklanır.",
        "b) Felsefi bir metnin üzerinden, iyilik ve mutluluk ilişkisinin yorumlanması sağlanır.",
        "c) Okul ortamında yaşanan durumlardan ve olaylardan hareketle özgürlük, sorumluluk ve kural (norm) ilişkisinin tartışılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.1.3a - Konfüçyüs'ün ahlak görüşü
    {
      code: "11.1.4",
      subTopicName: "MÖ 6. Yüzyıl-MS 2. Yüzyıl Felsefesi",
      description:
        "MÖ 6. yüzyıl-MS 2. yüzyıl felsefesindeki örnek düşünce ve argümanları felsefi açıdan değerlendirir.",
      details: [
        "a) Protagoras'ın \"İnsan her şeyin ölçüsüdür.\" sözünün dayandığı argümanların tartışılması sağlanır.",
        "b) Öğrencilerin, \"bilgi erdem ilişkisini\" günlük hayatla ilişkilendiren özgün bir metin yazmaları sağlanır.",
      ].join("\n"),
    },
    // 11.3.3b - Spinoza'nın ahlak görüşü
    {
      code: "11.3.2",
      subTopicName: "15. Yüzyıl-17. Yüzyıl Felsefesi",
      description:
        "15. yüzyıl-17. yüzyıl felsefesinin karakteristik özelliklerini açıklar.",
      details: [
        "a) Skolastik düşünce ile modern düşüncenin temel farkları üzerinde durulur.",
        "b) Hümanizm, bilimsel yöntem, kartezyen felsefe ve hukuk felsefesi üzerinde durulur.",
        "c) N. Kopernik, G. Galileo, F. Bacon ve I. Newton'un bilimsel çalışmalarının 15. yüzyıl-17. yüzyıl felsefesi üzerindeki etkilerine değinilir.",
      ].join("\n"),
    },
    // 11.5.4a - N. Topçu'nun ahlak hakkındaki görüşleri
    {
      code: "11.5.4",
      subTopicName: "20. Yüzyıl Felsefesi",
      description:
        "20. yüzyıl felsefesi örnek düşünce ve argümanları felsefi açıdan değerlendirir.",
      details: [
        "a) N. Topçu'nun \"İsyan Ahlakı\" adlı eserinden alınan veya derlenen bir metinden hareketle düşünürün ahlak hakkındaki görüşlerinin tartışılması sağlanır.",
        "b) T. Mengüşoğlu'nun \"İnsan Felsefesi\" adlı eserinden alınan ve derlenen bir metinden hareketle filozofun \"insanı bir bütün olarak gören\" düşüncelerinin tartışılması sağlanır.",
        "c) K. Popper'in \"Ben yanılmış olabilirim ve sen haklı olabilirsin ve ortak çaba sonucunda belki doğruluğa biraz daha yaklaşabiliriz.\" sözünden hareketle bilginin doğruluğu ile ilgili özgün bir metin yazılması sağlanır.",
      ].join("\n"),
    },
  ],

  // ==================== SANAT FELSEFESI ====================
  // 10. sınıf Ü3 (10.3.7)
  "Sanat Felsefesi": [
    {
      code: "10.3.7",
      subTopicName: "Felsefenin Temel Konuları ve Problemleri",
      description:
        "Sanat felsefesinin konusunu ve problemlerini açıklar.",
      details: [
        "a) \"Güzel nedir?\", \"Sanat nedir?\", \"Sanat eserinin özellikleri nelerdir?\" problemlerinden hareketle sanat felsefesinin konusu kısaca açıklanır.",
        "b) Felsefi bir metin üzerinden sanat ve duyarlılık ilişkisinin yorumlanması sağlanır.",
        "c) Öğrencilerin yaşadığı şehrin mimari yapısını estetik açıdan tartışmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DIN FELSEFESI ====================
  // 10. sınıf Ü3 (10.3.5) + ilgili 11. sınıf din felsefesi kazanımları
  "Din Felsefesi": [
    {
      code: "10.3.5",
      subTopicName: "Felsefenin Temel Konuları ve Problemleri",
      description:
        "Din felsefesinin konusunu ve sorularını açıklar.",
      details: [
        "a) \"Tanrı'nın varlığı ile ilgili görüşler nelerdir?\", \"Evren sonlu mudur, sonsuz mudur?\", \"Ölümden sonra yaşam var mıdır?\" problemlerinden hareketle din felsefesinin konusu kısaca açıklanır.",
        "b) Teoloji ve din felsefesi farkı üzerinde durulur.",
        "c) \"Ben kimim?\" sorusunun felsefe, bilim ve din açısından nasıl ele alındığının tartışılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.2.2c - inanç akıl ilişkisi
    {
      code: "11.2.2",
      subTopicName: "MS 2. Yüzyıl-MS 15. Yüzyıl Felsefesi",
      description:
        "MS 2. yüzyıl-MS 15. yüzyıl felsefesinin karakteristik özelliklerini açıklar.",
      details: [
        "a) MS 2. yüzyıl-MS 15. yüzyıl Hristiyan felsefesinin temel özellikleri ve problemleri üzerinde durulur.",
        "b) MS 2. yüzyıl-MS 15. yüzyıl İslam felsefesinin temel özellikleri ve problemleri üzerinde durulur.",
        "c) MS 2. yüzyıl-MS 15. yüzyıl felsefesinin temel problemlerinden \"inanç akıl ilişkisi\" konusunda Hristiyan ve İslam felsefesinin yaklaşımları arasındaki farklar vurgulanır.",
        "d) 8-12. yüzyıl arasındaki çeviri faaliyetlerinin İslam felsefesine ve Batı felsefesine etkileri üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.2.4 - tasavvuf düşüncesi, inanç akıl ilişkisi
    {
      code: "11.2.4",
      subTopicName: "MS 2. Yüzyıl-MS 15. Yüzyıl Felsefesi",
      description:
        "MS 2. yüzyıl-MS 15. yüzyıl felsefesindeki örnek düşünce ve argümanları felsefi açıdan değerlendirir.",
      details: [
        "a) Mevlâna, Yunus Emre ve Hacı Bektaş Veli'nin eserlerinden alınan veya derlenen bir metinden hareketle tasavvuf düşüncesindeki insan anlayışının tartışılması sağlanır.",
        "b) \"Anlamak için inanıyorum\" düşüncesinden hareketle \"inanç akıl ilişkisini\" ele alan özgün bir metin yazılması sağlanır.",
      ].join("\n"),
    },
  ],

  // ==================== SIYASET FELSEFESI ====================
  // 10. sınıf Ü3 (10.3.6) + ilgili 11. sınıf siyaset felsefesi kazanımları
  "Siyaset Felsefesi": [
    {
      code: "10.3.6",
      subTopicName: "Felsefenin Temel Konuları ve Problemleri",
      description:
        "Siyaset felsefesinin konusunu ve problemlerini açıklar.",
      details: [
        "a) \"Hak, adalet ve özgürlük nedir?\", \"İktidarın kaynağı nedir?\", \"İdeal devlet düzeni olabilir mi?\" problemlerinden hareketle siyaset felsefesinin konusu kısaca açıklanır.",
        "b) Geçmişten günümüze egemenlik sorununun temel hak ve özgürlükler açısından tartışılması sağlanır.",
        "c) Öğrencilerin ülkemizde yaşanan sorunlardan birini araştırarak birey, toplum ve devlet ilişkileri bağlamında tartışmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.3.4b - Ütopya kavramı
    {
      code: "11.3.4",
      subTopicName: "15. Yüzyıl-17. Yüzyıl Felsefesi",
      description:
        "15. yüzyıl-17. yüzyıl felsefesindeki örnek düşünce ve argümanları felsefi açıdan değerlendirir.",
      details: [
        "a) F. Bacon'ın \"Bilgi güçtür.\" sözünün olumlu ve olumsuz yönlerinin günlük hayattan örneklerle tartışılması sağlanır.",
        "b) Ütopya kavramı ve türleri üzerinde durularak özgün bir ütopya yazılması sağlanır.",
      ].join("\n"),
    },
    // 11.4.4 - Rousseau'nun özgürlük problemi
    {
      code: "11.4.4",
      subTopicName: "18. Yüzyıl-19. Yüzyıl Felsefesi",
      description:
        "18. yüzyıl-19. yüzyıl felsefesindeki örnek düşünce ve argümanları felsefi açıdan değerlendirir.",
      details: [
        "a) J. J. Rousseau'nun \"İnsan özgür doğar oysa her yerde zincire vurulmuştur.\" sözünden hareketle özgürlük probleminin tartışılması sağlanır.",
        "b) Günlük hayatta kullanılan bilgilerde aklın ve deneyin rolüne ilişkin özgün bir metin yazılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== BILIM FELSEFESI ====================
  // 10. sınıf Ü3 (10.3.3) + ilgili 11. sınıf bilim felsefesi kazanımları
  "Bilim Felsefesi": [
    {
      code: "10.3.3",
      subTopicName: "Felsefenin Temel Konuları ve Problemleri",
      description:
        "Bilim felsefesinin konusunu ve problemlerini açıklar.",
      details: [
        "a) \"Bilim nedir?\", \"Bilimsel yöntem nedir?\", \"Bilimin değeri nedir?\" problemlerinden hareketle bilim felsefesinin konusu kısaca açıklanır.",
        "b) Bilim felsefe ilişkisi üzerinde durulur.",
        "c) B. Russell'ın \"Bilgelikle birleştiğinde bilimin sağladığı kudret tüm insanlığa büyük ölçüde refah ve mutluluk getirebilir; tek başına ise yalnız yıkıntıya yol açar.\" sözünden hareketle bilimle hayat arasındaki ilişkinin tartışılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.3.1 - bilimsel çalışmaların felsefe üzerindeki etkileri
    {
      code: "11.3.1",
      subTopicName: "15. Yüzyıl-17. Yüzyıl Felsefesi",
      description:
        "15. yüzyıl-17. yüzyıl felsefesini hazırlayan düşünce ortamını açıklar.",
      details: [
        "a) 12. yüzyıldaki çeviri faaliyetlerinin 15. yüzyıl-17. yüzyıl felsefesi üzerindeki etkilerine değinilir.",
        "b) MÖ 6. yüzyıl-MS 2. yüzyıl ve MS 2. yüzyıl-MS 15. yüzyıl felsefesinin 15. yüzyıl-17. yüzyıl felsefesi üzerindeki etkilerine değinilir.",
      ].join("\n"),
    },
    // 11.4.1 - 18-19. yüzyıl felsefesini hazırlayan ortam
    {
      code: "11.4.1",
      subTopicName: "18. Yüzyıl-19. Yüzyıl Felsefesi",
      description:
        "18. yüzyıl-19. yüzyıl felsefesini hazırlayan düşünce ortamını açıklar.",
      details:
        "15. yüzyıl-17. yüzyıl felsefesinin 18. yüzyıl-19. yüzyıl felsefesi üzerindeki etkilerine değinilir.",
    },
    // 11.5.1 - 20. yüzyıl felsefesini hazırlayan ortam
    {
      code: "11.5.1",
      subTopicName: "20. Yüzyıl Felsefesi",
      description:
        "20. yüzyıl felsefesini hazırlayan düşünce ortamını açıklar.",
      details:
        "18. yüzyıl-19. yüzyıl felsefesinin 20. yüzyıl felsefi akımları üzerindeki etkilerine değinilir.",
    },
    // 11.5.5 - felsefecilerin harita üzerinde gösterimi
    {
      code: "11.5.5",
      subTopicName: "20. Yüzyıl Felsefesi",
      description:
        "Harita üzerinde 20 ve 21. yüzyıl felsefecilerinin isimlerini ve yaşadıkları coğrafyayı gösterir.",
      details: [
        "a) Felsefeciler ve yaşadıkları yerler, Türkiye ve Dünya haritası üzerinde gösterilir.",
        "b) Felsefecilerin, isimleri ve yaşadıkları coğrafyanın ezberletilmesi yoluna gidilmez.",
      ].join("\n"),
    },
    // 11.2.1 - ortaçağ felsefe ortamı
    {
      code: "11.2.1",
      subTopicName: "MS 2. Yüzyıl-MS 15. Yüzyıl Felsefesi",
      description:
        "MS 2. yüzyıl-MS 15. yüzyıl felsefesini hazırlayan düşünce ortamını açıklar.",
      details:
        "MÖ 6. yüzyıl-MS 2. yüzyıl felsefesinin MS 2. yüzyıl-MS 15. yüzyıl felsefesi üzerindeki etkilerine değinilir.",
    },
  ],
};

// =====================================================================
// SEED LOJİĞİ
// =====================================================================

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  if (!tyt) {
    console.log("TYT exam type bulunamadı, atlıyorum.");
    return;
  }

  const felsefeSubject = await prisma.subject.findFirst({
    where: { name: "Felsefe", examTypeId: tyt.id },
  });
  if (!felsefeSubject) {
    console.log("TYT Felsefe subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: felsefeSubject.id },
    include: { _count: { select: { kazanimlar: true } } },
  });

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [topicName, kazanimList] of Object.entries(KAZANIMLAR)) {
    const topic = topics.find((t) => t.name === topicName);
    if (!topic) {
      console.log(`Topic bulunamadı: "${topicName}" -- atlanıyor`);
      continue;
    }

    if (topic._count.kazanimlar > 0) {
      console.log(
        `"${topicName}" zaten ${topic._count.kazanimlar} kazanıma sahip, atlanıyor`
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
      `"${topicName}" -> ${kazanimList.length} kazanım eklendi`
    );
  }

  console.log(
    `\nToplam: ${totalCreated} kazanım eklendi, ${totalSkipped} atlandı`
  );
}

main()
  .catch((e) => {
    console.error("seed-tyt-felsefe-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
