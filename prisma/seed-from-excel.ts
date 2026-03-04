import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// DB Connection
// ---------------------------------------------------------------------------
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (databaseUrl && databaseUrl !== process.env.DATABASE_URL) {
  console.log("🔗 DATABASE_PUBLIC_URL kullanılıyor...");
}
const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

const EXCEL_PATH = "/Users/furkangunesi/Downloads/YKS/YKS_2026_Mufredat_Kazanimlar.xlsx";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ExcelRow {
  exam: string;
  excelSubject: string;
  grade: number;
  topicName: string;
  learningArea: string;
  code: string;
  subTopicName: string | null;
  description: string;
  details: string | null;
  isKey: boolean;
}

// ---------------------------------------------------------------------------
// Subject Mapping: (exam, excelSubject) → DB subject name
// ---------------------------------------------------------------------------
const SUBJECT_MAP: Record<string, Record<string, string>> = {
  TYT: {
    "Matematik": "Matematik",
    "Fizik": "Fen Bilimleri",
    "Kimya": "Fen Bilimleri",
    "Biyoloji": "Fen Bilimleri",
    "Türk Dili ve Edebiyatı": "Türkçe",
    "Tarih": "Sosyal Bilimler",
    "Coğrafya": "Sosyal Bilimler",
    "Din Kültürü ve Ahlak Bilgisi": "Sosyal Bilimler",
    "Felsefe": "Sosyal Bilimler",
  },
  AYT: {
    "Matematik": "Matematik",
    "Fizik": "Fizik",
    "Kimya": "Kimya",
    "Biyoloji": "Biyoloji",
    "Türk Dili ve Edebiyatı": "Edebiyat",
    "Tarih": "Tarih",
    "T.C. İnkılap Tarihi ve Atatürkçülük": "Tarih",
    "Coğrafya": "Coğrafya",
    "Din Kültürü ve Ahlak Bilgisi": "Felsefe",
    "Felsefe": "Felsefe",
    "Mantık": "Felsefe",
    "Sosyoloji": "Felsefe",
    "Psikoloji": "Felsefe",
  },
};

// Subjects to SKIP entirely (beceri bazlı, dönemlerle eşleşmiyor)
const SKIP_SUBJECTS = new Set([
  "TYT|Türk Dili ve Edebiyatı",
  "AYT|Türk Dili ve Edebiyatı",
]);

// ---------------------------------------------------------------------------
// Normalization for name matching
// ---------------------------------------------------------------------------
function norm(s: string): string {
  return s
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
    .replace(/i̇/g, "i") // combining dot above
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/д/g, "d") // Cyrillic character in some DB entries
    .replace(/Â/g, "a").replace(/â/g, "a")
    .replace(/î/g, "i").replace(/û/g, "u")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ==========================================================================
// MANUAL MAPPING TABLES
// ==========================================================================
// NO keyword scoring. NO fuzzy matching. Each row's destination is predetermined.

// ---- Helper: Create norm-keyed map from readable entries ----
function makeMap(entries: [string, string][]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const [key, val] of entries) {
    m[norm(key)] = val;
  }
  return m;
}

// ====================== STRATEGY A: ALT KONU MAPS ======================
// Key: norm(altKonu) → DB Topic Name

