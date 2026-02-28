import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==================== TYPES ====================

interface KazanimData {
  code: string;
  subTopicName?: string;
  description: string;
  details?: string;
  isKeyKazanim?: boolean;
}

interface TopicData {
  topicName: string;
  sortOrder: number;
  kazanimlar: KazanimData[];
}

interface SubjectData {
  [topicKey: string]: TopicData;
}

// Structure: CURRICULUM[examType][subjectName] = SubjectData
const CURRICULUM: Record<string, Record<string, SubjectData>> = {};

// ==================== HELPER: Add to curriculum ====================

function addTopic(
  examType: string,
  subjectName: string,
  topicKey: string,
  topicName: string,
  sortOrder: number,
  kazanimlar: KazanimData[]
) {
  if (!CURRICULUM[examType]) CURRICULUM[examType] = {};
  if (!CURRICULUM[examType][subjectName]) CURRICULUM[examType][subjectName] = {};
  CURRICULUM[examType][subjectName][topicKey] = { topicName, sortOrder, kazanimlar };
}

// ============================================================
//  MATEMATİK — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Matematik", "mantik", "Mantık", 1, [
  { code: "9.1.1.1", description: "Önermeyi ve doğruluk değerini açıklar.", isKeyKazanim: true },
  { code: "9.1.1.2", description: "Bileşik önerme kurar; doğruluk tablosu oluşturur.", details: "De Morgan yasaları dahil." },
  { code: "9.1.1.3", description: "Koşullu ve iki koşullu önermeleri açıklar." },
  { code: "9.1.1.4", description: "Niceleyicileri (∀, ∃) kullanır." },
  { code: "9.1.1.5", description: "Tanım, aksiyom, teorem ve ispat kavramlarını açıklar." },
]);

addTopic("TYT", "Matematik", "kumeler", "Kümeler", 2, [
  { code: "9.2.1.1", subTopicName: "Kümelerde Temel Kavramlar", description: "Küme, eleman, alt küme gibi temel kavramları açıklar.", isKeyKazanim: true },
  { code: "9.2.1.2", subTopicName: "Kümelerde Temel Kavramlar", description: "Alt küme kavramını ve alt küme sayısını belirler." },
  { code: "9.2.1.3", subTopicName: "Kümelerde Temel Kavramlar", description: "Küme eşitliğini açıklar." },
  { code: "9.2.2.1", subTopicName: "Kümelerde İşlemler", description: "Birleşim, kesişim, fark ve tümleme işlemlerini yapar.", isKeyKazanim: true },
  { code: "9.2.2.2", subTopicName: "Kümelerde İşlemler", description: "Kartezyen çarpımı açıklar ve uygular." },
]);

addTopic("TYT", "Matematik", "denklemler_esitsizlikler", "Denklemler ve Eşitsizlikler", 3, [
  { code: "9.3.1.1", subTopicName: "Sayı Kümeleri", description: "Doğal, tam, rasyonel, irrasyonel ve reel sayı kümelerini ilişkilendirir.", isKeyKazanim: true },
  { code: "9.3.2.1", subTopicName: "Bölünebilme", description: "Bölünebilme kurallarını uygular." },
  { code: "9.3.2.2", subTopicName: "Bölünebilme", description: "EBOB ve EKOK hesaplar.", isKeyKazanim: true },
  { code: "9.3.2.3", subTopicName: "Bölünebilme", description: "Periyodik durumları çözümler." },
  { code: "9.3.3.1", subTopicName: "Birinci Dereceden Denklemler", description: "Aralık kavramını açıklar." },
  { code: "9.3.3.2", subTopicName: "Birinci Dereceden Denklemler", description: "Birinci dereceden denklem ve eşitsizlikleri çözer.", isKeyKazanim: true },
  { code: "9.3.3.3", subTopicName: "Birinci Dereceden Denklemler", description: "Mutlak değer içeren denklem ve eşitsizlikleri çözer." },
  { code: "9.3.3.4", subTopicName: "Birinci Dereceden Denklemler", description: "İki bilinmeyenli doğrusal denklem sistemlerini çözer." },
  { code: "9.3.4.1", subTopicName: "Üslü İfadeler", description: "Üslü ifadeler içeren denklemleri çözer.", isKeyKazanim: true },
  { code: "9.3.4.2", subTopicName: "Üslü İfadeler", description: "Köklü ifadeler içeren denklemleri çözer." },
  { code: "9.3.5.1", subTopicName: "Oran-Orantı ve Uygulamalar", description: "Oran ve orantı kavramlarını açıklar ve uygular." },
  { code: "9.3.5.2", subTopicName: "Oran-Orantı ve Uygulamalar", description: "Oran-orantı ile ilgili problemleri çözer.", isKeyKazanim: true },
]);

addTopic("TYT", "Matematik", "ucgenler", "Üçgenler", 4, [
  { code: "9.4.1.1", subTopicName: "Temel Kavramlar", description: "Üçgenin iç ve dış açı özelliklerini kullanır.", isKeyKazanim: true },
  { code: "9.4.1.2", subTopicName: "Temel Kavramlar", description: "Üçgenlerde kenar-açı ilişkisini belirler." },
  { code: "9.4.1.3", subTopicName: "Temel Kavramlar", description: "Üçgen eşitsizliğini uygular." },
  { code: "9.4.2.1", subTopicName: "Eşlik ve Benzerlik", description: "Üçgenlerin eşlik koşullarını belirler." },
  { code: "9.4.2.2", subTopicName: "Eşlik ve Benzerlik", description: "Üçgenlerin benzerlik koşullarını belirler.", isKeyKazanim: true },
  { code: "9.4.2.3", subTopicName: "Eşlik ve Benzerlik", description: "Paralel kesen teoremleriyle oran hesaplar." },
  { code: "9.4.2.4", subTopicName: "Eşlik ve Benzerlik", description: "Benzerlik ile ilgili problemleri çözer." },
  { code: "9.4.3.1", subTopicName: "Yardımcı Elemanlar", description: "Açıortay özelliklerini kullanır." },
  { code: "9.4.3.2", subTopicName: "Yardımcı Elemanlar", description: "Kenarortay özelliklerini kullanır.", isKeyKazanim: true },
  { code: "9.4.3.3", subTopicName: "Yardımcı Elemanlar", description: "Kenar orta dikme özelliklerini kullanır." },
  { code: "9.4.3.4", subTopicName: "Yardımcı Elemanlar", description: "Yükseklik özelliklerini kullanır." },
  { code: "9.4.4.1", subTopicName: "Dik Üçgen ve Trigonometri", description: "Pisagor teoremini uygular.", isKeyKazanim: true },
  { code: "9.4.4.2", subTopicName: "Dik Üçgen ve Trigonometri", description: "Öklid teoremini uygular." },
  { code: "9.4.4.3", subTopicName: "Dik Üçgen ve Trigonometri", description: "Trigonometrik oranları hesaplar.", isKeyKazanim: true },
  { code: "9.4.4.4", subTopicName: "Dik Üçgen ve Trigonometri", description: "Birim çemberde trigonometrik oranları gösterir." },
  { code: "9.4.5.1", subTopicName: "Üçgenin Alanı", description: "Üçgenin alanını hesaplar.", isKeyKazanim: true },
]);

addTopic("TYT", "Matematik", "veri", "Veri", 5, [
  { code: "9.5.1.1", subTopicName: "Merkezî Eğilim", description: "Ortalama, medyan, mod ve standart sapma hesaplar.", isKeyKazanim: true },
  { code: "9.5.2.1", subTopicName: "Grafikle Gösterim", description: "Histogram oluşturur ve yorumlar." },
  { code: "9.5.2.2", subTopicName: "Grafikle Gösterim", description: "Çeşitli grafik türlerini yorumlar." },
]);

addTopic("TYT", "Matematik", "sayma_olasilik", "Sayma ve Olasılık", 6, [
  { code: "10.1.1.1", subTopicName: "Sıralama ve Seçme", description: "Toplama ve çarpma sayma yöntemlerini uygular." },
  { code: "10.1.1.2", subTopicName: "Sıralama ve Seçme", description: "Permütasyon hesaplar.", isKeyKazanim: true },
  { code: "10.1.1.3", subTopicName: "Sıralama ve Seçme", description: "Tekrarlı permütasyon hesaplar." },
  { code: "10.1.1.4", subTopicName: "Sıralama ve Seçme", description: "Kombinasyon hesaplar.", isKeyKazanim: true },
  { code: "10.1.1.5", subTopicName: "Sıralama ve Seçme", description: "Pascal üçgenini açıklar." },
  { code: "10.1.1.6", subTopicName: "Sıralama ve Seçme", description: "Binom açılımını uygular." },
  { code: "10.1.2.1", subTopicName: "Basit Olasılık", description: "Örnek uzay ve olay kavramlarını açıklar." },
  { code: "10.1.2.2", subTopicName: "Basit Olasılık", description: "Olasılık hesaplamaları yapar.", isKeyKazanim: true },
]);

addTopic("TYT", "Matematik", "fonksiyonlar", "Fonksiyonlar", 7, [
  { code: "10.2.1.1", subTopicName: "Fonksiyon Kavramı", description: "Fonksiyon ile ilgili problemleri çözer.", isKeyKazanim: true },
  { code: "10.2.1.2", subTopicName: "Fonksiyon Kavramı", description: "Fonksiyonların grafiğini çizer." },
  { code: "10.2.1.3", subTopicName: "Fonksiyon Kavramı", description: "Fonksiyon grafiklerini yorumlar.", isKeyKazanim: true },
  { code: "10.2.1.4", subTopicName: "Fonksiyon Kavramı", description: "Doğrusal fonksiyonları açıklar." },
  { code: "10.2.2.1", subTopicName: "Bileşke ve Ters", description: "Bire bir ve örten fonksiyonları belirler." },
  { code: "10.2.2.2", subTopicName: "Bileşke ve Ters", description: "Bileşke fonksiyonu hesaplar.", isKeyKazanim: true },
  { code: "10.2.2.3", subTopicName: "Bileşke ve Ters", description: "Ters fonksiyonu bulur." },
]);

