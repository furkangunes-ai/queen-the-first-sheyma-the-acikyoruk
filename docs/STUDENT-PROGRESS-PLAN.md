# Öğrenci İlerleme & Akıllı Öneri Sistemi — v2 Aksiyomatik Plan

> **Tarih:** 2026-03-15
> **Branch:** `claude/student-progress-schedule-nbZ6s`
> **4 Fazlı PR Stratejisi**

---

## Aksiyomatik Temeller

Bu plan, endüstri standardı varsayımları yıkarak üç tartışmasız gerçek üzerine inşa edilmiştir:

### Aksiyom 1: Sinyal ve Gürültü (Bilgi Kuramı)
Deneme sonucu mutlak gerçek (ground truth) değil, **gürültülü bir sinyaldir** (noisy signal).
Doğru cevap, öğrencinin konuyu bilme olasılığını artırır ama kesinlemez.
Model: **Bayes Teoremi** ile posterior güncelleme.

```
P(Bilgi | DoğruCevap) = P(DoğruCevap | Bilgi) · P(Bilgi) / P(DoğruCevap)
```

### Aksiyom 2: Hız = Nöral Miyelinasyon (Fizik)
Bir soruyu hızlı çözmek ile yavaş çözmek, farklı ustalık seviyelerini gösterir.
Model: `V_subject = T_total / N_attempted` ortalama hız, topic complexity ile ağırlıklandırılır.

### Aksiyom 3: Minimum Direnç Yolu (Psikoloji)
Sistem diktatör değil, **çevre mimarı**. Öğrenci farkında olmadan doğru yola girer.
Navigasyon sürtünmedir. Karar verme yorgunluğu düşmandır. Tek buton = tek aksiyon.

---

## Yıkılan Varsayımlar

| Eski Varsayım | Gerçek |
|---|---|
| "Yanlış yapmamak = biliyor" | Şans, eleme, düşük zorluk → illüzyon. Sadece Bayesyen olasılık artışı. |
| "0-100 deterministik skor" | İnsan bilişi olasılıksal ağ. Nokta tahmin yerine **güven aralığı**. |
| "Öğrenciye 'yanlış çalışıyorsun' de" | Savunma mekanizması tetikler. Veri sunmak davranış değiştirmez. |

---

## Faz 1: Olasılıksal Biliş Motoru (Probabilistic Cognition Engine)

**PR Adı:** `feat: bayesian topic mastery engine with beta distributions`

### 1.1 Temel Model: Beta Dağılımı

Her (userId, topicId) çifti için bir **Beta(α, β)** dağılımı tutulur.

```
Beta(α, β):
  - α: "Bilgi var" yönünde biriken kanıt gücü
  - β: "Bilgi yok" yönünde biriken kanıt gücü
  - Prior (sıfır veri): Beta(1, 1) = uniform (hiçbir şey bilmiyoruz)
  - Ortalama (mean): μ = α / (α + β)
  - Varyans: σ² = αβ / ((α+β)²(α+β+1))
  - %95 CI: [μ - 1.96σ, μ + 1.96σ] (clamp 0-1)
```

**Neden Beta?**
- Conjugate prior: Bernoulli gözlemlerle (başarı/başarısızlık) güncellendiğinde posterior yine Beta.
- α ve β doğrudan "kaç tane pozitif/negatif kanıt birikmiş" anlamına gelir.
- Veri arttıkça CI daralır → belirsizlik azalır.

### 1.2 Bayesyen Güncelleme Kuralları

#### Sinyal 1: Denemede Yanlış Yapma (Negatif Kanıt)

```typescript
// CognitiveVoid tespit edildiğinde (topic ile eşleşmiş)
function updateFromError(
  alpha: number, beta: number,
  voidSeverity: number,
  speedWeight: number  // Aksiyom 2
): { alpha: number; beta: number } {
  // Severity katsayıları (severity.ts'den):
  // KAVRAM_YANILGISI: 1.0, BILGI_EKSIKLIGI: 0.8, SURE_YETISMEDI: 0.4, ...
  //
  // Hız ağırlığı: hızlı yanlış = daha az negatif (acele etmiş olabilir)
  //               yavaş yanlış = daha fazla negatif (düşünüp de yapamamış)
  //
  // speedWeight: 0.5 (hızlı) - 1.5 (yavaş)
  const negativeDelta = voidSeverity * speedWeight;

  return {
    alpha,
    beta: beta + negativeDelta
  };
}
```

#### Sinyal 2: Denemede Yanlış Yapmama (Gürültülü Pozitif Kanıt)