const ALT_KONU: Record<string, Record<string, string>> = {
  // ---- TYT Matematik ----
  "TYT|Matematik": makeMap([
    ["Önermeler ve Bileşik Önermeler", "Mantık"],
    ["Kümelerde Temel Kavramlar", "Kümeler"],
    ["Kümelerde İşlemler", "Kümeler"],
    ["Sayı Kümeleri", "Temel Kavramlar"],
    ["Bölünebilme Kuralları", "Bölünebilme Kuralları"],
    ["Üslü İfadeler ve Denklemler", "Üslü Sayılar"],
    ["Denklemler ve Eşitsizliklerle İlgili Uygulamalar", "Denklemler ve Eşitsizlikler"],
    ["Üçgenlerde Temel Kavramlar", "Üçgenler"],
    ["Üçgenlerde Eşlik ve Benzerlik", "Üçgenler"],
    ["Üçgenin Yardımcı Elemanları", "Üçgenler"],
    ["Dik Üçgen ve Trigonometri", "Üçgenler"],
    ["Üçgenin Alanı", "Üçgenler"],
    ["Merkezî Eğilim ve Yayılım Ölçüleri", "Veri Analizi"],
    ["Verilerin Grafikle Gösterilmesi", "Veri Analizi"],
    ["Sıralama ve Seçme", "Permütasyon-Kombinasyon"],
    ["Basit Olayların Olasılıkları", "Olasılık"],
    ["Fonksiyon Kavramı ve Gösterimi", "Fonksiyonlar"],
    ["İki Fonksiyonun Bileşkesi ve Bir Fonksiyonun Tersi", "Ters Fonksiyon"],
    ["Polinom Kavramı ve Polinomlarla İşlemler", "Polinomlar"],
    ["Polinomların Çarpanlara Ayrılması", "Çarpanlara Ayırma"],
    ["İkinci Dereceden Bir Bilinmeyenli Denklemler", "İkinci Dereceden Denklemler"],
    ["Çokgenler", "Dörtgenler ve Çokgenler"],
    ["Dörtgenler ve Özellikleri", "Dörtgenler ve Çokgenler"],
    ["Özel Dörtgenler", "Dörtgenler ve Çokgenler"],
    ["Katı Cisimler", "Uzay Geometri (Prizma ve Piramit)"],
  ]),

  // ---- AYT Matematik ----
  "AYT|Matematik": makeMap([
    ["Yönlü Açılar", "Trigonometri"],
    ["Trigonometrik Fonksiyonlar", "Trigonometri"],
    ["Toplam-Fark ve İki kat Açı Formülleri", "Trigonometri"],
    ["Trigonometrik Denklemler", "Trigonometri"],
    ["Doğrunun Analitik İncelenmesi", "Analitik Geometri - Doğru Denklemleri"],
    ["Çemberin Analitik İncelenmesi", "Analitik Geometri - Çember"],
    ["Fonksiyonlarla İlgili Uygulamalar", "Fonksiyonlar"],
    ["İkinci Dereceden Fonksiyonlar ve Grafikleri", "İkinci Dereceden Denklemler"],
    ["Fonksiyonların Dönüşümleri", "Fonksiyonlar"],
    ["İkinci Dereceden İki Bilinmeyenli Denklem Sistemleri", "Denklem ve Eşitsizlik Sistemleri"],
    ["İkinci Dereceden Bir Bilinmeyenli Eşitsizlikler ve Eşitsizlik Sistemleri", "Denklem ve Eşitsizlik Sistemleri"],
    ["Çemberin Temel Elemanları", "Çember ve Daire"],
    ["Çemberde Açılar", "Çember ve Daire"],
    ["Çemberde Teğet", "Çember ve Daire"],
    ["Dairenin Çevresi ve Alanı", "Çember ve Daire"],
    ["Katı Cisimler", "Uzay Geometri (Silindir, Koni, Küre)"],
    ["Koşullu Olasılık", "Olasılık"],
    ["Deneysel ve Teorik Olasılık", "Olasılık"],
    ["Üstel Fonksiyon", "Üstel ve Logaritmik Fonksiyonlar"],
    ["Logaritma Fonksiyonu", "Logaritma"],
    ["Üstel, Logaritmik Denklemler ve Eşitsizlikler", "Logaritma"],
    ["Gerçek Sayı Dizileri", "Özel Tanımlı Diziler"],
    ["Analitik Düzlemde Temel Dönüşümler", "Dönüşümler"],
    ["Limit ve Süreklilik", "Limit"],
    ["Anlık Değişim Oranı ve Türev", "Türev"],
    ["Türevin Uygulamaları", "Türevin Uygulamaları (Maksimum-Minimum)"],
    ["Belirsiz İntegral", "Belirsiz İntegral"],
    ["Belirli İntegral ve Uygulamaları", "Belirli İntegral"],
  ]),

  // ---- TYT Fizik (in Fen Bilimleri) ----
  "TYT|Fizik": makeMap([
    // MADDE VE ÖZELLİKLERİ
    ["MADDE VE ÖZKÜTLE", "Fizik Bilimine Giris"],
    ["DAYANIKLILIK", "Fizik Bilimine Giris"],
    ["YAPIŞMA VE BİRBİRİNİ TUTMA", "Fizik Bilimine Giris"],
    // HAREKET VE KUVVET
    ["HAREKET", "Fizik - Hareket (Düzgün/İvmeli)"],
    ["KUVVET", "Fizik - Kuvvet ve Hareket"],
    ["NEWTON'IN HAREKET YASALARI", "Fizik - Newton Kanunları"],
    ["SÜRTÜNME KUVVETİ", "Fizik - Kuvvet ve Hareket"],
    // ENERJİ
    ["ENERJİ KAYNAKLARI", "Fizik - Enerji"],
    ["ENERJİNİN KORUNUMU VE ENERJİ DÖNÜŞÜMLERİ", "Fizik - Enerji"],
    ["MEKANİK ENERJİ", "Fizik - Enerji"],
    ["İŞ, ENERJİ VE GÜÇ", "Fizik - Enerji"],
    // ISI VE SICAKLIK
    ["ISI VE SICAKLIK", "Fizik - Isı ve Sıcaklık"],
    ["ENERJİ İLETİM YOLLARI VE ENERJİ İLETİM HIZI", "Fizik - Isı ve Sıcaklık"],
    ["GENLEŞME", "Fizik - Isı ve Sıcaklık"],
    ["HÂL DEĞİŞİMİ", "Fizik - Isı ve Sıcaklık"],
    ["ISIL DENGE", "Fizik - Isı ve Sıcaklık"],
    // ELEKTROSTATİK
    ["ELEKTRİK YÜKLERİ", "Elektrostatik"],
    // ELEKTRİK VE MANYETİZMA
    ["ELEKTRİK AKIMI, POTANSİYEL FARKI VE DİRENÇ", "Fizik - Elektrik Devreleri"],
    ["ELEKTRİK DEVRELERİ", "Fizik - Elektrik Devreleri"],
    ["MIKNATIS VE MANYETİK ALAN", "Fizik - Manyetizma (TYT)"],
    ["AKIM VE MANYETİK ALAN", "Fizik - Manyetizma (TYT)"],
    // BASINÇ VE KALDIRMA KUVVETİ
    ["BASINÇ", "Fizik - Basınç"],
    ["KALDIRMA KUVVETİ", "Basinc ve Kaldirma Kuvveti"],
    // DALGALAR
    ["DALGALAR", "Fizik - Dalga"],
    ["YAY DALGASI", "Fizik - Dalga"],
    ["SU DALGASI", "Fizik - Dalga"],
    ["SES DALGASI", "Fizik - Ses Dalgaları"],
    ["DEPREM DALGASI", "Fizik - Dalga"],
    // OPTİK
    ["AYDINLANMA", "Fizik - Optik"],
    ["DÜZLEM AYNA", "Fizik - Optik"],
    ["GÖLGE", "Fizik - Optik"],
    ["KIRILMA", "Fizik - Optik"],
    ["KÜRESEL AYNALAR", "Fizik - Optik"],
    ["MERCEKLER", "Fizik - Optik"],
    ["PRİZMALAR", "Fizik - Optik"],
    ["RENK", "Fizik - Optik"],
    ["YANSIMA", "Fizik - Optik"],
    // Empty konu rows
    ["BİLİM ARAŞTIRMA MERKEZLERİ", "Fizik Bilimine Giris"],
    ["FİZİĞİN UYGULAMA ALANLARI", "Fizik Bilimine Giris"],
  ]),

  // ---- AYT Fizik ----
  "AYT|Fizik": makeMap([
    // KUVVET VE HAREKET
    ["VEKTÖRLER", "Vektörler"],
    ["BAĞIL HAREKET", "Bağıl Hareket"],
    ["NEWTON'IN HAREKET YASALARI", "Newton'un Hareket Yasaları (AYT)"],
    ["BİR BOYUTTA SABİT İVMELİ HAREKET", "Kuvvet ve Hareket"],
    ["İKİ BOYUTTA HAREKET", "Kuvvet ve Hareket"],
    ["ENERJİ VE HAREKET", "Kuvvet ve Hareket"],
    ["İTME VE ÇİZGİSEL MOMENTUM", "Kuvvet ve Hareket"],
    ["TORK", "Tork"],
    ["DENGE VE DENGE ŞARTLARI", "Kuvvet-Denge"],
    ["BASİT MAKİNELER", "Kuvvet-Denge"],
    // ELEKTRİK VE MANYETİZMA
    ["ELEKTRİKSEL KUVVET VE ELEKTRİK ALAN", "Elektrik Alan ve Potansiyel"],
    ["ELEKTRİKSEL POTANSİYEL", "Elektrik Alan ve Potansiyel"],
    ["DÜZGÜN ELEKTRİK ALAN VE SIĞA", "Kondansatörler"],
    ["MANYETİZMA VE ELEKTROMANYETİK İNDÜKLENME", "İndüksiyon"],
    ["ALTERNATİF AKIM", "Alternatif Akım"],
    ["TRANSFORMATÖRLER", "Transformatörler"],
    // ÇEMBERSEL HAREKET
    ["DÜZGÜN ÇEMBERSEL HAREKET", "Dairesel Hareket"],
    ["DÖNEREK ÖTELEME HAREKETİ", "Dairesel Hareket"],
    ["AÇISAL MOMENTUM", "Açısal Momentum"],
    ["KÜTLE ÇEKİM KUVVETİ", "Kepler Yasaları"],
    ["KEPLER KANUNLARI", "Kepler Yasaları"],
    // BASİT HARMONİK HAREKET
    ["BASİT HARMONİK HAREKET", "Basit Harmonik Hareket"],
    // DALGA MEKANİĞİ
    ["DALGALARDA KIRINIM, GİRİŞİM VE DOPPLER OLAYI", "Dalga Mekaniği"],
    ["ELEKTROMANYETİK DALGALAR", "Elektromanyetik Dalgalar"],
    // ATOM FİZİĞİ VE RADYOAKTİVİTE
    ["ATOM KAVRAMININ TARİHSEL GELİŞİMİ", "Bohr Atom Modeli"],
    ["BÜYÜK PATLAMA VE EVRENİN OLUŞUMU", "Kütle-Enerji Eşdeğerliği"],
    ["RADYOAKTİVİTE", "Radyoaktivite"],
    ["ÖZEL GÖRELİLİK", "Özel Görelilik"],
    ["KUANTUM FİZİĞİNE GİRİŞ", "Fotoelektrik Olay"],
    ["FOTOELEKTRİK OLAYI", "Fotoelektrik Olay"],
    ["COMPTON SAÇILMASI VE DE BROGLİE DALGA BOYU", "Compton Olayı"],
    // MODERN FİZİĞİN TEKNOLOJİDEKİ UYGULAMALARI
    ["GÖRÜNTÜLEME TEKNOLOJİLERİ", "Modern Fiziğin Teknolojideki Uygulamalari"],
    ["LASER IŞINLARI", "Modern Fiziğin Teknolojideki Uygulamalari"],
    ["NANOTEKNOLOJİ", "Modern Fiziğin Teknolojideki Uygulamalari"],
    ["SÜPER İLETKENLER", "Modern Fiziğin Teknolojideki Uygulamalari"],
    ["YARI İLETKEN TEKNOLOJİSİ", "Modern Fiziğin Teknolojideki Uygulamalari"],
  ]),

  // ---- AYT Kimya ----
  "AYT|Kimya": makeMap([
    // MODERN ATOM TEORİSİ
    ["Atomun Kuantum Modeli", "Modern Atom Teorisi"],
    ["Elementleri Tanıyalım", "Periyodik Özellikler (AYT)"],
    ["Periyodik Sistem ve Elektron Dizilimleri", "Modern Atom Teorisi"],
    ["Periyodik Özellikler", "Periyodik Özellikler (AYT)"],
    ["Yükseltgenme Basamakları", "Periyodik Özellikler (AYT)"],
    // GAZLAR
    ["Gazların Özellikleri ve Gaz Yasaları", "Gazlar"],
    ["Gazlarda Kinetik Teori", "Gazların Kinetik Teorisi"],
    ["İdeal Gaz Yasası", "İdeal Gaz Yasaları"],
    ["Gaz Karışımları", "Gazlar"],
    ["Gerçek Gazlar", "Gazlar"],
    // SIVI ÇÖZELTİLER VE ÇÖZÜNÜRLÜK
    ["Çözücü Çözünen Etkileşimleri", "Çözeltiler"],
    ["Derişim Birimleri", "Derişim Birimleri"],
    ["Koligatif Özellikler", "Koligatif Özellikler"],
    ["Çözünürlük", "Çözünürlük ve Çözünürlük Dengesi"],
    ["Çözünürlüğe Etki Eden Faktörler", "Çözünürlük ve Çözünürlük Dengesi"],
    // KİMYASAL TEPKİMELERDE ENERJİ
    ["Tepkimelerde Isı Değişimi", "Kimyasal Tepkimelerde Enerji"],
    ["Bağ Enerjileri", "Kimyasal Tepkimelerde Enerji"],
    ["Oluşum Entalpisi", "Kimyasal Tepkimelerde Enerji"],
    ["Tepkime Isılarının Toplanabilirliği", "Termodinamik (Entalpi-Entropi)"],
    // KİMYASAL TEPKİMELERDE HIZ
    ["Tepkime Hızları", "Tepkime Hızı"],
    ["Tepkime Hızını Etkileyen Faktörler", "Aktivasyon Enerjisi"],
    // KİMYASAL TEPKİMELERDE DENGE
    ["Kimyasal Denge", "Kimyasal Denge"],
    ["Dengeyi Etkileyen Faktörler", "Kimyasal Denge (Le Chatelier)"],
    ["Sulu Çözelti Dengeleri", "pH ve pOH Hesaplamaları"],
    // KİMYA VE ELEKTRİK
    ["Elektrotlar ve Elektrokimyasal Hücreler", "Pil ve Elektroliz"],
    ["Kimyasallardan Elektrik Üretimi", "Pil ve Elektroliz"],
    ["İndirgenme-Yükseltgenme Tepkimelerinde Elektrik Akımı", "Kimya ve Elektrik"],
    ["Elektrot Potansiyelleri", "Standart Elektrot Potansiyeli"],
    ["Elektroliz", "Pil ve Elektroliz"],
    ["Korozyon", "Korozyon"],
    // KARBON KİMYASINA GİRİŞ
    ["Doğada Karbon", "Karbon Kimyasina Giris"],
    ["Lewis Formülleri", "Kimyasal Bağlar (AYT)"],
    ["Hibritleşme-Molekül Geometrileri", "Molekül Geometrisi"],
    ["Anorganik ve Organik Bileşikler", "Organik Kimya"],
    ["Basit Formül ve Molekül Formülü", "Kimyasal Hesaplamalar"],
    // ORGANİK BİLEŞİKLER
    ["Hidrokarbonlar", "Hidrokarbonlar (Alkan-Alken-Alkin)"],
    ["Fonksiyonel Gruplar", "Fonksiyonel Gruplar"],
    ["Alkoller", "Organik Bileşik Sınıfları"],
    ["Eterler", "Organik Bileşik Sınıfları"],
    ["Karboksilik Asitler", "Organik Bileşik Sınıfları"],
    ["Karbonil Bileşikleri", "Organik Bileşik Sınıfları"],
    ["Esterler", "Esterler ve Sabunlaşma"],
    // ENERJİ KAYNAKLARI VE BİLİMSEL GELİŞMELER
    ["Fosil Yakıtlar", "Enerji Kaynaklari ve Bilimsel Gelismeler"],
    ["Alternatif Enerji Kaynakları", "Enerji Kaynaklari ve Bilimsel Gelismeler"],
    ["Nanoteknoloji", "Enerji Kaynaklari ve Bilimsel Gelismeler"],
    ["Sürdürülebilirlik", "Enerji Kaynaklari ve Bilimsel Gelismeler"],
  ]),

  // ---- AYT Biyoloji ----
  "AYT|Biyoloji": makeMap([
    // İnsan Fizyolojisi
    ["Denetleyici ve Düzeleyici Sistem, Duyu Organları", "Denetleyici ve Duzeleyici Sistem, Duyu Organlari"],
    ["Destek ve Hareket Sistemi", "Destek ve Hareket Sistemi"],
    ["Dolaşım Sistemleri", "Dolasim Sistemleri"],
    ["Sindirim Sistemi", "Sindirim Sistemi (AYT)"],
    ["Solunum Sistemi", "Solunum Sistemi (AYT)"],
    ["Üreme Sistemi ve Embriyonik Gelişim", "Üreme Sistemi"],
    ["Üriner Sistem", "Uriner Sistem"],
    // Genden Proteine
    ["Nükleik Asitlerin Keşfi ve Önemi", "Nükleik Asitler (DNA-RNA)"],
    ["Genetik Şifre ve Protein Sentezi", "Genden Proteine"],
    // Canlılarda Enerji Dönüşümleri
    ["Canlılık ve Enerji", "Canlılarda Enerji Dönüşümleri"],
    ["Fotosentez", "Fotosentez"],
    ["Hücresel Solunum", "Hücresel Solunum (Glikoliz-Krebs-ETS)"],
    // Bitki Biyolojisi
    ["Bitkilerin Yapısı", "Bitki Biyolojisi"],
    ["Bitkilerde Madde Taşınması", "Bitkilerde Madde Taşınması"],
    ["Bitkilerde Eşeyli Üreme", "Bitki Biyolojisi"],
    // Komünite ve Popülasyon Ekolojisi
    ["Komünite Ekolojisi", "Komünite Ekolojisi"],
    ["Popülasyon Ekolojisi", "Popülasyon Ekolojisi"],
    // Canlılar ve Çevre
    ["Canlılar ve Çevre", "Canlılar ve Çevre"],
  ]),
};

