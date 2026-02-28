import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * This script redistributes kazanımlar so that EVERY existing topic
 * in the database has at least 2 kazanımlar.
 *
 * It first deletes ALL TopicKazanim records, then re-creates them
 * mapped to each granular topic by name matching.
 */

// =============================================================================
// KAZANIM DATA: Maps topic name → kazanımlar
// Keys use substring matching (case-insensitive, Turkish-normalized)
// =============================================================================

interface KDef {
  code: string;
  desc: string;
  key?: boolean;
  sub?: string;
  details?: string;
}

// Comprehensive kazanım mapping for ALL topics
// Format: [matchPattern, examType ("TYT"|"AYT"|"*"), subjectContains, kazanımlar[]]
const MAPPINGS: Array<{
  match: string;
  exam?: string;
  subject?: string;
  kazanimlar: KDef[];
}> = [
  // ============ TYT MATEMATİK ============
  { match: "Temel Kavramlar", exam: "TYT", subject: "Matematik", kazanimlar: [
    { code: "9.3.1.1", desc: "Doğal, tam, rasyonel, irrasyonel ve reel sayı kümelerini ilişkilendirir.", key: true },
    { code: "9.3.1.2", desc: "Gerçek sayılar kümesinde toplama ve çarpma işlemlerinin özelliklerini açıklar." },
  ]},
  { match: "Sayı Basamak", kazanimlar: [
    { code: "9.3.1.3", desc: "Sayı basamaklarını ve basamak değerlerini kullanarak problemler çözer.", key: true },
    { code: "9.3.1.4", desc: "Sayıların ondalık gösterimlerini açıklar ve hesaplar." },
  ]},
  { match: "Bölünebilme", subject: "Matematik", kazanimlar: [
    { code: "9.3.2.1", desc: "Tam sayılarda bölünebilme kurallarıyla ilgili problemler çözer.", key: true },
    { code: "9.3.2.3", desc: "Gerçek hayatta periyodik olarak tekrar eden durumları içeren problemleri çözer." },
  ]},
  { match: "EBOB-EKOK", kazanimlar: [
    { code: "9.3.2.2", desc: "Tam sayılarda EBOB ve EKOK ile ilgili uygulamalar yapar.", key: true },
    { code: "9.3.2.4", desc: "EBOB ve EKOK kavramlarını gerçek hayat problemlerinde kullanır." },
  ]},
  { match: "Rasyonel Sayı", kazanimlar: [
    { code: "9.3.1.5", desc: "Rasyonel sayılarla dört işlem yapar.", key: true },
    { code: "9.3.1.6", desc: "Rasyonel sayıların ondalık gösterimlerini açıklar." },
  ]},
  { match: "Basit Eşitsizlik", kazanimlar: [
    { code: "9.3.3.1", desc: "Gerçek sayılar kümesinde aralık kavramını açıklar." },
    { code: "9.3.3.2", desc: "Birinci dereceden bir bilinmeyenli denklem ve eşitsizliklerin çözüm kümelerini bulur.", key: true },
  ]},
  { match: "Mutlak Değer Denklem", kazanimlar: [
    { code: "9.3.3.3", desc: "Mutlak değer içeren birinci dereceden denklem ve eşitsizlikleri çözer.", key: true },
    { code: "9.3.3.4", desc: "Mutlak değerin geometrik yorumunu açıklar." },
  ]},
  { match: "Mutlak Değer", exam: "TYT", subject: "Matematik", kazanimlar: [
    { code: "9.3.3.5", desc: "Bir gerçek sayının mutlak değerini hesaplar ve özelliklerini kullanır.", key: true },
    { code: "9.3.3.6", desc: "Mutlak değer içeren ifadeleri sadeleştirir." },
  ]},
  { match: "Üslü Sayı", kazanimlar: [
    { code: "9.3.4.1", desc: "Üslü ifadeleri içeren denklemleri çözer.", key: true },
    { code: "9.3.4.2", desc: "Üslü ifadelerin özelliklerini kullanarak sadeleştirme yapar." },
  ]},
  { match: "Köklü Sayı", kazanimlar: [
    { code: "9.3.4.3", desc: "Köklü ifadeleri içeren denklemleri çözer.", key: true },
    { code: "9.3.4.4", desc: "Köklü ifadelerin özelliklerini kullanarak hesaplama yapar." },
  ]},
  { match: "Çarpanlara Ayır", kazanimlar: [
    { code: "9.3.5.1", desc: "Çarpanlara ayırma yöntemlerini kullanarak ifadeleri sadeleştirir.", key: true },
    { code: "9.3.5.2", desc: "Ortak çarpan, gruplandırma ve özdeşlik yöntemlerini uygular." },
  ]},
  { match: "Oran-Orantı", kazanimlar: [
    { code: "9.3.5.3", desc: "Oran ve orantı kavramlarını kullanarak problemler çözer.", key: true },
    { code: "9.3.5.4", desc: "Doğru ve ters orantı problemlerini çözer." },
  ]},
  { match: "Denklem Çöz", kazanimlar: [
    { code: "9.3.3.7", desc: "Birinci dereceden denklemleri çözer.", key: true },
    { code: "9.3.3.8", desc: "İki bilinmeyenli doğrusal denklem sistemlerini çözer.", key: true },
    { code: "9.3.3.9", desc: "Denklem ve eşitsizlikleri gerçek hayat problemlerinde uygular." },
  ]},
  { match: "Problemler (Sayı)", kazanimlar: [
    { code: "9.P.1.1", desc: "Sayılarla ilgili sözel problemleri denklem kurarak çözer.", key: true },
    { code: "9.P.1.2", desc: "Ardışık sayı ve basamak değeri problemlerini çözer." },
  ]},
  { match: "Problemler (Kesir)", kazanimlar: [
    { code: "9.P.2.1", desc: "Kesir problemlerini denklem kurarak çözer.", key: true },
    { code: "9.P.2.2", desc: "Kesirlerde parça-bütün ilişkisini kullanarak problemler çözer." },
  ]},
  { match: "Problemler (Yaş)", kazanimlar: [
    { code: "9.P.3.1", desc: "Yaş problemlerini denklem kurarak çözer.", key: true },
    { code: "9.P.3.2", desc: "Geçmiş ve gelecek zamanla ilgili yaş problemlerini çözer." },
  ]},
  { match: "Problemler (İşçi-Havuz)", kazanimlar: [
    { code: "9.P.4.1", desc: "İşçi-havuz problemlerini oran-orantı kullanarak çözer.", key: true },
    { code: "9.P.4.2", desc: "Birlikte ve ayrı çalışma durumlarını hesaplar." },
  ]},
  { match: "Problemler (Hareket)", exam: "TYT", kazanimlar: [
    { code: "9.P.5.1", desc: "Hareket problemlerini hız-zaman-yol bağıntısıyla çözer.", key: true },
    { code: "9.P.5.2", desc: "Karşıdan ve aynı yönden hareket problemlerini çözer." },
  ]},
  { match: "Problemler (Karışım)", kazanimlar: [
    { code: "9.P.6.1", desc: "Karışım problemlerini oran kullanarak çözer.", key: true },
    { code: "9.P.6.2", desc: "Alaşım ve çözelti problemlerini çözer." },
  ]},
  { match: "Problemler (Tablo-Grafik)", kazanimlar: [
    { code: "9.P.7.1", desc: "Tablo ve grafik verilerini yorumlayarak problemler çözer.", key: true },
    { code: "9.P.7.2", desc: "Verilen bilgilerden tablo ve grafik oluşturur." },
  ]},
  { match: "Yüzde-Kâr-Zarar", kazanimlar: [
    { code: "9.3.5.5", desc: "Yüzde hesaplamalarını kullanarak kâr-zarar problemlerini çözer.", key: true },
    { code: "9.3.5.6", desc: "Ardışık yüzde değişimlerini hesaplar." },
  ]},
  { match: "Kümeler", exam: "TYT", subject: "Matematik", kazanimlar: [
    { code: "9.2.1.1", desc: "Kümelerle ilgili temel kavramları açıklar.", key: true },
    { code: "9.2.2.1", desc: "Kümelerde birleşim, kesişim, fark ve tümleme işlemleriyle problemler çözer.", key: true },
    { code: "9.2.1.2", desc: "Alt küme kavramını ve alt küme sayısını belirler." },
  ]},
  { match: "Fonksiyonlar", exam: "TYT", subject: "Matematik", kazanimlar: [
    { code: "10.1.1.1", desc: "Fonksiyon kavramını tanımlar ve örneklendirir.", key: true },
    { code: "10.1.1.2", desc: "Fonksiyonların tanım ve değer kümelerini belirler." },
    { code: "10.1.2.1", desc: "Fonksiyon türlerini (bire bir, örten, sabit) açıklar.", key: true },
  ]},
  { match: "Fonksiyon Grafiği", kazanimlar: [
    { code: "10.1.3.1", desc: "Fonksiyonların grafiklerini çizer ve yorumlar.", key: true },
    { code: "10.1.3.2", desc: "Grafik üzerinden fonksiyon özelliklerini belirler." },
  ]},
  { match: "Bileşke Fonksiyon", kazanimlar: [
    { code: "10.1.4.1", desc: "İki fonksiyonun bileşkesini hesaplar.", key: true },
    { code: "10.1.4.2", desc: "Bileşke fonksiyonun özelliklerini belirler." },
  ]},
  { match: "Ters Fonksiyon", exam: "TYT", kazanimlar: [
    { code: "10.1.5.1", desc: "Bir fonksiyonun tersinin var olup olmadığını belirler.", key: true },
    { code: "10.1.5.2", desc: "Ters fonksiyonu bulur ve grafiğini çizer." },
  ]},
  { match: "Polinomlar", exam: "TYT", subject: "Matematik", kazanimlar: [
    { code: "10.2.1.1", desc: "Polinom kavramını açıklar ve polinom işlemleri yapar.", key: true },
    { code: "10.2.1.2", desc: "Bir polinomun derecesini, katsayılarını ve sabit terimini belirler." },
  ]},
  { match: "İkinci Dereceden Denklemler", exam: "TYT", kazanimlar: [
    { code: "10.2.2.1", desc: "İkinci dereceden bir bilinmeyenli denklemleri çözer.", key: true },
    { code: "10.2.2.2", desc: "Diskriminant yardımıyla köklerin varlığını yorumlar.", key: true },
  ]},
  { match: "Permütasyon-Kombinasyon", kazanimlar: [
    { code: "10.3.1.1", desc: "Permütasyon kavramını açıklar ve hesaplama yapar.", key: true },
    { code: "10.3.1.2", desc: "Kombinasyon kavramını açıklar ve hesaplama yapar.", key: true },
  ]},
  { match: "Olasılık", exam: "TYT", subject: "Matematik", kazanimlar: [
    { code: "10.3.2.1", desc: "Bir olayın olasılığını hesaplar.", key: true },
    { code: "10.3.2.2", desc: "Koşullu olasılık ve bağımsız olay kavramlarını açıklar." },
    { code: "10.3.2.3", desc: "Olasılıkla ilgili problemleri çözer.", key: true },
  ]},
  { match: "İstatistik", exam: "TYT", kazanimlar: [
    { code: "9.5.1.1", desc: "Aritmetik ortalama, medyan ve mod hesaplar.", key: true },
    { code: "9.5.1.2", desc: "Standart sapma ve varyans hesaplar." },
  ]},
  { match: "Mantık", exam: "TYT", subject: "Matematik", kazanimlar: [
    { code: "9.1.1.1", desc: "Önermeyi ve doğruluk değerini açıklar.", key: true },
    { code: "9.1.1.2", desc: "Bileşik önerme kurar; doğruluk tablosu oluşturur." },
    { code: "9.1.1.3", desc: "Koşullu ve iki koşullu önermeleri açıklar." },
  ]},
  { match: "Doğal Sayı", kazanimlar: [
    { code: "9.3.1.7", desc: "Doğal sayılarda dört işlem ve özelliklerini uygular.", key: true },
    { code: "9.3.1.8", desc: "Doğal sayı problemlerini çözer." },
  ]},
  { match: "Tam Sayı", kazanimlar: [
    { code: "9.3.1.9", desc: "Tam sayılarda dört işlem ve özelliklerini uygular.", key: true },
    { code: "9.3.1.10", desc: "Tam sayıların sıralama özelliklerini kullanır." },
  ]},
  { match: "Asal Sayı", kazanimlar: [
    { code: "9.3.2.5", desc: "Asal sayıların özelliklerini açıklar ve asal çarpanlara ayırır.", key: true },
    { code: "9.3.2.6", desc: "Asal sayılarla ilgili problemleri çözer." },
  ]},
  { match: "Faktöriyel", kazanimlar: [
    { code: "10.3.0.1", desc: "Faktöriyel kavramını açıklar ve hesaplama yapar.", key: true },
    { code: "10.3.0.2", desc: "Faktöriyel içeren ifadeleri sadeleştirir." },
  ]},
  { match: "Doğrusal Denklem", exam: "TYT", kazanimlar: [
    { code: "9.3.3.10", desc: "Doğrusal denklem sistemlerini grafik ve cebirsel yöntemlerle çözer.", key: true },
    { code: "9.3.3.11", desc: "Doğrusal denklem sistemlerinin çözüm durumlarını yorumlar." },
  ]},
  { match: "Eşitsizlik Sistem", kazanimlar: [
    { code: "9.3.3.12", desc: "Eşitsizlik sistemlerinin çözüm kümelerini bulur.", key: true },
    { code: "9.3.3.13", desc: "Eşitsizlik sistemlerini grafik üzerinde gösterir." },
  ]},
  { match: "Parabol", exam: "TYT", kazanimlar: [
    { code: "10.2.3.1", desc: "Parabolün tepe noktasını, eksenlerini ve grafiğini belirler.", key: true },
    { code: "10.2.3.2", desc: "İkinci dereceden fonksiyonun işaret tablosunu çıkarır." },
  ]},
  { match: "Kartezyen Çarpım", kazanimlar: [
    { code: "9.2.2.2", desc: "İki kümenin kartezyen çarpımıyla ilgili işlemler yapar.", key: true },
    { code: "9.2.2.3", desc: "Sıralı ikili ve kartezyen çarpımın eleman sayısını bulur." },
  ]},
  { match: "Sayma-Olasılık", kazanimlar: [
    { code: "10.3.3.1", desc: "Sayma ilkelerini kullanarak olasılık problemleri çözer.", key: true },
    { code: "10.3.3.2", desc: "Toplama ve çarpma ilkelerini uygular." },
  ]},
  { match: "Merkezi Eğilim", kazanimlar: [
    { code: "9.5.1.3", desc: "Merkezi eğilim ölçülerini (ortalama, medyan, mod) hesaplar ve yorumlar.", key: true },
    { code: "9.5.1.4", desc: "Gruplandırılmış verilerde merkezi eğilim ölçülerini hesaplar." },
  ]},
  { match: "Yayılım Ölçü", kazanimlar: [
    { code: "9.5.2.1", desc: "Standart sapma ve varyans hesaplar.", key: true },
    { code: "9.5.2.2", desc: "Çeşitli grafik türlerini yorumlar ve karşılaştırır." },
  ]},
  { match: "Veri Analiz", kazanimlar: [
    { code: "9.5.3.1", desc: "Histogram ve sıklık tablosu oluşturur.", key: true },
    { code: "9.5.3.2", desc: "Çeşitli grafik türlerini yorumlar." },
  ]},

  // ============ AYT MATEMATİK ============
  { match: "Trigonometri", exam: "AYT", subject: "Matematik", kazanimlar: [
    { code: "10.4.1.1", desc: "Trigonometrik oranları birim çemberde gösterir.", key: true },
    { code: "10.4.1.2", desc: "Trigonometrik özdeşlikleri kullanarak işlem yapar.", key: true },
    { code: "10.4.2.1", desc: "Toplam-fark, yarım açı ve iki kat açı formüllerini uygular." },
  ]},
  { match: "Trigonometrik Fonksiyon", kazanimlar: [
    { code: "11.1.1.1", desc: "Trigonometrik fonksiyonların grafiklerini çizer.", key: true },
    { code: "11.1.1.2", desc: "Trigonometrik fonksiyonların periyodunu ve genliğini belirler." },
  ]},
  { match: "Trigonometrik Denklem", kazanimlar: [
    { code: "11.1.2.1", desc: "Trigonometrik denklemleri çözer.", key: true },
    { code: "11.1.2.2", desc: "Trigonometrik eşitsizlikleri çözer." },
  ]},
  { match: "Ters Trigonometrik", kazanimlar: [
    { code: "11.1.3.1", desc: "Ters trigonometrik fonksiyonları açıklar.", key: true },
    { code: "11.1.3.2", desc: "Ters trigonometrik fonksiyonlarla işlem yapar." },
  ]},
  { match: "Logaritma", exam: "AYT", kazanimlar: [
    { code: "11.2.1.1", desc: "Logaritma kavramını ve özelliklerini açıklar.", key: true },
    { code: "11.2.1.2", desc: "Logaritma içeren denklem ve eşitsizlikleri çözer.", key: true },
  ]},
  { match: "Üstel ve Logaritmik", kazanimlar: [
    { code: "11.2.2.1", desc: "Üstel ve logaritmik fonksiyonların grafiklerini çizer.", key: true },
    { code: "11.2.2.2", desc: "Üstel büyüme ve azalma problemlerini çözer." },
  ]},
  { match: "Diziler ve Seriler", kazanimlar: [
    { code: "11.3.1.1", desc: "Dizinin genel terimini ve özelliklerini belirler.", key: true },
    { code: "11.3.1.2", desc: "Aritmetik ve geometrik dizilerin genel terimini ve toplamını hesaplar.", key: true },
  ]},
  { match: "Aritmetik Dizi", kazanimlar: [
    { code: "11.3.2.1", desc: "Aritmetik dizinin genel terimini ve ilk n teriminin toplamını hesaplar.", key: true },
    { code: "11.3.2.2", desc: "Aritmetik dizi problemlerini çözer." },
  ]},
  { match: "Geometrik Dizi", kazanimlar: [
    { code: "11.3.3.1", desc: "Geometrik dizinin genel terimini ve ilk n teriminin toplamını hesaplar.", key: true },
    { code: "11.3.3.2", desc: "Geometrik dizi problemlerini çözer." },
  ]},
  { match: "Özel Tanımlı Dizi", kazanimlar: [
    { code: "11.3.4.1", desc: "Rekürans bağıntısıyla tanımlanan dizileri açıklar.", key: true },
    { code: "11.3.4.2", desc: "Fibonacci dizisi ve benzer dizileri açıklar." },
  ]},
  { match: "Seriler ve Yakınsak", kazanimlar: [
    { code: "12.1.1.1", desc: "Sonsuz serinin yakınsak/ıraksak olduğunu belirler.", key: true },
    { code: "12.1.1.2", desc: "Geometrik serinin toplamını hesaplar." },
  ]},
  { match: "Limit", exam: "AYT", kazanimlar: [
    { code: "12.2.1.1", desc: "Fonksiyonlarda limit kavramını açıklar.", key: true },
    { code: "12.2.1.2", desc: "Limit hesaplama kurallarını uygular.", key: true },
    { code: "12.2.1.3", desc: "Belirsizlik durumlarında limit hesaplar." },
  ]},
  { match: "Süreklilik", kazanimlar: [
    { code: "12.2.2.1", desc: "Bir noktada süreklilik kavramını açıklar.", key: true },
    { code: "12.2.2.2", desc: "Fonksiyonun sürekli olduğu aralıkları belirler." },
  ]},
  { match: "Türev", exam: "AYT", subject: "Matematik", kazanimlar: [
    { code: "12.3.1.1", desc: "Türev kavramını limit ile tanımlar.", key: true },
    { code: "12.3.1.2", desc: "Türev alma kurallarını (toplam, çarpım, bölüm, zincir) uygular.", key: true },
    { code: "12.3.1.3", desc: "Trigonometrik, üstel ve logaritmik fonksiyonların türevini alır." },
  ]},
  { match: "Türevin Uygulama", kazanimlar: [
    { code: "12.3.2.1", desc: "Fonksiyonun artan/azalan olduğu aralıkları türev ile belirler.", key: true },
    { code: "12.3.2.2", desc: "Maksimum ve minimum problemlerini türev ile çözer.", key: true },
  ]},
  { match: "Türevin Geometrik", kazanimlar: [
    { code: "12.3.3.1", desc: "Bir eğrinin teğet ve normal denklemlerini türev ile bulur.", key: true },
    { code: "12.3.3.2", desc: "Türevin geometrik yorumunu grafik üzerinde gösterir." },
  ]},
  { match: "Eğri Çizimi", kazanimlar: [
    { code: "12.3.4.1", desc: "Türev yardımıyla fonksiyon grafiğinin genel yapısını çizer.", key: true },
    { code: "12.3.4.2", desc: "Büküm noktalarını ve konkavlığı belirler." },
  ]},
  { match: "İntegral", exam: "AYT", subject: "Matematik", kazanimlar: [
    { code: "12.4.1.1", desc: "Belirsiz integral (ters türev) kavramını açıklar.", key: true },
    { code: "12.4.1.2", desc: "Temel integral alma kurallarını uygular.", key: true },
    { code: "12.4.2.1", desc: "Belirli integral kavramını açıklar ve hesaplar." },
  ]},
  { match: "Belirli İntegral", kazanimlar: [
    { code: "12.4.2.2", desc: "Belirli integralin özelliklerini kullanarak hesaplama yapar.", key: true },
    { code: "12.4.2.3", desc: "Analizin Temel Teoremini uygular." },
  ]},
  { match: "Belirsiz İntegral", kazanimlar: [
    { code: "12.4.1.3", desc: "Yerine koyma ve kısmi integral yöntemlerini uygular.", key: true },
    { code: "12.4.1.4", desc: "Trigonometrik ve üstel fonksiyonların integrallerini hesaplar." },
  ]},
  { match: "İntegral Uygulamaları (Alan)", kazanimlar: [
    { code: "12.4.3.1", desc: "İki eğri arasında kalan alanı integral ile hesaplar.", key: true },
    { code: "12.4.3.2", desc: "x ve y eksenine göre alan hesabı yapar." },
  ]},
  { match: "İntegral Uygulamaları (Hacim)", kazanimlar: [
    { code: "12.4.4.1", desc: "Dönel cisimlerin hacmini integral ile hesaplar.", key: true },
    { code: "12.4.4.2", desc: "Disk ve halka yöntemlerini uygular." },
  ]},
  { match: "Koşullu Olasılık", kazanimlar: [
    { code: "12.5.1.1", desc: "Koşullu olasılık kavramını açıklar ve hesaplar.", key: true },
    { code: "12.5.1.2", desc: "Bayes Teoremini uygular." },
  ]},
  { match: "Binom Dağılım", kazanimlar: [
    { code: "12.5.2.1", desc: "Binom dağılımını açıklar ve olasılık hesaplar.", key: true },
    { code: "12.5.2.2", desc: "Binom dağılımının beklenen değer ve varyansını hesaplar." },
  ]},
  { match: "Karmaşık Sayı", kazanimlar: [
    { code: "12.6.1.1", desc: "Karmaşık sayılarla dört işlem yapar.", key: true },
    { code: "12.6.1.2", desc: "Karmaşık sayıların kutupsal gösterimini açıklar." },
  ]},
  { match: "Matrisler", kazanimlar: [
    { code: "12.7.1.1", desc: "Matris kavramını açıklar ve matris işlemleri yapar.", key: true },
    { code: "12.7.1.2", desc: "Matris çarpımını hesaplar." },
  ]},
  { match: "Determinant", kazanimlar: [
    { code: "12.7.2.1", desc: "2x2 ve 3x3 matrislerin determinantını hesaplar.", key: true },
    { code: "12.7.2.2", desc: "Determinantın özelliklerini açıklar." },
  ]},
  { match: "Doğrusal Denklem Sistem", exam: "AYT", kazanimlar: [
    { code: "12.7.3.1", desc: "Doğrusal denklem sistemlerini matris yöntemiyle çözer.", key: true },
    { code: "12.7.3.2", desc: "Cramer kuralını uygular." },
  ]},
  { match: "Analitik Geometri - Doğru", kazanimlar: [
    { code: "11.4.1.1", desc: "Doğrunun eğimini ve denklemini belirler.", key: true },
    { code: "11.4.1.2", desc: "İki doğru arasındaki ilişkileri (paralellik, diklik) açıklar.", key: true },
    { code: "11.4.1.3", desc: "Noktanın doğruya uzaklığını hesaplar." },
  ]},
  { match: "Analitik Geometri - Çember", kazanimlar: [
    { code: "11.4.2.1", desc: "Çemberin standart ve genel denklemini yazar.", key: true },
    { code: "11.4.2.2", desc: "Doğru-çember ve çember-çember konumlarını belirler." },
  ]},
  { match: "Çember ve Daire", kazanimlar: [
    { code: "11.4.3.1", desc: "Çemberde açı, kiriş, teğet özelliklerini kullanır.", key: true },
    { code: "11.4.3.2", desc: "Dairenin alanını ve yay uzunluğunu hesaplar.", key: true },
    { code: "11.4.3.3", desc: "Çemberde güç kavramını açıklar." },
  ]},
  { match: "Elips-Hiperbol", kazanimlar: [
    { code: "12.8.1.1", desc: "Elipsin denklemini ve özelliklerini açıklar.", key: true },
    { code: "12.8.1.2", desc: "Hiperbolün denklemini ve özelliklerini açıklar." },
  ]},
  { match: "Uzay Geometri (Silindir", kazanimlar: [
    { code: "12.9.1.1", desc: "Silindir, koni ve kürenin alan ve hacim hesaplarını yapar.", key: true },
  ]},
  { match: "Parabol", exam: "AYT", kazanimlar: [
    { code: "11.4.4.1", desc: "Parabolün denklemini ve özelliklerini açıklar.", key: true },
    { code: "11.4.4.2", desc: "Parabol ile doğrunun kesim noktalarını bulur." },
  ]},
  { match: "Eşitsizlikler", exam: "AYT", kazanimlar: [
    { code: "11.5.1.1", desc: "İkinci dereceden eşitsizlikleri çözer.", key: true },
    { code: "11.5.1.2", desc: "Polinom eşitsizlikleri çözer." },
  ]},
  { match: "Mutlak Değer", exam: "AYT", kazanimlar: [
    { code: "11.5.2.1", desc: "Mutlak değer içeren fonksiyonların grafiklerini çizer.", key: true },
    { code: "11.5.2.2", desc: "İleri düzey mutlak değer denklem ve eşitsizliklerini çözer." },
  ]},
  { match: "Toplam-Çarpım Sembol", kazanimlar: [
    { code: "11.6.1.1", desc: "Toplam (Σ) ve çarpım (Π) sembollerini açıklar.", key: true },
    { code: "11.6.1.2", desc: "Toplam ve çarpım sembollerini kullanarak hesaplama yapar." },
  ]},
  { match: "Kombinatorik", kazanimlar: [
    { code: "12.5.3.1", desc: "İleri düzey sayma problemlerini çözer.", key: true },
    { code: "12.5.3.2", desc: "Binom açılımını ve Pascal üçgenini uygular." },
  ]},
  { match: "Polinomlar", exam: "AYT", subject: "Matematik", kazanimlar: [
    { code: "11.7.1.1", desc: "Polinomların çarpanlara ayrılmasını yapar.", key: true },
    { code: "11.7.1.2", desc: "Polinom bölmesi ve kalan teoremini uygular." },
  ]},
  { match: "Polinomların Çarpanlar", kazanimlar: [
    { code: "11.7.2.1", desc: "Polinomları çarpanlarına ayırır.", key: true },
    { code: "11.7.2.2", desc: "Katlı kökleri ve çarpan teoremini uygular." },
  ]},
  { match: "İkinci Dereceden Denklemler", exam: "AYT", kazanimlar: [
    { code: "11.7.3.1", desc: "Köklerin toplam ve çarpım ilişkilerini kullanır.", key: true },
    { code: "11.7.3.2", desc: "Parametrik denklemlerde köklerin doğasını belirler." },
  ]},
  { match: "Bileşke ve Ters Fonksiyon", exam: "AYT", kazanimlar: [
    { code: "11.8.1.1", desc: "İleri düzey bileşke fonksiyon problemlerini çözer.", key: true },
    { code: "11.8.1.2", desc: "Ters fonksiyonun türev ve integralini hesaplar." },
  ]},
  { match: "Mantık ve Kümeler", exam: "AYT", kazanimlar: [
    { code: "11.9.1.1", desc: "Önermeler mantığını küme işlemleriyle ilişkilendirir.", key: true },
    { code: "11.9.1.2", desc: "İleri düzey küme problemlerini çözer." },
  ]},
  { match: "Fonksiyonlar", exam: "AYT", subject: "Matematik", kazanimlar: [
    { code: "11.8.2.1", desc: "Parçalı ve işaret fonksiyonlarını açıklar.", key: true },
    { code: "11.8.2.2", desc: "Tam değer fonksiyonunu açıklar ve problemler çözer." },
    { code: "11.8.3.1", desc: "Fonksiyonların grafiksel dönüşümlerini uygular." },
  ]},
  { match: "Olasılık", exam: "AYT", subject: "Matematik", kazanimlar: [
    { code: "12.5.4.1", desc: "İleri düzey olasılık problemlerini çözer.", key: true },
    { code: "12.5.4.2", desc: "Bağımsız ve bağımlı olayların olasılığını hesaplar." },
  ]},

  // ============ TYT FEN BİLİMLERİ (Fizik) ============
  { match: "Fizik - Kuvvet ve Hareket", kazanimlar: [
    { code: "9.F.1.1", desc: "Kuvvet kavramını ve kuvvet çeşitlerini açıklar.", key: true },
    { code: "9.F.1.2", desc: "Kuvvetlerin bileşkesini bulur ve dengeyi açıklar." },
  ]},
  { match: "Fizik - Hareket", kazanimlar: [
    { code: "9.F.2.1", desc: "Düzgün doğrusal hareketi açıklar ve grafikleri çizer.", key: true },
    { code: "9.F.2.2", desc: "Düzgün ivmeli hareketi açıklar ve formülleri uygular.", key: true },
    { code: "9.F.2.3", desc: "Serbest düşme hareketini açıklar." },
  ]},
  { match: "Fizik - Enerji", kazanimlar: [
    { code: "9.F.3.1", desc: "İş, güç ve enerji kavramlarını açıklar.", key: true },
    { code: "9.F.3.2", desc: "Kinetik ve potansiyel enerji hesaplar.", key: true },
    { code: "9.F.3.3", desc: "Enerjinin korunumunu açıklar ve uygular." },
  ]},
  { match: "Fizik - Isı ve Sıcaklık", kazanimlar: [
    { code: "9.F.4.1", desc: "Sıcaklık ve ısı kavramlarını ayırt eder.", key: true },
    { code: "9.F.4.2", desc: "Isı alışverişi ve denge sıcaklığını hesaplar.", key: true },
    { code: "9.F.4.3", desc: "Hâl değişim grafiklerini yorumlar." },
  ]},
  { match: "Fizik - Elektrik", exam: "TYT", kazanimlar: [
    { code: "10.F.1.1", desc: "Elektrik yükü ve Coulomb yasasını açıklar.", key: true },
    { code: "10.F.1.2", desc: "Elektrik akımı, gerilim ve direnç kavramlarını açıklar." },
  ]},
  { match: "Fizik - Basınç", kazanimlar: [
    { code: "9.F.5.1", desc: "Katı basıncını hesaplar.", key: true },
    { code: "9.F.5.2", desc: "Sıvı basıncını ve Pascal ilkesini açıklar.", key: true },
    { code: "9.F.5.3", desc: "Atmosfer basıncını açıklar." },
  ]},
  { match: "Fizik - Optik", kazanimlar: [
    { code: "10.F.2.1", desc: "Işığın yansımasını ve kırılmasını açıklar.", key: true },
    { code: "10.F.2.2", desc: "Düzlem ve küresel aynalarda görüntü oluşumunu açıklar.", key: true },
    { code: "10.F.2.3", desc: "Merceklerde görüntü oluşumunu açıklar." },
  ]},
  { match: "Fizik - Dalga", kazanimlar: [
    { code: "10.F.3.1", desc: "Dalga kavramını ve dalga türlerini açıklar.", key: true },
    { code: "10.F.3.2", desc: "Dalga hızı, frekans ve dalga boyu ilişkisini açıklar." },
  ]},
  { match: "Fizik - Ses Dalga", kazanimlar: [
    { code: "10.F.3.3", desc: "Ses dalgalarının özelliklerini açıklar.", key: true },
    { code: "10.F.3.4", desc: "Rezonans ve Doppler olayını açıklar." },
  ]},
  { match: "Fizik - Newton", kazanimlar: [
    { code: "9.F.6.1", desc: "Newton'un hareket yasalarını açıklar.", key: true },
    { code: "9.F.6.2", desc: "Newton yasalarını problemlerde uygular.", key: true },
  ]},
  { match: "Fizik - İş-Güç-Enerji", kazanimlar: [
    { code: "9.F.7.1", desc: "İş kavramını tanımlar ve hesaplar.", key: true },
    { code: "9.F.7.2", desc: "Güç kavramını açıklar ve hesaplar." },
  ]},
  { match: "Fizik - Momentum", kazanimlar: [
    { code: "9.F.8.1", desc: "Momentum kavramını ve momentum korunumunu açıklar.", key: true },
    { code: "9.F.8.2", desc: "Çarpışma türlerini açıklar ve problemler çözer." },
  ]},
  { match: "Fizik - Elektrik Devre", kazanimlar: [
    { code: "10.F.4.1", desc: "Seri ve paralel bağlı devrelerde hesaplama yapar.", key: true },
    { code: "10.F.4.2", desc: "Kirchhoff yasalarını uygular." },
  ]},
  { match: "Fizik - Manyetizma", exam: "TYT", kazanimlar: [
    { code: "10.F.5.1", desc: "Manyetik alan ve mıknatıs özelliklerini açıklar.", key: true },
    { code: "10.F.5.2", desc: "Akım taşıyan iletkenin manyetik alanını açıklar." },
  ]},
  { match: "Fizik - Kaldırma", kazanimlar: [
    { code: "9.F.9.1", desc: "Kaldırma kuvvetini hesaplar.", key: true },
    { code: "9.F.9.2", desc: "Yüzme ve batma koşullarını açıklar." },
  ]},
  { match: "Dalgalar", exam: "TYT", kazanimlar: [
    { code: "10.F.3.5", desc: "Dalga türlerini sınıflandırır.", key: true },
    { code: "10.F.3.6", desc: "Dalga özelliklerini açıklar ve hesaplar." },
  ]},

  // ============ TYT FEN BİLİMLERİ (Kimya) ============
  { match: "Kimya - Atom ve Periyodik", kazanimlar: [
    { code: "9.K.1.1", desc: "Atom modellerinin tarihsel gelişimini açıklar.", key: true },
    { code: "9.K.1.2", desc: "Elektron dizilimlerini yapar ve periyodik özellikleri karşılaştırır.", key: true },
  ]},
  { match: "Kimya - Kimyasal Bağ", exam: "TYT", kazanimlar: [
    { code: "9.K.2.1", desc: "İyonik, kovalent ve metalik bağları açıklar.", key: true },
    { code: "9.K.2.2", desc: "Zayıf etkileşimleri (Van der Waals, hidrojen bağı) açıklar." },
  ]},
  { match: "Kimya - Madde ve Özellik", kazanimlar: [
    { code: "9.K.3.1", desc: "Maddenin hâllerini ve tanecik modelini açıklar.", key: true },
    { code: "9.K.3.2", desc: "Hâl değişimlerini enerji alışverişiyle açıklar." },
  ]},
  { match: "Kimya - Karışım", exam: "TYT", kazanimlar: [
    { code: "10.K.1.1", desc: "Homojen ve heterojen karışımları ayırt eder.", key: true },
    { code: "10.K.1.2", desc: "Çözünürlük kavramını ve etkileyen faktörleri açıklar.", key: true },
  ]},
  { match: "Kimya - Kimyasal Tepkime", exam: "TYT", kazanimlar: [
    { code: "10.K.2.1", desc: "Kimyasal tepkimeleri denkleştirir.", key: true },
    { code: "10.K.2.2", desc: "Tepkime türlerini sınıflandırır." },
  ]},
  { match: "Kimya - Asit-Baz", exam: "TYT", kazanimlar: [
    { code: "10.K.3.1", desc: "Asit ve baz tanımlarını açıklar.", key: true },
    { code: "10.K.3.2", desc: "pH kavramını açıklar ve hesaplar.", key: true },
  ]},
  { match: "Kimya - Mol Kavramı", exam: "TYT", kazanimlar: [
    { code: "10.K.4.1", desc: "Mol kavramını açıklar ve hesaplamalar yapar.", key: true },
    { code: "10.K.4.2", desc: "Avogadro sayısını ve mol-kütle ilişkisini kullanır." },
  ]},
  { match: "Kimya - Gazlar", exam: "TYT", kazanimlar: [
    { code: "9.K.4.1", desc: "İdeal gaz yasalarını uygular.", key: true },
    { code: "9.K.4.2", desc: "Gaz basıncını ve hacmini hesaplar." },
  ]},
  { match: "Kimya - Çözeltiler", exam: "TYT", kazanimlar: [
    { code: "10.K.5.1", desc: "Derişim hesapları (ppm, %, molarite) yapar.", key: true },
    { code: "10.K.5.2", desc: "Karışımları ayırma yöntemlerini açıklar." },
  ]},
  { match: "Kimya - Kimyasal Hesaplama", exam: "TYT", kazanimlar: [
    { code: "10.K.6.1", desc: "Kütlenin korunumu yasasını uygular.", key: true },
    { code: "10.K.6.2", desc: "Stokiyometrik hesaplamalar yapar." },
  ]},
  { match: "Kimya - Maddenin Hal", kazanimlar: [
    { code: "9.K.5.1", desc: "Katı, sıvı ve gaz hâllerinin özelliklerini açıklar.", key: true },
    { code: "9.K.5.2", desc: "Plazma hâlini açıklar." },
  ]},
  { match: "Kimya - Endotermik-Ekzotermik", kazanimlar: [
    { code: "10.K.7.1", desc: "Endotermik ve ekzotermik tepkimeleri açıklar.", key: true },
    { code: "10.K.7.2", desc: "Tepkime ısısını hesaplar." },
  ]},

  // ============ TYT FEN BİLİMLERİ (Biyoloji) ============
  { match: "Biyoloji - Hücre", exam: "TYT", kazanimlar: [
    { code: "9.B.1.1", desc: "Hücrenin yapısını ve organellerini açıklar.", key: true },
    { code: "9.B.1.2", desc: "Hücre zarı yapısını ve madde geçişlerini açıklar.", key: true },
  ]},
  { match: "Biyoloji - Hücre Zarından", kazanimlar: [
    { code: "9.B.2.1", desc: "Difüzyon, osmoz ve aktif taşımayı açıklar.", key: true },
    { code: "9.B.2.2", desc: "Endositoz ve ekzositoz olaylarını açıklar." },
  ]},
  { match: "Biyoloji - Canlıların Sınıf", kazanimlar: [
    { code: "9.B.3.1", desc: "Canlıların sınıflandırma ilkelerini açıklar.", key: true },
    { code: "9.B.3.2", desc: "Âlem kavramını ve virüslerin yapısını açıklar." },
  ]},
  { match: "Biyoloji - Kalıtım", exam: "TYT", kazanimlar: [
    { code: "10.B.1.1", desc: "Mendel'in kalıtım ilkelerini açıklar.", key: true },
    { code: "10.B.1.2", desc: "Monohibrit ve dihibrit çaprazlama yapar.", key: true },
  ]},
  { match: "Biyoloji - Ekosistem", kazanimlar: [
    { code: "10.B.2.1", desc: "Ekosistem bileşenlerini ve besin zincirini açıklar.", key: true },
    { code: "10.B.2.2", desc: "Madde döngülerini (karbon, azot, su) açıklar." },
  ]},
  { match: "Biyoloji - Mitoz-Mayoz", kazanimlar: [
    { code: "10.B.3.1", desc: "Mitozu ve evrelerini açıklar.", key: true },
    { code: "10.B.3.2", desc: "Mayozu ve evrelerini açıklar.", key: true },
  ]},
  { match: "Biyoloji - DNA ve RNA", kazanimlar: [
    { code: "10.B.4.1", desc: "DNA ve RNA'nın yapısını açıklar.", key: true },
    { code: "10.B.4.2", desc: "DNA replikasyonunu açıklar." },
  ]},
  { match: "Biyoloji - Protein Sentezi", exam: "TYT", kazanimlar: [
    { code: "10.B.5.1", desc: "Transkripsiyon ve translasyon süreçlerini açıklar.", key: true },
    { code: "10.B.5.2", desc: "Genetik kod kavramını açıklar." },
  ]},
  { match: "Biyoloji - Solunum", exam: "TYT", kazanimlar: [
    { code: "10.B.6.1", desc: "Solunum sisteminin yapısını açıklar.", key: true },
    { code: "10.B.6.2", desc: "Gaz değişimi mekanizmasını açıklar." },
  ]},
  { match: "Biyoloji - Fotosentez", exam: "TYT", kazanimlar: [
    { code: "10.B.7.1", desc: "Fotosentez tepkimelerini açıklar.", key: true },
    { code: "10.B.7.2", desc: "Fotosentezi etkileyen faktörleri açıklar." },
  ]},
  { match: "Biyoloji - Sindirim", exam: "TYT", kazanimlar: [
    { code: "10.B.8.1", desc: "Sindirim sisteminin yapısını ve işleyişini açıklar.", key: true },
    { code: "10.B.8.2", desc: "Mekanik ve kimyasal sindirim süreçlerini açıklar." },
  ]},
  { match: "Biyoloji - Dolaşım", exam: "TYT", kazanimlar: [
    { code: "10.B.9.1", desc: "Dolaşım sistemi yapısını ve kan dolaşımını açıklar.", key: true },
    { code: "10.B.9.2", desc: "Kanın yapısını ve görevlerini açıklar." },
  ]},
  { match: "Biyoloji - Boşaltım", exam: "TYT", kazanimlar: [
    { code: "10.B.10.1", desc: "Boşaltım sisteminin yapısını ve işleyişini açıklar.", key: true },
    { code: "10.B.10.2", desc: "Nefronun yapısını ve idrar oluşumunu açıklar." },
  ]},
  { match: "Biyoloji - Sinir", exam: "TYT", kazanimlar: [
    { code: "10.B.11.1", desc: "Sinir sistemi yapısını ve impuls iletimini açıklar.", key: true },
    { code: "10.B.11.2", desc: "Merkezi ve çevresel sinir sistemini açıklar." },
  ]},
  { match: "Biyoloji - Endokrin", exam: "TYT", kazanimlar: [
    { code: "10.B.12.1", desc: "Endokrin sistemi ve hormonları açıklar.", key: true },
    { code: "10.B.12.2", desc: "Hormonların geri bildirim mekanizmasını açıklar." },
  ]},
  { match: "Biyoloji - Destek ve Hareket", kazanimlar: [
    { code: "10.B.13.1", desc: "İskelet ve kas sisteminin yapısını açıklar.", key: true },
    { code: "10.B.13.2", desc: "Kas kasılma mekanizmasını açıklar." },
  ]},
  { match: "Biyoloji - Üreme", exam: "TYT", kazanimlar: [
    { code: "10.B.14.1", desc: "Üreme sistemi yapısını açıklar.", key: true },
    { code: "10.B.14.2", desc: "Eşeyli ve eşeysiz üreme yöntemlerini karşılaştırır." },
  ]},

  // ============ TYT TÜRKÇE ============
  { match: "Sözcükte Anlam", subject: "Türkçe", kazanimlar: [
    { code: "T.1.1", desc: "Sözcüğün gerçek, mecaz ve terim anlamlarını ayırt eder.", key: true },
    { code: "T.1.2", desc: "Eş anlamlı, zıt anlamlı ve yakın anlamlı sözcükleri belirler." },
  ]},
  { match: "Cümlede Anlam", kazanimlar: [
    { code: "T.2.1", desc: "Cümlenin anlamını ve cümle türlerini belirler.", key: true },
    { code: "T.2.2", desc: "Cümleler arası anlam ilişkilerini (neden-sonuç, karşılaştırma) açıklar." },
  ]},
  { match: "Paragraf", subject: "Türkçe", kazanimlar: [
    { code: "T.3.1", desc: "Paragrafın ana düşüncesini belirler.", key: true },
    { code: "T.3.2", desc: "Paragrafta yardımcı düşünceleri belirler." },
    { code: "T.3.3", desc: "Paragrafın yapısını (giriş-gelişme-sonuç) analiz eder." },
  ]},
  { match: "Ses Bilgisi", kazanimlar: [
    { code: "T.4.1", desc: "Ünlü ve ünsüz uyumlarını açıklar.", key: true },
    { code: "T.4.2", desc: "Ses olaylarını (yumuşama, sertleşme, daralma, düşme) açıklar." },
  ]},
  { match: "Yazım Kuralları", kazanimlar: [
    { code: "T.5.1", desc: "Yazım kurallarını doğru uygular.", key: true },
    { code: "T.5.2", desc: "Birleşik sözcüklerin yazımını açıklar." },
  ]},
  { match: "Noktalama İşaretleri", kazanimlar: [
    { code: "T.6.1", desc: "Noktalama işaretlerini doğru kullanır.", key: true },
    { code: "T.6.2", desc: "Virgül, noktalı virgül ve iki noktanın işlevlerini açıklar." },
  ]},
  { match: "Sözcük Türleri", kazanimlar: [
    { code: "T.7.1", desc: "Sözcük türlerini (isim, sıfat, zarf, fiil) ayırt eder.", key: true },
    { code: "T.7.2", desc: "Sözcüklerin cümledeki görevlerini belirler." },
  ]},
  { match: "Cümle Türleri", subject: "Türkçe", kazanimlar: [
    { code: "T.8.1", desc: "Cümle türlerini (yapısına, anlamına, yüklemine göre) sınıflandırır.", key: true },
    { code: "T.8.2", desc: "Basit, birleşik ve bağlı cümleleri ayırt eder." },
  ]},
  { match: "Cümlenin Ögeleri", kazanimlar: [
    { code: "T.9.1", desc: "Cümlenin ögelerini (özne, yüklem, nesne, tümleç) belirler.", key: true },
    { code: "T.9.2", desc: "Yardımcı ögelerin cümledeki işlevini açıklar." },
  ]},
  { match: "Anlatım Bozuklukları", kazanimlar: [
    { code: "T.10.1", desc: "Anlatım bozukluklarını tespit eder ve düzeltir.", key: true },
    { code: "T.10.2", desc: "Anlamsal ve yapısal anlatım bozukluklarını ayırt eder." },
  ]},
  { match: "Dil Bilgisi (Genel)", kazanimlar: [
    { code: "T.11.1", desc: "Dil bilgisi kurallarını genel olarak uygular.", key: true },
    { code: "T.11.2", desc: "Türkçenin yapısal özelliklerini açıklar." },
  ]},
  { match: "Fiilde Çatı", kazanimlar: [
    { code: "T.12.1", desc: "Fiil çatılarını (etken, edilgen, dönüşlü, işteş) açıklar.", key: true },
    { code: "T.12.2", desc: "Fiil çatısı ile anlam ilişkisini belirler." },
  ]},
  { match: "Fiil Kip", kazanimlar: [
    { code: "T.13.1", desc: "Haber ve dilek kiplerini açıklar.", key: true },
    { code: "T.13.2", desc: "Kipler arası anlam ilişkilerini belirler." },
  ]},
  { match: "Ek Fiil", kazanimlar: [
    { code: "T.14.1", desc: "Ek fiilin görevlerini ve kullanımını açıklar.", key: true },
    { code: "T.14.2", desc: "Ek fiil ile kurulan birleşik zamanları belirler." },
  ]},
  { match: "Sözcük Yapısı", kazanimlar: [
    { code: "T.15.1", desc: "Yapım ve çekim eklerini ayırt eder.", key: true },
    { code: "T.15.2", desc: "Sözcüklerin yapısına göre sınıflandırır (basit, türemiş, birleşik)." },
  ]},
  { match: "Sözcükte Çok Anlamlılık", kazanimlar: [
    { code: "T.16.1", desc: "Çok anlamlı sözcüklerin farklı anlamlarını bağlamdan belirler.", key: true },
    { code: "T.16.2", desc: "Sözcüğün temel ve yan anlamlarını ayırt eder." },
  ]},
  { match: "Mecaz ve Gerçek Anlam", kazanimlar: [
    { code: "T.17.1", desc: "Sözcüğün gerçek ve mecaz anlamını ayırt eder.", key: true },
    { code: "T.17.2", desc: "Mecaz anlamın oluşma sürecini açıklar." },
  ]},
  { match: "Deyimler ve Atasözleri", kazanimlar: [
    { code: "T.18.1", desc: "Deyimlerin anlamlarını açıklar ve cümlede kullanır.", key: true },
    { code: "T.18.2", desc: "Atasözlerinin öğretici yönünü açıklar." },
  ]},
  { match: "Parçada Anlam (Ana Düşünce)", kazanimlar: [
    { code: "T.19.1", desc: "Bir metinin ana düşüncesini belirler.", key: true },
    { code: "T.19.2", desc: "Ana düşünceyi destekleyen yardımcı düşünceleri bulur." },
  ]},
  { match: "Parçada Anlam (Yardımcı)", kazanimlar: [
    { code: "T.20.1", desc: "Bir metindeki yardımcı düşünceleri belirler.", key: true },
    { code: "T.20.2", desc: "Ana düşünce ile yardımcı düşünceler arasındaki ilişkiyi açıklar." },
  ]},
  { match: "Paragrafta Yapı", kazanimlar: [
    { code: "T.21.1", desc: "Paragrafın yapısal özelliklerini (giriş-gelişme-sonuç) belirler.", key: true },
    { code: "T.21.2", desc: "Paragrafta konu, bakış açısı ve anlatım biçimini belirler." },
  ]},
  { match: "Anlatım Türleri", kazanimlar: [
    { code: "T.22.1", desc: "Anlatım türlerini (öyküleyici, betimleyici, açıklayıcı) açıklar.", key: true },
    { code: "T.22.2", desc: "Metin türlerinin özelliklerini karşılaştırır." },
  ]},
  { match: "Metin Türleri", kazanimlar: [
    { code: "T.23.1", desc: "Yazılı metin türlerini (makale, deneme, fıkra, hikâye) ayırt eder.", key: true },
    { code: "T.23.2", desc: "Metin türlerinin yapısal özelliklerini belirler." },
  ]},
  { match: "Nesnel ve Öznel", kazanimlar: [
    { code: "T.24.1", desc: "Nesnel ve öznel yargıları ayırt eder.", key: true },
    { code: "T.24.2", desc: "Bir metinde nesnel ve öznel ifadeleri belirler." },
  ]},
  { match: "Ünsüz Yumuşa", kazanimlar: [
    { code: "T.25.1", desc: "Ünsüz yumuşamasını açıklar ve örneklendirir.", key: true },
    { code: "T.25.2", desc: "Ünsüz yumuşamasının istisnalarını belirler." },
  ]},
  { match: "Ünsüz Sertleş", kazanimlar: [
    { code: "T.26.1", desc: "Ünsüz sertleşmesini açıklar ve örneklendirir.", key: true },
    { code: "T.26.2", desc: "Ünsüz sertleşmesinin yazıma etkisini açıklar." },
  ]},
  { match: "Ünlü Daralma", kazanimlar: [
    { code: "T.27.1", desc: "Ünlü daralmasını açıklar ve örneklendirir.", key: true },
    { code: "T.27.2", desc: "Ünlü daralmasının hangi durumlarda gerçekleştiğini belirler." },
  ]},
  { match: "Ünlü Düşme", kazanimlar: [
    { code: "T.28.1", desc: "Ünlü düşmesini açıklar ve örneklendirir.", key: true },
    { code: "T.28.2", desc: "Ünlü düşmesinin yazıma etkisini açıklar." },
  ]},
  { match: "Kaynaştırma Ünsüz", kazanimlar: [
    { code: "T.29.1", desc: "Kaynaştırma ünsüzlerini açıklar.", key: true },
    { code: "T.29.2", desc: "Kaynaştırma ünsüzlerinin kullanım kurallarını uygular." },
  ]},
  { match: "Bağlaçlar", kazanimlar: [
    { code: "T.30.1", desc: "Bağlaçların türlerini ve işlevlerini açıklar.", key: true },
    { code: "T.30.2", desc: "Bağlaçların cümleye kattığı anlamı belirler." },
  ]},
  { match: "Edatlar", kazanimlar: [
    { code: "T.31.1", desc: "Edatların (ilgeçlerin) işlevlerini açıklar.", key: true },
    { code: "T.31.2", desc: "Edatların cümledeki anlam katkısını belirler." },
  ]},
  { match: "Zamirler", kazanimlar: [
    { code: "T.32.1", desc: "Zamir türlerini açıklar.", key: true },
    { code: "T.32.2", desc: "Zamirlerin isim yerine kullanım özelliklerini belirler." },
  ]},
  { match: "Birleşik Cümleler", kazanimlar: [
    { code: "T.33.1", desc: "Birleşik cümle türlerini açıklar.", key: true },
    { code: "T.33.2", desc: "Sıralı, bağlı ve girişik birleşik cümleleri ayırt eder." },
  ]},
  { match: "Fiilimsi", kazanimlar: [
    { code: "T.34.1", desc: "Fiilimsi türlerini (ortaç, ulaç, isim-fiil) açıklar.", key: true },
    { code: "T.34.2", desc: "Fiilimsilerin cümledeki görevlerini belirler." },
  ]},
  { match: "Deneme", subject: "Türkçe", kazanimlar: [
    { code: "T.35.1", desc: "Deneme türünün özelliklerini açıklar.", key: true },
    { code: "T.35.2", desc: "Deneme ile makale arasındaki farkları belirler." },
  ]},

  // ============ GENEL FALLBACK — subject-specific patterns ============

  // AYT Fizik
  { match: "Vektörler", subject: "Fizik", kazanimlar: [
    { code: "11.F.1.1", desc: "Vektörel büyüklükleri açıklar ve vektör işlemleri yapar.", key: true },
    { code: "11.F.1.2", desc: "Bileşke ve bileşen vektörleri hesaplar." },
  ]},
  { match: "Kuvvet-Denge", kazanimlar: [
    { code: "11.F.2.1", desc: "Kuvvet dengesi ve moment kavramını açıklar.", key: true },
    { code: "11.F.2.2", desc: "Denge problemlerini çözer.", key: true },
  ]},
  { match: "Tork", kazanimlar: [
    { code: "11.F.3.1", desc: "Tork kavramını açıklar ve hesaplar.", key: true },
    { code: "11.F.3.2", desc: "Dönel hareket ve açısal ivme kavramlarını açıklar." },
  ]},
  { match: "Elektrik Alan", kazanimlar: [
    { code: "11.F.4.1", desc: "Elektrik alan ve potansiyel kavramlarını açıklar.", key: true },
    { code: "11.F.4.2", desc: "Elektrik alan çizgilerini ve potansiyel farkını hesaplar." },
  ]},
  { match: "Manyetizma", exam: "AYT", kazanimlar: [
    { code: "11.F.5.1", desc: "Manyetik alan ve manyetik kuvveti açıklar.", key: true },
    { code: "11.F.5.2", desc: "Ampere ve Biot-Savart yasalarını uygular." },
  ]},
  { match: "İndüksiyon", kazanimlar: [
    { code: "11.F.6.1", desc: "Faraday'ın indüksiyon yasasını açıklar.", key: true },
    { code: "11.F.6.2", desc: "İndüksiyon EMK'sını hesaplar." },
  ]},
  { match: "Modern Fizik", kazanimlar: [
    { code: "12.F.1.1", desc: "Fotoelektrik olayı ve foton kavramını açıklar.", key: true },
    { code: "12.F.1.2", desc: "Bohr atom modelini ve enerji seviyeleri kavramını açıklar." },
  ]},
  { match: "Atom Fiziği", kazanimlar: [
    { code: "12.F.2.1", desc: "Atom modellerinin gelişimini açıklar.", key: true },
    { code: "12.F.2.2", desc: "Spektrum türlerini ve uygulamalarını açıklar." },
  ]},
  { match: "Dairesel Hareket", kazanimlar: [
    { code: "11.F.7.1", desc: "Çembersel hareket ve merkezcil kuvveti açıklar.", key: true },
    { code: "11.F.7.2", desc: "Açısal hız ve periyot hesaplar." },
  ]},
  { match: "Basit Harmonik", kazanimlar: [
    { code: "12.F.3.1", desc: "Basit harmonik hareketi açıklar.", key: true },
    { code: "12.F.3.2", desc: "Yay ve sarkaç periyodunu hesaplar." },
  ]},
  { match: "Dalgalar", exam: "AYT", subject: "Fizik", kazanimlar: [
    { code: "12.F.4.1", desc: "Mekanik dalga özelliklerini açıklar.", key: true },
    { code: "12.F.4.2", desc: "Elektromanyetik dalga spektrumunu açıklar." },
  ]},
  { match: "Elektrik Akımı", kazanimlar: [
    { code: "11.F.8.1", desc: "Elektrik akımını ve Ohm yasasını açıklar.", key: true },
    { code: "11.F.8.2", desc: "Seri ve paralel devrelerde hesaplama yapar." },
  ]},
  { match: "Kondansatör", kazanimlar: [
    { code: "11.F.9.1", desc: "Kondansatör kavramını ve sığa hesabını açıklar.", key: true },
    { code: "11.F.9.2", desc: "Seri ve paralel kondansatör bağlantılarını hesaplar." },
  ]},
  { match: "Alternatif Akım", kazanimlar: [
    { code: "12.F.5.1", desc: "Alternatif akımın özelliklerini açıklar.", key: true },
    { code: "12.F.5.2", desc: "AC devrelerde empedans ve rezonansı açıklar." },
  ]},
  { match: "Transformatör", kazanimlar: [
    { code: "12.F.6.1", desc: "Transformatörün çalışma ilkesini açıklar.", key: true },
    { code: "12.F.6.2", desc: "Gerilim ve akım dönüşümlerini hesaplar." },
  ]},
  { match: "Elektromanyetik Dalga", kazanimlar: [
    { code: "12.F.7.1", desc: "Elektromanyetik dalga kavramını açıklar.", key: true },
    { code: "12.F.7.2", desc: "Elektromanyetik spektrumu sınıflandırır." },
  ]},
  { match: "Işığın Kırılma", kazanimlar: [
    { code: "12.F.8.1", desc: "Snell yasasını açıklar ve uygular.", key: true },
    { code: "12.F.8.2", desc: "Tam yansıma olayını açıklar." },
  ]},
  { match: "Mercekler ve Aynalar", kazanimlar: [
    { code: "12.F.9.1", desc: "İnce merceklerde görüntü oluşumunu açıklar.", key: true },
    { code: "12.F.9.2", desc: "Ayna ve mercek denklemlerini uygular." },
  ]},
  { match: "Girişim ve Kırınım", kazanimlar: [
    { code: "12.F.10.1", desc: "Dalga girişimini ve Young deneyini açıklar.", key: true },
    { code: "12.F.10.2", desc: "Tek yarık kırınımını açıklar." },
  ]},
  { match: "Fotoelektrik", kazanimlar: [
    { code: "12.F.11.1", desc: "Fotoelektrik olayı ve Einstein eşitliğini açıklar.", key: true },
    { code: "12.F.11.2", desc: "Eşik frekansı ve kinetik enerji hesaplar." },
  ]},
  { match: "Compton", kazanimlar: [
    { code: "12.F.12.1", desc: "Compton saçılmasını açıklar.", key: true },
    { code: "12.F.12.2", desc: "Fotonun dalga-parçacık ikiliğini açıklar." },
  ]},
  { match: "Bohr Atom", kazanimlar: [
    { code: "12.F.13.1", desc: "Bohr atom modelini ve postülatlarını açıklar.", key: true },
    { code: "12.F.13.2", desc: "Hidrojen atomunun enerji seviyelerini hesaplar." },
  ]},
  { match: "Radyoaktivite", kazanimlar: [
    { code: "12.F.14.1", desc: "Radyoaktif bozunma türlerini açıklar.", key: true },
    { code: "12.F.14.2", desc: "Yarı ömür kavramını açıklar ve hesaplar." },
  ]},
  { match: "Özel Görelilik", kazanimlar: [
    { code: "12.F.15.1", desc: "Özel görelilik postülatlarını açıklar.", key: true },
    { code: "12.F.15.2", desc: "Zaman genleşmesi ve uzunluk kısalmasını açıklar." },
  ]},
  { match: "Kütle-Enerji Eşdeğer", kazanimlar: [
    { code: "12.F.16.1", desc: "E=mc² eşitliğini açıklar.", key: true },
    { code: "12.F.16.2", desc: "Nükleer enerji ve kütle kaybını hesaplar." },
  ]},
  { match: "Kepler", kazanimlar: [
    { code: "12.F.17.1", desc: "Kepler yasalarını açıklar.", key: true },
    { code: "12.F.17.2", desc: "Gezegen hareketlerini hesaplar." },
  ]},
  { match: "Açısal Momentum", kazanimlar: [
    { code: "11.F.10.1", desc: "Açısal momentum kavramını açıklar.", key: true },
    { code: "11.F.10.2", desc: "Açısal momentumun korunumunu uygular." },
  ]},
  { match: "Bağıl Hareket", kazanimlar: [
    { code: "11.F.11.1", desc: "Bağıl hareket kavramını açıklar.", key: true },
    { code: "11.F.11.2", desc: "Bağıl hız hesaplamalarını yapar." },
  ]},
  { match: "Newton", exam: "AYT", kazanimlar: [
    { code: "11.F.12.1", desc: "Newton'un hareket ve kütle çekim yasalarını ileri düzeyde uygular.", key: true },
    { code: "11.F.12.2", desc: "Atwood makinesi ve eğik düzlem problemlerini çözer." },
  ]},
  { match: "Dalga Mekaniği", kazanimlar: [
    { code: "12.F.18.1", desc: "Dalga mekaniğinin temel kavramlarını açıklar.", key: true },
    { code: "12.F.18.2", desc: "Rezonans ve dalga girişimini ileri düzeyde inceler." },
  ]},

  // AYT Kimya
  { match: "Mol Kavramı", exam: "AYT", kazanimlar: [
    { code: "11.K.1.1", desc: "Mol kavramını ileri düzeyde açıklar.", key: true },
    { code: "11.K.1.2", desc: "Stokiyometrik hesaplamalar yapar." },
  ]},
  { match: "Kimyasal Hesaplama", exam: "AYT", kazanimlar: [
    { code: "11.K.2.1", desc: "Tepkime hesaplamalarını (verim, sınırlayıcı bileşen) yapar.", key: true },
    { code: "11.K.2.2", desc: "Karışım ve çözelti hesaplamalarını ileri düzeyde yapar." },
  ]},
  { match: "Gazlar", exam: "AYT", kazanimlar: [
    { code: "11.K.3.1", desc: "İdeal gaz yasalarını uygular.", key: true },
    { code: "11.K.3.2", desc: "Graham, Dalton ve kinetik gaz yasalarını açıklar." },
  ]},
  { match: "Kimyasal Denge", exam: "AYT", kazanimlar: [
    { code: "11.K.4.1", desc: "Kimyasal denge kavramını ve Le Chatelier ilkesini açıklar.", key: true },
    { code: "11.K.4.2", desc: "Denge sabiti hesabı (Kc, Kp) yapar.", key: true },
  ]},
  { match: "Tepkime Hızı", kazanimlar: [
    { code: "11.K.5.1", desc: "Tepkime hızı kavramını açıklar.", key: true },
    { code: "11.K.5.2", desc: "Hızı etkileyen faktörleri belirler." },
  ]},
  { match: "Aktivasyon Enerjisi", kazanimlar: [
    { code: "11.K.5.3", desc: "Aktivasyon enerjisi ve katalizör etkisini açıklar.", key: true },
    { code: "11.K.5.4", desc: "Enerji diyagramlarını yorumlar." },
  ]},
  { match: "Tepkime Mekanizma", kazanimlar: [
    { code: "11.K.5.5", desc: "Tepkime mekanizmasını ve ara ürünleri açıklar.", key: true },
    { code: "11.K.5.6", desc: "Hız denklemi ve mertebe kavramını açıklar." },
  ]},
  { match: "Çözeltiler", exam: "AYT", kazanimlar: [
    { code: "11.K.6.1", desc: "Çözünürlüğü etkileyen faktörleri açıklar.", key: true },
    { code: "11.K.6.2", desc: "Koligatif özellikleri açıklar." },
  ]},
  { match: "Elektrokimya", kazanimlar: [
    { code: "11.K.7.1", desc: "Elektrokimyasal pil kavramını açıklar.", key: true },
    { code: "11.K.7.2", desc: "Standart elektrot potansiyellerini kullanır." },
  ]},
  { match: "Organik Kimya", kazanimlar: [
    { code: "12.K.1.1", desc: "Karbon atomunun bağ yapma özelliğini açıklar.", key: true },
    { code: "12.K.1.2", desc: "Hidrokarbonları sınıflandırır." },
  ]},
  { match: "Asitler ve Bazlar", exam: "AYT", kazanimlar: [
    { code: "11.K.8.1", desc: "Kuvvetli ve zayıf asit-bazları ayırt eder.", key: true },
    { code: "11.K.8.2", desc: "pH hesaplamalarını ileri düzeyde yapar." },
  ]},

  // ============ TYT SOSYAL BİLİMLER ============
  // Tarih konuları
  { match: "Tarih - İlk Uygarlık", kazanimlar: [
    { code: "9.T.1.1", desc: "İlk uygarlıkları (Mezopotamya, Mısır, Anadolu) tanır.", key: true },
    { code: "9.T.1.2", desc: "Yazının icadının tarihsel önemini değerlendirir." },
  ]},
  { match: "Tarih - İslam Tarihi", kazanimlar: [
    { code: "9.T.2.1", desc: "Hz. Muhammed dönemini ve İslamiyet'in yayılışını açıklar.", key: true },
    { code: "9.T.2.2", desc: "Dört Halife dönemini açıklar." },
  ]},
  { match: "Tarih - Türk-İslam", kazanimlar: [
    { code: "9.T.3.1", desc: "Büyük Selçuklu Devleti'ni açıklar.", key: true },
    { code: "9.T.3.2", desc: "Anadolu Selçuklu Devleti ve beylikler dönemini açıklar." },
  ]},
  { match: "Tarih - Osmanlı Kuruluş", kazanimlar: [
    { code: "10.T.1.1", desc: "Osmanlı Devleti'nin kuruluş sürecini açıklar.", key: true },
    { code: "10.T.1.2", desc: "Kuruluş dönemi padişahlarını ve önemli olayları açıklar." },
  ]},
  { match: "Tarih - Osmanlı Yükselme", kazanimlar: [
    { code: "10.T.2.1", desc: "Yükselme dönemi fetihlerini açıklar.", key: true },
    { code: "10.T.2.2", desc: "Osmanlı'nın dünya gücü olma sürecini değerlendirir." },
  ]},
  { match: "Tarih - Osmanlı Duraklama", exam: "TYT", kazanimlar: [
    { code: "10.T.3.1", desc: "Osmanlı'nın duraklama nedenlerini açıklar.", key: true },
    { code: "10.T.3.2", desc: "Duraklama dönemi ıslahat hareketlerini açıklar." },
  ]},
  { match: "Tarih - Osmanlı Gerileme", kazanimlar: [
    { code: "10.T.4.1", desc: "Osmanlı gerileme dönemini açıklar.", key: true },
    { code: "10.T.4.2", desc: "III. Selim ve II. Mahmut reformlarını açıklar." },
  ]},
  { match: "Tarih - Kurtuluş Savaşı", exam: "TYT", kazanimlar: [
    { code: "10.T.5.1", desc: "Milli Mücadele'nin örgütlenme sürecini açıklar.", key: true },
    { code: "10.T.5.2", desc: "Kurtuluş Savaşı cephelerini ve muharebelerini açıklar." },
  ]},
  { match: "Tarih - İnkılap", kazanimlar: [
    { code: "10.T.6.1", desc: "Cumhuriyetin ilanını ve inkılapları açıklar.", key: true },
    { code: "10.T.6.2", desc: "Hukuk, eğitim ve toplumsal inkılapları açıklar." },
  ]},
  { match: "Tarih - Atatürk İlkeleri", exam: "TYT", kazanimlar: [
    { code: "10.T.7.1", desc: "Atatürk ilkelerini (altı ok) açıklar.", key: true },
    { code: "10.T.7.2", desc: "Atatürk ilkelerinin uygulamalarını açıklar." },
  ]},
  { match: "Tarih - İlk Türk Devlet", kazanimlar: [
    { code: "9.T.4.1", desc: "Göktürk ve Uygur devletlerini açıklar.", key: true },
    { code: "9.T.4.2", desc: "Orta Asya Türk kültürünü açıklar." },
  ]},
  { match: "Tarih - Selçuklular", kazanimlar: [
    { code: "9.T.5.1", desc: "Büyük Selçuklu Devleti'nin kuruluşunu ve yıkılışını açıklar.", key: true },
    { code: "9.T.5.2", desc: "Malazgirt Savaşı'nın Anadolu'nun Türkleşmesindeki rolünü açıklar." },
  ]},
  { match: "Tarih - Haçlı", kazanimlar: [
    { code: "9.T.6.1", desc: "Haçlı Seferlerinin nedenlerini ve sonuçlarını açıklar.", key: true },
    { code: "9.T.6.2", desc: "Haçlı Seferlerinin Doğu-Batı etkileşimine katkısını değerlendirir." },
  ]},
  { match: "Tarih - Tanzimat ve Meşrutiyet", exam: "TYT", kazanimlar: [
    { code: "10.T.8.1", desc: "Tanzimat ve Islahat Fermanlarını açıklar.", key: true },
    { code: "10.T.8.2", desc: "I. ve II. Meşrutiyet dönemlerini açıklar." },
  ]},
  { match: "Tarih - I. Dünya", exam: "TYT", kazanimlar: [
    { code: "10.T.9.1", desc: "I. Dünya Savaşı'nın nedenlerini açıklar.", key: true },
    { code: "10.T.9.2", desc: "Osmanlı'nın savaştaki cephelerini açıklar." },
  ]},
  { match: "Tarih - Mondros", exam: "TYT", kazanimlar: [
    { code: "10.T.10.1", desc: "Mondros Mütarekesi ve Sevr Antlaşmasını açıklar.", key: true },
    { code: "10.T.10.2", desc: "İşgallerin başlamasını ve milli direniş hareketlerini açıklar." },
  ]},

  // Coğrafya
  { match: "Coğrafya - Doğa ve İnsan", kazanimlar: [
    { code: "9.C.1.1", desc: "Coğrafi konum türlerini açıklar.", key: true },
    { code: "9.C.1.2", desc: "Dünya'nın hareketlerini ve sonuçlarını açıklar." },
  ]},
  { match: "Coğrafya - Harita Bilgi", kazanimlar: [
    { code: "9.C.2.1", desc: "Harita çeşitlerini ve ölçek kavramını açıklar.", key: true },
    { code: "9.C.2.2", desc: "İzohips haritalarını okur ve yorumlar." },
  ]},
  { match: "Coğrafya - İklim", exam: "TYT", kazanimlar: [
    { code: "9.C.3.1", desc: "İklim elemanlarını açıklar.", key: true },
    { code: "9.C.3.2", desc: "Türkiye'nin iklim özelliklerini açıklar." },
  ]},
  { match: "Coğrafya - Beşeri", kazanimlar: [
    { code: "10.C.1.1", desc: "Nüfus ve yerleşme kavramlarını açıklar.", key: true },
    { code: "10.C.1.2", desc: "Göç türlerini ve nedenlerini açıklar." },
  ]},
  { match: "Coğrafya - Dünya", kazanimlar: [
    { code: "9.C.4.1", desc: "Dünya'nın fiziksel coğrafya özelliklerini açıklar.", key: true },
    { code: "9.C.4.2", desc: "Kıtaların coğrafi özelliklerini karşılaştırır." },
  ]},
  { match: "Coğrafya - Türkiye", exam: "TYT", kazanimlar: [
    { code: "10.C.2.1", desc: "Türkiye'nin yer şekillerini açıklar.", key: true },
    { code: "10.C.2.2", desc: "Türkiye'nin bölgelerine göre coğrafi özelliklerini açıklar." },
  ]},
  { match: "Coğrafya - Yerin Şekillen", kazanimlar: [
    { code: "10.C.3.1", desc: "İç kuvvetleri (tektonizma, volkanizma, deprem) açıklar.", key: true },
    { code: "10.C.3.2", desc: "Dış kuvvetleri (akarsu, rüzgâr, buzul, dalga) açıklar." },
  ]},
  { match: "Coğrafya - Su Kaynak", kazanimlar: [
    { code: "10.C.4.1", desc: "Akarsu ve göl türlerini açıklar.", key: true },
    { code: "10.C.4.2", desc: "Yeraltı suları ve kaynakları açıklar." },
  ]},
  { match: "Coğrafya - Toprak ve Bitki", kazanimlar: [
    { code: "10.C.5.1", desc: "Toprak türlerini ve oluşumunu açıklar.", key: true },
    { code: "10.C.5.2", desc: "Bitki örtüsü ile iklim ilişkisini açıklar." },
  ]},
  { match: "Coğrafya - Nüfus", exam: "TYT", kazanimlar: [
    { code: "10.C.6.1", desc: "Nüfusun dağılışını etkileyen faktörleri açıklar.", key: true },
    { code: "10.C.6.2", desc: "Nüfus piramitlerini yorumlar." },
  ]},
  { match: "Coğrafya - Yerleşme", kazanimlar: [
    { code: "10.C.7.1", desc: "Kır ve kent yerleşmelerini karşılaştırır.", key: true },
    { code: "10.C.7.2", desc: "Yerleşmeyi etkileyen faktörleri açıklar." },
  ]},
  { match: "Coğrafya - Göç", kazanimlar: [
    { code: "10.C.8.1", desc: "Göç türlerini ve nedenlerini açıklar.", key: true },
    { code: "10.C.8.2", desc: "Göçün toplumsal etkilerini değerlendirir." },
  ]},
  { match: "Coğrafya - Ekonomik Faal", kazanimlar: [
    { code: "10.C.9.1", desc: "Tarım, sanayi ve hizmet sektörlerini açıklar.", key: true },
    { code: "10.C.9.2", desc: "Ekonomik faaliyetlerin dağılışını açıklar." },
  ]},
  { match: "Coğrafya - Ulaşım ve Ticaret", kazanimlar: [
    { code: "10.C.10.1", desc: "Ulaşım türlerini ve gelişimini açıklar.", key: true },
    { code: "10.C.10.2", desc: "İç ve dış ticareti etkileyen faktörleri açıklar." },
  ]},

  // Felsefe
  { match: "Felsefe - Sanat", kazanimlar: [
    { code: "10.Fl.1.1", desc: "Sanat felsefesinin konusunu ve kavramlarını açıklar.", key: true },
    { code: "10.Fl.1.2", desc: "Güzellik ve estetik kavramlarını tartışır." },
  ]},
  { match: "Felsefe - Din", kazanimlar: [
    { code: "10.Fl.2.1", desc: "Din felsefesinin konusunu ve problemlerini açıklar.", key: true },
    { code: "10.Fl.2.2", desc: "İnanç ve akıl ilişkisini tartışır." },
  ]},
  { match: "Felsefe - Siyaset", kazanimlar: [
    { code: "10.Fl.3.1", desc: "Siyaset felsefesinin temel kavramlarını açıklar.", key: true },
    { code: "10.Fl.3.2", desc: "İdeal devlet anlayışlarını karşılaştırır." },
  ]},
  { match: "Din Kültürü - İslam ve İbadet", kazanimlar: [
    { code: "9.D.1.1", desc: "İslam'ın ibadet esaslarını açıklar.", key: true },
    { code: "9.D.1.2", desc: "İbadetlerin bireysel ve toplumsal faydalarını açıklar." },
  ]},
  { match: "Din Kültürü - Ahlak ve Değer", kazanimlar: [
    { code: "10.D.1.1", desc: "İslam ahlakının temel ilkelerini açıklar.", key: true },
    { code: "10.D.1.2", desc: "Ahlaki değerlerin toplumsal önemini açıklar." },
  ]},
];

