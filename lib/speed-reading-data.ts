// Hızlı okuma egzersizleri için Türkçe kelime bankaları ve yardımcı fonksiyonlar

// ==================== KELİME BANKALARI ====================

export const TURKISH_WORDS = {
  easy: [
    "kitap", "masa", "kalem", "deniz", "güneş", "çiçek", "araba", "kapı", "pencere", "bahçe",
    "okul", "sınıf", "öğretmen", "defter", "tahta", "sıra", "çanta", "silgi", "cetvel", "boya",
    "ev", "oda", "salon", "mutfak", "banyo", "yatak", "dolap", "ayna", "halı", "perde",
    "anne", "baba", "kardeş", "dede", "nine", "amca", "teyze", "dayı", "hala", "kuzen",
    "elma", "armut", "portakal", "muz", "üzüm", "kiraz", "çilek", "karpuz", "şeftali", "erik",
    "kedi", "köpek", "kuş", "balık", "tavuk", "inek", "at", "koyun", "tavşan", "kaplumbağa",
    "yağmur", "kar", "rüzgar", "bulut", "gökkuşağı", "fırtına", "sis", "dolu", "şimşek", "gök",
    "sokak", "cadde", "park", "köprü", "nehir", "göl", "orman", "dağ", "vadi", "tepe",
    "sabah", "öğle", "akşam", "gece", "hafta", "ay", "yıl", "bugün", "yarın", "dün",
    "beyaz", "siyah", "kırmızı", "mavi", "yeşil", "sarı", "turuncu", "mor", "pembe", "gri",
  ],
  medium: [
    "matematik", "edebiyat", "coğrafya", "tarih", "fizik", "kimya", "biyoloji", "felsefe",
    "geometri", "istatistik", "cebir", "analiz", "trigonometri", "logaritma", "fonksiyon", "denklem",
    "paragraf", "dilbilgisi", "sözcük", "cümle", "anlatım", "okuduğunu", "yazılı", "sözlü",
    "deney", "hipotez", "teori", "formül", "element", "bileşik", "karışım", "çözelti",
    "ekonomi", "demokrasi", "cumhuriyet", "anayasa", "devlet", "toplum", "siyaset", "hukuk",
    "astronomi", "evren", "gezegen", "yıldız", "galaksi", "uzay", "uydu", "atmosfer",
    "algoritma", "program", "bilgisayar", "internet", "teknoloji", "yazılım", "donanım", "veri",
    "strateji", "planlama", "araştırma", "değerlendirme", "sınav", "başarı", "gelişim", "hedef",
    "enerji", "hareket", "kuvvet", "hız", "ivme", "kütle", "ağırlık", "basınç",
    "nüfus", "yerleşim", "iklim", "bitki", "hayvan", "ekosistem", "çevre", "doğa",
    "roman", "şiir", "hikaye", "masal", "tiyatro", "deneme", "eleştiri", "biyografi",
    "devrim", "reform", "savaş", "barış", "antlaşma", "fetih", "göç", "medeniyet",
  ],
  hard: [
    "epistemoloji", "paradigma", "fonetik", "morfoloji", "sentaks", "semantik", "pragmatik",
    "determinizm", "rasyonalizm", "empirizm", "pozitivizm", "materyalizm", "idealizm",
    "metafizik", "ontoloji", "aksiyoloji", "hermeneutik", "fenomenoloji", "diyalektik",
    "asimilasyon", "akomodasyon", "entegrasyon", "sosyalizasyon", "küreselleşme",
    "fotosntez", "mitokondri", "kloroplast", "homeostazi", "metabolizma", "katabolizma",
    "termodinamik", "elektromanyetik", "kuantum", "izafiyet", "entropi", "spektrum",
    "stokiyometri", "elektroliz", "polimerizasyon", "oksidasyon", "redüksiyon", "katalizör",
    "diferansiyel", "integral", "asimptot", "parabola", "hiperbol", "elips", "vektör",
    "oligarşi", "teokrasi", "otokrasi", "meritokrasi", "bürokrasi", "konfederasyon",
    "paleontoloji", "arkeoloji", "antropoloji", "etimoloji", "kronoloji", "metodoloji",
    "heterosfer", "troposfer", "stratosfer", "mezosfer", "termosfer", "iyonosfer",
    "psikanaliz", "bilinçaltı", "algı", "motivasyon", "tutum", "davranış", "kişilik",
    "korelasyon", "regresyon", "varyans", "standart", "medyan", "olasılık", "permütasyon",
  ],
};

