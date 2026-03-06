/**
 * TYT Türkçe kazanımlarını MEB PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Türk Dili ve Edebiyatı Dersi Öğretim Programı (2018)
 *
 * TYT Türkçe = Okuma Anlama (A bölümü kazanımları) + Dil Bilgisi (ünite tablolarından)
 * Edebiyat bilgisi DEĞİL, dil becerisi ölçer.
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-turkce-kazanim.ts
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
  // ==================== ANLAM / YORUM KONULARI ====================

  // ==================== SÖZCÜK ANLAMI ====================
  "Sözcük Anlamı": [
    {
      code: "A.1.1",
      subTopicName: "Şiir",
      description:
        "Metinde geçen kelime ve kelime gruplarının anlamlarını tespit eder.",
      details: [
        "Öğrencilerin bilmediği kelime ve kelime gruplarının anlamını metindeki bağlamından hareketle tahmin etmesi ve tahminini kaynaklardan yararlanarak kontrol etmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "A.2.1",
      subTopicName: "Öyküleyici Metinler",
      description:
        "Metinde geçen kelime ve kelime gruplarının anlamlarını tespit eder.",
      details: [
        "Öğrencilerin bilmediği kelime ve kelime gruplarının anlamını metindeki bağlamından hareketle tahmin etmesi ve tahminini kaynaklardan yararlanarak kontrol etmesi sağlanır.",
      ].join("\n"),
    },
    {
      code: "A.4.1",
      subTopicName: "Bilgilendirici Metinler",
      description:
        "Metinde geçen kelime ve kelime gruplarının anlamlarını tespit eder.",
      details: [
        "Öğrencilerin bilmediği kelime ve kelime gruplarının anlamını metindeki bağlamından hareketle tahmin etmesi ve tahminini kaynaklardan yararlanarak kontrol etmesi sağlanır.",
      ].join("\n"),
    },
    {
      code: "DB.12.1",
      subTopicName: "Kelimede Anlam",
      description:
        "Kelimede anlam ile ilgili çalışmalar yapar: gerçek anlam, mecaz anlam, yan anlam, eş anlam, zıt anlam, terim anlam kavramlarını ayırt eder.",
      details: [
        "12. sınıf Ü1-Ü2 Dil Bilgisi: Kelimede anlam ile ilgili çalışmalar yapılır.",
        "Sözcüğün bağlamdaki anlamını tespit etme, çok anlamlılık, eş anlamlılık, zıt anlamlılık ve neden-sonuç ilişkisi kurma becerileri değerlendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== SÖZ YORUMU ====================
  "Söz Yorumu": [
    {
      code: "A.1.5",
      subTopicName: "Şiir — Edebî Sanatlar ve İmge",
      description:
        "Şiirdeki mazmun, imge ve edebî sanatları belirleyerek bunların anlama katkısını değerlendirir.",
      details: [
        "a. 9. sınıfta şiirde öne çıkan, dikkat çeken ve/veya yaygın olarak bilinen edebî sanatlar (teşbih, istiare, mecazımürsel, teşhis ve intak, tenasüp, tezat, telmih, hüsnütalil, tecahüliarif, kinaye, tevriye, tariz, irsalimesel, mübalağa) ele alınır.",
        "b. Şiirdeki bütün edebî sanatların tespiti yoluna gidilmez.",
        "c. 10, 11 ve 12. sınıflarda şiirde öne çıkan edebî sanatları buldurmaya yönelik çalışma yapılması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "A.1.9",
      subTopicName: "Şiir — Yorum",
      description: "Şiiri yorumlar.",
      details: [
        "a. Şiirdeki açık ve örtük iletileri; şiirle ilgili tespitlerini, eleştirilerini, güncellemelerini ve beğenisini metne dayanarak/gerekçelendirerek kazanımlar çerçevesinde ifade etmesi sağlanır.",
      ].join("\n"),
    },
  ],

  // ==================== DEYİM VE ATASÖZÜ ====================
  "Deyim ve Atasözü": [
    {
      code: "B.6.c",
      subTopicName: "Yazma — Deyim ve Atasözü Kullanımı",
      description:
        "Metin türüne göre terim, kavram, deyim, atasözü, ağız özellikleri kullanır.",
      details: [
        "B.6 kazanımı: Metin türüne özgü dil ve anlatım özelliklerine uygun yazar.",
        "c. Metnin türüne göre terim, kavram, deyim, atasözü, ağız özellikleri kullanılır.",
        "Deyim ve atasözlerinin bağlama uygun kullanımını, doğru anlamını bilmeyi ve bunları metin içinde tespit etmeyi kapsar.",
      ].join("\n"),
    },
    {
      code: "B.10.b",
      subTopicName: "Yazma — Gözden Geçirme",
      description:
        "Yazdığı metni gözden geçirirken dil bilgisi, yazım ve noktalama açısından deyim/atasözü kullanımını kontrol eder.",
      details: [
        "B.10 kazanımı: Yazdığı metni gözden geçirir.",
        "b. Açıklık, duruluk, akıcılık, yalınlık ve kelime tercihleri bakımından gözden geçirmesi sağlanır.",
        "Deyim ve atasözlerinin doğru ve yerinde kullanılıp kullanılmadığını değerlendirir.",
      ].join("\n"),
    },
    {
      code: "A.2.10",
      subTopicName: "Öyküleyici Metinler — Üslup",
      description: "Metnin üslup özelliklerini belirler.",
      details: [
        "Metinde yazara özgü dil ve anlatım özellikleri belirlenir (Cümle yapıları, deyimler, kelime kadrosu, anlatım teknikleri, söz sanatları, akıcılık, nesnellik, öznellik, duygusallık, coşkunluk gibi hususlar dikkate alınır).",
        "Deyim ve atasözü kullanımı üslubun temel unsurlarından biridir.",
      ].join("\n"),
    },
  ],

  // ==================== CÜMLE ANLAMI ====================
  "Cümle Anlamı": [
    {
      code: "A.2.3",
      subTopicName: "Öyküleyici Metinler — Tema/Konu",
      description: "Metnin tema ve konusunu belirler.",
      details: [
        "Metindeki temel çatışmayı/karşılaşmayı ve bu çatışma etrafında metinde yer alan veya metnin ima ettiği diğer çatışmaları/karşılaşmaları/karşıtlıkları belirler.",
      ].join("\n"),
    },
    {
      code: "A.4.3",
      subTopicName: "Bilgilendirici Metinler — Konu/Amaç/Hedef Kitlesi",
      description:
        "Metin ile metnin konusu, amacı ve hedef kitlesi arasında ilişki kurar.",
      isKeyKazanim: true,
    },
    {
      code: "A.4.9",
      subTopicName: "Bilgilendirici Metinler — Bilgi/Yorum Ayırma",
      description:
        "Metinde ortaya konulan bilgi ve yorumları ayırt eder.",
      details: [
        "Ortaya konulan bilgi, tespit ve yorumlar/görüşler; gerekçe, kanıt, tutarlılık, geçerlilik, doğruluk açısından değerlendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== CÜMLE YORUMU ====================
  "Cümle Yorumu": [
    {
      code: "A.2.13",
      subTopicName: "Öyküleyici Metinler — Yorum",
      description: "Metni yorumlar.",
      details: [
        "Metindeki açık ve örtük iletileri; metinle ilgili tespitlerini, eleştirilerini, güncellemelerini ve beğenisini metne dayanarak/gerekçelendirerek ilgili kazanımlar çerçevesinde ifade etmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "A.4.12",
      subTopicName: "Bilgilendirici Metinler — Yorum",
      description: "Metni yorumlar.",
      details: [
        "Metindeki açık ve örtük iletileri; metinle ilgili tespitlerini, eleştirilerini, güncellemelerini ve beğenisini metne dayanarak/gerekçelendirerek ilgili kazanımlar çerçevesinde ifade etmesi sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "A.4.10",
      subTopicName: "Bilgilendirici Metinler — Yazarın Bakış Açısı",
      description: "Metinde yazarın bakış açısını belirler.",
      details: [
        "a. Bilgilendirici/öğretici metinlerde yazar ile anlatıcının aynı şey olduğu yani edebî (sanatsal/kurgusal) metinlerden farklı olarak gerçek bir kişi olduğu belirtilir.",
        "b. Yazarın konuya ve okuyucuya yönelik yaklaşımı/tavrı belirlenir. Yazarın konuyu hangi açıdan ele aldığı yanında, yönlendirme yapıp yapmadığı, taraf olup olmadığı, öznel veya nesnel davranıp davranmadığı gibi hususların bakış açısına etkide bulunduğu hatırlatılır.",
      ].join("\n"),
    },
  ],

  // ==================== PARAGRAFTA ANLATIM TEKNİKLERİ ====================
  "Paragrafta Anlatım Teknikleri": [
    {
      code: "A.2.9",
      subTopicName: "Öyküleyici Metinler — Anlatım Biçimleri ve Teknikleri",
      description:
        "Metindeki anlatım biçimleri ve tekniklerinin işlevlerini belirler.",
      details: [
        "Öyküleyici metinlerde yararlanılan anlatım biçimleri (öyküleme, betimleme vb.) tespit edilir.",
        "Anlatım teknikleri ise (gösterme, tahkiye etme, özetleme, geriye dönüş, diyalog, iç konuşma, iç çözümleme, bilinç akışı, pastiş, parodi, ironi vb.) 9. sınıfta verilir.",
        "Anlatım tekniklerinin tespiti ilgili metinler üzerinde yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "A.4.5",
      subTopicName: "Bilgilendirici Metinler — Anlatım Biçimleri/Düşünceyi Geliştirme Yolları",
      description:
        "Metindeki anlatım biçimlerini, düşünceyi geliştirme yollarını ve bunların işlevlerini belirler.",
      isKeyKazanim: true,
    },
  ],

  // ==================== PARAGRAFTA KONU-ANA DÜŞÜNCE ====================
  "Paragrafta Konu-Ana Düşünce": [
    {
      code: "A.4.3b",
      subTopicName: "Bilgilendirici Metinler — Konu ve Amaç",
      description:
        "Metin ile metnin konusu, amacı ve hedef kitlesi arasında ilişki kurar.",
      details: [
        "Metnin konusunu, yazılış amacını ve hedef kitlesini belirler.",
        "Paragrafın neyi anlattığını (konu) ve ne söylemek istediğini (ana düşünce) ayırt eder.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "A.4.4",
      subTopicName: "Bilgilendirici Metinler — Ana Düşünce ve Yardımcı Düşünceler",
      description:
        "Metnin ana düşüncesi ve yardımcı düşüncelerini belirler.",
      isKeyKazanim: true,
    },
  ],

  // ==================== PARAGRAFTA YAPI ====================
  "Paragrafta Yapı": [
    {
      code: "A.2.5",
      subTopicName: "Öyküleyici Metinler — Olay Örgüsü",
      description: "Metnin olay örgüsünü belirler.",
      details: [
        "Öyküleyici metinlerde olayların birbirleriyle ilişkisi ve sıralanışı (kurgulanması) üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "A.2.7",
      subTopicName: "Öyküleyici Metinler — Zaman/Mekân",
      description: "Metindeki zaman ve mekânın özelliklerini belirler.",
      details: [
        "a. Öyküleyici metinlerde kahramanların ruh hâli ile zaman ve mekân arasındaki ilişki, olayların gelişiminde zaman ve mekânın işlevi vb. belirlenir.",
        "b. Metnin kurgu zamanı ile -varsa- içeriğin bir tarihsel zamanla/dönemle ilişkisine değinilir.",
      ].join("\n"),
    },
    {
      code: "A.2.8",
      subTopicName: "Öyküleyici Metinler — Anlatıcı/Bakış Açısı",
      description:
        "Metinde anlatıcı ve bakış açısının işlevini belirler.",
      details: [
        "a. Öyküleyici metinlerde anlatıcının özellikleri ile hâkim, kahraman ve gözlemci bakış açılarından hangisinin kullanıldığı belirlenir.",
        "b. Seçilen bakış açısının anlatımı nasıl etkilediğine dikkat çekilir.",
        "c. Bir metinde birden fazla anlatıcı ve bakış açısı bulunabileceği, anlatıcının değişmesine göre bakış açısının da değişebileceği vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== PARAGRAFTA YARDIMCI DÜŞÜNCE ====================
  "Paragrafta Yardımcı Düşünce": [
    {
      code: "A.4.4b",
      subTopicName: "Bilgilendirici Metinler — Yardımcı Düşünceler",
      description:
        "Metnin ana düşüncesi ve yardımcı düşüncelerini belirler.",
      details: [
        "Ana düşünceyi destekleyen yardımcı düşünceleri tespit eder.",
        "Yardımcı düşüncelerin ana düşünceyle ilişkisini kurar.",
      ].join("\n"),
    },
    {
      code: "A.4.10b",
      subTopicName: "Bilgilendirici Metinler — Yazarın Bakış Açısı",
      description: "Metinde yazarın bakış açısını belirler.",
      details: [
        "Yazarın konuya ve okuyucuya yönelik yaklaşımı/tavrı belirlenir.",
        "Yazarın konuyu hangi açıdan ele aldığı yanında, yönlendirme yapıp yapmadığı, taraf olup olmadığı, öznel veya nesnel davranıp davranmadığı gibi hususların bakış açısına etkide bulunduğu hatırlatılır.",
      ].join("\n"),
    },
  ],

  // ==================== DİL BİLGİSİ KONULARI ====================

  // ==================== SES BİLGİSİ ====================
  "Ses Bilgisi": [
    {
      code: "DB.9.1",
      subTopicName: "Standart Dil ve Ağız/Şive/Lehçe",
      description:
        "Standart dil, ağız, şive, lehçe ile argo ve jargon kavramlarını ayırt eder.",
      details: [
        "9. sınıf Ü1 Dil Bilgisi: Standart dil, ağız, şive, lehçe ile argo, jargon kavramları üzerinde durulur.",
        "Türkçenin ses özellikleri, ünlü ve ünsüz uyumları, ses olayları (yumuşama, sertleşme, düşme, türeme, daralma, benzeşme) kavramları ele alınır.",
      ].join("\n"),
    },
    {
      code: "DB.9.2",
      subTopicName: "Ses Olayları",
      description:
        "Türkçedeki ses olaylarını (ünsüz yumuşaması, ünsüz sertleşmesi, ünlü daralması, ünlü düşmesi, ünsüz düşmesi, ses türemesi, kaynaşma) tanır ve uygular.",
      details: [
        "Ünlü uyumu (büyük ve küçük ünlü uyumu) kurallarını bilir.",
        "Ünsüz benzeşmesi ve ses olaylarını ek alırken tespit eder.",
        "Ses olaylarının yazım kurallarıyla ilişkisini kavrar.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== YAZIM KURALLARI ====================
  "Yazım Kuralları": [
    {
      code: "DB.IMK.1",
      subTopicName: "Büyük Harflerin Yazımı",
      description:
        "Büyük harflerin kullanıldığı yerleri (cümle başı, özel isimler, kurum/kuruluş adları, yer adları) bilir ve uygular.",
      details: [
        "Her ünite tablosunda 'Metinler üzerinden imla çalışmaları yapılır' ifadesi yer alır.",
        "Büyük harf kullanımı, özel isimlerin yazımı, kurum adlarının yazımı ele alınır.",
      ].join("\n"),
    },
    {
      code: "DB.IMK.2",
      subTopicName: "Birleşik Kelimelerin Yazımı",
      description:
        "Birleşik kelimelerin bitişik veya ayrı yazılma kurallarını bilir ve uygular.",
      details: [
        "Birleşik fiiller, birleşik isimler ve kalıplaşmış ifadelerin yazımı.",
        "Ki/de bağlacı ile -ki/-de ekinin ayrımı.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.IMK.3",
      subTopicName: "Sık Yapılan Yazım Yanlışları",
      description:
        "Sık yapılan yazım yanlışlarını (de/da, ki, mi soru eki, -(y)la/-ile, -yor, sayıların yazımı vb.) tespit eder ve düzeltir.",
      details: [
        "B.10.a kazanımıyla ilişkili: Dil bilgisi, yazım ve noktalama bakımından gözden geçirmesi sağlanır.",
        "Ses olaylarına bağlı yazım yanlışları, yabancı kökenli kelimelerin yazımı, kısaltmaların yazımı ele alınır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== NOKTALAMA İŞARETLERİ ====================
  "Noktalama İşaretleri": [
    {
      code: "DB.NOK.1",
      subTopicName: "Temel Noktalama İşaretleri",
      description:
        "Nokta, virgül, noktalı virgül, iki nokta, üç nokta işaretlerini doğru kullanır.",
      details: [
        "Her ünite tablosunda 'Metinler üzerinden noktalama çalışmaları yapılır' ifadesi yer alır.",
        "Noktalama işaretlerinin anlama etkisi, cümle içindeki işlevleri üzerinde durulur.",
      ].join("\n"),
    },
    {
      code: "DB.NOK.2",
      subTopicName: "Tırnak İşareti ve Diğer İşaretler",
      description:
        "Tırnak işareti, parantez, kısa çizgi, uzun çizgi, soru ve ünlem işaretlerini doğru kullanır.",
      details: [
        "Alıntılarda tırnak işareti kullanımı.",
        "Ara söz/ara cümlelerde kısa çizgi ve parantez kullanımı.",
        "Soru ve ünlem işaretlerinin cümleye kattığı anlam.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== SÖZCÜĞÜN YAPISI ====================
  "Sözcüğün Yapısı": [
    {
      code: "DB.9.3",
      subTopicName: "Basit, Türemiş ve Birleşik Sözcükler",
      description:
        "Sözcükleri yapılarına göre (basit, türemiş, birleşik) sınıflandırır.",
      details: [
        "Kök ve ek kavramları; yapım ve çekim ekleri ayrımı.",
        "İsimden isim, isimden fiil, fiilden isim, fiilden fiil yapım ekleri.",
        "Birleşik sözcük oluşturma yolları.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.9.4",
      subTopicName: "Yapım Ekleri",
      description:
        "Yapım eklerini tanır, sözcüklerin kök ve gövde yapısını çözümler.",
      details: [
        "İsim yapım ekleri: -lık, -lı, -sız, -cı, -lik vb.",
        "Fiil yapım ekleri: -la, -lan, -laş, -t, -r, -dır vb.",
        "Eklerin sözcüğün anlamını ve türünü nasıl değiştirdiği incelenir.",
      ].join("\n"),
    },
  ],

  // ==================== SÖZCÜK TÜRLERİ ====================
  "Sözcük Türleri": [
    {
      code: "DB.9.5",
      subTopicName: "İsimler",
      description:
        "Metindeki isimleri bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "9. sınıf Ü2 Dil Bilgisi: Metindeki isimleri bulur ve bunların metindeki işlevlerini belirler.",
        "İsimlerin türleri: Varlıklara verilişine göre (özel/cins), varlıkların oluşlarına göre (somut/soyut), varlıkların sayılarına göre (tekil/çoğul/topluluk).",
        "İsim çekim ekleri: hâl ekleri, iyelik ekleri, çoğul eki.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.9.6",
      subTopicName: "Sıfatlar",
      description:
        "Metindeki sıfatları bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "9. sınıf Ü3-Ü4 Dil Bilgisi: Metindeki sıfatları bulur ve bunların metindeki işlevlerini belirler.",
        "Niteleme ve belirtme sıfatları (işaret, sayı, belgisiz, soru sıfatları).",
        "Sıfat-fiiller (isim-fiiller ile karışımı), ad olan sıfatlar.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.9.7",
      subTopicName: "Zamirler",
      description:
        "Metindeki zamirleri bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "9. sınıf Ü5 Dil Bilgisi: Metindeki zamirleri bulur ve bunların metindeki işlevlerini belirler.",
        "Zamir türleri: kişi, işaret, belgisiz, soru, dönüşlülük zamirleri.",
        "İlgi zamiri (-ki), zamirlerin ad çekimi, isimlerin yerine kullanımı.",
      ].join("\n"),
    },
    {
      code: "DB.9.8",
      subTopicName: "Zarflar",
      description:
        "Metindeki zarfları bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "9. sınıf Ü6 Dil Bilgisi: Metindeki zarfları bulur ve bunların metindeki işlevlerini belirler.",
        "Zarf türleri: zaman, yer-yön, durum, miktar, soru zarfları.",
        "Sıfat-zarf ayrımı (sözcüğün cümlede kullanımına göre tür belirleme).",
      ].join("\n"),
    },
    {
      code: "DB.9.9",
      subTopicName: "Edat, Bağlaç ve Ünlem",
      description:
        "Metindeki edat, bağlaç ve ünlemleri bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "9. sınıf Ü4 Dil Bilgisi: Metindeki edat, bağlaç ve ünlemleri bulur ve bunların metindeki işlevlerini belirler.",
        "Edatlar: ile, gibi, için, kadar, göre vb.",
        "Bağlaçlar: ve, ama, fakat, ancak, çünkü, ya da, ki, de/da vb.",
        "Ünlemler: Eyvah, aman, hay, vah vb.",
      ].join("\n"),
    },
  ],

  // ==================== FİİLLER ====================
  Fiiller: [
    {
      code: "DB.9.10",
      subTopicName: "Fiiller ve Fiil Çekimi",
      description:
        "Metindeki fiilleri bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "9. sınıf Ü7-Ü8 Dil Bilgisi: Metindeki fiilleri bulur ve bunların metindeki işlevlerini belirler.",
        "Kip ekleri: haber kipleri (di'li geçmiş, miş'li geçmiş, şimdiki zaman, gelecek zaman, geniş zaman) ve dilek kipleri (istek, şart, gereklilik, emir).",
        "Kişi ekleri, olumsuzluk eki, soru eki kullanımı.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.9.11",
      subTopicName: "Fiilde Anlam (Çatı)",
      description:
        "Fiillerin anlam özelliklerini ve çatı kavramını bilir.",
      details: [
        "Fiilde anlam: iş, oluş, durum fiilleri.",
        "Fiilde çatı: nesne-yüklem ilişkisi (geçişli/geçişsiz), özne-yüklem ilişkisi (etken/edilgen/dönüşlü/işteş).",
        "Çatı eklerinin fiil anlamını nasıl değiştirdiği üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.10.1",
      subTopicName: "Fiilimsiler (İsim-fiil, Sıfat-fiil, Zarf-fiil)",
      description:
        "Metindeki fiilimsileri bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "10. sınıf Ü2 Dil Bilgisi: Metindeki fiilimsileri bulur ve bunların metindeki işlevlerini belirler.",
        "İsim-fiiller (-ma, -iş, -mak), sıfat-fiiller (-an, -ası, -mez, -ar, -dık, -ecek, -miş), zarf-fiiller (-arak, -ıp, -ken, -ınca, -dıkça, -madan, -eli vb.).",
        "Fiilimsilerin cümlede isim, sıfat ve zarf görevlerinde kullanımı.",
      ].join("\n"),
    },
  ],

  // ==================== SÖZCÜK GRUPLARI ====================
  "Sözcük Grupları": [
    {
      code: "DB.10.2",
      subTopicName: "İsim Tamlamaları",
      description:
        "Metindeki isim tamlamalarını bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "10. sınıf Ü3 Dil Bilgisi: Metindeki isim tamlamalarını bulur ve bunların metindeki işlevlerini belirler.",
        "Belirtili isim tamlaması, belirtisiz isim tamlaması, zincirleme isim tamlaması, takısız isim tamlaması.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.10.3",
      subTopicName: "Sıfat Tamlamaları",
      description:
        "Metindeki sıfat tamlamalarını bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "10. sınıf Ü4 Dil Bilgisi: Metindeki sıfat tamlamalarını bulur ve bunların metindeki işlevlerini belirler.",
        "Sıfat + isim yapısı, birden fazla sıfatın kullanımı, sıfat tamlamalarının cümledeki işlevi.",
      ].join("\n"),
    },
  ],

  // ==================== CÜMLENİN ÖGELERİ ====================
  "Cümlenin Ögeleri": [
    {
      code: "DB.11.1",
      subTopicName: "Temel Ögeler: Yüklem ve Özne",
      description:
        "Cümlenin temel ögelerini (yüklem, özne) belirler.",
      details: [
        "11. sınıf Ü1-Ü2 Dil Bilgisi: Metindeki cümlelerin ögelerini bulur.",
        "Yüklem: Cümledeki temel yargıyı bildiren öge; fiil veya isim soylu olabilir.",
        "Özne: Yüklemdeki eylemi yapan veya yükleme konu olan öge; gerçek özne, gizli özne, sözde özne ayrımı.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.11.2",
      subTopicName: "Yardımcı Ögeler: Nesne",
      description:
        "Cümledeki nesneyi (belirtili/belirtisiz nesne) belirler.",
      details: [
        "11. sınıf Ü3 Dil Bilgisi: Cümlelerin ögeleri çalışması devamı.",
        "Belirtili nesne (-ı, -i, -u, -ü eki alan), belirtisiz nesne (eksiz, yalın hâlde).",
        "Nesne ile yüklem arasındaki çatı ilişkisi.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.11.3",
      subTopicName: "Yardımcı Ögeler: Zarf Tümleci ve Dolaylı Tümleç",
      description:
        "Cümledeki zarf tümlecini ve dolaylı tümleci belirler.",
      details: [
        "11. sınıf Ü4-Ü5 Dil Bilgisi: Cümlelerin ögeleri çalışması devamı.",
        "Dolaylı tümleç: -e, -de, -den hâl ekli ögeler.",
        "Zarf tümleci: Yüklemin anlamını zaman, durum, miktar, yer-yön bakımından belirleyen öge.",
        "Cümle dışı öge (ara söz) kavramı.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== CÜMLE TÜRLERİ ====================
  "Cümle Türleri": [
    {
      code: "DB.10.4",
      subTopicName: "Yüklemine Göre Cümle Çeşitleri",
      description:
        "Metindeki cümle çeşitlerini bulur ve bunların metindeki işlevlerini belirler.",
      details: [
        "10. sınıf Ü5-Ü9 Dil Bilgisi: Metindeki cümle çeşitlerini bulur ve bunların metindeki işlevlerini belirler.",
        "Fiil cümlesi / isim cümlesi ayrımı.",
        "Kurallı (yüklemi sonda) ve devrik (yüklemi sonda olmayan) cümle.",
        "Eksiltili cümle (yüklemi düşmüş cümle).",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.10.5",
      subTopicName: "Anlamına Göre Cümle Çeşitleri",
      description:
        "Cümleleri anlamlarına göre (olumlu, olumsuz, soru, ünlem, emir, istek, şart) sınıflandırır.",
      details: [
        "Cümlenin olumlu/olumsuz yapılması.",
        "Soru cümleleri: gerçek soru, sözde soru (pekiştirme, onay, ret vb.).",
      ].join("\n"),
    },
    {
      code: "DB.10.6",
      subTopicName: "Yapısına Göre Cümle Çeşitleri",
      description:
        "Cümleleri yapılarına göre (basit, birleşik, sıralı, bağlı) sınıflandırır.",
      details: [
        "Basit cümle: Tek yüklemli, yan cümleciği olmayan.",
        "Birleşik cümle: Yan cümlecik + temel cümlecik (girişik birleşik, şartlı birleşik, ki'li birleşik, iç içe birleşik).",
        "Sıralı cümle: Virgül veya noktalı virgülle ayrılmış bağımsız cümleler.",
        "Bağlı cümle: Bağlaçlarla bağlanmış cümleler.",
        "B.8 kazanımı: Bir yazıda basit, birleşik, sıralı, bağlı, eksiltili, devrik, kurallı cümle; isim cümlesi ve fiil cümlesi şeklinde farklı cümle yapıları/türlerinin kullanılmasının metne katkısı vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== ANLATIM BOZUKLUĞU ====================
  "Anlatım Bozukluğu": [
    {
      code: "DB.11.4",
      subTopicName: "Anlama Dayalı Anlatım Bozuklukları",
      description:
        "Anlama dayalı anlatım bozukluklarını tespit eder ve düzeltir.",
      details: [
        "11. sınıf Ü6-Ü7 Dil Bilgisi: Anlatım bozukluklarıyla ilgili çalışmalar yapılır.",
        "Gereksiz sözcük kullanımı, anlamca çelişen sözcükler, anlam belirsizliği.",
        "Mantık hataları, deyim ve atasözü yanlışlıkları.",
        "Sözcüğün yanlış anlamda kullanılması, sözcük eksikliği.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.11.5",
      subTopicName: "Yapıya Dayalı Anlatım Bozuklukları",
      description:
        "Yapıya dayalı anlatım bozukluklarını tespit eder ve düzeltir.",
      details: [
        "11. sınıf Ü8-Ü9 Dil Bilgisi: Anlatım bozukluklarıyla ilgili çalışmalar yapılır.",
        "Özne-yüklem uyumsuzluğu, tamlama bozuklukları, ek eksikliği/fazlalığı.",
        "Bağlaç ve edat yanlışlıkları, çatı uyumsuzluğu.",
        "Sıralama (virgül, bağlaç) hataları, cümle düşüklüğü.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "DB.12.2",
      subTopicName: "Anlatım Bozukluğu — Genel Tekrar",
      description:
        "12. sınıf düzeyinde anlatım bozukluklarını kapsamlı olarak değerlendirir.",
      details: [
        "12. sınıf Dil Bilgisi: Anlatım bozukluklarıyla ilgili çalışmalar devam eder.",
        "Tüm anlatım bozukluğu türlerinin genel tekrarı ve TYT sınavında sıklıkla çıkan bozukluk kalıplarının pekiştirilmesi.",
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

  const turkceSubject = await prisma.subject.findFirst({
    where: { name: "Türkçe", examTypeId: tyt.id },
  });
  if (!turkceSubject) {
    console.log("TYT Türkçe subject bulunamadı, atlıyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: turkceSubject.id },
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
    console.error("seed-tyt-turkce-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
