// =============================================================================
// KIMYA KAZANIM DATA - OSYM 2026
// Extracted from PDF pages 183-202
// TODO: Pages 203-206 are MISSING (likely remaining 12.3 Organik Bilesikler subtopics:
//   Alkoller, Eterler, Aldehitler, Ketonlar, Karboksilik Asitler, Esterler, Aminler)
// =============================================================================

export interface TopicEntry {
  topicKey: string;
  topicName: string;
  examType: "TYT" | "AYT";
  subjectName: string;
  sortOrder: number;
  kazanimlar: {
    code: string;
    subTopicName?: string;
    description: string;
    isKeyKazanim?: boolean;
    details?: string[];
  }[];
}

export function getKimyaTopics(): TopicEntry[] {
  return [
    // ============================================================
    //  KIMYA — TYT (9-10. sinif)
    // ============================================================

    // 9.1. KIMYA BILIMI
    {
      topicKey: "kimya_bilimi",
      topicName: "Kimya Bilimi",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 1,
      kazanimlar: [
        {
          code: "9.1.1.1",
          subTopicName: "Simyadan Kimyaya",
          description: "Kimyanin bilim olma surecini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Simya ile kimya bilimi arasindaki fark vurgulanir.",
            "b) Kimya biliminin gelisim sureci ele alinirken Mezopotamya, Cin, Hint, Misir, Yunan, Orta Asya ve Islam uygarliklarinin kimya bilimine yaptigi katkilara iliskin okuma parcasi verilir.",
            "c) Simyadan kimyaya gecis surecine katki saglayan bilim insanlarindan bazilarinin (Empedokles, Democritus, Aristo, Cabir bin Hayyan, Ebubekir er-Razi, Robert Boyle, Antoine Lavoisier) kimya bilimine iliskin calismalari kisaca tanitilir.",
          ],
        },
        {
          code: "9.1.2.1",
          subTopicName: "Kimya Disiplinleri ve Kimyacilarin Calisma Alanlari",
          description: "Kimyanin ve kimyacilarin baslica calisma alanlarini aciklar.",
          details: [
            "a) Biyokimya, analitik kimya, organik kimya, anorganik kimya, fizikokimya, polimer kimyasi ve endustriyel kimya disiplinleri kisaca tanitilir.",
            "b) Ilac, gubre, petrokimya, aritim, boya-tekstil alanlarinin kimya ile iliskisi belirtilir.",
            "c) Kimya alani ile ilgili kimya muhendisligi, metalurji muhendisligi, eczaci, kimyager, kimya ogretmenligi meslekleri tanitilir.",
          ],
        },
        {
          code: "9.1.3.1",
          subTopicName: "Kimyanin Sembolik Dili",
          description: "Gunluk hayatta siklikla etkilesimde bulunulan elementlerin adlarini sembolleriyle eslestirir.",
          isKeyKazanim: true,
          details: [
            "a) Element tanimi yapilir.",
            "b) Periyodik sistemdeki ilk 20 element ve gunluk hayatta sikca kullanilan krom, mangan, demir, kobalt, nikel, bakir, cinko, brom, gumus, kalay, iyot, baryum, platin, altin, civa, kursun elementlerinin sembolleri tanitilir.",
          ],
        },
        {
          code: "9.1.3.2",
          subTopicName: "Kimyanin Sembolik Dili",
          description: "Bilesiklerin formullerini adlariyla eslestirir.",
          details: [
            "a) Bilesik tanimi yapilir.",
            "b) H2O, HCl, H2SO4, HNO3, CH3COOH, CaCO3, NaHCO3, NH3, Ca(OH)2, NaOH, KOH, CaO ve NaCl bilesiklerinin yaygin adlari tanitilir.",
          ],
        },
        {
          code: "9.1.4.1",
          subTopicName: "Kimya Uygulamalarinda Is Sagligi ve Guvenligi",
          description: "Kimya laboratuvarlarinda uyulmasi gereken is sagligi ve guvenligi kurallarini aciklar.",
          details: [
            "a) Kimyada kullanilan saglik ve guvenlik amacli temel uyari isaretleri [yanici, yakici, korozif, patlayici, tahris edici, zehirli (toksik), radyoaktif ve cevreye zararli anlamina gelen isaretler] tanitilir.",
            "b) Is sagligi ve guvenligi icin temel uyari isaretlerinin bilinmesinin gerekliligi ve onemi vurgulanir.",
          ],
        },
        {
          code: "9.1.4.2",
          subTopicName: "Kimya Uygulamalarinda Is Sagligi ve Guvenligi",
          description: "Kimyasal maddelerin insan sagligi ve cevre uzerindeki etkilerini aciklar.",
          details: [
            "a) Na, K, Fe, Ca, Mg, H2O maddelerinin insan sagligi ve cevre icin onemine deginilir.",
            "b) Hg, Pb, CO2, NO2, SO3, CO, Cl2 maddelerinin insan sagligi ve cevre uzerindeki zararli etkileri vurgulanir.",
          ],
        },
        {
          code: "9.1.4.3",
          subTopicName: "Kimya Uygulamalarinda Is Sagligi ve Guvenligi",
          description: "Kimya laboratuvarinda kullanilan bazi temel malzemeleri tanir.",
          details: [
            "Beherglas, erlenmayer, dereceli silindir (mezur), pipet, cam balon, balon joje, buret ve ayirma hunisi gibi laboratuvarda bulunan temel arac gerecler tanitilir.",
          ],
        },
      ],
    },

    // 9.2. ATOM VE PERIYODIK SISTEM
    {
      topicKey: "atom_periyodik_sistem",
      topicName: "Atom ve Periyodik Sistem",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 2,
      kazanimlar: [
        {
          code: "9.2.1.1",
          subTopicName: "Atom Modelleri",
          description: "Dalton, Thomson, Rutherford ve Bohr atom modellerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Bohr atom modeli, atomlarin sogurdugu/yaydigi isinlar ile iliskilendirilir. Hesaplamalara girilmeden sadece isin sogurma/yayma uzerinde durulur.",
            "b) Bohr atom modelinin sinirliliklari belirtilerek modern atom teorisinin (bulut modelinin) onemi vurgulanir. Orbital kavramina girilmez.",
            "c) Atom modellerinin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
        {
          code: "9.2.2.1",
          subTopicName: "Atomun Yapisi",
          description: "Elektron, proton ve notronun yuklerini, kutlelerini ve atomda bulunduklari yerleri karsilastirir.",
          isKeyKazanim: true,
          details: [
            "a) Elektron, proton, notron, atom numarasi, kutle numarasi, izotop, izoton, izobar ve izoelektronik kavramlari tanitilir.",
            "b) Elektron, proton ve notronun yuk ve kutlelerinin nasil bulundugu surecine ve izotop atomlarda ortalama atom kutlesi hesabina girilmez.",
          ],
        },
        {
          code: "9.2.3.1",
          subTopicName: "Periyodik Sistem",
          description: "Elementlerin periyodik sistemdeki yerlesim esaslarini aciklar.",
          details: [
            "a) Mendeleyev'in periyodik sistem uzerine yaptigi calismalar ve Moseley'in katkilari uzerinde durulur.",
            "b) Atomlarin katman-elektron dagilimlariyla periyodik sistemdeki yerleri arasindaki iliski aciklanir. Ilk 20 element esas olup diger elementlerin katman elektron dagilimlarina girilmez.",
          ],
        },
        {
          code: "9.2.3.2",
          subTopicName: "Periyodik Sistem",
          description: "Elementleri periyodik sistemdeki yerlerine gore siniflandirir.",
          details: [
            "Elementlerin siniflandirilmasi metal, ametal, yari metal ve asal (soy) gazlar olarak yapilir.",
          ],
        },
        {
          code: "9.2.3.3",
          subTopicName: "Periyodik Sistem",
          description: "Periyodik ozelliklerin degisme egilimlerini aciklar.",
          details: [
            "a) Periyodik ozelliklerden metalik-ametalik, atom yaricapi, iyonlasma enerjisi, elektron ilgisi ve elektronegatiflik kavramlari aciklanir; bunlarin nasil olculdugu konusuna girilmez.",
            "b) Kovalent, iyonik, metalik, van der Waals yaricap tanimlarina girilmez.",
            "c) Periyodik ozelliklerin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
      ],
    },

    // 9.3. KIMYASAL TURLER ARASI ETKILESIMLER
    {
      topicKey: "kimyasal_turler_arasi_etkilesimler",
      topicName: "Kimyasal Turler Arasi Etkilesimler",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 3,
      kazanimlar: [
        {
          code: "9.3.1.1",
          subTopicName: "Kimyasal Tur",
          description: "Kimyasal turleri aciklar.",
          details: [
            "Radikal kavramina girilmez.",
          ],
        },
        {
          code: "9.3.2.1",
          subTopicName: "Kimyasal Turler Arasi Etkilesimlerin Siniflandirilmasi",
          description: "Kimyasal turler arasindaki etkilesimleri siniflandirir.",
          isKeyKazanim: true,
          details: [
            "a) Baglanan turler arasi siniflandirma, atomlar arasi ve molekuller arasi seklinde yapilir; bu siniflandirmanin getirdigi gucluklere deginilir.",
            "b) Guclu etkilesimlere ornek olarak iyonik, kovalent ve metalik bag; zayif etkilesimlere ornek olarak da hidrojen bagi ve van der Waals kuvvetleri verilir.",
          ],
        },
        {
          code: "9.3.3.1",
          subTopicName: "Guclu Etkilesimler",
          description: "Iyonik bagin olusumunu iyonlar arasi etkilesimler ile iliskilendirir.",
          isKeyKazanim: true,
          details: [
            "a) Notr atomlarin ve tek atomlu iyonlarin Lewis sembolleri verilir. Ornekler periyodik sistemde ilk 20 element arasindan secilir.",
            "b) Iyonik bilesiklerin yapisal birimleri ile molekul kavraminin karistirilmamasina vurgu yapilir.",
            "c) Iyonik baglarin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
        {
          code: "9.3.3.2",
          subTopicName: "Guclu Etkilesimler",
          description: "Iyonik bagli bilesiklerin sistematik adlandirmasini yapar.",
          details: [
            "a) Tek atomlu ve cok atomlu iyonlarin (NH4+, OH-, NO3-, SO4 2-, CO3 2-, PO4 3-, CN-, CH3COO-) olusturdugu bilesiklerin adlandirilmasi yapilir.",
            "b) Degisken degerlikli metallerin (Cu, Fe, Hg, Sn, Pb) olusturdugu bilesiklerin adlandirilmasi yapilir.",
            "c) Hidrat bilesiklerinin adlandirilmasina girilmez.",
          ],
        },
        {
          code: "9.3.3.3",
          subTopicName: "Guclu Etkilesimler",
          description: "Kovalent bagin olusumunu atomlar arasi elektron ortaklasmasi temelinde aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kovalent baglar siniflandirilirken polar ve apolar kovalent baglar verilir; koordine kovalent baga girilmez.",
            "b) Basit molekullerin (H2, Cl2, O2, N2, HCl, H2O, BH3, NH3, CH4, CO2) Lewis elektron nokta formulleri uzerinden bagin ve molekullerin polarlik-apolarlik durumlari uzerinde durulur.",
            "c) Kovalent baglarin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
        {
          code: "9.3.3.4",
          subTopicName: "Guclu Etkilesimler",
          description: "Kovalent bagli bilesiklerin sistematik adlandirmasini yapar.",
          details: [
            "H2O, HCl, H2SO4, HNO3, NH3 bilesik orneklerinin sistematik adlari verilir.",
          ],
        },
        {
          code: "9.3.3.5",
          subTopicName: "Guclu Etkilesimler",
          description: "Metalik bagin olusumunu aciklar.",
          details: [
            "Metalik bagin aciklanmasinda elektron denizi modeli kullanilir.",
          ],
        },
        {
          code: "9.3.4.1",
          subTopicName: "Zayif Etkilesimler",
          description: "Zayif ve guclu etkilesimleri bag enerjisi esasina gore ayirt eder.",
          isKeyKazanim: true,
        },
        {
          code: "9.3.4.2",
          subTopicName: "Zayif Etkilesimler",
          description: "Kimyasal turler arasindaki zayif etkilesimleri siniflandirir.",
          details: [
            "a) Van der Waals kuvvetleri (dipol-dipol etkilesimleri, iyon-dipol etkilesimleri, dipol-induklenmis dipol etkilesimleri, iyon-induklenmis dipol etkilesimleri ve London kuvvetleri) aciklanir.",
            "b) Dipol-dipol etkilesimleri, iyon-dipol etkilesimleri ve London kuvvetlerinin genel etkilesme gucleri karsilastirilir.",
          ],
        },
        {
          code: "9.3.4.3",
          subTopicName: "Zayif Etkilesimler",
          description: "Hidrojen baglari ile maddelerin fiziksel ozellikleri arasinda iliski kurar.",
          details: [
            "a) Hidrojen baginin olusumu aciklanir.",
            "b) Uygun bilesik serilerinin kaynama noktasi degisimleri grafik uzerinde, hidrojen baglari ve diger etkilesimler kullanilarak aciklanir.",
            "c) Aziz Sancar'in DNA'nin onarimi ile ilgili calismalarina ve kisa biyografisine okuma parcasi olarak yer verilir.",
          ],
        },
        {
          code: "9.3.5.1",
          subTopicName: "Fiziksel ve Kimyasal Degisimler",
          description: "Fiziksel ve kimyasal degisimi, kopan ve olusan bag enerjilerinin buyuklugu temelinde ayirt eder.",
          details: [
            "Turler arasinda fiziksel ve kimyasal degisimlerin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
      ],
    },

    // 9.4. MADDENIN HALLERI
    {
      topicKey: "maddenin_halleri",
      topicName: "Maddenin Halleri",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 4,
      kazanimlar: [
        {
          code: "9.4.1.1",
          subTopicName: "Maddenin Fiziksel Halleri",
          description: "Maddenin farkli hallerde olmasinin canlilar ve cevre icin onemini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Suyun fiziksel hallerinin (kati, sivi, gaz) farkli islevler sagladigi vurgulanir.",
            "b) LPG (sivilastirilmis petrol gazi), deodorantlardaki itici gazlar, LNG (sivilastirilmis dogal gaz), sogutucularda kullanilan gazlarin davranislari uzerinden hal degisimlerinin onemi vurgulanir.",
            "c) Havadan azot ve oksijen eldesi uzerinde durulur.",
          ],
        },
        {
          code: "9.4.2.1",
          subTopicName: "Katilar",
          description: "Katilarin ozellikleri ile baglarin gucu arasinda iliski kurar.",
          details: [
            "Katilar siniflandirilarak gunluk hayatta sikca karsilasilan tuz, iyot, elmas ve cinko katilarinin taneciklerini bir arada tutan kuvvetler uzerinde durulur.",
          ],
        },
        {
          code: "9.4.3.1",
          subTopicName: "Sivilar",
          description: "Sivilarda viskozite kavramini aciklar.",
        },
        {
          code: "9.4.3.2",
          subTopicName: "Sivilar",
          description: "Sivilarda viskoziteyi etkileyen faktorleri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Viskozitenin molekuller arasi etkilesim ile iliskilendirilmesi saglanir.",
            "b) Farkli sivilarin viskoziteleri sicaklikla iliskilendirilir.",
            "c) Farkli sicakliklarda su, gliserin ve zeytinyaginin viskozite deneyleri yaptirilarak elde edilen sonuclarin karsilastirilmasi saglanir.",
          ],
        },
        {
          code: "9.4.3.3",
          subTopicName: "Sivilar",
          description: "Kapali kaplarda gerceklesen buharlaşma-yogusma surecleri uzerinden denge buhar basinci kavramini aciklar.",
          details: [
            "a) Kaynama olayi dis basinca bagli olarak aciklanir.",
            "b) Faz diyagramlarina girilmeden kaynama ile buharlasma olayinin birbirinden farkli oldugu belirtilir.",
          ],
        },
        {
          code: "9.4.3.4",
          subTopicName: "Sivilar",
          description: "Dogal olaylari aciklamada sivi ve ozellikleri ile ilgili kavramlari kullanir.",
          details: [
            "a) Atmosferdeki su buharinin varliginin nem kavramiyla ifade edildigi belirtilir.",
            "b) Meteoroloji haberlerinde verilen gercek ve hissedilen sicaklik kavramlarinin bagil nem kavramiyla ifade edildigi belirtilir. Bagil nem hesaplamalarina girilmez.",
          ],
        },
        {
          code: "9.4.4.1",
          subTopicName: "Gazlar",
          description: "Gazlarin genel ozelliklerini aciklar.",
          details: [
            "Gaz yasalari ve kinetik-molekuler teoriye girilmez.",
          ],
        },
        {
          code: "9.4.4.2",
          subTopicName: "Gazlar",
          description: "Gazlarin basinc, sicaklik, hacim ve miktar ozelliklerini birimleriyle ifade eder.",
          details: [
            "Basinc birimleri olarak (atm ve mmHg); hacim birimi olarak litre (L); sicaklik birimleri olarak Celcius (C) ve Kelvin (K); miktar birimi olarak da mol verilir. Birim donusumlerine ve hesaplamalara girilmez.",
          ],
        },
        {
          code: "9.4.4.3",
          subTopicName: "Gazlar",
          description: "Saf maddelerin hal degisim grafiklerini yorumlar.",
          details: [
            "a) Hal degisim grafikleri uzerinden erime-donma, buharlasma-yogusma ve kaynama surecleri incelenir.",
            "b) Gizli erime ve buharlasma isilariyla isinma-soguma sureclerine iliskin hesaplamalara girilmez.",
            "c) Saf suyun hal degisim deneyi yaptirilarak grafigin cizdirilmesi saglanir.",
          ],
        },
        {
          code: "9.4.5.1",
          subTopicName: "Plazma",
          description: "Plazma halini aciklar.",
          details: [
            "Sicak ve soguk plazma siniflandirmasina girilmez.",
          ],
        },
      ],
    },

    // 9.5. DOGA VE KIMYA
    {
      topicKey: "doga_ve_kimya",
      topicName: "Doga ve Kimya",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 5,
      kazanimlar: [
        {
          code: "9.5.1.1",
          subTopicName: "Su ve Hayat",
          description: "Suyun varliklar icin onemini aciklar.",
          isKeyKazanim: true,
          details: [
            "Su kaynaklarinin ve korunmasinin onemi aciklanir.",
          ],
        },
        {
          code: "9.5.1.2",
          subTopicName: "Su ve Hayat",
          description: "Su tasarrufuna ve su kaynaklarinin korunmasina yonelik cozum onerileri gelistirir.",
          details: [
            "Suyu tasarruflu kullanmanin her vatandasin ulkesine ve dunyaya karsi sorumlulugu/gorevi oldugu vurgulanir.",
          ],
        },
        {
          code: "9.5.1.3",
          subTopicName: "Su ve Hayat",
          description: "Suyun sertlik ve yumusaklik ozelliklerini aciklar.",
        },
        {
          code: "9.5.2.1",
          subTopicName: "Cevre Kimyasi",
          description: "Hava, su ve toprak kirliligine sebep olan kimyasal kirleticileri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Hava kirleticiler olarak azot oksitler, karbon dioksit ve kukurt oksitleri uzerinde durulur.",
            "b) Su ve toprak kirleticiler olarak plastikler, deterjanlar, organik sivilar, agir metaller, piller ve endustriyel atiklar uzerinde durulur.",
          ],
        },
        {
          code: "9.5.2.2",
          subTopicName: "Cevre Kimyasi",
          description: "Cevreye zarar veren kimyasal kirleticilerin etkilerinin azaltilmasi konusunda cozum onerilerinde bulunur.",
          details: [
            "a) Atmosferin, canlilar icin tasidigi hayati onem vurgulanarak tuketim maddelerini secerken ve kullanirken canlilara ve cevreye karsi duyarli olmanin gerekliligi vurgulanir.",
            "b) Ogrencilerin, kimyasal kirleticilerin cevreye zararlarinin azaltilmasi konusunda yapilan arastirmalar, calismalar ve sonuclari hakkinda bilisim teknolojilerini kullanarak bilgi toplamalari ve sinifta paylasmalari saglanir.",
            "c) Cevre temizligi konusunda farkindalik olusturmak amaciyla ogrencilerin grup arkadaslariyla birlikte kampanya veya etkinlik onerileri gelistirmeleri saglanir.",
          ],
        },
      ],
    },

    // 10.1. KIMYANIN TEMEL KANUNLARI VE KIMYASAL HESAPLAMALAR
    {
      topicKey: "kimyanin_temel_kanunlari",
      topicName: "Kimyanin Temel Kanunlari ve Kimyasal Hesaplamalar",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 6,
      kazanimlar: [
        {
          code: "10.1.1.1",
          subTopicName: "Kimyanin Temel Kanunlari",
          description: "Kimyanin temel kanunlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kutlenin korunumu, sabit oranlar ve katli oranlar kanunlari ile ilgili hesaplamalar yapilir.",
            "b) Demir(II) sulfur bilesiginin elde edilmesi deneyi yaptirilir.",
          ],
        },
        {
          code: "10.1.2.1",
          subTopicName: "Mol Kavrami",
          description: "Mol kavramini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Mol kavraminin tarihsel surec icerisindeki degisimi uzerinde durulur.",
            "b) Bagil atom kutlesi tanimlanir.",
            "c) Izotop kavrami ve bazi elementlerin mol kutlelerinin tam sayi cikmayisinin nedeni orneklerle aciklanir.",
            "d) Mol hesaplamalari yapilir.",
          ],
        },
        {
          code: "10.1.3.1",
          subTopicName: "Kimyasal Tepkimeler ve Denklemler",
          description: "Kimyasal tepkimeleri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kimyasal tepkime denklemlerinin denklestirilmesi saglanir. Redoks tepkimelerine girilmez.",
            "b) Yanma, sentez (olusум), analiz (ayrisma), asit-baz, cozunme-cokelme tepkimeleri orneklerle aciklanir.",
            "c) Kursun(II) iyodurun cokmesi deneyi yaptirilir.",
            "d) Kimyasal tepkimelerin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
        {
          code: "10.1.4.1",
          subTopicName: "Kimyasal Tepkimelerde Hesaplamalar",
          description: "Kutle, mol sayisi, molekul sayisi, atom sayisi ve gazlar icin normal sartlarda hacim kavramlarini birbirleriyle iliskilendirerek hesaplamalar yapar.",
          isKeyKazanim: true,
          details: [
            "a) Sinirlayici bilesen hesaplari uzerinde durulur.",
            "b) Tepkime denklemleri temelinde % verim hesaplari yapilir.",
          ],
        },
      ],
    },

    // 10.2. KARISIMLAR
    {
      topicKey: "karisimlar",
      topicName: "Karisimlar",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 7,
      kazanimlar: [
        {
          code: "10.2.1.1",
          subTopicName: "Homojen ve Heterojen Karisimlar",
          description: "Karisimlari niteliklerine gore siniflandirir.",
          isKeyKazanim: true,
          details: [
            "a) Homojen ve heterojen karisimlarin ayirt edilmesinde belirleyici olan ozellikler aciklanir.",
            "b) Homojen karisimlarin cozelti olarak adlandirildigini vurgulanir ve gunluk hayattan cozelti ornekleri verilir.",
            "c) Heterojen karisimlar, dagilan maddenin ve dagilma ortaminin fiziksel haline gore siniflandirilir.",
            "d) Karisimlar cozunenin ve/veya dagilanlarin tanecik boyutu esas alinarak siniflandirilir.",
          ],
        },
        {
          code: "10.2.1.2",
          subTopicName: "Homojen ve Heterojen Karisimlar",
          description: "Cozunme surecini molekuler duzeyde aciklar.",
          details: [
            "a) Tanecikler arasi etkilesimlerden faydalanilarak cozunme aciklanir.",
            "b) Cozunme ile polarlik, hidrojen bagi ve cozucu-cozunen benzerligi iliskilendirilir.",
            "c) Farkli maddelerin (sodyum klorur, etil alkol, karbon tetraklorur) suda cozunme deneyleri yaptirilir.",
            "d) Farkli fiziksel haldeki maddelerin suda cozunme sureclerinin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
        {
          code: "10.2.1.3",
          subTopicName: "Homojen ve Heterojen Karisimlar",
          description: "Cozunmus madde oranini belirten ifadeleri yorumlar.",
          isKeyKazanim: true,
          details: [
            "a) Cozunen madde oraninin yuksek (derisik) ve dusuk (seyreltik) oldugu cozeltilere ornekler verilir.",
            "b) Kutlece yuzde, hacimce yuzde ve ppm derisimleri tanitilir; ppm ile ilgili hesaplamalara girilmez.",
            "c) Yaygin sulu cozeltilerde (cesme suyu, deniz suyu, serum, kolonya, sekerli su) cozunenin kutlece ve/veya hacimce yuzde derisimlerine ornekler verilir.",
            "d) Kutlece yuzde ve hacimce yuzde derisimleri farkli cozeltiler hazirlatilir.",
            "e) Gunluk tuketim maddelerinin etiketlerindeki derisime iliskin verilere dikkat cekilir.",
          ],
        },
        {
          code: "10.2.1.4",
          subTopicName: "Homojen ve Heterojen Karisimlar",
          description: "Cozeltilerin ozelliklerini gunluk hayattan orneklerle aciklar.",
          details: [
            "a) Cozeltilerin donma ve kaynama noktasinin cozuculerinkinden farkli oldugu ve derisime bagli olarak degisimi aciklanir. Hesaplamalara girilmez.",
            "b) Karayollarinda ve tasitlarda buzlanmaya karsi alinan onlemlere deginilir.",
          ],
        },
        {
          code: "10.2.2.1",
          subTopicName: "Ayirma ve Saflastirma Teknikleri",
          description: "Endustri ve saglik alanlarinda kullanilan karisim ayirma tekniklerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Miknatis ile ayirma bunun yani sira tanecik boyutu (eleme, suzme, diyaliz), yogunluk (ayirma hunisi, yuzdurme), erime noktasi, kaynama noktasi (basit damitma, ayrimsal damitma) ve cozunurluk (ozutleme, kristallendirme, ayrimsal kristallendirme) farkindan yararlanilarak uygulanan ayirma teknikleri uzerinde durulur.",
            "b) Karisimlari ayirma deneyleri yaptirilir.",
          ],
        },
      ],
    },

    // 10.3. ASITLER, BAZLAR VE TUZLAR
    {
      topicKey: "asitler_bazlar_tuzlar",
      topicName: "Asitler, Bazlar ve Tuzlar",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 8,
      kazanimlar: [
        {
          code: "10.3.1.1",
          subTopicName: "Asitler ve Bazlar",
          description: "Asitleri ve bazlari bilinen ozellikleri yardimiyla ayirt eder.",
          isKeyKazanim: true,
          details: [
            "a) Limon suyu, sirke gibi maddelerin eksilik ve asindirma ozellikleri, asitlikleriyle iliskilendirilir.",
            "b) Kirecin, sabunun ve deterjanlarin ciltte olusturdugu kayganlik hissi bazlikle iliskilendirilir.",
            "c) Asitler ve bazlarin bazi renkli maddelerin (cay, uzum suyu, kirmizi lahana) rengini degistirmesi deneyleri yapilarak indikator kavrami ve pH kagidi tanitilir.",
            "d) Sirke, limon suyu, camasir suyu, sodyum hidroksit, hidroklorik asit ve sodyum klorur cozeltilerinin asitlik veya bazlik degerlerinin pH kagidi kullanilarak yorumlanmasi saglanir.",
            "e) pH kavrami asitlik ve bazlik ile iliskilendirilerek aciklanir. Logaritmik tanima girilmez.",
            "f) Gunluk hayatta kullanilan tuketim maddelerinin ambalajlarinda yer alan pH degerlerinin asitlik-bazlikla iliskilendirilmesi saglanir.",
          ],
        },
        {
          code: "10.3.1.2",
          subTopicName: "Asitler ve Bazlar",
          description: "Maddelerin asitlik ve bazlik ozelliklerini molekuler duzeyde aciklar.",
          details: [
            "a) Asitler su ortaminda H3O+ iyonu olusturma, bazlar ise OH- iyonu olusturma ozellikleriyle tanitilarak basit ornekler verilir.",
            "b) Su ile etkileserek asit/baz olusturan CO2, SO2 ve N2O5 maddelerinin cozeltilerinin neden asit gibi davrandigi; NH3 ve CaO maddelerinin cozeltilerinin de neden baz gibi davrandigi bu tepkimeler uzerinden aciklanir. Lewis asit-baz tanimina girilmez.",
          ],
        },
        {
          code: "10.3.2.1",
          subTopicName: "Asitlerin ve Bazlarin Tepkimeleri",
          description: "Asitler ve bazlar arasindaki tepkimeleri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Notralesme tepkimeleri, asidin ve bazin mol sayilari uzerinden aciklanir.",
            "b) Sodyum hidroksit ile sulfurik asidin etkilesiminden sodyum sulfat olusumu deneyi yaptirilarak asit, baz ve tuz kavramlari iliskilendirilir.",
          ],
        },
        {
          code: "10.3.2.2",
          subTopicName: "Asitlerin ve Bazlarin Tepkimeleri",
          description: "Asitlerin ve bazlarin gunluk hayat acisindan onemli tepkimelerini aciklar.",
          details: [
            "a) Asitlerin ve bazlarin metallerle etkilesеrek hidrojen gazi olusturmasi reaksiyonlarina ornekler verilir; aktif metal, yari soy metal, soy metal ve amfoter metal kavramlari uzerinde durulur.",
            "b) Aluminyum metalinin amfoterlik ozelligini gosteren deney yaptirilir.",
            "c) Nitrik asit, sulfurik asit ve hidroflorik asidin soy metal ve cam/porselen asindirma ozelliklerine deginilir. Tepkime denklemlerine girilmez.",
            "d) Derisik sulfurik asit, fosforik asit ve asetik asidin nem cekme ve cozunurken isi aciga cikarma ozellikleri nedeniyle yol actiklari tehlikeler vurgulanir.",
          ],
        },
        {
          code: "10.3.3.1",
          subTopicName: "Hayatimizda Asitler ve Bazlar",
          description: "Asitlerin ve bazlarin fayda ve zararlarini aciklar.",
          details: [
            "a) Asit yagmurlarinin olusumuna, cevreye ve tarihi eserlere etkilerine deginilir.",
            "b) Kirecin ve kostigin yag, sac ve deriye etkisi deney yapilarak aciklanir.",
            "c) Ogrencilerin asit ve bazlarin fayda ve zararlari hakkinda bilisim teknolojileri kullanarak arastirma yapmalari saglanir.",
          ],
        },
        {
          code: "10.3.3.2",
          subTopicName: "Hayatimizda Asitler ve Bazlar",
          description: "Asit ve bazlarla calisirken alinmasi gereken saglik ve guvenlik onlemlerini aciklar.",
          details: [
            "a) Birbiriyle karistirilmasi sakincali evsel kimyasallara (camasir suyu ile tuz ruhu) ornekler verilir.",
            "b) Asit ve baz ambalajlarindaki guvenlik uyarilarina dikkat cekilir.",
            "c) Asiri temizlik malzemesi ve lavabo acici kullanmanin saglik, cevre ve tesisat acisindan sakincalari uzerinde durulur.",
            "d) Mutfak gereclerinde olusan kireclenmeyi ve metal esyalarin paslarini gidermek icin yontem ve malzeme seciminde dikkat edilmesi gereken hususlar uzerinde durulur.",
          ],
        },
        {
          code: "10.3.4.1",
          subTopicName: "Tuzlar",
          description: "Tuzlarin ozelliklerini ve kullanim alanlarini aciklar.",
          details: [
            "Sodyum klorur, sodyum karbonat, sodyum bikarbonat, kalsiyum karbonat ve amonyum klorur tuzlari uzerinde durulur.",
          ],
        },
      ],
    },

    // 10.4. KIMYA HER YERDE
    {
      topicKey: "kimya_her_yerde",
      topicName: "Kimya Her Yerde",
      examType: "TYT",
      subjectName: "Kimya",
      sortOrder: 9,
      kazanimlar: [
        {
          code: "10.4.1.1",
          subTopicName: "Yaygin Gunluk Hayat Kimyasallari",
          description: "Temizlik maddelerinin ozelliklerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Yapisal ayrintilara girmeden sabun ve deterjan aktif maddelerinin kirleri nasil temizledigi belirtilir.",
            "b) Kisisel temizlikte kullanilan temizlik maddelerinin (sampuan, dis macunu, kati sabun, sivi sabun) fayda ve zararlari vurgulanir.",
            "c) Hijyen amaciyla kullanilan temizlik maddeleri (camasir suyu, kirec kaymagi) tanitilir.",
          ],
        },
        {
          code: "10.4.1.2",
          subTopicName: "Yaygin Gunluk Hayat Kimyasallari",
          description: "Yaygin polimerlerin kullanim alanlarina ornekler verir.",
          details: [
            "a) Polimerlsme olayi aciklanarak -mer, monomer ve polimer kavramlari uzerinde durulur.",
            "b) Kaucuk, polietilen (PE), polietilen teraftalat (PET), kevlar, polivinil klorur (PVC), politetraflor eten (TEFLON) ve polistirenin (PS) yapisal ayrintilarina girilmeden baslica kullanim alanlarina deginilir.",
            "c) Polimerlerin farkli alanlarda kullanimlarinna iliskin olumlu ve olumsuz ozellikleri vurgulanir.",
            "d) Icerisinde polimer malzeme kullanilan oyuncak ve tekstil urunlerinin zararlarina deginilir.",
          ],
        },
        {
          code: "10.4.1.3",
          subTopicName: "Yaygin Gunluk Hayat Kimyasallari",
          description: "Polimer, kagit, cam ve metal malzemelerin geri donusumunun ulke ekonomisine katkisini aciklar.",
        },
        {
          code: "10.4.1.4",
          subTopicName: "Yaygin Gunluk Hayat Kimyasallari",
          description: "Kozmetik malzemelerin icerebilecegi zararli kimyasallari aciklar.",
          details: [
            "Kisisel bakim ve estetik amaciyla kullanilan parfum, sac boyasi, kalici dovme boyasi ve jole uzerinde durulur.",
          ],
        },
        {
          code: "10.4.1.5",
          subTopicName: "Yaygin Gunluk Hayat Kimyasallari",
          description: "Ilaclarin farkli formlarda kullanilmasinin nedenlerini aciklar.",
          details: [
            "a) Piyasadaki ilac formlarinin (hap, surup, igne, merhem) temel ozelliklerine deginilir.",
            "b) Yanlis ve gereksiz ilac kullaniminin insan sagligina, ulke ekonomisine ve cevreye verdigi zararlar vurgulanir.",
          ],
        },
        {
          code: "10.4.2.1",
          subTopicName: "Gidalar",
          description: "Hazir gidalari secerken ve tuketirken dikkat edilmesi gereken hususlari aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Hazir gidalarin dogal gidalardan baslica farklarina (koruyucular, renklendiriciler, emulsiyonlastiricilar, tatlandiricilar, pastorizasyon, UHT sutun islenmesi) deginilir.",
            "b) Hazir gida etiketlerindeki uretim ve son kullanim tarihlerinin onemi vurgulanir.",
            "c) Koruyucular, renklendiriciler ve yapay tatlandiricilarin kullanimasinin saglik uzerindeki etkilerine deginilir.",
            "d) Gunluk tuketim maddelerindeki katki maddesi icerigi ve katki maddesi kodlarina iliskin okuma parcasi verilir.",
          ],
        },
        {
          code: "10.4.2.2",
          subTopicName: "Gidalar",
          description: "Yenilebilir yag turlerini siniflandirir.",
          details: [
            "a) Yag turlerinden kati (tereyagi, margarin) ve sivi (zeytin yagi, aycicek yagi, misir ozu yagi, findik yagi) yaglara deginilir.",
            "b) Yag endustrisinde kullanilan sizma, rafine, riviera ve vinterize kavramlari aciklanir.",
            "c) Yenilebilir yaglarin yanlis kullaniminin saglik uzerindeki etkileri vurgulanir.",
          ],
        },
      ],
    },

    // ============================================================
    //  KIMYA — AYT (11-12. sinif)
    // ============================================================

    // 11.1. MODERN ATOM TEORISI
    {
      topicKey: "modern_atom_teorisi",
      topicName: "Modern Atom Teorisi",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 1,
      kazanimlar: [
        {
          code: "11.1.1.1",
          subTopicName: "Atomun Kuantum Modeli",
          description: "Atomu kuantum modeliyle aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Bohr atom modelinin deney ve gozlemlerden elde edilen bulgulari aciklamadaki sinirliliklari vurgulanarak modern atom teorisinin (bulut modelinin) onemi uzerinde durulur.",
            "b) Tek elektronlu atomlar/iyonlar icin orbital kavrami elektronlarin bulunma olasiligi ile iliskilendirilir.",
            "c) Yorunge ve orbital kavramlari karsilastirilir.",
            "d) Kuantum sayilari orbitallerle iliskilendirilir.",
            "e) Cok elektronlu atomlarda orbitallerin enerji seviyeleri aciklanir.",
          ],
        },
        {
          code: "11.1.2.1",
          subTopicName: "Periyodik Sistem ve Elektron Dizilimleri",
          description: "Notr atomlarin elektron dizilimleriyle periyodik sistemdeki yerleri arasinda iliski kurar.",
          isKeyKazanim: true,
          details: [
            "a) Hund Kurali, Pauli Ilkesi ve Aufbau Prensibi aciklanir.",
            "b) Atomlarin ve iyonlarin elektron dizilimlerine ornekler verilir. Atom numarasi 36 ve daha kucuk turlerin elektron dizilimleri esas alinir.",
            "c) Degerlik orbital ve degerlik elektronu kavramlari aciklanir.",
            "d) Elektron dizilimleriyle elementin ait oldugu blok iliskilendirilerek grup ve periyot belirlenir.",
          ],
        },
        {
          code: "11.1.3.1",
          subTopicName: "Periyodik Ozellikler",
          description: "Periyodik ozelliklerdeki degisim egilimlerini sebepleriyle aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Kovalent yaricap, van der Waals yaricapi ve iyonik yaricapin farklari uzerinde durulur.",
            "b) Periyodik ozellikler arasinda metallik/ametallik, atom/iyon yaricapi, iyonlasma enerjisi, elektron ilgisi, elektronegatiflik ve oksit/hidroksit bilesiklerinin asitlik/bazlik egilimleri uzerinde durulur. Periyodik ozelliklerin nasil olculdugune girilmez.",
            "c) Ardisik iyonlasma enerjilerinin grup numarasiyla iliskisi orneklerle gosterilir.",
          ],
        },
        {
          code: "11.1.4.1",
          subTopicName: "Elementleri Taniyalim",
          description: "Elementlerin periyodik sistemdeki konumu ile ozellikleri arasindaki iliskileri aciklar.",
          details: [
            "a) s, p, d bloku elementlerinin metal/ametal karakteri, iyon yukleri, aktiflikleri ve yaptiklari kimyasal bag tipi elektron dizilimiyle iliskilendirilir.",
            "b) f blok elementlerinin periyodik sistemdeki konumlariyla ilgili ozel durumlar vurgulanir.",
            "c) Asal gaz ozellikleri elektron dizilimleriyle iliskilendirilir.",
          ],
        },
        {
          code: "11.1.5.1",
          subTopicName: "Yukseltgenme Basamaklari",
          description: "Yukseltgenme basamaklari ile elektron dizilimleri arasindaki iliskiyi aciklar.",
          details: [
            "a) Ametallerin anyon halindeki yukleriyle yukseltgenme basamaklari arasindaki fark orneklendirilir.",
            "b) d bloku elementlerinin birden cok yukseltgenme basamaginda bulunabilmeleri, elektron dizilimleriyle iliskilendirilir.",
          ],
        },
      ],
    },

    // 11.2. GAZLAR
    {
      topicKey: "gazlar",
      topicName: "Gazlar",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 2,
      kazanimlar: [
        {
          code: "11.2.1.1",
          subTopicName: "Gazlarin Ozellikleri ve Gaz Yasalari",
          description: "Gazlarin betimlenmesinde kullanilan ozellikleri aciklar.",
          details: [
            "a) Basinc birimleri (atm, Torr, mmHg) ve hacim birimleri (L, m3) ile bunlarin ondalik ast ve ust katlari kisaca aciklanir.",
            "b) Gazlarin ozelliklerinin olcme yontemleri uzerinde durulur. Manometrelerle ilgili hesaplamalara girilmez.",
          ],
        },
        {
          code: "11.2.1.2",
          subTopicName: "Gazlarin Ozellikleri ve Gaz Yasalari",
          description: "Gaz yasalarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Gazlarin ozelliklerine iliskin yasalar (Boyle, Charles, Gay Lussac ve Avogadro) uzerinde durulur.",
            "b) Ogrencilerin hazir veriler kullanilarak gaz yasalari ile ilgili grafikler cizmeleri ve yorumlamalari saglanir.",
          ],
        },
        {
          code: "11.2.2.1",
          subTopicName: "Ideal Gaz Yasasi",
          description: "Deneysel yoldan turetilmis gaz yasalari ile ideal gaz yasasi arasindaki iliskiyi aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Boyle, Charles ve Avogadro yasalarindan yola cikilarak ideal gaz denklemi turetilir.",
            "b) Ideal gaz denklemi kullanilarak ornek hesaplamalar yapilir.",
            "c) Normal sartlarda gaz hacimleri kutle ve mol sayisiyla iliskilendirilir.",
          ],
        },
        {
          code: "11.2.3.1",
          subTopicName: "Gazlarda Kinetik Teori",
          description: "Gaz davranislarini kinetik teori ile aciklar.",
          details: [
            "a) Kinetik teorinin temel varsayimlari uzerinde durulur.",
            "b) Kinetik teorinin temel varsayimlari kullanilarak Graham Difuzyon ve Efuzyon Yasasi turetilir.",
            "c) Difuzyon deneyi yaptirilir; bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilarak da aciklanir.",
          ],
        },
        {
          code: "11.2.4.1",
          subTopicName: "Gaz Karisimlari",
          description: "Gaz karisimlarinin kismi basinclarini gunluk hayattan orneklerle aciklar.",
          isKeyKazanim: true,
          details: [
            "Sivilarin doygun buhar basinclari kismi basinc kavramiyla iliskilendirilerek su uzerinde toplanan gazlarla ilgili hesaplamalar yapilir.",
          ],
        },
        {
          code: "11.2.5.1",
          subTopicName: "Gercek Gazlar",
          description: "Gazlarin sikisma/genlesme surecinde gercek gaz ve ideal gaz kavramlarini karsilastirir.",
          details: [
            "a) Gercek gazlarin hangi durumlarda ideallikten saptigi belirtilir.",
            "b) Karbon dioksitin ve suyun faz diyagrami aciklanarak buhar ve gaz kavramlari arasindaki fark vurgulanir.",
            "c) Suyun farkli kristal yapilarini gosteren faz diyagramlarina girilmez.",
            "d) Gunluk hayatta yaygin kullanilan ve gercek gazlarin hal degisimlerinin uygulamalari olan sogutma sistemleri (Joule-Thomson olayi) ornekleriyle aciklanir.",
          ],
        },
      ],
    },

    // 11.3. SIVI COZELTILER VE COZUNURLUK
    {
      topicKey: "sivi_cozeltiler",
      topicName: "Sivi Cozeltiler ve Cozunurluk",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 3,
      kazanimlar: [
        {
          code: "11.3.1.1",
          subTopicName: "Cozucu Cozunen Etkilesimleri",
          description: "Kimyasal turler arasi etkilesimleri kullanarak sivi ortamda cozunme olayini aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "11.3.2.1",
          subTopicName: "Derisim Birimleri",
          description: "Cozunen madde miktari ile farkli derisim birimlerini iliskilendirir.",
          isKeyKazanim: true,
          details: [
            "a) Derisim birimleri olarak molarite ve molalite tanitilir.",
            "b) Normalite ve formalite tanimlarina girilmez.",
          ],
        },
        {
          code: "11.3.2.2",
          subTopicName: "Derisim Birimleri",
          description: "Farkli derisimlerde cozeltiler hazirlar.",
          details: [
            "Derisimle ilgili hesaplamalar yapilarak hesaplamalarda molarite ve molalite yaninda kutlece yuzde, hacimce yuzde, mol kesri ve ppm kavramlari da kullanilir.",
          ],
        },
        {
          code: "11.3.3.1",
          subTopicName: "Koligatif Ozellikler",
          description: "Cozeltilerin koligatif ozellikleri ile derisimleri arasinda iliski kurar.",
          isKeyKazanim: true,
          details: [
            "a) Koligatif ozelliklerden buhar basinci alcalmasi, donma noktasi alcalmasi (kriyoskopi), kaynama noktasi yukselmesi (ebulyoskopi) ve osmotik basinc uzerinde durulur.",
            "b) Osmotik basinc ile ilgili hesaplamalara girilmez.",
            "c) Ters osmoz yontemiyle su aritimi hakkinda kisaca bilgi verilir.",
            "d) Saf suyun ve farkli derisimlerdeki sulu cozeltilerin kaynama noktasi tayini deneyleri yaptirilir.",
          ],
        },
        {
          code: "11.3.4.1",
          subTopicName: "Cozunurluk",
          description: "Cozeltileri cozunurluk kavrami temelinde siniflandirir.",
          isKeyKazanim: true,
          details: [
            "a) Seyreltik, derisik, doygun, asiri doygun ve doymamis cozelti kavramlari uzerinde durulur.",
            "b) Cozunurlukler g/100 g su birimi cinsinden verilir.",
            "c) Cozunurlukle ilgili hesaplamalar yapilir.",
          ],
        },
        {
          code: "11.3.5.1",
          subTopicName: "Cozunurluge Etki Eden Faktorler",
          description: "Cozunurlugun sicaklik ve basincla iliskisini aciklar.",
          details: [
            "a) Farkli tuzlarin sicakliga bagli cozunurluk egrilerinin yorumlanmasi saglanir.",
            "b) Tuzlarin farkli sicakliklardaki cozunurluкlerinden faydalanilarak deristirme ve kristallendirme ile ilgili hesaplamalar yapilir.",
            "c) Gazlarin cozunurluкlerinin basinc ve sicaklikla degisimi uzerinde durulur; cozunurluk egrilerinin yorumlanmasi saglanir.",
            "d) Ogrencilerin cozunurlugun sicaklik ve basincla iliskisini elektronik tablolama programi kullanarak kurgulamalari saglanir.",
          ],
        },
      ],
    },

    // 11.4. KIMYASAL TEPKIMELERDE ENERJI
    {
      topicKey: "kimyasal_tepkimelerde_enerji",
      topicName: "Kimyasal Tepkimelerde Enerji",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 4,
      kazanimlar: [
        {
          code: "11.4.1.1",
          subTopicName: "Tepkimelerde Isi Degisimi",
          description: "Tepkimelerde meydana gelen enerji degisimlerini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Tepkimelerin ekzotermik ve endotermik olmasi isi alisvеrisiyle iliskilendirilir.",
            "b) Ekzotermik ve endotermik tepkimelerin aciklanmasinda bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilir.",
          ],
        },
        {
          code: "11.4.2.1",
          subTopicName: "Olusум Entalpisi",
          description: "Standart olusum entalpileri uzerinden tepkime entalpilerini hesaplar.",
          isKeyKazanim: true,
          details: [
            "a) Standart olusum entalpileri tanimlanir.",
            "b) Tepkime entalpisi potansiyel enerji-tepkime koordinati grafigi uzerinden aciklanir.",
            "c) Ogrencilerin tepkime entalpilerine iliskin elektronik tablolama programi kullanarak grafik olusturmalari saglanir.",
          ],
        },
        {
          code: "11.4.3.1",
          subTopicName: "Bag Enerjileri",
          description: "Bag enerjileri ile tepkime entalpisi arasindaki iliskiyi aciklar.",
          details: [
            "Olusan ve kirilan bag enerjileri uzerinden tepkime entalpisi hesaplamalari yapilir.",
          ],
        },
        {
          code: "11.4.4.1",
          subTopicName: "Tepkime Isilarinin Toplanabilirligi",
          description: "Hess Yasasini aciklar.",
          isKeyKazanim: true,
          details: [
            "Hess Yasasi ile ilgili hesaplamalar yapilir.",
          ],
        },
      ],
    },

    // 11.5. KIMYASAL TEPKIMELERDE HIZ
    {
      topicKey: "kimyasal_tepkimelerde_hiz",
      topicName: "Kimyasal Tepkimelerde Hiz",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 5,
      kazanimlar: [
        {
          code: "11.5.1.1",
          subTopicName: "Tepkime Hizlari",
          description: "Kimyasal tepkimeler ile tanecik carpismalarini arasindaki iliskiyi aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "11.5.1.2",
          subTopicName: "Tepkime Hizlari",
          description: "Kimyasal tepkimelerin hizlarini aciklar.",
          details: [
            "a) Madde miktari (derisim, mol, kutle, gaz maddeler icin normal sartlarda hacim) ile tepkime hizi iliskilendirilir.",
            "b) Ortalama tepkime hizi kavrami aciklanir.",
            "c) Homojen ve heterojen faz tepkimelerine ornekler verilir.",
          ],
        },
        {
          code: "11.5.2.1",
          subTopicName: "Tepkime Hizini Etkileyen Faktorler",
          description: "Tepkime hizina etki eden faktorleri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Tek basamakli tepkimelerde, her iki yondeki tepkime hizinin derisime bagli ifadeleri verilir.",
            "b) Cok basamakli tepkimeler icin hiz belirleyici basamagin uzerinde durulur.",
            "c) Madde cinsi, derisim, sicaklik, katalizor (enzimlere girilmez) ve temas yuzeyinin tepkime hizina etkisi uzerinde durulur. Arrhenius bagintisina girilmez.",
            "d) Oktay Sinanoglu'nun kisa biyografisini ve tepkime mekanizmalari uzerine yaptigi calismalari tanitan okuma parcasina yer verilir.",
          ],
        },
      ],
    },

    // 11.6. KIMYASAL TEPKIMELERDE DENGE
    {
      topicKey: "kimyasal_tepkimelerde_denge",
      topicName: "Kimyasal Tepkimelerde Denge",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 6,
      kazanimlar: [
        {
          code: "11.6.1.1",
          subTopicName: "Kimyasal Denge",
          description: "Fiziksel ve kimyasal degisimlerde dengeyi aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Maksimum duzensizlik ve minimum enerji egilimleri uzerinden denge aciklanir.",
            "b) Ileri ve geri tepkime hizlari uzerinden denge aciklanir.",
            "c) Tersinir reaksiyonlar icin derisim ve basinc cinsinden denge ifadeleri turetilerek hesaplamalar yapilir.",
            "d) Farkli denge sabitleri arasindaki iliski incelenir.",
          ],
        },
        {
          code: "11.6.2.1",
          subTopicName: "Dengeyi Etkileyen Faktorler",
          description: "Dengeyi etkileyen faktorleri aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Sicakligin, derisimin, hacmin, kismi basinclarin ve toplam basincin dengeye etkisi denge ifadesi uzerinden aciklanir.",
            "b) Le Chatelier Ilkesi ornekler uzerinden irdelenir.",
            "c) Katalizor-denge iliskisi vurgulanir.",
          ],
        },
        {
          code: "11.6.3.1",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "pH ve pOH kavramlarini suyun oto-iyonizasyonu uzerinden aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "11.6.3.2",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Bronsted-Lowry asitlerini/bazlarini karsilastirir.",
          isKeyKazanim: true,
        },
        {
          code: "11.6.3.3",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Katyonlarin asitligini ve anyonlarin bazligini su ile etkilesimleri temelinde aciklar.",
          details: [
            "a) Kuvvetli/zayif asitler ve bazlar tanitilir; konjuge asit-baz ciftlerine ornekler verilir.",
            "b) Asit gibi davranan katyonlarin ve baz gibi davranan anyonlarin su ile etkilesimleri uzerinde durulur.",
          ],
        },
        {
          code: "11.6.3.4",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Asitlik/bazlik gucu ile ayrisma denge sabitleri arasinda iliski kurar.",
          details: [
            "Asitlerin/bazlarin iyonlasma oranlarinin denge sabitlrriyle iliskilendirilmesi saglanir.",
          ],
        },
        {
          code: "11.6.3.5",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Kuvvetli ve zayif monoprotik asit/baz cozeltilerinin pH degerlerini hesaplar.",
          isKeyKazanim: true,
          details: [
            "a) Cok derisik ve cok seyreltik asit/baz cozeltilerinin pH degerlerine girilmez.",
            "b) Zayif asitler/bazlar icin [H+] = (Ka.Ca)^1/2 ve [OH-] = (Kb.Cb)^1/2 esitlikleri esas alinir.",
            "c) Poliprotik asitlere girilmez.",
          ],
        },
        {
          code: "11.6.3.6",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Tampon cozeltilerin ozellikleri ile gunluk kullanim alanlarini iliskilendirir.",
          details: [
            "a) Tampon cozeltilerin pH degerlerinin seyrelme ve asit/baz ilavesi ile fazla degismemesi ortamdaki dengeler uzerinden aciklanir. Henderson formulu ve tampon kapasitesine girilmez.",
            "b) Tampon cozeltilerin canli organizmalar acisindan onemine deginilir.",
          ],
        },
        {
          code: "11.6.3.7",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Tuz cozeltilerinin asitlik/bazlik ozelliklerini aciklar.",
          details: [
            "a) Asidik, bazik ve notr tuz kavramlari aciklanir.",
            "b) Anyonu zayif baz olan tuzlara ornekler verilir.",
            "c) Katyonu NH4+ veya anyonu HSO4- olan tuzlarin asitligi uzerinde durulur.",
            "d) Hidroliz hesaplamalarina girilmez.",
          ],
        },
        {
          code: "11.6.3.8",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Kuvvetli asit/baz derisimlerini titrasyon yontemiyle belirler.",
          isKeyKazanim: true,
          details: [
            "a) Titrasyon deneyi yaptirilip sonuclarin grafik uzerinden gosterilerek yorumlanmasi saglanir.",
            "b) Titrasyonla ilgili hesaplama ornekleri verilir.",
            "c) Ogrencilerin titrasyon yontemine yonelik hesaplamalari elektronik tablolama programi yardimiyla kurgulamalari saglanir.",
          ],
        },
        {
          code: "11.6.3.9",
          subTopicName: "Sulu Cozelti Dengeleri",
          description: "Sulu ortamlarda cozunme-cokelme dengelerini aciklar.",
          details: [
            "a) Cozunme-cokelme denge orneklerine yer verilir; cozunurluk carpimi (Kcc) ve cozunurluk (s) kavramlari iliskilendirilir.",
            "b) Tuzlarin cozunurlugune etki eden faktorlerden sicaklik ve ortak iyon etkisi uzerinde durulur.",
            "c) Ortak iyon etkisi hesaplamalari yapilir.",
          ],
        },
      ],
    },

    // 12.1. KIMYA VE ELEKTRIK
    {
      topicKey: "kimya_ve_elektrik",
      topicName: "Kimya ve Elektrik",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 7,
      kazanimlar: [
        {
          code: "12.1.1.1",
          subTopicName: "Indirgenme-Yukseltgenme Tepkimelerinde Elektrik Akimi",
          description: "Redoks tepkimelerini tanir.",
          isKeyKazanim: true,
          details: [
            "a) Yukseltgenme ve indirgenme kavramlari uzerinde durulur.",
            "b) Redoks tepkimeleri denklestirilеrek yaygin yukseltgenler (O2, KMnO4, H2SO4, HNO3, H2O2) ve indirgenler (H2, SO2) tanitilir.",
            "c) Iyonik redoks tepkimelerinin denklestirilmesine girilmez.",
          ],
        },
        {
          code: "12.1.1.2",
          subTopicName: "Indirgenme-Yukseltgenme Tepkimelerinde Elektrik Akimi",
          description: "Redoks tepkimeleriyle elektrik enerjisi arasindaki iliskiyi aciklar.",
          details: [
            "a) Indirgen-yukseltgen arasindaki elektron alisverisinin dogrudan temas disinda bir yolla mumkun olup olmayacaginin uzerinde durulur.",
            "b) Elektrik enerjisi ile redoks tepkimesinin istemlilik/istemsizlik durumu iliskilendirilir.",
          ],
        },
        {
          code: "12.1.2.1",
          subTopicName: "Elektrotlar ve Elektrokimyasal Hucreler",
          description: "Elektrot ve elektrokimyasal hucre kavramlarini aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Katot ve anot kavramlari, indirgenme-yukseltgenme ile iliskilendirilerek ele alinir.",
            "b) Elektrot, yari-hucre ve hucre kavramlari uzerinde durulur.",
            "c) Inert elektrotlarin hangi durumlarda gerekli oldugu belirtilir.",
            "d) Pillerde tuz koprusunun islevi aciklanir.",
            "e) Zn/Cu elektrokimyasal pili deneyi yaptirilir; bilisim teknolojilerinden (animasyon, simulasyon, video vb.) yararlanilarak da aciklanir.",
          ],
        },
        {
          code: "12.1.3.1",
          subTopicName: "Elektrot Potansiyelleri",
          description: "Redoks tepkimelerinin istemliligini standart elektrot potansiyellerini kullanarak aciklar.",
          isKeyKazanim: true,
          details: [
            "a) Standart yari hucre indirgenme potansiyelleri, standart hidrojen yari hucresi ile iliskilendirilir.",
            "b) Metallerin aktiflik sirasi uzerinde durulur.",
            "c) Iki ayri yari hucre arasindaki istemli redoks tepkimesinin, standart indirgenme potansiyelleri ile iliskilendirilmesi saglanir.",
            "d) Standart olmayan kosullarda elektrot potansiyellerinin hesaplanmasina yonelik calismalara yer verilir.",
          ],
        },
        {
          code: "12.1.4.1",
          subTopicName: "Kimyasallardan Elektrik Uretimi",
          description: "Standart kosullarda galvanik pillerin voltajini ve kullanim omrunu ornekler vererek aciklar.",
        },
        {
          code: "12.1.4.2",
          subTopicName: "Kimyasallardan Elektrik Uretimi",
          description: "Lityum iyon pillerinin onemini kullanim alanlariyla iliskilendirerek aciklar.",
          details: [
            "Ogrencilerin lityum iyon pilleri ve guncel kullanim alanlarini aciklayan bir poster hazirlamalari ve sinifta sunmalari saglanir.",
          ],
        },
        {
          code: "12.1.5.1",
          subTopicName: "Elektroliz",
          description: "Elektroliz olayini elektrik akimi, zaman ve degisime ugrayan madde kutlesi acisindan aciklar.",
          isKeyKazanim: true,
          details: [
            "a) 1 mol elektronun toplam yuku uzerinden elektrik yuku-kutle iliskisi kurulmasi saglanir.",
            "b) Yuk birimi Coulomb (C) tanimlanir.",
            "c) Faraday bagintisi aciklanarak bu bagintinin kullanildigi hesaplamalar yapilir.",
            "d) Ogrencilerin Faraday bagintisini elektronik tablolama programi kullanarak kurgulamalari saglanir.",
            "e) Kaplama deneyi yaptirilir.",
          ],
        },
        {
          code: "12.1.5.2",
          subTopicName: "Elektroliz",
          description: "Kimyasal maddelerin elektroliz yontemiyle elde edilis surecini aciklar.",
          details: [
            "Suyun elektrolizi ile hidrojen ve oksijen eldesi deneyi yaptirilir.",
          ],
        },
        {
          code: "12.1.6.1",
          subTopicName: "Korozyon",
          description: "Korozyon onleme yontemlerinin elektrokimyasal temellerini aciklar.",
          details: [
            "a) Korozyon kavrami aciklanir.",
            "b) Korozyondan koruma sureci metallerin aktiflik sirasi ile iliskilendirilir; kurban elektrot kavrami uzerinde durulur.",
            "c) Kurban elektrotun kullanim alanlarina ornekler verilir.",
          ],
        },
      ],
    },

    // 12.2. KARBON KIMYASINA GIRIS
    {
      topicKey: "karbon_kimyasina_giris",
      topicName: "Karbon Kimyasina Giris",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 8,
      kazanimlar: [
        {
          code: "12.2.1.1",
          subTopicName: "Anorganik ve Organik Bilesikler",
          description: "Anorganik ve organik bilesikleri ayirt eder.",
          isKeyKazanim: true,
          details: [
            "a) Organik bilesik kavraminin tarihsel gelisimi aciklanir.",
            "b) Anorganik ve organik bilesiklerin ozellikleri vurgulanir.",
          ],
        },
        {
          code: "12.2.2.1",
          subTopicName: "Basit Formul ve Molekul Formulu",
          description: "Organik bilesiklerin basit ve molekul formullerinin bulunmasi ile ilgili hesaplamalar yapar.",
          isKeyKazanim: true,
        },
        {
          code: "12.2.3.1",
          subTopicName: "Dogada Karbon",
          description: "Karbon allotroplarinin ozelliklerini yapilariyla iliskilendirir.",
          details: [
            "a) Karbon elementinin cok sayida bilesik olusturma ozelligi ile bag yapma ozelligi arasinda iliski kurulur.",
            "b) Elmas ve grafitin incelenmesi saglanarak fulleren, nanotup ve grafenin yapilari ve onemleri uzerinde durulur.",
          ],
        },
        {
          code: "12.2.4.1",
          subTopicName: "Lewis Formulleri",
          description: "Kovalent bagli kimyasal turlerin Lewis formullerini yazar.",
          details: [
            "Oktetin asildigi molekuller kapsam disidur.",
          ],
        },
        {
          code: "12.2.5.1",
          subTopicName: "Hibritleme-Molekul Geometrileri",
          description: "Tek, cift ve uclu baglarin olusumunu hibrit ve atom orbitalleri temelinde aciklar.",
          isKeyKazanim: true,
        },
        {
          code: "12.2.5.2",
          subTopicName: "Hibritleme-Molekul Geometrileri",
          description: "Molekullerin geometrilerini merkez atomu orbitallerinin hibritlesmesi esasina gore belirler.",
          details: [
            "a) Hibritleme ve VSEPR (Degerlik Katmani Elektron Cifti Itmesi) yaklasimi uzerinde durulur. 2. periyot elementlerinin hidrojenle yaptigi bilesikler disindakiler verilmez.",
            "b) Ogrencilerin hibritleme ve VSEPR yaklasimi konusunda bilisim teknolojilerinden yararlanarak molekul modelleri yapmalari saglanir.",
          ],
        },
      ],
    },

    // 12.3. ORGANIK BILESIKLER
    {
      topicKey: "organik_bilesikler",
      topicName: "Organik Bilesikler",
      examType: "AYT",
      subjectName: "Kimya",
      sortOrder: 9,
      kazanimlar: [
        {
          code: "12.3.1.1",
          subTopicName: "Hidrokarbonlar",
          description: "Hidrokarbon turlerini ayirt eder.",
          isKeyKazanim: true,
        },
        {
          code: "12.3.1.2",
          subTopicName: "Hidrokarbonlar",
          description: "Basit alkanlarin adlarini, formullerini, ozelliklerini ve kullanim alanlarini aciklar.",
          details: [
            "a) Yanma ve halojenlerle yer degistirme ozellikleri uzerinde durulur.",
            "b) Yapisal izomerlik ve cesitleri uzerinde durulur.",
            "c) Alkanlarin yakitlarda [LPG, benzin, motorin (dizel), fueloil, katran ve asfalt urunlerinin bilesenleri] kullanildigi, heksanin ise cozucu olarak kullanildigi vurgulanir.",
            "d) Benzinlerde oktan sayisi hakkinda okuma parcasi verilir.",
          ],
        },
        {
          code: "12.3.1.3",
          subTopicName: "Hidrokarbonlar",
          description: "Basit alkenlerin adlarini, formullerini, ozelliklerini ve kullanim alanlarini aciklar.",
          details: [
            "a) Cis-trans izomerlik uzerinde durulur.",
            "b) Alkenlerin kullanim alani olarak alkil halojenur ve alkoller icin ham madde olduklari vurgulanir.",
            "c) Alkenlerin gida endustrisindeki kullanimlari ve polimerleme ozellikleri hakkinda bilgi verilir.",
          ],
        },
        {
          code: "12.3.1.4",
          subTopicName: "Hidrokarbonlar",
          description: "Basit alkinlerin adlarini, formullerini, ozelliklerini ve kullanim alanlarini aciklar.",
        },
        // TODO: Pages 203-206 MISSING — The following subtopics are likely missing:
        // 12.3.1.5+ Aromatik Hidrokarbonlar (Benzen ve turevleri)
        // 12.3.2. Alkoller
        // 12.3.3. Eterler
        // 12.3.4. Aldehitler ve Ketonlar
        // 12.3.5. Karboksilik Asitler
        // 12.3.6. Esterler
        // 12.3.7. Aminler
        // These would include kazanimlar for each functional group's naming,
        // properties, and applications. Estimated ~10-15 additional kazanimlar.
      ],
    },
  ];
}