addTopic("TYT", "Matematik", "polinomlar", "Polinomlar", 8, [
  { code: "10.3.1.1", subTopicName: "Polinom Kavramı", description: "Polinom tanımını ve derecesini açıklar." },
  { code: "10.3.1.2", subTopicName: "Polinom Kavramı", description: "Polinomlarla işlemler ve bölme yapar.", isKeyKazanim: true },
  { code: "10.3.2.1", subTopicName: "Çarpanlara Ayırma", description: "Polinomu çarpanlara ayırır.", isKeyKazanim: true },
  { code: "10.3.2.2", subTopicName: "Çarpanlara Ayırma", description: "Rasyonel cebirsel ifadeleri sadeleştirir." },
]);

addTopic("TYT", "Matematik", "ikinci_derece_denklemler", "İkinci Dereceden Denklemler", 9, [
  { code: "10.4.1.1", description: "İkinci dereceden denklem tanımını açıklar." },
  { code: "10.4.1.2", description: "İkinci dereceden denklemin çözüm yöntemlerini uygular.", isKeyKazanim: true },
  { code: "10.4.1.3", description: "Karmaşık sayıları tanır ve kullanır." },
  { code: "10.4.1.4", description: "Köklerin katsayılarla ilişkisini (Vieta) kullanır.", isKeyKazanim: true },
]);

addTopic("TYT", "Matematik", "dortgenler_cokgenler", "Dörtgenler ve Çokgenler", 10, [
  { code: "10.5.1.1", subTopicName: "Çokgenler", description: "Çokgen kavramını ve özelliklerini açıklar." },
  { code: "10.5.2.1", subTopicName: "Dörtgenler", description: "Dörtgenlerin özelliklerini açıklar." },
  { code: "10.5.3.1", subTopicName: "Özel Dörtgenler", description: "Yamuk, paralelkenar, dikdörtgen ve kare özelliklerini kullanır.", isKeyKazanim: true },
]);

addTopic("TYT", "Matematik", "uzay_geometri_prizma", "Uzay Geometri (Prizma ve Piramit)", 11, [
  { code: "10.6.1.1", description: "Dik prizma ve piramitlerin alan ve hacim hesaplarını yapar.", isKeyKazanim: true },
]);

// ============================================================
//  MATEMATİK — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Matematik", "trigonometri", "Trigonometri", 1, [
  { code: "11.1.1.1", subTopicName: "Yönlü Açılar", description: "Yönlü açı kavramını açıklar." },
  { code: "11.1.1.2", subTopicName: "Yönlü Açılar", description: "Açı birimlerini (derece, radyan) dönüştürür." },
  { code: "11.1.2.1", subTopicName: "Trigonometrik Fonksiyonlar", description: "Birim çemberde trigonometrik değerleri ve temel özdeşlikleri kullanır.", isKeyKazanim: true },
  { code: "11.1.2.2", subTopicName: "Trigonometrik Fonksiyonlar", description: "Kosinüs teoremini uygular.", isKeyKazanim: true },
  { code: "11.1.2.3", subTopicName: "Trigonometrik Fonksiyonlar", description: "Sinüs teoremini uygular." },
  { code: "11.1.2.4", subTopicName: "Trigonometrik Fonksiyonlar", description: "Trigonometrik fonksiyonların grafiğini çizer." },
  { code: "11.1.2.5", subTopicName: "Trigonometrik Fonksiyonlar", description: "Ters trigonometrik fonksiyonları açıklar." },
]);

addTopic("AYT", "Matematik", "analitik_geometri", "Analitik Geometri", 2, [
  { code: "11.2.1.1", subTopicName: "Doğrunun Analitik İncelenmesi", description: "İki nokta arasındaki uzaklığı hesaplar." },
  { code: "11.2.1.2", subTopicName: "Doğrunun Analitik İncelenmesi", description: "Doğru parçasını verilen oranda bölen noktayı bulur." },
  { code: "11.2.1.3", subTopicName: "Doğrunun Analitik İncelenmesi", description: "Doğru denklemini oluşturur.", isKeyKazanim: true },
  { code: "11.2.1.4", subTopicName: "Doğrunun Analitik İncelenmesi", description: "Noktanın doğruya uzaklığını hesaplar.", isKeyKazanim: true },
]);

addTopic("AYT", "Matematik", "fonksiyon_uygulamalari", "Fonksiyonlarda Uygulamalar", 3, [
  { code: "11.3.1.1", subTopicName: "Fonksiyon Uygulamaları", description: "Grafik ve tablo ile ortalama değişim hızını yorumlar." },
  { code: "11.3.2.1", subTopicName: "İkinci Dereceden Fonksiyonlar", description: "Parabol grafiğini çizer ve özelliklerini belirler.", isKeyKazanim: true },
  { code: "11.3.2.2", subTopicName: "İkinci Dereceden Fonksiyonlar", description: "İkinci derece fonksiyonlarla modelleme problemleri çözer." },
  { code: "11.3.3.1", subTopicName: "Fonksiyonların Dönüşümleri", description: "Öteleme ve simetri dönüşümlerini uygular." },
]);

addTopic("AYT", "Matematik", "denklem_esitsizlik_sistemleri", "Denklem ve Eşitsizlik Sistemleri", 4, [
  { code: "11.4.1.1", description: "İkinci dereceden iki bilinmeyenli denklem sistemlerini çözer." },
  { code: "11.4.2.1", description: "İkinci dereceden eşitsizlikleri çözer.", isKeyKazanim: true },
  { code: "11.4.2.2", description: "Eşitsizlik sistemlerini çözer." },
]);

addTopic("AYT", "Matematik", "cember_daire", "Çember ve Daire", 5, [
  { code: "11.5.1.1", subTopicName: "Temel Elemanlar", description: "Teğet, kiriş ve yay kavramlarını açıklar." },
  { code: "11.5.1.2", subTopicName: "Temel Elemanlar", description: "Kiriş özelliklerini kullanır." },
  { code: "11.5.2.1", subTopicName: "Açılar", description: "Merkez, çevre, iç ve dış açıları hesaplar.", isKeyKazanim: true },
  { code: "11.5.3.1", subTopicName: "Teğet", description: "Teğet özelliklerini kullanır.", isKeyKazanim: true },
  { code: "11.5.4.1", subTopicName: "Alan ve Çevre", description: "Dairenin çevre ve alan hesabını yapar.", isKeyKazanim: true },
]);

addTopic("AYT", "Matematik", "uzay_geometri_silindir", "Uzay Geometri (Silindir, Koni, Küre)", 6, [
  { code: "11.6.1.1", description: "Küre, silindir ve koninin alan ve hacim hesaplarını yapar.", isKeyKazanim: true },
]);

addTopic("AYT", "Matematik", "olasilik", "Olasılık", 7, [
  { code: "11.7.1.1", subTopicName: "Koşullu Olasılık", description: "Koşullu olasılık hesaplar.", isKeyKazanim: true },
  { code: "11.7.1.2", subTopicName: "Koşullu Olasılık", description: "Bağımlı ve bağımsız olayları belirler." },
  { code: "11.7.1.3", subTopicName: "Koşullu Olasılık", description: "Bileşik olayların olasılığını hesaplar.", isKeyKazanim: true },
  { code: "11.7.2.1", subTopicName: "Deneysel-Teorik", description: "Deneysel ve teorik olasılık arasındaki ilişkiyi açıklar." },
]);

addTopic("AYT", "Matematik", "ustel_log", "Üstel ve Logaritmik Fonksiyonlar", 8, [
  { code: "12.1.1.1", subTopicName: "Üstel Fonksiyon", description: "Üstel fonksiyonun özelliklerini açıklar ve grafiğini çizer.", isKeyKazanim: true },
  { code: "12.1.2.1", subTopicName: "Logaritma", description: "Logaritma ve üstel fonksiyon arasındaki ilişkiyi açıklar.", isKeyKazanim: true },
  { code: "12.1.2.2", subTopicName: "Logaritma", description: "10 tabanı ve e tabanı logaritmasını açıklar." },
  { code: "12.1.2.3", subTopicName: "Logaritma", description: "Logaritma özelliklerini uygular.", isKeyKazanim: true },
  { code: "12.1.3.1", subTopicName: "Denklemler", description: "Üstel ve logaritmik denklemleri çözer." },
  { code: "12.1.3.2", subTopicName: "Denklemler", description: "Gerçek hayat problemlerini üstel/logaritmik fonksiyonlarla modeller." },
]);

addTopic("AYT", "Matematik", "diziler", "Diziler", 9, [
  { code: "12.2.1.1", description: "Dizi kavramını açıklar." },
  { code: "12.2.1.2", description: "Genel terim ve indirgeme bağıntısını kullanır." },
  { code: "12.2.1.3", description: "Aritmetik ve geometrik dizilerin özelliklerini kullanır.", isKeyKazanim: true },
  { code: "12.2.1.4", description: "Dizilerle gerçek hayat problemlerini çözer." },
]);

addTopic("AYT", "Matematik", "trig_denklemler_donusumler", "Trigonometrik Denklemler ve Dönüşümler", 10, [
  { code: "12.3.1.1", description: "Toplam-fark formüllerini uygular.", isKeyKazanim: true },
  { code: "12.3.1.2", description: "İki kat açı formüllerini kullanır." },
  { code: "12.3.2.1", description: "Trigonometrik denklemleri çözer.", isKeyKazanim: true },
  { code: "12.4.1.1", description: "Öteleme, dönme ve simetri dönüşümlerini uygular." },
  { code: "12.4.1.2", description: "Dönüşüm bileşkelerini hesaplar." },
]);