```typescript
// Konu sınanmış ama CognitiveVoid yok
function updateFromImplicitPositive(
  alpha: number, beta: number,
  discriminationFactor: number,  // Sorunun ayırt ediciliği (0.1 - 1.0)
  speedWeight: number            // Aksiyom 2
): { alpha: number; beta: number } {
  // Varsayım Yıkımı: "Yanlış yapmamak = biliyor" DEĞİL.
  //
  // Pozitif sinyalin gücü discriminationFactor'e bağlı:
  // - Kolay soru (disc=0.2): yanlış yapmamak çok az şey kanıtlar
  // - Zor soru (disc=0.8): yanlış yapmamak güçlü kanıt
  //
  // Hız ağırlığı: hızlı doğru = daha fazla pozitif (gerçekten biliyor)
  //               yavaş doğru = daha az pozitif (eleme/şans olabilir)
  //
  // speedWeight: 1.5 (hızlı) - 0.5 (yavaş)
  const positiveDelta = discriminationFactor * speedWeight;

  return {
    alpha: alpha + positiveDelta,
    beta
  };
}
```

#### Sinyal 3: Self-Rating (Informative Prior Shift)

```typescript
// Öğrenci kendine 0-5 arası puan verdiğinde
function updateFromSelfRating(
  alpha: number, beta: number,
  level: number  // 0-5
): { alpha: number; beta: number } {
  // Self-rating, zayıf bir sinyal (öğrenci kendini yanıltabilir)
  // Ama hiç veri yokken çok değerli (warm start)
  //
  // Ağırlık: 2 (sınav verisinin ~1/3'ü kadar güçlü)
  const selfWeight = 2.0;
  const selfMastery = level / 5;  // 0-1 normalize

  return {
    alpha: alpha + selfMastery * selfWeight,
    beta: beta + (1 - selfMastery) * selfWeight
  };
}
```

#### Sinyal 4: Çalışma Oturumu (DailyStudy + TopicReview)

```typescript
// Öğrenci konuya çalışıp soru çözdüğünde
function updateFromStudy(
  alpha: number, beta: number,
  correctRatio: number,   // 0-1 (doğru/toplam)
  questionCount: number   // çözülen soru sayısı
): { alpha: number; beta: number } {
  // Her doğru soru zayıf bir pozitif sinyal (sınav kadar güçlü değil)
  // Her yanlış soru zayıf bir negatif sinyal
  const studyWeight = 0.3;  // Çalışma sinyali, sınav sinyalinin ~1/3'ü
  const positives = correctRatio * questionCount * studyWeight;
  const negatives = (1 - correctRatio) * questionCount * studyWeight;

  return {
    alpha: alpha + positives,
    beta: beta + negatives
  };
}
```

### 1.3 Discrimination Factor (Ayırt Edicilik Katsayısı)

Her konu için sabit bir discrimination factor yok (sınav soruları dışarıdan geliyor).
**Proxy hesaplama:**

```typescript
// Bir konunun o sınavdaki "ayırt edicilik" tahmini:
function estimateDiscrimination(
  subjectResult: ExamSubjectResult,
  topic: Topic,
  totalTopicsInSubject: number
): number {
  // 1. Sınav zorluğu proxy'si: o dersteki genel net oranı
  const totalQuestions = subjectResult.correctCount + subjectResult.wrongCount + subjectResult.emptyCount;
  const successRate = subjectResult.correctCount / Math.max(totalQuestions, 1);

  // Düşük genel başarı → zor sınav → doğru yapmak daha anlamlı
  // Yüksek genel başarı → kolay sınav → doğru yapmak daha az anlamlı
  const examDifficultyFactor = 1.0 - successRate * 0.5;  // 0.5 - 1.0 arası

  // 2. Konu zorluğu (Topic.difficulty: 1-5)
  const topicDifficultyFactor = topic.difficulty / 5;  // 0.2 - 1.0

  // 3. Konu "oransal ağırlık" — derste kaç konudan biri?
  // Çok konulu derstte tek konuda yanlış yapmamak daha az şey söyler
  const coverageFactor = Math.min(1.0, 3 / totalTopicsInSubject);  // 3 konu = max

  // Final discrimination: 0.1 - 1.0 arası
  return Math.max(0.1, examDifficultyFactor * topicDifficultyFactor * coverageFactor);
}
```

### 1.4 Hız Ağırlığı (Speed Weight) — Aksiyom 2

ExamSubjectResult'a `durationMinutes` alanı eklenir (ders bazında toplam süre).

```typescript
// Ders bazında ortalama hız hesapla
function calculateSpeedWeight(
  durationMinutes: number | null,
  attemptedQuestions: number,  // correct + wrong (empty hariç, zaman harcamamış)
  topic: Topic
): number {
  if (!durationMinutes || attemptedQuestions === 0) {
    return 1.0;  // Süre verisi yoksa nötr ağırlık
  }

  // Ortalama soru başına dakika
  const avgMinutesPerQuestion = durationMinutes / attemptedQuestions;

  // Beklenen soru başına dakika (konu zorluğuna göre)
  // TYT: ~1.5dk/soru, AYT: ~2.5dk/soru (genel ortalama)
  // Complexity 1-2: beklenen sürenin %70'i, Complexity 4-5: beklenen sürenin %130'u
  const baseExpected = topic.difficulty <= 3 ? 1.5 : 2.5;
  const complexityFactor = 0.7 + (topic.difficulty / 5) * 0.6;
  const expectedMinutes = baseExpected * complexityFactor;

  // Hız oranı: <1 = hızlı, >1 = yavaş
  const speedRatio = avgMinutesPerQuestion / expectedMinutes;

  // Hız ağırlığı dönüşümü:
  // Hızlı (ratio 0.5) → pozitif için 1.5, negatif için 0.5
  // Normal (ratio 1.0) → 1.0
  // Yavaş (ratio 2.0) → pozitif için 0.5, negatif için 1.5
  return Math.max(0.3, Math.min(2.0, 1.0 / speedRatio));
  // NOT: Bu değer pozitif güncelleme için direkt kullanılır.
  // Negatif güncelleme için 2.0 - speedWeight kullanılır (ters orantı).
}
```

