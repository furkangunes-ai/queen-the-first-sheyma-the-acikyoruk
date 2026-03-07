/**
 * TYT Tarih kazanımlarını MEB PDF'den sisteme ekler.
 * Kaynak: MEB Ortaöğretim Tarih Dersi (9,10,11. sınıf) + T.C. İnkılap Tarihi Öğretim Programı
 *
 * Bu script mevcut konulara kazanım ekler. Mevcut müfredatı BOZMAZ.
 * Zaten kazanımı olan topic'leri atlar (idempotent).
 *
 * Çalıştırmak için: npx tsx prisma/seed-tyt-tarih-kazanim.ts
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
  // ==================== 9. SINIF TARİH ====================

  "Tarih Bilimine Giriş": [
    {
      code: "9.1.1",
      subTopicName: "Tarih ve Zaman",
      description:
        "Bir araştırma alanı ve bilim dalı olarak tarihin konusunu, kapsamını ve diğer bilim dallarıyla ilişkisini açıklar.",
      details: [
        "a) Tarihin konusunun zaman içindeki insan faaliyetleri ve bu faaliyetler sonucunda ortaya çıkan eserler ve değişimler olduğu belirtilir.",
        "b) Tarih biliminin diğer beşeri ve sosyal bilimler ile fen bilimlerinden farklılıklarına değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.1.2",
      subTopicName: "Tarih ve Zaman",
      description: "Tarih öğrenmenin amaç ve yararlarını kavrar.",
      details: [
        "a) Ortak hafızanın kimlik oluşturma ve toplumsallaşmadaki rolü üzerinde durulur.",
        "b) Günümüzde olup bitenleri anlayabilmek ve gelecek hakkında gerçekçi planlamalar yapabilmek için tarih bilincine sahip olmak gerektiği vurgulanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.1.3",
      subTopicName: "Tarih ve Zaman",
      description:
        "Zamanı anlama ve anlamlandırmaya yönelik farklı yaklaşımları analiz eder.",
      details: [
        "a) Farklı toplum ve kültürlerin geçmişin dönemlendirilmesinde kendi tarihlerindeki önemli olayları dikkate aldıklarına değinilir.",
        "b) Farklı takvim sistemlerine (güneş yılı ve ay yılı esaslı takvimler) ve Türklerin kullandığı takvimlere değinilir.",
        "c) Miladi takvim ile hicri takvim arasındaki temel farklar vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Uygarlığın Doğuşu ve İlk Uygarlıklar": [
    {
      code: "9.2.1",
      subTopicName: "İnsanlığın İlk Dönemleri",
      description:
        "Kanıtlardan yola çıkarak yazının icadından önceki zamanlarda yaşayan insanların hayatı hakkında çıkarımda bulunur.",
      details: [
        "a) Göbeklitepe, Çatalhöyük ve Çayönü gibi yerleşik hayata ve medeniyete dair en eski yerleşim yerlerinden günümüze kalan maddi kültür buluntuları incelenir.",
        "b) Yazının icadından önceki dönemde hâkim olan sözlü kültür örneklerine (mitler, kuruluş efsaneleri) kısaca değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.2",
      subTopicName: "İnsanlığın İlk Dönemleri",
      description:
        "Yazının icadının insanlık tarihinde meydana getirdiği değişimi fark eder.",
      details: [
        "a) Yazının kullanılmasının yönetim işleri ile vergi ve muhasebe kayıtları üzerindeki etkilerine değinilir.",
        "b) Kadim tıp, astronomi ve coğrafya bilimlerinin amaç, konu ve yöntem açılarından modern zamandaki bilimlerden ne tür farklılıklara sahip olduğuna değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.2.3",
      subTopicName: "İnsanlığın İlk Dönemleri",
      description:
        "İlk Çağ'da yeryüzündeki belli başlı medeniyet havzalarını tanır.",
      details: [
        "a) İlk Çağ medeniyetleriyle ilgili başlıca olay ve olgular tarih şeridi üzerinde gösterilir.",
        "b) İlk Çağ'ın önemli medeniyet havzaları (Çin, Hint, İran, Anadolu, Mezopotamya, Mısır, Doğu Akdeniz, Ege Yunan) ve bunların insanlığa en önemli katkıları harita üzerinde gösterilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.2.4",
      subTopicName: "İnsanlığın İlk Dönemleri",
      description:
        "İlk Çağ'da coğrafya ve iklimin insanların hayat ve geçim tarzları üzerindeki belirleyici etkisini analiz eder.",
      details: [
        "a) Konar-göçer ve yerleşik hayat tarzlarının İlk Çağ'dan itibaren birbirlerini tamamlayan ve coğrafi şartlara bağlı olarak tercih edilen hayat tarzları olduğu vurgulanır.",
        "b) İlk Çağ'da insan topluluklarının kitlesel göçlerinin sebepleri (geçim imkânını kaybetme, iklim değişikliği, politik değişiklikler, inanç nedeniyle baskı altına alınma) belli başlı tarihî örneklerle ele alınır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.2.5",
      subTopicName: "İnsanlığın İlk Dönemleri",
      description:
        "İlk Çağ'da siyasi gücün kaynaklarını siyasi organizasyon türleriyle ilişkilendirir.",
      details: [
        "a) İlk Çağ'da Asya ve Avrupa'da varlığını sürdüren siyasi organizasyon türleri olarak tiranlık, aristokrasi, monarşi, demokrasi, cumhuriyet ve imparatorluğa değinilir.",
        "b) Siyasi gücün meşruiyet kaynakları ve maddi kaynakları (coğrafi yapı, hayat ve geçim tarzı, soy dayanışması, silahlı güç) üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.2.6",
      subTopicName: "İnsanlığın İlk Dönemleri",
      description:
        "İlk Çağ'da hukuk sistemlerinin oluşturulmasında etkili olan dini ve beşeri kaynakları kavrar.",
      details: [
        "Sözlü ve yazılı hukuk kaynaklarına (akıl, gelenek ve kutsal kitaplar) ilişkin tarihî örnekler (Urkagina ve Hammurabi Kanunları, Hitit Hukuku ve Tevrat) ele alınır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Eski Türk Tarihi": [
    {
      code: "9.4.1",
      subTopicName: "İlk ve Orta Çağlarda Türk Dünyası",
      description:
        "Türklerin Asya'da tarih sahnesine çıktıkları ve yaşadıkları alanlar ile başlıca kültür çevrelerini tanır.",
      details: [
        "a) Türk adının anlamı açıklanarak ilk Türk devletlerinin hâkim oldukları alanlar harita üzerinde gösterilir.",
        "b) İlk Türk devletleriyle ilgili başlıca siyasi gelişmeler tarih şeridi üzerinde gösterilir (Asya Hun, Avrupa Hun, I. ve II. Kök Türk, Uygur devletleri).",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.2",
      subTopicName: "İlk ve Orta Çağlarda Türk Dünyası",
      description:
        "İlk ve Orta Çağlarda İç Asya'daki Türk siyasi teşekküllerinin güç ve yönetim yapısını kavrar.",
      details: [
        "a) Asya Hun, Kök Türk ve Uygur Devletleri, gücün meşruiyet kaynağı (Gök Tengri ve Kut inançları); gücün maddi kaynakları (coğrafi yapı, konargöçer hayat tarzı, soy dayanışması ve silahlı güç); güç paylaşımı ve yönetim organizasyonu (kurultay, ikili teşkilat yapısı ve ulus ilkesi) temaları çerçevesinde ele alınır.",
        "b) 'Töre'nin Türk toplum yapısı ve hukuk sistemindeki yeri ve önemi vurgulanır. Orhun Kitabelerinden örnekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.3",
      subTopicName: "İlk ve Orta Çağlarda Türk Dünyası",
      description:
        "İslamiyet öncesi dönemde Türklerin yaşadığı coğrafyalar ile hayat tarzları arasındaki ilişkiyi analiz eder.",
      details: [
        "a) Tarıma uygun olmayan bozkır coğrafyasının Türk topluluklarını konar-göçer hayat tarzına yönelttiği vurgulanır.",
        "b) Askerî kültürün Türk hayat tarzındaki yeri ve dünya askerî tarihine mal olmuş teşkilat, teçhizat ve taktikler (süvarilik, onlu teşkilat, ok ve yay, üzengi, Turan taktiği) vurgulanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.4.4",
      subTopicName: "İlk ve Orta Çağlarda Türk Dünyası",
      description:
        "Kavimler Göçü'nün sebep ve sonuçlarını siyasi ve sosyal açılardan analiz eder.",
      details: [
        "a) Kavimler Göçü ile Asya ve Avrupa'daki siyasi yapılarda meydana gelen değişim harita üzerinde gösterilir.",
        "b) Avrupa Hun Devleti'nin kuruluşuna ve bu devletin Avrupa'ya etkilerine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.4.5",
      subTopicName: "İlk ve Orta Çağlarda Türk Dünyası",
      description:
        "Asya merkezli Türk Devletlerinin çevrelerindeki devletlerle ilişkilerinin çok boyutlu yapısını analiz eder.",
      details: [
        "a) Hun, Kök Türk, Uygur ve Hazar siyasi teşekküllerinin Çin, Sasani ve Bizans Devletleri ile ilişkilerinden hareketle konar-göçer ve yerleşik topluluklar arasındaki ilişkilerin çatışma ve uzlaşma eksenli olarak askerî ve ekonomik boyutlarda gerçekleştiği vurgulanır.",
        "b) Hun, Kök Türk, Uygur ve Hazar siyasi teşekküllerinin hâkimiyetleri altındaki topraklarda ticareti canlandırmaya yönelik politikaları ile bu politikaların gerekçeleri üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "İslam Tarihi": [
    {
      code: "9.5.1",
      subTopicName: "İslam Medeniyetinin Doğuşu",
      description:
        "İslamiyet'in ortaya çıktığı ve yayıldığı dönemlerdeki başlıca siyasi ve sosyal gelişmeleri açıklar.",
      details: [
        "a) İslamiyet'in ortaya çıktığı ve yayıldığı dönemlerdeki başlıca siyasi ve sosyal gelişmeler tarih şeridi ve haritalar üzerinde gösterilir.",
        "b) Hz. Muhammed'in peygamberliğinin öncesinde Mekke'deki ve Arap Yarımadası'nın geri kalan kısmındaki siyasi durum ve toplumsal düzen ana hatlarıyla ele alınır. 'Cahiliye Dönemi' kavramı toplum düzeni açısından açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.5.2",
      subTopicName: "İslam Medeniyetinin Doğuşu",
      description:
        "Hz. Muhammed ve Dört Halife Dönemi'nde Müslümanların Arap Yarımadası ve çevresinde siyasi hâkimiyet kurmaya yönelik faaliyetlerini kavrar.",
      details: [
        "a) Hz. Muhammed Dönemi'nde Müslümanların kendilerini korumak ve İslam'ı yaymak üzere gerçekleştirdikleri muharebelere değinilir.",
        "b) Medine Sözleşmesi'nin öngördüğü toplum düzeni ve ilk kurumsal yapılanmalar (eğitim, idare, güvenlik ve yargı) ele alınır.",
        "c) Dört Halife Dönemi'nde İslam toplumunun idaresi, sınırların genişlemesi ve ihtidalar üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.5.3",
      subTopicName: "İslam Medeniyetinin Doğuşu",
      description:
        "Emeviler ile birlikte İslam Devleti'nin yapısında meydana gelen değişimi analiz eder.",
      details: [
        "a) Emeviler Dönemi'nde hilafetin saltanata dönüştüğü ve Arap olmayan unsurların (mevali) devlet idaresi ve sosyal yaşamda bazı haklardan mahrum bırakıldıkları vurgulanır.",
        "b) Emeviler Dönemi'nde inanç ve siyaset ilişkisi ile keskinleşmeye başlayan mezhebî yönelimler ele alınır.",
        "c) Emeviler Dönemi'nde İslamiyet'in Kuzey Afrika ve Avrupa'daki yayılışına ve İslam kültürünün Avrupa'ya etkilerine değinilir. Endülüs'teki düşünce ve kültür dünyası özellikle vurgulanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.5.4",
      subTopicName: "İslam Medeniyetinin Doğuşu",
      description:
        "Türklerin Abbasi Devleti'ndeki askerî ve siyasi gelişmelerde oynadıkları rolleri kavrar.",
      details: [
        "a) Abbasiler Dönemi'ndeki başlıca siyasi ve sosyal gelişmelere kısaca değinilir.",
        "b) Halife Me'mun ve Mu'tasım Dönemlerinde Türk asker ve devlet görevlilerinin Abbasi devlet yönetiminde artan etkisi ve bu durumun sonuçları açıklanır.",
        "c) İslam hâkimiyetinin Afrika'daki genişlemesinden hareketle Tolunoğulları (868-905), İhşidiler (935-969), Eyyubiler (1174-1250) ve Memluk Devleti (1250-1517) öne çıkan özellikleriyle kısaca ele alınır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.5.5",
      subTopicName: "İslam Medeniyetinin Doğuşu",
      description:
        "Sekizinci ve on ikinci yüzyıllar arasında İslam medeniyeti çerçevesindeki ilmî faaliyetleri değerlendirir.",
      details: [
        "a) İslam medeniyetinin ilim ve eğitim kurumları (Beytu'l-hikme, medreseler, camiler ve kütüphaneler) kısaca tanıtılır.",
        "b) İslam medeniyetinde kabul görmüş dini (nakli) ve aklî ilimler ayrımı üzerinde durulur.",
        "c) İslam âlimlerinin nazari (teorik) ve bütüncül bir perspektifle kişinin kendini, âlemi ve Allah'ı tanıması maksadı güden bir ilim anlayışına sahip oldukları vurgulanır.",
        "d) İslam dünyasında ortaya çıkan bilimsel gelişmelere ve bu gelişmelerin Avrupa'ya etkilerine kısaca değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Türk-İslam Devletleri (10-13. yüzyıllar)": [
    {
      code: "9.6.1",
      subTopicName: "Türklerin İslamiyet'i Kabulü",
      description:
        "Türklerin İslamiyet'i kabul etmeye başlamaları ile Türkiye Selçuklu Devleti'nin kuruluşu arasındaki süreçte meydana gelen başlıca siyasi gelişmeleri gösterir.",
      details: [
        "Başlıca siyasi gelişmeler olarak Talas Savaşı (751), Karahanlı Devleti'nin kurulması (840), Gazneli Devleti'nin kurulması (963), Büyük Selçuklu Devleti'nin kurulması (1040), Dandanakan Savaşı, Pasinler ve Malazgirt Muharebeleri, Türkiye Selçuklu Devleti'nin kurulması (1077) tarih şeridi üzerinde verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.6.2",
      subTopicName: "Türklerin İslamiyet'i Kabulü",
      description:
        "Türklerin İslamiyet'i kabul etme sürecine etki eden faktörleri açıklar.",
      details: [
        "a) Türk topluluklarının İslamiyet'i kabullerinin bir anda ve toplu olarak değil aşamalı olarak ve farklı tarihlerde gerçekleştiği vurgulanır.",
        "b) Acemlerin, Berberilerin ve Kürtlerin İslam dinini kabul etme süreçlerine kısaca değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.6.3",
      subTopicName: "Türklerin İslamiyet'i Kabulü",
      description:
        "Karahanlı ve Gazneli örneklerinden hareketle İslamiyet'in kabulünün Türk devlet yapısı ve toplumsal hayatta meydana getirdiği değişimleri analiz eder.",
      details: [
        "Dönemin yazılı eserleri 'Kutadgu Bilig', 'Divanu Lugati't-Türk', 'Atabetü'l-Hakayık' ve 'Divan-ı Hikmet'e kısaca değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.6.4",
      subTopicName: "Türklerin İslamiyet'i Kabulü",
      description:
        "Büyük Selçuklu Devleti Dönemi'ndeki başlıca siyasi gelişmeleri Türk tarihi içerisindeki önemi bağlamında açıklar.",
      details: [
        "a) Oğuz Türklerinin İslamiyet'i kabul etmelerinin Türk ve İslam tarihinde meydana getirdiği siyasi, sosyal ve kültürel etkilere değinilir.",
        "b) Dandanakan, Pasinler ve Malazgirt Muharebelerinin sebep ve sonuçları kısaca ele alınır.",
        "c) Büyük Selçuklu Devleti'nin Tuğrul Bey Dönemi'nde İslam dünyasında koruyucu rol üstlendiğine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "9.6.5",
      subTopicName: "Türklerin İslamiyet'i Kabulü",
      description:
        "Büyük Selçuklu Devleti'nin yönetim ve toplum yapısını kavrar.",
      details: [
        "a) Büyük Selçuklu Devleti'nin güç ve yönetim yapısı; gücün meşruiyet kaynağı, gücün maddi kaynakları, güç paylaşımı ve yönetim organizasyonu temaları çerçevesinde ele alınır.",
        "b) İran ve Türk devlet geleneklerine ait unsurların Büyük Selçuklu devlet teşkilatında birlikte yer aldığı vurgulanır.",
        "c) Nizamülmülk'ün 'Siyasetname' adlı eseri incelenir. Nizamiye Medreseleri yapılanması ve Gazali'nin bu medreselere etkisine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== 10. SINIF TARİH ====================

  "Türkiye Tarihi (11-13. yüzyıllar)": [
    {
      code: "10.1.1",
      subTopicName: "Yerleşme ve Devletleşme",
      description:
        "Türklerin Anadolu'ya yerleşmeye başlaması ile Türkiye Selçuklu Devleti'nin yıkılışı arasındaki süreçte meydana gelen başlıca siyasi gelişmeleri gösterir.",
      details: [
        "Saltuklular, Danişmentliler, Mengücekliler, Çaka Beyliği, Türkiye Selçuklu Devleti, Artuklu Beyliği'nin kuruluşları, Haçlı Seferleri, Moğol İstilası, Kösedağ Muharebesi, Memlüklü Devleti'nin kurulması, Türkçeyi resmi dil ilan etme gibi gelişmeler tarih şeridi üzerinde verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.2",
      subTopicName: "Yerleşme ve Devletleşme",
      description:
        "Anadolu'ya yapılan Türk göçlerinin sosyokültürel etkilerini analiz eder.",
      details: [
        "a) Oğuz göçlerinin Anadolu'da yerleşmeyi kolaylaştıran nedenler kısaca açıklanır.",
        "b) Türkiye isminin doğuşu açıklanır. Öğrencilerin Anadolu'nun Türkiye olarak adlandırılmasının nedenleri ile ilgili çıkarımda bulunmaları sağlanır.",
        "c) Öğrencilerin Anadolu ile birlikte Irak ve Suriye bölgesine yapılan göçlerin bu bölgelerde günümüze kadar devam eden Türkmen varlığına etkilerini analiz etmeleri sağlanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.1.3",
      subTopicName: "Yerleşme ve Devletleşme",
      description:
        "Anadolu'daki ilk Türk siyasi teşekküllerinin birbirleriyle ve çevre devletlerle olan ilişkilerini uzlaşma ve çatışma bağlamında değerlendirir.",
      details: [
        "a) Anadolu'da kurulan ilk Türk beyliklerinin birbirleriyle ve çevre devletlerle olan ilişkilerine değinilir.",
        "b) Türkiye Selçuklu Devleti'nin teşkilat yapısı ile sosyokültürel özelliklerine ana hatlarıyla değinilir.",
        "c) Türkiye Selçuklu Devleti'nin Bizans ile mücadeleleri çerçevesinde Miryokefalon Muharebesi'ne değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.1.4",
      subTopicName: "Yerleşme ve Devletleşme",
      description:
        "İslam dünyasının korunması bağlamında Türkiye Selçuklu Devleti ve Eyyubi Devleti'nin Haçlılarla yaptıkları mücadelelerin sosyokültürel etkilerini analiz eder.",
      details: [
        "a) Haçlı Seferleri'nin güzergâhı harita/haritalar üzerinde gösterilir.",
        "b) Haçlı Seferleri'nin sebeplerine, taraflarına, katılanlarına değinilir.",
        "c) Öğrencilerin Haçlı Seferleri'nin Avrupa'daki siyasi, sosyal ve ekonomik açıdan dönüştürücü etkisini analiz etmeleri sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.1.5",
      subTopicName: "Yerleşme ve Devletleşme",
      description:
        "Moğol İstilası'nın Anadolu'da meydana getirdiği siyasi ve sosyal değişimi analiz eder.",
      details: [
        "Babailer İsyanı'na, Moğol İstilası'nın önünü açması bağlamında değinilerek Kösedağ Muharebesi'nden sonra Anadolu'da İkinci Beylikler Dönemi'nin ortaya çıkması kısaca açıklanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Beylikten Devlete (1300-1453)": [
    {
      code: "10.2.1",
      subTopicName: "Beylikten Devlete Osmanlı Siyaseti",
      description:
        "1302-1453 yılları arasındaki süreçte meydana gelen başlıca siyasi gelişmeleri tarih şeridi ve haritalar üzerinde gösterir.",
      details: [
        "Koyunhisar Muharebesi (1302), Bursa'nın Fethi (1326), İznik'in Fethi (1331), İzmit'in Fethi (1337), I. Kosova Muharebesi (1389), Niğbolu Muharebesi (1396), Ankara Savaşı (1402), Fetret Devri (1402-1413), Varna Muharebesi (1444), II. Kosova Muharebesi (1448) gibi gelişmeler tarih şeridi üzerinde verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.2",
      subTopicName: "Beylikten Devlete Osmanlı Siyaseti",
      description:
        "Osmanlı Beyliği'nin devletleşme sürecini Bizans'la olan ilişkileri çerçevesinde analiz eder.",
      details: [
        "a) XIII. yüzyılın sonlarında Anadolu çevresindeki jeopolitik durum açıklanarak Osmanlı Beyliği'nin kuruluşuna değinilir.",
        "b) Öğrencilerin Osmanlı Beyliği'nin sınırlarının genişlemesinin farklı fetih yöntemleri ve politikalar (Türkmen göçleri ve gaza siyaseti) izlenerek uzun sürede nasıl gerçekleştiğini analiz etmeleri sağlanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.2.3",
      subTopicName: "Beylikten Devlete Osmanlı Siyaseti",
      description:
        "Rumeli'deki fetihler ile iskân (şenlendirme) ve istimalet politikalarının amaçlarını ve etkilerini analiz eder.",
      details: [
        "a) Osmanlı'nın Anadolu'ya nispeten Rumeli'de daha hızlı hâkimiyet kurmasında Balkanlar'daki toplulukların yaşadığı iç çekişmelerin etkisi ile Osmanlı idaresinin gayrimüslimlere sunduğu imkânlara değinilir.",
        "b) Rumeli'deki fetihlerin kalıcı olmasında rol oynayan demografik güçlerin (dervişler, aşiretler, akıncı uç beyleri) ve iskân politikasının önemine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.2.4",
      subTopicName: "Beylikten Devlete Osmanlı Siyaseti",
      description:
        "Osmanlı Devleti'nin Anadolu'da Türk siyasi birliğini sağlamaya yönelik faaliyetlerini ve sonuçlarını analiz eder.",
      details: [
        "a) Osmanlı Devleti'nin beyliklere yönelik politikalarındaki değişime değinilir.",
        "b) Türk dünyasındaki liderlik mücadelesini Yıldırım Bayezid ve Timur örneği üzerinden ele alarak bu mücadelenin Anadolu'daki yansımalarını sebep ve etki açısından analiz etmeleri sağlanır.",
        "c) Fetret Devri'ne ve Osmanlı siyasi birliğinin yeniden sağlanmasına değinilir.",
        "d) Osmanlı Devleti'nin ilk dönemlerinden itibaren Türkçeyi resmi yazışma dili olarak kullandığı ve bilim dili hâline getirdiği vurgulanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Dünya Gücü Osmanlı Devleti (1453-1600)": [
    {
      code: "10.5.1",
      subTopicName: "Dünya Gücü Osmanlı (1453-1595)",
      description:
        "1453-1520 yılları arasındaki süreçte meydana gelen başlıca siyasi gelişmeleri tarih şeridi ve haritalar üzerinde gösterir.",
      details: [
        "İstanbul'un Fethi (1453), Sırbistan'ın alınması (1454), Amasra'nın alınması (1459), Mora'nın alınması (1460), Sinop ve Trabzon'un alınması (1461), Eflak'ın alınması (1462), Bosna ve Hersek'in alınması (1463), Venedik ile mücadele (1463-1479), Otlukbeli Muharebesi (1473), Karamanoğlu Beyliği'ne son verilmesi (1474), Kırım'ın Fethi (1475), Boğdan'ın alınması (1476), Arnavutluk'un alınması (1479), İtalya Seferi (1480), Cem Sultan Olayı (1481-1495), İspanya'daki Müslümanların ve Yahudilerin kurtarılması (1492), Çaldıran Muharebesi (1514), Mercidabık Muharebesi (1516) ve Ridaniye Muharebesi (1517) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.2",
      subTopicName: "Dünya Gücü Osmanlı (1453-1595)",
      description:
        "İstanbul'un fetih sürecini sebepleri ve stratejik sonuçları açısından analiz eder.",
      details: [
        "a) Osmanlı Devleti'nin kurumsallaşması (idari, kültürel ve demografik boyutlar) ve İstanbul'un Fethi'nin oynadığı role ilişkin çıkarımda bulunmaları sağlanır.",
        "b) İstanbul'un Fethi'nin bölgesel ve küresel yansımalarına değinilir.",
        "c) II. Mehmet'in kara ve denizlerdeki fetihlerinin stratejik önemine değinilir.",
        "d) II. Mehmet'in karakteri, vizyonu, ilme verdiği önem vurgulanarak fethin gerçekleşmesinde onun kişisel özelliklerinin etkisine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.3",
      subTopicName: "Dünya Gücü Osmanlı (1453-1595)",
      description:
        "Osmanlı Devleti'nin İslam coğrafyasında hâkimiyet kurmasının Türk ve İslam dünyası üzerindeki etkilerini analiz eder.",
      details:
        "I. Selim Dönemi'nde Osmanlı-İran ve Osmanlı-Memluk ilişkilerine, Türk ve İslam dünyasında liderlik mücadelesi bağlamında değinilir.",
      isKeyKazanim: false,
    },
    {
      code: "10.5.4",
      subTopicName: "Dünya Gücü Osmanlı (1453-1595)",
      description:
        "1520-1595 yılları arasındaki süreçte meydana gelen başlıca siyasi gelişmeleri tarih şeridi ve haritalar üzerinde gösterir.",
      details: [
        "Belgrad'ın Fethi (1521), Rodos'un Fethi (1522), Mohaç Muharebesi (1526), I. Viyana Kuşatması (1529), İstanbul Antlaşması (1533), Cezayir'in alınması (1533), Preveze Deniz Savaşı (1538), Hint Deniz Seferleri (1538-1553), Tebriz'in alınması (1548), Trablusgarp'ın Fethi (1551), Nahcivan'ın alınması (1553), Sudan'ın Kızıldeniz sahilinde Sevakin Adası merkezli Habeş Eyaleti'nin kurulması (1555), Zigetvar Seferi (1566), Yemen'in alınması (1568), Kıbrıs'ın Fethi (1571), İnebahtı Deniz Savaşı (1571), Tunus'un Fethi (1574) ve Fas'ta Osmanlı hâkimiyetinin kurulması (1578) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.5",
      subTopicName: "Dünya Gücü Osmanlı (1453-1595)",
      description:
        "Kanuni Dönemi'nden itibaren Osmanlı Devleti'nin eriştiği olgunluğu siyasi sınırlar ve devlet teşkilatı açısından açıklar.",
      details:
        "Osmanlı Devleti'nin hâkimiyet alanını genişletme çabaları bağlamında Habsburglar ve Safevilerle olan ilişkileri kısaca ele alınır.",
      isKeyKazanim: false,
    },
    {
      code: "10.5.6",
      subTopicName: "Dünya Gücü Osmanlı (1453-1595)",
      description:
        "Uyguladığı uzun vadeli stratejinin Osmanlı Devleti'nin dünya gücü hâline gelmesindeki rolünü analiz eder.",
      details: [
        "a) Osmanlı Devleti'nin XV ve XVI. yüzyıllardaki stratejik rakiplerine (Venedik, Ceneviz, Portekiz, İspanya, Habsburglar, Safeviler, Memlükler) karşı uyguladığı uzun vadeli politikalar ve kurduğu stratejik ortaklıklara değinilir.",
        "b) Osmanlı Devleti'nin batıdaki ilerleyişi karşısında Avrupa'da oluşan Türk algısını sebep ve etki açısından analiz etmeleri sağlanır.",
        "c) Osmanlı'nın XV ve XVI. yüzyıllarda izlediği siyasetin uzun vadeli etkilerine (Roma Katolik Kilisesi'ne karşı Ortodoksluğun ve Protestanlığın himaye edilmesi, Avrupa monarşilerinin varlıklarını devam ettirmeleri (Fransa, İngiltere ve Hollanda), Afrika'daki Müslümanların himaye edilmesi) değinilir.",
        "d) Osmanlı Devleti'nin uyguladığı ekonomi politikalarından ticaret yollarının kontrolü ve kapitülasyonlara değinilerek bunlar üzerinden kurulan uzun vadeli stratejik ortaklıklara vurgu yapılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.5.7",
      subTopicName: "Dünya Gücü Osmanlı (1453-1595)",
      description:
        "Osmanlı Devleti'nin takip ettikleri kara ve deniz politikalarını analiz eder.",
      details: [
        "a) Osmanlı Devleti'nin öncelikli olarak bir kıta (kara) gücü olduğu vurgulanır ve dönemin diğer büyük kıta güçlerine kısaca değinilir.",
        "b) Osmanlı Devleti'nin denizlerde yaptığı fetihlerin Akdeniz hâkimiyetine etkisini ve bu bağlamda Kıbrıs'taki Türk varlığının tarihsel önemini analiz etmeleri sağlanır.",
        "c) Coğrafi Keşifler'e ve sonrasında Asya, Afrika ve Amerika kıtalarında yaşanan katliamlara ve bu bölgelerin zenginliklerinin Avrupa'ya taşınmasına değinilir.",
        "d) Coğrafi Keşifler'in Osmanlı Devleti'nin Akdeniz'deki hâkimiyetinde meydana getirdiği değişimler ile okyanus güçlerinin Akdeniz'e nüfuz etme çabalarına değinilir.",
        "e) Osmanlı Devleti'nin stratejik amaçlı olarak Akdeniz dışına yönelme çabaları bağlamında Hint Deniz Seferleri'ne değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Yeniçağ Avrupası (1453-1789)": [
    {
      code: "9.3.1",
      subTopicName: "Orta Çağ'da Dünya",
      description:
        "Orta Çağ'da yeryüzünün çeşitli bölgelerinde kurulan siyasi ve sosyal yapıları tanır.",
      details: [
        "a) Orta Çağ'daki başlıca siyasi gelişmeler tarih şeridi üzerinde gösterilir.",
        "b) Orta Çağ'ın çeşitli dönemlerinde ortaya çıkmış/kurulmuş olan belli başlı siyasi yapılar haritalar üzerinde gösterilir.",
        "c) Orta Çağ'daki siyasi yapılar arasındaki farklılıklar vurgulanarak gücün meşruiyet kaynağı ve maddi kaynakları (coğrafi yapı, hayat ve geçim tarzı, soy dayanışması ve silahlı güç) çerçevesinde ele alınır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "9.3.2",
      subTopicName: "Orta Çağ'da Dünya",
      description:
        "Orta Çağ'da tarım ve ticaretin yaygın ekonomik faaliyetler olduklarını kavrar.",
      details: [
        "a) Tarıma dayalı ekonomilerde artı ürünün bölüşümü ile toprak mülkiyeti ve vergilendirmenin siyasi ve sosyal organizasyonların oluşmasındaki işlevleri ele alınır.",
        "b) Orta Çağ'da Asya ve Avrupa arasındaki ticarete konu olan mallara, nakliye araçlarına, ticaret mekânlarına (arasta, bedesten, han, kapan, ribat, kervansaray, pazar, liman, panayır) ve madeni paralara değinilir.",
        "c) Kral Yolu, İpek Yolu, Kürk Yolu ve Baharat Yolu'nun dünya ticaretindeki rollerine ve bunlara hâkim olma mücadelelerinin gerekçeleri vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.3.1",
      subTopicName: "Savaşçılar ve Askerler",
      description:
        "Kuruluş Dönemi'nde Osmanlı askerî gücünü oluşturan farklı muharip unsurlarını açıklar.",
      details: [
        "a) Bir devlete bağlı olmayan savaşçı topluluklar (aşiret savaşçıları, ücretli savaşçılar, inanç ve din uğruna savaşanlar) ile devlet askerleri arasındaki farklar kısaca açıklanarak Türk tarihindeki 'alpilik' ve 'gazilik' kavramlarına değinilir.",
        "b) Diğer Türk beylik ve devletlerinin aksine erken tarihte aşiretten düzenli birliklere geçen Osmanlı'nın ilk dönem askerî teşkilatına değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.3.2",
      subTopicName: "Savaşçılar ve Askerler",
      description:
        "Tımar sisteminin özelliklerini siyasi, sosyal ve ekonomik açılardan değerlendirir.",
      details: [
        "Tımar Sistemi'nin siyasi, sosyal ve ekonomik yönleri kısaca açıklanarak bu sistemin Osmanlı savaş organizasyonundaki rolü vurgulanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.3.3",
      subTopicName: "Savaşçılar ve Askerler",
      description:
        "Yeniçeri Ocağı'nın ve devşirme sisteminin Osmanlı devletleşme sürecine etkisini analiz eder.",
      details: [
        "a) Kapıkulu Ocağı ile devşirme sisteminin köklerine ve ortaya çıkış sürecine değinilerek bunların merkezi devlet yapısının güçlenmesindeki rolleri vurgulanır.",
        "b) Yeniçeri Ocağı ile birlikte profesyonel askerliğin başlamasının Osmanlı Devleti'ni askerî teşkilat ve güç bakımından dönemin diğer Türk ve Avrupa devletlerinden ayrıştırdığına değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Osmanlı Kültür ve Medeniyeti": [
    {
      code: "10.4.1",
      subTopicName: "Beylikten Devlete Osmanlı Medeniyeti",
      description:
        "Sufilerin ve âlimlerin öğretilerinin Anadolu'nun İslamlaşmasına ve sosyal huzurun yeniden sağlanmasına etkisini açıklar.",
      details: [
        "Öğrencilerin Anadolu'nun İslamlaşmasına ve sosyal huzurun yeniden sağlanmasına etkisi bağlamında başlıca Türk âlim ve mutasavvıfların (Ahmet Yesevi, Ahi Evran, Mevlana Celaleddin-i Rumi, Hacı Bektaş-ı Veli, Yunus Emre, Hacı Bayram-ı Veli) temel öğretilerini araştırıp sonuçlarını paylaşması sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.4.2",
      subTopicName: "Beylikten Devlete Osmanlı Medeniyeti",
      description:
        "Osmanlı devlet idaresinin ilmiye, kalemiye ve seyfiye sınıflarının birlikteliğine dayalı yapısını analiz eder.",
      details: [
        "Osmanlı toplum düzenindeki askerî (vergi vermeyen) - reaya (vergi ödeyen) ayrımına değinilerek ilmiye, kalemiye ve seyfiye sınıflarının ana hatlarıyla açıklanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.4.3",
      subTopicName: "Beylikten Devlete Osmanlı Medeniyeti",
      description:
        "Osmanlı coğrafyasındaki bilim, kültür, sanat ve zanaat faaliyetleri ile bunlara bağlı olarak sosyal hayatta meydana gelen değişimleri analiz eder.",
      details: [
        "a) Türk dünyasında yetişmiş olan bilim insanlarına (Akşemseddin, Ali Kuşçu ve Uluğ Bey) ve çalışmalarına değinilir.",
        "b) Ahşap ve taş işlemeciliği, dokumacılık, çinicilik, hat ve ebru sanatlarına değinilir.",
        "c) Sözlü halk kültürü ile saray çevresi ve belirli şehirlerde oluşan kitabî kültür ana hatlarıyla ele alınır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.6.1",
      subTopicName: "Sultan ve Osmanlı Merkez Teşkilatı",
      description:
        "Topkapı Sarayı'nın devlet idaresinin yanı sıra devlet adamı yetiştirilmesinde ve şehir kültürünün gelişmesindeki rollerini analiz eder.",
      details: [
        "a) Divan-ı Hümayun ve Enderun'a değinilerek Topkapı Sarayı'nın devlet idaresi ve devlet adamı yetiştirilmesinin merkezi olduğu vurgulanır.",
        "b) Öğrencilerin Topkapı Sarayı'na gezi/sanal gezi yapmaları ve Topkapı Sarayı'nın Osmanlı medeniyetine etkisine kanıt gösteren tanıtım rehberi hazırlamaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.6.2",
      subTopicName: "Sultan ve Osmanlı Merkez Teşkilatı",
      description:
        "Osmanlı Devleti'nde merkezi otoriteyi güçlendirmeye yönelik düzenlemeleri analiz eder.",
      details: [
        "Türklerde belirgin bir veraset sisteminin olmamasına, Fatih Kanunnamesi ile padişaha kendi öz kardeşini devletin bekası için katletme izninin verilmesine, müsadere sistemi ve şehzadelerin yetiştirilme usulüne kısaca değinilerek bunların Osmanlı devlet yönetimine etkisi vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "10.7.1",
      subTopicName: "Klasik Çağda Osmanlı Toplum Düzeni",
      description:
        "Osmanlı Devleti'nde millet sisteminin yapısını analiz eder.",
      details: [
        "Ümmet ve millet kavramlarına değinilerek farklı dini ve kültürel kimliklere sahip toplum kesimlerini idare etmenin millet sistemi sayesinde mümkün olduğu vurgulanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.2",
      subTopicName: "Klasik Çağda Osmanlı Toplum Düzeni",
      description:
        "Osmanlı Devleti'nin fethettiği yerleşim yerlerinin İslam kültürü etkisiyle geçirdiği dönüşümü analiz eder.",
      details: [
        "a) Fethedilen bölgelerdeki gayrimüslimlerin yaşadıkları toplumsal değişimi analiz etmeleri sağlanır.",
        "b) Osmanlı şehirlerindeki mahalle merkezli sosyal hayat unsurlarına (panayır ve şenlikler, dini törenlerin günlük hayata yansımaları) değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.3",
      subTopicName: "Klasik Çağda Osmanlı Toplum Düzeni",
      description:
        "Osmanlı ekonomik sistemi içerisinde tarımsal üretimin önemini açıklar.",
      details: [
        "Osmanlı Devleti'nde devletin toprak üzerindeki mülkiyeti ve çiftane sisteminin, zirai üretimin sürdürülmesindeki rolüne değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.4",
      subTopicName: "Klasik Çağda Osmanlı Toplum Düzeni",
      description:
        "Lonca Teşkilatı'nın Osmanlı ekonomik sistemi ve toplum yapısındaki yerini analiz eder.",
      details: [
        "a) Loncaların toplumsal hayat ve mesleki eğitimdeki yerine değinilerek Osmanlı şehirlerindeki başlıca meslek grupları kısaca ele alınır.",
        "b) Osmanlı ekonomik sistemi içerisindeki başlıca ticaret mekânlarını (liman, kervansaray, pazar yeri, bedesten ve kapan) ve Osmanlı yönetiminin tüketici ve üreticiyi korumak için uyguladığı yöntemlere (narh, denetim ve ihracat yasakları) değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "10.7.5",
      subTopicName: "Klasik Çağda Osmanlı Toplum Düzeni",
      description:
        "Osmanlı Devleti'nde vakıfların sosyal hayattaki yerini ve önemini açıklar.",
      details: [
        "a) Vakıfların sosyal hayatta üstlendiği rollere (imar faaliyetleri, dini ve sosyo-ekonomik hizmetler) değinilerek faaliyet alanlarının çeşitliliğini vakfiye örnekleri üzerinden kısaca ele alınır.",
        "b) Öğrencilerin vakıf sistemine yönelik geçmişteki ve günümüzdeki uygulamaların benzer ve farklı yönlerini karşılaştırmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  // ==================== 11. SINIF TARİH ====================

  "Arayış Yılları (17. yüzyıl)": [
    {
      code: "11.1.1",
      subTopicName: "Değişen Dünya Dengeleri (1595-1774)",
      description:
        "1595-1700 yılları arasındaki süreçte meydana gelen başlıca siyasi gelişmeleri tarih şeridi ve haritalar üzerinde gösterir.",
      details: [
        "Haçova Muharebesi (1596), Zitvatorok Antlaşması (1606), Kasr-ı Şirin Antlaşması (1639), Girit'in Fethi (1669), Bucaş Antlaşması (1672), II. Viyana Kuşatması (1683), Karlofça Antlaşması (1699) ve İstanbul Antlaşması (1700) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.2",
      subTopicName: "Değişen Dünya Dengeleri (1595-1774)",
      description:
        "XVII. yüzyılda değişen siyasi rekabet içerisinde Osmanlı Devleti'nin izlediği politikaları açıklar.",
      details: [
        "a) Avusturya'yla yapılan Zitvatorok Antlaşması ile Avrupa diplomasisinde mütekabiliyet esasının kabul edildiği vurgulanır.",
        "b) Osmanlı Devleti'nin Kazak meselesinden dolayı kuzeye yönelme politikasına (Hotin-Kamaniçe ve Çehrin seferleri) değinilir.",
        "c) Kasr-ı Şirin Antlaşması ile Osmanlı Devleti'nin doğu sınırının büyük ölçüde belirlendiğine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.1.3",
      subTopicName: "Değişen Dünya Dengeleri (1595-1774)",
      description:
        "Denizcilik faaliyetlerinin iç denizlerden okyanuslara taşınmasının dünya siyasetine ve ticaretine etkilerini analiz eder.",
      details: [
        "a) Avrupalı güçlerin değişen denizcilik stratejilerini, küresel (askerî ve ekonomik) faaliyetlerini ve uyguladıkları sömürgeciliğinin etkilerini analiz etmeleri sağlanır.",
        "b) Osmanlı Devleti'nin Akdeniz ve Karadeniz hâkimiyetinin zayıflamasının sebepleri üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.1.4",
      subTopicName: "Değişen Dünya Dengeleri (1595-1774)",
      description:
        "1700-1774 yılları arasındaki süreçte Osmanlı Devleti'nin diğer devletlerle yürüttüğü rekabeti ve bu rekabette uyguladığı stratejileri analiz eder.",
      details: [
        "a) Prut Antlaşması (1711), Pasarofça Antlaşması (1718), Patrona Halil İsyanı (1730), Belgrad Antlaşması (1739), Kapitülasyonların sürekli hâle gelmesi (1740), Çeşme Baskını (1770) ve Küçük Kaynarca Antlaşması (1774) verilir.",
        "b) Osmanlı Devleti'nin Karlofça Antlaşması'yla kaybettiği toprakları geri alma stratejisine değinilir.",
        "c) 1768-1774 Osmanlı-Rus Savaşı sebep ve sonuçları bakımından ele alınır. Kırım'ın kaybedilmesini tarihsel önem açısından analiz etmeleri sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "18. Yüzyılda Değişim ve Diplomasi": [
    {
      code: "11.2.1",
      subTopicName: "Değişim Çağında Avrupa ve Osmanlı",
      description:
        "Avrupa düşüncesinde meydana gelen değişimleri ve bunların etkilerini analiz eder.",
      details: [
        "a) Roma Katolik Kilisesi'nin kurduğu baskıya karşı gelişen fikrî-manevi (Rönesans-Reform, sekülerleşme), sosyal ve ekonomik (merkantilizm ve burjuva sınıfının güçlenmesi) değişimler ana hatlarıyla ele alınır.",
        "b) Modern devletler hukukunun ortaya çıkması sürecinde Vestfalya Barışı'nı sebep ve etki açısından analiz etmeleri sağlanır.",
        "c) Bilim Devrimi'nin Avrupa'da meydana getirdiği değişime değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.2",
      subTopicName: "Değişim Çağında Avrupa ve Osmanlı",
      description:
        "Avrupa'daki gelişmelere bağlı olarak Osmanlı idari, askerî ve ekonomik yapısında meydana gelen değişimleri analiz eder.",
      details: [
        "a) Coğrafi Keşifler'in ardından Avrupa'ya ve dünyaya yayılan değerli madenlerin ortaya çıkardığı ekonomik değişimin Osmanlı coğrafyasında enflasyona yol açtığı vurgulanır.",
        "b) Kapitülasyonların sürekli hâle gelmesinin Osmanlı ekonomisine etkisine değinilir.",
        "c) Merkantilist ekonomi ve Askerî Devrim'in Osmanlı Devleti'nin toprak düzeninde ve buna bağlı savaş organizasyonunda yol açtığı zorunlu dönüşümler kısaca açıklanır.",
        "d) Osmanlı Devleti'nde artan savaş finansmanını karşılamak için alınan tedbirlere (vergilerin arttırılması, iltizam ve malikâne sistemleri ve olağanüstü savaş vergileri) değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.2.3",
      subTopicName: "Değişim Çağında Avrupa ve Osmanlı",
      description:
        "Osmanlı devlet idaresi ve toplum düzenindeki çözülmeleri önleme çabalarını analiz eder.",
      details: [
        "a) XVII. ve XVIII. yüzyıllarda gerçekleşen isyanlar (Celali ve Yeniçeri isyanları) kısaca ele alınır.",
        "b) İç siyasi karışıklıklara engel olmak amacıyla Ekber ve Erşed Sistemi'nin ihdas edildiğine değinilir.",
        "c) Layihalarda sunulan çözüm önerilerine Koçi Bey Risalesi örneği üzerinden değinilir.",
        "d) Avrupa'da matbaanın kullanılmaya başlanmasının bilginin üretimine ve bilgiye erişim alanlarında sağladığı imkânlara temas edilerek Osmanlı Devleti'nde Müslüman ve gayrimüslimlerin matbaayı kullanmaya başlama süreçlerine değinilir.",
        "e) Dönemin ilim ve irfan geleneğini canlandıran kişilerden (Evliya Çelebi, Kâtip Çelebi vb.) birine dair çıkarımda bulunmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Yakınçağ Avrupası (1789...)": [
    {
      code: "11.3.1",
      subTopicName: "Devrimler Çağında Devlet-Toplum İlişkileri",
      description:
        "Fransız İhtilali ve Avrupa'da Sanayi Devrimi ile birlikte devlet-toplum ilişkilerinde meydana gelen dönüşümü açıklar.",
      details: [
        "a) Fransız İhtilali'ne giden süreç ve ihtilalin sonuçları ana hatlarıyla açıklanır.",
        "b) Fransız İhtilali ile ortaya çıkan fikir akımlarının; imparatorlukların (Avusturya-Macaristan, Rusya ve Osmanlı) siyasi hayatlarına etkilerine ilişkin örneklere değinilir.",
        "c) Geleneksel üretim tarzı ile endüstriyel üretim tarzı arasındaki farklara değinilir.",
        "d) Avrupa'da Sanayi İnkılabı sonrasında belirginleşen sınıflı toplum yapısının mutlakiyetçi monarşilerin anayasal monarşilere dönüşmesi üzerindeki etkisine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.3.2",
      subTopicName: "Devrimler Çağında Devlet-Toplum İlişkileri",
      description:
        "Sanayi İnkılabı sonrası Avrupalıların giriştiği sistemli sömürgecilik faaliyetleri ile küresel etkilerini analiz eder.",
      details: [
        "Öğrencilerin Avrupa devletlerinin sömürgecilik faaliyetleri kapsamında yaptıkları katliamların etkileri hakkında çıkarımda bulunmaları sağlanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.3.3",
      subTopicName: "Devrimler Çağında Devlet-Toplum İlişkileri",
      description:
        "Osmanlı Devleti'nde modern ordu teşkilatı ve yurttaş askerliğine yönelik düzenlemelerin siyasi ve sosyal boyutlarını analiz eder.",
      details: [
        "a) Fransız İhtilali sonrasında Avrupa'da uygulanmaya başlanan zorunlu askerlik sisteminin gerekçelerine ve sosyo-politik etkilerine değinilir.",
        "b) Osmanlı Devleti'nin yeni düzenli ordu kurma teşebbüslerinin (Nizam-ı Cedit, Yeniçeri Ocağı'nın kaldırılması ve Asakir-i Mansure-i Muhammediye) gerekçeleri analiz etmeleri sağlanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.3.4",
      subTopicName: "Devrimler Çağında Devlet-Toplum İlişkileri",
      description:
        "Ulus devletleşme ve endüstrileşme süreçlerinin sosyal hayata yansımalarını analiz eder.",
      details: [
        "a) Ulaşım ve haberleşme sektörlerindeki gelişmelerin (demiryolu, telgraf) merkezi idarelere hâkimiyet alanları üzerindeki otoritelerini arttırma imkânı vermesi Osmanlı Devleti örneği üzerinden ele alınır.",
        "b) Avrupa devletleriyle girilen siyasi ve askerî rekabet çerçevesinde açılan kurumlara (Hendesehane, Mühendishaneler, Mekteb-i Harbiye, Tıbbiye, Mülkiye) ve II. Mahmud Dönemi'nden itibaren zorunlu örgün eğitime başlatılmasına değinilir.",
        "c) Osmanlı Devleti'nde açılan azınlık okulları ile yabancı ve misyoner okullarına değinilerek II. Abdülhamid Dönemi'nde devlet tarafından kurulan okullar kısaca ele alınır.",
        "d) Türk tarihinde siyasi ve sosyal alanlardaki yüzyıllar boyunca süren değişime rağmen önemini devam ettiren/varlığını koruyan unsurlara (dil, aile yapısı, bayrak) değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "En Uzun Yüzyıl (1800-1922)": [
    {
      code: "11.4.1",
      subTopicName: "Uluslararası İlişkilerde Denge Stratejisi (1774-1914)",
      description:
        "1774-1914 yılları arasındaki süreçte meydana gelen başlıca siyasi gelişmeleri tarih şeridi ve haritalar üzerinde gösterir.",
      details: [
        "Kırım'ın ilhakı (1783), Fransız İhtilali (1789), Yaş Antlaşması (1792), Sırp İsyanı (1804), Viyana Kongresi (1815), Rum İsyanı (1821), Edirne Antlaşması (1829), Hünkâr İskelesi Antlaşması (1833), Balta Limanı Antlaşması (1838), Tanzimat Fermanı (1839), Londra Boğazlar Sözleşmesi (1841), Kırım Savaşı (1853-1856), Islahat Fermanı (1856), Paris Antlaşması (1856), Kanun-i Esasi (1876), Osmanlı-Rus Savaşı (1877-1878), Berlin Antlaşması (1878), Duyun-ı Umumiye İdaresinin kurulması (1881), II. Meşrutiyet'in ilanı (1908), Trablusgarp Savaşı (1911), I. Balkan Savaşı (1912) ve II. Balkan Savaşı (1913) verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.2",
      subTopicName: "Uluslararası İlişkilerde Denge Stratejisi (1774-1914)",
      description:
        "Osmanlı Devleti'nin siyasi varlığına yönelik iç ve dış tehditleri analiz eder.",
      details: [
        "a) Osmanlı Devleti'nin güç kaybetmesiyle birlikte büyük güçlerin Osmanlı coğrafyasına nüfuz etme, muhtemel bir dağılma durumunda Osmanlı topraklarını paylaşma (Şark Meselesi) veya işgal etme çabaları küresel güç mücadelesi bağlamında ele alınır.",
        "b) 1815 Viyana Kongresi ile başlayan süreçte büyük güçlerin müdahalesiyle uluslararası boyut kazanan konular ele alınır.",
        "c) Mehmet Ali Paşa'nın Osmanlı Devleti'nin merkezi yönetimine rağmen güç kazanması ve nüfuz alanını genişletme çabalarına değinilir.",
        "d) 1768-1914 arasındaki süreçte Osmanlı-Rus rekabetini sebep-sonuç ilişkisi açısından analiz etmeleri sağlanır.",
        "e) Avrupa devletleri arasındaki bloklaşmayla değişen uluslararası şartlara değinilerek Avrupa'daki topraklarını kaybeden Osmanlı Devleti'nin çeşitli büyük güçlerle ittifak arayışları ele alınır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.3",
      subTopicName: "Uluslararası İlişkilerde Denge Stratejisi (1774-1914)",
      description:
        "Tanzimat Fermanı, Islahat Fermanı ve Kanun-i Esasi'nin içeriklerini küresel ve yerel siyasi şartlar bağlamında değerlendirir.",
      details: [
        "a) Sened-i İttifak, Tanzimat ve Islahat Fermanları ile Kanun-i Esasi'nin (I. ve II. Meşrutiyet); uluslararası güçler, yerel siyasi aktörler ve ahalinin kriz dönemlerindeki farklı taleplerinin merkezi idare tarafından uzlaştırılmasına yönelik çabalar olduğunu değerlendirmeleri sağlanır.",
        "b) Mecelle ve Kanun-i Esasi örnekleri üzerinden Osmanlı hukuk sisteminde meydana gelen değişiklikler; devlet-toplum ilişkileri ve Osmanlı Devleti'nin Avrupa siyasi sistemine entegrasyonu çerçevesinde kısaca ele alınır.",
        "c) Osmanlı Devleti'nin dağılmasını önlemeye yönelik Üç Tarz-ı Siyaset olarak bilinen fikir akımlarının, merkezi idarenin ve düşünce adamlarının siyasi ve toplumsal birliği koruma çabaları olduğuna değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "11.4.4",
      subTopicName: "Uluslararası İlişkilerde Denge Stratejisi (1774-1914)",
      description:
        "1876-1913 arasında gerçekleştirilen darbelerin Osmanlı siyasi hayatı üzerindeki etkilerini değerlendirir.",
      details: [
        "a) 1876, 1909 ve 1913 darbelerinin sebeplerine ve sosyo-politik sonuçlarına ve bu süreçte yaşanan toprak kayıplarına değinilir.",
        "b) Öğrencilerin Osmanlı Devleti'nde gerçekleştirilen darbeleri ve bunların karakteristik özelliklerini analiz etmeleri sağlanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.5.1",
      subTopicName: "XIX ve XX. Yüzyılda Değişen Sosyo-Ekonomik Hayat",
      description:
        "Osmanlı Devleti'nin son dönemlerinde endüstriyel üretime geçiş çabalarını ve bu süreçte yaşanan zorlukları analiz eder.",
      details: [
        "a) Osmanlı Devleti'nde sanayileşme çabalarının önündeki engellere (sermaye, bilim ve teknoloji, yetişmiş personel ve uzun vadeli strateji konularındaki yetersizlikler) değinilir.",
        "b) Küresel kapitalist güçlerle rekabet etme konusundaki zorluklar; 1838 Balta Limanı Antlaşması örneğinden hareketle gümrük ve ticaret antlaşmalarının sınırlayıcılığı ve yerli üretim yerine ithalatın tercih edilmesi gibi faktörler bağlamında kısaca ele alınır.",
        "c) 1856'dan sonraki süreçte kamu maliyesinde yaşanan borç krizleri sonucunda Duyun-ı Umumiye İdaresinin kurulmasına değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.5.2",
      subTopicName: "XIX ve XX. Yüzyılda Değişen Sosyo-Ekonomik Hayat",
      description:
        "Osmanlı Devleti'nin son dönemlerindeki nüfus hareketlerinin siyasi, askerî ve ekonomik sebep ve sonuçlarını analiz eder.",
      details: [
        "a) Osmanlı Devleti'ndeki nüfus artış hızının büyük güçlere nispetle azalmasının uluslararası rekabette güç kaybı üzerindeki etkilerine değinilir.",
        "b) Osmanlı Devleti'nin toprak kaybetmesiyle başlayan süreçte Türk ve Müslüman ahalinin maruz kaldığı katliamlar, İstanbul ve Anadolu'ya yaptıkları göçler sırasında yaşadıklarını tarihsel empati kurarak analiz etmeleri sağlanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "11.5.3",
      subTopicName: "XIX ve XX. Yüzyılda Değişen Sosyo-Ekonomik Hayat",
      description:
        "Modernleşmeyle birlikte sosyal, ekonomik ve politik anlayışta yaşanan değişim ve dönüşümlerin gündelik hayata etkilerini analiz eder.",
      details: [
        "a) Modern şehirlerin dokusunda yaşanan değişimin olumlu ve olumsuz sonuçları kısaca ele alınır.",
        "b) XIX. yüzyıldaki salgın hastalıkların etkilerini ve Osmanlı Devleti'nin buna yönelik aldığı tedbirler kapsamında edinilen tecrübeyi analiz etmeleri sağlanır.",
        "c) XIX. yüzyılda gazetelerin ve diğer süreli yayınların artmasıyla birlikte kamuoyunun etkin hâle geldiği vurgulanır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  // ==================== T.C. İNKILAP TARİHİ ====================

  "20. Yüzyıl Başlarında Osmanlı Devleti": [
    {
      code: "I.1.1",
      subTopicName: "20. Yüzyıl Başlarında Osmanlı Devleti ve Dünya",
      description:
        "Mustafa Kemal'in Birinci Dünya Savaşı'na kadarki eğitim ve askerlik hayatını içinde bulunduğu toplumun siyasi, sosyal ve kültürel yapısı ile ilişkilendirir.",
      details: [
        "a) Mustafa Kemal'in aldığı eğitimin, okuduğu okulların ve öğretmenlerinin onun yetişmesine ve kişiliğinin oluşmasına etkilerine değinilir.",
        "b) Selanik, Manastır, İstanbul, Şam ve Sofya şehirlerindeki siyasi ve sosyal ortamın, okuduğu kitapların, yerli ve yabancı düşünürlerin ve fikir akımlarının Mustafa Kemal'in fikirlerine etkisi ele alınır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.1.2",
      subTopicName: "20. Yüzyıl Başlarında Osmanlı Devleti ve Dünya",
      description:
        "20. yüzyıl başlarında Osmanlı Devleti'nin siyasi, sosyal ve ekonomik durumunu analiz eder.",
      details: [
        "a) II. Meşrutiyet'i hazırlayan fikrî, siyasi ve sosyal gelişmelere ve bu bağlamda İttihat ve Terakki Cemiyetine değinilir.",
        "b) Balkan Savaşlarının Osmanlı Devleti'nin sınırlarının değişmesine ve bu savaşların Osmanlı toplum yapısına etkilerine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "1. Dünya Savaşı": [
    {
      code: "I.1.3",
      subTopicName: "I. Dünya Savaşı Süreci",
      description:
        "I. Dünya Savaşı sürecinde Osmanlı Devleti'nin durumunu siyasi, askerî ve sosyal açılardan analiz eder.",
      details: [
        "a) I. Dünya Savaşı'nın sebepleri ve Osmanlı Devleti'nin savaşa girmesinin gerekçeleri üzerinde durulur.",
        "b) Osmanlı Devleti'nin savaştığı cepheler taarruz ve savunma özellikleri de belirtilerek ele alınır.",
        "c) Çanakkale Cephesi'ndeki kara ve deniz zaferleri ile Irak Cephesi'ndeki Kut'ül-Amare Zaferi'ne, Kafkas İslami Ordusuna ve Medine Müdafaası'na değinilir.",
        "d) Mustafa Kemal'in Çanakkale, Kafkas ve Suriye Cephelerindeki faaliyetleri ele alınır.",
        "e) 1915 Olayları ile Ermeni Tehciri'ne değinilir.",
        "f) I. Dünya Savaşı sırasında Anadolu'da halkın durumu, yaşanan sıkıntılar üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.1.4",
      subTopicName: "I. Dünya Savaşı Sonuçları",
      description:
        "I. Dünya Savaşı'nın sonuçlarını Osmanlı Devleti ve Batılı devletler açısından değerlendirir.",
      details: [
        "a) Mondros Ateşkes Antlaşması ve bu antlaşmanın uygulanması üzerinde durulur.",
        "b) Mondros Ateşkes Antlaşması'na karşı İstanbul Hükûmetinin, Mustafa Kemal'in ve halkın tutumu üzerinde durulur.",
        "c) İtilaf Devletleri'nin gerçekleştirdikleri işgal ve uygulamalarla Wilson İlkeleri arasındaki çelişkiye değinilir.",
        "d) Paris Barış Konferansı'na değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Milli Mücadeleye Hazırlık Dönemi": [
    {
      code: "I.2.1",
      subTopicName: "Millî Mücadele",
      description:
        "Kuvay-ı Milliye hareketinin oluşumundan Büyük Millet Meclisinin açılışına kadar olan süreçte meydana gelen gelişmeleri açıklar.",
      details: [
        "a) İzmir'in işgaline ve işgale tepki olarak meydana gelen gelişmelere değinilir.",
        "b) Mustafa Kemal'in Samsun'a çıkarak Millî Mücadele'yi başlatmasına değinilir.",
        "c) Millî cemiyetler ve millî varlığa düşman cemiyetler üzerinde durulur. Pontus Meselesi kısaca ele alınır.",
        "d) Havza ve Amasya Genelgeleri, yerel kongreler ile Erzurum ve Sivas Kongrelerinin millî hâkimiyet ve millî birliğin sağlanması açısından önemi vurgulanır.",
        "e) Amiral Bristol ve General Harbord Raporları üzerinden işgallerin haksızlığına değinilir.",
        "f) Amasya Görüşmeleri'ne değinilir.",
        "g) Misak-ı Millî Kararları ve önemi üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.2.2",
      subTopicName: "Millî Mücadele",
      description:
        "Büyük Millet Meclisinin açılış sürecini ve sonrasında meydana gelen gelişmeleri kavrar.",
      details: [
        "a) BMM'nin açılış gerekçeleri vurgulanarak bu meclisin genel özelliklerine değinilir.",
        "b) BMM'ye karşı ayaklanmalar ve ayaklanmaların bastırılması için alınan tedbirlere değinilir.",
        "c) İstiklal Mahkemeleri'nin kuruluş gerekçeleri, işleyişi ve bu mahkemelere getirilen eleştirilere çeşitli kaynak ve görüşlerden alıntılar yapılarak yer verilir.",
        "d) Anadolu Ajansının kurulmasına değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.2.3",
      subTopicName: "Millî Mücadele",
      description:
        "Sevr Antlaşması'nın Millî Mücadele sürecine etkilerini analiz eder.",
      details: [
        "a) Sevr Antlaşması'nın öngördüğü sınırları harita üzerinde gösterilir.",
        "b) Sevr Antlaşması'na karşı İstanbul Hükûmetinin, Mustafa Kemal'in ve halkın tutumu üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.2.7",
      subTopicName: "Millî Mücadele",
      description:
        "Millî Mücadele sürecine katkıda bulunmuş önemli şahsiyetlerin kişilik özellikleri ile faaliyetlerini ilişkilendirir.",
      details: [
        "a) Halide Onbaşı, Şerife Bacı, Fatma Seher Erden, Gördesli Makbule, Tayyar Rahmiye gibi kadın kahramanların Millî Mücadele'ye katkılarına değinilir.",
        "b) Millî Mücadele'nin gerçekleşmesinde önemli rol oynayan İsmet İnönü, Kâzım Karabekir, Fevzi Çakmak, Şahin Bey, Sütçü İmam gibi kahramanların şahsiyetleri hakkındaki anekdotlara yer verilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Kurtuluş Savaşında Cepheler": [
    {
      code: "I.2.4",
      subTopicName: "Doğu ve Güney Cepheleri",
      description:
        "Doğu ve Güney Cephelerinde verilen mücadelelerin ülkemizin bağımsızlık sürecine katkılarını kavrar.",
      details: [
        "Doğu ve Güney Cephelerinde Türk milletinin elde ettiği başarıların ulusal ve uluslararası sonuçları üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.2.5",
      subTopicName: "Batı Cephesi",
      description:
        "Düzenli ordunun kurulmasından Mudanya Ateşkes Antlaşması'na kadar meydana gelen gelişmelerin Türkiye'nin bağımsızlık sürecine katkısını analiz eder.",
      details: [
        "a) Düzenli ordunun kurulmasının gerekçeleri üzerinde durulur.",
        "b) Batı Cephesi'nde elde edilen askerî başarılar ve bu başarıların siyasi etkileri vurgulanır.",
        "c) Teşkilat-ı Esasiye Kanunu'na (1921 Anayasası) değinilir.",
        "d) Mehmet Akif Ersoy'un Millî Mücadele'deki yeri ile İstiklal Marşı'nın kabulü ve önemi üzerinde durulur.",
        "e) Maarif Kongresi'nin düzenlenmesi ve önemi vurgulanır.",
        "f) Sakarya Meydan Muharebesi ve Büyük Taarruz'un Millî Mücadele'deki önemi üzerinde durularak Mustafa Kemal'in bu muharebelerin kazanılmasındaki rolü vurgulanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.2.6",
      subTopicName: "Diplomatik Başarılar",
      description:
        "Millî Mücadele sonucunda kazanılan diplomatik başarıları ülkemizin bağımsızlığı açısından değerlendirir.",
      details: [
        "a) Mudanya Ateşkes Antlaşması'nın önemi vurgulanır.",
        "b) Türkiye'nin bağımsız bir devlet olarak tanınmasında Lozan Barış Antlaşması'nın önemi vurgulanır.",
        "c) Lozan Barış Antlaşması'nın maddeleri ile Sevr Antlaşması'nın maddeleri karşılaştırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Türk İnkılabı": [
    {
      code: "I.3.1",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Çağdaşlaşan Türkiye'nin temeli olan Atatürk ilkelerini kavrar.",
      details: [
        "Cumhuriyetçilik, Milliyetçilik, Halkçılık, Laiklik, Devletçilik ve İnkılapçılık ilkeleri açıklanır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.3.2",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Siyasi alanda meydana gelen gelişmeleri kavrar.",
      details: [
        "a) Saltanatın kaldırılması, Ankara'nın başkent oluşu, Cumhuriyet'in ilan edilmesi, Halifeliğin kaldırılması, Şer'iye ve Evkaf Vekâletinin kaldırılması, Erkân-ı Harbiye Vekâletinin kaldırılması, 1924 Anayasası'nın kabulünün neden ve sonuçlarıyla yer verilir.",
        "b) Siyasi alanda gelen gelişmeler Atatürk ilkeleri ile ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.3.3",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Hukuk alanında meydana gelen gelişmelerin Türk toplumunda meydana getirdiği değişimleri kavrar.",
      details: [
        "a) Hukuki düzenlemelerin neden yapıldığı kısaca açıklanır ve bu alanda uygulama birliğinin önemi vurgulanır.",
        "b) Türk Medeni Kanunu'nun aile yapısında ve kadının toplumdaki yerinde meydana getirdiği değişim vurgulanır.",
        "c) Hukuk alanında gelen gelişmeler Atatürk ilkeleri ile ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.3.4",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Eğitim ve kültür alanında yapılan inkılapları ve gelişmeleri kavrar.",
      details: [
        "a) Tevhid-i Tedrisat Kanunu, Harf İnkılabı, Millet Mektepleri, Türk Tarih Kurumu ve Türk Dil Kurumu ele alınır.",
        "b) 1933 Üniversite Reformu'ndan hareketle Atatürk'ün bilimsel gelişme ve kalkınmaya verdiği önem vurgulanır.",
        "c) Atatürk'ün güzel sanatlara ve spora verdiği önem açıklanırken müzik, heykel ve resim alanlarındaki uygulamalardan ve kurumsallaşmalardan örnekler verilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.3.5",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Toplumsal alanda yapılan inkılapları ve meydana gelen gelişmeleri kavrar.",
      details: [
        "a) Kılık ve kıyafette yapılan düzenlemeler, tekke, zaviye ve türbelerin kapatılması, takvim, saat ve ölçülerde değişiklik yapılması ile Soyadı Kanunu konuları ele alınır.",
        "b) Türk kadınının siyasi, sosyal ve eğitim alanlarında sağlanan haklar üzerinde durulur.",
        "c) Toplumsal alanda yapılan inkılaplar ve gelişmeler Atatürk ilkeleri ile ilişkilendirilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.3.6",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Ekonomi alanında meydana gelen gelişmeleri kavrar.",
      details: [
        "a) İzmir İktisat Kongresi'nde alınan kararlar millî iktisat anlayışı ve tasarruf bilinci açılarından ele alınır.",
        "b) Tarım, sanayi, ticaret ve denizcilik alanlarında yapılan çalışmalar üzerinde durulur.",
        "c) 1929 Dünya Ekonomik Bunalımı'nın Türkiye ekonomisine etkilerine kısaca değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.3.7",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Atatürk Dönemi'nde sağlık alanında yapılan çalışmaları kavrar.",
      details: null,
      isKeyKazanim: false,
    },
    {
      code: "I.3.8",
      subTopicName: "Atatürkçülük ve Türk İnkılabı",
      description:
        "Atatürk ilke ve inkılaplarını oluşturan temel esasları Atatürkçü düşünce sistemi açısından analiz eder.",
      details: [
        "Millî tarih bilinci, vatan ve millet sevgisi, millî dil, bağımsızlık ve özgürlük, egemenliğin millete ait olması, millî kültürün geliştirilmesi, Türk milletini çağdaş uygarlık düzeyinin üzerine çıkarma, millî birlik ve beraberlik, ülke bütünlüğü çerçevesinde ele alınır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],

  "Atatürkçülük ve Atatürk İlkeleri": [
    {
      code: "I.4.1",
      subTopicName: "İki Savaş Arasındaki Dönemde Türkiye ve Dünya",
      description:
        "Atatürk Dönemi'nde Türkiye Cumhuriyeti'nin iç politikasındaki önemli gelişmeleri açıklar.",
      details: [
        "a) I. Meclisin ve II. Meclisin teşekkülündeki yöntem ve süreçlere kısaca değinilir.",
        "b) Çok partili hayata geçiş çerçevesinde partileşme çabaları ele alınır.",
        "c) Mustafa Kemal'e suikast girişimine değinilir.",
        "d) Bu dönemde çok partili siyasi hayatın devamlılığının sağlanamamasının nedenleri üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.4.2",
      subTopicName: "İki Savaş Arasındaki Dönemde Türkiye ve Dünya",
      description:
        "Atatürk Dönemi'nde (1923-1938) Türkiye Cumhuriyeti'nin dış politikasındaki başlıca gelişmeleri açıklar.",
      details: [
        "a) Türkiye'nin Yunanistan, İngiltere, Fransa ve SSCB ile ilişkilerine değinilir.",
        "b) Musul Sorunu ve bu soruna ilişkin Türk ve İngiliz tezleri üzerinde durulur.",
        "c) Türkiye'nin Milletler Cemiyetine üyeliği, Balkan Antantı, Sadabat Paktı, Montrö Boğazlar Sözleşmesi ve Hatay'ın ana vatana katılması üzerinde durulur.",
        "d) Atatürk'ün ölümüne ve İsmet İnönü'nün cumhurbaşkanı seçilmesine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.4.3",
      subTopicName: "İki Savaş Arasındaki Dönemde Türkiye ve Dünya",
      description:
        "İki dünya savaşı arasındaki dönemde dünyada meydana gelen siyasi ve ekonomik gelişmeleri kavrar.",
      details: [
        "a) Birinci Dünya Savaşı sonrası kalıcı barışı sağlama çabalarına (Milletler Cemiyeti, Locarno Antlaşması ve Briand-Kellogg Paktı) değinilir.",
        "b) 1929 Dünya Ekonomik Bunalımı (Kara Perşembe) ve etkileri üzerinde durulur.",
        "c) İki savaş arasındaki dönemde etkilerini artıran faşizm, nazizm, komünizm, sosyalizm, liberalizm ve kapitalizmin genel özelliklerine ve siyasi etkilerine değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
  ],

  "Türk Dış Politikası": [
    {
      code: "I.5.1",
      subTopicName: "II. Dünya Savaşı Sürecinde Türkiye ve Dünya",
      description:
        "II. Dünya Savaşı'nın sebepleri, başlaması ve yayılmasıyla ilgili başlıca gelişmeleri kavrar.",
      details: [
        "a) II. Dünya Savaşı'nın arka planında yer alan stratejik ve emperyalist rekabet vurgulanır.",
        "b) II. Dünya Savaşı'nın seyrini değiştiren gelişmeler (Stalingrad Kuşatması, Normandiya Çıkarması) ele alınır.",
        "c) Birleşmiş Milletler Teşkilatı'nın kuruluş amacına ve günümüzdeki misyonuna değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.5.2",
      subTopicName: "II. Dünya Savaşı Sürecinde Türkiye ve Dünya",
      description:
        "II. Dünya Savaşı sürecinde Türkiye'nin izlediği siyaset ile savaşın Türkiye üzerindeki ekonomik ve toplumsal etkilerini analiz eder.",
      details: [
        "Savaş sırasında Türkiye'nin aldığı ekonomik tedbirlerin (Millî Korunma Kanunu, Varlık Vergisi, karne uygulaması, tarımsal ürünlerin ordu ihtiyacına yönlendirilmesi) toplumsal hayata yansımalarına değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.5.3",
      subTopicName: "II. Dünya Savaşı Sürecinde Türkiye ve Dünya",
      description: "II. Dünya Savaşı'nın sonuçlarını değerlendirir.",
      details: [
        "a) Atlantik Bildirisi, Yalta ve Potsdam Konferanslarından hareketle savaşın siyasi sonuçlarına ve ortaya çıkan iki kutuplu dünya düzenine değinilir.",
        "b) Ortadoğu'nun yeniden şekillenmesi ile ilgili gelişmelere yer verilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.6.1",
      subTopicName: "II. Dünya Savaşı Sonrasında Türkiye ve Dünya",
      description:
        "1945-1950 yılları arasında Türkiye'de meydana gelen siyasi, sosyal ve ekonomik gelişmeleri kavrar.",
      details: [
        "a) Çok partili hayata geçişin ve Demokrat Parti'nin kurulmasının Türk demokrasi tarihi açısından önemi üzerinde durulur.",
        "b) 1946 ve 1950 seçimleri ile seçim sistem ve usullerindeki değişimler üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.6.2",
      subTopicName: "II. Dünya Savaşı Sonrasında Türkiye ve Dünya",
      description:
        "II. Dünya Savaşı sonrası dönemde uluslararası ilişkilerde ve Türk dış politikasında meydana gelen gelişmeleri kavrar.",
      details: [
        "a) Savaş sonrası ABD ve SSCB'nin iki küresel güç olarak ortaya çıkmasına ve bu bağlamda Varşova Paktı ve Kuzey Atlantik Örgütü'nün (NATO) kurulmalarına değinilir.",
        "b) Truman Doktrini'nin Türkiye'nin dış politika yönelimleri üzerindeki etkisine ve bu etkilerin yansımalarına (Kore Savaşı ve Türkiye'nin NATO üyeliği) değinilir.",
        "c) Türkiye'nin Avrupa Konseyi'ne girmesine değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.6.3",
      subTopicName: "II. Dünya Savaşı Sonrasında Türkiye ve Dünya",
      description:
        "1950'ler Türkiye'sinde meydana gelen siyasi, sosyal ve ekonomik gelişmeleri analiz eder.",
      details: [
        "Marshall yardımlarının Türk ekonomisine etkisi (tarımda makineleşmeye bağlı olarak köyden kente göç ve sonuçları, demir yolu yapımından kara yolu yapımına dönüş) üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.7.1",
      subTopicName: "Toplumsal Devrim Çağında Dünya ve Türkiye",
      description:
        "1960 sonrasında dünya siyasetinde ortaya çıkan gelişmeleri açıklar.",
      details: [
        "a) Arap-İsrail Savaşlarına kısaca değinilir.",
        "b) İran-Irak Savaşı'nın sebep ve sonuçları kısaca ele alınır.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.7.2",
      subTopicName: "Toplumsal Devrim Çağında Dünya ve Türkiye",
      description:
        "1960'lardan itibaren Türk dış politikasını etkileyen önemli gelişmeleri kavrar.",
      details: [
        "a) Kıbrıs Sorunu'nun ortaya çıkış nedenleri (ENOSİS, Megalo İdea, EOKA), Kıbrıs Barış Harekâtı ve sonrasında meydana gelen gelişmeler üzerinde durulur.",
        "b) Ege Adaları, Kıta Sahanlığı, Batı Trakya Türklerinin sorunları bağlamında Türk-Yunan ilişkileri üzerinde durulur.",
        "c) Ermeni Sorunu bağlamında Türkiye'ye karşı gerçekleştirilen uluslararası girişim ve faaliyetlere (ASALA ve diaspora) değinilir.",
      ].join("\n"),
      isKeyKazanim: true,
    },
    {
      code: "I.7.3",
      subTopicName: "Toplumsal Devrim Çağında Dünya ve Türkiye",
      description:
        "1960'lardan itibaren Türkiye'de meydana gelen siyasi, ekonomik ve sosyo-kültürel gelişmeleri analiz eder.",
      details: [
        "a) 27 Mayıs Askerî Darbesi, 1971 Muhtırası ve 1980 Askerî Darbesi ile bu olayların siyasi ve sosyo-ekonomik etkileri kısaca ele alınır.",
        "b) 1961 ve 1982 Anayasaları, yapıları ve insan haklarına yaklaşım tarzları bakımından karşılaştırılır.",
        "c) Yurt dışına ve köyden kente yapılan göçler ile bu göçlerin sosyal hayatta meydana getirdiği değişimler ele alınır.",
        "d) Ekonomik alandaki liberalleşme politikalarına (serbest piyasa ekonomisi, özelleştirme, ithalat yasaklarının kaldırılması, IMF ile ilişkiler ve KDV uygulaması) değinilir.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.8.1",
      subTopicName: "21. Yüzyılın Eşiğinde Türkiye ve Dünya",
      description:
        "1990 sonrasında Türkiye'de meydana gelen ekonomik, siyasi, sosyal ve kültürel gelişmeleri kavrar.",
      details: [
        "a) Türkiye'de ortaya çıkan ekonomik krizler (5 Nisan 1994, 2001 ve 2008 Krizleri) ve bu krizlerin toplumsal yansımaları üzerinde durulur.",
        "b) 28 Şubat müdahalesi, 27 Nisan e-muhtırası ve 15 Temmuz darbe kalkışması ile bunların etkilerine değinilir.",
        "c) Terör ve terör örgütlerinin (PKK/PYD, DEAŞ, FETÖ) ortaya çıkış nedenleri ile terörü önlemeye yönelik tedbirlere 15 Temmuz 2016 darbe kalkışması örneği üzerinden değinilir.",
        "d) Bilim, sanat ve spor alanlarındaki başlıca gelişmeler üzerinde durulur.",
      ].join("\n"),
      isKeyKazanim: false,
    },
    {
      code: "I.8.2",
      subTopicName: "21. Yüzyılın Eşiğinde Türkiye ve Dünya",
      description:
        "1990 sonrasında meydana gelen siyasi gelişmelerin Türkiye'ye etkilerini ve dünya siyasi konjonktürü bağlamında analiz eder.",
      details: [
        "a) SSCB'nin dağılması ile bağımsızlığını kazanan Türk cumhuriyetlerine (Azerbaycan, Özbekistan, Kazakistan, Kırgızistan, Türkmenistan) yönelik kurulan kuruluşlara (TİKA, Yurtdışı Türkler ve Akraba Topluluklar Başkanlığı, TÜRKSOY ve Yunus Emre Enstitüsü) ve bu kuruluşların faaliyetlerine kısaca değinilir.",
        "b) Avrupa Birliği (AB) ile Türkiye arasındaki ilişkiler kısaca ele alınır.",
        "c) Bosna-Hersek Savaşı ile bu savaş sonrasında Balkanlarda meydana gelen gelişmelere kısaca değinilir.",
        "d) Orta Doğu'da meydana gelen başlıca gelişmeler (Siyonizm Sorunu, 1990 ve 2003 Körfez Savaşları ve Arap Baharı'nın Orta Doğu ve dünyaya etkileri) kısaca ele alınır.",
        "e) 11 Eylül Saldırıları sonrasında dünyanın çeşitli bölgelerinde meydana gelen terör eylemleri karşısında ülke ve toplumların takındıkları tavırların çeşitlilikleri vurgulanır ve örneklendirilir.",
        "f) Irak ve Suriye'deki siyasi gelişmeler ile bu gelişmelerin Türkiye'ye etkilerine değinilir. Bu bağlamda Türkiye'nin mülteci sorununa yaklaşımı ile diğer ülkelerin bu soruna yaklaşımları karşılaştırılır.",
      ].join("\n"),
      isKeyKazanim: true,
    },
  ],
};

// =====================================================================
// ANA SEED FONKSİYONU
// =====================================================================

async function main() {
  const tyt = await prisma.examType.findUnique({ where: { slug: "tyt" } });
  if (!tyt) {
    console.log("TYT exam type bulunamadı, atlıyorum.");
    return;
  }

  const tarihSubject = await prisma.subject.findFirst({
    where: { name: "Tarih", examTypeId: tyt.id },
  });
  if (!tarihSubject) {
    console.log("TYT Tarih subject bulunamadı, atlıyorum.");
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
    console.error("seed-tyt-tarih-kazanim error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