addTopic("AYT", "Matematik", "turev", "Türev", 11, [
  { code: "12.5.1.1", subTopicName: "Limit ve Süreklilik", description: "Limit kavramını açıklar ve hesaplar.", isKeyKazanim: true },
  { code: "12.5.1.2", subTopicName: "Limit ve Süreklilik", description: "Limit özelliklerini uygular.", isKeyKazanim: true },
  { code: "12.5.1.3", subTopicName: "Limit ve Süreklilik", description: "Sürekliliği inceler." },
  { code: "12.5.2.1", subTopicName: "Anlık Değişim ve Türev", description: "Türev kavramını açıklar.", isKeyKazanim: true },
  { code: "12.5.2.2", subTopicName: "Anlık Değişim ve Türev", description: "Türevlenebilirliği inceler." },
  { code: "12.5.2.3", subTopicName: "Anlık Değişim ve Türev", description: "Toplam, fark, çarpım ve bölüm türevi hesaplar." },
  { code: "12.5.2.4", subTopicName: "Anlık Değişim ve Türev", description: "Zincir kuralını uygular." },
  { code: "12.5.3.1", subTopicName: "Türevin Uygulamaları", description: "Fonksiyonun artan ve azalan aralıklarını belirler.", isKeyKazanim: true },
  { code: "12.5.3.2", subTopicName: "Türevin Uygulamaları", description: "Maksimum ve minimum değerleri bulur." },
  { code: "12.5.3.3", subTopicName: "Türevin Uygulamaları", description: "Türev bilgisiyle grafik çizer." },
  { code: "12.5.3.4", subTopicName: "Türevin Uygulamaları", description: "Optimizasyon problemlerini çözer.", isKeyKazanim: true },
]);

addTopic("AYT", "Matematik", "integral", "İntegral", 12, [
  { code: "12.6.1.1", subTopicName: "Belirsiz İntegral", description: "Temel integral kurallarını uygular.", isKeyKazanim: true },
  { code: "12.6.1.2", subTopicName: "Belirsiz İntegral", description: "Değişken değiştirme yöntemini uygular." },
  { code: "12.6.2.1", subTopicName: "Belirli İntegral", description: "Riemann toplamını açıklar." },
  { code: "12.6.2.2", subTopicName: "Belirli İntegral", description: "Belirli ve belirsiz integral arasındaki ilişkiyi kullanır.", isKeyKazanim: true },
  { code: "12.6.2.3", subTopicName: "Belirli İntegral", description: "Belirli integralin özelliklerini uygular." },
  { code: "12.6.2.4", subTopicName: "Belirli İntegral", description: "Belirli integral ile alan hesabı yapar.", isKeyKazanim: true },
]);

addTopic("AYT", "Matematik", "analitik_cember", "Analitik Geometri - Çember", 13, [
  { code: "12.7.1.1", description: "Çember denklemini oluşturur ve yorumlar.", isKeyKazanim: true },
  { code: "12.7.1.2", description: "Doğru-çember konum durumlarını inceler." },
]);

// ============================================================
//  FİZİK — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Fizik", "fizik_giris", "Fizik Bilimine Giriş", 1, [
  { code: "9.1.1.1", description: "Fiziğin alt dallarını ve kapsamını açıklar." },
  { code: "9.1.2.1", description: "Büyüklükleri skaler ve vektörel olarak sınıflandırır." },
  { code: "9.1.3.1", description: "Fiziksel niceliklerin birimlerini dönüştürür.", isKeyKazanim: true },
  { code: "9.1.4.1", description: "Bilimsel gösterimi kullanır." },
]);

addTopic("TYT", "Fizik", "madde_ozellikleri", "Madde ve Özellikleri", 2, [
  { code: "9.2.1.1", description: "Özkütle kavramını açıklar ve hesaplar.", isKeyKazanim: true },
  { code: "9.2.1.2", description: "Maddenin ortak ve ayırt edici özelliklerini belirler." },
  { code: "9.2.2.1", description: "Katı, sıvı ve gaz hâllerinin özelliklerini karşılaştırır." },
  { code: "9.2.3.1", description: "Maddenin fiziksel ve kimyasal değişimlerini ayırt eder." },
]);

addTopic("TYT", "Fizik", "hareket_kuvvet", "Hareket ve Kuvvet", 3, [
  { code: "9.3.1.1", description: "Konum, yer değiştirme ve yol kavramlarını açıklar." },
  { code: "9.3.1.2", description: "Hız ve sürat kavramlarını ayırt eder.", isKeyKazanim: true },
  { code: "9.3.1.3", description: "Düzgün doğrusal hareket grafiklerini çizer ve yorumlar." },
  { code: "9.3.1.4", description: "İvme kavramını açıklar." },
  { code: "9.3.1.5", description: "Düzgün hızlanan hareket denklemlerini kullanır.", isKeyKazanim: true },
  { code: "9.3.1.6", description: "Serbest düşme ve dikey atış problemlerini çözer." },
  { code: "9.3.2.1", description: "Kuvvet kavramını ve kuvvet bileşkesini açıklar." },
  { code: "9.3.3.1", description: "Newton'un birinci yasasını (eylemsizlik) açıklar." },
  { code: "9.3.3.2", description: "Newton'un ikinci yasasını uygular.", isKeyKazanim: true },
  { code: "9.3.3.3", description: "Newton'un üçüncü yasasını (etki-tepki) açıklar." },
  { code: "9.3.4.1", description: "Sürtünme kuvvetini hesaplar." },
]);

addTopic("TYT", "Fizik", "enerji", "Enerji", 4, [
  { code: "9.4.1.1", description: "İş kavramını hesaplar.", isKeyKazanim: true },
  { code: "9.4.1.2", description: "Güç kavramını açıklar ve hesaplar." },
  { code: "9.4.2.1", description: "Kinetik ve potansiyel enerjiyi hesaplar.", isKeyKazanim: true },
  { code: "9.4.3.1", description: "Enerjinin korunumunu açıklar.", isKeyKazanim: true },
  { code: "9.4.3.2", description: "İş-enerji teoremini uygular." },
  { code: "9.4.4.1", description: "Enerji dönüşümlerini örneklerle açıklar." },
  { code: "9.4.4.2", description: "Verim kavramını hesaplar." },
  { code: "9.4.5.1", description: "Enerji kaynaklarını ve sürdürülebilir enerjiyi tartışır." },
]);

addTopic("TYT", "Fizik", "isi_sicaklik", "Isı ve Sıcaklık", 5, [
  { code: "9.5.1.1", description: "Sıcaklık ve ısı kavramlarını ayırt eder.", isKeyKazanim: true },
  { code: "9.5.1.2", description: "Termometre çeşitlerini ve sıcaklık birimlerini dönüştürür." },
  { code: "9.5.1.3", description: "Özısı kavramını açıklar." },
  { code: "9.5.1.4", description: "Isı alışverişi hesapları yapar.", isKeyKazanim: true },
  { code: "9.5.1.5", description: "Isı sığası kavramını açıklar." },
  { code: "9.5.2.1", description: "Hâl değişimi sırasında enerji alışverişini açıklar." },
  { code: "9.5.3.1", description: "Genleşme kavramını açıklar ve uygular." },
  { code: "9.5.4.1", description: "İletim yoluyla ısı transferini açıklar." },
  { code: "9.5.4.2", description: "Konveksiyon yoluyla ısı transferini açıklar." },
  { code: "9.5.4.3", description: "Işıma yoluyla ısı transferini açıklar." },
  { code: "9.5.4.4", description: "Isı yalıtımının önemini açıklar." },
  { code: "9.5.4.5", description: "Termodinamiğin sıfırıncı yasasını açıklar." },
  { code: "9.5.5.1", description: "Küresel ısınma ve sera etkisini tartışır." },
]);

addTopic("TYT", "Fizik", "elektrostatik", "Elektrostatik", 6, [
  { code: "9.6.1.1", description: "Elektrik yüklerini ve yüklenme yöntemlerini açıklar.", isKeyKazanim: true },
  { code: "9.6.1.2", description: "Coulomb yasasını uygular.", isKeyKazanim: true },
  { code: "9.6.1.3", description: "Elektrik alanını açıklar." },
  { code: "9.6.1.4", description: "İletken ve yalıtkanlarda yük dağılımını açıklar." },
]);

addTopic("TYT", "Fizik", "elektrik_manyetizma", "Elektrik ve Manyetizma", 7, [
  { code: "10.1.1.1", description: "Elektrik akımı ve potansiyel fark kavramlarını açıklar." },
  { code: "10.1.1.2", description: "Ohm yasasını uygular.", isKeyKazanim: true },
  { code: "10.1.2.1", description: "Seri ve paralel devre bağlantılarını açıklar.", isKeyKazanim: true },
  { code: "10.1.2.2", description: "Dirençlerin seri ve paralel bağlanmasını hesaplar." },
  { code: "10.1.2.3", description: "Elektrik devresinde güç ve enerji hesabı yapar." },
  { code: "10.1.2.4", description: "Kirchhoff yasalarını uygular." },
  { code: "10.1.3.1", description: "Manyetik alan kavramını açıklar." },
  { code: "10.1.4.1", description: "Elektromıknatısları açıklar." },
  { code: "10.1.4.2", description: "Elektrik motorunun çalışma ilkesini açıklar." },
]);

addTopic("TYT", "Fizik", "basinc_kaldirma", "Basınç ve Kaldırma Kuvveti", 8, [
  { code: "10.2.1.1", description: "Katı basıncını hesaplar.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Sıvı basıncını hesaplar." },
  { code: "10.2.2.1", description: "Açık hava basıncını açıklar." },
  { code: "10.2.2.2", description: "Kaldırma kuvvetini hesaplar ve Arşimet ilkesini uygular.", isKeyKazanim: true },
]);

addTopic("TYT", "Fizik", "dalgalar", "Dalgalar", 9, [
  { code: "10.3.1.1", description: "Dalga kavramını ve türlerini açıklar.", isKeyKazanim: true },
  { code: "10.3.1.2", description: "Dalga büyüklüklerini (genlik, frekans, dalga boyu) belirler." },
  { code: "10.3.2.1", description: "Yansıma ve kırılma olaylarını açıklar." },
  { code: "10.3.2.2", description: "Girişim ve kırınım olaylarını açıklar." },
  { code: "10.3.3.1", description: "Ses dalgalarının özelliklerini açıklar." },
  { code: "10.3.3.2", description: "Ses hızını etkileyen faktörleri belirler." },
  { code: "10.3.3.3", description: "Rezonans olayını açıklar." },
  { code: "10.3.3.4", description: "Doppler etkisini açıklar." },
  { code: "10.3.4.1", description: "Deprem dalgalarını açıklar." },
  { code: "10.3.4.2", description: "Tsunami ve deprem güvenliğini tartışır." },
  { code: "10.3.5.1", description: "Elektromanyetik spektrumu açıklar." },
  { code: "10.3.5.2", description: "Elektromanyetik dalgaların günlük yaşamdaki uygulamalarını açıklar." },
]);