### 1.5 Fuzzy Kategori Eşlemesi (UI Katmanı)

Beta posteriorundan CI hesapla, CI alt sınırına göre kategori ata:

```typescript
interface MasteryEstimate {
  mean: number;           // μ = α/(α+β)
  ci95Lower: number;      // %95 CI alt sınır
  ci95Upper: number;      // %95 CI üst sınır
  confidence: number;     // 1/varyans normalize — veri miktarının proxy'si
  category: MasteryCategory;
  categoryLabel: string;
  evidenceCount: number;  // α + β - 2 (prior çıkarılmış toplam kanıt)
}

type MasteryCategory = 'unknown' | 'weak' | 'developing' | 'strong' | 'mastered';

function categorize(ci95Lower: number, evidenceCount: number): MasteryCategory {
  // Yetersiz veri → "Belirsiz" (henüz yargı veremiyor)
  if (evidenceCount < 3) return 'unknown';

  // CI ALT SINIRI baz alınır (kötümser tahmin — gerçekçi)
  if (ci95Lower < 0.25) return 'weak';        // Zayıf
  if (ci95Lower < 0.50) return 'developing';   // Gelişiyor
  if (ci95Lower < 0.75) return 'strong';       // Güçlü
  return 'mastered';                            // Uzman
}

const CATEGORY_LABELS: Record<MasteryCategory, string> = {
  unknown:    'Belirsiz',
  weak:       'Zayıf',
  developing: 'Gelişiyor',
  strong:     'Güçlü',
  mastered:   'Uzman',
};
```

### 1.6 Schema Değişikliği

**Yeni model: `TopicBelief`** (Beta dağılım parametreleri)

```prisma
model TopicBelief {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  topicId   String
  topic     Topic    @relation(fields: [topicId], references: [id])
  alpha     Float    @default(1.0)   // Pozitif kanıt gücü
  beta      Float    @default(1.0)   // Negatif kanıt gücü
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  @@unique([userId, topicId])
  @@index([userId])
}
```

**ExamSubjectResult'a eklenen alan:**

```prisma
model ExamSubjectResult {
  // ... mevcut alanlar
  durationMinutes  Int?    // Ders bazında toplam harcanan süre (dakika)
}
```

### 1.7 Yeni Dosyalar

```
lib/bayesian-engine.ts              # Beta dağılım hesaplamaları (saf fonksiyonlar)
lib/bayesian-engine.test.ts         # Unit test
app/api/student/mastery/route.ts    # GET: tüm konuların posterior + CI + kategori
prisma/migrations/xxx_topic_belief/ # Schema migration
```

### 1.8 API Tasarımı

**GET `/api/student/mastery`**

Query params: `examTypeId?`, `subjectId?`

```json
{
  "beliefs": [
    {
      "topicId": "...",
      "topicName": "Türev",
      "subjectName": "Matematik",
      "examTypeName": "AYT",
      "alpha": 8.4,
      "beta": 3.2,
      "mean": 0.724,
      "ci95Lower": 0.52,
      "ci95Upper": 0.88,
      "category": "strong",
      "categoryLabel": "Güçlü",
      "evidenceCount": 9.6,
      "speedAvg": 1.2
    }
  ],
  "meta": {
    "totalTopics": 150,
    "unknownCount": 63,
    "weakCount": 12,
    "developingCount": 28,
    "strongCount": 35,
    "masteredCount": 12
  }
}
```

### 1.9 `lib/bayesian-engine.ts` — Fonksiyon İmzaları

