import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Eksik konulari mevcut derslere ekle (zaten varsa atla)
async function main() {
  console.log("📚 Eksik YKS konuları ekleniyor...\n");

  // Tum mevcut subject'leri al
  const allSubjects = await prisma.subject.findMany({
    include: { topics: true, examType: true },
  });

  // ==================== TYT KONULARI ====================
  const tytTopics: Record<string, string[]> = {
    "Türkçe": [
      // Mevcut: Sözcükte Anlam, Cümlede Anlam, Paragraf, Ses Bilgisi, Yazım Kuralları, Noktalama İşaretleri, Sözcük Türleri, Cümle Türleri, Cümlenin Ögeleri, Anlatım Bozuklukları, Dil Bilgisi (Genel)
      "Sözcükte Anlam", "Cümlede Anlam", "Paragraf",
      "Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri",
      "Sözcük Türleri", "Cümle Türleri", "Cümlenin Ögeleri",
      "Anlatım Bozuklukları", "Dil Bilgisi (Genel)",
      // Yeni eklenecekler
      "Fiilde Çatı", "Fiil Kipleri", "Ek Fiil",
      "Sözcük Yapısı (Yapım ve Çekim Ekleri)", "Sözcükte Çok Anlamlılık",
      "Mecaz ve Gerçek Anlam", "Deyimler ve Atasözleri",
      "Parçada Anlam (Ana Düşünce)", "Parçada Anlam (Yardımcı Düşünce)",
      "Paragrafta Yapı (Giriş-Gelişme-Sonuç)", "Anlatım Türleri",
      "Metin Türleri", "Nesnel ve Öznel Yargı",
      "Ünsüz Yumuşaması", "Ünsüz Sertleşmesi", "Ünlü Daralması",
      "Ünlü Düşmesi", "Kaynaştırma Ünsüzleri",
      "Bağlaçlar", "Edatlar (İlgeçler)", "Zamirler",
      "Birleşik Cümleler", "Fiilimsi (Ortaç-Ulaç-İsim Fiil)",
    ],
    "Matematik": [
      // Mevcut olanlar
      "Temel Kavramlar", "Sayı Basamakları", "Bölünebilme Kuralları",
      "EBOB-EKOK", "Rasyonel Sayılar", "Basit Eşitsizlikler",
      "Mutlak Değer", "Üslü Sayılar", "Köklü Sayılar",
      "Çarpanlara Ayırma", "Oran-Orantı", "Denklem Çözme",
      "Problemler (Sayı)", "Problemler (Kesir)", "Problemler (Yaş)",
      "Problemler (İşçi-Havuz)", "Problemler (Hareket)",
      "Yüzde-Kâr-Zarar", "Kümeler", "Fonksiyonlar",
      "Polinomlar", "İkinci Dereceden Denklemler",
      "Permütasyon-Kombinasyon", "Olasılık", "İstatistik",
      "Veri Analizi",
      // Yeni eklenecekler
      "Doğal Sayılar", "Tam Sayılar", "Asal Sayılar",
      "Faktöriyel", "Problemler (Karışım)", "Problemler (Tablo-Grafik)",
      "Mantık", "Doğrusal Denklemler", "Eşitsizlik Sistemleri",
      "Mutlak Değer Denklem ve Eşitsizlikleri",
      "Parabol (TYT)", "Kartezyen Çarpım",
      "Fonksiyon Grafiği", "Bileşke Fonksiyon", "Ters Fonksiyon",
      "Sayma-Olasılık Problemleri", "Merkezi Eğilim Ölçüleri",
      "Yayılım Ölçüleri",
    ],
    "Fen Bilimleri": [
      // Mevcut olanlar
      "Fizik - Kuvvet ve Hareket", "Fizik - Enerji",
      "Fizik - Isı ve Sıcaklık", "Fizik - Optik",
      "Fizik - Elektrik", "Fizik - Dalga",
      "Kimya - Atom ve Periyodik Tablo", "Kimya - Kimyasal Bağlar",
      "Kimya - Madde ve Özellikleri", "Kimya - Karışımlar",
      "Kimya - Kimyasal Tepkimeler", "Kimya - Asit-Baz",
      "Biyoloji - Hücre", "Biyoloji - Canlıların Sınıflandırılması",
      "Biyoloji - Kalıtım", "Biyoloji - Ekosistem",
      // Yeni eklenecekler
      "Fizik - Basınç", "Fizik - Kaldırma Kuvveti",
      "Fizik - Hareket (Düzgün/İvmeli)", "Fizik - Newton Kanunları",
      "Fizik - İş-Güç-Enerji", "Fizik - Momentum",
      "Fizik - Elektrik Devreleri", "Fizik - Manyetizma (TYT)",
      "Fizik - Ses Dalgaları",
      "Kimya - Mol Kavramı (TYT)", "Kimya - Gazlar (TYT)",
      "Kimya - Çözeltiler (TYT)", "Kimya - Kimyasal Hesaplamalar (TYT)",
      "Kimya - Maddenin Halleri", "Kimya - Endotermik-Ekzotermik Tepkimeler",
      "Biyoloji - Hücre Zarından Madde Geçişi", "Biyoloji - Mitoz-Mayoz",
      "Biyoloji - DNA ve RNA", "Biyoloji - Protein Sentezi",
      "Biyoloji - Solunum (TYT)", "Biyoloji - Fotosentez (TYT)",
      "Biyoloji - Sindirim Sistemi", "Biyoloji - Dolaşım Sistemi",
      "Biyoloji - Boşaltım Sistemi", "Biyoloji - Destek ve Hareket",
      "Biyoloji - Sinir Sistemi", "Biyoloji - Endokrin Sistem",
      "Biyoloji - Üreme",
    ],
    "Sosyal Bilimler": [
      // Mevcut olanlar
      "Tarih - İlk Uygarlıklar", "Tarih - İslam Tarihi",
      "Tarih - Türk-İslam Devletleri", "Tarih - Osmanlı Kuruluş",
      "Tarih - Osmanlı Yükselme", "Tarih - Osmanlı Duraklama",
      "Tarih - Kurtuluş Savaşı", "Tarih - İnkılap Tarihi",
      "Coğrafya - Doğa ve İnsan", "Coğrafya - Dünya Coğrafyası",
      "Coğrafya - Türkiye Coğrafyası", "Coğrafya - Beşeri Coğrafya",
      "Felsefe - Felsefeye Giriş", "Felsefe - Bilgi Felsefesi",
      "Din Kültürü",
      // Yeni eklenecekler
      "Tarih - İlk Türk Devletleri (Göktürk-Uygur)",
      "Tarih - Selçuklular", "Tarih - Haçlı Seferleri",
      "Tarih - Osmanlı Gerileme", "Tarih - Tanzimat ve Meşrutiyet",
      "Tarih - I. Dünya Savaşı", "Tarih - Mondros ve Sevr",
      "Tarih - Atatürk İlkeleri",
      "Coğrafya - Harita Bilgisi", "Coğrafya - İklim Bilgisi",
      "Coğrafya - Yerin Şekillenmesi (İç-Dış Kuvvetler)",
      "Coğrafya - Su Kaynakları (Akarsular-Göller)",
      "Coğrafya - Toprak ve Bitki Örtüsü", "Coğrafya - Nüfus",
      "Coğrafya - Yerleşme", "Coğrafya - Göç",
      "Coğrafya - Ekonomik Faaliyetler", "Coğrafya - Ulaşım ve Ticaret",
      "Felsefe - Ahlak Felsefesi", "Felsefe - Sanat Felsefesi",
      "Felsefe - Din Felsefesi", "Felsefe - Siyaset Felsefesi",
      "Din Kültürü - İslam ve İbadet", "Din Kültürü - Hz. Muhammed'in Hayatı",
      "Din Kültürü - Kur'an ve Yorumu", "Din Kültürü - Ahlak ve Değerler",
    ],
  };

  // ==================== AYT KONULARI ====================
  const aytTopics: Record<string, string[]> = {
    "Matematik": [
      // Mevcut olanlar
      "Fonksiyonlar", "Polinomlar", "İkinci Dereceden Denklemler",
      "Parabol", "Trigonometri", "Logaritma",
      "Diziler ve Seriler", "Limit", "Türev", "İntegral",
      "Olasılık", "Kombinatorik",
      // Yeni eklenecekler
      "Mantık ve Kümeler", "Bileşke ve Ters Fonksiyon",
      "Polinomların Çarpanlara Ayrılması", "Karmaşık Sayılar",
      "Matrisler", "Determinant", "Doğrusal Denklem Sistemleri",
      "Eşitsizlikler", "Mutlak Değer (AYT)",
      "Üstel ve Logaritmik Fonksiyonlar", "Trigonometrik Fonksiyonlar",
      "Trigonometrik Denklemler", "Ters Trigonometrik Fonksiyonlar",
      "Toplam-Çarpım Sembolü", "Aritmetik Dizi", "Geometrik Dizi",
      "Özel Tanımlı Diziler", "Seriler ve Yakınsaklık",
      "Süreklilik", "Türevin Uygulamaları (Maksimum-Minimum)",
      "Türevin Geometrik Yorumu", "Eğri Çizimi",
      "Belirli İntegral", "Belirsiz İntegral",
      "İntegral Uygulamaları (Alan)", "İntegral Uygulamaları (Hacim)",
      "Koşullu Olasılık", "Binom Dağılımı",
      "Analitik Geometri - Doğru Denklemleri",
      "Analitik Geometri - Çember",
      "Analitik Geometri - Elips-Hiperbol",
    ],
    "Fizik": [
      // Mevcut olanlar
      "Vektörler", "Kuvvet-Denge", "Tork",
      "Elektrik Alan ve Potansiyel", "Manyetizma",
      "İndüksiyon", "Dalgalar", "Atom Fiziği", "Modern Fizik",
      // Yeni eklenecekler
      "Bağıl Hareket", "Newton'un Hareket Yasaları (AYT)",
      "Dairesel Hareket", "Basit Harmonik Hareket",
      "Açısal Momentum", "Kepler Yasaları",
      "Elektrik Akımı ve Devreler", "Kondansatörler",
      "Alternatif Akım", "Transformatörler",
      "Elektromanyetik Dalgalar", "Işığın Kırılması",
      "Mercekler ve Aynalar", "Girişim ve Kırınım",
      "Fotoelektrik Olay", "Compton Olayı",
      "Bohr Atom Modeli", "Radyoaktivite",
      "Özel Görelilik", "Kütle-Enerji Eşdeğerliği",
    ],
    "Kimya": [
      // Mevcut olanlar
      "Mol Kavramı", "Kimyasal Hesaplamalar",
      "Gazlar", "Çözeltiler", "Kimyasal Denge",
      "Asitler ve Bazlar", "Elektrokimya", "Organik Kimya",
      // Yeni eklenecekler
      "Modern Atom Teorisi", "Periyodik Özellikler (AYT)",
      "Kimyasal Bağlar (AYT)", "Molekül Geometrisi",
      "Gazların Kinetik Teorisi", "İdeal Gaz Yasaları",
      "Koligatif Özellikler", "Derişim Birimleri",
      "Çözünürlük ve Çözünürlük Dengesi",
      "Kimyasal Denge (Le Chatelier)", "Denge Sabiti",
      "pH ve pOH Hesaplamaları", "Tampon Çözeltiler",
      "Titrasyon", "Çözünürlük Çarpımı",
      "Pil ve Elektroliz", "Standart Elektrot Potansiyeli",
      "Korozyon", "Organik Bileşik Sınıfları",
      "Hidrokarbonlar (Alkan-Alken-Alkin)",
      "Fonksiyonel Gruplar", "İzomerlik",
      "Esterler ve Sabunlaşma", "Polimerler",
      "Karbonhidratlar-Yağlar-Proteinler",
      "Tepkime Hızı", "Aktivasyon Enerjisi",
      "Tepkime Mekanizması", "Termodinamik (Entalpi-Entropi)",
    ],
    "Biyoloji": [
      // Mevcut olanlar
      "Hücre Bölünmesi", "Kalıtım", "Genetik Mühendisliği",
      "Ekoloji", "Bitki Biyolojisi", "Solunum",
      "Fotosentez", "İnsan Fizyolojisi",
      // Yeni eklenecekler
      "Nükleik Asitler (DNA-RNA)", "Protein Sentezi (AYT)",
      "Mitoz (AYT)", "Mayoz (AYT)", "Eşeyli-Eşeysiz Üreme",
      "Mendel Genetiği", "Eş Baskınlık ve Eksik Baskınlık",
      "Çok Alellilik ve Kan Grupları", "Cinsiyete Bağlı Kalıtım",
      "Mutasyonlar", "Genetik Hastalıklar", "Biyoteknoloji",
      "Gen Klonlama", "Genetiği Değiştirilmiş Organizmalar (GDO)",
      "Hücresel Solunum (Glikoliz-Krebs-ETS)", "Fermantasyon",
      "Fotosentez (Işık ve Karanlık Reaksiyonlar)",
      "Kemosentez", "Bitkilerde Madde Taşınması",
      "Bitkilerde Büyüme ve Gelişme", "Bitki Hormonları",
      "Sindirim Sistemi (AYT)", "Dolaşım Sistemi (AYT)",
      "Solunum Sistemi (AYT)", "Boşaltım Sistemi (AYT)",
      "Sinir Sistemi (AYT)", "Endokrin Sistem (AYT)",
      "Duyu Organları", "Kas ve İskelet Sistemi",
      "Bağışıklık Sistemi", "Üreme Sistemi",
      "Embriyonik Gelişim", "Popülasyon Ekolojisi",
      "Komünite Ekolojisi", "Madde Döngüleri",
      "Biyomlar", "Evrim",
    ],
    "Edebiyat": [
      // Mevcut olanlar
      "Şiir Bilgisi", "Edebi Akımlar",
      "Tanzimat Edebiyatı", "Servet-i Fünun",
      "Milli Edebiyat", "Cumhuriyet Dönemi",
      "Halk Edebiyatı", "Divan Edebiyatı", "Roman/Hikaye Analizi",
      // Yeni eklenecekler
      "Edebi Türler (Genel)", "Nazım Biçimleri ve Türleri",
      "Edebi Sanatlar (Söz Sanatları)", "Aruz Ölçüsü",
      "Hece Ölçüsü", "Serbest Nazım",
      "İslamiyet Öncesi Türk Edebiyatı", "Geçiş Dönemi Eserleri",
      "Divan Edebiyatı Nazım Biçimleri (Gazel-Kaside-Mesnevi)",
      "Divan Edebiyatı Önemli Şairler",
      "Halk Edebiyatı (Aşık-Tekke-Anonim)",
      "Halk Hikayesi ve Masal",
      "Tanzimat I. Dönem (Şinasi-Namık Kemal-Ziya Paşa)",
      "Tanzimat II. Dönem (Recaizade-Samipaşazade)",
      "Servet-i Fünun Şiiri (Tevfik Fikret-Cenap Şahabettin)",
      "Servet-i Fünun Romanı (Halit Ziya-Mehmet Rauf)",
      "Fecr-i Ati", "Beş Hececiler",
      "Milli Edebiyat Romanı (Halide Edip-Yakup Kadri)",
      "Milli Edebiyat Şiiri (Mehmet Akif-Yahya Kemal)",
      "Garip Akımı (I. Yeni)", "II. Yeni Şiiri",
      "Cumhuriyet Dönemi Roman (Kemal Tahir-Yaşar Kemal-Orhan Pamuk)",
      "Cumhuriyet Dönemi Hikaye", "Tiyatro (Genel)",
      "Deneme-Eleştiri-Makale", "Gezi Yazısı-Anı-Biyografi",
      "Dünya Edebiyatı Önemli Eserler",
    ],
    "Tarih": [
      // Mevcut olanlar
      "Osmanlı Devleti (Gerileme-Yıkılış)",
      "I. Dünya Savaşı", "Kurtuluş Savaşı",
      "Atatürk İlkeleri", "Çağdaş Türk-Dünya Tarihi",
      "II. Dünya Savaşı", "Soğuk Savaş Dönemi",
      // Yeni eklenecekler
      "Osmanlı Kuruluş Dönemi (AYT)",
      "Osmanlı Yükselme Dönemi (AYT)",
      "Osmanlı Duraklama Dönemi (AYT)",
      "Osmanlı Gerileme ve Reform (III. Selim-II. Mahmut)",
      "Tanzimat ve Islahat Fermanları",
      "I. ve II. Meşrutiyet",
      "Balkan Savaşları", "Trablusgarp Savaşı",
      "Mondros Mütarekesi", "İşgaller ve Cemiyetler",
      "Kuvayı Milliye ve TBMM",
      "Sakarya-Büyük Taarruz-Mudanya-Lozan",
      "Cumhuriyetin İlanı", "Halifeliğin Kaldırılması",
      "Hukuk İnkılapları", "Eğitim İnkılapları",
      "Ekonomik İnkılaplar (1923-1938)",
      "Toplumsal İnkılaplar",
      "Atatürk'ün Altı İlkesi",
      "Atatürk Dönemi Dış Politika",
      "1945 Sonrası Türkiye (Çok Partili Dönem)",
      "Kore Savaşı ve NATO", "Kıbrıs Meselesi",
      "1960-1980 Dönemi Türkiye",
      "Soğuk Savaş (ABD-SSCB)", "Küreselleşme",
    ],
    "Coğrafya": [
      // Mevcut olanlar
      "Türkiye'nin Yer Şekilleri", "İklim ve Bitki Örtüsü",
      "Nüfus ve Yerleşme", "Ekonomik Coğrafya", "Bölgesel Coğrafya",
      // Yeni eklenecekler
      "Harita Bilgisi (AYT)", "Koordinat Sistemi ve Yer Şekilleri",
      "Levha Tektoniği ve Depremler", "Volkanizma ve Sıcak Su Kaynakları",
      "Dış Kuvvetler (Akarsu-Rüzgar-Buzul-Dalga)",
      "Türkiye Jeomorfolojisi",
      "İklim Tipleri (Dünya)", "Türkiye İklimi",
      "Sıcaklık ve Yağış Dağılışı",
      "Toprak Tipleri", "Bitki Coğrafyası",
      "Hidrografya (Akarsular-Göller-Yeraltı Suları)",
      "Dünya Nüfusu ve Nüfus Politikaları",
      "Türkiye Nüfus Yapısı",
      "Şehirleşme ve Kentsel Sorunlar",
      "Tarım (Türkiye ve Dünya)", "Hayvancılık",
      "Madencilik ve Enerji Kaynakları",
      "Sanayi ve Sanayileşme",
      "Ulaşım Ağları ve Türkiye Ulaşımı",
      "Turizm", "Dış Ticaret",
      "Türkiye'nin Coğrafi Bölgeleri (7 Bölge)",
      "Küresel Çevre Sorunları", "Doğal Afetler",
    ],
  };

  // TYT konulari ekle
  for (const [subjectName, topics] of Object.entries(tytTopics)) {
    const subject = allSubjects.find(
      s => s.name === subjectName && s.examType.slug === "tyt"
    );
    if (!subject) {
      console.log(`⚠️ TYT - "${subjectName}" bulunamadı, atlaniyor`);
      continue;
    }

    const existingTopicNames = new Set(subject.topics.map(t => t.name));
    let added = 0;
    const maxSort = subject.topics.length > 0
      ? Math.max(...subject.topics.map(t => t.sortOrder))
      : -1;

    for (let i = 0; i < topics.length; i++) {
      if (!existingTopicNames.has(topics[i])) {
        await prisma.topic.create({
          data: {
            name: topics[i],
            subjectId: subject.id,
            sortOrder: maxSort + 1 + added,
          },
        });
        added++;
      }
    }
    console.log(`✅ TYT ${subjectName}: ${added} yeni konu eklendi (toplam: ${existingTopicNames.size + added})`);
  }

  // AYT konulari ekle
  for (const [subjectName, topics] of Object.entries(aytTopics)) {
    const subject = allSubjects.find(
      s => s.name === subjectName && s.examType.slug === "ayt"
    );
    if (!subject) {
      console.log(`⚠️ AYT - "${subjectName}" bulunamadı, atlaniyor`);
      continue;
    }

    const existingTopicNames = new Set(subject.topics.map(t => t.name));
    let added = 0;
    const maxSort = subject.topics.length > 0
      ? Math.max(...subject.topics.map(t => t.sortOrder))
      : -1;

    for (let i = 0; i < topics.length; i++) {
      if (!existingTopicNames.has(topics[i])) {
        await prisma.topic.create({
          data: {
            name: topics[i],
            subjectId: subject.id,
            sortOrder: maxSort + 1 + added,
          },
        });
        added++;
      }
    }
    console.log(`✅ AYT ${subjectName}: ${added} yeni konu eklendi (toplam: ${existingTopicNames.size + added})`);
  }

  console.log("\n🎉 Tüm eksik konular eklendi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
