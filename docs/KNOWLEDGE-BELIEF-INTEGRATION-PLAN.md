# TopicKnowledge ↔ TopicBelief Entegrasyon Planı

> Öğrencinin müfredatta işaretlediği bilgi seviyesinin (TopicKnowledge.level 0-5)
> Bayesyen öneri motoruna (TopicBelief alpha/beta) entegre edilmesi.

## Temel Felsefe

**Tek kaynak:** TopicBelief (alpha, beta) = bilginin tek matematiksel temsili.
TopicKnowledge.level = öğrencinin öznel beyanı, TopicBelief'e **prior sinyali** olarak girer.
adjustedLevel gibi paralel bir Float eklenmez — TopicBelief zaten bunu yapıyor.

Gösterim: `betaMean × 5 = 3.55/5` formatında öğrencinin anlayacağı 0-5 skalasına dönüştürülür.

---

## Değişiklik 1: TopicKnowledge → TopicBelief Prior Sinyali

### Ne zaman: Öğrenci bilgi seviyesini işaretlediğinde

Voice assessment veya topic-knowledge API'sinde level kaydedildiğinde,
TopicBelief'e **self_rating** sinyali olarak Bayesyen prior oluşturulur.

### Dönüşüm tablosu (level → alpha, beta):

| Level | Anlam          | Alpha | Beta | Mean  | Güven |
|-------|----------------|-------|------|-------|-------|
| 0     | Hiç bilmiyorum | 1.0   | 5.0  | 0.17  | Düşük |
| 1     | Çok az         | 1.5   | 4.0  | 0.27  | Düşük |
| 2     | Temel          | 3.0   | 3.0  | 0.50  | Orta  |
| 3     | Orta           | 4.0   | 2.5  | 0.62  | Orta  |
| 4     | İyi            | 5.0   | 2.0  | 0.71  | Orta  |
| 5     | Çok iyi        | 6.0   | 1.5  | 0.80  | Orta  |

**Önemli:** Evidence count (α + β - 2) = 4-5.5 → yeterli kanıt.
Denemelerden gelen veriler bunu hızlıca override edebilir ama başlangıç değeri makul.

### Mantık:
- Eğer TopicBelief **zaten mevcutsa** ve evidence > 5 → dokunma (deneme verisi daha güvenilir)
- Eğer TopicBelief **yoksa** veya evidence ≤ 5 → tablodan oluştur/güncelle

### Etkilenen dosyalar:
- `lib/bayesian-engine.ts` → `selfRatingToBelief(level)` fonksiyonu
- `app/api/voice-assessment/save/route.ts` → TopicBelief upsert ekleme
- `app/api/topic-knowledge/route.ts` → TopicBelief upsert ekleme

---

## Değişiklik 2: Deneme Sonrası Hata Türüne Göre Ağırlıklı Güncelleme

### Mevcut durum:
- Hata varsa → `updateFromExamError(severity, speedWeight)` → beta artar
- Hata yoksa → `updateFromImplicitPositive(discrimination, speedWeight)` → alpha artar

### İyileştirmeler:

#### A) Hata türüne göre farklılaştırılmış ceza katsayısı:

| ErrorReasonType          | Katsayı | Açıklama                      |
|--------------------------|---------|-------------------------------|
| KAVRAM_YANILGISI         | 1.0     | En ağır — temel anlayış yanlış |
| BILGI_EKSIKLIGI          | 0.8     | Bilmiyor                       |
| SURE_YETISMEDI           | 0.4     | Zaman yönetimi sorunu          |
| ISLEM_HATASI             | 0.3     | Hesaplama hatası               |
| DIKKATSIZLIK             | 0.2     | Dikkatsizlik                   |
| SORU_KOKUNU_YANLIS_OKUMA | 0.3     | Soruyu yanlış okumuş           |
| null (RAW void)          | 0.5     | Henüz sınıflandırılmamış       |

Formül: `betaPenalty = baseSeverity × errorTypeCoefficient × speedWeight`

#### B) İmplicit positive'e kapsam faktörü ekleme:

Mevcut sorun: 40 soruluk Matematik sınavında 50 konu var.
Hata yapılmamış diye 50 konunun hepsine artı vermek yanlış.

Kapsam faktörü:
```
coverageFactor = min(1.0, attemptedQuestions / (topicsInSubject × 1.5))
```

Örnek: 40 soru, 50 konu → coverage = min(1, 40/75) = 0.53
Implicit positive alpha artışı: `baseDelta × coverageFactor`

### Etkilenen dosyalar:
- `lib/bayesian-engine.ts` → `updateFromExamError` errorType parametresi + katsayı tablosu
- `app/api/exams/[id]/results/route.ts` → errorType bilgisini void'dan geçirme + coverage hesaplama

---

## Değişiklik 3: ROI Motoruna knowledgeModifier

### Yeni formül:
```
ROI = examWeight × gainPotential × dagLeverage × urgencyMultiplier × knowledgeModifier
```

### knowledgeModifier hesaplama:

TopicKnowledge.level VE TopicBelief birlikte değerlendirilir:

```typescript
function calculateKnowledgeModifier(
  topicKnowledgeLevel: number | null,  // 0-5 veya null
  beliefMean: number,                   // 0-1
  evidenceCount: number,                // TopicBelief'ten
  studyGoal: 'new' | 'improve' | 'review' | 'auto'
): number
```