// ====================== STRATEGY A2: KONU MAPS ======================
// For subjects where altKonu is empty/missing, use konu as lookup key
// Key: norm(konuAdı) → DB Topic Name

const KONU: Record<string, Record<string, string>> = {
  // ---- TYT Kimya (in Fen Bilimleri) ----
  "TYT|Kimya": makeMap([
    ["KİMYA BİLİMİ", "Kimya Bilimi"],
    ["ATOM VE PERİYODİK SİSTEM", "Atom ve Periyodik Sistem"],
    ["KİMYASAL TÜRLER ARASI ETKİLEŞİMLER", "Kimyasal Turler Arasi Etkilesimler"],
    ["MADDENİN HÂLLERİ", "Kimya - Maddenin Halleri"],
    ["KARIŞIMLAR", "Kimya - Karışımlar"],
    ["ASİTLER, BAZLAR VE TUZLAR", "Asitler, Bazlar ve Tuzlar"],
    ["KİMYANIN TEMEL KANUNLARI VE KİMYASAL HESAPLAMALAR", "Kimyanin Temel Kanunlari ve Kimyasal Hesaplamalar"],
    ["DOĞA VE KİMYA", "Doğa ve Kimya"],
    ["KİMYA HER YERDE", "Kimya Her Yerde"],
  ]),

  // ---- TYT Biyoloji (in Fen Bilimleri) ----
  "TYT|Biyoloji": makeMap([
    ["Yaşam Bilimi Biyoloji", "Yasam Bilimi Biyoloji"],
    ["Hücre", "Biyoloji - Hücre"],
    ["Hücre Bölünmeleri", "Hucre Bolunmeleri"],
    ["Canlılar Dünyası", "Canlilar Dunyasi"],
    ["Kalıtımın Genel İlkeleri", "Biyoloji - Kalıtım"],
    ["Ekosistem Ekolojisi ve Güncel Çevre Sorunları", "Ekosistem Ekolojisi ve Guncel Cevre Sorunlari"],
  ]),

  // ---- TYT Fizik fallback (for rows with empty altKonu) ----
  "TYT|Fizik": makeMap([
    ["MADDE VE ÖZELLİKLERİ", "Fizik Bilimine Giris"],
    ["HAREKET VE KUVVET", "Fizik - Hareket (Düzgün/İvmeli)"],
    ["ENERJİ", "Fizik - Enerji"],
    ["ISI VE SICAKLIK", "Fizik - Isı ve Sıcaklık"],
    ["ELEKTROSTATİK", "Elektrostatik"],
    ["ELEKTRİK VE MANYETİZMA", "Fizik - Elektrik Devreleri"],
    ["BASINÇ VE KALDIRMA KUVVETİ", "Fizik - Basınç"],
    ["DALGALAR", "Fizik - Dalga"],
    ["OPTİK", "Fizik - Optik"],
  ]),

  // ---- AYT Mantık (in Felsefe) ----
  "AYT|Mantık": makeMap([
    ["MANTIĞA GİRİŞ", "Mantiğa Giriş"],
    ["KLASİK MANTIK", "Klasik Mantık"],
    ["SEMBOLİK MANTIK", "Sembolik Mantik"],
    ["MANTIK VE DİL", "Mantik ve Dil"],
  ]),

  // ---- AYT Sosyoloji (in Felsefe) ----
  "AYT|Sosyoloji": makeMap([
    ["SOSYOLOJİYE GİRİŞ", "Sosyolojiye Giriş"],
    ["BİREY VE TOPLUM", "Birey ve Toplum"],
    ["TOPLUMSAL YAPI", "Toplumsal Yapi"],
    ["TOPLUMSAL DEĞİŞME VE GELİŞME", "Toplumsal Değişme ve Gelişme"],
    ["TOPLUM VE KÜLTÜR", "Toplum ve Kültür"],
    ["TOPLUMSAL KURUMLAR", "Toplumsal Kurumlar"],
  ]),

  // ---- AYT Psikoloji (in Felsefe) ----
  "AYT|Psikoloji": makeMap([
    ["PSİKOLOJİ BİLİMİNİ TANIYALIM", "Psikoloji Bilimi"],
    ["PSİKOLOJİNİN TEMEL SÜREÇLERİ", "Psikolojinin Temel Süreçleri"],
    ["ÖĞRENME", "Öğrenme"],
  ]),

  // ---- AYT Fizik fallback (for konu when altKonu not in map) ----
  "AYT|Fizik": makeMap([
    ["MODERN FİZİĞİN TEKNOLOJİDEKİ UYGULAMALARI", "Modern Fiziğin Teknolojideki Uygulamalari"],
    ["BASİT HARMONİK HAREKET", "Basit Harmonik Hareket"],
  ]),

  // ---- AYT Biyoloji fallback (konu level) ----
  "AYT|Biyoloji": makeMap([
    ["Bitki Biyolojisi", "Bitki Biyolojisi"],
    ["Canlılar ve Çevre", "Canlılar ve Çevre"],
    ["Canlılarda Enerji Dönüşümleri", "Canlılarda Enerji Dönüşümleri"],
    ["Genden Proteine", "Genden Proteine"],
    ["İnsan Fizyolojisi", "İnsan Fizyolojisi"],
  ]),

  // ---- AYT Kimya fallback (konu level) ----
  "AYT|Kimya": makeMap([
    ["MODERN ATOM TEORİSİ", "Modern Atom Teorisi"],
    ["GAZLAR", "Gazlar"],
    ["KİMYASAL TEPKİMELERDE ENERJİ", "Kimyasal Tepkimelerde Enerji"],
    ["KİMYASAL TEPKİMELERDE HIZ", "Kimyasal Tepkimelerde Hiz"],
    ["KİMYASAL TEPKİMELERDE DENGE", "Kimyasal Denge"],
    ["KİMYA VE ELEKTRİK", "Kimya ve Elektrik"],
    ["KARBON KİMYASINA GİRİŞ", "Karbon Kimyasina Giris"],
    ["ORGANİK BİLEŞİKLER", "Organik Bilesikler"],
    ["SIVI ÇÖZELTİLER VE ÇÖZÜNÜRLÜK", "Sivi Cozeltiler ve Cozunurluk"],
    ["ENERJİ KAYNAKLARI VE BİLİMSEL GELİŞMELER", "Enerji Kaynaklari ve Bilimsel Gelismeler"],
  ]),
};