export const TURKISH_PHRASES = {
  easy: [
    "güneş doğdu", "kitap okudum", "okula gittim", "yemek yedim", "park gezdim",
    "çiçek açtı", "yağmur yağdı", "rüzgar esti", "müzik dinledim", "resim çizdim",
    "top oynadım", "film izledim", "ders çalıştım", "arkadaşımla konuştum", "erken kalktım",
    "çay içtim", "ekmek aldım", "mektup yazdım", "şarkı söyledim", "fotoğraf çektim",
    "ağaç dikti", "bahçe suladı", "çorba pişirdi", "ütü yaptı", "bulaşık yıkadı",
    "hayvanat bahçesi", "lunapark gezisi", "deniz kenarı", "dağ yürüyüşü", "piknik yapma",
    "sabah kahvaltısı", "akşam yemeği", "öğle arası", "hafta sonu", "yaz tatili",
    "anne sevgisi", "baba şefkati", "kardeş bağı", "aile birliği", "dostluk değeri",
    "beyaz bulut", "mavi gökyüzü", "yeşil çimen", "kırmızı gül", "sarı papatya",
    "küçük kedi", "büyük köpek", "renkli kuş", "hızlı tavşan", "yavaş kaplumbağa",
  ],
  medium: [
    "bilimsel araştırma yöntemi", "deneme sınavı sonuçları", "ders çalışma planı",
    "matematik formül çözümü", "paragraf anlama tekniği", "geometri temel kavramları",
    "fizik deney raporu", "kimya laboratuvar çalışması", "biyoloji hücre yapısı",
    "tarih kronoloji tablosu", "coğrafya iklim bölgeleri", "edebiyat akımları dönemi",
    "felsefe temel soruları", "sosyoloji toplum yapısı", "psikoloji davranış analizi",
    "ekonomi arz talep", "hukuk temel ilkeleri", "siyaset bilimi kavramları",
    "çevre kirliliği önleme", "enerji tasarrufu yöntemleri", "geri dönüşüm bilinci",
    "sağlıklı beslenme alışkanlıkları", "düzenli uyku programı", "fiziksel aktivite önemi",
    "eleştirel düşünme becerisi", "problem çözme stratejisi", "yaratıcı düşünce geliştirme",
    "iletişim becerileri güçlendirme", "zaman yönetimi planlaması", "hedef belirleme süreci",
    "dijital okuryazarlık eğitimi", "medya okuryazarlığı farkındalığı", "bilgi teknolojileri kullanımı",
    "sürdürülebilir kalkınma hedefleri", "yenilenebilir enerji kaynakları", "küresel ısınma etkileri",
    "toplumsal cinsiyet eşitliği", "insan hakları evrensel beyannamesi", "demokratik değerler bilinci",
    "sanatsal ifade biçimleri", "kültürel miras koruma", "müze ve sergi ziyareti",
  ],
  hard: [
    "epistemolojik bilgi kuramı yaklaşımları", "fenomenolojik araştırma metodolojisi uygulamaları",
    "toplumsal değişim dinamikleri analizi", "ekonomik kalkınma stratejileri değerlendirmesi",
    "ekolojik denge koruma mekanizmaları", "nörobilimsel öğrenme süreçleri araştırmaları",
    "kuantum fiziği temel prensipleri açıklaması", "moleküler biyoloji genetik şifre çözümü",
    "stokiyometrik hesaplama yöntemleri uygulaması", "diferansiyel denklem çözüm teknikleri",
    "psikanalitik kuram temel varsayımları açıklaması", "bilişsel gelişim evreleri değerlendirmesi",
    "postmodern edebiyat akımı özellikleri incelemesi", "romantizm dönemi sanat anlayışı karşılaştırması",
    "uluslararası ilişkiler teorileri çerçevesi analizi", "makroekonomik göstergeler değerlendirmesi",
    "biyokimyasal reaksiyon mekanizmaları incelemesi", "termodinamik yasaları uygulama örnekleri",
    "istatistiksel hipotez testi uygulama adımları", "olasılık dağılımı hesaplama yöntemleri",
  ],
};

// ==================== YARDIMCI FONKSİYONLAR ====================

/**
 * Fisher-Yates shuffle algoritması
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Schulte tablosu grid'i oluştur (1'den N*N'e kadar karışık sayılar)
 */
export function generateSchulteGrid(size: number): number[] {
  const numbers = Array.from({ length: size * size }, (_, i) => i + 1);
  return shuffleArray(numbers);
}

/**
 * Rastgele rakam dizisi oluştur
 */
export function generateRandomDigits(minLength: number, maxLength: number): string {
  const length = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
  let result = "";
  // İlk rakam 0 olmasın
  result += Math.floor(Math.random() * 9) + 1;
  for (let i = 1; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

/**
 * Diziden rastgele N eleman seç (tekrarsız)
 */
export function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Zorluk seviyesine göre kelime havuzundan rastgele kelimeler al
 */
export function getWordsForDifficulty(difficulty: number, count: number): string[] {
  let pool: string[];
  if (difficulty <= 2) {
    pool = TURKISH_WORDS.easy;
  } else if (difficulty <= 4) {
    pool = [...TURKISH_WORDS.easy, ...TURKISH_WORDS.medium];
  } else {
    pool = [...TURKISH_WORDS.medium, ...TURKISH_WORDS.hard];
  }
  return getRandomItems(pool, count);
}

/**
 * Zorluk seviyesine göre ifade havuzundan rastgele ifadeler al
 */
export function getPhrasesForDifficulty(difficulty: number, count: number): string[] {
  let pool: string[];
  if (difficulty <= 2) {
    pool = TURKISH_PHRASES.easy;
  } else if (difficulty <= 4) {
    pool = [...TURKISH_PHRASES.easy, ...TURKISH_PHRASES.medium];
  } else {
    pool = [...TURKISH_PHRASES.medium, ...TURKISH_PHRASES.hard];
  }
  return getRandomItems(pool, count);
}

/**
 * Tachistoscope modu için öğe oluştur
 */
export function generateTachistoscopeItem(
  mode: "word" | "phrase" | "number",
  difficulty: number
): string {
  switch (mode) {
    case "word":
      return getWordsForDifficulty(difficulty, 1)[0];
    case "phrase":
      return getPhrasesForDifficulty(difficulty, 1)[0];
    case "number": {
      const lengths: Record<number, [number, number]> = {
        1: [3, 4],
        2: [4, 5],
        3: [5, 6],
        4: [6, 7],
        5: [7, 9],
      };
      const [min, max] = lengths[difficulty] || [4, 6];
      return generateRandomDigits(min, max);
    }
  }
}

/**
 * Peripheral vision egzersizi için yanlış seçenekler oluştur
 */
export function generateDistractors(
  correctWords: string[],
  count: number
): string[] {
  const allWords = [...TURKISH_WORDS.easy, ...TURKISH_WORDS.medium];
  const filtered = allWords.filter((w) => !correctWords.includes(w));
  return getRandomItems(filtered, count);
}