```typescript
// Temel Beta hesaplamaları
export function betaMean(alpha: number, beta: number): number;
export function betaVariance(alpha: number, beta: number): number;
export function betaCI95(alpha: number, beta: number): { lower: number; upper: number };
export function betaCategory(ci95Lower: number, evidenceCount: number): MasteryCategory;

// Bayesyen güncelleme fonksiyonları (saf, side-effect yok)
export function updateFromExamError(
  alpha: number, beta: number,
  severity: number, speedWeight: number
): { alpha: number; beta: number };

export function updateFromImplicitPositive(
  alpha: number, beta: number,
  discriminationFactor: number, speedWeight: number
): { alpha: number; beta: number };

export function updateFromSelfRating(
  alpha: number, beta: number,
  level: number // 0-5
): { alpha: number; beta: number };

export function updateFromStudySession(
  alpha: number, beta: number,
  correctRatio: number, questionCount: number
): { alpha: number; beta: number };

// Hız ve ayırt edicilik hesaplamaları
export function calculateSpeedWeight(
  durationMinutes: number | null,
  attemptedQuestions: number,
  topicDifficulty: number
): number;

export function estimateDiscrimination(
  successRate: number,
  topicDifficulty: number,
  totalTopicsInSubject: number
): number;

// Tam posterior hesaplama (tüm sinyalleri birleştir)
export function computeTopicBelief(
  currentAlpha: number, currentBeta: number,
  signals: BeliefSignal[]
): { alpha: number; beta: number };

// Sinyal tipleri
export type BeliefSignal =
  | { type: 'exam_error'; severity: number; speedWeight: number }
  | { type: 'implicit_positive'; discrimination: number; speedWeight: number }
  | { type: 'self_rating'; level: number }
  | { type: 'study_session'; correctRatio: number; questionCount: number };
```

---

## Faz 2: Çevre Mimarisi Motoru (Environment Architecture Engine)

**PR Adı:** `feat: frictionless guidance engine with ROI-based action selection`

### 2.1 Temel Felsefe

Sistem "ne yapman gerektiğini söylemiyor", **en verimli aksiyonu doğrudan önüne koyuyor**.

Newton'un Eylemsizlik Prensibi: Duran cisim durmaya devam eder. Her ekstra tıklama = vazgeçme olasılığı.

### 2.2 ROI (Yatırım Getirisi) Hesaplama

Her konu için "şu an çalışırsam, toplam sınav performansıma olan marjinal katkısı" hesaplanır:

```typescript
interface TopicROI {
  topicId: string;
  topicName: string;
  subjectName: string;
  roi: number;              // Ana sıralama metriği
  reason: ROIReason;        // Neden bu konu? (UI'da mesaj olarak kullanılmaz)
  estimatedDuration: number; // Tahmini çalışma süresi (dk)
  actionType: ActionType;    // Ne yapmalı?
}

type ROIReason =
  | 'retention_critical'    // Ebbinghaus eşiği: R < 0.85 (unutmak üzere)
  | 'dag_bottleneck'        // DAG darboğazı: parent zayıf, child'ları kilitleniyor
  | 'high_weight_weak'      // Yüksek sınav ağırlığı + zayıf belief
  | 'quick_win'             // CI %50-75, az çabayla güçlü'ye çıkar
  | 'new_topic'             // Hiç veri yok (unknown), keşfedilmeli
  | 'spaced_review'         // Spaced repetition zamanlama geldi

type ActionType =
  | 'focused_practice'      // Soru çöz (CMS yeterli, pratik gerek)
  | 'concept_study'         // Konu anlatımı (temel eksik)
  | 'spaced_review'         // Aralıklı tekrar (iyi ama unutuluyor)
  | 'explore'               // Keşfet (hiç veri yok)
```

**ROI Formülü:**

```typescript
function calculateTopicROI(
  belief: { alpha: number; beta: number },
  topic: Topic,
  subject: Subject,
  dagContext: DAGContext,       // Ceiling penalty, child count
  retentionInfo: RetentionInfo | null,
  spacedRepItems: SpacedRepetitionItem[],
  totalSubjectQuestions: number // Tüm dersler toplam soru
): TopicROI {
  const mean = betaMean(belief.alpha, belief.beta);
  const ci = betaCI95(belief.alpha, belief.beta);
  const evidenceCount = belief.alpha + belief.beta - 2;

  // 1. Sınav Ağırlığı: Bu dersin sınavdaki soru oranı
  const examWeight = subject.questionCount / totalSubjectQuestions;

  // 2. Kazanım Potansiyeli: Düşük mastery = yüksek kazanım potansiyeli
  // Ama çok düşükse (mean < 0.2) kazanım da yavaş olur (temel eksik)
  const gainPotential = mean < 0.2
    ? 0.6                           // Temelden başlamak yavaştır
    : (1.0 - mean);                 // Normal: ne kadar düşükse o kadar kazanç

  // 3. DAG Kaldıracı: Bu konuya çalışmak kaç child konunun kilidini açar?
  // dagContext.childCount: bu node'un kaç child'ı var
  // dagContext.ceilingPenalty: bu node yüzünden child'lar ne kadar ceza alıyor
  const dagLeverage = 1.0 + dagContext.ceilingPenalty * dagContext.childCount * 0.3;

  // 4. Aciliyet Çarpanı
  let urgencyMultiplier = 1.0;
  let reason: ROIReason = 'high_weight_weak';

  // Retention kritiği (Ebbinghaus eşiği aşılmak üzere)
  if (retentionInfo && retentionInfo.isCritical && mean > 0.3) {
    urgencyMultiplier = 2.0;
    reason = 'retention_critical';
  }
  // DAG darboğazı (parent zayıf, child'lar kilitleniyor)
  else if (dagContext.ceilingPenalty > 0.3 && dagContext.childCount >= 2) {
    urgencyMultiplier = 1.8;
    reason = 'dag_bottleneck';
  }
  // Spaced repetition zamanı gelmiş
  else if (spacedRepItems.length > 0) {
    urgencyMultiplier = 1.5;
    reason = 'spaced_review';
  }
  // Quick win (biraz çabayla büyük ilerleme)
  else if (ci.lower >= 0.4 && ci.lower < 0.65 && evidenceCount >= 5) {
    urgencyMultiplier = 1.3;
    reason = 'quick_win';
  }
  // Keşfedilmemiş konu (belirsiz)
  else if (evidenceCount < 3) {
    urgencyMultiplier = 0.8; // Düşük — önce bilinen konulardaki açıkları kapat
    reason = 'new_topic';
  }

  // ROI = examWeight × gainPotential × dagLeverage × urgency
  const roi = examWeight * gainPotential * dagLeverage * urgencyMultiplier;

  // Aksiyon tipi belirleme
  const actionType = determineAction(mean, evidenceCount, reason);

  return {
    topicId: topic.id,
    topicName: topic.name,
    subjectName: subject.name,
    roi: Math.round(roi * 1000) / 1000,
    reason,
    estimatedDuration: estimateStudyDuration(mean, topic.difficulty),
    actionType,
  };
}

function determineAction(mean: number, evidenceCount: number, reason: ROIReason): ActionType {
  if (reason === 'spaced_review') return 'spaced_review';
  if (evidenceCount < 3) return 'explore';
  if (mean < 0.3) return 'concept_study';       // Temelden çalışmalı
  if (mean < 0.6) return 'focused_practice';     // Pratik gerek
  return 'spaced_review';                        // İyi, sadece tekrar
}

function estimateStudyDuration(mean: number, difficulty: number): number {
  // Düşük mastery + yüksek zorluk = daha uzun süre
  const base = 20; // dakika
  const masteryFactor = 1 + (1 - mean) * 0.5;  // 1.0 - 1.5
  const difficultyFactor = 0.8 + difficulty * 0.1; // 0.9 - 1.3
  return Math.round(base * masteryFactor * difficultyFactor);
}
```