// =============================================================================
// FALLBACK: Generic kazanım generator for unmatched topics
// =============================================================================

function generateFallbackKazanimlar(topicName: string, examType: string, subjectName: string): KDef[] {
  const cleanName = topicName.replace(/\(.*?\)/g, "").trim();
  const prefix = examType === "TYT" ? "9" : "12";
  return [
    { code: `${prefix}.G.1.1`, desc: `${cleanName} konusunun temel kavramlarını açıklar.`, key: true },
    { code: `${prefix}.G.1.2`, desc: `${cleanName} konusundaki problemleri çözer.` },
  ];
}

// =============================================================================
// MATCHING
// =============================================================================

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/İ/g, "i").replace(/ı/g, "i")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g");
}

function findKazanimlar(
  topicName: string,
  examTypeName: string,
  subjectName: string
): KDef[] {
  const normTopic = normalize(topicName);
  const normSubject = normalize(subjectName);

  for (const mapping of MAPPINGS) {
    const normMatch = normalize(mapping.match);

    // Check match
    if (!normTopic.includes(normMatch)) continue;

    // Check exam type filter
    if (mapping.exam && mapping.exam !== "*" && mapping.exam !== examTypeName) continue;

    // Check subject filter
    if (mapping.subject && !normSubject.includes(normalize(mapping.subject))) continue;

    return mapping.kazanimlar;
  }

  // No match found — generate fallback
  return generateFallbackKazanimlar(topicName, examTypeName, subjectName);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log("🔄 Kazanım Redistribution Script başlıyor...\n");

  // 1. Delete all existing TopicKazanim and KazanimProgress
  const deletedProgress = await prisma.kazanimProgress.deleteMany({});
  console.log(`🗑️  ${deletedProgress.count} KazanimProgress silindi.`);

  const deleted = await prisma.topicKazanim.deleteMany({});
  console.log(`🗑️  ${deleted.count} TopicKazanim silindi.\n`);

  // 2. Get all topics
  const topics = await prisma.topic.findMany({
    include: {
      subject: {
        select: { name: true, examType: { select: { name: true } } },
      },
    },
    orderBy: [
      { subject: { examType: { name: "asc" } } },
      { subject: { name: "asc" } },
      { sortOrder: "asc" },
    ],
  });

  console.log(`📚 ${topics.length} topic bulundu.\n`);

  let totalCreated = 0;
  let matchedCount = 0;
  let fallbackCount = 0;

  // 3. For each topic, find and create kazanımlar
  for (const topic of topics) {
    const examTypeName = topic.subject.examType.name;
    const subjectName = topic.subject.name;

    const kazDefs = findKazanimlar(topic.name, examTypeName, subjectName);

    for (let i = 0; i < kazDefs.length; i++) {
      const k = kazDefs[i];
      await prisma.topicKazanim.create({
        data: {
          topicId: topic.id,
          code: k.code,
          description: k.desc,
          subTopicName: k.sub || null,
          details: k.details || null,
          isKeyKazanim: k.key || false,
          sortOrder: i + 1,
        },
      });
      totalCreated++;
    }

    // Check if it was a match or fallback
    const isFallback = kazDefs.length === 2 && kazDefs[0].code.includes(".G.");
    if (isFallback) {
      fallbackCount++;
    } else {
      matchedCount++;
    }

    console.log(
      `  ${isFallback ? "📝" : "✅"} ${examTypeName} > ${subjectName} > ${topic.name} → ${kazDefs.length} kazanım`
    );
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🎉 Redistribution tamamlandı!`);
  console.log(`   📊 Toplam kazanım: ${totalCreated}`);
  console.log(`   ✅ Eşleşen topic: ${matchedCount}`);
  console.log(`   📝 Fallback topic: ${fallbackCount}`);
  console.log(`   📚 Toplam topic: ${topics.length}`);
  console.log("=".repeat(60));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
