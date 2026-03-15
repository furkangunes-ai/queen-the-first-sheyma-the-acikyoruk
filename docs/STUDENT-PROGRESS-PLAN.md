# Öğrenci İlerleme & Akıllı Öneri Sistemi — Detaylı Plan

> **Tarih:** 2026-03-15
> **Branch:** `claude/student-progress-schedule-nbZ6s`
> **4 Fazlı PR Stratejisi**

---

## Mevcut Durum Analizi

### Var Olanlar
1. **CognitiveVoid**: Yanlış/boş sorular kaydediliyor (deneme bazlı, konu bazlı)
2. **TopicKnowledge**: Öğrenci kendisi 0-5 arası bilgi seviyesi giriyor
3. **UserCognitiveState + DAG**: ConceptNode seviyesinde mastery + Ebbinghaus retention
4. **KnapsackPlanner**: ConceptNode seviyesinde haftalık plan oluşturma (ancak UI'da kullanılmıyor)
5. **Recommendations API** (`/api/strategy/recommendations`): Basit bir priority formülü var ama dashboard'da gösterilmiyor
6. **DailyStudy + TopicReview**: Çalışma oturumları kaydediliyor

### Kritik Eksiklikler
1. **Örtük Pozitif Sinyal Yok**: Öğrenci denemede bir konuda yanlış yapmadığında bu bilgi hiçbir yere yansımıyor
2. **Deneme Sonrası Otomatik Mastery Güncellemesi Yok**: Exam → CognitiveVoid oluşuyor ama TopicKnowledge/mastery otomatik güncellenmiyor
3. **Dashboard'da Öneri Widget'ı Yok**: Sadece haftalık plan gösteriliyor, sistem önerisi yok
4. **Analitik İçgörüler Yok**: "Yanlış çalışıyorsun", "Bu konuyu ihmal ediyorsun" gibi deterministik uyarılar
5. **Konu Bazlı Bütünleşik Skor Yok**: selfRating, examPerformance, studyHistory ayrı ayrı yaşıyor

---

## Faz 1: Deterministik Konu Hakimiyet Motoru (Topic Mastery Engine)

**PR Adı:** `feat: deterministic topic mastery engine`

Bu faz, tüm sistemin temeli. Bir öğrencinin her konudaki gerçek hakimiyet seviyesini deterministik olarak hesaplayan motor.

### 1.1 Composite Mastery Score (CMS) Algoritması

Her konu için 0-100 arası tek bir bütünleşik skor hesaplanır.

**Girdi Sinyalleri:**

| Sinyal | Kaynak | Ağırlık | Açıklama |
|--------|--------|---------|----------|
| `selfRating` | TopicKnowledge (0-5) | %20 | Öğrencinin kendi değerlendirmesi |
| `examPerformance` | CognitiveVoid | %35 | Denemelerdeki yanlış/boş geçmişi |
| `implicitPositive` | Exam + ExamSubjectResult | %20 | Denemede yanlış yapmamış = iyi sinyali |
| `studyEffort` | DailyStudy + TopicReview | %15 | Ne kadar çalışılmış, doğru oranı |
| `recency` | Tüm kaynaklar | %10 | Ne kadar taze bilgi |

**Formül Detayı:**

```typescript
// 1. Self-Rating Bileşeni (0-20 puan)
selfScore = (topicKnowledge.level / 5) * 20

// 2. Deneme Performans Bileşeni (0-35 puan, ceza bazlı)
// Başlangıç: 35 puan (hiç veri yoksa nötr)
// Her yanlış deneme konusu: ceza uygula
examBaseScore = 35
for each exam where this topic's subject was tested:
  voidsForTopic = cognitiveVoids.filter(topicId == topic.id)
  if voidsForTopic.length > 0:
    // Yanlış var → ceza
    totalSeverity = sum(void.severity for void in voidsForTopic)
    penalty = min(totalSeverity * 2, 5)  // tek sınav max 5 puan ceza
    examBaseScore -= penalty
  // (Pozitif ayarlama Sinyal 3'te)
examScore = clamp(0, 35, examBaseScore)

// 3. Örtük Pozitif Sinyal Bileşeni (0-20 puan)
// Öğrenci X denemede bir konunun dersini çözmüş ama o konuda hata yapmamışsa
// → o konu hakkında pasif pozitif sinyal
implicitPositiveCount = 0
for each exam where subject was tested:
  if NO cognitiveVoid exists for this topic in this exam:
    implicitPositiveCount += 1

// Logaritmik büyüme (diminishing returns)
// 1 deneme = 2 puan, 5 deneme = 8 puan, 10 deneme = 12 puan, 20 deneme = 16 puan
implicitScore = min(20, log2(implicitPositiveCount + 1) * 4.6)

// 4. Çalışma Efor Bileşeni (0-15 puan)
totalSessions = dailyStudy.count + topicReview.count
if totalSessions == 0:
  studyScore = 0
else:
  avgAccuracy = totalCorrect / max(totalCorrect + totalWrong, 1)
  volumeFactor = min(1.0, log(totalSessions + 1) / log(15))  // 15 oturum = max
  studyScore = volumeFactor * avgAccuracy * 15

// 5. Tazelik Bileşeni (0-10 puan)
daysSinceAnyActivity = min(daysSinceStudy, daysSinceExamWithTopic)
if daysSinceAnyActivity == null:  // hiç aktivite yok
  recencyScore = 0
elif daysSinceAnyActivity <= 3:
  recencyScore = 10
elif daysSinceAnyActivity <= 7:
  recencyScore = 8
elif daysSinceAnyActivity <= 14:
  recencyScore = 6
elif daysSinceAnyActivity <= 30:
  recencyScore = 4
elif daysSinceAnyActivity <= 60:
  recencyScore = 2
else:
  recencyScore = 0

// SON SKOR
CMS = selfScore + examScore + implicitScore + studyScore + recencyScore
// 0-100 arası, doğal olarak clamp'li (her bileşen kendi max'inde)
```

### 1.2 "Denemede Sınanmış mı?" Tespiti

Kritik soru: Bir konunun sınavda çıkıp çıkmadığını nasıl biliyoruz?

**Yaklaşım**: `ExamSubjectResult` varsa, o dersin tüm konuları "sınandı" sayılır. Çünkü YKS'de tüm konular her denemede çıkar. Eğer konuya ait CognitiveVoid yoksa → o konuda yanlış yapılmamış demektir.

```typescript
// Bir konunun belirli sınavda "sınandı" sayılma koşulu:
topicWasTested = ExamSubjectResult EXISTS for (examId, topic.subjectId)
  AND (exam.examCategory != 'brans' OR topic.subject matches branch category)

// Sınandı ama yanlış yok = örtük pozitif
topicPassedImplicitly = topicWasTested AND NOT EXISTS CognitiveVoid(examId, topicId)
```

**Ama bir nüans**: Boş bırakma (EMPTY) konuyu bilmediği anlamına da gelebilir. Bu yüzden:
- `source: WRONG` olan void'lar → kesinlikle bilmiyor (yanlış yapılmış)
- `source: EMPTY` olan void'lar → iki durum:
  - Süre yetişmedi (eğer errorReason = SURE_YETISMEDI) → nötr etki
  - Bilmiyor → negatif etki
- Hiç void yok → büyük ihtimalle biliyor (örtük pozitif)

### 1.3 Yeni Dosyalar

```
lib/topic-mastery-engine.ts          # Ana hesaplama motoru
lib/topic-mastery-engine.test.ts     # Unit test (saf fonksiyonlar, mock DB)
app/api/student/mastery-scores/route.ts  # GET: tüm konuların CMS değerlerini döndür
```

### 1.4 API Tasarımı

**GET `/api/student/mastery-scores`**

Query params:
- `examTypeId?` (TYT/AYT filtresi)
- `subjectId?` (tek ders filtresi)

Response:
```json
{
  "scores": [
    {
      "topicId": "...",
      "topicName": "Türev",
      "subjectId": "...",
      "subjectName": "Matematik",
      "examTypeName": "AYT",
      "cms": 67.4,
      "breakdown": {
        "selfRating": 12,      // max 20
        "examPerformance": 28, // max 35
        "implicitPositive": 14,// max 20
        "studyEffort": 8,      // max 15
        "recency": 6           // max 10
      },
      "examsTested": 12,
      "examsWithErrors": 3,
      "totalVoidSeverity": 4.5,
      "lastActivity": "2026-03-10"
    }
  ],
  "meta": {
    "totalTopics": 150,
    "scoredTopics": 87,
    "avgCMS": 54.2
  }
}
```

---

## Faz 2: Akıllı İçgörü & Öneri Motoru (Recommendation Engine)

**PR Adı:** `feat: intelligent recommendation engine with insights`

Faz 1'deki CMS değerlerini kullanarak öğrenciye somut, eyleme dönüştürülebilir öneriler üreten motor.

### 2.1 İçgörü Türleri (Insight Types)

6 deterministik içgörü türü:

#### 1. FUTILITY (Nafile Çalışma)
```
Koşul:
  studySessions >= 5 (son 30 gün)
  AND recentErrorRate > 0.4 (son 3 denemede hata oranı)
  AND trendDirection == 'stable' OR 'declining'

Mesaj: "Bu konuya {studySessions} kez çalıştın ama yanlış yapma oranın düşmüyor.
Çalışma yöntemini değiştirmeyi dene: video yerine soru çöz, ya da daha temel
konulara dön."

Seviye: HIGH
Aksiyon: Kök neden analizine yönlendir
```

#### 2. NEGLECT (İhmal Edilen Konu)
```
Koşul:
  daysSinceLastStudy > 30
  AND CMS < 50
  AND subjectQuestionCount >= 5 (sınavda önemli ağırlığı var)

Mesaj: "{topicName} konusunu {daysSinceLastStudy} gündür çalışmadın ve hakimiyet
seviyeni %{CMS} olarak hesaplıyorum. Bu konu sınavda {questionWeight} soruya denk
geliyor."

Seviye: MEDIUM-HIGH
Aksiyon: Çalışma planına ekle
```

#### 3. OVER_STUDY (Aşırı Çalışma / Zaman Kaybı)
```
Koşul:
  studySessions >= 8 (son 30 gün)
  AND CMS >= 80
  AND examsWithoutErrorStreak >= 5 (son 5 denemede hata yok)

Mesaj: "Bu konuya çok çalışıyorsun ama zaten iyi durumdasın (%{CMS}).
Son {streak} denemede hata yapmadın. Zamanını daha zayıf konulara ayır."

Seviye: MEDIUM
Aksiyon: Zayıf konulara yönlendir
```

#### 4. MASTERY_CONFIRMED (Hakimiyet Onayı)
```
Koşul:
  implicitPositiveCount >= 15
  AND CMS >= 75
  AND relapseCount == 0 (hiç nüksetme yok)

Mesaj: "Bu konuda {implicitPositiveCount} denemede hata yapmadın.
Bu konuyu biliyorsun! Artık sadece aralıklı tekrar yeterli."

Seviye: LOW (bilgi amaçlı)
Aksiyon: Spaced repetition'a taşı (uzun aralıklı)
```

#### 5. DECLINING (Gerileme)
```
Koşul:
  recentErrorRate > oldErrorRate * 1.5  (son 5 vs önceki 5 deneme)
  AND recentErrorCount >= 2

Mesaj: "Bu konuda son zamanlarda daha fazla hata yapıyorsun.
Önceki {period}'da %{oldRate} yanlış, şimdi %{recentRate}.
Konuyu yeniden gözden geçir."

Seviye: HIGH
Aksiyon: Acil tekrar öner
```

#### 6. QUICK_WIN (Hızlı Kazanım)
```
Koşul:
  CMS between 55-75
  AND topic.difficulty <= 3
  AND recentErrorCount <= 1

Mesaj: "Bu konuda biraz daha çalışmayla tam hakimiyet sağlayabilirsin.
Şu an %{CMS} seviyesindesin, 2-3 saat çalışma ile %80+ olabilirsin."

Seviye: MEDIUM
Aksiyon: Çalışma planına öncelikli ekle
```

### 2.2 Öneri Önceliklendirme Algoritması

```typescript
interface Recommendation {
  topicId: string;
  topicName: string;
  subjectName: string;
  examTypeName: string;
  cms: number;
  priorityScore: number;       // 0-100, sıralama için
  priorityLabel: string;       // "Acil" | "Yüksek" | "Orta" | "Düşük"
  recommendedAction: string;   // "Tekrar et" | "Soru çöz" | "Video izle" | "Konu anlatımı oku"
  estimatedDuration: number;   // dakika
  insights: Insight[];         // Bu konuyla ilgili tüm aktif içgörüler
  reasoning: string;           // Neden bu öneri (1 cümle)
}
```

**Priority Score Formülü:**
```
// Ana bileşenler
gapScore = (100 - CMS) * 0.4           // Düşük CMS = yüksek öncelik
urgencyScore = hasActiveInsight(HIGH) ? 25 : hasActiveInsight(MEDIUM) ? 15 : 0
examWeightScore = (subject.questionCount / totalQuestions) * 20  // Sınav ağırlığı
trendScore = isDeclining ? 15 : isImproving ? -5 : 0

priorityScore = gapScore + urgencyScore + examWeightScore + trendScore

// Clamped: 0-100
priorityScore = clamp(0, 100, priorityScore)
```

**Aksiyon Önerisi (determinstik kurallar):**
```
if CMS < 20:
  action = "Konu anlatımı oku/izle"  // Temelden başla
elif CMS < 50 AND hasInsight(FUTILITY):
  action = "Farklı kaynak dene"  // Mevcut yöntem çalışmıyor
elif CMS < 50:
  action = "Konu anlatımı + soru çöz"
elif CMS < 75:
  action = "Soru çöz"  // Kavramlar var, pratik gerek
else:
  action = "Aralıklı tekrar"  // İyi durumda, sadece unut ma
```

### 2.3 Günlük Çalışma Önerisi

Dashboard'da gösterilecek "Bugün ne çalışmalısın?" listesi.

```typescript
interface DailyRecommendation {
  recommendations: Recommendation[];  // Max 5, priority sıralı
  totalEstimatedMinutes: number;
  summary: string;  // "Bugün 3 kritik konu var. Toplam ~2 saat çalışma öneriyorum."
  motivationalNote: string;  // "Son 7 günde 3 konuda ilerleme kaydettin!"
}
```

**Günlük liste oluşturma:**
```
1. Tüm konuları CMS ile hesapla
2. İçgörüleri üret
3. Priority score'a göre sırala
4. Öğrencinin günlük çalışma saatine göre kes (StudentProfile.dailyStudyHours)
5. Çeşitlilik kısıtı: max 2 konu aynı dersten
6. Eğer spaced repetition item'ları varsa (nextReviewDate <= today), bunları da ekle
```

### 2.4 Yeni Dosyalar

```
lib/recommendation-engine.ts          # Öneri motoru
lib/recommendation-engine.test.ts     # Unit test
app/api/student/recommendations/route.ts  # GET: günlük öneriler + içgörüler
```

### 2.5 API Tasarımı

**GET `/api/student/recommendations`**

Response:
```json
{
  "daily": {
    "recommendations": [
      {
        "topicId": "...",
        "topicName": "Türev",
        "subjectName": "Matematik",
        "examTypeName": "AYT",
        "cms": 32,
        "priorityScore": 87,
        "priorityLabel": "Acil",
        "recommendedAction": "Konu anlatımı + soru çöz",
        "estimatedDuration": 45,
        "insights": [
          {
            "type": "DECLINING",
            "severity": "HIGH",
            "message": "Son 3 denemede hata oranın arttı...",
            "data": { "oldRate": 0.1, "recentRate": 0.4 }
          }
        ],
        "reasoning": "Yüksek sınav ağırlığı ve artan hata oranı nedeniyle acil tekrar gerekli"
      }
    ],
    "totalEstimatedMinutes": 135,
    "summary": "Bugün 3 acil, 2 önemli konun var.",
    "motivationalNote": "Son hafta 5 konuda ilerleme kaydettin!"
  },
  "allInsights": [
    { "type": "MASTERY_CONFIRMED", "topicName": "Paragraf", "count": 18, "message": "..." },
    { "type": "FUTILITY", "topicName": "Limit", "studySessions": 8, "message": "..." }
  ],
  "stats": {
    "strongTopics": 12,
    "weakTopics": 8,
    "neglectedTopics": 15,
    "improvingTopics": 5
  }
}
```

---

## Faz 3: Deneme Sonrası Otomatik Mastery Güncellemesi

**PR Adı:** `feat: auto-update mastery scores after exam results`

Deneme sonuçları girildiğinde CMS bileşenlerini otomatik olarak güncelleyen tetikleyici sistem.

### 3.1 Tetikleme Noktası

`POST /api/exams/[id]/results` endpoint'inin sonuna eklenen post-processing adımı.

### 3.2 Örtük Pozitif Sinyal Mekanizması

```typescript
async function processImplicitPositiveSignals(
  examId: string,
  userId: string,
  subjectResults: ExamSubjectResult[]
) {
  for (const result of subjectResults) {
    // Bu dersteki tüm konuları getir
    const topics = await prisma.topic.findMany({
      where: { subjectId: result.subjectId }
    });

    // Bu sınavda bu derse ait CognitiveVoid'ları getir
    const voids = await prisma.cognitiveVoid.findMany({
      where: { examId, subjectId: result.subjectId }
    });
    const errorTopicIds = new Set(voids.filter(v => v.topicId).map(v => v.topicId));

    for (const topic of topics) {
      if (!errorTopicIds.has(topic.id)) {
        // Bu konuda yanlış/boş yok → örtük pozitif sinyal
        await recordImplicitPositive(userId, topic.id, examId);
      }
    }
  }
}
```

### 3.3 TopicKnowledge Otomatik Ayarlaması

Öğrenci kendine 3/5 vermiş ama denemede yanlış yapmışsa:

```typescript
async function adjustKnowledgeFromExam(
  userId: string,
  topicId: string,
  voidSeverity: number,
  currentKnowledge: number
) {
  // Yüksek severity = daha fazla düşüş
  // Severity 1.0 → 0.3 puan düşüş, Severity 3.0 → 0.7 puan düşüş
  const decrease = Math.min(1.0, voidSeverity * 0.2);
  const newLevel = Math.max(0, currentKnowledge - decrease);

  // Sadece düşür, artırma (artırma örtük pozitif ile olur)
  if (newLevel < currentKnowledge) {
    await prisma.topicKnowledge.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { level: Math.round(newLevel) },
      create: { userId, topicId, level: Math.round(newLevel) }
    });
  }
}
```

Örtük pozitif ile artırma (çok yavaş, 20 deneme = +1 puan):

```typescript
async function recordImplicitPositive(
  userId: string,
  topicId: string,
  examId: string
) {
  // Bu konunun geçmiş denemelerindeki örtük pozitif sayısını hesapla
  // (artık CMS hesabında doğrudan kullanılacak, ayrı tablo gerek yok)
  // Ama TopicKnowledge'ı da yavaşça artır:
  const currentKnowledge = await prisma.topicKnowledge.findUnique({
    where: { userId_topicId: { userId, topicId } }
  });

  const currentLevel = currentKnowledge?.level ?? 0;
  if (currentLevel >= 5) return;  // Zaten max

  // Her örtük pozitif +0.05 (20 deneme = +1.0 tam puan artış)
  const INCREMENT = 0.05;

  // Ama tam sayı tutulduğu için, birikimli mantık:
  // Her 20 denemede bir seviye artır
  // Bunu exam sayısı üzerinden hesapla
  const implicitCount = await countImplicitPositivesForTopic(userId, topicId);
  const shouldBeLevel = Math.min(5, Math.floor(implicitCount / 20) + currentLevel);

  if (shouldBeLevel > currentLevel) {
    await prisma.topicKnowledge.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { level: shouldBeLevel },
      create: { userId, topicId, level: shouldBeLevel }
    });
  }
}
```

### 3.4 Trend Verisi Saklama

CMS zaten DB'den hesaplanıyor (live computation), ayrı trend tablosuna gerek yok. Ama trend hesabı için geçmiş deneme performanslarına bakmak yeterli — CognitiveVoid zaten exam bazlı kayıtlı.

### 3.5 Değişecek Dosyalar

```
app/api/exams/[id]/results/route.ts  # Post-processing eklenir
lib/topic-mastery-engine.ts          # countImplicitPositives helper
```

**NOT**: Bu fazda yeni tablo oluşturMUYORUZ. Tüm veri zaten mevcut tablolardan hesaplanabilir. `ExamSubjectResult` + `CognitiveVoid` verisi yeterli.

---

## Faz 4: Dashboard Öneri Widget'ı & UI

**PR Adı:** `feat: study recommendation widget on dashboard`

### 4.1 Yeni Bileşen: `StudyRecommendations`

```
components/home/study-recommendations.tsx
```

Dashboard'da "Bugünün Planı"nın hemen altında gözükecek.

**Tasarım:**

```
┌─────────────────────────────────────────────┐
│ 🎯 Sistem Önerisi                           │
│                                             │
│ 3 acil konu, 2 önemli konu tespit edildi    │
│ Tahmini süre: ~2 saat 15 dk                 │
│                                             │
│ ┌─ ACİL ──────────────────────────────────┐ │
│ │ 🔴 Türev (Matematik · AYT)             │ │
│ │ Hakimiyet: ██░░░ %32                    │ │
│ │ ⚠️ Son 3 denemede hata oranın arttı     │ │
│ │ → Konu anlatımı + soru çöz (~45dk)      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─ ACİL ──────────────────────────────────┐ │
│ │ 🔴 Limit (Matematik · AYT)             │ │
│ │ Hakimiyet: ████░ %42                    │ │
│ │ ⚠️ 8 kez çalıştın ama gelişme yok      │ │
│ │ → Farklı kaynak dene (~30dk)            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─ ÖNEMLİ ───────────────────────────────┐ │
│ │ 🟡 Olasılık (Matematik · TYT)          │ │
│ │ Hakimiyet: ███░░ %55                    │ │
│ │ 💡 Biraz daha çalışmayla %80+ olursun   │ │
│ │ → Soru çöz (~30dk)                      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ─── İyi Durumda ────────────────────────── │
│ ✅ Paragraf — 18 denemede hatasız          │
│ ✅ Temel Matematik — %92 hakimiyet         │
│                                             │
│ 📊 Son 7 gün: 5 konuda ilerleme            │
└─────────────────────────────────────────────┘
```

### 4.2 Bileşen Yapısı

```typescript
// components/home/study-recommendations.tsx

// State: loading → loaded → error
// Data: GET /api/student/recommendations

// Alt bileşenler:
// - RecommendationCard: Tek bir öneri kartı (konu, CMS bar, insight, aksiyon)
// - InsightBadge: İçgörü rozeti (FUTILITY, DECLINING, etc.)
// - MasteryBar: CMS progress bar (renk kodlu)
// - QuickStats: Güçlü/zayıf/ihmal edilen konu sayıları
```

### 4.3 Dashboard Entegrasyonu

`app/(app)/page.tsx` düzeni:

```
1. Merhaba, {userName}! (mevcut)
2. Bugünün Planı (mevcut — haftalık plan öğeleri)
3. 🆕 Sistem Önerisi (yeni — StudyRecommendations widget)
4. Ne yapmak istiyorsun? (mevcut — ActionHub)
```

### 4.4 Boş Durum (Empty State)

Yeterli veri yoksa:
```
"Henüz yeterli verin yok. En az 1 deneme çöz ve konu bilgi seviyelerini gir
ki sana önerilerde bulunabileyim."

Hızlı aksiyonlar:
[Deneme Gir] [Bilgi Seviyesi Gir]
```

### 4.5 Glass-morphism Tasarım Detayları

- Mevcut `glass-panel` sınıfı kullanılacak
- Gradient: amber/pink (mevcut tema ile uyumlu)
- Animasyon: motion/react ile staggered entry
- Responsive: mobilde tek sütun, desktop'ta aynı max-w-4xl
- Priority renkler: ACİL=red, ÖNEMLİ=amber, ORTA=blue, DÜŞÜK=green
- CMS bar renkleri: 0-30=red, 31-50=orange, 51-70=amber, 71-85=green, 86+=emerald

---

## Algoritmik Detaylar — Kenar Durumları

### Yeni Öğrenci (Sıfır Veri)
- CMS = 0 (hiç veri yok)
- Öneri: "Bilgi seviyelerini gir ve deneme çöz"
- İçgörü üretilmez (minimum veri eşiği karşılanmamış)

### Sadece Self-Rating Var (Deneme Yok)
- CMS = selfScore (max 20) + 0 + 0 + 0 + 0
- Öneri sistemi çalışır ama "Deneme verisi olmadan öneriler kısıtlıdır" notu gösterilir

### Sadece Deneme Var (Self-Rating Yok)
- CMS = 0 + examScore + implicitScore + 0 + recencyScore
- Sistem çalışır, selfRating bileşeni 0 olarak hesaplanır

### 20+ Deneme Hatası Olmayan Konu
- implicitScore = min(20, log2(21) * 4.6) ≈ 20 (max)
- Bu konu MASTERY_CONFIRMED insight'ı alır
- TopicKnowledge otomatik olarak +1 artmış olur (20'de bir)

### Aynı Konuda Sürekli Yanlış + Çok Çalışma
- examScore düşük (cezalar birikmis)
- studyScore yüksek (çok çalışılmış, ama accuracy düşük olabilir)
- FUTILITY insight'ı tetiklenir
- System message: "Çalışma yöntemini değiştir"

### Branş Sınavı Filtresi
- `examCategory = 'brans'` olan sınavlarda sadece ilgili dersler test edilmiş sayılır
- Genel deneme → tüm dersler test edilmiş sayılır

---

## Performans Düşünceleri

### CMS Hesaplama Maliyeti
- Her topic için: 3-4 DB query (knowledge, voids, studies, reviews)
- 150 konu için bu çok pahalı olur → **batch query kullanılacak**
- Tüm veriler tek seferde çekilip memory'de hesaplanır

### Caching Stratejisi
- CMS hesabı her request'te yapılır (stateless, deterministik)
- Veriler değişmediği sürece HTTP cache header ile cache'lenebilir
- İlk fazda cache yok, gerekirse ekleriz

### Query Optimizasyonu
```typescript
// Tek seferde tüm verileri çek:
const [allTopics, allKnowledge, allVoids, allStudies, allReviews, allExamResults] =
  await Promise.all([
    prisma.topic.findMany({ where: subjectFilter, include: { subject: true } }),
    prisma.topicKnowledge.findMany({ where: { userId } }),
    prisma.cognitiveVoid.findMany({ where: { exam: { userId } } }),
    prisma.dailyStudy.findMany({ where: { userId } }),
    prisma.topicReview.findMany({ where: { userId } }),
    prisma.examSubjectResult.findMany({ where: { exam: { userId } }, include: { exam: true } }),
  ]);

// Memory'de map'le ve hesapla
```

---

## Test Stratejisi

### Unit Test (Faz 1 & 2)
- Saf fonksiyonları mock veriyle test et
- CMS hesabının tüm kenar durumlarını kapsa
- İçgörü tetikleme koşullarını test et

### Senaryo Testleri
1. **Taze öğrenci**: Hiç veri yok → boş durum
2. **Sadece self-rating**: 10 konu rated → sınırlı CMS
3. **5 deneme çözmüş**: Mix of errors → insights start appearing
4. **20+ deneme veteran**: Full data → comprehensive recommendations
5. **FUTILITY senaryosu**: 8 çalışma, 5 denemede hata → doğru insight
6. **MASTERY senaryosu**: 15 denemede hatasız → onay insight'ı

---

## Faz Sıralaması & Bağımlılıklar

```
Faz 1 (Mastery Engine) → bağımsız, temel
     ↓
Faz 2 (Recommendation Engine) → Faz 1'e bağımlı
     ↓
Faz 3 (Auto-Update) → Faz 1'e bağımlı (Faz 2'den bağımsız aslında, ama sırayla daha temiz)
     ↓
Faz 4 (Dashboard UI) → Faz 2'ye bağımlı
```

Tahmini dosya değişiklikleri:
- **Faz 1**: 2 yeni dosya + 1 yeni API
- **Faz 2**: 2 yeni dosya + 1 yeni API
- **Faz 3**: 2 mevcut dosya düzenleme
- **Faz 4**: 1 yeni bileşen + 1 mevcut sayfa düzenleme