### 2.3 "Sıradaki Hamle" Seçici

KnapsackPlanner'ın rafine edilmiş hali. Tek bir en optimal aksiyonu seçer:

```typescript
interface NextAction {
  primary: TopicROI;              // En yüksek ROI'li konu
  alternatives: TopicROI[];       // Sonraki 2 alternatif (seçenek sunmak için)
  sessionDuration: number;        // Önerilen oturum süresi (dk)
  dailyBudgetRemaining: number;   // Bugün kalan çalışma bütçesi (dk)
}

function selectNextAction(
  allROIs: TopicROI[],
  studentProfile: StudentProfile,
  todayCompletedMinutes: number
): NextAction {
  // ROI'ye göre azalan sırala
  const sorted = [...allROIs].sort((a, b) => b.roi - a.roi);

  // Çeşitlilik kısıtı: art arda aynı dersten 2 konu önerme
  // (cognitive interleaving — farklı dersler arası geçiş öğrenmeyi güçlendirir)
  const diversified = applyDiversityConstraint(sorted);

  const dailyBudget = (studentProfile.dailyStudyHours ?? 3) * 60;
  const remaining = dailyBudget - todayCompletedMinutes;

  return {
    primary: diversified[0],
    alternatives: diversified.slice(1, 3),
    sessionDuration: Math.min(diversified[0].estimatedDuration, remaining),
    dailyBudgetRemaining: Math.max(0, remaining),
  };
}
```

### 2.4 Yeni Dosyalar

```
lib/roi-engine.ts                       # ROI hesaplama + next action seçici
lib/roi-engine.test.ts                  # Unit test
app/api/student/next-action/route.ts    # GET: sıradaki en optimal aksiyon
```

### 2.5 API Tasarımı

**GET `/api/student/next-action`**

```json
{
  "primary": {
    "topicId": "...",
    "topicName": "Üslü Sayılar",
    "subjectName": "Matematik",
    "roi": 0.847,
    "reason": "retention_critical",
    "estimatedDuration": 25,
    "actionType": "spaced_review",
    "belief": {
      "mean": 0.68,
      "category": "strong",
      "categoryLabel": "Güçlü",
      "ci95Lower": 0.52,
      "ci95Upper": 0.84
    }
  },
  "alternatives": [
    {
      "topicId": "...",
      "topicName": "Türev",
      "subjectName": "Matematik",
      "roi": 0.723,
      "reason": "dag_bottleneck",
      "estimatedDuration": 30,
      "actionType": "focused_practice",
      "belief": { "mean": 0.41, "category": "developing", ... }
    }
  ],
  "sessionDuration": 25,
  "dailyBudgetRemaining": 155,
  "todayCompleted": {
    "sessions": 2,
    "totalMinutes": 45,
    "topicsCovered": ["Paragraf", "Fonksiyonlar"]
  }
}
```

---

## Faz 3: Deneme Sonrası Bayesyen Güncelleme (Post-Exam Signal Processing)

**PR Adı:** `feat: post-exam bayesian belief updates with speed weighting`

