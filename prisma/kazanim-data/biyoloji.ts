// =============================================================================
// BIYOLOJI KAZANIM DATA - OSYM 2026
// Extracted from PDF pages 207-220
// TODO: Pages 221-226 are MISSING (12. sinif content):
//   Likely missing units:
//   - 12.1. Genden Proteine (DNA replikasyonu, Protein Sentezi, Genetik Kod)
//   - 12.2. Canlilarда Enerji Donusumleri (Fotosentez, Kemosentez, Hucresel Solunum, Fermantasyon)
//   - 12.3. Bitki Biyolojisi (Bitkilerde Madde Tasimasi, Bitkisel Hormonlar, Bitkilerde Ureme)
// =============================================================================

import { TopicEntry } from "./kimya";

export function getBiyolojiTopics(): TopicEntry[] {
  return [
    // ============================================================
    //  BIYOLOJI — TYT (9-10. sinif)
    // ============================================================

    // 9.1. Yasam Bilimi Biyoloji
    {
      topicKey: "yasam_bilimi_biyoloji",
      topicName: "Yasam Bilimi Biyoloji",
      examType: "TYT",
      subjectName: "Biyoloji",
      sortOrder: 1,
      kazanimlar: [
        {
          code: "9.1.1.1",
          subTopicName: "Biyoloji ve Canlilarin Ortak Ozellikleri",
          description: "Canlilarin ortak ozelliklerini irdeler.",
          isKeyKazanim: true,
          details: [
            "a) Canli kavrami uzerinden biyolojinin gunumuzdeki anlami ile nasil kullanildigi kisaca belirtilir.",
            "b) Canlilarin; hucresel yapi, beslenme, solunum, bosaltim, hareket, uyarilara tepki, metabolizma, homeostazi, uyum, organizasyon, ureme, buyume ve gelisme ozellikleri vurgulanir.",
          ],
        },
        {
          code: "9.1.2.1",
          subTopicName: "Canlilarin Yapisinda Bulunan Temel Bilesikler",
          description: "Canlilarin yapisini olusturan organik ve inorganik bilesikleri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Su, mineraller, asitler, bazlar ve tuzlarin canlilar icin onemi belirtilir.",
            "b) Kalsiyum, potasyum, demir, iyot, flor, magnezyum, sodyum, fosfor, klor, kukurt, cinko minerallerinin canlilar icin onemi vurgulanir.",
            "c) Karbonhidratlarin, lipitlerin, proteinlerin, nukleik asitlerin, enzimlerin yapisi, gorevi ve canlilar icin onemi belirtilir.",
            "d) DNA'nin tum canli turlerinde bulundugu ve ayni nukleotitleri icerdigi vurgulanir.",
            "e) ATP'nin ve hormonlarin kimyasal formullerine yer verilmeden canlilar icin onemi sorgulanir.",
            "f) Vitaminlerin genel ozellikleri verilir. A, D, E, K, B ve C vitaminlerinin gorevleri ve canlilar icin onemi belirtilir. B grubu vitaminlerinin cesitlerine girilmez.",
            "g) Ogrencilerin besinlerdeki karbonhidrat, lipit ve proteinin varligini tespit edebilecekleri deneyler yapmalari saglanir.",
            "h) Enzim aktivitesine etki eden faktorlerle ilgili deneyler yapilmasi saglanir.",
          ],
        },
        {
          code: "9.1.2.2",
          subTopicName: "Canlilarin Yapisinda Bulunan Temel Bilesikler",
          description: "Lipit, karbonhidrat, protein, vitamin, su ve minerallerin saglikli beslenme ile iliskisini kurar.",
          details: [
            "a) Insulin direnci, diyabet ve obeziteye saglikli beslenme baglaminda deginilir.",
            "b) Ogrencilerin kendi yas grubu icin bir haftalik saglikli beslenme programi hazirlamalari saglanir.",
          ],
        },
      ],
    },

    // 9.2. Hucre
    {
      topicKey: "hucre",
      topicName: "Hucre",
      examType: "TYT",
      subjectName: "Biyoloji",
      sortOrder: 2,
      kazanimlar: [
        {
          code: "9.2.1.1",
          subTopicName: "Hucre",
          description: "Hucre teorisine iliskin calismalari aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Hucreye iliskin bilgilere tarihsel surec icerisinde katki saglayan bilim insanlarina (Robert Hooke, Antonie van Leeuwenhoek, Matthias Schleiden, Theodor Schwann ve Rudolf Virchow) ornekler verilir. Ancak bu isimlerin ezberlenmesi ve kronolojik sirasinin bilinmesi beklenmez.",
            "b) Mikroskop cesitleri ve ileri goruntuleme teknolojilerinin kullanimasinin hucre teorisine katkilari arastirilir.",
          ],
        },
        {
          code: "9.2.1.2",
          subTopicName: "Hucre",
          description: "Hucresel yapilari ve gorevlerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Prokaryot hucrelerin kisimlari gosterilir.",
            "b) Okaryot hucrelerin yapisi ve bu yapiyi olusturan kisimlar gosterilir.",
            "c) Organellerin hucrede aldiklari gorevler bakimindan incelenmesi saglanir.",
            "d) Hucre orneklerinin mikroskop ile incelenmesi saglanir.",
            "e) Hucre ici is birligi ve organizasyona dikkat cekilerek herhangi bir organelde olusan problemin hucreye olasi etkilerinin tartişilmasi saglanir.",
          ],
        },
        {
          code: "9.2.1.3",
          subTopicName: "Hucre",
          description: "Hucre zarindan madde gecisine iliskin kontrollu bir deney yapar.",
          details: [
            "a) Hucre zarindan madde gecisine iliskin deney oncesi bilimsel yontem basamaklari bir ornekle aciklanir.",
            "b) Biyoloji laboratuvarinda kullanilan temel arac gerecler tanitilarak laboratuvar guvenligi vurgulanir.",
            "c) Hucre zarindan madde gecisini etkileyen faktorlerden (yuzey alani, konsantrasyon farki, sicaklik) biri hakkinda kontrollu deney yaptirilir.",
          ],
        },
      ],
    },

    // 9.3. Canlilar Dunyasi
    {
      topicKey: "canlilar_dunyasi",
      topicName: "Canlilar Dunyasi",
      examType: "TYT",
      subjectName: "Biyoloji",
      sortOrder: 3,
      kazanimlar: [
        {
          code: "9.3.1.1",
          subTopicName: "Canlilarin Cesitliligi ve Siniflandirilmasi",
          description: "Canlilarin cesitliliginin anlasilmasinda siniflandirmanin onemini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Canlilarin siniflandirilmasinda bilim insanlarinin kullandigi farkli olcut ve yaklasimlаr tartisılır.",
            "b) Canli cesitliligindeki degisimler nesli tukenmis canlilar ornegi uzerinden tartisılır.",
          ],
        },
        {
          code: "9.3.1.2",
          subTopicName: "Canlilarin Cesitliligi ve Siniflandirilmasi",
          description: "Canlilarin siniflandirilmasinda kullanilan kategoriler ve bu kategoriler arasindaki hiyerarsiyi orneklerle aciklar.",
          details: [
            "a) Canlilarin siniflandirilmasinda sadece tur, cins, aile, takim, sinif, sube ve alem kategorilerinin genel ozelliklerine deginilir.",
            "b) Carolus Linnaeus'un siniflandirmayla ilgili calismalarina deginilir.",
            "c) Hiyerarsik kategoriler dikkate alinarak cevreden secilecek canli turleriyle ilgili ikili adlandirma ornekleri verilir.",
          ],
        },
        {
          code: "9.3.2.1",
          subTopicName: "Canli Alemleri ve Ozellikleri",
          description: "Canlilarin siniflandirilmasinda kullanilan alemleri ve bu alemlerin genel ozelliklerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Bakteriler, arkeler, protistler, bitkiler, mantarlar, hayvanlar alemlerinin genel ozellikleri aciklanarak ornekler verilir. Hayvanlar aleminin disinda diger alemlerin siniflandirmasina girilmez.",
            "b) Hayvanlar aleminin; omurgasiz hayvanlar (sungerler, solentereler, solucanlar, yumusakçaklar, eklembacaklilar, derisidikenliler) ve omurgali hayvanlar (baliklar, iki yasamlilar, surungenler, kuslar, memeliler) subelerinin, siniflarina ait genel ozellikler belirtilerek ornekler verilir, yapi ve sistematigine girilmez.",
            "c) Canlilarin siniflandirmasi baglaminda, bilimsel bilginin sinandigi, duzeltildigi veya yenilendigi belirtilir.",
          ],
        },
        {
          code: "9.3.2.2",
          subTopicName: "Canli Alemleri ve Ozellikleri",
          description: "Canlilarin biyolojik sureclere, ekonomiye ve teknolojiye katkilarini orneklerle aciklar.",
          details: [
            "Canlilardan esinlenilerek gelistirilen teknolojilere ornekler verilir.",
          ],
        },
        {
          code: "9.3.2.3",
          subTopicName: "Canli Alemleri ve Ozellikleri",
          description: "Viruslerin genel ozelliklerini aciklar.",
          details: [
            "a) Viruslerin biyolojik siniflandirma kategorileri icine alinmamasinin nedenleri uzerinde durulur.",
            "b) Viruslerin insan sagligi uzerine etkilerinin kuduz, hepatit, grip, ucuk ve AIDS hastaliklari uzerinden tartisilmasi saglanir. Virutik hastaliklara karsi alinacak onlemler vurgulanir.",
            "c) Viruslerin genetik muhendisligi alaninda yapilan calismalar icin yeni imkanlar sundugu vurgulanir.",
          ],
        },
      ],
    },

    // 10.1. Hucre Bolunmeleri
    {
      topicKey: "hucre_bolunmeleri",
      topicName: "Hucre Bolunmeleri",
      examType: "TYT",
      subjectName: "Biyoloji",
      sortOrder: 4,
      kazanimlar: [
        {
          code: "10.1.1.1",
          subTopicName: "Mitoz ve Eseysiz Ureme",
          description: "Canlilarda hucre bolunmesinin gerekliligini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Hucre bolunmesinin canlilarda ureme, buyume ve gelisme ile iliskilendirilerek aciklanmasi saglanir.",
            "b) Bolunmenin hucresel gerekceleri uzerinde durulur.",
          ],
        },
        {
          code: "10.1.1.2",
          subTopicName: "Mitoz ve Eseysiz Ureme",
          description: "Mitozu aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Interfaz temel duzeyde islenir.",
            "b) Mitozun evreleri temel duzeyde islenir.",
            "c) Hucre bolunmesinin kontrolu ve bunun canlilar icin onemi uzerinde durulur. Hucre bolunmesini kontrol eden molekullerin isimleri verilmez.",
            "d) Hucre bolunmesinin kanserle iliskisi kurulur.",
          ],
        },
        {
          code: "10.1.1.3",
          subTopicName: "Mitoz ve Eseysiz Ureme",
          description: "Eseysiz uremeyi orneklerle aciklar.",
          details: [
            "a) Eseysiz ureme baglaminda bolunerek ureme, tomurcuklanma, sporla ureme, rejenerasyon, partenogenez ve bitkilerde vejetatif ureme ornekleri verilir. Sporla uremede sadece ornek verilir, dol almasina girilmez.",
            "b) Eseysiz ureme tekniklerinin bahcecilik ve tarim sektorlerindeki uygulamalari (celikle ve soganla ureme sekilleri) orneklendirilir.",
          ],
        },
        {
          code: "10.1.2.1",
          subTopicName: "Mayoz ve Eseyli Ureme",
          description: "Mayozu aciklar.",
          details: [
            "a) Mayozun evreleri temel duzeyde islenir.",
            "b) Ogrencilerin mayozu aciklayan bir elektronik sunu (animasyon, video vb.) hazirlamalari ve bu sunuyu paylasmalari saglanir.",
          ],
        },
        {
          code: "10.1.2.2",
          subTopicName: "Mayoz ve Eseyli Ureme",
          description: "Eseyli uremeyi orneklerle aciklar.",
          details: [
            "a) Dis dollenme ve ic dollenme konusu verilmez.",
            "b) Eseyli uremenin temelinin mayoz ve dollenme oldugu aciklanir.",
          ],
        },
      ],
    },

    // 10.2. Kalitimin Genel Ilkeleri
    {
      topicKey: "kalitimin_genel_ilkeleri",
      topicName: "Kalitimin Genel Ilkeleri",
      examType: "TYT",
      subjectName: "Biyoloji",
      sortOrder: 5,
      kazanimlar: [
        {
          code: "10.2.1.1",
          subTopicName: "Kalitim ve Biyolojik Cesitlilik",
          description: "Kalitimin genel esaslarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Mendel ilkeleri orneklerle aciklanir.",
            "b) Monohibrit, dihibrit ve kontrol caprazlamalari, es baskinlik, cok alellilik (Kan gruplariyla iliskilendirilir.) ornekler uzerinden islenir. Eksik baskinlik ve pleiotropizme girilmez.",
            "c) Eseye bagli kalitim; hemofili ve kismi renk korlugu hastaliklari baglaminda ele alinir. Eseye bagli kalitimin Y kromozomunda da goruldugu belirtilir.",
            "d) Soyagaci orneklerle aciklanir.",
            "e) Kalitsal hastaliklarin ortaya cikma olasiliginun akraba evlilikleri sonucunda arttigi vurgusu yapilir.",
          ],
        },
        {
          code: "10.2.1.2",
          subTopicName: "Kalitim ve Biyolojik Cesitlilik",
          description: "Genetik varyasyonlarin biyolojik cesitliligi aciklamadaki rolunu sorgular.",
          details: [
            "a) Varyasyonlarin kaynaklarinin (mutasyon, kromozomlarin bagimsiz dagilimi ve krossing over) tartisılmasi saglanir. Mutasyon cesitlerine girilmez.",
            "b) Biyolojik cesitliligin canlilarin genotiplerindeki farkliliklerdan kaynaklandigini aciklanir.",
          ],
        },
      ],
    },

    // 10.3. Ekosistem Ekolojisi ve Guncel Cevre Sorunlari
    {
      topicKey: "ekosistem_ekolojisi",
      topicName: "Ekosistem Ekolojisi ve Guncel Cevre Sorunlari",
      examType: "TYT",
      subjectName: "Biyoloji",
      sortOrder: 6,
      kazanimlar: [
        {
          code: "10.3.1.1",
          subTopicName: "Ekosistem Ekolojisi",
          description: "Ekosistemin canli ve cansiz bilesenleri arasindaki iliskiyi aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Populasyon, komunite ve ekosistem arasindaki iliski orneklerle aciklanir.",
            "b) Ekosistemde olusabilecek herhangi bir degisikligin sistemdeki olasi sonuclari uzerinde durulur.",
            "c) Ogrencilerin kendi sececekleri bir ekosistemi tanitan bir sunu hazirlamalari saglanir.",
          ],
        },
        {
          code: "10.3.1.2",
          subTopicName: "Ekosistem Ekolojisi",
          description: "Canlilardaki beslenme sekillerini orneklerle aciklar.",
          details: [
            "Simbiyotik yasama girilmez.",
          ],
        },
        {
          code: "10.3.1.3",
          subTopicName: "Ekosistem Ekolojisi",
          description: "Ekosistemde madde ve enerji akisini analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Madde ve enerji akisinda uretici, tuketici ve ayristircilarin rolunun incelenmesi saglanir.",
            "b) Ekosistemlerde madde ve enerji akisi; besin zinciri, besin agi ve besin piramidi ile iliskilendirilerek orneklendirilir.",
            "c) Biyolojik birikimin insan sagligi ve diger canlilar uzerine olumsuz etkilerinin arastirilmasi ve tartisılmasi saglanir.",
            "d) Ogrencilerin canlilar arasindaki beslenme iliskilerini gosteren bir besin agi kurgulamasi saglanir.",
          ],
        },
        {
          code: "10.3.1.4",
          subTopicName: "Ekosistem Ekolojisi",
          description: "Madde dongulerini ve hayatin surdurulebilirligi arasinda iliski kurar.",
          details: [
            "a) Azot, karbon ve su donguleri hatirlatilir.",
            "b) Azot dongusunde yer alan mikroorganizmalarin tur isimleri verilmez.",
          ],
        },
        {
          code: "10.3.2.1",
          subTopicName: "Guncel Cevre Sorunlari ve Insan",
          description: "Guncel cevre sorunlarinin sebeplerini ve olasi sonuclarini degerlendirir.",
          isKeyKazanim: true,
          details: [
            "a) Guncel cevre sorunlari (biyolojik cesitliligin azalmasi, hava kirliligi, su kirliligi, toprak kirliligi, radyoaktif kirlilik, ses kirliligi, asit yagmurlari, kuresel iklim degisikligi, erozyon, dogal hayat alanlarinin tahribi ve orman yanginlari) ozetlenerek bu sorunlarin canlilar uzerindeki olumsuz etkileri belirtilir.",
            "b) Cevre sorunlari nedeniyle ortaya cikan hastaliklara vurgu yapilir.",
          ],
        },
        {
          code: "10.3.2.2",
          subTopicName: "Guncel Cevre Sorunlari ve Insan",
          description: "Birey olarak cevre sorunlarinin ortaya cikmasindaki rolunu sorgular.",
          details: [
            "a) Ekolojik ayak izi, su ayak izi ve karbon ayak izi ile ilgili uygulamalar yaptirilir.",
            "b) Ekolojik ayak izi, su ayak izi ve karbon ayak izini kucultmek icin cozum onerileri gelistirmesi saglanir.",
          ],
        },
        {
          code: "10.3.2.3",
          subTopicName: "Guncel Cevre Sorunlari ve Insan",
          description: "Yerel ve kuresel baglamda cevre kirliliginin onlenmesine yonelik cozum onerilerinde bulunur.",
          details: [
            "a) Yerel ve kuresel baglamda cevre kirliliginin onlenmesi icin yapilan calismalara ornekler verilir.",
            "b) Yerel ve kuresel boyutta cevreye zarar veren insan faaliyetlerinin tartisılmasi saglanir.",
            "c) Cevre kirliliginin onlenmesinde biyolojinin diger disiplinler ile nasil iliskilendirildigine ornekler verir.",
          ],
        },
        {
          code: "10.3.3.1",
          subTopicName: "Dogal Kaynaklar ve Biyolojik Cesitliligin Korunmasi",
          description: "Dogal kaynaklarin surdurulebilirliginin onemini aciklar.",
          details: [
            "a) Dogal kaynaklarin surdurulebilirligi icin Turkiye genelindeki basarili uygulamalar orneklendirilerek cevre farkindaligin onemi vurgulanir.",
            "b) Gelecek nesillere yasanabilir saglikli bir dunya emanet edebilmek icin dogal kaynaklarin israf edilmemesi gerekliligi vurgulanir.",
          ],
        },
        {
          code: "10.3.3.2",
          subTopicName: "Dogal Kaynaklar ve Biyolojik Cesitliligin Korunmasi",
          description: "Biyolojik cesitliligin yasam icin onemini sorgular.",
          isKeyKazanim: true,
          details: [
            "a) Turkiye'nin biyolojik cesitlilik acisindan zengin olmasini saglayan faktorlerin tartisılmasi saglanir.",
            "b) Endemik turlerin ulkemizin biyolojik cesitliligi acisindan degeri ve onemi uzerinde durularak saglik ve ekonomiye katkilarina iliskin orneklere yer verilir.",
            "c) Biyolojik cesitlilik ve endemik turlerin kuresel ve milli bir miras oldugu vurgulanir.",
            "d) Tabiatta her canlinin onemli islevler gordugu vurgulanarak biyolojik cesitlige ve ekosistemin dogal isleyisine saygi gostermenin ve bunlara mudahaleden kacinmanin onemi aciklanir.",
            "e) Soyu tukenen turlerin biyolojik cesitlilik acisindan yeri doldurulamayacak bir kayip oldugu vurgulanir.",
          ],
        },
        {
          code: "10.3.3.3",
          subTopicName: "Dogal Kaynaklar ve Biyolojik Cesitliligin Korunmasi",
          description: "Biyolojik cesitliligin korunmasina yonelik cozum onerilerinde bulunur.",
          details: [
            "a) Turkiye'de nesli tukenme tehlikesi altinda bulunan canli turleri ile endemik turlerin korunmasina yonelik yapilan calismalar orneklendirilir.",
            "b) Biyolojik cesitliligin korunmasi ve biyokaçakçılığın onlenmesine yonelik cozum onerilerinin tartisılmasi saglanir.",
            "c) Gen bankalarinin gerekliligi belirtilir.",
          ],
        },
      ],
    },

    // ============================================================
    //  BIYOLOJI — AYT (11-12. sinif)
    // ============================================================

    // 11.1. Insan Fizyolojisi
    {
      topicKey: "insan_fizyolojisi_sinir_duyu",
      topicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 1,
      kazanimlar: [
        {
          code: "11.1.1.1",
          subTopicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
          description: "Sinir sisteminin yapi, gorev ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Sinir doku belirtilir. Yapilarina gore noron cesitlerine girilmez.",
            "b) Impuls iletiminin elektriksel ve kimyasal oldugu vurgulanir.",
            "c) Sinir Sistemi merkezi ve cevresel sinir sistemi olarak verilir. Merkezi sinir sisteminin bolumlerinden beyin icin; on beyin (uc ve ara beyin), orta beyin ve arka beynin (pons, omurilik sogani, beyincik) gorevleri kisaca aciklanarak beynin alt yapi ve gorevlerine girilmez. Omuriligin gorevleri ile refleks yayi aciklanir ve refleksin insan yasami icin onemi vurgulanir.",
            "d) Cevresel sinir sisteminde, somatik ve otonom sinir sisteminin genel ozellikleri verilir. Sempatik ve parasempatik sinirler ayrimina girilmez.",
            "e) Ibn Sina'nin insan fizyolojisi ile ilgili yaptigi calismalarina iliskin okuma metni verilir.",
          ],
        },
        {
          code: "11.1.1.2",
          subTopicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
          description: "Endokrin bezleri ve bu bezlerin salgiladiklari hormonlari aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Endokrin bezleri ve bu bezlerin salgiladiklari hormonlar islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "b) Hormonlarin yapisina girilmez.",
            "c) Homeostazi ornekleri (vucut sicakliginin, kandaki kalsiyum ve glikoz oraninin duzenlenmesi) aciklanir.",
            "d) Hormonlarin yasam kalitesi uzerine etkilerinin ornek bir hastalik uzerinden tartisılmasi saglanir.",
          ],
        },
        {
          code: "11.1.1.3",
          subTopicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
          description: "Sinir sistemi rahatsizliklarina ornekler verir.",
          details: [
            "a) Multipl skleroz (MS), Parkinson, Alzheimer, epilepsi (sara), depresyon uzerinde durulur.",
            "b) Sinir sistemi rahatsizliklarinin tedavisiyle ilgili teknolojik gelismelerin arastirilmasi saglanir.",
            "c) Mahmut Gazi Yasargil'in calismalarina deginilir.",
          ],
        },
        {
          code: "11.1.1.4",
          subTopicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
          description: "Sinir sisteminin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
        },
        {
          code: "11.1.1.5",
          subTopicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
          description: "Duyu organlarinin yapisini ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Dokunma duyusu olan deri verilirken epitel ve temel bag doku kisaca aciklanir.",
            "b) Duyu organlarinin yapisi sema uzerinde gosterilerek aciklanir.",
            "c) Duyu organlarinin yapisi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "d) Goz kuresi bolumleri sert tabaka, damar tabaka, ag tabaka olarak verilir, ayrintili yapilarina girilmez. Kulak bolumleri dis kulak, orta kulak ve ic kulak olarak verilip ayrintili yapilarina girilmez.",
            "e) Ibn Heysem'in goz ile ilgili calismalari vurgulanir.",
          ],
        },
        {
          code: "11.1.1.6",
          subTopicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
          description: "Duyu organlari rahatsizliklarini aciklar.",
          details: [
            "a) Renk korlugu, miyopi, hipermetropi, astigmatizm, isitme kaybi ve denge kaybi gibi rahatsizliklarin arastirilip sunulmasi saglanir.",
            "b) Gorme ve isitme engelli kisilerin karsilastigi sorunlara dikkat cekmek ve cevresindeki bireyleri bilinclendirmek amaciyla sosyal farkindalik etkinlikleri hazirlamalari saglanir.",
          ],
        },
        {
          code: "11.1.1.7",
          subTopicName: "Denetleyici ve Duzeleyici Sistem, Duyu Organlari",
          description: "Duyu organlarinin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
          details: [
            "Duyu organlari rahatsizliklarinin tedavisiyle ilgili teknolojik gelismelerin arastirilmasi saglanir.",
          ],
        },
      ],
    },

    // 11.1.2. Destek ve Hareket Sistemi
    {
      topicKey: "destek_hareket_sistemi",
      topicName: "Destek ve Hareket Sistemi",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 2,
      kazanimlar: [
        {
          code: "11.1.2.1",
          subTopicName: "Destek ve Hareket Sistemi",
          description: "Destek ve hareket sisteminin yapi, gorev ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kemik, kikirdak ve kas doku aciklanir.",
            "b) Destek ve hareket sisteminin yapisi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "c) Kemik ve kas cesitleri aciklanir.",
            "d) Kikirdak ve eklem cesitleri ile vucutta bulundugu yerlere ornekler verilir. Yapilarina girilmez.",
          ],
        },
        {
          code: "11.1.2.2",
          subTopicName: "Destek ve Hareket Sistemi",
          description: "Destek ve hareket sistemi rahatsizliklarini aciklar.",
          details: [
            "Kirik, cikik, burkulma, meniskus ve eklem rahatsizliklarinin arastirilmasi ve paylasilmasi saglanir.",
          ],
        },
        {
          code: "11.1.2.3",
          subTopicName: "Destek ve Hareket Sistemi",
          description: "Destek ve hareket sisteminin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
          details: [
            "Destek ve hareket sisteminin sagligi acisindan sporun, beslenmenin ve uygun durusun onemi tartisılır.",
          ],
        },
      ],
    },

    // 11.1.3. Sindirim Sistemi
    {
      topicKey: "sindirim_sistemi",
      topicName: "Sindirim Sistemi",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 3,
      kazanimlar: [
        {
          code: "11.1.3.1",
          subTopicName: "Sindirim Sistemi",
          description: "Sindirim sisteminin yapi, gorev ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Sindirim sisteminin yapisi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "b) Sindirime yardimci yapi ve organlarin (karaciger, pankreas ve tukuruk bezleri) gorevleri uzerinde durulur. Yapilarina girilmez.",
          ],
        },
        {
          code: "11.1.3.2",
          subTopicName: "Sindirim Sistemi",
          description: "Sindirim sistemi rahatsizliklarini aciklar.",
          details: [
            "Reflu, gastrit, ulser, hemoroit, kabizlik, ishal ornekleri verilir.",
          ],
        },
        {
          code: "11.1.3.3",
          subTopicName: "Sindirim Sistemi",
          description: "Sindirim sisteminin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
          details: [
            "a) Fiziksel etkinliklerin sindirim sisteminin sagligina olumlu etkisi belirtilir.",
            "b) Tuketilen besinlerin temizligi, lif acisindan zengin gidalarla dogal beslenmenin onemi vurgulanir.",
            "c) Asitli icecekler tuketilmesinin ve fast-food beslenmenin sindirim sistemi uzerindeki etkilerinin tartisılmasi saglanir.",
            "d) Antibiyotik kullaniminin bagirsak florasina etkileri ve bilincsiz antibiyotik kullaniminin zararlari belirtilir.",
          ],
        },
      ],
    },

    // 11.1.4. Dolasim Sistemleri
    {
      topicKey: "dolasim_sistemleri",
      topicName: "Dolasim Sistemleri",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 4,
      kazanimlar: [
        {
          code: "11.1.4.1",
          subTopicName: "Dolasim Sistemleri",
          description: "Kalp, kan ve damarlarin yapi, gorev ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kan doku aciklanir.",
            "b) Dolasim sistemi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "c) Kalbin calismasina etki eden faktorler (adrenalin, tiroksin, kafein, tein, asetilkolin, vagus siniri) uzerinde durulur.",
            "d) Alyuvar, akyuvar ve kan pulcuklari uzerinde durulur. Akyuvar cesitleri B ve T lenfositleri ile sinirlandirilir.",
            "e) Kan gruplari uzerinde durulur. Kan nakillerinde kendi grubundan kan alip vermenin gerekliligi vurgulanir. Kan nakillerinde genel alici ve genel verici kavramlari kullanilmaz.",
          ],
        },
        {
          code: "11.1.4.2",
          subTopicName: "Dolasim Sistemleri",
          description: "Lenf dolasimini aciklar.",
          details: [
            "a) Lenf dolasimi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "b) Lenf dolasimi kan dolasimi ile iliskilendirilerek ele alinir.",
            "c) Odem olusumu uzerinde durulur.",
            "d) Lenf dolasiminin bagisiklik ile iliskisi aciklanir.",
          ],
        },
        {
          code: "11.1.4.3",
          subTopicName: "Dolasim Sistemleri",
          description: "Dolasim sistemi rahatsizliklarini aciklar.",
          details: [
            "Kalp krizi, damar tikanikligi, yuksek tansiyon, varis, kangren, anemi ve losemi hastaliklari uzerinde durulur.",
          ],
        },
        {
          code: "11.1.4.4",
          subTopicName: "Dolasim Sistemleri",
          description: "Dolasim sisteminin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
        },
        {
          code: "11.1.4.5",
          subTopicName: "Dolasim Sistemleri",
          description: "Bagisiklik cesitlerini ve vucudun dogal savunma mekanizmalarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Hastalik yapan organizmalar ve yabanci maddelere karsi deri, tukuruk, mide oz suyu, mukus ve gozyasinin vucut savunmasindaki rolleri orneklendirilir.",
            "b) Enfeksiyon ve alerji gibi durumlarin bagisiklik ile iliskisi ornekler uzerinden aciklanir.",
            "c) Immunoglobulinler verilmez.",
            "d) Asilanmanin onemi uzerinde durulur. Bazi asilarin zaman icerisinde degistirilmesinin nedenleri arastirilir.",
            "e) Hastalik yapan organizmalarin genetik yapilarinin hizli degisimi nedeniyle insan sagligina surekli bir tehdit olusturdugu vurgulanir.",
          ],
        },
      ],
    },

    // 11.1.5. Solunum Sistemi
    {
      topicKey: "solunum_sistemi",
      topicName: "Solunum Sistemi",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 5,
      kazanimlar: [
        {
          code: "11.1.5.1",
          subTopicName: "Solunum Sistemi",
          description: "Solunum sisteminin yapi, gorev ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Solunum sisteminin yapisi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "b) Soluk alip verme mekanizmasizema uzerinde aciklanir.",
          ],
        },
        {
          code: "11.1.5.2",
          subTopicName: "Solunum Sistemi",
          description: "Alveollerden dokulara ve dokulardan alveollere gaz tasinmasini aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "11.1.5.3",
          subTopicName: "Solunum Sistemi",
          description: "Solunum sistemi hastaliklarini ornekler verir.",
          details: [
            "KOAH, astim, verem, akciger ve girtlak kanseri, zaturre hastaliklari belirtilir.",
          ],
        },
        {
          code: "11.1.5.4",
          subTopicName: "Solunum Sistemi",
          description: "Solunum sisteminin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
          details: [
            "Yaygin olarak gorulen mesleki solunum sistemi hastaliklarindan korunmak icin is sagligi ve guvenligi konusunda alinabilecek onlemlerin arastirilmasi ve elde edilen bilgilerin paylasilmasi saglanir.",
          ],
        },
      ],
    },

    // 11.1.6. Uriner Sistem
    {
      topicKey: "uriner_sistem",
      topicName: "Uriner Sistem",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 6,
      kazanimlar: [
        {
          code: "11.1.6.1",
          subTopicName: "Uriner Sistem",
          description: "Uriner sistemin yapi, gorev ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Uriner sistemin yapisi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "b) Bobregin alyuvar uretimine etkisi uzerinde durulur.",
            "c) Bobrek diseksiyonu ile bobregin yapisinin incelenmesi saglanir.",
          ],
        },
        {
          code: "11.1.6.2",
          subTopicName: "Uriner Sistem",
          description: "Homeostasinin saglanmasinda bobreklerin rolunu belirtir.",
          isKeyKazanim: true,
        },
        {
          code: "11.1.6.3",
          subTopicName: "Uriner Sistem",
          description: "Uriner Sistem rahatsizliklarina ornekler verir.",
          details: [
            "a) Bobrek tasi, bobrek yetmezligi, idrar yolu enfeksiyonu belirtilir.",
            "b) Diyaliz kisaca aciklanarak, diyalize bagimli hastalarin yasadiklari problemler ve bobrek bagisinin onemi vurgulanir.",
          ],
        },
        {
          code: "11.1.6.4",
          subTopicName: "Uriner Sistem",
          description: "Uriner sistemin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
        },
      ],
    },

    // 11.1.7. Ureme Sistemi ve Embriyonik Gelisim
    {
      topicKey: "ureme_sistemi",
      topicName: "Ureme Sistemi ve Embriyonik Gelisim",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 7,
      kazanimlar: [
        {
          code: "11.1.7.1",
          subTopicName: "Ureme Sistemi ve Embriyonik Gelisim",
          description: "Ureme sisteminin yapi, gorev ve isleyisini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Disi ve erkek ureme sisteminin yapisi islenirken gorsel ogeler, grafik duzenleyiciler, e-ogrenme nesnesi ve uygulamalarindan yararlanilir.",
            "b) Menstrual donguyu duzenleyen hormonlarla ilgili grafiklere yer verilir.",
            "c) In vitro fertilizasyon yontemleri kisaca aciklanir.",
          ],
        },
        {
          code: "11.1.7.2",
          subTopicName: "Ureme Sistemi ve Embriyonik Gelisim",
          description: "Ureme sisteminin saglikli yapisinin korunmasi icin yapilmasi gerekenlere iliskin cikarimlarda bulunur.",
        },
        {
          code: "11.1.7.3",
          subTopicName: "Ureme Sistemi ve Embriyonik Gelisim",
          description: "Insanda embriyonik gelisim surecini aciklar.",
          details: [
            "a) Embriyonik tabakalardan meydana gelen organlar verilmez.",
            "b) Hamilelikte bebegin gelisimini olumsuz etkileyen faktorler (antibiyotik dahil erken hamilelik doneminde ilac kullanimi, yogun stres, folik asit yetersizligi, X isinimina maruz kalma) belirtilir.",
            "c) Hamiligin izlenmesinin bebegin ve annenin sagligi acisindan onemi vurgulanir.",
          ],
        },
      ],
    },

    // 11.2. Komunite ve Populasyon Ekolojisi
    {
      topicKey: "komunite_populasyon_ekolojisi",
      topicName: "Komunite ve Populasyon Ekolojisi",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 8,
      kazanimlar: [
        {
          code: "11.2.1.1",
          subTopicName: "Komunite Ekolojisi",
          description: "Komunitenin yapisina etki eden faktorleri aciklar.",
          isKeyKazanim: true,
          details: [
            "Komunitelerin icerdigi biyolojik cesitliligin karasal ekosistemlerde enlem, sucul ekosistemlerde ise suyun derinligi ve suyun kirliligi ile iliskili oldugu vurgulanir.",
          ],
        },
        {
          code: "11.2.1.2",
          subTopicName: "Komunite Ekolojisi",
          description: "Komunitede tur ici ve turler arasindaki rekabeti orneklerle aciklar.",
          details: [
            "Komunitelerde av-avci iliskisi vurgulanir.",
          ],
        },
        {
          code: "11.2.1.3",
          subTopicName: "Komunite Ekolojisi",
          description: "Komunitede turler arasinda simbiyotik iliskileri orneklerle aciklar.",
          details: [
            "Parazitlik ve mutualizm insan sagligi ile iliskilendirilir (bit, pire, kene, tenya, bagirsak florasi).",
          ],
        },
        {
          code: "11.2.1.4",
          subTopicName: "Komunite Ekolojisi",
          description: "Komunitelerdeki suksesyonu orneklerle aciklar.",
          details: [
            "Suksesyonun evrelerine girilmez.",
          ],
        },
        {
          code: "11.2.2.1",
          subTopicName: "Populasyon Ekolojisi",
          description: "Populasyon dinamigine etki eden faktorleri analiz eder.",
          isKeyKazanim: true,
          details: [
            "a) Insan yas piramitleri uzerinde durulur.",
            "b) Populasyon buyumesine iliskin farkli buyume egrileri (S ve J) cizilir.",
            "c) Dunyada ve ulkemizde nufus degisiminin grafikler uzerinden analiz edilmesi ve olasi sonuclarinin tartisılmasi saglanir.",
          ],
        },
      ],
    },

    // ============================================================
    //  BIYOLOJI — AYT (12. sinif) — MISSING PAGES 221-226
    // ============================================================

    // TODO: 12.1. Genden Proteine (DNA ve Genetik Kod)
    // Expected kazanimlar:
    // - DNA replikasyonu
    // - Genetik kod ve ozelikleri
    // - Protein sentezi (transkripsiyon ve translasyon)
    // - Gen mutasyonlari
    // - Biyoteknoloji ve genetik muhendislik uygulamalari
    // - GDO (Genetigi Degistirilmis Organizmalar)
    {
      topicKey: "genden_proteine",
      topicName: "Genden Proteine",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 9,
      kazanimlar: [
        // TODO: Pages 221-222 MISSING — Estimated 5-8 kazanimlar
        // Placeholder kazanimlar based on standard 12. sinif curriculum:
        {
          code: "12.1.1.1",
          description: "DNA replikasyonunu aciklar.",
          isKeyKazanim: true,
          details: [
            "// TODO: Detail items from missing pages 221-222",
          ],
        },
        {
          code: "12.1.1.2",
          description: "Genetik kodu ve ozelliklerini aciklar.",
          isKeyKazanim: true,
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
        {
          code: "12.1.2.1",
          description: "Protein sentezi surecini (transkripsiyon ve translasyon) aciklar.",
          isKeyKazanim: true,
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
        {
          code: "12.1.3.1",
          description: "Biyoteknoloji ve genetik muhendislik uygulamalarini aciklar.",
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
      ],
    },

    // TODO: 12.2. Canlilarда Enerji Donusumleri
    {
      topicKey: "enerji_donusumleri",
      topicName: "Canlilarда Enerji Donusumleri",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 10,
      kazanimlar: [
        // TODO: Pages 223-224 MISSING — Estimated 5-8 kazanimlar
        {
          code: "12.2.1.1",
          description: "Fotosentez tepkimelerini aciklar.",
          isKeyKazanim: true,
          details: [
            "// TODO: Detail items from missing pages 223-224",
          ],
        },
        {
          code: "12.2.1.2",
          description: "Kemosentezi aciklar.",
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
        {
          code: "12.2.2.1",
          description: "Hucresel solunumu aciklar.",
          isKeyKazanim: true,
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
        {
          code: "12.2.2.2",
          description: "Fermantasyonu aciklar.",
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
      ],
    },

    // TODO: 12.3. Bitki Biyolojisi
    {
      topicKey: "bitki_biyolojisi",
      topicName: "Bitki Biyolojisi",
      examType: "AYT",
      subjectName: "Biyoloji",
      sortOrder: 11,
      kazanimlar: [
        // TODO: Pages 225-226 MISSING — Estimated 4-6 kazanimlar
        {
          code: "12.3.1.1",
          description: "Bitkilerde madde tasinmasini aciklar.",
          isKeyKazanim: true,
          details: [
            "// TODO: Detail items from missing pages 225-226",
          ],
        },
        {
          code: "12.3.2.1",
          description: "Bitki hormonlarini ve etkilerini aciklar.",
          isKeyKazanim: true,
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
        {
          code: "12.3.3.1",
          description: "Bitkilerde uremeyi aciklar.",
          details: [
            "// TODO: Detail items from missing pages",
          ],
        },
      ],
    },
  ];
}
