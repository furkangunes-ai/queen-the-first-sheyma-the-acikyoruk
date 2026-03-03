// =============================================================================
// FIZIK KAZANIM DATA - OSYM 2026
// Extracted from PDF pages 155-174
// TODO: Pages 175-182 are MISSING (remaining 12. sinif content):
//   - Rest of 12.1 Cembersel Hareket (remaining kazanimlar for 12.1.1 and 12.1.2+)
//   - Expected topics: Merkezcil Kuvvet, Kutle Cekim Kuvveti, Acisal Momentum,
//     Eylemsizlik Momenti, Modern Fizik, Atom Fizigi, Nukleer Fizik, etc.
// =============================================================================

import { TopicEntry } from "./kimya";

export function getFizikTopics(): TopicEntry[] {
  return [
    // ============================================================
    //  FIZIK — TYT (9-10. sinif)
    // ============================================================

    // 9.1. FIZIK BILIMINE GIRIS
    {
      topicKey: "fizik_bilimine_giris",
      topicName: "Fizik Bilimine Giris",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 1,
      kazanimlar: [
        {
          code: "9.1.1.1",
          subTopicName: "Fizik Biliminin Onemi",
          description:
            "Evrendeki olaylarin anlasilmasinda fizik biliminin onemini aciklar.",
          isKeyKazanim: true,
          details: [
            "Fizigin evren ve evrendeki olaylarin anlasilmasi ve aciklanmasindaki rolu uzerinde durulur.",
          ],
        },
        {
          code: "9.1.2.1",
          subTopicName: "Fizigin Uygulama Alanlari",
          description:
            "Fizigin uygulama alanlarini, alt dallari ve diger disiplinlerle iliskilendirir.",
          isKeyKazanim: true,
          details: [
            "a) Fizigin mekanik, termodinamik, elektromanyetizma, optik, katihal fizigi, atom fizigi, nukleer fizik, yuksek enerji ve plazma fizigi alt dallari, uygulama alanlarindan orneklerle aciklanir. Alt dallar ile ilgili mesleklere ornekler verilir.",
            "b) Fizigin felsefe, biyoloji, kimya, teknoloji, muhendislik, sanat, spor ve matematik alanlari ile olan iliskisine gunluk hayattan ornekler verilir.",
          ],
        },
        {
          code: "9.1.3.1",
          subTopicName: "Fiziksel Niceliklerin Siniflandirilmasi",
          description: "Fiziksel nicelikleri siniflandirir.",
          isKeyKazanim: true,
          details: [
            "a) Niceliklerin temel ve turetilmis olarak tanimlanmasi ve siniflandirilmasi saglanir.",
            "b) Temel buyukluklerin birimleri SI birim sisteminde tanitilir. Turetilmis buyuklukler icin fen bilimleri dersinde gecmis konulardan ornekler verilir.",
            "c) Niceliklerin skaler ve vektorel olarak tanimlanmasi ve siniflandirilmasi saglanir.",
            "c) Vektorlerde toplama islemlerinin tek boyutta yapilmasi saglanir. Skaler ve vektorel niceliklerde toplama islemlerine (tek boyutta) gunluk hayattan ornekler verilerek, karsilastirma yapilmasi saglanir.",
          ],
        },
        {
          code: "9.1.4.1",
          subTopicName: "Bilim Arastirma Merkezleri",
          description:
            "Bilim arastirma merkezlerinin fizik bilimi icin onemini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Bilim arastirma merkezleri TUBITAK, TAEK, ASELSAN, CERN, NASA ve ESA ile sinirlandirilir.",
            "b) Bilimsel arastirmalarda etik ilkelere uymanin onemi vurgulanir.",
          ],
        },
      ],
    },

    // 9.2. MADDE VE OZELLIKLERI
    {
      topicKey: "madde_ve_ozellikleri",
      topicName: "Madde ve Ozellikleri",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 2,
      kazanimlar: [
        {
          code: "9.2.1.1",
          subTopicName: "Madde ve Ozkutle",
          description:
            "Ozkutleyi, kutle ve hacimle iliskilendirerek aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kutle ve hacim kavramlarina degninilir. Kutle (mg, g, kg ve ton) ve hacim (mL, L, cm3, dm3, m3) icin anlamli birim donusumleri yapilir. Donusumler yapilirken bilisim teknolojilerinden faydalanilabilecegi belirtilir.",
            "b) Duzgun geometrik sekilli cisimlerden kup, dikdortgenler prizmasi, silindir, kure ve sekli duzgun olmayan cisimler icin hacim hesaplamalari yapilir. Kum-su problemlerine girilmez.",
            "c) Sabit sicaklik ve basincta olcum yapilarak kutle-hacim grafigin cizilmesi; kutle, hacim ve ozkutle kavramlari arasindaki matematiksel modelin cikarilmasi saglanir. Matematiksel hesaplamalar yapilir.",
            "c) Kutle-ozkutle, hacim-ozkutle grafiklerinin cizilmesi ve yorumlanmasi saglanir.",
            "d) Esit kollu terazi ile ilgili matematiksel hesaplamalara girilmez.",
            "e) Karisimlarin ozkutlelerine deginilir. Matematiksel hesaplamalara girilmez.",
            "f) Archimedes ve el-Hazini'nin ozkutle ile ilgili yaptigi calismalar hakkinda kisaca bilgi verilir.",
          ],
        },
        {
          code: "9.2.1.2",
          subTopicName: "Madde ve Ozkutle",
          description:
            "Gunluk hayatta saf maddelerin ve karisimlarin ozkutlelerinden faydalanilan durumlara ornekler verir.",
          details: [
            "Kuyumculuk, porselen yapimi, ebru yapimi gibi ozkutleden faydalanilan calisma alanlarina deginilir.",
          ],
        },
        {
          code: "9.2.2.1",
          subTopicName: "Dayaniklilik",
          description: "Dayaniklilik kavramini aciklar.",
          isKeyKazanim: true,
          details: [
            "Duzgun geometrik sekilli cisimlerden kup, dikdortgenler prizmasi, silindir ve kurenin kesit alaninin hacme orani disinda dayaniklilik kavrami ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "9.2.3.1",
          subTopicName: "Yapisma ve Birbirini Tutma",
          description:
            "Yapisma (adezyon) ve birbirini tutma (kohezyon) olaylarini orneklerle aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Yuzey gerilimi ve kilcallik olayinin yapisma ve birbirini tutma olaylari ile aciklanmasi ve gunluk hayattan ornekler verilmesi saglanir.",
            "b) Yuzey gerilimini etkileyen faktorlerin, gunluk hayattaki ornekler ile aciklanmasi saglanir.",
            "c) Adezyon, kohezyon, yuzey gerilimi ve kilcallik ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
      ],
    },

    // 9.3. HAREKET VE KUVVET
    {
      topicKey: "hareket_ve_kuvvet",
      topicName: "Hareket ve Kuvvet",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 3,
      kazanimlar: [
        {
          code: "9.3.1.1",
          subTopicName: "Hareket",
          description: "Cisimlerin hareketlerini siniflandirir.",
          isKeyKazanim: true,
          details: [
            "Deney veya simulasyonlardan yararlanarak oteleme, donme ve titresim hareketlerine ornekler verilmesi saglanir.",
          ],
        },
        {
          code: "9.3.1.2",
          subTopicName: "Hareket",
          description:
            "Konum, alinan yol, yer degistirme, surat ve hiz kavramlarini birbirleri ile iliskilendirir.",
        },
        {
          code: "9.3.1.3",
          subTopicName: "Hareket",
          description:
            "Duzgun dogrusal hareket icin konum, hiz ve zaman kavramlarini iliskilendirir.",
          details: [
            "a) Ogrencilerin deney yaparak veya simulasyonlarla veriler toplamalari, konum-zaman ve hiz-zaman grafiklerini cizmeleri, bunlari yorumlamalari ve cizilen grafikler arasinda donusumler yapmalari saglanir.",
            "b) Ogrencilerin grafiklerden yararlanarak hareket ile ilgili matematiksel modelleri cikarmalari ve yorumlamalari saglanir.",
          ],
        },
        {
          code: "9.3.1.4",
          subTopicName: "Hareket",
          description: "Ortalama hiz kavramini aciklar.",
          details: [
            "Trafikte yesil dalga sisteminin calisma ilkesi uzerinde durulur.",
          ],
        },
        {
          code: "9.3.1.5",
          subTopicName: "Hareket",
          description:
            "Ivme kavramini hizlanma ve yavaslama olaylari ile iliskilendirir.",
          details: [
            "a) Sabit ivmeli hareket ile sinirli kalinir.",
            "b) Ivmenin matematiksel modelinin cikarilmasi saglanir. Matematiksel hesaplamalara girilmez.",
            "c) Sabit ivmeli hareket icin hiz-zaman ve ivme-zaman grafiklerini cizmeleri, yorumlamalari saglanir. Grafikler arasinda donusumlere girilmez. Konum-zaman grafigi cizdirilmez.",
            "c) Anlik hiz kavramina deginilir.",
          ],
        },
        {
          code: "9.3.1.6",
          subTopicName: "Hareket",
          description:
            "Bir cismin hareketini farkli referans noktalarina gore aciklar.",
          details: [
            "Gozlemlerle hareketin goreceli oldugu cikariminin yapilmasi saglanir.",
          ],
        },
        {
          code: "9.3.2.1",
          subTopicName: "Kuvvet",
          description: "Kuvvet kavramini orneklerle aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Temas gerektiren ve gerektirmeyen kuvvetlere ornek verilmesi saglanir.",
            "b) Dort temel kuvvetin hangi kuvvetler oldugu belirtilir.",
            "c) Kutle cekim kuvvetinin bagli oldugu degiskenler verilir. Matematiksel hesaplamalara girilmez.",
            "c) Dengelenmis ve dengelenmemis kuvvetler vurgulanir.",
          ],
        },
        {
          code: "9.3.3.1",
          subTopicName: "Newton'in Hareket Yasalari",
          description:
            "Dengelenmis kuvvetlerin etkisindeki cisimlerin hareket durumlarini orneklerle aciklar.",
          isKeyKazanim: true,
          details: [
            "Ibn-i Sina'nin hareket konusunda yaptigi calismalar hakkinda kisaca bilgi verilir.",
          ],
        },
        {
          code: "9.3.3.2",
          subTopicName: "Newton'in Hareket Yasalari",
          description:
            "Kuvvet, ivme ve kutle kavramlari arasindaki iliskiyi aciklar.",
          details: [
            "a) Net kuvvet, ivme ve kutle arasindaki matematiksel model verilir.",
            "b) Serbest cisim diyagrami uzerinde cisme etki eden kuvvetler gosterilir. Net kuvvetin buyuklugu hesaplanarak yonu gosterilir.",
            "c) Hesaplamalarda yatay duzlemde tek kutle ile sinirli kalinir. Bilesenlere ayirma hesaplamalarina girilmez.",
            "c) Yer cekimi ivmesi aciklanarak agirlik hesaplamalari yapilir.",
          ],
        },
        {
          code: "9.3.3.3",
          subTopicName: "Newton'in Hareket Yasalari",
          description:
            "Etki-tepki kuvvetlerini orneklerle aciklar.",
          details: [
            "a) Yatay ve dusey duzlemlerde etki-tepki kuvvetlerinin gosterilmesi saglanir.",
            "b) Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "9.3.4.1",
          subTopicName: "Surtunme Kuvveti",
          description:
            "Surtunme kuvvetinin bagli oldugu degiskenleri analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin deney yaparak veya simulasyonlardan elde ettigi verilerden cikarim yapmalari ve degiskenler arasindaki iliskiyi belirlemeleri saglanir. Yatay duzlemle sinirli kalinir.",
            "b) Statik ve kinetik surtunme kuvvetlerinin karsilastirilmasi saglanir.",
            "c) Serbest cisim diyagramlari uzerinde surtunme kuvvetinin gosterilmesi saglanir.",
            "c) Surtunme kuvvetinin matematiksel modeli verilir. Matematiksel hesaplamalara girilmez.",
            "d) Surtunme kuvvetinin gunluk hayattaki avantaj ve dezavantajlarina ornekler verilmesi saglanir.",
            "e) Kayarak ve donerek ilerleyen cisimlerde surtunme kuvvetinin yonu, ornekler uzerinden aciklanir.",
          ],
        },
      ],
    },

    // 9.4. ENERJI
    {
      topicKey: "enerji_9",
      topicName: "Enerji",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 4,
      kazanimlar: [
        {
          code: "9.4.1.1",
          subTopicName: "Is, Enerji ve Guc",
          description:
            "Is, enerji ve guc kavramlarini birbirleriyle iliskilendirir.",
          isKeyKazanim: true,
          details: [
            "a) Is ile enerji arasindaki iliski kavramsal olarak verilir.",
            "b) Ogrencilerin is ve guc kavramlarinin matematiksel modellerini incelemeleri saglanir.",
            "c) Fiziksel anlamda is ve guc ile gunluk hayatta kullanilan is ve guc kavramlarinin farkli oldugu vurgulanir.",
          ],
        },
        {
          code: "9.4.1.2",
          subTopicName: "Is, Enerji ve Guc",
          description:
            "Mekanik is ve mekanik guc ile ilgili hesaplamalar yapar.",
          details: [
            "Hareket ile ayni dogrultudaki kuvvetlerle sinirli kalinir.",
          ],
        },
        {
          code: "9.4.2.1",
          subTopicName: "Mekanik Enerji",
          description:
            "Oteleme kinetik enerjisi, yer cekimi potansiyel enerjisi ve esneklik potansiyel enerjisinin bagli oldugu degiskenleri analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Oteleme kinetik enerjisi, yer cekimi potansiyel enerjisi ve esneklik potansiyel enerjisinin matematiksel modelleri verilir. Deney veya simulasyonlar yardimiyla degiskenlerin analiz edilmesi saglanir. Matematiksel hesaplamalara girilmez.",
            "b) Esneklik potansiyel enerjisinde tek yayli sistemler dikkate alinmalidir.",
            "c) Mekanik enerjinin kinetik enerji ve potansiyel enerjinin toplamina esit oldugu vurgulanir.",
          ],
        },
        {
          code: "9.4.3.1",
          subTopicName: "Enerjinin Korunumu ve Enerji Donusumleri",
          description:
            "Enerjinin bir bicimden diger bir bicime (mekanik, isi, isik, ses gibi) donusumunde toplam enerjinin korundugu cikarimini yapar.",
          isKeyKazanim: true,
          details: [
            "a) Surtunmeden dolayi enerjinin tamaminim hedeflenen enerji bicimine donusturulemeycegi vurgulanir.",
            "b) Enerji donusum hesaplamalarina girilmez.",
          ],
        },
        {
          code: "9.4.3.2",
          subTopicName: "Enerjinin Korunumu ve Enerji Donusumleri",
          description:
            "Canlilarin besinlerden kazandiklari enerji ile gunluk aktiviteler icin harcadiklari enerjiyi karsilastirir.",
          details: [
            "Canlilarin fiziksel anlamda is yapmadan da enerji harcayabildikleri vurgulanir.",
          ],
        },
        {
          code: "9.4.4.1",
          subTopicName: "Verim",
          description: "Verim kavramini aciklar.",
          isKeyKazanim: true,
          details: [
            "Enerji tasarrufu ve enerji verimliligi arasindaki iliski enerji kimlik belgeleri uzerinden aciklanir.",
          ],
        },
        {
          code: "9.4.4.2",
          subTopicName: "Verim",
          description:
            "Ornek bir sistem veya tasarimin verimini artiracak oneriler gelistirir.",
          details: [
            "Tarihsel surecte tasarlanmis olan cesitli verim artirici sistemlerin calisma prensibine deginilir.",
          ],
        },
        {
          code: "9.4.5.1",
          subTopicName: "Enerji Kaynaklari",
          description:
            "Yenilenebilir ve yenilenemez enerji kaynaklarini avantaj ve dezavantajlari acisindan degerlendirir.",
          isKeyKazanim: true,
          details: [
            "a) Enerji kaynaklarinin maliyeti, erisilebilirligi, uretim kolayligi, toplum, teknoloji ve cevresel etkileri goz onunde bulundurulur.",
            "b) Enerji kaynaklarini tasarruflu kullanmanin gerekliligi vurgulanir.",
          ],
        },
      ],
    },

    // 9.5. ISI VE SICAKLIK
    {
      topicKey: "isi_ve_sicaklik",
      topicName: "Isi ve Sicaklik",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 5,
      kazanimlar: [
        {
          code: "9.5.1.1",
          subTopicName: "Isi ve Sicaklik",
          description:
            "Isi, sicaklik ve ic enerji kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Entalpi ve entropi kavramlarina girilmez.",
            "b) Isi ve sicaklik kavramlarinin birimleri ve olcum aletlerinin adlari verilir.",
          ],
        },
        {
          code: "9.5.1.2",
          subTopicName: "Isi ve Sicaklik",
          description:
            "Termometre cesitlerini kullanim amaclari acisindan karsilastirir.",
        },
        {
          code: "9.5.1.3",
          subTopicName: "Isi ve Sicaklik",
          description:
            "Sicaklik birimleri ile ilgili hesaplamalar yapar.",
          details: [
            "C, F, K icin birim donusumleri yapilmasi saglanir.",
          ],
        },
        {
          code: "9.5.1.4",
          subTopicName: "Isi ve Sicaklik",
          description:
            "Oz isi ve isi sigasi kavramlarini birbiriyle iliskilendirir.",
          details: [
            "Gunluk hayattan ornekler (denizlerin karalardan gec isinip gec sogumasi gibi) verilir.",
          ],
        },
        {
          code: "9.5.1.5",
          subTopicName: "Isi ve Sicaklik",
          description:
            "Isi alan veya isi veren saf maddelerin sicakliginda meydana gelen degisimin bagli oldugu degiskenleri analiz eder.",
          details: [
            "Deney veya simulasyonlardan yararlanilarak degiskenler arasindaki iliskiyi belirlemeleri saglanir. Matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "9.5.2.1",
          subTopicName: "Hal Degisimi",
          description:
            "Saf maddelerde hal degisimi icin gerekli olan isi miktarinin bagli oldugu degiskenleri analiz eder.",
          isKeyKazanim: true,
          details: [
            "Deney veya simulasyonlardan yararlanarak degiskenler arasindaki iliskiyi belirlemeleri saglanir. Matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "9.5.3.1",
          subTopicName: "Isil Denge",
          description:
            "Isil denge kavraminin sicaklik farki ve isi kavrami ile olan iliskisini analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Deney veya simulasyonlardan yararlanilarak isil dengenin sicaklik degisimi ve isi ile iliskisinin belirlenmesi saglanir.",
            "b) Isil denge ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "9.5.4.1",
          subTopicName: "Enerji Iletim Yollari ve Enerji Iletim Hizi",
          description: "Enerji iletim yollarini orneklerle aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "9.5.4.2",
          subTopicName: "Enerji Iletim Yollari ve Enerji Iletim Hizi",
          description:
            "Kati maddedeki enerji iletim hizini etkileyen degiskenleri analiz eder.",
          details: [
            "a) Deney veya simulasyonlardan yararlanilarak degiskenler arasindaki iliskiyi belirlemeleri saglanir.",
            "b) Gunluk hayattan ornekler (isi yalitiminda izolasyon malzemelerinin kullanilmasi, soguk bolgelerde pencerelerin kucuk, duvarlarin daha kalin olmasi gibi) verilir.",
            "c) Enerji iletim hizi ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "9.5.4.3",
          subTopicName: "Enerji Iletim Yollari ve Enerji Iletim Hizi",
          description:
            "Enerji tasarrufu icin yasam alanlarinin yalitimina yonelik tasarim yapar.",
          details: [
            "a) Enerji tasarrufu icin isi yalitim sisteminin aile butcesine ve ulke ekonomisine olan katkisinin onemi vurgulanir.",
            "b) Ogrencilerin isi yalitimi ile ilgili gunluk hayattan bir problem belirlemeleri ve bu problem icin cozumler uretmeleri saglanir.",
            "c) Yapilacak tasarimlarda finans bilincinin gelistirilmesi icin butce hesaplamasi yapilmasinin gerekliligi vurgulanmalidir.",
          ],
        },
        {
          code: "9.5.4.4",
          subTopicName: "Enerji Iletim Yollari ve Enerji Iletim Hizi",
          description:
            "Hissedilen ve gercek sicaklik arasindaki farkin sebeplerini yorumlar.",
        },
        {
          code: "9.5.4.5",
          subTopicName: "Enerji Iletim Yollari ve Enerji Iletim Hizi",
          description:
            "Kuresel isinmaya karsi alinacak tedbirlere yonelik proje gelistirir.",
          details: [
            "a) Ogrencilerin projelerini poster, brosur veya elektronik sunu ile tanitmalar saglanir.",
            "b) Kuresel isinmanin sebeplerine dikkat cekilir.",
            "c) Cevreye karsi duyarli olmanin gerekliligi ve bireysel olarak yapilabilecek katkilar hakkinda tartissilmasi saglanir.",
          ],
        },
        {
          code: "9.5.5.1",
          subTopicName: "Genlesme",
          description:
            "Kati ve sivilarda genlesme ve buzulme olaylarinin gunluk hayattaki etkilerini yorumlar.",
          isKeyKazanim: true,
          details: [
            "a) Kati ve sivilarin genlesmesi ve buzulmesinin gunluk hayatta olusturdugu avantaj ve dezavantajlarin tartisilmasi saglanir.",
            "b) Su ve buzun ozkutle, oz isilari karsilastirilarak gunluk hayata etkileri uzerinde durulur.",
            "c) Genlesme ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
      ],
    },

    // 9.6. ELEKTROSTATIK
    {
      topicKey: "elektrostatik",
      topicName: "Elektrostatik",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 6,
      kazanimlar: [
        {
          code: "9.6.1.1",
          subTopicName: "Elektrik Yukleri",
          description:
            "Elektrikle yuklenme cesitlerini orneklerle aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Yuk, birim yuk ve elektrikle yuklenme kavramlari verilir.",
            "b) Elektrikle yuklenmede yuklerin korunumlu oldugu vurgulanmalidir.",
            "c) Elektroskopun yuk cinsinin tayininde kullanilmasina ornekler verilir.",
          ],
        },
        {
          code: "9.6.1.2",
          subTopicName: "Elektrik Yukleri",
          description:
            "Elektriklenen iletken ve yalitkan maddelerde yuk dagilimlarini karsilastirir.",
          details: [
            "a) Ogrencilerin karsilastirmayi deneyler yaparak veya simulasyonlar kullanarak yapmalari saglanir.",
            "b) Faraday kafesi, kullanim alanlari ve onemi aciklanir.",
            "c) Topraklama olayi aciklanarak gunluk hayattaki onemi vurgulanir.",
          ],
        },
        {
          code: "9.6.1.3",
          subTopicName: "Elektrik Yukleri",
          description:
            "Elektrik yuklu cisimler arasindaki etkilesimi aciklar.",
          details: [
            "a) Deney veya simulasyonlardan yararlanilarak elektrik yuklu cisimler arasindaki etkilesimin (Coulomb Kuvveti) bagli oldugu degiskenler arasindaki iliskiyi belirlemeleri saglanir. Matematiksel model verilir.",
            "b) Yuklerin etkilesimi ile ilgili noktasal yuklerle ve tek boyutta matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "9.6.1.4",
          subTopicName: "Elektrik Yukleri",
          description: "Elektrik alan kavramini aciklar.",
          details: [
            "Deney veya simulasyonlardan yararlanilarak elektrik alan kavrami ile elektriksel kuvvet arasindaki iliski aciklanir. Matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
          ],
        },
      ],
    },

    // ============================================================
    //  FIZIK — TYT (10. sinif)
    // ============================================================

    // 10.1. ELEKTRIK VE MANYETIZMA
    {
      topicKey: "elektrik_ve_manyetizma_10",
      topicName: "Elektrik ve Manyetizma",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 7,
      kazanimlar: [
        {
          code: "10.1.1.1",
          subTopicName: "Elektrik Akimi, Potansiyel Farki ve Direnc",
          description:
            "Elektrik akimi, direnc ve potansiyel farki kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Elektrik yukuunun hareketi uzerinden elektrik akimi kavraminin aciklanmasi saglanir.",
            "b) Kati, sivi, gaz ve plazmalarda elektrik iletimine deginilir.",
          ],
        },
        {
          code: "10.1.1.2",
          subTopicName: "Elektrik Akimi, Potansiyel Farki ve Direnc",
          description:
            "Kati bir iletkenin direncinin bagli oldugu degiskenleri analiz eder.",
          details: [
            "a) Deney veya simulasyonlardan yararlanarak degiskenler arasindaki iliskiyi belirlemeleri ve matematiksel modeli cikarmalari saglanir. Matematiksel hesaplamalara girilmez.",
            "b) Iletken direncinin sicakliga bagli degisimine ve renk kodlariyla direnc okuma islemlerine girilmez.",
          ],
        },
        {
          code: "10.1.2.1",
          subTopicName: "Elektrik Devreleri",
          description:
            "Elektrik Akimi, direnc ve potansiyel farki arasindaki iliskiyi analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Voltmetre ve ampermetrenin direnc ozellikleri ile devredeki gorevleri aciklanir.",
            "b) Ogrencilerin basit devreler uzerinden deney yaparak elektrik akimi, direnc ve potansiyel farki arasindaki iliskinin (Ohm Yasasi) matematiksel modelini cikarmalari saglanir.",
            "c) Elektrik devrelerinde esdeger direnc, direnc, potansiyel farki ve elektrik akimi ile ilgili matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "10.1.2.2",
          subTopicName: "Elektrik Devreleri",
          description:
            "Ureteclerin seri ve paralel baglanma gerekcelerin aciklar.",
          details: [
            "a) Ogrencilerin deney veya simulasyonlarla ureteclerin baglanma sekillerini incelemeleri ve tukenme surelerini karsilastirmalari saglanir. Ureteclerin ters baglanmasi da dikkate alinir.",
            "b) Elektromotor kuvvetleri farkli ureteclerin paralele baglanmasina girilmez.",
            "c) Ureteclerin ic direncleri orneklerle aciklanir, ic direncler ile ilgili matematiksel hesaplamalara girilmez.",
            "c) Ogrencilerin uretecin kesfi uzerine deneyler yapan bilim insanlari Galvani ve Volta'nin bakis acilari arasindaki farki tartismalari saglanir.",
            "d) Kirchhoff Kanunlarina girilmez.",
          ],
        },
        {
          code: "10.1.2.3",
          subTopicName: "Elektrik Devreleri",
          description:
            "Elektrik enerjisi ve elektriksel guc kavramlarini iliskilendirir.",
          details: [
            "a) Elektrik enerjisi ve elektriksel guc iliskisi ile mekanik enerji ve mekanik guc iliskisi arasindaki benzerlige deginilir.",
            "b) Bir direncin birim zamanda harcadigi elektrik enerjisi ile ilgili hesaplamalar disinda matematiksel hesaplamalara girilmez.",
            "c) Ogrencilerin isi, is, mekanik enerji ve elektrik enerjisinin birbirine donusumunu aciklamalari saglanir.",
            "c) Lamba parlakliklarinin karsilastirilmasi saglanir.",
          ],
        },
        {
          code: "10.1.2.4",
          subTopicName: "Elektrik Devreleri",
          description:
            "Elektrik akiminin olusturabilecegi tehlikelere karsi alinmasi gereken saglik ve guvenlik onlemlerini aciklar.",
        },
        {
          code: "10.1.3.1",
          subTopicName: "Miknatıs ve Manyetik Alan",
          description:
            "Miknatislarin olusturdugu manyetik alani ve ozelliklerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin deneyler yaparak veya simulasyonlar kullanarak manyetik alani incelemeleri saglanir.",
            "b) Miknatislarin manyetik alaninin manyetik alan cizgileri ile temsil edildigi vurgulanir.",
            "c) Miknatislarin itme-cekme kuvvetleri ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.1.4.1",
          subTopicName: "Akim ve Manyetik Alan",
          description:
            "Uzerinden akim gecen duz bir iletken telin olusturdugu manyetik alani etkileyen degiskenleri analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin deneyler yaparak veya simulasyonlar kullanarak manyetik alani etkileyen degiskenleri belirlemeleri saglanir.",
            "b) Sag el kurali verilir. Manyetik alanin yonu ve siddeti ile ilgili matematiksel hesaplamalara girilmez.",
            "c) Yuksek gerilim hatlarinin gectigi alanlarda olusan manyetik alanin canlilar uzerindeki etkilerine deginilir.",
            "c) Elektromiknatıs tanitilarak kullanim alanlarina ornekler verilir.",
          ],
        },
        {
          code: "10.1.4.2",
          subTopicName: "Akim ve Manyetik Alan",
          description:
            "Dunya'nin manyetik alaninin sonuclarini aciklar.",
          details: [
            "a) Ogrencilerin pusula ile yon bulmalari saglanir.",
            "b) Arilar, gocmen kuslar, bazi buyukbas hayvanlar gibi canlilarin yerin manyetik alanindan yararlanarak yon bulduklari belirtilir.",
          ],
        },
      ],
    },

    // 10.2. BASINC VE KALDIRMA KUVVETI
    {
      topicKey: "basinc_ve_kaldirma_kuvveti",
      topicName: "Basinc ve Kaldirma Kuvveti",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 8,
      kazanimlar: [
        {
          code: "10.2.1.1",
          subTopicName: "Basinc",
          description:
            "Basinc ve basinc kuvveti kavramlarinin kati, durgun sivi ve gazlarda bagli oldugu degiskenleri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin, gunluk hayattan basincin hayatimiza etkilerine ornekler vermeleri saglanir. Basincin hal degisimine etkileri vurgulanir.",
            "b) Kati ve durgun sivi basinci ve basinc kuvveti ile ilgili matematiksel modeller verilir. Bilesenlerine ayirma ve matematiksel hesaplamalara girilmez.",
            "c) Torricelli deneyi aciklanir ve kilcallik ile farki belirtilir.",
            "c) Basinc etkisiyle calisan olcum aletlerinden barometre, altimetre, manometre ve batimetre hakkinda bilgi verilir.",
            "d) Pascal Prensibi'ne deginilir. Gaz basinci ve Pascal Prensibi ile ilgili matematiksel modeller verilmez.",
          ],
        },
        {
          code: "10.2.1.2",
          subTopicName: "Basinc",
          description:
            "Akiskanlarda akis surati ile akiskan basinci arasinda iliski kurar.",
          details: [
            "a) Deney veya simulasyonlardan yararlanilarak kesit alani, basinc ve akiskan surati arasinda baglanti kurulmasi saglanir.",
            "b) Bernoulli Ilkesi'nin gunluk hayattaki ornekler (catilarin ucmasi, semsiyenin ters cevrilmesi, ruzgarli havalarda kapilarin sert kapanmasi gibi) uzerinden aciklanmasi saglanir.",
            "c) Bernoulli Ilkesi'yle ilgili matematiksel hesaplamalara girilmez.",
            "c) Gunluk hayatta akiskan basincinin saglayabilecegi kolayliklar (ucaklarin ucmasi gibi) ve olumsuz etkilerine karsi alinmasi gereken saglik ve guvenlik tedbirleri (yuksek suratle hareket eden araclara yakasilmamasi gibi) vurgulanir.",
            "d) Tansiyonun damarlardaki kan basinci oldugu vurgulanarak ogrencilerin tansiyon aletinin calisma prensibini arastirmalari saglanir.",
          ],
        },
        {
          code: "10.2.2.1",
          subTopicName: "Kaldirma Kuvveti",
          description:
            "Durgun akiskanlarda cisimlere etki eden kaldirma kuvvetinin basinc kuvveti farkindan kaynaklandigini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Archimedes Ilkesi aciklanir. Yuzme, askida kalma ve batma durumlarinda kaldirma kuvveti ile cismin agirliginin buyuklukleri karsilastirilir.",
            "b) Kaldirma kuvveti ile ilgili matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.2.2.2",
          subTopicName: "Kaldirma Kuvveti",
          description:
            "Kaldirma kuvvetiyle ilgili belirledigi gunluk hayattaki problemlere kaldirma kuvveti ve/veya Bernoulli Ilkesi'ni kullanarak cozum onerisi uretir.",
        },
      ],
    },

    // 10.3. DALGALAR
    {
      topicKey: "dalgalar",
      topicName: "Dalgalar",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 9,
      kazanimlar: [
        {
          code: "10.3.1.1",
          subTopicName: "Dalgalar",
          description:
            "Titresim, dalga hareketi, dalga boyu, periyot, frekans, hiz ve genlik kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Deney, gozlem veya simulasyonlarla kavramlarin aciklanmasi saglanir.",
            "b) Periyot ve frekans kavramlarinin birbiriyle iliskilendirilmesi ve matematiksel model olusturulmasi saglanir. Matematiksel hesaplamalara girilmez.",
            "c) Dalganin ilerleme hizi, dalga boyu ve frekans kavramlari arasindaki matematiksel model verilir. Matematiksel hesaplamalara girilmez.",
            "c) Dalganin ilerleme hizinin ortama, frekansin kaynaga bagli oldugu vurgulanir.",
          ],
        },
        {
          code: "10.3.1.2",
          subTopicName: "Dalgalar",
          description:
            "Dalgalari tasidigi enerjiye ve titresim dogrultusuna gore siniflandirir.",
          details: [
            "Ogrencilerin dalga cesitlerine ornekler vermeleri saglanir.",
          ],
        },
        {
          code: "10.3.2.1",
          subTopicName: "Yay Dalgasi",
          description:
            "Atma ve periyodik dalga olusturarak aralarindaki farki aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Atmanin dalgalarin ozelliklerini incelemek icin olusturuldugu vurgulanir.",
            "b) Ogrencilerin deney yaparak veya simulasyonlar kullanarak atma ve periyodik dalgayi incelemeleri saglanir.",
          ],
        },
        {
          code: "10.3.2.2",
          subTopicName: "Yay Dalgasi",
          description:
            "Yaylarda atmanin yansımasini ve iletilmesini analiz eder.",
          details: [
            "a) Ogrencilerin gergin bir yayda olusturulan atmanin ilerleme hizinin bagli oldugu degiskenleri aciklamasi saglanir. Atmanin ilerleme hizi ile ilgili matematiksel hesaplamalara girilmez.",
            "b) Ogrencilerin deney yaparak veya simulasyonlar kullanarak atmalarin sabit ve serbest uctan yansima durumlarini incelemeleri saglanir.",
            "c) Bir ortamdan baska bir ortama gecerken yansiyan ve iletilen atmalarin ozellikleri uzerinde durulur.",
            "c) Ogrencilerin deney ya da simulasyonlarla iki atmanin karsilasmasi durumunda meydana gelebilecek olaylari gozlemlemesi saglanir.",
          ],
        },
        {
          code: "10.3.3.1",
          subTopicName: "Su Dalgasi",
          description:
            "Dalgalarin ilerleme yonu, dalga tepesi ve dalga cukuru kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "Kavramlar dogrusal ve dairesel su dalgalari baglaminda ele alinir.",
          ],
        },
        {
          code: "10.3.3.2",
          subTopicName: "Su Dalgasi",
          description:
            "Dogrusal ve dairesel su dalgalarinin yansima hareketlerini analiz eder.",
          details: [
            "a) Ogrencilerin deney yaparak veya simulasyonlar kullanarak su dalgalarinin yansima hareketlerini cizmeleri saglanir.",
            "b) Dogrusal su dalgalarinin dogrusal ve parabolik engellerden yansimasi dikkate alinir.",
            "c) Dairesel su dalgalarinin dogrusal engelden yansimasi dikkate alinir, parabolik engelden yansimasinda ise sadece odak noktasi ve merkezden gonderilen dalgalar dikkate alinir.",
            "c) Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.3.3.3",
          subTopicName: "Su Dalgasi",
          description:
            "Ortam derinligi ile su dalgalarinin yayilma hizini iliskilendirir.",
          details: [
            "a) Ogrencilerin deney yaparak veya simulasyonlarla ortam derinliginin dalganin hizina etkisini incelemeleri ve dalga boyundaki degisimi gozlemlemeleri saglanir.",
            "b) Ortam degistiren su dalgalarinin dalga boyu ve hiz degisimi ile ilgili matematiksel hesaplamalara girilmez.",
            "c) Stroboskopun dalga boyu olcumunde kullanildigindan bahsedilir, matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.3.3.4",
          subTopicName: "Su Dalgasi",
          description:
            "Dogrusal su dalgalarinin kirilma hareketini analiz eder.",
          details: [
            "a) Ogrencilerin deney yaparak veya simulasyonlar kullanarak su dalgalarinin kirilma hareketlerini cizmeleri saglanir. Su dalgalarinin mercek seklindeki su ortamindan gecisi ile ilgili kirilma hareketlerine girilmez.",
            "b) Dairesel su dalgalarinin kirilmasi konusuna girilmez.",
            "c) Su dalgalarinin kirilma hareketi ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.3.4.1",
          subTopicName: "Ses Dalgasi",
          description:
            "Ses dalgalari ile ilgili temel kavramlari orneklerle aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Yukseklik, siddet, tini, rezonans ve yanki kavramlari ile sinirli kalinir.",
            "b) Ugultu, gurultu ve ses kirliligi kavramlarina deginilir.",
            "c) Farabi'nin ses dalgalari ile ilgili yaptigi calismalar hakkinda kisaca bilgi verilir.",
          ],
        },
        {
          code: "10.3.4.2",
          subTopicName: "Ses Dalgasi",
          description:
            "Ses dalgalarinin tip, denizcilik, sanat ve cografya alanlarinda kullanimina ornekler verir.",
        },
        {
          code: "10.3.5.1",
          subTopicName: "Deprem Dalgasi",
          description: "Deprem dalgasini tanimlar.",
          isKeyKazanim: true,
          details: [
            "a) Depremin buyuklugu ve siddeti ile ilgili bilgi verilir.",
            "b) Depremlerde dalga cesitlerine girilmez.",
          ],
        },
        {
          code: "10.3.5.2",
          subTopicName: "Deprem Dalgasi",
          description:
            "Deprem kaynakli can ve mal kayiplarini onlemeye yonelik cozum onerileri gelistirir.",
        },
      ],
    },

    // 10.4. OPTIK
    {
      topicKey: "optik",
      topicName: "Optik",
      examType: "TYT",
      subjectName: "Fizik",
      sortOrder: 10,
      kazanimlar: [
        {
          code: "10.4.1.1",
          subTopicName: "Aydinlanma",
          description: "Isigin davranis modellerini aciklar.",
          isKeyKazanim: true,
          details: [
            "Modeller aciklanirken ayrintilara girilmez.",
          ],
        },
        {
          code: "10.4.1.2",
          subTopicName: "Aydinlanma",
          description:
            "Isik siddeti, isik akisi ve aydinlanma siddeti kavramlari arasinda iliski kurar.",
          details: [
            "a) Deney yaparak veya simulasyonlarla aydinlanma siddeti, isik siddeti, isik akisi kavramlari arasinda iliski kurulur.",
            "b) Isik siddeti, isik akisi ve aydinlanma siddeti kavramlari ile ilgili matematiksel modeller verilir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.2.1",
          subTopicName: "Golge",
          description:
            "Saydam, yari saydam ve saydam olmayan maddelerin isik gecirme ozelliklerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin golge ve yari golge alanlarini cizmeleri ve aciklamalari saglanir.",
            "b) Golge ve yari golge ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.3.1",
          subTopicName: "Yansima",
          description:
            "Isigin yansimasini, su dalgalarinda yansima olayiyla iliskilendirir.",
          isKeyKazanim: true,
          details: [
            "a) Yansima Kanunlari uzerinde durulur.",
            "b) Isigin duzgun ve daginik yansimasinin cizilerek gosterilmesi saglanir.",
            "c) Gorme olayinda yansimanin rolu vurgulanir.",
          ],
        },
        {
          code: "10.4.4.1",
          subTopicName: "Duzlem Ayna",
          description:
            "Duzlem aynada goruntu olusumunu aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Duzlem aynada goruntu ozellikleri yapilan cizimler uzerinden aciklanir.",
            "b) Kesisen ayna, aynanin dondurlmesi, hareketli ayna ve hareketli cisim konularina girilmez.",
            "c) Deney veya simulasyonlarla gorus alanina etki eden degiskenler ile ilgili cikarim yapilmasi saglanir. Cikarim yapilirken saydam ve saydam olmayan engeller de dikkate alinir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.5.1",
          subTopicName: "Kuresel Aynalar",
          description:
            "Kuresel aynalarda odak noktasi, merkez, tepe noktasi ve asal eksen kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "Kuresel aynalarda ozel isinlarin yansimasinin cizilmesi saglanir.",
          ],
        },
        {
          code: "10.4.5.2",
          subTopicName: "Kuresel Aynalar",
          description:
            "Kuresel aynalarda goruntu olusumunu ve ozelliklerini aciklar.",
          details: [
            "a) Deney veya simulasyonlarla goruntu olusumunun ve olusan goruntu ozelliklerinin yorumlanmasi saglanir.",
            "b) Ogrencilerin gunluk hayatta karsilastiklari kuresel ayna gibi davranan cisimlere ornekler vermeleri saglanir.",
            "c) Kuresel aynalarla ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.6.1",
          subTopicName: "Kirilma",
          description:
            "Isigin kirilmasini, su dalgalarinda kirilma olayi ile iliskilendirir.",
          isKeyKazanim: true,
          details: [
            "a) Deney veya simulasyonlar kullanilarak ortam degistiren isigin ilerleme dogrultusundan sapma miktarinin bagli oldugu degiskenleri belirlemeleri saglanir. Snell Yasasi'nin matematiksel modeli verilir.",
            "b) Kirilma indisinin, isigin ortamdaki ortalama hizi ve boslujaktaki hizi ile iliskili bir bagil degisken oldugu vurgulanir.",
            "c) Snell Yasasi ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.6.2",
          subTopicName: "Kirilma",
          description:
            "Isigin tam yansima olayini ve sinir acisini analiz eder.",
          details: [
            "a) Ogrencilerin deney veya simulasyonlarla olusturulan tam yansima olayini ve sinir acisini yorumlamalari saglanir.",
            "b) Tam yansimanin gerceklestigi fiber optik teknolojisi, serap olayi, havuz isiklandirmasi orneklerine yer verilir.",
            "c) Tam yansima ve sinir acisi ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.6.3",
          subTopicName: "Kirilma",
          description:
            "Farkli ortamda bulunan bir cismin gorunur uzakligini etkileyen sebepleri aciklar.",
          details: [
            "a) Ogrencilerin deney yaparak isigin izledigi yolu cizmeleri ve gunluk hayatta gozlemlenen olaylarla iliski kurmalari saglanir.",
            "b) Gorunur uzaklikla ilgili matematiksel model verilmez. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.7.1",
          subTopicName: "Mercekler",
          description:
            "Merceklerin ozelliklerini ve mercek cesitlerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Merceklerin odak uzakliginin bagli oldugu faktorlere deginilir. Matematiksel model verilmez.",
            "b) Cam siselerin ve cam kiriklarinin mercek gibi davranarak orman yanginlarina sebep oldugu aciklanir. Cevre temizligi ve dogal hayati korumanin onemi vurgulanir.",
          ],
        },
        {
          code: "10.4.7.2",
          subTopicName: "Mercekler",
          description:
            "Merceklerin olusturdugu goruntunun ozelliklerini aciklar.",
          details: [
            "a) Merceklerdeki ozel isinlar verilir. Goruntu olusumlarına dair cizimler yaptirilmaz.",
            "b) Deney veya simulasyonlar yardimiyla merceklerin olusturdugu goruntu ozelliklerinin incelenmesi saglanir.",
            "c) Ogrencilerin merceklerin nerelerde ve ne tur amaclar icin kullanildigina ornekler vermeleri saglanir.",
            "c) Mercekler ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "10.4.8.1",
          subTopicName: "Prizmalar",
          description:
            "Isik prizmalarinin ozelliklerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin deney veya simulasyonlar yardimiyla prizmalarda tek renkli isigin izledigi yolu cizmeleri saglanir.",
            "b) Ogrencilerin deney veya simulasyonlarla beyaz isigin prizmada renklerine ayrilmasi olayini gozlemlemeleri saglanir.",
            "c) Isik prizmalarinin kullanim alanlarina ornekler verilir.",
            "c) Prizmalar ile ilgili matematiksel modeller verilmez.",
          ],
        },
        {
          code: "10.4.9.1",
          subTopicName: "Renk",
          description:
            "Cisimlerin renkli gorulmesinin sebeplerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin isik ve boya renkleri arasindaki farklari karsilastirmalari saglanir.",
            "b) Isik ve boya renklerini ana, ara ve tamamlayici olarak siniflandirmalari saglanir. Isikta ana renklerin boyada ara renk, isikta ara renklerin boyada ana renk oldugu vurgulanir.",
            "c) Isik renklerinden saf sari ile karisim sari arasindaki fark vurgulanir.",
            "c) Ogrencilerin beyaz isigin ve farkli renklerdeki isigin filtreden gecisine ve sogurulmasina iliskin ornekler vermeleri saglanir.",
          ],
        },
      ],
    },

    // ============================================================
    //  FIZIK — AYT (11-12. sinif)
    // ============================================================

    // 11.1. KUVVET VE HAREKET
    {
      topicKey: "kuvvet_ve_hareket",
      topicName: "Kuvvet ve Hareket",
      examType: "AYT",
      subjectName: "Fizik",
      sortOrder: 11,
      kazanimlar: [
        {
          code: "11.1.1.1",
          subTopicName: "Vektorler",
          description: "Vektorlerin ozelliklerini aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "11.1.1.2",
          subTopicName: "Vektorler",
          description:
            "Iki ve uc boyutlu kartezyen koordinat sisteminde vektorleri cizer.",
          details: [
            "Birim vektor sistemi (i, j, k) islemlerine girilmez.",
          ],
        },
        {
          code: "11.1.1.3",
          subTopicName: "Vektorler",
          description:
            "Vektorlerin bileskelerini farkli yontemleri kullanarak hesaplar.",
          details: [
            "a) Uc uca ekleme ve paralel kenar yontemleri kullanilmalidir.",
            "b) Kosinus teoremi verilerek bileske vektorun buyuklugunun bulunmasi saglanir.",
            "c) Esit buyuklukteki vektorlerin bileskesi hesaplanirken acilara gore ozel durumlar verilir.",
          ],
        },
        {
          code: "11.1.1.4",
          subTopicName: "Vektorler",
          description:
            "Bir vektorun iki boyutlu kartezyen koordinat sisteminde bilesenlerini cizerek buyukluklerini hesaplar.",
        },
        {
          code: "11.1.2.1",
          subTopicName: "Bagil Hareket",
          description:
            "Sabit hizli iki cismin hareketini birbirine gore yorumlar.",
          isKeyKazanim: true,
        },
        {
          code: "11.1.2.2",
          subTopicName: "Bagil Hareket",
          description:
            "Hareketli bir ortamdaki sabit hizli cisimlerin hareketini farkli gozlem cercevelerine gore yorumlar.",
        },
        {
          code: "11.1.2.3",
          subTopicName: "Bagil Hareket",
          description:
            "Bagil hareket ile ilgili hesaplamalar yapar.",
          details: [
            "Hesaplamalarla ilgili problemlerin gunluk hayattan secilmesine ozen gosterilir.",
          ],
        },
        {
          code: "11.1.3.1",
          subTopicName: "Newton'in Hareket Yasalari",
          description:
            "Net kuvvetin yonunu belirleyerek buyuklugunu hesaplar.",
          isKeyKazanim: true,
          details: [
            "a) Yatay, dusey ve egik duzlemde surtunme kuvvetinin yonu belirlenerek buyuklugunun hesaplanmasi saglanir.",
            "b) Surtunmeli ve surtunmesiz yuzeylerde serbest cisim diyagramlari uzerinde cisme etki eden kuvvetlerin gosterilmesi saglanir.",
          ],
        },
        {
          code: "11.1.3.2",
          subTopicName: "Newton'in Hareket Yasalari",
          description:
            "Net kuvvet etkisindeki cismin hareketi ile ilgili hesaplamalar yapar.",
          details: [
            "a) Hesaplamalarin gunluk hayat ornekleri uzerinden yapilmasina ozen gosterilir.",
            "b) Surtunmeli ve surtunmesiz yuzeyler dikkate alinmalidir.",
          ],
        },
        {
          code: "11.1.4.1",
          subTopicName: "Bir Boyutta Sabit Ivmeli Hareket",
          description:
            "Bir boyutta sabit ivmeli hareketi analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Hareket denklemleri verilir.",
            "b) Ogrencilerin sabit ivmeli hareket ile ilgili konum-zaman, hiz-zaman ve ivme-zaman grafiklerini cizmeleri, yorumlamalari ve grafikler arasinda donusum yapmalari saglanir.",
          ],
        },
        {
          code: "11.1.4.2",
          subTopicName: "Bir Boyutta Sabit Ivmeli Hareket",
          description:
            "Bir boyutta sabit ivmeli hareket ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.1.4.3",
          subTopicName: "Bir Boyutta Sabit Ivmeli Hareket",
          description:
            "Hava direncinin ihmal edildigi ortamda dusen cisimlerin hareketlerini analiz eder.",
          details: [
            "Ilk hizsiz birakilan cisimler icin hareket denklemleri, konum-zaman, hiz-zaman ve ivme-zaman grafikleri verilerek matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "11.1.4.4",
          subTopicName: "Bir Boyutta Sabit Ivmeli Hareket",
          description:
            "Dusen cisimlere etki eden hava direnc kuvvetinin bagli oldugu degiskenleri analiz eder.",
          details: [
            "Ogrencilerin degiskenleri deney yaparak veya simulasyonlar kullanarak belirlemeleri saglanir.",
          ],
        },
        {
          code: "11.1.4.5",
          subTopicName: "Bir Boyutta Sabit Ivmeli Hareket",
          description: "Limit hiz kavramini aciklar.",
          details: [
            "a) Limit hiz kavrami gunluk hayattan orneklerle (yagmur damlalarinin canimizi acitmamasi vb.) aciklanir.",
            "b) Limit hizin matematiksel modeli verilir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "11.1.4.6",
          subTopicName: "Bir Boyutta Sabit Ivmeli Hareket",
          description:
            "Dusey dogrultuda ilk hizi olan ve sabit ivmeli hareket yapan cisimlerin hareketlerini analiz eder.",
          details: [
            "Dusey dogrultuda (yukaridan asagiya ve asagidan yukariya) atis hareket denklemleri, konum-zaman, hiz-zaman ve ivme-zaman grafikleri verilerek matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "11.1.5.1",
          subTopicName: "Iki Boyutta Hareket",
          description:
            "Atis hareketlerini yatay ve dusey boyutta analiz eder.",
          isKeyKazanim: true,
          details: [
            "Ogrencilerin deney yaparak veya simulasyonlarla atis hareketlerini incelemeleri ve yorumlamalari saglanir.",
          ],
        },
        {
          code: "11.1.5.2",
          subTopicName: "Iki Boyutta Hareket",
          description:
            "Iki boyutta sabit ivmeli hareket ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.1.6.1",
          subTopicName: "Enerji ve Hareket",
          description:
            "Yapilan is ile enerji arasindaki iliskiyi analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Kuvvet-yol grafigindan faydalanilarak is hesaplamalari yapilir.",
            "b) Hooke Yasasi verilir.",
            "c) Grafiklerden faydalanilarak kinetik, yer cekimi potansiyel ve esneklik potansiyel enerji turlerinin matematiksel modellerine ulasilmasi saglanir.",
            "c) Matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "11.1.6.2",
          subTopicName: "Enerji ve Hareket",
          description:
            "Cisimlerin hareketini mekanik enerjinin korunumunu kullanarak analiz eder.",
          details: [
            "a) Ogrencilerin serbest dusme, atis hareketleri ve esnek yay iceren olaylari incelemeleri ve mekanik enerjinin korunumunu kullanarak matematiksel hesaplamalar yapmalari saglanir.",
            "b) Canan Dagdeviren'in yaptigi calismalar hakkinda bilgi verilir.",
          ],
        },
        {
          code: "11.1.6.3",
          subTopicName: "Enerji ve Hareket",
          description:
            "Surtunmeli yuzeylerde enerji korunumunu ve donusumlerini analiz eder.",
          details: [
            "Surtunmeli yuzeylerde hareket eden cisimlerle ilgili enerji korunumu ve donusumu ile ilgili matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "11.1.7.1",
          subTopicName: "Itme ve Cizgisel Momentum",
          description:
            "Itme ve cizgisel momentum kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Cizgisel momentumla ilgili gunluk hayattan ornekler verilir.",
            "b) Itme ve cizgisel momentum kavramlarinin matematiksel modeli verilir.",
          ],
        },
        {
          code: "11.1.7.2",
          subTopicName: "Itme ve Cizgisel Momentum",
          description:
            "Itme ile cizgisel momentum degisimi arasinda iliski kurar.",
          details: [
            "a) Ogrencilerin Newton'in ikinci hareket yasasindan faydalanarak itme ve momentum arasindaki matematiksel modeli elde etmeleri saglanir.",
            "b) Ogrencilerin kuvvet-zaman grafigindan alan hesaplamalari yapmalari ve cismin momentum degisikligi ile iliskilendirmeleri saglanir.",
            "c) Itme ve cizgisel momentum degisimi ile ilgili matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "11.1.7.3",
          subTopicName: "Itme ve Cizgisel Momentum",
          description:
            "Cizgisel momentumun korunumunu analiz eder.",
          details: [
            "a) Ogrencilerin deney yaparak veya simulasyonlar kullanarak cizgisel momentum korunumu ile ilgili cikarimda bulunmalari saglanir.",
            "b) Cizgisel momentumun korunumu bir ve iki boyutlu hareketle sinirlandirilir.",
          ],
        },
        {
          code: "11.1.7.4",
          subTopicName: "Itme ve Cizgisel Momentum",
          description:
            "Cizgisel momentumun korunumu ile ilgili hesaplamalar yapar.",
          details: [
            "Enerjinin korundugu ve korunmadigi durumlar goz onune alinarak bir ve iki boyutta cizgisel momentumun korunumu, carpismalari ve patlamalarla ilgili matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "11.1.8.1",
          subTopicName: "Tork",
          description: "Tork kavramini aciklar.",
          isKeyKazanim: true,
          details: [
            "Torkun yonunu belirlemek icin sag el kurali verilir.",
          ],
        },
        {
          code: "11.1.8.2",
          subTopicName: "Tork",
          description:
            "Torkun bagli oldugu degiskenleri analiz eder.",
          details: [
            "a) Ogrencilerin deney yaparak veya simulasyonlar kullanarak torkun bagli oldugu degiskenler ile ilgili sonuclar cikarmalari saglanir.",
            "b) Ogrencilerin tork ile ilgili gunluk hayattan problem durumlari bulmalari ve bunlar icin cozum yollari uretmeleri saglanir.",
          ],
        },
        {
          code: "11.1.8.3",
          subTopicName: "Tork",
          description: "Tork ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.1.9.1",
          subTopicName: "Denge ve Denge Sartlari",
          description: "Cisimlerin denge sartlarini aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "11.1.9.2",
          subTopicName: "Denge ve Denge Sartlari",
          description:
            "Kutle merkezi ve agirlik merkezi kavramlarini aciklar.",
          details: [
            "Kutle ve agirlik merkezi kavramlarinin farkli oldugu durumlara deginilir.",
          ],
        },
        {
          code: "11.1.9.3",
          subTopicName: "Denge ve Denge Sartlari",
          description:
            "Kutle merkezi ve agirlik merkezi ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.1.10.1",
          subTopicName: "Basit Makineler",
          description:
            "Gunluk hayatta kullanilan basit makinelerin islevlerini aciklar.",
          isKeyKazanim: true,
          details: [
            "Kaldirac, sabit ve hareketli makara, palanga, egik duzlem, vida, cirik, cark ve kasnak ile sinirli kalinir.",
          ],
        },
        {
          code: "11.1.10.2",
          subTopicName: "Basit Makineler",
          description:
            "Basit makineler ile ilgili hesaplamalar yapar.",
          details: [
            "a) Ikiden fazla basit makinenin bir arada oldugu sistemlerle ilgili matematiksel hesaplamalara girilmez.",
            "b) Hesaplamalarin gunluk hayatta kullanilan basit makine ornekleri (anahtar gibi) uzerinden yapilmasi saglanir.",
            "c) Basit makinelerde verim ile ilgili matematiksel hesaplamalar yapilmasi saglanir.",
          ],
        },
        {
          code: "11.1.10.3",
          subTopicName: "Basit Makineler",
          description:
            "Hayati kolaylastirmak amaciyla basit makinelerden olusan guvenli bir sistem tasarlar.",
          details: [
            "a) Atik malzeme ve bilisim teknolojilerinden yararlanmalari icin tesvik edilmelidir.",
            "b) Basit makine sistemlerinin kullanildigi alanlarda is sagligi ve guvenligini artirici tedbirlere yonelik arastirma yapilmasi saglanir.",
            "c) Yapilan ozgun tasarimlara patent alinabilecegi vurgulanarak ogrenciler, proje yarismalarina katilmalari konusunda tesvik edilmelidir.",
          ],
        },
      ],
    },

    // 11.2. ELEKTRIK VE MANYETIZMA
    {
      topicKey: "elektrik_ve_manyetizma_11",
      topicName: "Elektrik ve Manyetizma",
      examType: "AYT",
      subjectName: "Fizik",
      sortOrder: 12,
      kazanimlar: [
        {
          code: "11.2.1.1",
          subTopicName: "Elektriksel Kuvvet ve Elektrik Alan",
          description:
            "Yuklu cisimler arasindaki elektriksel kuvveti etkileyen degiskenleri belirler.",
          isKeyKazanim: true,
          details: [
            "a) Ogrencilerin deney veya simulasyonlardan yararlanmalari saglanir.",
            "b) Coulomb sabitinin (k), ortamin elektriksel gecirgeniligi ile iliskisi vurgulanir.",
          ],
        },
        {
          code: "11.2.1.2",
          subTopicName: "Elektriksel Kuvvet ve Elektrik Alan",
          description:
            "Noktasal yuk icin elektrik alanini aciklar.",
        },
        {
          code: "11.2.1.3",
          subTopicName: "Elektriksel Kuvvet ve Elektrik Alan",
          description:
            "Noktasal yuklerde elektriksel kuvvet ve elektrik alani ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.2.2.1",
          subTopicName: "Elektriksel Potansiyel",
          description:
            "Noktasal yukler icin elektriksel potansiyel enerji, elektriksel potansiyel, elektriksel potansiyel farki ve elektriksel is kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kavramlarin gunluk hayat ornekleri ile aciklanmasi saglanir.",
            "b) Ogrencilerin, noktasal yuklerin bir noktada olusturdugu elektrik potansiyelini ve es potansiyel yuzeylerini tanimlamalari saglanir.",
          ],
        },
        {
          code: "11.2.2.2",
          subTopicName: "Elektriksel Potansiyel",
          description:
            "Duzgun bir elektrik alan icinde iki nokta arasindaki potansiyel farkini hesaplar.",
        },
        {
          code: "11.2.2.3",
          subTopicName: "Elektriksel Potansiyel",
          description:
            "Noktasal yukler icin elektriksel potansiyel enerji, elektriksel potansiyel, elektriksel potansiyel farki ve elektriksel is ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.2.3.1",
          subTopicName: "Duzgun Elektrik Alan ve Siga",
          description:
            "Yuklu, iletken ve paralel levhalar arasinda olusan elektrik alanini, alan cizgilerini cizerek aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "11.2.3.2",
          subTopicName: "Duzgun Elektrik Alan ve Siga",
          description:
            "Yuklu, iletken ve paralel levhalar arasinda olusan elektrik alaninin bagli oldugu degiskenleri analiz eder.",
          details: [
            "Degiskenlerin deney veya simulasyonlarla belirlenmesi saglanir.",
          ],
        },
        {
          code: "11.2.3.3",
          subTopicName: "Duzgun Elektrik Alan ve Siga",
          description:
            "Yuklu parcaciklarin duzgun elektrik alandaki davranisini aciklar.",
          details: [
            "a) Alana dik giren parcaciklarin sapma yonleri uzerinde durulur. Matematiksel hesaplamalara girilmez.",
            "b) Ogrencilerin yuklu parcaciklarin elektrik alandaki davranisinin teknolojideki kullanim yerlerini arastirmalari ve sunum yapmalari saglanir.",
          ],
        },
        {
          code: "11.2.3.4",
          subTopicName: "Duzgun Elektrik Alan ve Siga",
          description: "Siga (kapasite) kavramini aciklar.",
          details: [
            "Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "11.2.3.5",
          subTopicName: "Duzgun Elektrik Alan ve Siga",
          description:
            "Siganin bagli oldugu degiskenleri analiz eder.",
          details: [
            "a) Degiskenlerin deney veya simulasyonlarla belirlenmesi saglanir.",
            "b) Ogrencilerin matematiksel modeli elde etmeleri saglanir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "11.2.3.6",
          subTopicName: "Duzgun Elektrik Alan ve Siga",
          description:
            "Yuklu levhalarin ozelliklerinden faydalanarak sigacin (kondansator) islevini aciklar.",
          details: [
            "a) Sigaclarin kullanim alanlarina yonelik arastirma yapilmasi saglanir.",
            "b) Ogrencilerin elektrik yuklerinin nasil depolanip kullanilabilecegini tartismalari ve elektrik enerjisi ile iliskilendirmeleri saglanir.",
          ],
        },
        {
          code: "11.2.4.1",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Uzerinden akim gecen iletken duz bir telin cevresinde, halkanin merkezinde ve akim makarasinin (bobin) merkez ekseninde olusan manyetik alanin siddetini etkileyen degiskenleri analiz eder.",
          isKeyKazanim: true,
          details: [
            "Manyetik alan yonunun sag el kuraliyla gosterilmesi saglanir.",
          ],
        },
        {
          code: "11.2.4.2",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Uzerinden akim gecen iletken duz bir telin cevresinde, halkanin merkezinde ve akim makarasinin merkez ekseninde olusan manyetik alan ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.2.4.3",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Uzerinden akim gecen iletken duz bir tele manyetik alanda etki eden kuvvetin yonunun ve siddetinin bagli oldugu degiskenleri analiz eder.",
          details: [
            "Manyetik kuvvet buyuklugunun matematiksel modeli verilir, sag el kuralinin uygulanmasi saglanir. Matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "11.2.4.4",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Manyetik alan icerisinde akim tasiyan dikdortgen tel cerceveye etki eden kuvvetlerin dondurme etkisini aciklar.",
          details: [
            "Donen cerceveye etki eden manyetik kuvvetlerin yonunun gosterilmesi saglanir.",
          ],
        },
        {
          code: "11.2.4.5",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Yuklu parcaciklarin manyetik alan icindeki hareketini analiz eder.",
          details: [
            "a) Ogrencilerin, sag el kuralini kullanarak yuklu parcaciklara etki eden manyetik kuvvetin yonunu bulmalari ve bu kuvvetin etkisiyle yukun manyetik alandaki yorungesini cizmeleri saglanir.",
            "b) Yuklu parcaciklarin manyetik alan icindeki hareketi ile ilgili matematiksel modeller verilmez. Matematiksel hesaplamalara girilmez.",
            "c) Ogrencilerin, manyetik kuvvetin teknolojide kullanim alanlariyla ilgili arastirma yapmalari ve paylasmasi saglanir.",
          ],
        },
        {
          code: "11.2.4.6",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description: "Manyetik aki kavramini aciklar.",
          details: [
            "Manyetik akinin matematiksel modeli verilir.",
          ],
        },
        {
          code: "11.2.4.7",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Induksiyon akimini olusturan sebeplere iliskin cikarim yapar.",
          details: [
            "Cikarimlarin deney veya simulasyonlardan yararlanilarak yapilmasi ve induksiyon akiminin matematiksel modelinin cikarilmasi saglanir.",
          ],
        },
        {
          code: "11.2.4.8",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Manyetik aki ve induksiyon akimi ile ilgili hesaplamalar yapar.",
        },
        {
          code: "11.2.4.9",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Oz-induksiyon akiminin olusma sebebini aciklar.",
          details: [
            "Oz-induksiyon akimi ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "11.2.4.10",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Yuklu parcaciklarin manyetik alan ve elektrik alandaki davranisini aciklar.",
          details: [
            "a) Lorentz kuvvetinin matematiksel modeli verilir. Matematiksel hesaplamalara girilmez.",
            "b) Lorentz kuvvetinin gunluk hayattaki uygulamalarina ornekler verilir.",
          ],
        },
        {
          code: "11.2.4.11",
          subTopicName: "Manyetizma ve Elektromanyetik Induklenme",
          description:
            "Elektromotor kuvveti olusturan sebeplere iliskin cikarim yapar.",
          details: [
            "a) Deney veya simulasyonlar yardimiyla cikarimin yapilmasi saglanir.",
            "b) Ogrencilerin elektrik motoru ve dinamonun calisma ilkelerini karsilastirmalari saglanir.",
          ],
        },
        {
          code: "11.2.5.1",
          subTopicName: "Alternatif Akim",
          description: "Alternatif akimi aciklar.",
          isKeyKazanim: true,
          details: [
            "Ogrencilerin farkli ulkelerin elektrik sebekelerinde kullanilan gerilim degerleri ile ilgili arastirma yapmalari ve arastirma bulgularina dayanarak bu degerlerin kullanilmasinin sebeplerini tartismalari saglanir.",
          ],
        },
        {
          code: "11.2.5.2",
          subTopicName: "Alternatif Akim",
          description:
            "Alternatif ve dogru akimi karsilastirir.",
          details: [
            "a) Alternatif ve dogru akimin kullanildigi yerler aciklanarak bu akimlarin karsilastirilmasi saglanir.",
            "b) Edison ve Tesla'nin alternatif akim ve dogru akim ile ilgili goruslerinin karsilastirilmasi saglanir.",
            "c) Alternatif akimin etkin ve maksimum degerleri vurgulanir.",
          ],
        },
        {
          code: "11.2.5.3",
          subTopicName: "Alternatif Akim",
          description:
            "Alternatif ve dogru akim devrelerinde direncin, bobinin ve sigacin davranisini aciklar.",
          details: [
            "Ogrencilerin simulasyonlar yardimiyla alternatif ve dogru akim devrelerinde direnc, bobin ve kondansator davranislarini ayri ayri incelemeleri, degerleri kontrol ederek gerceklesen degisiklikleri gozlemlemeleri ve yorumlamalari saglanir.",
          ],
        },
        {
          code: "11.2.5.4",
          subTopicName: "Alternatif Akim",
          description:
            "Induktans, kapasitans, rezonans ve empedans kavramlarini aciklar.",
          details: [
            "a) Vektorel gosterim yapilmaz. Akim ve gerilimin zamana bagli degisim grafiklerine girilmez.",
            "b) Her devre elemaninin kendine has bir ohmik direnci oldugu vurgulanir.",
            "c) Alternatif akim devreleri ile ilgili matematiksel hesaplamalara girilmez.",
          ],
        },
        {
          code: "11.2.6.1",
          subTopicName: "Transformatorler",
          description:
            "Transformatorlerin calisma prensibini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Primer ve sekonder gerilimi, primer ve sekonder akim siddeti, primer ve sekonder guc kavramlari aciklanir. Matematiksel hesaplamalara girilmez.",
            "b) Ideal ve ideal olmayan transformatorlerin calisma ilkesi uzerinde durulur.",
          ],
        },
        {
          code: "11.2.6.2",
          subTopicName: "Transformatorler",
          description:
            "Transformatorlerin kullanim amaclarini aciklar.",
          details: [
            "a) Ogrencilerin transformatorlerin kullanildigi yerleri arastirmalari saglanir.",
            "b) Elektrik enerjisinin tasinma surecinde transformatorlerin rolu vurgulanir.",
          ],
        },
      ],
    },

    // ============================================================
    //  FIZIK — AYT (12. sinif) — INCOMPLETE
    // ============================================================

    // 12.1. CEMBERSEL HAREKET
    {
      topicKey: "cembersel_hareket",
      topicName: "Cembersel Hareket",
      examType: "AYT",
      subjectName: "Fizik",
      sortOrder: 13,
      kazanimlar: [
        {
          code: "12.1.1.1",
          subTopicName: "Duzgun Cembersel Hareket",
          description:
            "Duzgun cembersel hareketi aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Periyot, frekans, cizgisel hiz ve acisal hiz, merkezcil ivme kavramlari verilir.",
            "b) Ogrencilerin duzgun cembersel harekette cizgisel hiz vektorunu cember uzerinde iki farkli noktada cizerek merkezcil ivmenin siddetini bulmalari ve yonunu gostermeleri saglanir. Cizgisel ivme kavramina girilmez.",
          ],
        },
        // TODO: Page 174 ends here. Pages 175-182 are MISSING.
        // Expected remaining kazanimlar for 12.1.1 (Duzgun Cembersel Hareket) and
        // likely additional sub-topics such as:
        //   - 12.1.2 Merkezcil Kuvvet
        //   - 12.1.x Kutle Cekim ve Kepler Yasalari
        // Expected additional Grade 12 units (based on typical fizik mufredat):
        //   - 12.2 Basit Harmonik Hareket
        //   - 12.3 Dalga Mekaniği (Dalga Optiği)
        //   - 12.4 Atom Fiziğine Giris ve Radyoaktivite
        //   - 12.5 Modern Fizik
      ],
    },
  ];
}