### 3.1 Tetikleme Noktası

`POST /api/exams/[id]/results` endpoint'i çalıştıktan sonra (mevcut CognitiveVoid oluşturma sonrası) Bayesyen güncelleme tetiklenir.

### 3.2 Akış

```
1. Exam results submitted (mevcut akış: ExamSubjectResult + CognitiveVoid oluşturma)
                ↓
2. Post-processing tetiklenir
                ↓
3. Her subject result için:
   a. O dersteki tüm topic'leri getir
   b. O sınavdaki CognitiveVoid'ları getir (topic ile eşleşmiş olanlar)
   c. Speed weight hesapla (durationMinutes / attemptedQuestions)
   d. Her topic için:
      - CognitiveVoid VARSA → updateFromExamError(severity, speedWeight)
      - CognitiveVoid YOKSA → updateFromImplicitPositive(discrimination, speedWeight)
   e. TopicBelief güncelle (upsert)
```

### 3.3 "Sınanmış mı?" Tespiti (Deneme vs Branş Filtresi)

```typescript
function wasTopicTested(
  topic: Topic,
  exam: Exam,
  subjectResult: ExamSubjectResult | null
): boolean {
  // 1. Bu dersin sonucu yoksa → sınanmamış
  if (!subjectResult) return false;

  // 2. Genel deneme → tüm konular sınanmış
  if (!exam.examCategory || exam.examCategory === 'genel') return true;

  // 3. Branş denemesi → sadece branşa ait dersler
  // Bu filtreleme zaten subject result oluşturulurken yapılıyor
  return true;
}
```

### 3.4 Örtük Pozitif Sinyalin Ağırlıklandırılması

**Varsayım Yıkımı Uygulaması:** Yanlış yapmamak ≠ biliyor.

```typescript
// Her sınanmış ama hatasız konu için:
async function processImplicitPositive(
  userId: string,
  topicId: string,
  topic: Topic,
  subjectResult: ExamSubjectResult,
  totalTopicsInSubject: number
) {
  // 1. Discrimination factor hesapla
  const totalQ = subjectResult.correctCount + subjectResult.wrongCount + subjectResult.emptyCount;
  const successRate = subjectResult.correctCount / Math.max(totalQ, 1);
  const discrimination = estimateDiscrimination(successRate, topic.difficulty, totalTopicsInSubject);

  // 2. Speed weight hesapla
  const attempted = subjectResult.correctCount + subjectResult.wrongCount;
  const speedWeight = calculateSpeedWeight(
    subjectResult.durationMinutes,
    attempted,
    topic.difficulty
  );

  // 3. Mevcut belief'i getir veya oluştur
  const belief = await getOrCreateBelief(userId, topicId);

  // 4. Bayesyen güncelleme
  const updated = updateFromImplicitPositive(
    belief.alpha, belief.beta,
    discrimination,
    speedWeight
  );

  // 5. Kaydet
  await upsertBelief(userId, topicId, updated.alpha, updated.beta);
}
```

### 3.5 Cold Phase Enrichment Sonrası Re-Update

