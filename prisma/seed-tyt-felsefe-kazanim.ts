/**
 * TYT Felsefe kazanimlarini MEB PDF'den sisteme ekler.
 * Kaynak: MEB Ortaogretim Felsefe Dersi Ogretim Programi (2018), sayfa 227-238
 *
 * Bu script mevcut konulara kazanim ekler. Mevcut mufredati BOZMAZ.
 * Zaten kazanimi olan topic'leri atlar (idempotent).
 *
 * Calistirmak icin: npx tsx prisma/seed-tyt-felsefe-kazanim.ts
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
// PDF'DEN CIKARILMIS KAZANIMLAR — TOPIC ADI -> KAZANIM LISTESI
// =====================================================================

const KAZANIMLAR: Record<string, KazanimDef[]> = {
  // ==================== FELSEFE'NIN KONUSU-ALANI ====================
  // 10. sinif U1: Felsefeyi Tanima (10.1.1-10.1.3)
  // + U2: Felsefe ile Dusunme (10.2.1-10.2.4) - genel felsefi dusunme
  // + U4: Felsefi Okuma ve Yazma (10.4.1-10.4.4) - genel felsefi okuma/yazma
  // + 11. sinif genel felsefe tarihi giris kazanimlari
  "Felsefe'nin Konusu-Alanı": [
    {
      code: "10.1.1",
      subTopicName: "Felsefeyi Tanima",
      description: "Felsefenin anlamini aciklar.",
      details: [
        "a) Cesitli sorulardan (Bilgi nedir?, Bilinc nedir?, Oz bilinc nedir?) hareketle dusunmenin onemi ve gerekliligininin tartisilmasi saglanir.",
        "b) Felsefe (philosophia) terimi kapsaminda gecen sevgi, arayis, bilgi, hakikat ve hikmet (bilgelik/sophia) kavramlarinin felsefeyle iliskisine deginilir.",
        "c) Farkli dusunurlerin (Platon, Aristoteles, el-Kindi, Farabi, Ibn Sina, I. Kant, K. Jaspers, Hilmi Ziya Ulken ve Takiyettin Mengusoglu) felsefe tanimlarina yer verilerek bu tanimlarin benzer ve farkli noktalarinin belirtilmesi saglanir.",
        "d) Bilisim teknolojileri kullanilarak \"Filozof kimdir?\" sorusuna iliskin bir sunum hazirlanmasi ve sunumun sinif ortaminda paylasilmasi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2",
      subTopicName: "Felsefeyi Tanima",
      description: "Felsefi dusuncenin ozelliklerini aciklar.",
      details: [
        "a) Felsefi dusuncenin ortaya cikisi uzerinde kisaca durulur.",
        "b) Felsefenin sorgulama, merak etme, suphe duyma, hayret etme, yigilimli ilerleme, elestirel, refleksif, rasyonel, sistemli, tutarli ve evrensel olma ozellikleri vurgulanir.",
        "c) N. Uygur'un \"Bir Felsefe Sorusu Nedir?\" adli makalesinden alinan veya derlenen bir metinden hareketle felsefi sorularin ozelliklerinin yorumlanmasi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.3",
      subTopicName: "Felsefeyi Tanima",
      description:
        "Felsefenin insan ve toplum hayati uzerindeki rolunu orneklerle aciklar.",
      details: [
        "a) Felsefenin bireysel ve toplumsal islevlerine deginilir.",
        "b) Felsefe hayat iliskisinin gunluk hayattan orneklerle yorumlanmasi saglanir.",
      ].join("\n"),
    },
    {
      code: "10.2.1",
      subTopicName: "Felsefe ile Dusunme",
      description:
        "Dusunme ve akil yurutmeye iliskin kavramlari aciklar.",
      details: [
        "a) Gorus, arguman, onerme, tumdengelim, tumevarim, analoji, tutarlilik, celisiklik, gerceklik, dogruluk ve temellendirme kavramlari uzerinde durulur.",
        "b) Ornek metinler verilerek bu metinlerdeki akil yurutme bicimlerinin, tutarli ve celisik ifadelerin belirlenmesi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.2",
      subTopicName: "Felsefe ile Dusunme",
      description:
        "Dusunme ve akil yurutmede dili dogru kullanmanin onemini aciklar.",
      details: [
        "a) Dilin ifade etme ve kavramlastirma islevi uzerinde durulur.",
        "b) Kavramlari yanlis kullanmanin, anlami nasil degistirdigine iliskin gunluk hayattan ornekler verilmesi saglanir.",
      ].join("\n"),
    },
    {
      code: "10.2.3",
      subTopicName: "Felsefe ile Dusunme",
      description: "Bir konuyla ilgili felsefi sorular olusturur.",
      details:
        "Secilen konu ornekleri uzerinden ogrencilere sorular yoneltilerek ogrencilerin konuya iliskin kendi sorularini yapilandirmalari saglanir.",
    },
    {
      code: "10.2.4",
      subTopicName: "Felsefe ile Dusunme",
      description: "Felsefi bir gorusu veya argumani sorgular.",
      details: [
        "a) Bir konusma veya bir metin secilerek konusmacinin yahut yazarin ileri surdugu gorus ve argumanlarin tespit edilmesi ve tartisilmasi saglanir.",
        "b) Ogrencilerin gazete, dergi, roman, televizyon haberi, tartisma programi veya filmlerde gecen felsefi bir gorusu tespit etmeleri ve bu gorusu temellendiren argumanlari sinif ortaminda tartismalari saglanir.",
      ].join("\n"),
    },
    {
      code: "10.4.1",
      subTopicName: "Felsefi Okuma ve Yazma",
      description: "Felsefi bir metni analiz eder.",
      details:
        "Felsefi bir metin orneginde; \"Metinde hangi felsefi kavramlar gecmektedir?\", \"Metinde hangi felsefi problem veya problemler ele alinmaktadir?\", \"Felsefi probleme veya problemlere filozofun bakis acisi nasildir?\", \"Kullanilan kavramlar ve savunulan gorusler, guncel sorunlarin anlasilmasi ve cozumlenmesi icin nasil bir katki sunabilir?\" sorulari yoluyla analiz ve degerlendirme yapilmasi saglanir.",
    },
    {
      code: "10.4.2",
      subTopicName: "Felsefi Okuma ve Yazma",
      description: "Verilen konu hakkinda alternatif gorusler gelistirir.",
      details:
        "Metin alintilarina yer verilerek ogrencilerin bu alintilardaki konu veya durumla ilgili one surulen gorusleri belirlemeleri ve \"Bu konuya farkli bir acidan bakilabilir mi?\", \"Bu konuyla ilgili sizden gorus one surmeniz istenseydi gorusunuz ne olurdu?\" gibi sorulardan hareketle ayni konuyla ilgili ozgun gorusler gelistirmeleri saglanir.",
    },
    {
      code: "10.4.3",
      subTopicName: "Felsefi Okuma ve Yazma",
      description: "Bir konu hakkinda felsefi bir deneme yazar.",
      details: [
        "a) Felsefi denemenin ne oldugu ve nasil yazildigi aciklanir.",
        "b) Tutarli, sistematik ve temellendirilmis bir felsefi denemenin yazilmasi saglanir.",
      ].join("\n"),
    },
    {
      code: "10.4.4",
      subTopicName: "Felsefi Okuma ve Yazma",
      description:
        "Felsefi akil yurutme becerilerini diger alanlarda kullanir.",
      details:
        "Felsefeden farkli bir konuda yazilmis bir metni, felsefenin varlik, bilgi ve deger alanlari uzerinden yorumlanmasi saglanir.",
    },
    // 11. sinif - felsefe tarihine genel giris kazanimlari
    {
      code: "11.1.1",
      subTopicName: "MO 6. Yuzyil-MS 2. Yuzyil Felsefesi",
      description:
        "Felsefenin ortaya cikisini hazirlayan dusunce ortamini aciklar.",
      details: [
        "a) Sumer, Mezopotamya, Misir, Cin, Hint ve Iran medeniyetlerinde varlik, bilgi ve deger anlayislarinin felsefenin dogusundaki etkilerine deginilir.",
        "b) Anadolu'da yasamis filozoflarin (Thales, Anaksimandros, Anaksimenes, Anaksagoras, Herakleitos, Epiktetos, Diogenes, Lukianos, Ksenofanes ve Aristoteles) dogdugu ve yasadigi yer vurgulanarak kisaca biyografik bilgi verilir.",
      ].join("\n"),
    },
  ],

  // ==================== BILGI FELSEFESI ====================
  // 10. sinif U3 (10.3.2) + ilgili 11. sinif epistemoloji kazanimlari
  "Bilgi Felsefesi": [
    {
      code: "10.3.2",
      subTopicName: "Felsefenin Temel Konulari ve Problemleri",
      description:
        "Bilgi felsefesinin konusunu ve problemlerini aciklar.",
      details: [
        "a) \"Dogru bilgi mumkun mudur?\", \"Bilginin kaynagi nedir?\", \"Bilginin sinirlari ve dogru bilginin olcutleri nelerdir?\" problemlerinden hareketle bilgi felsefesinin konusu kisaca aciklanir.",
        "b) Felsefi bir metnin uzerinden dogruluk ve gerceklik kavramlari arasindaki iliskinin tartisilmasi saglanir.",
        "c) Ogrencilerin dergi ve gazete haberleri, internet, sosyal medya veya TV programlarinda paylasilan bilgileri, bilginin degeri ve guvenilirligi acisindan tartismalari saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.1.2b - Sokrates ve Sofistlerin bilgi anlayislari
    {
      code: "11.1.2",
      subTopicName: "MO 6. Yuzyil-MS 2. Yuzyil Felsefesi",
      description:
        "MO 6. yuzyil-MS 2. yuzyil felsefesinin karakteristik ozelliklerini aciklar.",
      details: [
        "a) Filozoflarin ilk neden hakkindaki dusunceleri (Thales, Anaksimandros, Anaksimenes, Empedokles ve Demokritos) ve degisim dusuncesi (Lao Tse, Herakleitos ve Parmenides) ele alinir.",
        "b) Sokrates ve Sofistlerin (Protagoras ve Gorgias) bilgi ve ahlak anlayislari ele alinir.",
        "c) Platon ve Aristoteles'in varlik, bilgi ve deger anlayislari ele alinir.",
      ].join("\n"),
    },
    // 11.2.3d - Gazali'nin bilgi gorusu
    {
      code: "11.2.3",
      subTopicName: "MS 2. Yuzyil-MS 15. Yuzyil Felsefesi",
      description:
        "Ornek felsefi metinlerden hareketle MS 2. yuzyil-MS 15. yuzyil filozoflarinin felsefi goruslerini analiz eder.",
      details: [
        "a) St. Augustinus'un \"Itiraflar\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun \"Tanri ve evren\" ile ilgili goruslerinin irdelenmesi saglanir.",
        "b) Farabi'nin \"el-medinetul fazila\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun ahlak ve siyaset goruslerinin irdelenmesi saglanir.",
        "c) Ibn Sina'nin \"Salaman ve absal\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun varlik gorusunun irdelenmesi saglanir.",
        "d) Gazali'nin \"el-munkiz mine'd-dalal\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun bilgi gorusunun irdelenmesi saglanir.",
        "e) Ibn Rusd'un \"Tehafut et-tehafut el-felasife\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun \"din felsefe iliskisi\" ile ilgili goruslerinin irdelenmesi saglanir.",
      ].join("\n"),
    },
    // 11.4.3a - Locke'un bilginin kaynagi gorusleri
    {
      code: "11.4.3",
      subTopicName: "18. Yuzyil-19. Yuzyil Felsefesi",
      description:
        "Ornek felsefi metinlerden hareketle 18. yuzyil-19. yuzyil filozoflarinin felsefi goruslerini analiz eder.",
      details: [
        "a) J. Locke'un \"Insan Zihni Uzerine Bir Deneme\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun bilginin kaynagi konusundaki goruslerinin irdelenmesi saglanir.",
        "b) I. Kant'in \"Ahlak Metafiziginin Temellendirilmesi\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun \"odev ahlaki\" anlayisinin irdelenmesi saglanir.",
        "c) F. Hegel'in \"Tinin Fenomenolojisi\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun \"diyalektik idealizm\" anlayisinin irdelenmesi saglanir.",
      ].join("\n"),
    },
    // 11.5.3b - Bergson'un bilginin kaynagi dusunceleri
    {
      code: "11.5.3",
      subTopicName: "20. Yuzyil Felsefesi",
      description:
        "Ornek felsefi metinlerden hareketle 20. yuzyil filozoflarinin felsefi goruslerini analiz eder.",
      details: [
        "a) F. Nietzsche'nin \"Boyle Buyurdu Zerdust\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun \"yeni degerler insasi ve guc istenci\" goruslerinin irdelenmesi saglanir.",
        "b) H. Bergson'un \"Bilincin Dolaysiz Verileri Uzerine Deneme\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun bilginin kaynagi konusundaki dusuncelerinin irdelenmesi saglanir.",
        "c) J. P. Sartre'in \"Varoluscculuk\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun \"varolus\" goruslerinin irdelenmesi saglanir.",
        "d) T. Kuhn'un \"Bilimsel Devrimlerin Yapisi\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun bilim anlayisinin irdelenmesi saglanir.",
      ].join("\n"),
    },
  ],

  // ==================== VARLIK FELSEFESI ====================
  // 10. sinif U3 (10.3.1) + ilgili 11. sinif ontoloji kazanimlari
  "Varlık Felsefesi": [
    {
      code: "10.3.1",
      subTopicName: "Felsefenin Temel Konulari ve Problemleri",
      description:
        "Varlik felsefesinin konusunu ve problemlerini aciklar.",
      details: [
        "a) \"Varlik var midir?\", \"Varligin mahiyeti nedir?\", \"Evrende amaclilik var midir?\" problemlerinden hareketle varlik felsefesinin konusu kisaca aciklanir.",
        "b) Felsefi bir metin uzerinden varlik turlerinin siniflandirilmasi saglanir.",
        "c) Ogrencilerin hikaye, roman, kisa film veya belgesellerden birinde islenen konuyu varlik felsefesi acisindan degerlendirmeleri ve sinifta paylasmalari saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.1.3c - Platon'un varlik, bilgi ve siyaset gorusleri
    {
      code: "11.1.3",
      subTopicName: "MO 6. Yuzyil-MS 2. Yuzyil Felsefesi",
      description:
        "Ornek felsefi metinlerden hareketle MO 6. yuzyil-MS 2. yuzyil filozoflarinin felsefi goruslerini analiz eder.",
      details: [
        "a) Konfucyus'un \"Ideal Bir Insan ve Topluma Dair Konusmalar\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun ahlak gorusunun irdelenmesi saglanir.",
        "b) Platon'un \"Sokrates'in Savunmasi\" adli eserinden alinan veya derlenen bir metinden hareketle Sokrates'in \"bilgelik ve erdem\" anlayisinin irdelenmesi saglanir.",
        "c) Platon'un \"Devlet\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun varlik, bilgi ve siyaset goruslerinin irdelenmesi saglanir.",
        "d) Aristoteles'in \"Nikomakhos'a Etik\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun \"altin orta\" dusuncesinin irdelenmesi saglanir.",
      ].join("\n"),
    },
    // 11.3.3a - Descartes'in bilgi ve varlik gorusleri
    {
      code: "11.3.3",
      subTopicName: "15. Yuzyil-17. Yuzyil Felsefesi",
      description:
        "Ornek felsefi metinlerden hareketle 15. yuzyil-17. yuzyil filozoflarinin felsefi goruslerini analiz eder.",
      details: [
        "a) R. Descartes'in \"Felsefenin Ilkeleri\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun bilgi ve varlik goruslerinin irdelenmesi saglanir.",
        "b) B. Spinoza'nin \"Ethica\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun ahlak gorusunun irdelenmesi saglanir.",
        "c) T. Hobbes'un \"Leviathan\" adli eserinden alinan veya derlenen bir metinden hareketle filozofun siyaset goruslerinin irdelenmesi saglanir.",
      ].join("\n"),
    },
    // 11.4.3c - Hegel'in diyalektik idealizm anlayisi (ontoloji)
    {
      code: "11.4.2",
      subTopicName: "18. Yuzyil-19. Yuzyil Felsefesi",
      description:
        "18. yuzyil-19. yuzyil felsefesinin karakteristik ozelliklerini aciklar.",
      details: [
        "a) 18. yuzyil-19. yuzyil felsefesinin temel ozellikleri ve problemleri uzerinde durulur.",
        "b) 18. yuzyil-19. yuzyil felsefesinin, donemin dil ve edebiyatla iliskisine deginilir.",
      ].join("\n"),
    },
    // 11.5.3c - Sartre'in varolus gorusleri (ontoloji)
    {
      code: "11.5.2",
      subTopicName: "20. Yuzyil Felsefesi",
      description:
        "20. yuzyil felsefesinin karakteristik ozelliklerini aciklar.",
      details: [
        "a) 20. yuzyil felsefesinin temel ozellikleri, problemleri ve bazi ana akimlari (fenomenoloji, hermeneutik, varoluscculuk, diyalektik materyalizm, mantiksal pozitivizm, yeni ontoloji) uzerinde durulur.",
        "b) Turkiye'de felsefi dusunceye katkida bulunan felsefeciler uzerinde durulur.",
      ].join("\n"),
    },
  ],

  // ==================== AHLAK FELSEFESI ====================
  // 10. sinif U3 (10.3.4) + ilgili 11. sinif etik kazanimlari
  "Ahlak Felsefesi": [
    {
      code: "10.3.4",
      subTopicName: "Felsefenin Temel Konulari ve Problemleri",
      description:
        "Ahlak felsefesinin konusunu ve problemlerini aciklar.",
      details: [
        "a) \"Iyi ve kotunun olcutu nedir?\", \"Ozgurluk ve sorumluluk arasinda nasil bir iliski vardir?\", \"Evrensel bir ahlak yasasi var midir?\" problemlerinden hareketle ahlak felsefesinin konusu kisaca aciklanir.",
        "b) Felsefi bir metnin uzerinden, iyilik ve mutluluk iliskisinin yorumlanmasi saglanir.",
        "c) Okul ortaminda yasanan durumlardan ve olaylardan hareketle ozgurluk, sorumluluk ve kural (norm) iliskisinin tartisilmasi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.1.3a - Konfucyus'un ahlak gorusu
    {
      code: "11.1.4",
      subTopicName: "MO 6. Yuzyil-MS 2. Yuzyil Felsefesi",
      description:
        "MO 6. yuzyil-MS 2. yuzyil felsefesindeki ornek dusunce ve argumanlari felsefi acidan degerlendirir.",
      details: [
        "a) Protagoras'in \"Insan her seyin olcusudur.\" sozunun dayandigi argumanlarin tartisilmasi saglanir.",
        "b) Ogrencilerin, \"bilgi erdem iliskisini\" gunluk hayatla iliskilendiren ozgun bir metin yazmalari saglanir.",
      ].join("\n"),
    },
    // 11.3.3b - Spinoza'nin ahlak gorusu
    {
      code: "11.3.2",
      subTopicName: "15. Yuzyil-17. Yuzyil Felsefesi",
      description:
        "15. yuzyil-17. yuzyil felsefesinin karakteristik ozelliklerini aciklar.",
      details: [
        "a) Skolastik dusunce ile modern dusuncenin temel farklari uzerinde durulur.",
        "b) Humanizm, bilimsel yontem, kartezyen felsefe ve hukuk felsefesi uzerinde durulur.",
        "c) N. Kopernik, G. Galileo, F. Bacon ve I. Newton'un bilimsel calismalarinin 15. yuzyil-17. yuzyil felsefesi uzerindeki etkilerine deginilir.",
      ].join("\n"),
    },
    // 11.5.4a - N. Topcu'nun ahlak hakkindaki gorusleri
    {
      code: "11.5.4",
      subTopicName: "20. Yuzyil Felsefesi",
      description:
        "20. yuzyil felsefesi ornek dusunce ve argumanlari felsefi acidan degerlendirir.",
      details: [
        "a) N. Topcu'nun \"Isyan Ahlaki\" adli eserinden alinan veya derlenen bir metinden hareketle dusunurun ahlak hakkindaki goruslerinin tartisilmasi saglanir.",
        "b) T. Mengusoglu'nun \"Insan Felsefesi\" adli eserinden alinan ve derlenen bir metinden hareketle filozofun \"insani bir butun olarak goren\" dusuncelerinin tartisilmasi saglanir.",
        "c) K. Popper'in \"Ben yanilmis olabilirim ve sen hakli olabilirsin ve ortak caba sonucunda belki dogruluga biraz daha yaklasabiliriz.\" sozunden hareketle bilginin dogrulugu ile ilgili ozgun bir metin yazilmasi saglanir.",
      ].join("\n"),
    },
  ],

  // ==================== SANAT FELSEFESI ====================
  // 10. sinif U3 (10.3.7)
  "Sanat Felsefesi": [
    {
      code: "10.3.7",
      subTopicName: "Felsefenin Temel Konulari ve Problemleri",
      description:
        "Sanat felsefesinin konusunu ve problemlerini aciklar.",
      details: [
        "a) \"Guzel nedir?\", \"Sanat nedir?\", \"Sanat eserinin ozellikleri nelerdir?\" problemlerinden hareketle sanat felsefesinin konusu kisaca aciklanir.",
        "b) Felsefi bir metin uzerinden sanat ve duyarlilik iliskisinin yorumlanmasi saglanir.",
        "c) Ogrencilerin yasadigi sehrin mimari yapisini estetik acidan tartismalari saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== DIN FELSEFESI ====================
  // 10. sinif U3 (10.3.5) + ilgili 11. sinif din felsefesi kazanimlari
  "Din Felsefesi": [
    {
      code: "10.3.5",
      subTopicName: "Felsefenin Temel Konulari ve Problemleri",
      description:
        "Din felsefesinin konusunu ve sorularini aciklar.",
      details: [
        "a) \"Tanri'nin varligi ile ilgili gorusler nelerdir?\", \"Evren sonlu mudur, sonsuz mudur?\", \"Olumden sonra yasam var midir?\" problemlerinden hareketle din felsefesinin konusu kisaca aciklanir.",
        "b) Teoloji ve din felsefesi farki uzerinde durulur.",
        "c) \"Ben kimim?\" sorusunun felsefe, bilim ve din acisindan nasil ele alindiginin tartisilmasi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.2.2c - inanc akil iliskisi
    {
      code: "11.2.2",
      subTopicName: "MS 2. Yuzyil-MS 15. Yuzyil Felsefesi",
      description:
        "MS 2. yuzyil-MS 15. yuzyil felsefesinin karakteristik ozelliklerini aciklar.",
      details: [
        "a) MS 2. yuzyil-MS 15. yuzyil Hiristiyan felsefesinin temel ozellikleri ve problemleri uzerinde durulur.",
        "b) MS 2. yuzyil-MS 15. yuzyil Islam felsefesinin temel ozellikleri ve problemleri uzerinde durulur.",
        "c) MS 2. yuzyil-MS 15. yuzyil felsefesinin temel problemlerinden \"inanc akil iliskisi\" konusunda Hiristiyan ve Islam felsefesinin yaklasimlari arasindaki farklar vurgulanir.",
        "d) 8-12. yuzyil arasindaki ceviri faaliyetlerinin Islam felsefesine ve Bati felsefesine etkileri uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.2.4 - tasavvuf dusuncesi, inanc akil iliskisi
    {
      code: "11.2.4",
      subTopicName: "MS 2. Yuzyil-MS 15. Yuzyil Felsefesi",
      description:
        "MS 2. yuzyil-MS 15. yuzyil felsefesindeki ornek dusunce ve argumanlari felsefi acidan degerlendirir.",
      details: [
        "a) Mevlana, Yunus Emre ve Haci Bektas Veli'nin eserlerinden alinan veya derlenen bir metinden hareketle tasavvuf dusuncesindeki insan anlayisinin tartisilmasi saglanir.",
        "b) \"Anlamak icin inaniyorum\" dusuncesinden hareketle \"inanc akil iliskisini\" ele alan ozgun bir metin yazilmasi saglanir.",
      ].join("\n"),
    },
  ],

  // ==================== SIYASET FELSEFESI ====================
  // 10. sinif U3 (10.3.6) + ilgili 11. sinif siyaset felsefesi kazanimlari
  "Siyaset Felsefesi": [
    {
      code: "10.3.6",
      subTopicName: "Felsefenin Temel Konulari ve Problemleri",
      description:
        "Siyaset felsefesinin konusunu ve problemlerini aciklar.",
      details: [
        "a) \"Hak, adalet ve ozgurluk nedir?\", \"Iktidarin kaynagi nedir?\", \"Ideal devlet duzeni olabilir mi?\" problemlerinden hareketle siyaset felsefesinin konusu kisaca aciklanir.",
        "b) Gecmisten gunumuze egemenlik sorununun temel hak ve ozgurlukler acisindan tartisilmasi saglanir.",
        "c) Ogrencilerin ulkemizde yasanan sorunlardan birini arastirarak birey, toplum ve devlet iliskileri baglaminda tartismalari saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.3.4b - Utopya kavrami
    {
      code: "11.3.4",
      subTopicName: "15. Yuzyil-17. Yuzyil Felsefesi",
      description:
        "15. yuzyil-17. yuzyil felsefesindeki ornek dusunce ve argumanlari felsefi acidan degerlendirir.",
      details: [
        "a) F. Bacon'in \"Bilgi guctur.\" sozunun olumlu ve olumsuz yonlerinin gunluk hayattan orneklerle tartisilmasi saglanir.",
        "b) Utopya kavrami ve turleri uzerinde durularak ozgun bir utopya yazilmasi saglanir.",
      ].join("\n"),
    },
    // 11.4.4 - Rousseau'nun ozgurluk problemi
    {
      code: "11.4.4",
      subTopicName: "18. Yuzyil-19. Yuzyil Felsefesi",
      description:
        "18. yuzyil-19. yuzyil felsefesindeki ornek dusunce ve argumanlari felsefi acidan degerlendirir.",
      details: [
        "a) J. J. Rousseau'nun \"Insan ozgur dogar oysa her yerde zincire vurulmustur.\" sozunden hareketle ozgurluk probleminin tartisilmasi saglanir.",
        "b) Gunluk hayatta kullanilan bilgilerde aklin ve deneyin rolune iliskin ozgun bir metin yazilmasi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== BILIM FELSEFESI ====================
  // 10. sinif U3 (10.3.3) + ilgili 11. sinif bilim felsefesi kazanimlari
  "Bilim Felsefesi": [
    {
      code: "10.3.3",
      subTopicName: "Felsefenin Temel Konulari ve Problemleri",
      description:
        "Bilim felsefesinin konusunu ve problemlerini aciklar.",
      details: [
        "a) \"Bilim nedir?\", \"Bilimsel yontem nedir?\", \"Bilimin degeri nedir?\" problemlerinden hareketle bilim felsefesinin konusu kisaca aciklanir.",
        "b) Bilim felsefe iliskisi uzerinde durulur.",
        "c) B. Russell'in \"Bilgelikle birlestiginde bilimin sagladigi kudret tum insanliga buyuk olcude refah ve mutluluk getirebilir; tek basina ise yalniz yikintiya yol acar.\" sozunden hareketle bilimle hayat arasindaki iliskinin tartisilmasi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    // 11.3.1 - bilimsel calismalarin felsefe uzerindeki etkileri
    {
      code: "11.3.1",
      subTopicName: "15. Yuzyil-17. Yuzyil Felsefesi",
      description:
        "15. yuzyil-17. yuzyil felsefesini hazirlayan dusunce ortamini aciklar.",
      details: [
        "a) 12. yuzyildaki ceviri faaliyetlerinin 15. Yuzyil-17. yuzyil felsefesi uzerindeki etkilerine deginilir.",
        "b) MO 6. yuzyil-MS 2. yuzyil ve MS 2. yuzyil-MS 15. yuzyil felsefesinin 15. yuzyil-17. yuzyil felsefesi uzerindeki etkilerine deginilir.",
      ].join("\n"),
    },
    // 11.4.1 - 18-19. yuzyil felsefesini hazirlayan ortam
    {
      code: "11.4.1",
      subTopicName: "18. Yuzyil-19. Yuzyil Felsefesi",
      description:
        "18. yuzyil-19. yuzyil felsefesini hazirlayan dusunce ortamini aciklar.",
      details:
        "15. yuzyil-17. yuzyil felsefesinin 18. yuzyil-19. yuzyil felsefesi uzerindeki etkilerine deginilir.",
    },
    // 11.5.1 - 20. yuzyil felsefesini hazirlayan ortam
    {
      code: "11.5.1",
      subTopicName: "20. Yuzyil Felsefesi",
      description:
        "20. yuzyil felsefesini hazirlayan dusunce ortamini aciklar.",
      details:
        "18. yuzyil-19. yuzyil felsefesinin 20. yuzyil felsefi akimlari uzerindeki etkilerine deginilir.",
    },
    // 11.5.5 - felsefecilerin harita uzerinde gosterimi
    {
      code: "11.5.5",
      subTopicName: "20. Yuzyil Felsefesi",
      description:
        "Harita uzerinde 20 ve 21. yuzyil felsefecilerinin isimlerini ve yasadiklari cografyayi gosterir.",
      details: [
        "a) Felsefeciler ve yasadiklari yerler, Turkiye ve Dunya haritasi uzerinde gosterilir.",
        "b) Felsefecilerin, isimleri ve yasadiklari cografyanin ezberletilmesi yoluna gidilmez.",
      ].join("\n"),
    },
    // 11.2.1 - ortacag felsefe ortami
    {
      code: "11.2.1",
      subTopicName: "MS 2. Yuzyil-MS 15. Yuzyil Felsefesi",
      description:
        "MS 2. yuzyil-MS 15. yuzyil felsefesini hazirlayan dusunce ortamini aciklar.",
      details:
        "MO 6. yuzyil-MS 2. yuzyil felsefesinin MS 2. yuzyil-MS 15. yuzyil felsefesi uzerindeki etkilerine deginilir.",
    },
  ],
};

// =====================================================================
// SEED LOGIGI
// =====================================================================

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  if (!tyt) {
    console.log("TYT exam type bulunamadi, atliyorum.");
    return;
  }

  const felsefeSubject = await prisma.subject.findFirst({
    where: { name: "Felsefe", examTypeId: tyt.id },
  });
  if (!felsefeSubject) {
    console.log("TYT Felsefe subject bulunamadi, atliyorum.");
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
      console.log(`Topic bulunamadi: "${topicName}" -- atlaniyor`);
      continue;
    }

    if (topic._count.kazanimlar > 0) {
      console.log(
        `"${topicName}" zaten ${topic._count.kazanimlar} kazanima sahip, atlaniyor`
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
      `"${topicName}" -> ${kazanimList.length} kazanim eklendi`
    );
  }

  console.log(
    `\nToplam: ${totalCreated} kazanim eklendi, ${totalSkipped} atlandi`
  );
}

main()
  .catch((e) => {
    console.error("seed-tyt-felsefe-kazanim error:", e);
  })
  .finally(() => prisma.$disconnect());