#### studyGoal = 'auto' (varsayılan):
| Durum                                    | Modifier | Açıklama                    |
|------------------------------------------|----------|-----------------------------|
| level null (hiç işaretlenmemiş)          | 1.0      | Nötr                        |
| level 0-1, belief mean < 0.3             | 1.4      | Bilmiyor ve veri de teyit   |
| level 0-1, belief mean > 0.5             | 0.8      | Bilmiyor ama veri iyi (?!)  |
| level 4-5, belief mean > 0.6             | 0.4      | Biliyor ve veri teyit       |
| level 4-5, belief mean < 0.4             | 1.5      | Tutarsız! Dikkat gerekiyor  |
| level 2-3                                | 1.0      | Orta — standart ROI         |

#### studyGoal = 'new' (yeni konu öğren):
- level 0-1 konulara × 1.5 ek bonus
- level 4-5 konulara × 0.3 ek ceza
- Soft filter: tamamen çıkarmaz, ağırlık düşürür

#### studyGoal = 'improve' (bildiğini geliştir):
- level 2-3 konulara × 1.4 ek bonus
- level 0-1 konulara × 0.5 ek ceza (bilmediğini "geliştirmek" olmaz)

#### studyGoal = 'review' (konu tekrarı):
- level 3+ VE retention düşen konulara × 1.5 bonus
- level 0-1 konulara × 0.3 ceza

### Etkilenen dosyalar:
- `lib/roi-engine.ts` → `calculateKnowledgeModifier()` + `calculateTopicROI` parametresi
- `app/api/student/next-action/route.ts` → TopicKnowledge fetch + modifier hesaplama
- `app/api/student/guided-recommendation/route.ts` → aynı + studyGoal filtresi

---

## Değişiklik 4: Wizard'a Çalışma Amacı Adımı

### Yeni adım (exam-type'dan sonra):

**"Bugün ne tür çalışma yapmak istiyorsun?"**
- 🆕 Yeni konu öğren — bilmediğin konulara odaklan
- 📈 Bildiğini geliştir — orta seviye konuları güçlendir
- 🔄 Konu tekrarı — unuttuklarını hatırla
- ⚡ Sistem karar versin — en verimli ne ise onu öner

Bu seçim `studyGoal` parametresi olarak API'ye gönderilir.
API bunu `calculateKnowledgeModifier`'a geçirir.

### Quick flow güncelleme:
mode → exam-type → **study-goal** → subjects → duration → result (5 adım)

### Detailed flow güncelleme:
mode → exam-type → **study-goal** → subject-count → subjects → duration → recent-study → result (7 adım)

### Etkilenen dosyalar:
- `components/home/guided-action-wizard.tsx` → yeni adım + state

---

## Değişiklik 5: Tutarsızlık Tespiti & Risk Insight

### Kural:
TopicKnowledge level'ı 0-5'ten 0-1 skalasına çevir: `selfRating = level / 5`

Tutarsızlık skoru:
```
inconsistency = |selfRating - beliefMean| × sqrt(evidenceCount)
```

- `inconsistency > 0.5` → UYARI — "Kendin X/5 dedin ama veriler Y/5'e işaret ediyor"
- evidenceCount ile çarpma: az veri varsa tutarsızlık önemsiz (yeterli kanıt yok)
- Çok veri + büyük fark = gerçek tutarsızlık

### Insight mesajları:

**Kendini yüksek puanlamış ama denemeler düşük:**
> "Türev konusunu 4/5 olarak işaretledin ama son denemelerden elde edilen veriler %38 seviyesine işaret ediyor. Bu konuyu tekrar gözden geçirmeni öneririz."

**Kendini düşük puanlamış ama denemeler yüksek:**
> "İntegral konusunu 1/5 olarak işaretledin ama denemelerinde bu konuda hata yapmıyorsun. Bilgi seviyeni güncellemek isteyebilirsin."

### Gösterim yerleri:
- Guided recommendation sonuç kartları (insight alanı)
- Sistem önerisi widget'ında (varsa)
- Strategy sayfası konu haritasında (gelecek PR)

### Etkilenen dosyalar:
- `app/api/student/guided-recommendation/route.ts` → inconsistency hesaplama + insight
- `app/api/student/next-action/route.ts` → inconsistency flag

---

## Uygulama Sırası

1. `lib/bayesian-engine.ts` → `selfRatingToBelief()` + `errorTypeCoefficient()` + coverage factor
2. `app/api/voice-assessment/save/route.ts` → TopicBelief prior sinyali
3. `app/api/topic-knowledge/route.ts` → TopicBelief prior sinyali
4. `app/api/exams/[id]/results/route.ts` → Hata türü ağırlıklı güncelleme + coverage
5. `lib/roi-engine.ts` → `calculateKnowledgeModifier()` + ROI formülüne ekleme
6. `app/api/student/next-action/route.ts` → TopicKnowledge fetch + modifier
7. `app/api/student/guided-recommendation/route.ts` → studyGoal + knowledgeModifier + tutarsızlık
8. `components/home/guided-action-wizard.tsx` → Çalışma amacı adımı

---

## Mimari Özet

```
TopicKnowledge.level (0-5, öğrenci beyanı)
        │
        ▼ selfRatingToBelief()
TopicBelief (alpha, beta) ◄──── Deneme sonuçları (hata türü ağırlıklı)
        │                  ◄──── Çalışma oturumları
        │                  ◄──── Implicit positive (coverage weighted)
        ▼
  betaMean × 5 = "Sistem Tahmini" (0-5 skalasında gösterim)
        │
        ▼ calculateKnowledgeModifier(level, beliefMean, evidence, studyGoal)
  ROI = examWeight × gainPotential × dagLeverage × urgencyMultiplier × knowledgeModifier
        │
        ▼ selectNextAction() + inconsistencyDetection()
  Öneri + Insight + Tutarsızlık Uyarısı
```