addTopic("TYT", "Fizik", "optik", "Optik", 10, [
  { code: "10.4.1.1", description: "Işığın doğasını ve hızını açıklar." },
  { code: "10.4.1.2", description: "Işığın yansımasını açıklar.", isKeyKazanim: true },
  { code: "10.4.2.1", description: "Düz ayna özelliklerini açıklar." },
  { code: "10.4.3.1", description: "Işığın kırılmasını (Snell yasası) açıklar." },
  { code: "10.4.4.1", description: "Tam iç yansımayı açıklar." },
  { code: "10.4.5.1", description: "Küresel aynaların özelliklerini belirler.", isKeyKazanim: true },
  { code: "10.4.5.2", description: "Küresel aynalarda görüntü oluşumunu çizer." },
  { code: "10.4.6.1", description: "Prizmalarda ışığın kırılmasını açıklar." },
  { code: "10.4.6.2", description: "Renk kavramını ve ışığın renklerini açıklar." },
  { code: "10.4.6.3", description: "Işığın girişimini ve kırınımını açıklar." },
  { code: "10.4.7.1", description: "İnce kenarlı ve kalın kenarlı merceklerin özelliklerini belirler.", isKeyKazanim: true },
  { code: "10.4.7.2", description: "Merceklerde görüntü oluşumunu çizer." },
  { code: "10.4.8.1", description: "Göz ve görme kusurlarını açıklar." },
]);

// ============================================================
//  FİZİK — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Fizik", "kuvvet_hareket_ayt", "Kuvvet ve Hareket", 1, [
  { code: "11.1.1.1", description: "Newton yasalarını ileri düzeyde uygular.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Düzgün dairesel hareketi açıklar ve merkezcil kuvveti hesaplar.", isKeyKazanim: true },
  { code: "11.1.2.1", description: "İş-enerji teoremini ileri düzeyde uygular." },
  { code: "11.1.3.1", description: "Momentum ve impuls kavramlarını açıklar.", isKeyKazanim: true },
  { code: "11.1.3.2", description: "Momentumun korunumunu uygular." },
  { code: "11.1.4.1", description: "Tork kavramını hesaplar." },
  { code: "11.1.4.2", description: "Denge koşullarını belirler.", isKeyKazanim: true },
  { code: "11.1.5.1", description: "Basit makineleri açıklar ve verim hesabı yapar." },
]);

addTopic("AYT", "Fizik", "elektrik_manyetizma_ayt", "Elektrik ve Manyetizma", 2, [
  { code: "11.2.1.1", description: "Elektriksel kuvvet ve elektrik alanını ileri düzeyde hesaplar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Elektriksel potansiyel ve potansiyel enerjiyi hesaplar." },
  { code: "11.2.2.1", description: "Sığa kavramını açıklar ve kondansatör hesapları yapar.", isKeyKazanim: true },
  { code: "11.2.3.1", description: "Manyetik alan ve manyetik kuvveti hesaplar." },
  { code: "11.2.3.2", description: "Elektromanyetik indüksiyonu açıklar.", isKeyKazanim: true },
  { code: "11.2.3.3", description: "Alternatif akım ve transformatörü açıklar." },
]);

addTopic("AYT", "Fizik", "modern_fizik", "Modern Fizik", 3, [
  { code: "12.1.1.1", description: "Fotoelektrik olayını açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Compton saçılmasını açıklar." },
  { code: "12.1.2.1", description: "Atom modellerini açıklar.", isKeyKazanim: true },
  { code: "12.1.2.2", description: "Radyoaktivite ve çekirdek fiziğini açıklar." },
  { code: "12.1.3.1", description: "Özel göreliliğin temel kavramlarını açıklar." },
]);

addTopic("AYT", "Fizik", "dalga_mekanigi", "Dalga Mekaniği", 4, [
  { code: "12.2.1.1", description: "Basit harmonik hareketi açıklar.", isKeyKazanim: true },
  { code: "12.2.1.2", description: "Yaylarda ve sarkaçlarda salınım periyodunu hesaplar." },
  { code: "12.2.2.1", description: "Rezonans ve dalga girişimini ileri düzeyde inceler.", isKeyKazanim: true },
]);

// ============================================================
//  KİMYA — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Kimya", "kimya_bilimi", "Kimya Bilimi", 1, [
  { code: "9.1.1.1", description: "Kimya biliminin kapsamını ve önemini açıklar." },
  { code: "9.1.2.1", description: "Simya'dan kimyaya geçiş sürecini açıklar." },
  { code: "9.1.3.1", description: "Kimyasal hesaplamalarda anlamlı rakamları kullanır.", isKeyKazanim: true },
  { code: "9.1.4.1", description: "Element ve bileşik kavramlarını açıklar." },
]);

addTopic("TYT", "Kimya", "atom_periyodik", "Atom ve Periyodik Sistem", 2, [
  { code: "9.2.1.1", description: "Atom modellerinin tarihsel gelişimini açıklar.", isKeyKazanim: true },
  { code: "9.2.2.1", description: "Elektron dizilimlerini yapar ve kuantum sayılarını belirler.", isKeyKazanim: true },
  { code: "9.2.3.1", description: "Periyodik tablonun oluşumunu ve yapısını açıklar." },
  { code: "9.2.3.2", description: "Periyodik özellikleri (atom yarıçapı, iyonlaşma enerjisi) karşılaştırır.", isKeyKazanim: true },
  { code: "9.2.3.3", description: "Elementleri metal, ametal ve yarı metal olarak sınıflandırır." },
]);

addTopic("TYT", "Kimya", "kimyasal_turler", "Kimyasal Türler Arası Etkileşimler", 3, [
  { code: "9.3.1.1", description: "İyonik bağı açıklar ve örneklendirir.", isKeyKazanim: true },
  { code: "9.3.1.2", description: "Kovalent bağ türlerini (polar, apolar) açıklar.", isKeyKazanim: true },
  { code: "9.3.1.3", description: "Metalik bağı açıklar." },
  { code: "9.3.2.1", description: "Van der Waals, dipol-dipol ve hidrojen bağını açıklar." },
  { code: "9.3.2.2", description: "Zayıf etkileşimlerin fiziksel özelliklere etkisini açıklar." },
]);

addTopic("TYT", "Kimya", "maddenin_halleri", "Maddenin Hâlleri", 4, [
  { code: "9.4.1.1", description: "Katı, sıvı ve gaz hâllerinin tanecik modelini açıklar.", isKeyKazanim: true },
  { code: "9.4.1.2", description: "Hâl değişimlerini enerji alışverişiyle açıklar." },
  { code: "9.4.2.1", description: "İdeal gaz yasalarını uygular.", isKeyKazanim: true },
  { code: "9.4.2.2", description: "Plazma hâlini ve özelliklerini açıklar." },
]);

addTopic("TYT", "Kimya", "doga_kimya", "Doğa ve Kimya", 5, [
  { code: "9.5.1.1", description: "Suyun fiziksel ve kimyasal özelliklerini açıklar.", isKeyKazanim: true },
  { code: "9.5.1.2", description: "Su arıtma yöntemlerini açıklar." },
  { code: "9.5.2.1", description: "Çevre kirliliği ve kimyasal atıkları tartışır." },
]);

addTopic("TYT", "Kimya", "kimyanin_kanunlari", "Kimyanın Temel Kanunları", 6, [
  { code: "10.1.1.1", description: "Mol kavramını açıklar ve hesaplamalar yapar.", isKeyKazanim: true },
  { code: "10.1.1.2", description: "Avogadro sayısını ve mol-kütle ilişkisini kullanır.", isKeyKazanim: true },
  { code: "10.1.2.1", description: "Kütlenin korunumu yasasını açıklar." },
  { code: "10.1.2.2", description: "Sabit oranlar ve katlı oranlar yasasını açıklar." },
]);

addTopic("TYT", "Kimya", "karisimlar", "Karışımlar", 7, [
  { code: "10.2.1.1", description: "Homojen ve heterojen karışımları ayırt eder.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Çözünürlük kavramını ve etkileyen faktörleri açıklar.", isKeyKazanim: true },
  { code: "10.2.2.1", description: "Derişim hesapları (ppm, %, molarite) yapar." },
  { code: "10.2.2.2", description: "Karışımları ayırma yöntemlerini açıklar." },
]);

addTopic("TYT", "Kimya", "asitler_bazlar", "Asitler ve Bazlar", 8, [
  { code: "10.3.1.1", description: "Asit ve baz tanımlarını (Arrhenius, Brønsted-Lowry) açıklar.", isKeyKazanim: true },
  { code: "10.3.1.2", description: "pH kavramını açıklar ve hesaplar.", isKeyKazanim: true },
  { code: "10.3.2.1", description: "Nötralleşme tepkimesini açıklar." },
  { code: "10.3.2.2", description: "Asit-baz indikatörlerini açıklar." },
]);

addTopic("TYT", "Kimya", "kimya_heryerde", "Kimya Her Yerde", 9, [
  { code: "10.4.1.1", description: "Temizlik maddelerinin kimyasını açıklar." },
  { code: "10.4.2.1", description: "İlaçların ve kozmetik ürünlerin kimyasını açıklar.", isKeyKazanim: true },
  { code: "10.4.3.1", description: "Gıda katkı maddelerini ve gıda kimyasını açıklar." },
  { code: "10.4.4.1", description: "Endüstride kullanılan önemli kimyasalları açıklar." },
]);

// ============================================================
//  KİMYA — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Kimya", "kimyasal_tepkimeler_denge", "Kimyasal Tepkimeler ve Denge", 1, [
  { code: "11.1.1.1", description: "Tepkime hızı kavramını açıklar ve hızı etkileyen faktörleri belirler.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Hız denklemi ve hız sabiti kavramlarını açıklar." },
  { code: "11.1.2.1", description: "Kimyasal denge kavramını ve Le Chatelier ilkesini açıklar.", isKeyKazanim: true },
  { code: "11.1.2.2", description: "Denge sabiti (Kc, Kp) hesabı yapar.", isKeyKazanim: true },
  { code: "11.1.3.1", description: "Termokimya: ekzotermik ve endotermik tepkimeleri açıklar." },
]);