// ====================== STRATEGY B: ÖĞRENME ALANI MAPS ======================
// Key: norm(öğrenmeAlanı) → DB Topic Name

const OGRENME_ALANI: Record<string, Record<string, string>> = {
  // ---- TYT Tarih (in Sosyal Bilimler) ----
  "TYT|Tarih": makeMap([
    ["TARİH VE ZAMAN", "Tarih ve Zaman"],
    ["İLK VE ORTA ÇAĞLARDA TÜRK DÜNYASI", "Tarih - İlk Türk Devletleri (Göktürk-Uygur)"],
    ["İSLAM MEDENİYETİNİN DOĞUŞU", "İslam Medeniyetinin Doğuşu"],
    ["TÜRKLERİN İSLAMİYET'İ KABULÜ VE İLK TÜRK İSLAM DEVLETLERİ", "Tarih - Türk-İslam Devletleri"],
    ["YERLEŞME VE DEVLETLEŞME SÜRECİNDE SELÇUKLU TÜRKİYESİ", "Tarih - Selçuklular"],
    ["BEYLİKTEN DEVLETE OSMANLI SİYASETİ (1302-1453)", "Tarih - Osmanlı Kuruluş"],
    ["DEVLETLEŞME SÜRECİNDE SAVAŞÇILAR VE ASKERLER", "Osmanlı Devleti Kuruluş"],
    ["BEYLİKTEN DEVLETE OSMANLI MEDENİYETİ", "Osmanlı Devleti Kuruluş"],
    ["DÜNYA GÜCÜ OSMANLI (1453-1595)", "Tarih - Osmanlı Yükselme"],
    ["SULTAN VE OSMANLI MERKEZ TEŞKİLATI", "Tarih - Osmanlı Yükselme"],
    ["KLASİK ÇAĞDA OSMANLI TOPLUM DÜZENİ", "Tarih - Osmanlı Yükselme"],
  ]),

  // ---- AYT Tarih ----
  "AYT|Tarih": makeMap([
    ["DEĞİŞEN DÜNYA DENGELERİ KARŞISINDA OSMANLI SİYASETİ (1595-1774)", "Değişen Dünya Dengeleri"],
    ["DEĞİŞİM ÇAĞINDA AVRUPA VE OSMANLI", "Değişim Çağında Avrupa ve Osmanlı"],
    ["DEVRİMLER ÇAĞINDA DEĞİŞEN DEVLET-TOPLUM İLİŞKİLERİ", "Devrimler Çağında Değişen Devlet-Toplum İlişkileri"],
    ["ULUSLARARASI İLİŞKİLERDE DENGE STRATEJİSİ (1774-1914)", "Uluslararası İlişkilerde Denge Stratejisi"],
    ["XIX VE XX. YÜZYILDA DEĞİŞEN SOSYO-EKONOMİK HAYAT", "XIX ve XX. Yüzyılda Değişen Sosyo-Ekonomik Hayat"],
  ]),

  // ---- AYT T.C. İnkılap Tarihi ----
  "AYT|T.C. İnkılap Tarihi ve Atatürkçülük": makeMap([
    ["20. YÜZYIL BAŞLARINDA OSMANLI DEVLETİ VE DÜNYA", "Yüzyıl Başlarında Osmanlı Devleti ve Dünya"],
    ["MİLLÎ MÜCADELE", "Millî Mücadele"],
    ["ATATÜRKÇÜLÜK VE TÜRK İNKILABI", "Atatürkçülük ve Türk İnkılabı"],
    ["İKİ SAVAŞ ARASINDAKİ DÖNEMDE TÜRKİYE VE DÜNYA", "İki Savaş Arasındaki Dönemde Türkiye ve Dünya"],
    ["II. DÜNYA SAVAŞI SÜRECİNDE TÜRKİYE VE DÜNYA", "II. Dünya Savaşı Sürecinde Türkiye ve Dünya"],
    ["II. DÜNYA SAVAŞI SONRASINDA TÜRKİYE VE DÜNYA", "II. Dünya Savaşı Sonrasında Türkiye ve Dünya"],
    ["TOPLUMSAL DEVRİM ÇAĞINDA DÜNYA VE TÜRKİYE", "Toplumsal Devrim Çağında Dünya ve Türkiye"],
    ["21. YÜZYILIN EŞİĞİNDE TÜRKİYE VE DÜNYA", "Yüzyılın Eşiğinde Türkiye ve Dünya"],
  ]),
};