Cold phase'de öğrenci bir void'a topicId eklediğinde:
- O topic'in belief'ine negatif sinyal eklenir (errorReason + severity bazlı)
- Eğer daha önce o topic "implicit positive" almışsa, bu doğal olarak dengelenir
  (çünkü Bayesyen güncelleme hem α hem β'ya kümülatif olarak ekleniyor)

### 3.6 Değişecek Dosyalar

```
app/api/exams/[id]/results/route.ts           # Post-processing eklenir
app/api/exams/[id]/cognitive-voids/route.ts    # Cold phase enrichment → belief re-update
lib/bayesian-engine.ts                         # Zaten Faz 1'de oluşturulmuş
components/exams/exam-entry-form.tsx           # durationMinutes input eklenir (ders bazı)
prisma/schema.prisma                           # durationMinutes + TopicBelief modeli
```

### 3.7 UX Değişikliği: Ders Süresi Girişi

Exam entry form'un Step 2'sine (Sayısal Veriler) her ders satırına opsiyonel bir "Süre" alanı eklenir:

```
┌─ Matematik ───────────────────────────┐
│ Doğru: [12]  Yanlış: [8]  Boş: [5]  │
│ Süre:  [__] dk  (opsiyonel)          │
└───────────────────────────────────────┘
```

Bu alan zorunlu değil. Girilmezse `speedWeight = 1.0` (nötr) kullanılır.

---

## Faz 4: Dashboard — Çevre Mimarisi UI

**PR Adı:** `feat: frictionless study session launcher on dashboard`

### 4.1 Temel Prensip

- **Navigasyon sürtünmedir** → sayfa değiştirmek yok
- **Karar yorgunluğu düşmandır** → tek buton, tek aksiyon
- **Negatif yargı savunma tetikler** → "yanlış çalışıyorsun" yerine "sıradaki hamlen"

### 4.2 Dashboard Düzeni (Revize)

```
1. Merhaba, {userName}!                    (mevcut)
2. 🆕 Sıradaki Hamlen                      (yeni — tek butonluk aksiyon)
3. Bugünün Planı                           (mevcut — haftalık plan öğeleri)
4. Ne yapmak istiyorsun?                   (mevcut — ActionHub)
```

**"Sıradaki Hamlen" Bugünün Planı'nın ÜSTÜNDE** çünkü:
- İlk gördüğü şey = ilk harekete geçtiği şey (Eylemsizlik Prensibi)
- Manuel plan sonra gelir (opsiyonel detay)

### 4.3 "Sıradaki Hamlen" Widget Tasarımı

**Varsayılan durum (collapsed):**

```
┌─────────────────────────────────────────────────┐
│ ┌─ gradient border (reason'a göre renk) ──────┐ │
│ │                                             │ │
│ │  Üslü Sayılar · Matematik                  │ │
│ │  ████████░░ Güçlü                           │ │
│ │                                             │ │
│ │  ┌────────────────────────────────────────┐ │ │
│ │  │        ▶  Hemen Başla  (25dk)          │ │ │
│ │  └────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │  · · ·  2 alternatif daha                   │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Hover/tıklama ile CI detay (Aksiyomatik Şeffaflık):**

```
┌─────────────────────────────────────────────────┐
│  Üslü Sayılar · Matematik                      │
│                                                 │
│  ░░░░[████████████]░░░░░                        │
│      52%        84%                             │
│    %95 güven aralığı                            │
│                                                 │
│  12 sınavdan 2 hata · Ort. hız: normal          │
│  Bu konuyu unutma eşiğine yaklaşıyor (R=83%)    │
└─────────────────────────────────────────────────┘
```

**"Hemen Başla" tıklandığında — Overlay Aksiyon Katmanı:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Üslü Sayılar                       │
│              Odaklanmış Pratik                   │
│                                                 │
│           ┌──────────────┐                      │
│           │    24:32     │                      │
│           │   ◉ Timer    │                      │
│           └──────────────┘                      │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │  Tamamlandı! Nasıl geçti?              │    │
│  │                                         │    │
│  │  Çözülen soru: [__]  Doğru: [__]       │    │
│  │                                         │    │
│  │  [Oturumu Bitir]                        │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

Oturum bittiğinde:
1. `DailyStudy` kaydı oluşturulur
2. `TopicBelief` Bayesyen güncelleme yapılır (correctRatio'ya göre)
3. Sonraki hamle otomatik yenilenir
4. Motivasyon: "Bugün 3. oturumun! 75 dakika çalıştın." (pozitif)

### 4.4 Alternatifleri Gösterme

"2 alternatif daha" tıklandığında aşağı açılır (accordion):

```
┌─ Alternatif 1 ─────────────────────────────────┐
│ Türev · Matematik · Gelişiyor                   │
│ Odaklanmış Pratik · ~30dk                       │
│                            [Bunu Seç]           │
└─────────────────────────────────────────────────┘
┌─ Alternatif 2 ─────────────────────────────────┐
│ Olasılık · Matematik · Zayıf                    │
│ Konu Anlatımı · ~35dk                           │
│                            [Bunu Seç]           │
└─────────────────────────────────────────────────┘
```

### 4.5 Boş Durum (Yetersiz Veri)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Seni tanımak için veriye ihtiyacım var.        │
│                                                 │
│  [Deneme Gir]     [Bilgi Seviyeni Belirle]      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.6 Bileşen Yapısı

```
components/home/next-action-widget.tsx     # Ana widget
components/home/study-session-overlay.tsx   # Pomodoro timer + oturum yönetimi
components/home/mastery-badge.tsx           # Fuzzy kategori rozeti + CI hover
components/home/belief-detail-popover.tsx   # CI detay popover
```

### 4.7 Dashboard Entegrasyonu

`app/(app)/page.tsx` değişikliği:
- `NextActionWidget` import ve yerleşimi
- `fetchData`'ya `/api/student/next-action` çağrısı eklenir
- `StudySessionOverlay` portal olarak render edilir (modal)

---

## Kenar Durumları & Matematiksel Garantiler

### Beta Dağılımı Stabilitesi

```
Prior: Beta(1, 1) — uniform
- Mean: 0.5
- CI95: [0.025, 0.975] — çok geniş (hiçbir şey bilmiyoruz)
- Kategori: "unknown" (evidenceCount < 3)

5 pozitif sinyal sonrası: Beta(6, 1)
- Mean: 0.857
- CI95: [0.572, 0.993]
- Kategori: "strong" (ciLower=0.572 > 0.50)

5 pozitif + 3 negatif sonrası: Beta(6, 4)
- Mean: 0.600
- CI95: [0.313, 0.853]
- Kategori: "developing" (ciLower=0.313 > 0.25)

20 pozitif + 2 negatif sonrası: Beta(21, 3)
- Mean: 0.875
- CI95: [0.712, 0.968]
- Kategori: "mastered" (ciLower=0.712 < 0.75 → "strong" aslında)
// 0.75 eşiği geçmesi için daha fazla kanıt lazım — bu DOĞRU davranış.
// Varsayım yıkımı: 20 denemede hata yapmamak bile
// otomatik "uzman" yapmıyor. CI alt sınırı hâlâ eşiğin altında olabilir.
```

### Hız Verisi Olmadığında

`durationMinutes = null` → `speedWeight = 1.0` (nötr). Sistem çalışmaya devam eder.
Hız verisi opsiyoneldir. Girildiğinde Bayesyen güncellemeyi ağırlıklandırır, girilmediğinde atlanır.

### Yeni Öğrenci (Sıfır Veri)

- Tüm konular Beta(1,1) → "Belirsiz"
- ROI engine unknown konulara düşük öncelik verir (önce bilinen açıkları kapat)
- Dashboard: "Seni tanımak için veriye ihtiyacım var" boş durumu
- İlk self-rating: Beta(1+level*0.4, 1+(5-level)*0.4) → hemen bir posterior oluşur

### DAG Bağlantısı Olmayan Konular

Bazı Topic'lerin henüz ConceptNode bağlantısı olmayabilir.
- ROI engine Topic seviyesinde çalışır (ConceptNode bağımsız)
- DAG leverage = 1.0 (nötr) — penalty/bonus yok
- Ebbinghaus retention = kullanılamaz (sadece ConceptNode'da) → nötr

### Recidivism (Nüksetme)

Mevcut CognitiveVoid recidivism sistemi korunur. Bayesyen motora etkisi:
- `relapseCount > 0` → severity çarpanı (1.5^n) → daha büyük β artışı
- Doğal sonuç: relapse eden konunun CI'ı hızla genişler ve kategori düşer

---

## Performans Düşünceleri

### Faz 1 — Batch Query Stratejisi

```typescript
// Tek seferde tüm verileri çek (N+1 query problemi yok):
const [topics, beliefs, voids, studies, reviews, examResults] = await Promise.all([
  prisma.topic.findMany({ include: { subject: { include: { examType: true } } } }),
  prisma.topicBelief.findMany({ where: { userId } }),
  prisma.cognitiveVoid.findMany({ where: { exam: { userId } } }),
  prisma.dailyStudy.findMany({ where: { userId } }),
  prisma.topicReview.findMany({ where: { userId } }),
  prisma.examSubjectResult.findMany({ where: { exam: { userId } }, include: { exam: true } }),
]);
// Memory'de map'le ve hesapla — saf fonksiyonlar, side-effect yok
```

### Faz 3 — Incremental Update

Deneme sonrası tüm belief'leri yeniden hesaplama YOK.
Sadece o sınavda sınanan konuların belief'leri güncellenir (incremental).

### Faz 4 — Client-Side Cache

Next action widget sonucu 5 dakika client-side cache'lenir (SWR/stale-while-revalidate).
Oturum bittiğinde cache invalidate → yeni next action fetch.

---

## Faz Sıralaması & Bağımlılıklar

```
Faz 1 (Bayesian Engine + Schema)
     ↓ TopicBelief modeli + bayesian-engine.ts
Faz 2 (ROI Engine + Next Action API)
     ↓ Faz 1'in belief verilerine bağımlı
Faz 3 (Post-Exam Auto-Update)
     ↓ Faz 1'in güncelleme fonksiyonlarına bağımlı
Faz 4 (Dashboard UI)
     ↓ Faz 2'nin next-action API'sine bağımlı
```

| Faz | Yeni Dosyalar | Değişen Dosyalar | Schema |
|-----|---------------|------------------|--------|
| 1 | `lib/bayesian-engine.ts`, `app/api/student/mastery/route.ts` | — | `TopicBelief` model + `durationMinutes` alan |
| 2 | `lib/roi-engine.ts`, `app/api/student/next-action/route.ts` | — | — |
| 3 | — | `app/api/exams/[id]/results/route.ts`, `components/exams/exam-entry-form.tsx` | — |
| 4 | `components/home/next-action-widget.tsx`, `components/home/study-session-overlay.tsx`, `components/home/mastery-badge.tsx` | `app/(app)/page.tsx` | — |

---

## Test Stratejisi

### Unit Test (Faz 1)
- `betaMean`, `betaVariance`, `betaCI95` — matematiksel doğruluk
- `updateFromExamError` — severity arttıkça β artışı doğrulanır
- `updateFromImplicitPositive` — discrimination düşükken α artışı az
- `calculateSpeedWeight` — hızlı çözüm = yüksek speedWeight

### Senaryo Testleri
1. **20 denemede hatasız konu**: Beta(1+20*disc, 1) → CI kontrol et, otomatik "uzman" olmamalı
2. **Sürekli yanlış + çok çalışma**: Yüksek β, orta α → CI geniş, kategori "zayıf"
3. **Hızlı doğru vs yavaş doğru**: Aynı discrimination, farklı speedWeight → farklı α artışı
4. **Relapse**: RESOLVED → tekrar yanlış → severity 1.5x → β sıçraması
5. **Boş veri**: Beta(1,1) → "Belirsiz" + boş durum UI