addTopic("AYT", "Kimya", "cozeltiler_ozellikleri", "Çözeltiler ve Özellikleri", 2, [
  { code: "11.2.1.1", description: "Çözünürlüğü etkileyen faktörleri açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Koligatif özellikleri (kaynama noktası yükselmesi, donma noktası alçalması) açıklar.", isKeyKazanim: true },
  { code: "11.2.2.1", description: "Derişim birimlerini ileri düzeyde hesaplar." },
]);

addTopic("AYT", "Kimya", "elektrokimya", "Elektrokimya", 3, [
  { code: "11.3.1.1", description: "Elektrokimyasal pil kavramını ve çalışma ilkesini açıklar.", isKeyKazanim: true },
  { code: "11.3.1.2", description: "Standart elektrot potansiyellerini kullanarak pil potansiyeli hesaplar.", isKeyKazanim: true },
  { code: "11.3.2.1", description: "Elektroliz olayını ve Faraday yasalarını açıklar." },
  { code: "11.3.2.2", description: "Korozyon ve korunma yöntemlerini açıklar." },
]);

addTopic("AYT", "Kimya", "organik_kimya", "Organik Kimya", 4, [
  { code: "12.1.1.1", description: "Karbon atomunun bağ yapma özelliğini açıklar." },
  { code: "12.1.1.2", description: "Hidrokarbonları (alkan, alken, alkin, aren) sınıflandırır.", isKeyKazanim: true },
  { code: "12.1.2.1", description: "Fonksiyonel grupları (alkol, eter, aldehit, keton, karboksil) tanır.", isKeyKazanim: true },
  { code: "12.1.2.2", description: "Organik tepkimeleri (yanma, katılma, yer değiştirme) açıklar." },
  { code: "12.1.3.1", description: "Polimerleri ve günlük hayattaki kullanımlarını açıklar." },
]);

// ============================================================
//  BİYOLOJİ — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Biyoloji", "yasam_bilimi", "Yaşam Bilimi Biyoloji", 1, [
  { code: "9.1.1.1", description: "Biyolojinin alt dallarını ve çalışma alanlarını açıklar." },
  { code: "9.1.1.2", description: "Canlıların ortak özelliklerini sıralar.", isKeyKazanim: true },
  { code: "9.1.2.1", description: "Bilimsel yöntemi ve deney tasarımını açıklar." },
]);

addTopic("TYT", "Biyoloji", "hucre", "Hücre", 2, [
  { code: "9.2.1.1", description: "Hücre teorisini ve hücrenin temel yapısını açıklar.", isKeyKazanim: true },
  { code: "9.2.1.2", description: "Prokaryot ve ökaryot hücreleri karşılaştırır." },
  { code: "9.2.2.1", description: "Hücre organellerinin görevlerini açıklar.", isKeyKazanim: true },
  { code: "9.2.3.1", description: "Hücre zarı yapısını ve madde geçişlerini açıklar.", isKeyKazanim: true },
]);

addTopic("TYT", "Biyoloji", "canlilar_dunyasi", "Canlılar Dünyası", 3, [
  { code: "9.3.1.1", description: "Canlıların sınıflandırma ilkelerini açıklar.", isKeyKazanim: true },
  { code: "9.3.1.2", description: "Âlem ve alan kavramlarını açıklar." },
  { code: "9.3.2.1", description: "Virüslerin yapı ve özelliklerini açıklar." },
]);

addTopic("TYT", "Biyoloji", "hucre_bolunmeleri", "Hücre Bölünmeleri", 4, [
  { code: "10.1.1.1", description: "Mitozu ve evrelerini açıklar.", isKeyKazanim: true },
  { code: "10.1.1.2", description: "Mayozu ve evrelerini açıklar.", isKeyKazanim: true },
  { code: "10.1.2.1", description: "Mitoz ve mayoz arasındaki farkları karşılaştırır." },
]);

addTopic("TYT", "Biyoloji", "kalitim_genel", "Kalıtımın Genel İlkeleri", 5, [
  { code: "10.2.1.1", description: "Mendel'in kalıtım ilkelerini açıklar.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Monohibrit ve dihibrit çaprazlama yapar.", isKeyKazanim: true },
  { code: "10.2.2.1", description: "Eş baskınlık ve eksik baskınlığı açıklar." },
]);

addTopic("TYT", "Biyoloji", "ekosistem_ekoloji", "Ekosistem Ekolojisi", 6, [
  { code: "10.3.1.1", description: "Ekosistem kavramını ve bileşenlerini açıklar.", isKeyKazanim: true },
  { code: "10.3.1.2", description: "Besin zinciri ve besin ağını oluşturur." },
  { code: "10.3.2.1", description: "Madde döngülerini (karbon, azot, su) açıklar.", isKeyKazanim: true },
]);

// ============================================================
//  BİYOLOJİ — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Biyoloji", "insan_fizyolojisi", "İnsan Fizyolojisi", 1, [
  { code: "11.1.1.1", description: "Sindirim sistemi yapısını ve işleyişini açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Dolaşım sistemi yapısını ve işleyişini açıklar.", isKeyKazanim: true },
  { code: "11.1.2.1", description: "Solunum sistemi yapısını ve gaz değişimini açıklar." },
  { code: "11.1.2.2", description: "Boşaltım sistemi yapısını ve işleyişini açıklar." },
  { code: "11.1.3.1", description: "Sinir sistemi yapısını ve impuls iletimini açıklar.", isKeyKazanim: true },
  { code: "11.1.3.2", description: "Endokrin sistemi ve hormonları açıklar." },
]);

addTopic("AYT", "Biyoloji", "komunite_populasyon", "Komünite ve Popülasyon Ekolojisi", 2, [
  { code: "11.2.1.1", description: "Popülasyon dinamiklerini açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Komünite ekolojisi ve türler arası ilişkileri açıklar.", isKeyKazanim: true },
  { code: "11.2.2.1", description: "Süksesyonu açıklar." },
]);

addTopic("AYT", "Biyoloji", "kalitim_ileri", "Kalıtım", 3, [
  { code: "12.1.1.1", description: "DNA replikasyonunu açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Protein sentezi (transkripsiyon ve translasyon) sürecini açıklar.", isKeyKazanim: true },
  { code: "12.1.2.1", description: "Genetik mühendisliği ve biyoteknoloji uygulamalarını açıklar." },
]);

addTopic("AYT", "Biyoloji", "enerji_donusumleri", "Canlılarda Enerji Dönüşümleri", 4, [
  { code: "12.2.1.1", description: "Fotosentez tepkimelerini (ışığa bağımlı ve bağımsız) açıklar.", isKeyKazanim: true },
  { code: "12.2.1.2", description: "Kemosentezi açıklar." },
  { code: "12.2.2.1", description: "Hücresel solunumu (glikoliz, Krebs, ETS) açıklar.", isKeyKazanim: true },
  { code: "12.2.2.2", description: "Fermantasyonu açıklar." },
]);

addTopic("AYT", "Biyoloji", "bitki_biyolojisi", "Bitki Biyolojisi", 5, [
  { code: "12.3.1.1", description: "Bitkilerde madde taşınmasını (ksilem, floem) açıklar.", isKeyKazanim: true },
  { code: "12.3.1.2", description: "Bitkilerde üreme yöntemlerini açıklar." },
  { code: "12.3.2.1", description: "Bitki hormonlarını ve etkilerini açıklar.", isKeyKazanim: true },
]);

// ============================================================
//  TÜRK DİLİ VE EDEBİYATI — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Edebiyat", "okuma", "Okuma", 1, [
  { code: "9.1.1.1", description: "Metin türlerini (öyküleyici, bilgilendirici, şiir) tanır.", isKeyKazanim: true },
  { code: "9.1.1.2", description: "Ana düşünce ve yardımcı düşünceleri belirler.", isKeyKazanim: true },
  { code: "9.1.2.1", description: "Sözcükte ve söz öbeklerinde anlam ilişkilerini açıklar." },
]);

addTopic("TYT", "Edebiyat", "siir", "Şiir", 2, [
  { code: "9.2.1.1", description: "Şiirde ahenk unsurlarını (ölçü, uyak, redif) belirler.", isKeyKazanim: true },
  { code: "9.2.1.2", description: "Nazım birimlerini ve şekillerini açıklar.", isKeyKazanim: true },
  { code: "9.2.2.1", description: "Şiirde imge ve söz sanatlarını yorumlar." },
]);

addTopic("TYT", "Edebiyat", "oyku", "Öykü", 3, [
  { code: "9.3.1.1", description: "Öykünün yapı unsurlarını (olay, kişi, mekân, zaman) belirler.", isKeyKazanim: true },
  { code: "9.3.1.2", description: "Anlatıcı ve bakış açısını belirler.", isKeyKazanim: true },
  { code: "9.3.2.1", description: "Olay ve durum öyküsünü karşılaştırır." },
]);

addTopic("TYT", "Edebiyat", "tiyatro", "Tiyatro", 4, [
  { code: "10.1.1.1", description: "Tiyatro türlerini (trajedi, komedi, dram) açıklar.", isKeyKazanim: true },
  { code: "10.1.1.2", description: "Tiyatro metninin yapı unsurlarını belirler." },
  { code: "10.1.2.1", description: "Geleneksel Türk tiyatrosunu (Karagöz, orta oyunu) açıklar." },
]);

addTopic("TYT", "Edebiyat", "bilgilendirici_metin", "Bilgilendirici Metin", 5, [
  { code: "10.2.1.1", description: "Makale, deneme, fıkra türlerini ayırt eder.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Bilgilendirici metinlerin yapısal özelliklerini belirler." },
  { code: "10.2.2.1", description: "Gazete ve dergi yazılarını değerlendirir." },
]);

// ============================================================
//  TÜRK DİLİ VE EDEBİYATI — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Edebiyat", "divan_edebiyati", "Divan Edebiyatı", 1, [
  { code: "11.1.1.1", description: "Divan edebiyatının genel özelliklerini açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Divan şiiri nazım biçimlerini (gazel, kaside, mesnevi) açıklar.", isKeyKazanim: true },
  { code: "11.1.2.1", description: "Divan edebiyatının önemli temsilcilerini tanır." },
]);