// ====================== STRATEGY C: CODE PREFIX MAPS ======================
// For "broken" subjects without Konu/Alt Konu: Coğrafya, Felsefe, Din

interface CodePrefixEntry {
  prefix: string;
  from?: number; // code suffix range start (inclusive)
  to?: number;   // code suffix range end (inclusive)
  dbTopic: string;
}

const CODE_PREFIX: Record<string, CodePrefixEntry[]> = {
  // ---- TYT Fizik fallback (for rows with empty konu/altKonu) ----
  "TYT|Fizik": [
    { prefix: "9.1", from: 1, to: 1, dbTopic: "Fizik Bilimine Giris" },
  ],

  // ---- TYT Coğrafya (in Sosyal Bilimler) ----
  "TYT|Coğrafya": [
    { prefix: "9.1", from: 1, to: 3, dbTopic: "Coğrafya - Doğa ve İnsan" },
    { prefix: "9.1", from: 4, to: 8, dbTopic: "Coğrafya - Harita Bilgisi" },
    { prefix: "9.1", from: 9, to: 13, dbTopic: "Coğrafya - İklim Bilgisi" },
    { prefix: "9.2", dbTopic: "Coğrafya - Yerleşme" },
    { prefix: "9.4", dbTopic: "Coğrafya - Doğa ve İnsan" },
    { prefix: "10.1", from: 1, to: 8, dbTopic: "Türkiye'nin Yer Şekilleri" },
    { prefix: "10.1", from: 9, to: 11, dbTopic: "Coğrafya - Su Kaynakları (Akarsular-Göller)" },
    { prefix: "10.1", from: 12, to: 14, dbTopic: "Coğrafya - Toprak ve Bitki Örtüsü" },
    { prefix: "10.1", from: 15, to: 17, dbTopic: "Coğrafya - Toprak ve Bitki Örtüsü" },
    { prefix: "10.2", from: 1, to: 7, dbTopic: "Coğrafya - Nüfus" },
    { prefix: "10.2", from: 8, to: 10, dbTopic: "Coğrafya - Göç" },
    { prefix: "10.2", from: 11, to: 20, dbTopic: "Coğrafya - Ekonomik Faaliyetler" },
    { prefix: "10.4", dbTopic: "Coğrafya - Dünya Coğrafyası" },
  ],

  // ---- AYT Coğrafya ----
  "AYT|Coğrafya": [
    { prefix: "11.1", dbTopic: "Küresel Ortam" },
    { prefix: "11.2", from: 1, to: 3, dbTopic: "Dünya Nüfusu ve Nüfus Politikaları" },
    { prefix: "11.2", from: 4, to: 7, dbTopic: "Nüfus ve Yerleşme" },
    { prefix: "11.2", from: 8, to: 20, dbTopic: "Ekonomik Coğrafya" },
    { prefix: "11.3", dbTopic: "Ulaşım Ağları ve Türkiye Ulaşımı" },
    { prefix: "11.4", dbTopic: "Küresel Çevre Sorunları" },
    { prefix: "12.1", dbTopic: "Dış Kuvvetler (Akarsu-Rüzgar-Buzul-Dalga)" },
    { prefix: "12.2", from: 1, to: 6, dbTopic: "Şehirleşme ve Kentsel Sorunlar" },
    { prefix: "12.2", from: 7, to: 13, dbTopic: "Ulaşım Ağları ve Türkiye Ulaşımı" },
    { prefix: "12.2", from: 14, to: 20, dbTopic: "Turizm" },
    { prefix: "12.3", dbTopic: "Türkiye'nin Coğrafi Bölgeleri (7 Bölge)" },
    { prefix: "12.4", dbTopic: "Küresel Çevre Sorunları" },
  ],

  // ---- TYT Felsefe (in Sosyal Bilimler) ----
  "TYT|Felsefe": [
    { prefix: "10.1", dbTopic: "Felsefe - Felsefeye Giriş" },
    { prefix: "10.2", dbTopic: "Felsefe - Felsefeye Giriş" },
    { prefix: "10.3", from: 1, to: 1, dbTopic: "Varlık Felsefesi" },
    { prefix: "10.3", from: 2, to: 3, dbTopic: "Felsefe - Bilgi Felsefesi" },
    { prefix: "10.3", from: 5, to: 5, dbTopic: "Felsefe - Din Felsefesi" },
    { prefix: "10.3", from: 6, to: 6, dbTopic: "Felsefe - Siyaset Felsefesi" },
    { prefix: "10.3", from: 7, to: 7, dbTopic: "Felsefe - Sanat Felsefesi" },
    { prefix: "10.4", dbTopic: "Felsefe - Ahlak Felsefesi" },
  ],

  // ---- AYT Felsefe ----
  "AYT|Felsefe": [
    { prefix: "11.1", dbTopic: "Bilim Felsefesi" },
    { prefix: "11.2", dbTopic: "Bilim Felsefesi" },
    { prefix: "11.3", dbTopic: "Bilim Felsefesi" },
    { prefix: "11.4", dbTopic: "Bilim Felsefesi" },
    { prefix: "11.5", dbTopic: "Bilim Felsefesi" },
  ],

  // ---- TYT Din Kültürü (in Sosyal Bilimler) ----
  "TYT|Din Kültürü ve Ahlak Bilgisi": [
    { prefix: "9.1", dbTopic: "Din ve İslam" },
    { prefix: "9.2", dbTopic: "Din ve İslam" },
    { prefix: "9.3", dbTopic: "Din Kültürü - İslam ve İbadet" },
    { prefix: "9.4", dbTopic: "Din Kültürü - Ahlak ve Değerler" },
    { prefix: "9.5", dbTopic: "Din Kültürü" },
    { prefix: "10.1", dbTopic: "Din ve İslam" },
    { prefix: "10.2", dbTopic: "Din Kültürü - Hz. Muhammed'in Hayatı" },
    { prefix: "10.3", dbTopic: "Din Kültürü" },
    { prefix: "10.4", dbTopic: "Din Kültürü - Ahlak ve Değerler" },
    { prefix: "10.5", dbTopic: "Din Kültürü - Kur'an ve Yorumu" },
  ],

  // ---- AYT Din Kültürü (in Felsefe) ----
  "AYT|Din Kültürü ve Ahlak Bilgisi": [
    { prefix: "11.1", dbTopic: "Din Felsefesi" },
    { prefix: "11.2", dbTopic: "Din Felsefesi" },
    { prefix: "11.3", dbTopic: "Din Felsefesi" },
    { prefix: "11.4", dbTopic: "Din Felsefesi" },
    { prefix: "11.5", dbTopic: "Din Felsefesi" },
    { prefix: "12.1", dbTopic: "Din Felsefesi" },
    { prefix: "12.2", dbTopic: "Din Felsefesi" },
    { prefix: "12.3", dbTopic: "Din Felsefesi" },
    { prefix: "12.4", dbTopic: "Sanat Felsefesi" },
    { prefix: "12.5", dbTopic: "Din Felsefesi" },
  ],
};

