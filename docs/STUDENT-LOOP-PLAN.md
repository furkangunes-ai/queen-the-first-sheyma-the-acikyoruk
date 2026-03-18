# Öğrenci Döngüsü Planı — "Uçağın Kendisi"

> **Amaç:** Öğrenciye günlük olarak geri döneceği bir birincil aktivite döngüsü vermek.
> **Felsefe:** Motor (Bayesian, ROI, DAG) zaten var. Şimdi direksiyonu ve pedalları yapıyoruz.

---

## Mevcut Durum

### Var Olan (Backend — %90 hazır)
- `TopicBelief` Bayesian Beta(α,β) — 4 sinyal tipi, speed weight
- `ROI Engine` — examWeight × gainPotential × dagLeverage × urgency
- `SpacedRepetitionItem` — SM-2 algoritması, CognitiveVoid bağlantısı
- `QuestionBank` + `QuestionBankItem` modeli (boş ama şeması var)
- `NextActionWidget` → `StudySessionOverlay` → `/api/daily-study` zinciri
- `DailyStudy`, `TopicReview`, `UserStreak`, `UserBadge` modelleri
- OpenAI entegrasyonu (`lib/openai.ts`, gpt-4o-mini)

### Yok Olan (Frontend — %0)
- Soru çözme arayüzü (quiz UI)
- Flashcard arayüzü
- Pomodoro/odak zamanlayıcı
- "Çalış → Çöz → Sonuç gör → Tekrarla" döngüsü

---

## Plan: 3 Faz

### Faz 1: AI Soru Motoru + Quiz Arayüzü
**Hedef:** Öğrenci herhangi bir konuda soru çözebilsin.

#### 1a. AI Soru Üretimi API'si
- **Endpoint:** `POST /api/questions/generate`
- OpenAI'dan konu + zorluk seviyesine göre MCQ üretimi
- Prompt: Konu adı + kazanımlar + zorluk (1-5) + soru sayısı (5-10)
- Çıktı formatı: `{ question, options: [A,B,C,D,E], correctAnswer, explanation, conceptTags }`
- Üretilen soruları `QuestionBankItem`'a cache'le (aynı konu için tekrar üretme)
- Rate limit: Günde max 50 soru/kullanıcı (Upstash Redis zaten var)

#### 1b. Quiz Arayüzü
- **Sayfa:** `app/(app)/quiz/page.tsx`
- **Bileşenler:**
  - `components/quiz/quiz-session.tsx` — Ana quiz container
  - `components/quiz/question-card.tsx` — Tek soru kartı (A-E şıklar, seçim animasyonu)
  - `components/quiz/quiz-result.tsx` — Oturum sonu özet (doğru/yanlış/boş, süre, puan)
  - `components/quiz/explanation-panel.tsx` — Cevap açıklaması (AI-generated)