addTopic("AYT", "Edebiyat", "halk_edebiyati", "Halk Edebiyatı", 2, [
  { code: "11.2.1.1", description: "Halk edebiyatının özelliklerini açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Âşık edebiyatı ve anonim halk edebiyatını açıklar.", isKeyKazanim: true },
  { code: "11.2.2.1", description: "Tekke-tasavvuf edebiyatını açıklar." },
]);

addTopic("AYT", "Edebiyat", "tanzimat_edebiyati", "Tanzimat Edebiyatı", 3, [
  { code: "11.3.1.1", description: "Tanzimat döneminin özelliklerini açıklar.", isKeyKazanim: true },
  { code: "11.3.1.2", description: "Tanzimat I. ve II. dönem sanatçılarını karşılaştırır.", isKeyKazanim: true },
  { code: "11.3.2.1", description: "Tanzimat döneminde roman, tiyatro ve gazetenin gelişimini açıklar." },
]);

addTopic("AYT", "Edebiyat", "servetifunun_fecriati", "Servetifünun ve Fecriati", 4, [
  { code: "12.1.1.1", description: "Servetifünun edebiyatının özelliklerini açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Tevfik Fikret, Cenap Şahabettin ve Halit Ziya'yı tanır." },
  { code: "12.1.2.1", description: "Fecriati topluluğunun özelliklerini açıklar.", isKeyKazanim: true },
]);

addTopic("AYT", "Edebiyat", "milli_edebiyat", "Milli Edebiyat", 5, [
  { code: "12.2.1.1", description: "Milli Edebiyat akımının özelliklerini açıklar.", isKeyKazanim: true },
  { code: "12.2.1.2", description: "Ömer Seyfettin, Ziya Gökalp, Halide Edip gibi temsilcileri tanır.", isKeyKazanim: true },
  { code: "12.2.2.1", description: "Milli Edebiyat döneminde roman ve hikâyenin gelişimini açıklar." },
]);

addTopic("AYT", "Edebiyat", "cumhuriyet_donemi", "Cumhuriyet Dönemi", 6, [
  { code: "12.3.1.1", description: "Cumhuriyet dönemi Türk edebiyatının genel özelliklerini açıklar.", isKeyKazanim: true },
  { code: "12.3.1.2", description: "Garip, İkinci Yeni ve toplumcu gerçekçi akımları açıklar.", isKeyKazanim: true },
  { code: "12.3.2.1", description: "Cumhuriyet dönemi roman ve hikâye yazarlarını tanır." },
]);

// ============================================================
//  TARİH — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Tarih", "tarih_zaman", "Tarih ve Zaman", 1, [
  { code: "9.1.1.1", description: "Tarih biliminin tanımını ve önemini açıklar.", isKeyKazanim: true },
  { code: "9.1.1.2", description: "Tarihi dönemlendirme ve takvim sistemlerini açıklar." },
  { code: "9.1.2.1", description: "Tarih biliminin yöntemlerini ve kaynaklarını açıklar." },
]);

addTopic("TYT", "Tarih", "insanligin_ilk", "İnsanlığın İlk Dönemleri", 2, [
  { code: "9.2.1.1", description: "Tarih öncesi dönemleri ve insanlığın gelişim sürecini açıklar.", isKeyKazanim: true },
  { code: "9.2.1.2", description: "İlk uygarlıkları (Mezopotamya, Mısır, Anadolu) tanır.", isKeyKazanim: true },
  { code: "9.2.2.1", description: "Yazının icadının tarihsel önemini değerlendirir." },
]);

addTopic("TYT", "Tarih", "orta_cag", "Orta Çağ", 3, [
  { code: "9.3.1.1", description: "Kavimler Göçü ve sonuçlarını açıklar.", isKeyKazanim: true },
  { code: "9.3.1.2", description: "Feodalizm ve Orta Çağ Avrupasını açıklar." },
  { code: "9.3.2.1", description: "Türklerin Orta Asya'daki tarihini açıklar.", isKeyKazanim: true },
]);

addTopic("TYT", "Tarih", "islam_medeniyeti", "İslam Medeniyetinin Doğuşu", 4, [
  { code: "9.4.1.1", description: "Hz. Muhammed dönemini ve İslamiyet'in yayılışını açıklar.", isKeyKazanim: true },
  { code: "9.4.1.2", description: "Dört Halife dönemini ve önemli olayları açıklar." },
  { code: "9.4.2.1", description: "Emeviler ve Abbasiler dönemini açıklar." },
]);

addTopic("TYT", "Tarih", "turk_islam_devletleri", "Türk-İslam Devletleri", 5, [
  { code: "9.5.1.1", description: "Karahanlılar ve Gaznelileri açıklar." },
  { code: "9.5.1.2", description: "Büyük Selçuklu Devleti'ni açıklar.", isKeyKazanim: true },
  { code: "9.5.2.1", description: "Anadolu Selçuklu Devleti ve beylikler dönemini açıklar.", isKeyKazanim: true },
]);

addTopic("TYT", "Tarih", "osmanli_kurulus", "Osmanlı Devleti Kuruluş", 6, [
  { code: "10.1.1.1", description: "Osmanlı Devleti'nin kuruluş sürecini açıklar.", isKeyKazanim: true },
  { code: "10.1.1.2", description: "Kuruluş dönemi padişahlarını ve önemli olayları açıklar.", isKeyKazanim: true },
  { code: "10.1.2.1", description: "Osmanlı'nın devlet yapısını açıklar." },
]);

addTopic("TYT", "Tarih", "osmanli_yukselme", "Osmanlı Yükselme", 7, [
  { code: "10.2.1.1", description: "Yükselme dönemi fetihlerini (İstanbul'un Fethi) açıklar.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Osmanlı'nın dünya gücü olma sürecini değerlendirir.", isKeyKazanim: true },
  { code: "10.2.2.1", description: "Osmanlı kültür ve medeniyetini açıklar." },
]);

// ============================================================
//  TARİH — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Tarih", "degisen_dunya", "Değişen Dünya Dengeleri", 1, [
  { code: "11.1.1.1", description: "Coğrafi Keşifler ve Rönesans'ın etkilerini açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Reform hareketlerini açıklar." },
  { code: "11.1.2.1", description: "Aydınlanma Çağı ve sanayi devrimini açıklar.", isKeyKazanim: true },
]);

addTopic("AYT", "Tarih", "osmanli_duraklama", "Osmanlı Duraklama", 2, [
  { code: "11.2.1.1", description: "Osmanlı'nın duraklama nedenlerini açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Duraklama dönemi ıslahat hareketlerini açıklar." },
  { code: "11.2.2.1", description: "XVII. yüzyıl siyasi olaylarını değerlendirir." },
]);

addTopic("AYT", "Tarih", "avrupa_osmanli_18_19", "Avrupa ve Osmanlı (18-19 yy)", 3, [
  { code: "11.3.1.1", description: "Fransız İhtilali ve etkilerini açıklar.", isKeyKazanim: true },
  { code: "11.3.1.2", description: "Osmanlı modernleşme çabalarını (Tanzimat, Meşrutiyet) açıklar.", isKeyKazanim: true },
  { code: "11.3.2.1", description: "XIX. yüzyılda milliyetçilik akımlarını açıklar." },
]);

addTopic("AYT", "Tarih", "dunya_savasi_1", "I. Dünya Savaşı", 4, [
  { code: "12.1.1.1", description: "I. Dünya Savaşı'nın nedenlerini ve cephelerini açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Osmanlı'nın savaştaki cephelerini açıklar.", isKeyKazanim: true },
  { code: "12.1.2.1", description: "Savaşın sonuçlarını ve barış antlaşmalarını açıklar." },
]);

addTopic("AYT", "Tarih", "kurtulus_savasi", "Kurtuluş Savaşı", 5, [
  { code: "12.2.1.1", description: "Mondros Mütarekesi ve işgalleri açıklar." },
  { code: "12.2.1.2", description: "Milli Mücadele'nin örgütlenme sürecini açıklar.", isKeyKazanim: true },
  { code: "12.2.2.1", description: "Kurtuluş Savaşı'nın cephelerini ve muharebelerini açıklar.", isKeyKazanim: true },
  { code: "12.2.2.2", description: "Mudanya ve Lozan Antlaşmalarını açıklar." },
]);

addTopic("AYT", "Tarih", "ataturk_donemi", "Atatürk Dönemi", 6, [
  { code: "12.3.1.1", description: "Cumhuriyetin ilanını ve inkılapları açıklar.", isKeyKazanim: true },
  { code: "12.3.1.2", description: "Atatürk ilkelerini (altı ok) açıklar.", isKeyKazanim: true },
  { code: "12.3.2.1", description: "Atatürk dönemi dış politikasını açıklar." },
]);

// ============================================================
//  COĞRAFYA — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Coğrafya", "dogal_sistemler", "Doğal Sistemler", 1, [
  { code: "9.1.1.1", description: "Dünya'nın şeklini ve boyutlarını açıklar." },
  { code: "9.1.1.2", description: "Coğrafi konum türlerini (matematik, özel) açıklar.", isKeyKazanim: true },
  { code: "9.1.2.1", description: "Dünya'nın hareketlerini ve sonuçlarını açıklar.", isKeyKazanim: true },
]);

addTopic("TYT", "Coğrafya", "harita_bilgisi", "Harita Bilgisi", 2, [
  { code: "9.2.1.1", description: "Harita çeşitlerini ve kullanım alanlarını açıklar.", isKeyKazanim: true },
  { code: "9.2.1.2", description: "Ölçek kavramını ve ölçek hesaplamalarını yapar.", isKeyKazanim: true },
  { code: "9.2.2.1", description: "İzohips haritalarını okur ve yorumlar." },
]);

addTopic("TYT", "Coğrafya", "iklim", "İklim", 3, [
  { code: "9.3.1.1", description: "İklim elemanlarını (sıcaklık, basınç, rüzgâr, nem, yağış) açıklar.", isKeyKazanim: true },
  { code: "9.3.1.2", description: "İklim tiplerini ve özelliklerini açıklar.", isKeyKazanim: true },
  { code: "9.3.2.1", description: "Türkiye'nin iklim özelliklerini açıklar." },
]);

