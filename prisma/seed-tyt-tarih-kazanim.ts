/**
 * TYT Tarih kazanimlarini MEB PDF'den sisteme ekler.
 * Kaynak: MEB Ortaogretim Tarih Dersi (9,10,11. sinif) + T.C. Inkilap Tarihi Ogretim Programi
 *
 * Bu script mevcut konulara kazanim ekler. Mevcut mufredati BOZMAZ.
 * Zaten kazanimi olan topic'leri atlar (idempotent).
 *
 * Calistirmak icin: npx tsx prisma/seed-tyt-tarih-kazanim.ts
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
  // ==================== 9. SINIF TARİH ====================

  "Tarih Bilimine Giriş": [
    {
      code: "9.1.1",
      subTopicName: "Tarih ve Zaman",
      description:
        "Bir arastirma alani ve bilim dali olarak tarihin konusunu, kapsamini ve diger bilim dallariyla iliskisini aciklar.",
      details: [
        "a) Tarihin konusunun zaman icindeki insan faaliyetleri ve bu faaliyetler sonucunda ortaya cikan eserler ve degisimler oldugu belirtilir.",
        "b) Tarih biliminin diger beseri ve sosyal bilimler ile fen bilimlerinden farkliliklarina deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.2",
      subTopicName: "Tarih ve Zaman",
      description: "Tarih ogrenmenin amac ve yararlarini kavrar.",
      details: [
        "a) Ortak hafizanin kimlik olusturma ve toplumsallasmadaki rolu uzerinde durulur.",
        "b) Gunumuzde olup bitenleri anlayabilmek ve gelecek hakkinda gercekci planlamalar yapabilmek icin tarih bilincine sahip olmak gerektigi vurgulanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.1.3",
      subTopicName: "Tarih ve Zaman",
      description:
        "Zamani anlama ve anlamlandirmaya yonelik farkli yaklasimlari analiz eder.",
      details: [
        "a) Farkli toplum ve kulturlerin gecmisin donemlendirilmesinde kendi tarihlerindeki onemli olaylari dikkate aldiklarina deginilir.",
        "b) Farkli takvim sistemlerine (gunes yili ve ay yili esasli takvimler) ve Turklerin kullandigi takvimlere deginilir.",
        "c) Miladi takvim ile hicri takvim arasindaki temel farklar vurgulanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Uygarlığın Doğuşu ve İlk Uygarlıklar": [
    {
      code: "9.2.1",
      subTopicName: "Insanligin Ilk Donemleri",
      description:
        "Kanitlardan yola cikarak yazinin icadindan onceki zamanlarda yasayan insanlarin hayati hakkinda cikarimda bulunur.",
      details: [
        "a) Gobeklitepe, Catalhoyuk ve Cayonu gibi yerlesik hayata ve medeniyete dair en eski yerlesim yerlerinden gunumuze kalan maddi kultur buluntulari incelenir.",
        "b) Yazinin icadindan onceki donemde hakim olan sozlu kultur orneklerine (mitler, kurulus efsaneleri) kisaca deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.2",
      subTopicName: "Insanligin Ilk Donemleri",
      description:
        "Yazinin icadinin insanlik tarihinde meydana getirdigi degisimi fark eder.",
      details: [
        "a) Yazinin kullanilmasinin yonetim isleri ile vergi ve muhasebe kayitlari uzerindeki etkilerine deginilir.",
        "b) Kadim tip, astronomi ve cografya bilimlerinin amac, konu ve yontem acilarindan modern zamandaki bilimlerden ne tur farkliliklara sahip olduguna deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.2.3",
      subTopicName: "Insanligin Ilk Donemleri",
      description:
        "Ilk Cag'da yeryuzundeki belli basi medeniyet havzalarini tanir.",
      details: [
        "a) Ilk Cag medeniyetleriyle ilgili baslica olay ve olgular tarih seridi uzerinde gosterilir.",
        "b) Ilk Cag'in onemli medeniyet havzalari (Cin, Hint, Iran, Anadolu, Mezopotamya, Misir, Dogu Akdeniz, Ege Yunan) ve bunlarin insanliga en onemli katkilari harita uzerinde gosterilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.4",
      subTopicName: "Insanligin Ilk Donemleri",
      description:
        "Ilk Cag'da cografya ve iklimin insanlarin hayat ve gecim tarzlari uzerindeki belirleyici etkisini analiz eder.",
      details: [
        "a) Konar-gocer ve yerlesik hayat tarzlarinin Ilk Cag'dan itibaren birbirlerini tamamlayan ve cografi sartlara bagli olarak tercih edilen hayat tarzlari oldugu vurgulanir.",
        "b) Ilk Cag'da insan topluluklarinin kitlesel goclerinin sebepleri (gecim imkanini kaybetme, iklim degisikligi, politik degisiklikler, inanc nedeniyle baski altina alinma) belli basli tarihi orneklerle ele alinir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.2.5",
      subTopicName: "Insanligin Ilk Donemleri",
      description:
        "Ilk Cag'da siyasi gucun kaynaklarini siyasi organizasyon turleriyle iliskilendirir.",
      details: [
        "a) Ilk Cag'da Asya ve Avrupa'da varligini surduran siyasi organizasyon turleri olarak tiranlik, aristokrasi, monarsi, demokrasi, cumhuriyet ve imparatorluga deginilir.",
        "b) Siyasi gucun mesruiyet kaynaklari ve maddi kaynaklari (cografi yapi, hayat ve gecim tarzi, soy dayanismasi, silahli guc) uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.2.6",
      subTopicName: "Insanligin Ilk Donemleri",
      description:
        "Ilk Cag'da hukuk sistemlerinin olusturulmasinda etkili olan dini ve beseri kaynaklari kavrar.",
      details: [
        "Sozlu ve yazili hukuk kaynaklarina (akil, gelenek ve kutsal kitaplar) iliskin tarihi ornekler (Urkagina ve Hammurabi Kanunlari, Hitit Hukuku ve Tevrat) ele alinir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Eski Türk Tarihi": [
    {
      code: "9.4.1",
      subTopicName: "Ilk ve Orta Caglarda Turk Dunyasi",
      description:
        "Turklerin Asya'da tarih sahnesine ciktiklari ve yasadiklari alanlar ile baslica kultur cevrelerini tanir.",
      details: [
        "a) Turk adinin anlami aciklanarak ilk Turk devletlerinin hakim olduklari alanlar harita uzerinde gosterilir.",
        "b) Ilk Turk devletleriyle ilgili baslica siyasi gelismeler tarih seridi uzerinde gosterilir (Asya Hun, Avrupa Hun, I. ve II. Kok Turk, Uygur devletleri).",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.2",
      subTopicName: "Ilk ve Orta Caglarda Turk Dunyasi",
      description:
        "Ilk ve Orta Caglarda Ic Asya'daki Turk siyasi tesekkullerinin guc ve yonetim yapisini kavrar.",
      details: [
        "a) Asya Hun, Kok Turk ve Uygur Devletleri, gucun mesruiyet kaynagi (Gok Tengri ve Kut inanclari); gucun maddi kaynaklari (cografi yapi, konargocor hayat tarzi, soy dayanismasi ve silahli guc); guc paylasimi ve yonetim organizasyonu (kurultay, ikili teskilat yapisi ve ulus ilkesi) temalari cercevesinde ele alinir.",
        "b) 'Tore'nin Turk toplum yapisi ve hukuk sistemindeki yeri ve onemi vurgulanir. Orhun Kitabelerinden ornekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.3",
      subTopicName: "Ilk ve Orta Caglarda Turk Dunyasi",
      description:
        "Islamiyet oncesi donemde Turklerin yasadigi cografyalar ile hayat tarzlari arasindaki iliskiyi analiz eder.",
      details: [
        "a) Tarima uygun olmayan bozkirf cografyasinin Turk topluluklarini konar-gocer hayat tarzina yonelttigi vurgulanir.",
        "b) Askeri kulturun Turk hayat tarzindaki yeri ve dunya askeri tarihine mal olmus teskilat, techizat ve taktikler (suvarilik, onlu teskilat, ok ve yay, uzengi, Turan taktigi) vurgulanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.4.4",
      subTopicName: "Ilk ve Orta Caglarda Turk Dunyasi",
      description:
        "Kavimler Gocu'nun sebep ve sonuclarini siyasi ve sosyal acilardan analiz eder.",
      details: [
        "a) Kavimler Gocu ile Asya ve Avrupa'daki siyasi yapilarda meydana gelen degisim harita uzerinde gosterilir.",
        "b) Avrupa Hun Devleti'nin kurulusuna ve bu devletin Avrupa'ya etkilerine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.5",
      subTopicName: "Ilk ve Orta Caglarda Turk Dunyasi",
      description:
        "Asya merkezli Turk Devletlerinin cevrelerindeki devletlerle iliskilerinin cok boyutlu yapisini analiz eder.",
      details: [
        "a) Hun, Kok Turk, Uygur ve Hazar siyasi tesekkullerinin Cin, Sasani ve Bizans Devletleri ile iliskilerinden hareketle konar-gocer ve yerlesik topluluklar arasindaki iliskilerin catisma ve uzlasma eksenli olarak askeri ve ekonomik boyutlarda gerceklestigi vurgulanir.",
        "b) Hun, Kok Turk, Uygur ve Hazar siyasi tesekkullerinin hakimiyetleri altindaki topraklarda ticareti canlandirmaya yonelik politikalari ile bu politikalarin gerekceleri uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "İslam Tarihi": [
    {
      code: "9.5.1",
      subTopicName: "Islam Medeniyetinin Dogusu",
      description:
        "Islamiyet'in ortaya ciktigi ve yayildigi donemlerdeki baslica siyasi ve sosyal gelismeleri aciklar.",
      details: [
        "a) Islamiyet'in ortaya ciktigi ve yayildigi donemlerdeki baslica siyasi ve sosyal gelismeler tarih seridi ve haritalar uzerinde gosterilir.",
        "b) Hz. Muhammed'in peygamberliginin oncesinde Mekke'deki ve Arap Yarimadasi'nin geri kalan kismindaki siyasi durum ve toplumsal duzen ana hatlariyla ele alinir. 'Cahiliye Donemi' kavrami toplum duzeni acisindan aciklanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.5.2",
      subTopicName: "Islam Medeniyetinin Dogusu",
      description:
        "Hz. Muhammed ve Dort Halife Donemi'nde Muslumanlarin Arap Yarimadasi ve cevresinde siyasi hakimiyet kurmaya yonelik faaliyetlerini kavrar.",
      details: [
        "a) Hz. Muhammed Donemi'nde Muslumanlarin kendilerini korumak ve Islam'i yaymak uzere gerceklestirdikleri muharebelere deginilir.",
        "b) Medine Sozlesmesi'nin ongordudu toplum duzeni ve ilk kurumsal yapilanmalar (egitim, idare, guvenlik ve yargi) ele alinir.",
        "c) Dort Halife Donemi'nde Islam toplumunun idaresi, sinirlarin genislemesi ve ihtidalar uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.5.3",
      subTopicName: "Islam Medeniyetinin Dogusu",
      description:
        "Emeviler ile birlikte Islam Devleti'nin yapisinda meydana gelen degisimi analiz eder.",
      details: [
        "a) Emeviler Donemi'nde hilafetin saltanata donustugu ve Arap olmayan unsurlarin (mevali) devlet idaresi ve sosyal yasamda bazi haklardan mahrum birakildiklari vurgulanir.",
        "b) Emeviler Donemi'nde inanc ve siyaset iliskisi ile keskinlesmeye baslayan mezhebi yonelimler ele alinir.",
        "c) Emeviler Donemi'nde Islamiyet'in Kuzey Afrika ve Avrupa'daki yayilisina ve Islam kulturunun Avrupa'ya etkilerine deginilir. Endulus'teki dusunce ve kultur dunyasi ozellikle vurgulanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.5.4",
      subTopicName: "Islam Medeniyetinin Dogusu",
      description:
        "Turklerin Abbasi Devleti'ndeki askeri ve siyasi gelismelerde oynadiklari rolleri kavrar.",
      details: [
        "a) Abbasiler Donemi'ndeki baslica siyasi ve sosyal gelismelere kisaca deginilir.",
        "b) Halife Me'mun ve Mu'tasim Donemlerinde Turk asker ve devlet gorevlilerinin Abbasi devlet yonetiminde artan etkisi ve bu durumun sonuclari aciklanir.",
        "c) Islam hakimiyetinin Afrika'daki genislemesinden hareketle Tolunogullari (868-905), Ihsidiler (935-969), Eyyubiler (1174-1250) ve Memluk Devleti (1250-1517) one cikan ozellikleryle kisaca ele alinir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.5.5",
      subTopicName: "Islam Medeniyetinin Dogusu",
      description:
        "Sekizinci ve on ikinci yuzyillar arasinda Islam medeniyeti cercevesindeki ilmi faaliyetleri degerlendirir.",
      details: [
        "a) Islam medeniyetinin ilim ve egitim kurumlari (Beytu'l-hikme, medreseler, camiler ve kutuphaneler) kisaca tanitilir.",
        "b) Islam medeniyetinde kabul gormus dini (nakli) ve akli ilimler ayrimi uzerinde durulur.",
        "c) Islam alimlerinin nazari (teorik) ve butuncul bir perspektifle kisinin kendini, alemi ve Allah'i tanimasi maksadi guden bir ilim anlayisina sahip olduklari vurgulanir.",
        "d) Islam dunyasinda ortaya cikan bilimsel gelismelere ve bu gelismelerin Avrupa'ya etkilerine kisaca deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Türk-İslam Devletleri (10-13. yüzyıllar)": [
    {
      code: "9.6.1",
      subTopicName: "Turklerin Islamiyet'i Kabulu",
      description:
        "Turklerin Islamiyet'i kabul etmeye baslamalari ile Turkiye Selcuklu Devleti'nin kurulusu arasindaki surecter meydana gelen baslica siyasi gelismeleri gosterir.",
      details: [
        "Baslica siyasi gelismeler olarak Talas Savasi (751), Karahanli Devleti'nin kurulmasi (840), Gazneli Devleti'nin kurulmasi (963), Buyuk Selcuklu Devleti'nin kurulmasi (1040), Dandakan Savasi, Pasinler ve Malazgirt Muharebeleri, Turkiye Selcuklu Devleti'nin kurulmasi (1077) tarih seridi uzerinde verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.6.2",
      subTopicName: "Turklerin Islamiyet'i Kabulu",
      description:
        "Turklerin Islamiyet'i kabul etme surecine etki eden faktorleri aciklar.",
      details: [
        "a) Turk topluluklarinin Islamiyet'i kabullerinin bir anda ve toplu olarak degil asamali olarak ve farkli tarihlerde gerceklestigi vurgulanir.",
        "b) Acemler, Berberiler ve Kurtlerin Islam dinini kabul etme sureclerine kisaca deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.6.3",
      subTopicName: "Turklerin Islamiyet'i Kabulu",
      description:
        "Karahanli ve Gazneli orneklerinden hareketle Islamiyet'in kabulunun Turk devlet yapisi ve toplumsal hayatta meydana getirdigi degisimleri analiz eder.",
      details: [
        "Donemin yazili eserleri 'Kutadgu Bilig', 'Divanu Lugati't-Turk', 'Atabetu'l-Hakayik' ve 'Divan-i Hikmet'e kisaca deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.6.4",
      subTopicName: "Turklerin Islamiyet'i Kabulu",
      description:
        "Buyuk Selcuklu Devleti Donemi'ndeki baslica siyasi gelismeleri Turk tarihi icerisindeki onemi baglaminda aciklar.",
      details: [
        "a) Oguz Turklerinin Islamiyet'i kabul etmelerinin Turk ve Islam tarihinde meydana getirdigi siyasi, sosyal ve kulturel etkilere deginilir.",
        "b) Dandanakan, Pasinler ve Malazgirt Muharebelerinin sebep ve sonuclari kisaca ele alinir.",
        "c) Buyuk Selcuklu Devleti'nin Tugrul Bey Donemi'nde Islam dunyasinda koruyucu rol ustlendigine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.6.5",
      subTopicName: "Turklerin Islamiyet'i Kabulu",
      description:
        "Buyuk Selcuklu Devleti'nin yonetim ve toplum yapisini kavrar.",
      details: [
        "a) Buyuk Selcuklu Devleti'nin guc ve yonetim yapisi; gucun mesruiyet kaynagi, gucun maddi kaynaklari, guc paylasimi ve yonetim organizasyonu temalari cercevesinde ele alinir.",
        "b) Iran ve Turk devlet geleneklerine ait unsurlarin Buyuk Selcuklu devlet teskilatinda birlikte yer aldigi vurgulanir.",
        "c) Nizamulmulk'un 'Siyasetname' adli eseri incelenir. Nizamiye Medreseleri yapilanmasi ve Gazali'nin bu medreselere etkisine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== 10. SINIF TARİH ====================

  "Türkiye Tarihi (11-13. yüzyıllar)": [
    {
      code: "10.1.1",
      subTopicName: "Yerlesme ve Devletlesme",
      description:
        "Turklerin Anadolu'ya yerlesmeye baslamasi ile Turkiye Selcuklu Devleti'nin yikilisi arasindaki surecter meydana gelen baslica siyasi gelismeleri gosterir.",
      details: [
        "Saltuklular, Danismentliler, Mengucekliler, Caka Beyligi, Turkiye Selcuklu Devleti, Artuklu Beyligi'nin kuruluslari, Hacli Seferleri, Mogol Istilasi, Kosedap Muharebesi, Memluklu Devleti'nin kurulmasi, Turkceyi resmi dil ilan etme gibi gelismeler tarih seridi uzerinde verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2",
      subTopicName: "Yerlesme ve Devletlesme",
      description:
        "Anadolu'ya yapilan Turk goclerinin sosyokulturel etkilerini analiz eder.",
      details: [
        "a) Oguz goclerinin Anadolu'da yerlesmeyi kolaylastiran nedenler kisaca aciklanir.",
        "b) Turkiye isminin dogusu aciklanir. Ogrencilerin Anadolu'nun Turkiye olarak adlandirilmasinin nedenleri ile ilgili cikarimda bulunmalari saglanir.",
        "c) Ogrencilerin Anadolu ile birlikte Irak ve Suriye bolgesine yapilan goclerin bu bolgelerde gunumuze kadar devam eden Turkmen varligina etkilerini analiz etmeleri saglanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.1.3",
      subTopicName: "Yerlesme ve Devletlesme",
      description:
        "Anadolu'daki ilk Turk siyasi tesekkullerinin birbirleriyle ve cevre devletlerle olan iliskilerini uzlasma ve catisma baglaminda degerlendirir.",
      details: [
        "a) Anadolu'da kurulan ilk Turk beyliklerinin birbirleriyle ve cevre devletlerle olan iliskilerine deginilir.",
        "b) Turkiye Selcuklu Devleti'nin teskilat yapisi ile sosyokulturel ozelliklerine ana hatlariyla deginilir.",
        "c) Turkiye Selcuklu Devleti'nin Bizans ile mucadeleleri cercevesinde Miryokefalon Muharebesi'ne deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.1.4",
      subTopicName: "Yerlesme ve Devletlesme",
      description:
        "Islam dunyasinin korunmasi baglaminda Turkiye Selcuklu Devleti ve Eyyubi Devleti'nin Haclilarla yaptiklari mucadelelerin sosyokulturel etkilerini analiz eder.",
      details: [
        "a) Hacli Seferleri'nin guzergahi harita/haritalar uzerinde gosterilir.",
        "b) Hacli Seferleri'nin sebeplerine, taraflarina, katilanlarina deginilir.",
        "c) Ogrencilerin Hacli Seferleri'nin Avrupa'daki siyasi, sosyal ve ekonomik acidan donusturucu etkisini analiz etmeleri saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.5",
      subTopicName: "Yerlesme ve Devletlesme",
      description:
        "Mogol Istilasi'nin Anadolu'da meydana getirdigi siyasi ve sosyal degisimi analiz eder.",
      details: [
        "Babailer Isyani'na, Mogol Istilasi'nin onunu acmasi baglaminda deginilerek Kosedap Muharebesi'nden sonra Anadolu'da Ikinci Beylikler Donemi'nin ortaya cikmasi kisaca aciklanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Beylikten Devlete (1300-1453)": [
    {
      code: "10.2.1",
      subTopicName: "Beylikten Devlete Osmanli Siyaseti",
      description:
        "1302-1453 yillari arasindaki surecte meydana gelen baslica siyasi gelismeleri tarih seridi ve haritalar uzerinde gosterir.",
      details: [
        "Koyunhisar Muharebesi (1302), Bursa'nin Fethi (1326), Iznik'in Fethi (1331), Izmit'in Fethi (1337), I. Kosova Muharebesi (1389), Nigbolu Muharebesi (1396), Ankara Savasi (1402), Fetret Devri (1402-1413), Varna Muharebesi (1444), II. Kosova Muharebesi (1448) gibi gelismeler tarih seridi uzerinde verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.2",
      subTopicName: "Beylikten Devlete Osmanli Siyaseti",
      description:
        "Osmanli Beyligi'nin devletlesme surecini Bizans'la olan iliskileri cercevesinde analiz eder.",
      details: [
        "a) XIII. yuzyilin sonlarinda Anadolu cevresindeki jeopolitik durum aciklanarak Osmanli Beyligi'nin kurulusuna deginilir.",
        "b) Ogrencilerin Osmanli Beyligi'nin sinirlarinin genislemesinin farkli fetih yontemleri ve politikalar (Turkmen gocleri ve gaza siyaseti) izlenerek uzun surede nasil gerceklestigini analiz etmeleri saglanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.2.3",
      subTopicName: "Beylikten Devlete Osmanli Siyaseti",
      description:
        "Rumeli'deki fetihler ile iskan (senlendirme) ve istimalet politikalarinin amaclarini ve etkilerini analiz eder.",
      details: [
        "a) Osmanli'nin Anadolu'ya nispeten Rumeli'de daha hizli hakimiyet kurmasinda Balkanlar'daki topluluklarin yasadigi ic cekismelerin etkisi ile Osmanli idaresinin gayrimuslimlere sundugu imkanlara deginilir.",
        "b) Rumeli'deki fetihlerin kalici olmasinda rol oynayan demografik guclerin (dervisler, asiretler, akinci uc beyleri) ve iskan politikasinin onemine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.4",
      subTopicName: "Beylikten Devlete Osmanli Siyaseti",
      description:
        "Osmanli Devleti'nin Anadolu'da Turk siyasi birligini saglamaya yonelik faaliyetlerini ve sonuclarini analiz eder.",
      details: [
        "a) Osmanli Devleti'nin beyliklere yonelik politikalarindaki degisime deginilir.",
        "b) Turk dunyasindaki liderlik mucadelesini Yildirim Bayezid ve Timur ornegi uzerinden ele alarak bu mucadelenin Anadolu'daki yansimalarini sebep ve etki acisindan analiz etmeleri saglanir.",
        "c) Fetret Devri'ne ve Osmanli siyasi birliginin yeniden saglanmasina deginilir.",
        "d) Osmanli Devleti'nin ilk donemlerinden itibaren Turkceyi resmi yazisma dili olarak kullandigi ve bilim dili haline getirdigi vurgulanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Dünya Gücü Osmanlı Devleti (1453-1600)": [
    {
      code: "10.5.1",
      subTopicName: "Dunya Gucu Osmanli (1453-1595)",
      description:
        "1453-1520 yillari arasindaki surecte meydana gelen baslica siyasi gelismeleri tarih seridi ve haritalar uzerinde gosterir.",
      details: [
        "Istanbul'un Fethi (1453), Sirbistan'in alinmasi (1454), Amasra'nin alinmasi (1459), Mora'nin alinmasi (1460), Sinop ve Trabzon'un alinmasi (1461), Eflak'in alinmasi (1462), Bosna ve Hersek'in alinmasi (1463), Venedik ile mucadele (1463-1479), Otlukbeli Muharebesi (1473), Karamanoglu Beyligi'ne son verilmesi (1474), Kirim'in Fethi (1475), Bogdan'in alinmasi (1476), Arnavutluk'un alinmasi (1479), Italya Seferi (1480), Cem Sultan Olayi (1481-1495), Ispanya'daki Muslumanlarin ve Yahudilerin kurtarilmasi (1492), Caldiran Muharebesi (1514), Mercidabik Muharebesi (1516) ve Ridaniye Muharebesi (1517) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.2",
      subTopicName: "Dunya Gucu Osmanli (1453-1595)",
      description:
        "Istanbul'un fetih surecini sebepleri ve stratejik sonuclari acisindan analiz eder.",
      details: [
        "a) Osmanli Devleti'nin kurumsallasmasi (idari, kulturel ve demografik boyutlar) ve Istanbul'un Fethi'nin oynadigi role iliskin cikarimda bulunmalari saglanir.",
        "b) Istanbul'un Fethi'nin bolgesel ve kuresel yansimalarina deginilir.",
        "c) II. Mehmet'in kara ve denizlerdeki fetihlerinin stratejik onemine deginilir.",
        "d) II. Mehmet'in karakteri, vizyonu, ilme verdigi onem vurgulanarak fethin gerceklesmesinde onun kisisel ozelliklerinin etkisine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.3",
      subTopicName: "Dunya Gucu Osmanli (1453-1595)",
      description:
        "Osmanli Devleti'nin Islam cografyasinda hakimiyet kurmasinin Turk ve Islam dunyasi uzerindeki etkilerini analiz eder.",
      details:
        "I. Selim Donemi'nde Osmanli-Iran ve Osmanli-Memluk iliskilerine, Turk ve Islam dunyasinda liderlik mucadelesi baglaminda deginilir.",
      isKeyKazanim: false,
    },
    {
      code: "10.5.4",
      subTopicName: "Dunya Gucu Osmanli (1453-1595)",
      description:
        "1520-1595 yillari arasindaki surecte meydana gelen baslica siyasi gelismeleri tarih seridi ve haritalar uzerinde gosterir.",
      details: [
        "Belgrad'in Fethi (1521), Rodos'un Fethi (1522), Mohac Muharebesi (1526), I. Viyana Kusatmasi (1529), Istanbul Antlasmasi (1533), Cezayir'in alinmasi (1533), Preveze Deniz Savasi (1538), Hint Deniz Seferleri (1538-1553), Tebriz'in alinmasi (1548), Trablusgarp'in Fethi (1551), Nahcivan'in alinmasi (1553), Sudan'in Kizildeniz sahilinde Sevakin Adasi merkezli Habes Eyaleti'nin kurulmasi (1555), Zigetvar Seferi (1566), Yemen'in alinmasi (1568), Kibris'in Fethi (1571), Inebahti Deniz Savasi (1571), Tunus'un Fethi (1574) ve Fas'ta Osmanli hakimiyetinin kurulmasi (1578) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.5",
      subTopicName: "Dunya Gucu Osmanli (1453-1595)",
      description:
        "Kanuni Donemi'nden itibaren Osmanli Devleti'nin eristigi olgunlugu siyasi sinirlar ve devlet teskilati acisindan aciklar.",
      details:
        "Osmanli Devleti'nin hakimiyet alanini genisletme cabalari baglaminda Habsburglar ve Safevilerle olan iliskileri kisaca ele alinir.",
      isKeyKazanim: false,
    },
    {
      code: "10.5.6",
      subTopicName: "Dunya Gucu Osmanli (1453-1595)",
      description:
        "Uyguladigi uzun vadeli stratejinin Osmanli Devleti'nin dunya gucu haline gelmesindeki rolunu analiz eder.",
      details: [
        "a) Osmanli Devleti'nin XV ve XVI. yuzyillardaki stratejik rakiplerine (Venedik, Ceneviz, Portekiz, Ispanya, Habsburglar, Safeviler, Memlukler) karsi uyguladigi uzun vadeli politikalar ve kurdugu stratejik ortakliklara deginilir.",
        "b) Osmanli Devleti'nin batidaki ilerleyisi karsisinda Avrupa'da olusan Turk algisini sebep ve etki acisindan analiz etmeleri saglanir.",
        "c) Osmanli'nin XV ve XVI. yuzyillarda izledigi siyasetin uzun vadeli etkilerine (Roma Katolik Kilisesi'ne karsi Ortodokslugun ve Protestanligin himaye edilmesi, Avrupa monarsilerinin varliklarini devam ettirmeleri (Fransa, Ingiltere ve Hollanda), Afrika'daki Muslumanlarin himaye edilmesi) deginilir.",
        "d) Osmanli Devleti'nin uyguladigi ekonomi politikalarindan ticaret yollarinin kontrolu ve kapitulasyonlara deginilerek bunlar uzerinden kurulan uzun vadeli stratejik ortakliklara vurgu yapilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.7",
      subTopicName: "Dunya Gucu Osmanli (1453-1595)",
      description:
        "Osmanli Devleti'nin takip ettigi kara ve deniz politikalarini analiz eder.",
      details: [
        "a) Osmanli Devleti'nin oncelikli olarak bir kita (kara) gucu oldugu vurgulanir ve donemin diger buyuk kita guclerine kisaca deginilir.",
        "b) Osmanli Devleti'nin denizlerde yaptigi fetihlerin Akdeniz hakimiyetine etkisini ve bu baglamda Kibris'taki Turk varliginin tarihsel onemini analiz etmeleri saglanir.",
        "c) Cografi Kesifler'e ve sonrasinda Asya, Afrika ve Amerika kitalarinda yasanan katlimlara ve bu bolgelerin zenginliklerinin Avrupa'ya tasinmasina deginilir.",
        "d) Cografi Kesifler'in Osmanli Devleti'nin Akdeniz'deki hakimiyetinde meydana getirdigi degisimler ile okyanus guclerinin Akdeniz'e nufuz etme cabalarina deginilir.",
        "e) Osmanli Devleti'nin stratejik amacli olarak Akdeniz disina yonelme cabalari baglaminda Hint Deniz Seferleri'ne deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Yeniçağ Avrupası (1453-1789)": [
    {
      code: "9.3.1",
      subTopicName: "Orta Cag'da Dunya",
      description:
        "Orta Cag'da yeryuzunun cesitli bolgelerinde kurulan siyasi ve sosyal yapilari tanir.",
      details: [
        "a) Orta Cag'daki baslica siyasi gelismeler tarih seridi uzerinde gosterilir.",
        "b) Orta Cag'in cesitli donemlerinde ortaya cikmis/kurulmus olan belli basli siyasi yapilar haritalar uzerinde gosterilir.",
        "c) Orta Cag'daki siyasi yapilar arasindaki farkliliklar vurgulanarak gucun mesruiyet kaynagi ve maddi kaynaklari (cografi yapi, hayat ve gecim tarzi, soy dayanismasi ve silahli guc) cercevesinde ele alinir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.3.2",
      subTopicName: "Orta Cag'da Dunya",
      description:
        "Orta Cag'da tarim ve ticaretin yaygin ekonomik faaliyetler olduklarini kavrar.",
      details: [
        "a) Tarima dayali ekonomilerde arti urunun bolusumu ile toprak mulkiyeti ve vergilendirmenin siyasi ve sosyal organizasyonlarin olusmasindaki islevleri ele alinir.",
        "b) Orta Cag'da Asya ve Avrupa arasindaki ticarete konu olan mallara, nakliye araclarina, ticaret mekanlarina (arasta, bedesten, han, kapan, ribat, kervansaray, pazar, liman, panayir) ve madeni paralara deginilir.",
        "c) Kral Yolu, Ipek Yolu, Kurk Yolu ve Baharat Yolu'nun dunya ticaretindeki rollerine ve bunlara hakim olma mucadelelerinin gerekceleri vurgulanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.1",
      subTopicName: "Savascilar ve Askerler",
      description:
        "Kurulus Donemi'nde Osmanli askeri gucunu olusturan farkli muharip unsurlarini aciklar.",
      details: [
        "a) Bir devlete bagli olmayan savasci topluluklar (asiret savascilari, ucretli savascilar, inanc ve din ugruna savasanlar) ile devlet askerleri arasindaki farklar kisaca aciklanarak Turk tarihindeki 'alpilik' ve 'gazilik' kavramlarina deginilir.",
        "b) Diger Turk beylik ve devletlerinin aksine erken tarihte asiretten duzenli birliklere gecen Osmanli'nin ilk donem askeri teskilatina deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.3.2",
      subTopicName: "Savascilar ve Askerler",
      description:
        "Timar sisteminin ozelliklerini siyasi, sosyal ve ekonomik acilardan degerlendirir.",
      details: [
        "Timar Sistemi'nin siyasi, sosyal ve ekonomik yonleri kisaca aciklanarak bu sistemin Osmanli savas organizasyonundaki rolu vurgulanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.3.3",
      subTopicName: "Savascilar ve Askerler",
      description:
        "Yeniceri Ocagi'nin ve devsirme sisteminin Osmanli devletlesme surecine etkisini analiz eder.",
      details: [
        "a) Kapikulu Ocagi ile devsirme sisteminin koklerine ve ortaya cikis surecine deginilerek bunlarin merkezi devlet yapisinin guclenmesindeki rolleri vurgulanir.",
        "b) Yeniceri Ocagi ile birlikte profesyonel askerligin baslamasinin Osmanli Devleti'ni askeri teskilat ve guc bakimindan donemin diger Turk ve Avrupa devletlerinden ayristirdigina deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Osmanlı Kültür ve Medeniyeti": [
    {
      code: "10.4.1",
      subTopicName: "Beylikten Devlete Osmanli Medeniyeti",
      description:
        "Sufilerin ve alimlerin ogretilerinin Anadolu'nun Islamlasmasina ve sosyal huzurun yeniden saglanmasina etkisini aciklar.",
      details: [
        "Ogrencilerin Anadolu'nun Islamlasmasina ve sosyal huzurun yeniden saglanmasina etkisi baglaminda baslica Turk alim ve mutasavviflarin (Ahmet Yesevi, Ahi Evran, Mevlana Celaleddin-i Rumi, Haci Bektas-i Veli, Yunus Emre, Haci Bayram-i Veli) temel ogretilerini arastirip sonuclarini paylasmasi saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.4.2",
      subTopicName: "Beylikten Devlete Osmanli Medeniyeti",
      description:
        "Osmanli devlet idaresinin ilmiye, kalemiye ve seyfiye siniflarinin birliktelgine dayali yapisini analiz eder.",
      details: [
        "Osmanli toplum duzenindeki askeri (vergi vermeyen) - reaya (vergi odeyen) ayrimina deginilerek ilmiye, kalemiye ve seyfiye siniflarinin ana hatlariyla aciklanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.4.3",
      subTopicName: "Beylikten Devlete Osmanli Medeniyeti",
      description:
        "Osmanli cografyasindaki bilim, kultur, sanat ve zanaat faaliyetleri ile bunlara bagli olarak sosyal hayatta meydana gelen degisimleri analiz eder.",
      details: [
        "a) Turk dunyasinda yetismis olan bilim insanlarina (Aksemseddin, Ali Kuscu ve Ulug Bey) ve calismarina deginilir.",
        "b) Ahsap ve tas islemeciligi, dokumacillik, cinicilik, hat ve ebru sanatlarina deginilir.",
        "c) Sozlu halk kulturu ile saray cevresi ve belirli sehirlerde olusan kitabi kultur ana hatlariyla ele alinir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.6.1",
      subTopicName: "Sultan ve Osmanli Merkez Teskilati",
      description:
        "Topkapi Sarayi'nin devlet idaresinin yani sira devlet adami yetistirilmesinde ve sehir kulturunun gelismesindeki rollerini analiz eder.",
      details: [
        "a) Divan-i Humayun ve Enderun'a deginilerek Topkapi Sarayi'nin devlet idaresi ve devlet adami yetistirilmesinin merkezi oldugu vurgulanir.",
        "b) Ogrencilerin Topkapi Sarayi'na gezi/sanal gezi yapmalari ve Topkapi Sarayi'nin Osmanli medeniyetine etkisine kanit gosteren tanitim rehberi hazirlamalari saglanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.6.2",
      subTopicName: "Sultan ve Osmanli Merkez Teskilati",
      description:
        "Osmanli Devleti'nde merkezi otoriteyi guclendirmeye yonelik duzenlemeleri analiz eder.",
      details: [
        "Turklerde belirgin bir veraset sisteminin olmamasina, Fatih Kanunnamesi ile padisaha kendi oz kardesini devletin bekasi icin katletme izninin verilmesine, musadere sistemi ve sehzadelerin yetistirilme usulune kisaca deginilerek bunlarin Osmanli devlet yonetimine etkisi vurgulanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.7.1",
      subTopicName: "Klasik Cagda Osmanli Toplum Duzeni",
      description:
        "Osmanli Devleti'nde millet sisteminin yapisini analiz eder.",
      details: [
        "Ummet ve millet kavramlarina deginilerek farkli dini ve kulturel kimliklere sahip toplum kesimlerini idare etmenin millet sistemi sayesinde mumkun oldugu vurgulanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.2",
      subTopicName: "Klasik Cagda Osmanli Toplum Duzeni",
      description:
        "Osmanli Devleti'nin fethettigi yerlesimy yerlerinin Islam kulturu etkisiyle gecirdigi donusumu analiz eder.",
      details: [
        "a) Fethedilen bolgelerdeki gayrimuslimlerin yasadiklari toplumsal degisimi analiz etmeleri saglanir.",
        "b) Osmanli sehirlerindeki mahalle merkezli sosyal hayat unsurlarina (panayir ve senlikler, dini torenlerin gunluk hayata yansimalari) deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.3",
      subTopicName: "Klasik Cagda Osmanli Toplum Duzeni",
      description:
        "Osmanli ekonomik sistemi icerisinde tarimsal uretimin onemini aciklar.",
      details: [
        "Osmanli Devleti'nde devletin toprak uzerindeki mulkiyeti ve ciftane sisteminin, zirai uretimin surdurmesindeki rolune deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.4",
      subTopicName: "Klasik Cagda Osmanli Toplum Duzeni",
      description:
        "Lonca Teskilati'nin Osmanli ekonomik sistemi ve toplum yapisindaki yerini analiz eder.",
      details: [
        "a) Loncalarin toplumsal hayat ve mesleki egitimdeki yerine deginilerek Osmanli sehirlerindeki baslica meslek gruplari kisaca ele alinir.",
        "b) Osmanli ekonomik sistemi icerisindeki baslica ticaret mekanlarini (liman, kervansaray, pazar yeri, bedesten ve kapan) ve Osmanli yonetiminin tuketici ve ureticiyi korumak icin uyguladi yontemlere (narh, denetim ve ihracat yasaklari) deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.5",
      subTopicName: "Klasik Cagda Osmanli Toplum Duzeni",
      description:
        "Osmanli Devleti'nde vakiflarin sosyal hayattaki yerini ve onemini aciklar.",
      details: [
        "a) Vakiflarin sosyal hayatta ustlendigi rollere (imar faaliyetleri, dini ve sosyo-ekonomik hizmetler) deginilerek faaliyet alanlarinin cesitliligini vakfiye ornekleri uzerinden kisaca ele alinir.",
        "b) Ogrencilerin vakif sistemine yonelik gecmisteki ve gunumuzdeki uygulamalarin benzer ve farkli yonlerini karsilastirmalari saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== 11. SINIF TARİH ====================

  "Arayış Yılları (17. yüzyıl)": [
    {
      code: "11.1.1",
      subTopicName: "Degisen Dunya Dengeleri (1595-1774)",
      description:
        "1595-1700 yillari arasindaki surecte meydana gelen baslica siyasi gelismeleri tarih seridi ve haritalar uzerinde gosterir.",
      details: [
        "Hacova Muharebesi (1596), Zitvatorok Antlasmasi (1606), Kasr-i Sirin Antlasmasi (1639), Girit'in Fethi (1669), Bucas Antlasmasi (1672), II. Viyana Kusatmasi (1683), Karlofca Antlasmasi (1699) ve Istanbul Antlasmasi (1700) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.2",
      subTopicName: "Degisen Dunya Dengeleri (1595-1774)",
      description:
        "XVII. yuzyilda degisen siyasi rekabet icerisinde Osmanli Devleti'nin izledigi politikalari aciklar.",
      details: [
        "a) Avusturya'yla yapilan Zitvatorok Antlasmasi ile Avrupa diplomasisinde mutekabiliyet esasinin kabul edildigi vurgulanir.",
        "b) Osmanli Devleti'nin Kazak meselesinden dolayi kuzeye yonelme politikasina (Hotin-Kamanice ve Cehrin seferleri) deginilir.",
        "c) Kasr-i Sirin Antlasmasi ile Osmanli Devleti'nin dogu sinirinin buyuk olcude belirlendigine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.3",
      subTopicName: "Degisen Dunya Dengeleri (1595-1774)",
      description:
        "Denizcilik faaliyetlerinin icdenizlerden okyanusLara tasinmasinin dunya siyasetine ve ticaretine etkilerini analiz eder.",
      details: [
        "a) Avrupali guclerin degisen denizcilik stratejilerini, kuresel (askeri ve ekonomik) faaliyetlerini ve uyguladiklari somurgeciliginin etkilerini analiz etmeleri saglanir.",
        "b) Osmanli Devleti'nin Akdeniz ve Karadeniz hakimiyetinin zayiflamasinin sebepleri uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.1.4",
      subTopicName: "Degisen Dunya Dengeleri (1595-1774)",
      description:
        "1700-1774 yillari arasindaki surecte Osmanli Devleti'nin diger devletlerle yuruttuugu rekabeti ve bu rekabette uyguladigi stratejileri analiz eder.",
      details: [
        "a) Prut Antlasmasi (1711), Pasarofca Antlasmasi (1718), Patrona Halil Isyani (1730), Belgrat Antlasmasi (1739), Kapitulasyonlarin surekli hale gelmesi (1740), Cesme Baskini (1770) ve Kucuk Kaynarca Antlasmasi (1774) verilir.",
        "b) Osmanli Devleti'nin Karlofca Antlasmasi'yla kaybettigi topraklari geri alma stratejisine deginilir.",
        "c) 1768-1774 Osmanli-Rus Savasi sebep ve sonuclari bakimindan ele alinir. Kirim'in kaybedilmesini tarihsel onem acisindan analiz etmeleri saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "18. Yüzyılda Değişim ve Diplomasi": [
    {
      code: "11.2.1",
      subTopicName: "Degisim Caginda Avrupa ve Osmanli",
      description:
        "Avrupa dusuncesinde meydana gelen degisimleri ve bunlarin etkilerini analiz eder.",
      details: [
        "a) Roma Katolik Kilisesi'nin kurdugu baskiya karsi gelisen fikri-manevi (Ronesans-Reform, sekularlesme), sosyal ve ekonomik (merkantilizm ve burjuva sinifinin guclenmesi) degisimler ana hatlariyla ele alinir.",
        "b) Modern devletler hukukunun ortaya cikmasi surecinde Vestfalya Barisi'ni sebep ve etki acisindan analiz etmeleri saglanir.",
        "c) Bilim Devrimi'nin Avrupa'da meydana getirdigi degisime deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.2",
      subTopicName: "Degisim Caginda Avrupa ve Osmanli",
      description:
        "Avrupa'daki gelismelere bagli olarak Osmanli idari, askeri ve ekonomik yapisinda meydana gelen degisimleri analiz eder.",
      details: [
        "a) Cografi Kesifler'in ardinda Avrupa'ya ve dunyaya yayilan degerli madenlerin ortaya cikardigi ekonomik degisimin Osmanli cografyasinda enflasyona yol actigi vurgulanir.",
        "b) Kapitulasyonlarin surekli hale gelmesinin Osmanli ekonomisine etkisine deginilir.",
        "c) Merkantilist ekonomi ve Askeri Devrim'in Osmanli Devleti'nin toprak duzeninde ve buna bagli savas organizasyonunda yol actigi zorunlu donusumler kisaca aciklanir.",
        "d) Osmanli Devleti'nde artan savas finansmanini karsilamak icin alinan tedbirlere (vergilerin arttirilmasi, iltizam ve malikane sistemleri ve olaganustu savas vergileri) deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.3",
      subTopicName: "Degisim Caginda Avrupa ve Osmanli",
      description:
        "Osmanli devlet idaresi ve toplum duzenindeki cozumlemeleri onleme cabalarini analiz eder.",
      details: [
        "a) XVII. ve XVIII. yuzyillarda gerceklesen isyanlar (Celali ve Yeniceri isyanlari) kisaca ele alinir.",
        "b) Ic siyasi karisikliklara engel olmak amaciyla Ekber ve Ersed Sistemi'nin ihdas edildigine deginilir.",
        "c) Layihalarda sunulan cozum onerilerine Koci Bey Risalesi ornegi uzerinden deginilir.",
        "d) Avrupa'da matbaanin kullanilmaya baslanmasinin bilginin uretimine ve bilgiye erisim alanlarinda sagladigi imkanlara temas edilerek Osmanli Devleti'nde Musluman ve gayrimuslimlerin matbaayi kullanmaya baslama sureclerine deginilir.",
        "e) Donemin ilim ve irfan gelenegini canlandiran kisilerden (Evliya Celebi, Katip Celebi vb.) birine dair cikarimda bulunmalari saglanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Yakınçağ Avrupası (1789...)": [
    {
      code: "11.3.1",
      subTopicName: "Devrimler Caginda Devlet-Toplum Iliskileri",
      description:
        "Fransiz Ihtilali ve Avrupa'da Sanayi Devrimi ile birlikte devlet-toplum iliskilerinde meydana gelen donusumu aciklar.",
      details: [
        "a) Fransiz Ihtilali'ne giden surec ve ihtilalin sonuclari ana hatlariyla aciklanir.",
        "b) Fransiz Ihtilali ile ortaya cikan fikir akimlarinin; imparatorluklarin (Avusturya-Macaristan, Rusya ve Osmanli) siyasi hayatlarina etkilerine iliskin orneklere deginilir.",
        "c) Geleneksel uretim tarzi ile endustriyel uretim tarzi arasindaki farklara deginilir.",
        "d) Avrupa'da Sanayi Inklabi sonrasinda belirginlesen sinifli toplum yapisinin mutlakiyetci monarsilerin anayasal monarsilere donusmesi uzerindeki etkisine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.3.2",
      subTopicName: "Devrimler Caginda Devlet-Toplum Iliskileri",
      description:
        "Sanayi Inklabi sonrasi Avrupalilarin giristigi sistemli somurgecilik faaliyetleri ile kuresel etkilerini analiz eder.",
      details: [
        "Ogrencilerin Avrupa devletlerinin somurgecilik faaliyetleri kapsaminda yaptiklari katliamlarin etkileri hakkinda cikarimda bulunmalari saglanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.3.3",
      subTopicName: "Devrimler Caginda Devlet-Toplum Iliskileri",
      description:
        "Osmanli Devleti'nde modern ordu teskilati ve yurttas askerligine yonelik duzenlemelerin siyasi ve sosyal boyutlarini analiz eder.",
      details: [
        "a) Fransiz Ihtilali sonrasinda Avrupa'da uygulanmaya baslanan zorunlu askerlik sisteminin gerekcelere ve sosyo-politik etkilerine deginilir.",
        "b) Osmanli Devleti'nin yeni duzenli ordu kurma tesebbuslerinin (Nizam-i Cedit, Yeniceri Ocagi'nin kaldirilmasi ve Asakir-i Mansure-i Muhammediye) gerekceleri analiz etmeleri saglanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.3.4",
      subTopicName: "Devrimler Caginda Devlet-Toplum Iliskileri",
      description:
        "Ulus devletlesme ve endustrilesme sureclerinin sosyal hayata yansimalarini analiz eder.",
      details: [
        "a) Ulasim ve haberlesme sektorlerindeki gelismelerin (demiryolu, telgraf) merkezi idarelere hakimiyet alanlarini uzerindeki otoritelerini arttirma imkani vermesi Osmanli Devleti ornegi uzerinden ele alinir.",
        "b) Avrupa devletleriyle girilen siyasi ve askeri rekabet cercevesinde acilan kurumlara (Hendesehane, Muhendishaneler, Mekteb-i Harbiye, Tibbiye, Mulkiye) ve II. Mahmud Donemi'nden itibaren zorunlu orgun egitime baslatilmasina deginilir.",
        "c) Osmanli Devleti'nde acilan azinlik okullari ile yabanci ve misyoner okullarina deginilerek II. Abdulhamid Donemi'nde devlet tarafindan kurulan okullar kisaca ele alinir.",
        "d) Turk tarihinde siyasi ve sosyal alanlardaki yuzyillar boyunca suren degisime ragmen onemini devam ettiren/varligini koruyan unsurlara (dil, aile yapisi, bayrak) deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "En Uzun Yüzyıl (1800-1922)": [
    {
      code: "11.4.1",
      subTopicName: "Uluslararasi Iliskilerde Denge Stratejisi (1774-1914)",
      description:
        "1774-1914 yillari arasindaki surecte meydana gelen baslica siyasi gelismeleri tarih seridi ve haritalar uzerinde gosterir.",
      details: [
        "Kirim'in ilhaki (1783), Fransiz Ihtilali (1789), Yas Antlasmasi (1792), Sirp Isyani (1804), Viyana Kongresi (1815), Rum Isyani (1821), Edirne Antlasmasi (1829), Hunkar Iskelesi Antlasmasi (1833), Balta Limani Antlasmasi (1838), Tanzimat Fermani (1839), Londra Bogazlar Sozlesmesi (1841), Kirim Savasi (1853-1856), Islahat Fermani (1856), Paris Antlasmasi (1856), Kanun-i Esasi (1876), Osmanli-Rus Savasi (1877-1878), Berlin Antlasmasi (1878), Duyun-i Umumiye Idaresinin kurulmasi (1881), II.Mesrutiyet'in ilani (1908), Trablusgarp Savasi (1911), I. Balkan Savasi (1912) ve II. Balkan Savasi (1913) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.2",
      subTopicName: "Uluslararasi Iliskilerde Denge Stratejisi (1774-1914)",
      description:
        "Osmanli Devleti'nin siyasi varligina yonelik ic ve dis tehditleri analiz eder.",
      details: [
        "a) Osmanli Devleti'nin guc kaybetmesiyle birlikte buyuk guclerin Osmanli cografyasina nufuz etme, muhtemel bir dagilma durumunda Osmanli topraklarini paylasma (Sark Meselesi) veya isgal etme cabalari kuresel guc mucadelesi baglaminda ele alinir.",
        "b) 1815 Viyana Kongresi ile baslayan surecte buyuk guclerin mudahalesiyle uluslararasi boyut kazanan konular ele alinir.",
        "c) Mehmet Ali Pasa'nin Osmanli Devleti'nin merkezi yonetimine ragmen guc kazanmasi ve nufuz alanini genisletme cabalarina deginilir.",
        "d) 1768-1914 arasindaki surecte Osmanli-Rus rekabetini sebep-sonuc iliskisi acisindan analiz etmeleri saglanir.",
        "e) Avrupa devletleri arasindaki bloklasmayla degisen uluslararasi sartlara deginilerek Avrupa'daki topraklarini kaybeden Osmanli Devleti'nin cesitli buyuk guclerle ittifak arayislari ele alinir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.3",
      subTopicName: "Uluslararasi Iliskilerde Denge Stratejisi (1774-1914)",
      description:
        "Tanzimat Fermani, Islahat Fermani ve Kanun-i Esasi'nin iceriklerini kuresel ve yerel siyasi sartlar baglaminda degerlendirir.",
      details: [
        "a) Sened-i Ittifak, Tanzimat ve Islahat Fermanlari ile Kanun-i Esasi'nin (I. ve II. Mesrutiyet); uluslararasi gucler, yerel siyasi aktorler ve ahalinin kriz donemlerindeki farkli taleplerinin merkezi idare tarafindan uzlastirilmasina yonelik cabalar oldugunu degerlendirmeleri saglanir.",
        "b) Mecelle ve Kanun-i Esasi ornekleri uzerinden Osmanli hukuk sisteminde meydana gelen degisiklikler; devlet-toplum iliskileri ve Osmanli Devleti'nin Avrupa siyasi sistemine entegrasyonu cercevesinde kisaca ele alinir.",
        "c) Osmanli Devleti'nin dagilmasini onlemeye yonelik Uc Tarz-i Siyaset olarak bilinen fikir akimlarinin, merkezi idarenin ve dusunce adamlarinin siyasi ve toplumsal birligi koruma cabalari olduguna deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.4",
      subTopicName: "Uluslararasi Iliskilerde Denge Stratejisi (1774-1914)",
      description:
        "1876-1913 arasinda gerceklestirilen darbelerin Osmanli siyasi hayati uzerindeki etkilerini degerlendirir.",
      details: [
        "a) 1876, 1909 ve 1913 darbelerinin sebeplerine ve sosyo-politik sonuclarina ve bu surecte yasanan toprak kayiplarina deginilir.",
        "b) Ogrencilerin Osmanli Devleti'nde gerceklestirilen darbeleri ve bunlarin karakteristik ozelliklerini analiz etmeleri saglanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.5.1",
      subTopicName: "XIX ve XX. Yuzyilda Degisen Sosyo-Ekonomik Hayat",
      description:
        "Osmanli Devleti'nin son donemlerinde endustriyel uretime gecis cabalarini ve bu surecte yasanan zorlulklari analiz eder.",
      details: [
        "a) Osmanli Devleti'nde sanayilesme cabalarinin onundeki engellere (sermaye, bilim ve teknoloji, yetismis personel ve uzun vadeli strateji konularindaki yetersizlikler) deginilir.",
        "b) Kuresel kapitalist guclerle rekabet etme konusundaki zorluklar; 1838 Balta Limani Antlasmasi orneginden hareketle gumruk ve ticaret antlasmalarinin sinirlayiciligi ve yerli uretim yerine ithalatin tercih edilmesi gibi faktorler baglaminda kisaca ele alinir.",
        "c) 1856'dan sonraki surecte kamu maliyesinde yasanan borc krizleri sonucunda Duyun-i Umumiye Idaresinin kurulmasina deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.5.2",
      subTopicName: "XIX ve XX. Yuzyilda Degisen Sosyo-Ekonomik Hayat",
      description:
        "Osmanli Devleti'nin son donemlerindeki nufus hareketlerinin siyasi, askeri ve ekonomik sebep ve sonuclarini analiz eder.",
      details: [
        "a) Osmanli Devleti'ndeki nufus artis hizinin buyuk guclere nispetle azalmasinin uluslararasi rekabette guc kaybi uzerindeki etkilerine deginilir.",
        "b) Osmanli Devleti'nin toprak kaybetmesiyle baslayan surecte Turk ve Musluman ahalinin maruz kaldigi katliamlar, Istanbul ve Anadolu'ya yaptiklari gocler sirasinda yasadiklarini tarihsel empati kurarak analiz etmeleri saglanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.5.3",
      subTopicName: "XIX ve XX. Yuzyilda Degisen Sosyo-Ekonomik Hayat",
      description:
        "Modernlesmeyle birlikte sosyal, ekonomik ve politik anlayista yasanan degisim ve donusumlerin gundelik hayata etkilerini analiz eder.",
      details: [
        "a) Modern sehirlerin dokusunda yasanan degisimin olumlu ve olumsuz sonuclari kisaca ele alinir.",
        "b) XIX. yuzyildaki salgin hastaliklarin etkilerini ve Osmanli Devleti'nin buna yonelik aldigi tedbirler kapsaminda edinilen tecrube analiz etmeleri saglanir.",
        "c) XIX. yuzyilda gazetelerin ve diger sureli yayinlarin artmasiyla birlikte kamuoyunun etkin hale geldigi vurgulanir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  // ==================== T.C. İNKILAP TARİHİ ====================

  "20. Yüzyıl Başlarında Osmanlı Devleti": [
    {
      code: "I.1.1",
      subTopicName: "20. Yuzyil Baslarinda Osmanli Devleti ve Dunya",
      description:
        "Mustafa Kemal'in Birinci Dunya Savasi'na kadarki egitim ve askerlik hayatini icinde bulundugu toplumun siyasi, sosyal ve kulturel yapisi ile iliskilendirir.",
      details: [
        "a) Mustafa Kemal'in aldigi egitimin, okudugu okullarin ve ogretmenlerinin onun yetismesine ve kisiliginin olusmasina etkilerine deginilir.",
        "b) Selanik, Manastir, Istanbul, Sam ve Sofya sehirlerindeki siyasi ve sosyal ortamin, okudugu kitaplarin, yerli ve yabanci dusunurlerin ve fikir akimlarinin Mustafa Kemal'in fikirlerine etkisi ele alinir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.1.2",
      subTopicName: "20. Yuzyil Baslarinda Osmanli Devleti ve Dunya",
      description:
        "20. yuzyil baslarinda Osmanli Devleti'nin siyasi, sosyal ve ekonomik durumunu analiz eder.",
      details: [
        "a) II. Mesrutiyet'i hazirlayan fikri, siyasi ve sosyal gelismelere ve bu baglamda Ittihat ve Terakki Cemiyetine deginilir.",
        "b) Balkan Savaslarinin Osmanli Devleti'nin sinirlarinin degismesine ve bu savaslarin Osmanli toplum yapisina etkilerine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "1. Dünya Savaşı": [
    {
      code: "I.1.3",
      subTopicName: "I. Dunya Savasi Sureci",
      description:
        "I. Dunya Savasi surecinde Osmanli Devleti'nin durumunu siyasi, askeri ve sosyal acilardan analiz eder.",
      details: [
        "a) I. Dunya Savasi'nin sebepleri ve Osmanli Devleti'nin savasa girmesinin gerekceleri uzerinde durulur.",
        "b) Osmanli Devleti'nin savastipi cepheler taarruz ve savunma ozellikleri de belirtilerek ele alinir.",
        "c) Canakkale Cephesi'ndeki kara ve deniz zaferleri ile Irak Cephesi'ndeki Kut'ul-Amare Zaferi'ne, Kafkas Islami Ordusuna ve Medine Mudafaasi'na deginilir.",
        "d) Mustafa Kemal'in Canakkale, Kafkas ve Suriye Cephelerindeki faaliyetleri ele alinir.",
        "e) 1915 Olaylari ile Ermeni Tehciri'ne deginilir.",
        "f) I. Dunya Savasi sirasinda Anadolu'da halkin durumu, yasanan sikintilar uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.1.4",
      subTopicName: "I. Dunya Savasi Sonuclari",
      description:
        "I. Dunya Savasi'nin sonuclarini Osmanli Devleti ve Batili devletler acisindan degerlendirir.",
      details: [
        "a) Mondros Ateskes Antlasmasi ve bu antlasmanin uygulanmasi uzerinde durulur.",
        "b) Mondros Ateskes Antlasmasi'na karsi Istanbul Hukumetinin, Mustafa Kemal'in ve halkin tutumu uzerinde durulur.",
        "c) Itilaf Devletleri'nin gerceklestirdikleri isgal ve uygulamalarla Wilson Ilkeleri arasindaki celiskiye deginilir.",
        "d) Paris Baris Konferansi'na deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Milli Mücadeleye Hazırlık Dönemi": [
    {
      code: "I.2.1",
      subTopicName: "Milli Mucadele",
      description:
        "Kuvay-i Milliye hareketinin olusumundan Buyuk Millet Meclisinin acilisina kadar olan surecte meydana gelen gelismeleri aciklar.",
      details: [
        "a) Izmir'in isgaline ve isgale tepki olarak meydana gelen gelismelere deginilir.",
        "b) Mustafa Kemal'in Samsun'a cikarak Milli Mucadele'yi baslatmasina deginilir.",
        "c) Milli cemiyetler ve milli varliga dusman cemiyetler uzerinde durulur. Pontus Meselesi kisaca ele alinir.",
        "d) Havza ve Amasya Genelgeleri, yerel kongreler ile Erzurum ve Sivas Kongrelerinin milli hakimiyet ve milli birligin saglanmasi acsindan onemi vurgulanir.",
        "e) Amiral Bristol ve General Harbord Raporlari uzerinden isgallerin haksizhgina deginilir.",
        "f) Amasya Gorusmeleri'ne deginilir.",
        "g) Misak-i Milli Kararlari ve onemi uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.2.2",
      subTopicName: "Milli Mucadele",
      description:
        "Buyuk Millet Meclisinin acilis surecini ve sonrasinda meydana gelen gelismeleri kavrar.",
      details: [
        "a) BMM'nin acilis gerekceleri vurgulanarak bu meclisin genel ozelliklerine deginilir.",
        "b) BMM'ye karsi ayaklanmalar ve ayaklanmalarin bastirilmasi icin alinan tedbirlere deginilir.",
        "c) Istiklal Mahkemeleri'nin kurulus gerekceleri, isleyisi ve bu mahkemelere getirilen elestitrilere cesitli kaynak ve goruslerden alitilar yapilarak yer verilir.",
        "d) Anadolu Ajansinin kurulmasina deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.2.3",
      subTopicName: "Milli Mucadele",
      description:
        "Sevr Antlasmasi'nin Milli Mucadele surecine etkilerini analiz eder.",
      details: [
        "a) Sevr Antlasmasi'nin ongordudu sinirlari harita uzerinde gosterilir.",
        "b) Sevr Antlasmasi'na karsi Istanbul Hukumetinin, Mustafa Kemal'in ve halkin tutumu uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.2.7",
      subTopicName: "Milli Mucadele",
      description:
        "Milli Mucadele surecine katkida bulunmus onemli sahsiyetlerin kisilik ozellikleri ile faaliyetlerini iliskilendirir.",
      details: [
        "a) Halide Onbasi, Serife Baci, Fatma Seher Erden, Gordesli Makbule, Tayyar Rahmiye gibi kadin kahramanlarin Milli Mucadele'ye katkidarina deginilir.",
        "b) Milli Mucadele'nin gercekleslesinde onemli rol oynayan Ismet Inonu, Kazim Karabekir, Fevzi Cakmak, Sahin Bey, Sutcu Imam gibi kahramanlarin sahsiyetleri hakkindaki anekdotlara yer verilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Kurtuluş Savaşında Cepheler": [
    {
      code: "I.2.4",
      subTopicName: "Dogu ve Guney Cepheleri",
      description:
        "Dogu ve Guney Cephelerinde verilen mucadelelerin ulkemizin bagimsizlik surecine katkilarini kavrar.",
      details: [
        "Dogu ve Guney Cephelerinde Turk milletinin elde ettigi basarilarin ulusal ve uluslararasi sonuclari uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.2.5",
      subTopicName: "Bati Cephesi",
      description:
        "Duzenli ordunun kurulmasindan Mudanya Ateskes Antlasmasi'na kadar meydana gelen gelismelerin Turkiye'nin bagimsizlik surecine katkisini analiz eder.",
      details: [
        "a) Duzenli ordunun kurulmasinin gerekceleri uzerinde durulur.",
        "b) Bati Cephesi'nde elde edilen askeri basarilar ve bu basarilarin siyasi etkileri vurgulanir.",
        "c) Teskilat-i Esasiye Kanunu'na (1921 Anayasasi) deginilir.",
        "d) Mehmet Akif Ersoy'un Milli Mucadele'deki yeri ile Istiklal Marsi'nin kabulu ve onemi uzerinde durulur.",
        "e) Maarif Kongresi'nin duzenlenmesi ve onemi vurgulanir.",
        "f) Sakarya Meydan Muharebesi ve Buyuk Taarruz'un Milli Mucadele'deki onemi uzerinde durularak Mustafa Kemal'in bu muharebelerin kazanilmasindaki rolu vurgulanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.2.6",
      subTopicName: "Diplomatik Basarilar",
      description:
        "Milli Mucadele sonucunda kazanilan diplomatik basarilari ulkemizin bagimsizligi acisindan degerlendirir.",
      details: [
        "a) Mudanya Ateskes Antlasmasi'nin onemi vurgulanir.",
        "b) Turkiye'nin bagimsiz bir devlet olarak taninmasinda Lozan Baris Antlasmasi'nin onemi vurgulanir.",
        "c) Lozan Baris Antlasmasi'nin maddeleri ile Sevr Antlasmasi'nin maddeleri karsilastirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Türk İnkılabı": [
    {
      code: "I.3.1",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Cagdaslasan Turkiye'nin temeli olan Ataturk ilkelerini kavrar.",
      details: [
        "Cumhuriyetcilik, Milliyetcilik, Halkcik, Laiklik, Devletcilik ve Inkilapcilik ilkeleri aciklanir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.3.2",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Siyasi alanda meydana gelen gelismeleri kavrar.",
      details: [
        "a) Saltanatin kaldirilmasi, Ankara'nin baskent olusu, Cumhuriyet'in ilan edilmesi, Halifelikin kaldirilmasi, Ser'iye ve Evkaf Vekaletinin kaldirilmasi, Erkan-i Harbiye Vekaletinin kaldirilmasi, 1924 Anayasasi'nin kabulunun neden ve sonuclariyla yer verilir.",
        "b) Siyasi alanda gelen gelismeler Ataturk ilkeleri ile iliskilendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.3.3",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Hukuk alaninda meydana gelen gelismelerin Turk toplumunda meydana getirdigi degisimleri kavrar.",
      details: [
        "a) Hukuki duzenlemelerin neden yapildigi kisaca aciklanir ve bu alanda uygulama birliginin onemi vurgulanir.",
        "b) Turk Medeni Kanunu'nun aile yapisinda ve kadinin toplumdaki yerinde meydana getirdigi degisim vurgulanir.",
        "c) Hukuk alaninda gelen gelismeler Ataturk ilkeleri ile iliskilendirilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.3.4",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Egitim ve kultur alaninda yapilan inkilaplari ve gelismeleri kavrar.",
      details: [
        "a) Tevhid-i Tedrisat Kanunu, Harf Inkilabi, Millet Mektepleri, Turk Tarih Kurumu ve Turk Dil Kurumu ele alinir.",
        "b) 1933 Universite Reformu'ndan hareketle Ataturk'un bilimsel gelisme ve kalkinmaya verdigi onem vurgulanir.",
        "c) Ataturk'un guzel sanatlara ve spora verdigi onem aciklanirken muzik, heykel ve resim alanlarindaki uygulamalardan ve kurumsallasmalardan ornekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.3.5",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Toplumsal alanda yapilan inkilaplari ve meydana gelen gelismeleri kavrar.",
      details: [
        "a) Kilik ve kiyafette yapilan duzenlemeler, tekke, zaviye ve turbelerin kapatilmasi, takvim, saat ve olculerde degisiklik yapilmasi ile Soyadi Kanunu konulari ele alinir.",
        "b) Turk kadininan siyasi, sosyal ve egitim alanlarinda saglanan haklar uzerinde durulur.",
        "c) Toplumsal alanda yapilan inkilaplar ve gelismeler Ataturk ilkeleri ile iliskilendirilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.3.6",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Ekonomi alaninda meydana gelen gelismeleri kavrar.",
      details: [
        "a) Izmir Iktisat Kongresi'nde alinan kararlar milli iktisat anlayisi ve tasarruf bilinci acilarindan ele alinir.",
        "b) Tarim, sanayi, ticaret ve denizcilik alanlarinda yapilan calismalar uzerinde durulur.",
        "c) 1929 Dunya Ekonomik Bunalimi'nin Turkiye ekonomisine etkilerine kisaca deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.3.7",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Ataturk Donemi'nde saglik alaninda yapilan calismalari kavrar.",
      details: null,
      isKeyKazanim: false,
    },
    {
      code: "I.3.8",
      subTopicName: "Ataturkculuk ve Turk Inkilabi",
      description:
        "Ataturk ilke ve inkilaplarini olusturan temel esaslari Ataturkcu dusunce sistemi acisindan analiz eder.",
      details: [
        "Milli tarih bilinci, vatan ve millet sevgisi, milli dil, bagimsizlik ve ozgurluk, egemenligin millete ait olmasi, milli kulturun gelistirilmesi, Turk milletini cagdas uygarlik duzeyinin uzerine cikarma, milli birlik ve beraberlik, ulke butunlugu cercevesinde ele alinir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Atatürkçülük ve Atatürk İlkeleri": [
    {
      code: "I.4.1",
      subTopicName: "Iki Savas Arasindaki Donemde Turkiye ve Dunya",
      description:
        "Ataturk Donemi'nde Turkiye Cumhuriyeti'nin ic politikasindaki onemli gelismeleri aciklar.",
      details: [
        "a) I. Meclisin ve II. Meclisin tesekkulundeki yontem ve sureclere kisaca deginilir.",
        "b) Cok partili hayata gecis cercevesinde partilesme cabalari ele alinir.",
        "c) Mustafa Kemal'e suikast girisimine deginilir.",
        "d) Bu donemde cok partili siyasi hayatin devamliliginin saglanamamasinin nedenleri uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.4.2",
      subTopicName: "Iki Savas Arasindaki Donemde Turkiye ve Dunya",
      description:
        "Ataturk Donemi'nde (1923-1938) Turkiye Cumhuriyeti'nin dis politikasindaki baslica gelismeleri aciklar.",
      details: [
        "a) Turkiye'nin Yunanistan, Ingiltere, Fransa ve SSCB ile iliskilerine deginilir.",
        "b) Musul Sorunu ve bu soruna iliskin Turk ve Ingiliz tezleri uzerinde durulur.",
        "c) Turkiye'nin Milletler Cemiyetine uyeligi, Balkan Antanti, Sadabat Pakti, Montro Bogazlar Sozlesmesi ve Hatay'in ana vatana katilmasi uzerinde durulur.",
        "d) Ataturk'un olumune ve Ismet Inonu'nun cumhurbaskanini sekilmesine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.4.3",
      subTopicName: "Iki Savas Arasindaki Donemde Turkiye ve Dunya",
      description:
        "Iki dunya savasi arasindaki donemde dunyada meydana gelen siyasi ve ekonomik gelismeleri kavrar.",
      details: [
        "a) Birinci Dunya Savasi sonrasi kalici barisi saglama cabalarina (Milletler Cemiyeti, Locarno Antlasmasi ve Briand-Kellogg Pakti) deginilir.",
        "b) 1929 Dunya Ekonomik Bunalimi (Kara Persembe) ve etkileri uzerinde durulur.",
        "c) Iki savas arasindaki donemde etkilerini artiran fasizm, nazizm, komunizm, sosyalizm, liberalizm ve kapitalizmin genel ozelliklerine ve siyasi etkilerine deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Türk Dış Politikası": [
    {
      code: "I.5.1",
      subTopicName: "II. Dunya Savasi Surecinde Turkiye ve Dunya",
      description:
        "II. Dunya Savasi'nin sebepleri, baslamasi ve yayilmasiyla ilgili baslica gelismeleri kavrar.",
      details: [
        "a) II. Dunya Savasi'nin arka planinda yer alan stratejik ve emperyalist rekabet vurgulanir.",
        "b) II. Dunya Savasi'nin seyrini degistiren gelismeler (Stalingrad Kusatmasi, Normandiya Cikarmasi) ele alinir.",
        "c) Birlesmis Milletler Teskilati'nin kurulus amacina ve gunumuzdeki misyonuna deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.5.2",
      subTopicName: "II. Dunya Savasi Surecinde Turkiye ve Dunya",
      description:
        "II. Dunya Savasi surecinde Turkiye'nin izledigi siyaset ile savasin Turkiye uzerindeki ekonomik ve toplumsal etkilerini analiz eder.",
      details: [
        "Savas sirasinda Turkiye'nin aldigi ekonomik tedbirlerin (Milli Korunma Kanunu, Varlik Vergisi, karne uygulamasi, tarimsal urunlerin ordu ihtiyacina yonlendirilmesi) toplumsal hayata yansimalarina deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.5.3",
      subTopicName: "II. Dunya Savasi Surecinde Turkiye ve Dunya",
      description: "II. Dunya Savasi'nin sonuclarini degerlendirir.",
      details: [
        "a) Atlantik Bildirisi, Yalta ve Postdam Konferanslarindan hareketle savasin siyasi sonuclarina ve ortaya cikan iki kutuplu dunya duzenine deginilir.",
        "b) Ortadogu'nun yeniden sekillenmesi ile ilgili gelismelere yer verilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.6.1",
      subTopicName: "II. Dunya Savasi Sonrasinda Turkiye ve Dunya",
      description:
        "1945-1950 yillari arasinda Turkiye'de meydana gelen siyasi, sosyal ve ekonomik gelismeleri kavrar.",
      details: [
        "a) Cok partili hayata gecisin ve Demokrat Parti'nin kurulmasinin Turk demokrasi tarihi acisindan onemi uzerinde durulur.",
        "b) 1946 ve 1950 secimleri ile secim sistem ve usullerindeki degisimler uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.6.2",
      subTopicName: "II. Dunya Savasi Sonrasinda Turkiye ve Dunya",
      description:
        "II. Dunya Savasi sonrasi donemde uluslararasi iliskilerde ve Turk dis politikasinda meydana gelen gelismeleri kavrar.",
      details: [
        "a) Savas sonrasi ABD ve SSCB'nin iki kuresel guc olarak ortaya cikmasina ve bu baglamda Varsova Pakti ve Kuzey Atlantik Orgutu'nun (NATO) kurulmalarina deginilir.",
        "b) Truman Doktrini'nin Turkiye'nin dis politika yonelimleri uzerindeki etkisine ve bu etkilerin yansimalarina (Kore Savasi ve Turkiye'nin NATO uyeligi) deginilir.",
        "c) Turkiye'nin Avrupa Konseyi'ne girmesine deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.6.3",
      subTopicName: "II. Dunya Savasi Sonrasinda Turkiye ve Dunya",
      description:
        "1950'ler Turkiye'sinde meydana gelen siyasi, sosyal ve ekonomik gelismeleri analiz eder.",
      details: [
        "Marshall yardimlarin Turk ekonomisine etkisi (tarimda makinelesmye bagli olarak koyden kente goc ve sonuclari, demir yolu yapimından kara yolu yapimina donus) uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.7.1",
      subTopicName: "Toplumsal Devrim Caginda Dunya ve Turkiye",
      description:
        "1960 sonrasinda dunya siyasetinde ortaya cikan gelismeleri aciklar.",
      details: [
        "a) Arap-Israil Savaslarina kisaca deginilir.",
        "b) Iran-Irak Savasi'nin sebep ve sonuclari kisaca ele alinir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.7.2",
      subTopicName: "Toplumsal Devrim Caginda Dunya ve Turkiye",
      description:
        "1960'lardan itibaren Turk dis politikasini etkileyen onemli gelismeleri kavrar.",
      details: [
        "a) Kibris Sorunu'nun ortaya cikis nedenleri (ENOSIS, Megalo Idea, EOKA), Kibris Baris Harekati ve sonrasinda meydana gelen gelismeler uzerinde durulur.",
        "b) Ege Adalari, Kita Sahanligi, Bati Trakya Turklerinin sorunlari baglaminda Turk-Yunan iliskileri uzerinde durulur.",
        "c) Ermeni Sorunu baglaminda Turkiye'ye karsi gerceklestirilen uluslararasi girisim ve faaliyetlere (ASALA ve diaspora) deginilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.7.3",
      subTopicName: "Toplumsal Devrim Caginda Dunya ve Turkiye",
      description:
        "1960'lardan itibaren Turkiye'de meydana gelen siyasi, ekonomik ve sosyo-kulturel gelismeleri analiz eder.",
      details: [
        "a) 27 Mayis Askeri Darbesi, 1971 Muhtirasi ve 1980 Askeri Darbesi ile bu olaylarin siyasi ve sosyo-ekonomik etkileri kisaca ele alinir.",
        "b) 1961 ve 1982 Anayasalari, yapilari ve insan haklarina yaklasim tarzlari bakimindan karsilastirilir.",
        "c) Yurt disina ve koyden kente yapilan gocler ile bu goclerin sosyal hayatta meydana getirdigi degisimler ele alinir.",
        "d) Ekonomik alandaki liberallesme politikalarina (serbest piyasa ekonomisi, ozellestirme, ithalat yasaklarinin kaldirilmasi, IMF ile iliskiler ve KDV uygulamasi) deginilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.8.1",
      subTopicName: "21. Yuzyilin Esiginde Turkiye ve Dunya",
      description:
        "1990 sonrasinda Turkiye'de meydana gelen ekonomik, siyasi, sosyal ve kulturel gelismeleri kavrar.",
      details: [
        "a) Turkiye'de ortaya cikan ekonomik krizler (5 Nisan 1994, 2001 ve 2008 Krizleri) ve bu krizlerin toplumsal yansimalari uzerinde durulur.",
        "b) 28 Subat mudahalesi, 27 Nisan e-muhtirasi ve 15 Temmuz darbe kalkismasi ile bunlarin etkilerine deginilir.",
        "c) Teror ve teror orgutlerinin (PKK/PYD, DEAS, FETO) ortaya cikis nedenleri ile teroru onlemeye yonelik tedbirlere 15 Temmuz 2016 darbe kalkismasi ornegi uzerinden deginilir.",
        "d) Bilim, sanat ve spor alanlarindaki baslica gelismeler uzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.8.2",
      subTopicName: "21. Yuzyilin Esiginde Turkiye ve Dunya",
      description:
        "1990 sonrasinda meydana gelen siyasi gelismelerin Turkiye'ye etkilerini ve dunya siyasi konjonkturu baglaminda analiz eder.",
      details: [
        "a) SSCB'nin dagilmasi ile bagimsizligini kazanan Turk cumhuriyetlerine (Azerbaycan, Ozbekistan, Kazakistan, Kirgizistan, Turkmenistan) yonelik kurulan kuruluslara (TIKA, Yurtdisi Turkler ve Akraba Topluluklar Baskanligi, TURKSOY ve Yunus Emre Enstitusu) ve bu kuruluslarin faaliyetlerine kisaca deginilir.",
        "b) Avrupa Birligi (AB) ile Turkiye arasindaki iliskiler kisaca ele alinir.",
        "c) Bosna-Hersek Savasi ile bu savas sonrasinda Balkanlarda meydana gelen gelismelere kisaca deginilir.",
        "d) Orta Dogu'da meydana gelen baslica gelismeler (Siyonizm Sorunu, 1990 ve 2003 Korfez Savaslari ve Arap Bahari'nin Orta Dogu ve dunyaya etkileri) kisaca ele alinir.",
        "e) 11 Eylul Saldirilari sonrasinda dunyanin cesitli bolgelerinde meydana gelen teror eylemleri karsisinbda ulke ve toplumlarin takindiklari tavirlarin cesitlilikleri vurgulanir ve orneklendirilir.",
        "f) Irak ve Suriye'deki siyasi gelismeler ile bu gelismelerin Turkiye'ye etkilerine deginilir. Bu baglamda Turkiye'nin multeci sorununa yaklasimi ile diger ulkelerin bu soruna yaklasimlari karsilastirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],
};

// =====================================================================
// ANA SEED FONKSIYONU
// =====================================================================

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  if (!tyt) {
    console.log("TYT exam type bulunamadi, atliyorum.");
    return;
  }

  const tarihSubject = await prisma.subject.findFirst({
    where: { name: "Tarih", examTypeId: tyt.id },
  });
  if (!tarihSubject) {
    console.log("TYT Tarih subject bulunamadi, atliyorum.");
    return;
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: tarihSubject.id },
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
    console.error("seed-tyt-tarih-kazanim error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