// ---------------------------------------------------------------------------
// Code prefix matching
// ---------------------------------------------------------------------------
function matchCodePrefix(code: string, entry: CodePrefixEntry): boolean {
  // Extract prefix from code: "10.1.3" → prefix "10.1", suffix 3
  const parts = code.split(".");
  if (parts.length < 2) return false;

  const codePrefix = parts[0] + "." + parts[1];
  if (codePrefix !== entry.prefix) return false;

  // If no range specified, any code with this prefix matches
  if (entry.from === undefined || entry.to === undefined) return true;

  // Extract suffix (third number)
  const suffix = parts.length >= 3 ? parseInt(parts[2], 10) : 0;
  if (isNaN(suffix)) return false;

  return suffix >= entry.from && suffix <= entry.to;
}

// ---------------------------------------------------------------------------
// TOPIC RESOLVER: Deterministic lookup for each Excel row
// ---------------------------------------------------------------------------
function findDbTopicName(row: ExcelRow): string | null {
  const key = `${row.exam}|${row.excelSubject}`;

  // Skip Edebiyat/Türkçe
  if (SKIP_SUBJECTS.has(key)) return null;

  const altNorm = norm(row.subTopicName || "");
  const konuNorm = norm(row.topicName || "");
  const areaNorm = norm(row.learningArea || "");

  // Strategy A: Try altKonu map first
  const altMap = ALT_KONU[key];
  if (altMap && altNorm && altMap[altNorm]) {
    return altMap[altNorm];
  }

  // Strategy A2: Try konu map
  const konuMap = KONU[key];
  if (konuMap && konuNorm && konuMap[konuNorm]) {
    return konuMap[konuNorm];
  }

  // Strategy B: Try öğrenme alanı map
  const areaMap = OGRENME_ALANI[key];
  if (areaMap && areaNorm && areaMap[areaNorm]) {
    return areaMap[areaNorm];
  }

  // Strategy C: Try code prefix map
  const prefixList = CODE_PREFIX[key];
  if (prefixList) {
    for (const entry of prefixList) {
      if (matchCodePrefix(row.code, entry)) {
        return entry.dbTopic;
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Parse Excel
// ---------------------------------------------------------------------------
function parseExcel(): ExcelRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

  const result: ExcelRow[] = [];
  let idx = 0;

  for (const row of rows) {
    idx++;
    const exam = String(row["Sınav"] || "");
    const subject = String(row["Ders"] || "");
    const grade = Number(row["Sınıf"]) || 0;
    const topicName = row["Konu Adı"];
    const area = row["Öğrenme Alanı"];
    const code = String(row["Kazanım Kodu"] || `${grade}.${idx}`);
    const subTopic = row["Alt Konu"];
    const desc = String(row["Kazanım Açıklama"] || "");
    const details = row["Detaylar"];
    const isKey = row["Anahtar Kazanım"] === "E";

    if (!exam || !subject) continue;

    result.push({
      exam,
      excelSubject: subject,
      grade,
      topicName: topicName && String(topicName) !== "undefined" ? String(topicName) : "",
      learningArea: area && String(area) !== "undefined" ? String(area) : "",
      code,
      subTopicName: subTopic && String(subTopic) !== "undefined" ? String(subTopic) : null,
      description: desc,
      details: details ? String(details).split(" | ").join("\n") : null,
      isKey,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log("🎯 ÖSYM 2026 Excel → DB Seed (Manuel Eşleme — Deterministik)\n");

  // ========== Step 1: Parse Excel ==========
  const allRows = parseExcel();
  console.log(`📄 ${allRows.length} kazanım parsed from Excel`);

  // ========== Step 2: Load DB structure ==========
  const examTypes = await prisma.examType.findMany({
    include: {
      subjects: {
        include: {
          topics: {
            select: { id: true, name: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  // Build lookup: (examName, subjectName) → { normTopicName → topicId }
  const topicLookup: Record<string, Record<string, string>> = {};
  const topicNameById: Record<string, string> = {};

  for (const et of examTypes) {
    for (const sub of et.subjects) {
      const key = `${et.name}|${sub.name}`;
      topicLookup[key] = {};
      for (const t of sub.topics) {
        topicLookup[key][norm(t.name)] = t.id;
        topicNameById[t.id] = t.name;
      }
    }
  }

  // ========== Step 3: Delete existing kazanımlar ==========
  console.log("\n🗑️  Mevcut veriler siliniyor...");
  try {
    const delP = await prisma.kazanimProgress.deleteMany({});
    console.log(`   KazanimProgress: ${delP.count}`);
  } catch {
    console.log("   KazanimProgress: (skip)");
  }
  const delK = await prisma.topicKazanim.deleteMany({});
  console.log(`   TopicKazanim: ${delK.count}`);

  // ========== Step 4: Map each row to a DB topic ==========
  const kazanimsToCreate: {
    topicId: string;
    code: string;
    subTopicName: string | null;
    description: string;
    details: string | null;
    isKeyKazanim: boolean;
    sortOrder: number;
  }[] = [];

  const topicMetadata: Record<string, { grade: number; area: string }> = {};

  // Stats
  let mapped = 0;
  let unmapped = 0;
  let skipped = 0;
  const unmappedLog: string[] = [];
  const perTopicCount: Record<string, number> = {};
  const topicSortCounter: Record<string, number> = {};
  const dedup = new Set<string>();

  for (const row of allRows) {
    const subjKey = `${row.exam}|${row.excelSubject}`;

    // Skip Edebiyat/Türkçe
    if (SKIP_SUBJECTS.has(subjKey)) {
      skipped++;
      continue;
    }

    // Find the DB subject
    const dbSubjectName = SUBJECT_MAP[row.exam]?.[row.excelSubject];
    if (!dbSubjectName) {
      unmapped++;
      unmappedLog.push(`  [NO SUBJECT] ${subjKey} | ${row.code}: ${row.description.substring(0, 60)}`);
      continue;
    }

    // Find the target DB topic name from mapping tables
    const targetTopicName = findDbTopicName(row);
    if (!targetTopicName) {
      unmapped++;
      unmappedLog.push(`  [NO MAPPING] ${subjKey} | konu="${row.topicName}" alt="${row.subTopicName || ""}" alan="${row.learningArea}" code=${row.code}`);
      continue;
    }

    // Look up the topic in DB by normalized name
    const lookupKey = `${row.exam}|${dbSubjectName}`;
    const subjectTopics = topicLookup[lookupKey];
    if (!subjectTopics) {
      unmapped++;
      unmappedLog.push(`  [NO DB SUBJECT] ${lookupKey} | target="${targetTopicName}"`);
      continue;
    }

    const normTarget = norm(targetTopicName);
    let topicId = subjectTopics[normTarget];

    // If exact normalized match fails, try partial containment
    if (!topicId) {
      for (const [normName, tid] of Object.entries(subjectTopics)) {
        if (normName.includes(normTarget) || normTarget.includes(normName)) {
          topicId = tid;
          break;
        }
      }
    }

    if (!topicId) {
      unmapped++;
      unmappedLog.push(`  [NOT IN DB] ${lookupKey} | target="${targetTopicName}" (norm: "${normTarget}")`);
      continue;
    }

    // Dedup by (topicId, code, description)
    const dedupKey = `${topicId}|${row.code}|${row.description}`;
    if (dedup.has(dedupKey)) continue;
    dedup.add(dedupKey);

    // Track sort order per topic
    if (!topicSortCounter[topicId]) topicSortCounter[topicId] = 0;
    topicSortCounter[topicId]++;

    kazanimsToCreate.push({
      topicId,
      code: row.code,
      subTopicName: row.subTopicName,
      description: row.description,
      details: row.details,
      isKeyKazanim: row.isKey,
      sortOrder: topicSortCounter[topicId],
    });

    // Track metadata
    if (!topicMetadata[topicId] && row.grade > 0) {
      topicMetadata[topicId] = { grade: row.grade, area: row.learningArea };
    }

    perTopicCount[topicId] = (perTopicCount[topicId] || 0) + 1;
    mapped++;
  }

  // ========== Step 5: Write to DB ==========
  console.log(`\n📝 ${kazanimsToCreate.length} kazanım yazılıyor...`);

  for (let i = 0; i < kazanimsToCreate.length; i += 100) {
    const chunk = kazanimsToCreate.slice(i, i + 100);
    await prisma.topicKazanim.createMany({ data: chunk });
  }

  // Update topic metadata
  for (const [topicId, meta] of Object.entries(topicMetadata)) {
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        gradeLevel: meta.grade || undefined,
        learningArea: meta.area || undefined,
      },
    });
  }

  // ========== Step 6: Report ==========
  console.log("\n" + "═".repeat(60));
  console.log("📊 SONUÇLAR");
  console.log("═".repeat(60));
  console.log(`  ✅ Eşleşen (mapped):   ${mapped}`);
  console.log(`  ⏭️  Atlanan (skipped):  ${skipped} (Edebiyat/Türkçe)`);
  console.log(`  ❌ Eşleşmeyen:         ${unmapped}`);
  console.log(`  📝 Yazılan kazanım:    ${kazanimsToCreate.length} (dedup sonrası)`);

  // Per-subject summary
  console.log("\n📘 Konu bazlı dağılım:");
  const topicsBySubject: Record<string, { total: number; filled: number; topicDetails: string[] }> = {};

  for (const et of examTypes) {
    for (const sub of et.subjects) {
      const key = `${et.name} > ${sub.name}`;
      const details: string[] = [];
      let filled = 0;
      for (const t of sub.topics) {
        const count = perTopicCount[t.id] || 0;
        if (count > 0) {
          filled++;
          details.push(`    ✅ "${t.name}" → ${count}`);
        } else {
          details.push(`    ❌ "${t.name}" → 0`);
        }
      }
      topicsBySubject[key] = { total: sub.topics.length, filled, topicDetails: details };
    }
  }

  for (const [key, info] of Object.entries(topicsBySubject).sort()) {
    console.log(`\n  ${key}: ${info.filled}/${info.total} topic dolu`);
    for (const d of info.topicDetails) {
      console.log(d);
    }
  }

  // Unmapped rows
  if (unmappedLog.length > 0) {
    console.log("\n⚠️  Eşleşmeyen satırlar:");
    for (const line of unmappedLog.slice(0, 50)) {
      console.log(line);
    }
    if (unmappedLog.length > 50) {
      console.log(`  ... ve ${unmappedLog.length - 50} satır daha`);
    }
  }

  // KEY VALIDATION: Check critical topics
  console.log("\n🔍 KRİTİK DOĞRULAMA:");
  const validations = [
    { exam: "AYT", subject: "Matematik", topic: "Polinomlar", expectedPrefix: "10.3" },
    { exam: "AYT", subject: "Matematik", topic: "Trigonometri", expectedPrefix: "11.1" },
    { exam: "AYT", subject: "Matematik", topic: "Türev", expectedPrefix: "12.5" },
    { exam: "AYT", subject: "Matematik", topic: "Limit", expectedPrefix: "12.5" },
    { exam: "AYT", subject: "Matematik", topic: "İkinci Dereceden Denklemler", expectedPrefix: "" },
    { exam: "TYT", subject: "Matematik", topic: "Polinomlar", expectedPrefix: "10.3" },
  ];

  for (const v of validations) {
    const lookKey = `${v.exam}|${v.subject}`;
    const topics = topicLookup[lookKey];
    if (!topics) continue;
    const normTopic = norm(v.topic);
    const topicId = topics[normTopic];
    if (!topicId) continue;

    const kazanims = kazanimsToCreate.filter(k => k.topicId === topicId);
    const codes = kazanims.map(k => k.code).join(", ");
    const hasWrongCodes = v.expectedPrefix && kazanims.some(k => !k.code.startsWith(v.expectedPrefix));

    console.log(`  ${hasWrongCodes ? "❌" : "✅"} ${v.exam} "${v.topic}": ${kazanims.length} kazanım [${codes}]`);
    if (hasWrongCodes) {
      console.log(`     ⚠️  UYARI: ${v.expectedPrefix} ile başlamayan kodlar var!`);
    }
  }

  console.log("\n" + "═".repeat(60));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