addTopic("TYT", "Coğrafya", "nufus_yerlesme", "Nüfus ve Yerleşme", 4, [
  { code: "10.1.1.1", description: "Nüfusun dağılışını etkileyen faktörleri açıklar.", isKeyKazanim: true },
  { code: "10.1.1.2", description: "Nüfus piramitlerini yorumlar.", isKeyKazanim: true },
  { code: "10.1.2.1", description: "Göç türlerini ve nedenlerini açıklar." },
]);

addTopic("TYT", "Coğrafya", "turkiye_yer_sekilleri", "Türkiye'nin Yer Şekilleri", 5, [
  { code: "10.2.1.1", description: "İç kuvvetleri (tektonizma, volkanizma, deprem) açıklar.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Dış kuvvetleri (akarsu, rüzgâr, buzul, dalga) açıklar.", isKeyKazanim: true },
  { code: "10.2.2.1", description: "Türkiye'nin bölgelerine göre yer şekillerini açıklar." },
]);

// ============================================================
//  COĞRAFYA — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Coğrafya", "biyomlar", "Biyomlar", 1, [
  { code: "11.1.1.1", description: "Dünya biyomlarını (tropikal, ılıman, kutup) açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Biyomların dağılışını etkileyen faktörleri açıklar." },
  { code: "11.1.2.1", description: "Biyoçeşitliliği ve korunmasını açıklar.", isKeyKazanim: true },
]);

addTopic("AYT", "Coğrafya", "ekonomik_cografya", "Ekonomik Coğrafya", 2, [
  { code: "11.2.1.1", description: "Tarım, hayvancılık ve ormancılık faaliyetlerini açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Madencilik ve enerji kaynaklarını açıklar.", isKeyKazanim: true },
  { code: "11.2.2.1", description: "Sanayi ve ticaret faaliyetlerini açıklar." },
]);

addTopic("AYT", "Coğrafya", "turkiye_ekonomisi", "Türkiye Ekonomisi", 3, [
  { code: "12.1.1.1", description: "Türkiye'nin tarım, sanayi ve hizmet sektörlerini açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Türkiye'nin dış ticaretini değerlendirir.", isKeyKazanim: true },
  { code: "12.1.2.1", description: "Türkiye'nin ulaşım ağını ve önemini açıklar." },
]);

addTopic("AYT", "Coğrafya", "kuresel_ortam", "Küresel Ortam", 4, [
  { code: "12.2.1.1", description: "Küresel çevre sorunlarını açıklar.", isKeyKazanim: true },
  { code: "12.2.1.2", description: "Doğal afetleri ve afet yönetimini açıklar.", isKeyKazanim: true },
  { code: "12.2.2.1", description: "Küreselleşmenin etkilerini tartışır." },
]);

// ============================================================
//  FELSEFE — TYT (9-10. sınıf)
// ============================================================

addTopic("TYT", "Felsefe", "felsefeyi_tanima", "Felsefeyi Tanıma", 1, [
  { code: "10.1.1.1", description: "Felsefenin tanımını ve konusunu açıklar.", isKeyKazanim: true },
  { code: "10.1.1.2", description: "Felsefi düşüncenin özelliklerini açıklar." },
  { code: "10.1.2.1", description: "Felsefenin diğer bilgi alanlarıyla ilişkisini açıklar." },
]);

addTopic("TYT", "Felsefe", "bilgi_felsefesi", "Bilgi Felsefesi", 2, [
  { code: "10.2.1.1", description: "Bilgi türlerini (günlük, bilimsel, felsefi, dini) açıklar.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Doğruluk ve gerçeklik kavramlarını açıklar.", isKeyKazanim: true },
  { code: "10.2.2.1", description: "Bilgi felsefesinin temel problemlerini tartışır." },
]);

addTopic("TYT", "Felsefe", "varlik_felsefesi", "Varlık Felsefesi", 3, [
  { code: "10.3.1.1", description: "Varlık felsefesinin temel kavramlarını açıklar.", isKeyKazanim: true },
  { code: "10.3.1.2", description: "Varlığın ne olduğu sorusuna verilen cevapları karşılaştırır." },
  { code: "10.3.2.1", description: "Materyalizm ve idealizmi açıklar.", isKeyKazanim: true },
]);

addTopic("TYT", "Felsefe", "ahlak_felsefesi", "Ahlak Felsefesi", 4, [
  { code: "10.4.1.1", description: "Ahlak felsefesinin temel kavramlarını açıklar.", isKeyKazanim: true },
  { code: "10.4.1.2", description: "Evrensel ahlak yasasının olup olmadığını tartışır.", isKeyKazanim: true },
  { code: "10.4.2.1", description: "Ahlak felsefesinin temel yaklaşımlarını karşılaştırır." },
]);

// ============================================================
//  FELSEFE — AYT (11-12. sınıf)
// ============================================================

addTopic("AYT", "Felsefe", "bilim_felsefesi", "Bilim Felsefesi", 1, [
  { code: "11.1.1.1", description: "Bilimin tanımını ve bilimsel yöntemi açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Bilimsel bilginin özelliklerini açıklar." },
  { code: "11.1.2.1", description: "Bilim felsefesinin temel problemlerini tartışır.", isKeyKazanim: true },
]);

addTopic("AYT", "Felsefe", "din_felsefesi", "Din Felsefesi", 2, [
  { code: "11.2.1.1", description: "Din felsefesinin konusunu ve problemlerini açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Tanrı'nın varlığına ilişkin felsefi yaklaşımları tartışır.", isKeyKazanim: true },
  { code: "11.2.2.1", description: "İnanç ve akıl ilişkisini tartışır." },
]);

addTopic("AYT", "Felsefe", "siyaset_felsefesi", "Siyaset Felsefesi", 3, [
  { code: "11.3.1.1", description: "Siyaset felsefesinin temel kavramlarını açıklar.", isKeyKazanim: true },
  { code: "11.3.1.2", description: "İdeal devlet anlayışlarını karşılaştırır.", isKeyKazanim: true },
  { code: "11.3.2.1", description: "Birey-devlet ilişkisini tartışır." },
]);

addTopic("AYT", "Felsefe", "sanat_felsefesi", "Sanat Felsefesi", 4, [
  { code: "12.1.1.1", description: "Sanat felsefesinin konusunu ve temel kavramlarını açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Güzellik ve estetik kavramlarını tartışır.", isKeyKazanim: true },
  { code: "12.1.2.1", description: "Sanatın toplumsal işlevini tartışır." },
]);

// ============================================================
//  DİN KÜLTÜRÜ — TYT (9-10. sınıf only)
// ============================================================

addTopic("TYT", "Din Kültürü", "bilgi_inanc", "Bilgi ve İnanç", 1, [
  { code: "9.1.1.1", description: "Bilgi ve inanç arasındaki ilişkiyi açıklar.", isKeyKazanim: true },
  { code: "9.1.1.2", description: "Vahiy, akıl ve duyuların bilgi kaynağı olarak rolünü açıklar." },
  { code: "9.1.2.1", description: "İnanç çeşitlerini (monoteizm, politeizm, ateizm, deizm) açıklar." },
]);

addTopic("TYT", "Din Kültürü", "din_islam", "Din ve İslam", 2, [
  { code: "9.2.1.1", description: "İslam'ın inanç esaslarını açıklar.", isKeyKazanim: true },
  { code: "9.2.1.2", description: "İbadetlerin bireysel ve toplumsal faydalarını açıklar.", isKeyKazanim: true },
  { code: "9.2.2.1", description: "İslam ahlakının temel ilkelerini açıklar." },
]);

addTopic("TYT", "Din Kültürü", "hz_muhammed", "Hz. Muhammed'in Hayatı", 3, [
  { code: "10.1.1.1", description: "Hz. Muhammed'in hayatının ana hatlarını açıklar.", isKeyKazanim: true },
  { code: "10.1.1.2", description: "Hz. Muhammed'in ahlaki özelliklerini örneklendirir.", isKeyKazanim: true },
  { code: "10.1.2.1", description: "Hz. Muhammed'in toplumsal değişimdeki rolünü açıklar." },
]);

addTopic("TYT", "Din Kültürü", "kuran_yorum", "Kur'an ve Yorumu", 4, [
  { code: "10.2.1.1", description: "Kur'an-ı Kerim'in temel özelliklerini açıklar.", isKeyKazanim: true },
  { code: "10.2.1.2", description: "Kur'an'ın anlaşılmasında tefsir ve meal kavramlarını açıklar." },
  { code: "10.2.2.1", description: "Kur'an'ın temel konularını açıklar.", isKeyKazanim: true },
]);

// ============================================================
//  MANTIK — AYT (11-12. sınıf only)
// ============================================================

addTopic("AYT", "Mantık", "klasik_mantik", "Klasik Mantık", 1, [
  { code: "11.1.1.1", description: "Mantık biliminin konusunu ve temel kavramlarını açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Kavram, terim, önerme ve kıyas kavramlarını açıklar.", isKeyKazanim: true },
  { code: "11.1.2.1", description: "Aristoteles kıyasının çeşitlerini ve kurallarını açıklar." },
]);

addTopic("AYT", "Mantık", "modern_mantik", "Modern Mantık", 2, [
  { code: "12.1.1.1", description: "Sembolik mantığın temel kavramlarını açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Doğruluk tablolarını oluşturur ve yorumlar.", isKeyKazanim: true },
  { code: "12.1.2.1", description: "Çıkarım ve geçerlilik kavramlarını uygular." },
]);

// ============================================================
//  SOSYOLOJİ — AYT (11-12. sınıf only)
// ============================================================

addTopic("AYT", "Sosyoloji", "sosyolojiye_giris", "Sosyolojiye Giriş", 1, [
  { code: "11.1.1.1", description: "Sosyolojinin tanımını ve konusunu açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Sosyolojinin yöntemlerini açıklar." },
  { code: "11.1.2.1", description: "Sosyolojinin diğer bilimlerle ilişkisini açıklar." },
]);