- **Akış:**
  1. Konu seç (veya NextActionWidget'tan otomatik gel)
  2. Zorluk seç (Kolay/Orta/Zor) veya "Bana uygun" (belief'e göre otomatik)
  3. 5-10 soru çöz (sayaç + süre göster)
  4. Her soru sonrası: Doğru → yeşil animasyon + açıklama, Yanlış → kırmızı + açıklama
  5. Oturum sonu: Sonuç ekranı + `POST /api/daily-study` otomatik kayıt
  6. Bayesian güncelleme tetiklenir (mevcut altyapı)
- **Entegrasyon:**
  - `NextActionWidget` "Hemen Başla" → `/quiz?topicId=X&difficulty=auto`
  - Quiz bitişi → `StudySessionOverlay` yerine direkt otomatik kayıt
  - Yanlış sorular → `CognitiveVoid` olarak kaydedilsin (opsiyonel, Faz 1'de basit tut)

#### 1c. Quiz → Mevcut Sisteme Bağlantı
- Quiz sonucu → `POST /api/daily-study` (questionCount, correctCount, duration)
- Bu zaten tetikler: streak güncelleme, Bayesian update, DAG sync, effectiveLevel
- Yani mevcut motor otomatik çalışır, yeni bir şey yazmaya gerek yok

---

### Faz 2: Flashcard Sistemi
**Hedef:** Yanlış soruları ve zayıf konuları flashcard olarak tekrar edebilsin.

#### 2a. Flashcard Modeli (Prisma ekleme)
```prisma
model Flashcard {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  topicId       String?
  topic         Topic?   @relation(fields: [topicId], references: [id])
  front         String   // Soru veya kavram
  back          String   // Cevap veya açıklama
  source        String   @default("ai") // "ai" | "manual" | "void"
  // SM-2 fields (SpacedRepetitionItem'dan taşı)
  nextReviewDate DateTime @default(now())
  interval       Int      @default(1)
  repetitionCount Int     @default(0)
  easeFactor     Float    @default(2.5)
  status         String   @default("active") // active | suspended | mastered
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### 2b. Flashcard Kaynakları
- **Quiz yanlışlarından:** Yanlış cevaplanan soru → otomatik flashcard (front: soru, back: açıklama)
- **AI üretimi:** Konu seç → "Bu konu için 10 flashcard üret" (kavram-tanım çiftleri)
- **Manuel:** Öğrenci kendi kartını oluşturabilsin
- **CognitiveVoid'dan:** Mevcut UNRESOLVED void'ler → flashcard'a dönüştür

#### 2c. Flashcard Arayüzü
- **Sayfa:** `app/(app)/flashcards/page.tsx`
- **Bileşenler:**
  - `components/flashcard/flashcard-deck.tsx` — Kart destesi (swipe/flip)
  - `components/flashcard/flashcard-card.tsx` — Tek kart (flip animasyonu, Framer Motion)
  - `components/flashcard/review-session.tsx` — Tekrar oturumu (Biliyorum/Bilmiyorum/Zor)
- **Akış:**
  1. "Bugün tekrar edilecek kartlar" (nextReviewDate ≤ today)
  2. Kart göster → Flip → Biliyorum (interval↑) / Bilmiyorum (interval=1) / Zor (interval×0.5)
  3. SM-2 güncelleme
  4. Oturum sonu → streak güncelle

#### 2d. Flashcard → Quiz Entegrasyonu
- Quiz yanlışları → otomatik flashcard üretimi
- NextActionWidget: ROI düşük + tekrar zamanı gelmiş konu → "Flashcard tekrarı önerisi"

---

### Faz 3: Tam Döngü — Pomodoro + Akıllı Yönlendirme
**Hedef:** "Aç → Çalış → Kapat" döngüsü 5 dakikada tamamlansın.

#### 3a. Odak Modu (Focus Timer)
- **Bileşen:** `components/study/focus-timer.tsx`
- Pomodoro: 25dk çalış / 5dk mola (ayarlanabilir)
- Tam ekran overlay (dikkat dağılmasın)
- Süre bitince → otomatik "Ne yaptın?" formu (minimal: kaç soru, kaç doğru)
- Entegrasyon: Timer süresi → `durationMinutes` olarak DailyStudy'ye

#### 3b. Tek Tuş Başlatma
- Dashboard'da büyük "Çalışmaya Başla" butonu
- ROI engine'den en yüksek ROI konuyu otomatik seç
- Akış tipi otomatik belirle:
  - Mastery < 30% → "Önce konu çalış" (kaynak öner + timer)
  - Mastery 30-70% → "Soru çöz" (quiz başlat)
  - Tekrar zamanı gelmiş → "Flashcard tekrar" (deck başlat)
  - Mastery > 70% → "İleri seviye soru çöz" (zor quiz)
- Öğrenci düşünmeden en verimli aktiviteye yönlensin

#### 3c. Oturum Sonu Akışı
- Quiz/Flashcard/Timer bitişi → Sonuç ekranı
- Sonuç ekranında:
  - Bu oturumda ne kazandın (mastery değişimi)
  - Streak güncelleme animasyonu
  - "Devam et" → Sonraki en yüksek ROI aksiyona geç
  - "Bugünlük yeter" → Dashboard'a dön, günlük özet göster

---

## Teknik Notlar

### Soru Üretimi Prompt Stratejisi
```
Sen bir YKS soru yazarısın. {examType} seviyesinde {topicName} konusundan {difficulty} zorlukta {count} adet çoktan seçmeli soru yaz.

Kurallar:
- Her soru 5 şık (A-E)
- Tek doğru cevap
- Çeldiriciler gerçekçi olsun
- Her sorunun kısa açıklaması olsun
- Kazanımlar: {kazanimlar}

JSON formatında dön: [{ question, options: [A,B,C,D,E], correctAnswer: "A", explanation: "..." }]
```

### Mevcut Sisteme Minimum Müdahale
- `NextActionWidget` → quiz sayfasına link eklenir (1 satır değişiklik)
- `/api/daily-study` POST → mevcut haliyle quiz sonucunu kabul eder (değişiklik yok)
- Bayesian engine → mevcut update fonksiyonları quiz sonucuyla çağrılır (değişiklik yok)
- ROI engine → flashcard tekrarı için `spaced_review` reason zaten var (değişiklik yok)

### Yeni Dosyalar
```
app/(app)/quiz/page.tsx                    — Quiz sayfası
app/(app)/flashcards/page.tsx              — Flashcard sayfası
app/api/questions/generate/route.ts        — AI soru üretimi
app/api/flashcards/route.ts                — Flashcard CRUD + review
components/quiz/quiz-session.tsx           — Quiz oturum yöneticisi
components/quiz/question-card.tsx          — Soru kartı UI
components/quiz/quiz-result.tsx            — Sonuç ekranı
components/quiz/explanation-panel.tsx       — Açıklama paneli
components/flashcard/flashcard-deck.tsx    — Kart destesi
components/flashcard/flashcard-card.tsx    — Tek kart (flip)
components/flashcard/review-session.tsx    — Tekrar oturumu
components/study/focus-timer.tsx           — Pomodoro zamanlayıcı
```

---

## Öncelik Sırası

| Sıra | İş | Neden |
|------|-----|-------|
| **1** | Faz 1a: AI soru üretimi API | İçerik olmadan quiz olmaz |
| **2** | Faz 1b: Quiz arayüzü | Birincil aktivite — öğrenci soru çözer |
| **3** | Faz 1c: Quiz → mevcut sisteme bağlantı | Motor otomatik çalışsın |
| **4** | Faz 2a-b: Flashcard model + kaynaklar | İkincil aktivite temeli |
| **5** | Faz 2c: Flashcard arayüzü | Tekrar döngüsü |
| **6** | Faz 3a: Focus timer | Odak artırıcı |
| **7** | Faz 3b: Tek tuş başlatma | Sürtünmesiz deneyim |
| **8** | Faz 3c: Oturum sonu akışı | Döngü kapanışı |

---

## Başarı Kriteri

Öğrenci şunu yapabilmeli:
1. App'i aç → "Çalışmaya Başla" → 3 saniyede soru çözmeye başla
2. 10 soru çöz → Yanlışları gör → Açıklamaları oku → Mastery güncellendi
3. Ertesi gün → Yanlışlar flashcard olarak karşısına çıksın
4. Her gün bu döngüyü tekrarla → Streak artsın → İlerleme görünsün

**Satış testi:** Bir YKS öğrencisi bunu 1 hafta kullandıktan sonra "Bu olmadan çalışamam" demeli.