addTopic("AYT", "Sosyoloji", "toplumsal_yapi", "Toplumsal Yapı", 2, [
  { code: "11.2.1.1", description: "Toplumsal yapı ve toplumsal ilişki kavramlarını açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Toplumsal tabakalaşmayı açıklar.", isKeyKazanim: true },
  { code: "11.2.2.1", description: "Toplumsal kurumları (aile, eğitim, ekonomi, siyaset, din) açıklar." },
]);

addTopic("AYT", "Sosyoloji", "toplumsal_degisme", "Toplumsal Değişme", 3, [
  { code: "12.1.1.1", description: "Toplumsal değişmeyi etkileyen faktörleri açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Toplumsal gelişme ve kalkınma kavramlarını açıklar." },
  { code: "12.1.2.1", description: "Küreselleşme ve toplumsal değişme ilişkisini tartışır.", isKeyKazanim: true },
]);

// ============================================================
//  PSİKOLOJİ — AYT (11-12. sınıf only)
// ============================================================

addTopic("AYT", "Psikoloji", "psikoloji_bilimi", "Psikoloji Bilimi", 1, [
  { code: "11.1.1.1", description: "Psikolojinin tanımını ve amaçlarını açıklar.", isKeyKazanim: true },
  { code: "11.1.1.2", description: "Psikolojinin alt dallarını ve yaklaşımlarını açıklar." },
  { code: "11.1.2.1", description: "Psikolojide araştırma yöntemlerini açıklar.", isKeyKazanim: true },
]);

addTopic("AYT", "Psikoloji", "psikoloji_temel_surecler", "Psikolojinin Temel Süreçleri", 2, [
  { code: "11.2.1.1", description: "Algı, dikkat ve bellek süreçlerini açıklar.", isKeyKazanim: true },
  { code: "11.2.1.2", description: "Öğrenme kuramlarını (klasik, edimsel, bilişsel) açıklar.", isKeyKazanim: true },
  { code: "11.2.2.1", description: "Güdülenme ve duygusal süreçleri açıklar." },
  { code: "11.2.2.2", description: "Kişilik kuramlarını açıklar." },
]);

addTopic("AYT", "Psikoloji", "ruh_sagligi", "Ruh Sağlığı", 3, [
  { code: "12.1.1.1", description: "Ruh sağlığının tanımını ve önemini açıklar.", isKeyKazanim: true },
  { code: "12.1.1.2", description: "Stres ve başa çıkma yöntemlerini açıklar." },
  { code: "12.1.2.1", description: "Psikolojik bozuklukları ve tedavi yöntemlerini açıklar.", isKeyKazanim: true },
]);

// ============================================================
//  SEED SCRIPT - MAIN
// ============================================================

// Subject name mapping: DB'deki ders adları ile curriculum'daki ders adları eşleştirmesi
// TYT'de Fizik, Kimya, Biyoloji "Fen Bilimleri" altında "Fizik - xxx" gibi topic name ile tutulabilir
// TYT'de Tarih, Coğrafya, Felsefe, Din Kültürü "Sosyal Bilimler" altında tutulabilir
// Bu yüzden fuzzy matching yapacağız

const SUBJECT_NAME_MAP: Record<string, Record<string, string[]>> = {
  TYT: {
    "Matematik": ["Matematik"],
    "Fizik": ["Fen Bilimleri", "Fizik"],
    "Kimya": ["Fen Bilimleri", "Kimya"],
    "Biyoloji": ["Fen Bilimleri", "Biyoloji"],
    "Edebiyat": ["Türkçe", "Edebiyat", "Türk Dili ve Edebiyatı"],
    "Tarih": ["Sosyal Bilimler", "Tarih"],
    "Coğrafya": ["Sosyal Bilimler", "Coğrafya"],
    "Felsefe": ["Sosyal Bilimler", "Felsefe"],
    "Din Kültürü": ["Sosyal Bilimler", "Din Kültürü", "Din Kültürü ve Ahlak Bilgisi"],
  },
  AYT: {
    "Matematik": ["Matematik"],
    "Fizik": ["Fizik"],
    "Kimya": ["Kimya"],
    "Biyoloji": ["Biyoloji"],
    "Edebiyat": ["Edebiyat", "Türk Dili ve Edebiyatı"],
    "Tarih": ["Tarih"],
    "Coğrafya": ["Coğrafya"],
    "Felsefe": ["Felsefe", "Felsefe Grubu"],
    "Mantık": ["Mantık", "Felsefe Grubu"],
    "Sosyoloji": ["Sosyoloji", "Felsefe Grubu"],
    "Psikoloji": ["Psikoloji", "Felsefe Grubu"],
  },
};

function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[İ]/g, "i")
    .replace(/[ı]/g, "i")
    .replace(/[Ö]/g, "o")
    .replace(/[ö]/g, "o")
    .replace(/[Ü]/g, "u")
    .replace(/[ü]/g, "u")
    .replace(/[Ç]/g, "c")
    .replace(/[ç]/g, "c")
    .replace(/[Ş]/g, "s")
    .replace(/[ş]/g, "s")
    .replace(/[Ğ]/g, "g")
    .replace(/[ğ]/g, "g")
    .replace(/[^a-z0-9]/g, "");
}

function fuzzyTopicMatch(dbName: string, curriculumName: string): boolean {
  const a = normalizeForSearch(dbName);
  const b = normalizeForSearch(curriculumName);
  // exact match after normalization
  if (a === b) return true;
  // one contains the other
  if (a.includes(b) || b.includes(a)) return true;
  // first 6+ chars match
  if (a.length >= 6 && b.length >= 6 && a.substring(0, 6) === b.substring(0, 6)) return true;
  return false;
}

async function main() {
  console.log("🎯 ÖSYM 2026 Kazanım Seed Script başlıyor...\n");

  // Get exam types
  const examTypes = await prisma.examType.findMany();
  const examTypeMap: Record<string, string> = {};
  for (const et of examTypes) {
    examTypeMap[et.name] = et.id; // "TYT" -> id, "AYT" -> id
  }

  if (!examTypeMap["TYT"] || !examTypeMap["AYT"]) {
    console.error("❌ ExamType TYT veya AYT bulunamadı! Önce seed.ts çalıştırın.");
    process.exit(1);
  }

  let totalKazanim = 0;
  let totalTopicUpdated = 0;
  let totalTopicCreated = 0;

  for (const examTypeName of Object.keys(CURRICULUM)) {
    const examTypeId = examTypeMap[examTypeName];
    if (!examTypeId) {
      console.warn(`⚠️  ExamType "${examTypeName}" bulunamadı, atlanıyor.`);
      continue;
    }

    const subjects = CURRICULUM[examTypeName];

    for (const subjectName of Object.keys(subjects)) {
      console.log(`\n📘 ${examTypeName} > ${subjectName}`);

      // Find subject in DB with fuzzy matching
      const possibleNames = SUBJECT_NAME_MAP[examTypeName]?.[subjectName] || [subjectName];
      let subject = null;

      for (const name of possibleNames) {
        subject = await prisma.subject.findFirst({
          where: { examTypeId, name },
        });
        if (subject) break;
      }

      // If still not found, try partial match
      if (!subject) {
        const allSubjects = await prisma.subject.findMany({ where: { examTypeId } });
        subject = allSubjects.find((s) =>
          possibleNames.some((pn) => fuzzyTopicMatch(s.name, pn))
        ) || null;
      }

      if (!subject) {
        // Create subject
        console.log(`  📝 Ders oluşturuluyor: ${subjectName}`);
        subject = await prisma.subject.create({
          data: {
            name: subjectName,
            examTypeId,
            questionCount: 10,
            sortOrder: 99,
          },
        });
      }

      const topicEntries = subjects[subjectName];

      for (const topicKey of Object.keys(topicEntries)) {
        const topicData = topicEntries[topicKey];
        const { topicName, sortOrder, kazanimlar } = topicData;

        // Find topic in DB with fuzzy matching
        const existingTopics = await prisma.topic.findMany({
          where: { subjectId: subject.id },
        });

        let topic = existingTopics.find((t) => fuzzyTopicMatch(t.name, topicName)) || null;

        if (!topic) {
          // Also try matching with subject prefix (e.g., "Fizik - Kuvvet ve Hareket")
          const prefixedName = `${subjectName} - ${topicName}`;
          topic = existingTopics.find((t) => fuzzyTopicMatch(t.name, prefixedName)) || null;
        }

        if (topic) {
          // Update sortOrder
          await prisma.topic.update({
            where: { id: topic.id },
            data: { sortOrder },
          });
          totalTopicUpdated++;
          console.log(`  ✅ Konu güncellendi: ${topic.name} (sortOrder: ${sortOrder})`);
        } else {
          // Create topic
          topic = await prisma.topic.create({
            data: {
              name: topicName,
              subjectId: subject.id,
              sortOrder,
            },
          });
          totalTopicCreated++;
          console.log(`  📝 Konu oluşturuldu: ${topicName} (sortOrder: ${sortOrder})`);
        }

        // Upsert kazanımlar
        for (let i = 0; i < kazanimlar.length; i++) {
          const k = kazanimlar[i];

          // Try to find existing kazanım by topicId + code
          const existing = await prisma.topicKazanim.findFirst({
            where: { topicId: topic.id, code: k.code },
          });

          if (existing) {
            await prisma.topicKazanim.update({
              where: { id: existing.id },
              data: {
                subTopicName: k.subTopicName || null,
                description: k.description,
                details: k.details || null,
                isKeyKazanim: k.isKeyKazanim || false,
                sortOrder: i + 1,
              },
            });
          } else {
            await prisma.topicKazanim.create({
              data: {
                topicId: topic.id,
                code: k.code,
                subTopicName: k.subTopicName || null,
                description: k.description,
                details: k.details || null,
                isKeyKazanim: k.isKeyKazanim || false,
                sortOrder: i + 1,
              },
            });
          }
          totalKazanim++;
        }
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`🎉 Seed tamamlandı!`);
  console.log(`   📊 Toplam kazanım: ${totalKazanim}`);
  console.log(`   📁 Güncellenen konu: ${totalTopicUpdated}`);
  console.log(`   📝 Oluşturulan konu: ${totalTopicCreated}`);
  console.log("=".repeat(60));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
