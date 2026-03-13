# DENEME SİSTEMİ REFORM PLANI
> **Tarih:** 2026-03-13
> **Kaynak:** Furkify kognitif analiz eleştirisi + aksiyomatik çözümler
> **Durum:** PLANLANMIŞ — Faz faz uygulanacak, her faz ayrı PR

---

## TEMEL FELSEFE

### İki Fazlı Kognitif Model (Mevcut)
- **Sıcak Faz:** Sınav sonrası anında, minimum sürtünmeyle veri yakalama
- **Soğuk Faz:** 6+ saat sonra, dinlenmiş beyinle zafiyet haritalama

### Yeni Aksiyomlar
1. **Minimum Entropi:** Bir hatayı kaydetmek için gereken minimum bilgi = İndeks (soru no) + Durum (yanlış/boş). Geri kalan her şey ertelenebilir metadata.
2. **Hick Yasası:** Sıcak fazda seçenek sayısı sıfır olmalı. Karar verme değil, mekanik tuşlama.
3. **Asenkronite:** Veri yakalama ile anlamlandırma aynı anda olmak zorunda değil.
4. **Lazy Evaluation:** Eksik veriyi (null) tolere et, zorlama.

---

## FAZ 1: VERİTABANI ŞEMA REVİZYONU
> **Branch:** `claude/phase1-schema-reform-FBigJ`
> **Scope:** Prisma schema + migration + lib/severity.ts güncellemeleri

### 1.1 VoidStatus Enum — RAW Eklenmesi
```prisma
enum VoidStatus {
  RAW         // Henüz sınıflandırılmamış ham veri (konu/neden yok)
  UNRESOLVED  // Sınıflandırılmış ama çözülmemiş
  REVIEW      // Tekrar gerekiyor
  RESOLVED    // Çözüldü/Öğrenildi
}
```

### 1.2 CognitiveVoid Model Değişiklikleri
```
- topicId: String?        → Zaten nullable ✓ (değişiklik yok)
- errorReason: ErrorReasonType @default(BILGI_EKSIKLIGI)
  → errorReason: ErrorReasonType? (nullable yap, RAW void'larda null)
- status: @default(UNRESOLVED) → @default(RAW)
- questionNumber: Int?    → YENİ ALAN (mikro giriş: soru numarası)
- relapseCount: Int @default(0) → YENİ ALAN (nüksetme sayacı)
```

**Unique Constraint Güncelleme:**
Mevcut: `@@unique([examId, subjectId, topicId, errorReason, source])`
Yeni: questionNumber eklenince her soru ayrı kayıt olabilir.
RAW void'larda topicId=null, errorReason=null olacağından unique constraint çakışmayacak.
Ama makro girişte (questionNumber=null) aynı subject'te birden fazla null void olabilir → unique constraint'i esnetmek gerekecek.

**Çözüm:** Unique constraint'i kaldırıp, upsert mantığını application-level'da yönet.
Veya: `@@unique([examId, subjectId, questionNumber, source])` — her soru numarası benzersiz.
Makro giriş (questionNumber=null) için ayrı bir gruplama mantığı.

### 1.3 Exam Model — coldPhaseCompleted Kaldırma
```
- coldPhaseCompleted: Boolean @default(false)  → SİL
- coldPhaseCompletedAt: DateTime?              → SİL
```
**Yerine:** clarityScore ve repairScore runtime'da hesaplanacak (API seviyesinde).

### 1.4 Severity Motor Güncellemesi (`lib/severity.ts`)
```typescript
// RAW void'lar için default severity
export const RAW_DEFAULT_SEVERITY = 0.1;

// Recidivism (nüksetme) ceza katsayısı
export function getRecidivismMultiplier(relapseCount: number): number {
  return Math.pow(1.5, relapseCount); // 1.5^n
}

// Güncellenmiş severity hesaplama
export function calculateSeverity(
  errorReason: ErrorReasonType | null,
  topicWeight: number = 2,
  magnitude: number = 1,
  relapseCount: number = 0
): number {
  if (!errorReason) return RAW_DEFAULT_SEVERITY * magnitude;
  const coefficient = ERROR_REASON_COEFFICIENTS[errorReason];
  const recidivism = getRecidivismMultiplier(relapseCount);
  return Math.round(topicWeight * coefficient * magnitude * recidivism * 100) / 100;
}
```

### 1.5 VoidStatus Güncellemeleri (`lib/severity.ts`)
```typescript
export const VOID_STATUS_LABELS = {
  RAW: 'Ham Veri',
  UNRESOLVED: 'Anlamadım',
  REVIEW: 'Tekrar Et',
  RESOLVED: 'Çözüldü',
};

export const VOID_STATUS_COLORS = {
  RAW: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  UNRESOLVED: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  REVIEW: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  RESOLVED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};
```

### 1.6 Çift Fazlı Metrik Hesaplama (Yeni Utility)
```typescript
// lib/exam-metrics.ts

export function calculateClarityScore(voids: { status: string }[]): number {
  if (voids.length === 0) return 1;
  const classified = voids.filter(v => v.status !== 'RAW').length;
  return classified / voids.length; // 0.0 → 1.0
}

export function calculateRepairScore(voids: { status: string }[]): number {
  const classified = voids.filter(v => v.status !== 'RAW');
  if (classified.length === 0) return 0;
  const resolved = classified.filter(v => v.status === 'RESOLVED').length;
  return resolved / classified.length; // 0.0 → 1.0
}
```

---

## FAZ 2: SICAK FAZ — KUANTUM VERİ GİRİŞ MODELİ
> **Branch:** `claude/phase2-hot-phase-reform-FBigJ`
> **Scope:** exam-entry-form.tsx tam yeniden yazım + API güncellemeleri

### 2.1 Yeni Sıcak Faz Akışı
Mevcut 3 adımlı form korunur ama Step 2 tamamen değişir:

**Step 1: Temel Bilgi** (değişiklik yok — başlık, tür, tarih, kategori)

**Step 2: Veri Girişi** (BÜYÜK DEĞİŞİKLİK)
Mevcut tablo (Ders | Doğru | Yanlış | Boş) kaldırılıyor.
Yerine: **Modüler Ders Kartları (Subject Blocks)**

Her ders için bir kart:
- Kartın üstünde: Ders adı + makro input satırı (Doğru | Yanlış | Boş — mevcut gibi)
- Kartın altında: **Optik Grid** (1'den questionCount'a kadar numaralı kutular)
  - Varsayılan: Tüm kutular "doğru" (silik/görünmez)
  - Tek tıklama: Kırmızı = Yanlış
  - Çift tıklama: Gri = Boş
  - Tekrar tıklama: Sıfırla (doğru)
- Kartın sağ üstünde: **Vektörel Input** (mini text field)
  - Syntax: `3y, 5b, 12y` veya `3-7y` (range) veya `3y 5b` (boşluklu)
  - Kaos toleranslı parser (graceful degradation)

**Çift Çözünürlük Simbiyozu:**
- Grid'den soru işaretlenince → makro toplamlar otomatik güncellenir
- Makro'dan toplam girilince → questionNumber=null void'lar oluşur
- Mikro girişler null void'ları "tüketir" (süperpozisyon çökmesi)
- Mikro > makro ise → makro otomatik yukarı güncellenir

**Step 3: Bağlam Etiketleri** (değişiklik yok)

### 2.2 Kaydetme Akışı (Değişiklik)
1. `POST /api/exams` → Exam oluştur (mevcut gibi)
2. `POST /api/exams/{id}/results` → ExamSubjectResult (mevcut gibi, D/Y/B toplamları)
3. **YENİ:** Mikro girişler varsa → her biri için `CognitiveVoid` kaydı (status=RAW, questionNumber=X, topicId=null, errorReason=null)
4. Makro girişler (soru no olmayan) → questionNumber=null olan RAW void'lar
5. Soğuk faz'a yönlendirme (mevcut gibi)

### 2.3 Vektörel Parser (`lib/vector-parser.ts` — YENİ DOSYA)
```typescript
interface ParseResult {
  valid: Array<{ questionNumber: number; source: 'WRONG' | 'EMPTY' }>;
  invalid: string[]; // parse edilemeyenler (kırmızı highlight için)
}

export function parseVectorInput(input: string): ParseResult {
  // 1. Boşlukları ve virgülleri normalize et
  // 2. Her token'ı parse et: "3y" → {3, WRONG}, "5b" → {5, EMPTY}
  // 3. Range desteği: "3-7y" → [3y, 4y, 5y, 6y, 7y]
  // 4. Geçersiz token'ları invalid'e at (graceful degradation)
}
```

---

## FAZ 3: SOĞUK FAZ — PROGRESİF ZAFİYET HARİTALAMA
> **Branch:** `claude/phase3-cold-phase-reform-FBigJ`
> **Scope:** cold-phase-form.tsx yeniden yazım + API güncellemeleri

### 3.1 Mevcut vs Yeni Soğuk Faz

**Mevcut:** Her ders için yanlış/boş kart → 3 adım (konu → neden → not) → zorunlu
**Yeni:** RAW void listesi → opsiyonel zenginleştirme → aşamalı ifşa

### 3.2 Yeni Akış
1. Friction gate korunur (6 saat minimum)
2. Ekranda RAW void'lar listelenir (ders bazında gruplu)
3. Her void kartında:
   - Soru no (varsa) veya "Sınıflandırılmamış" etiketi
   - Opsiyonel: Konu dropdown (tıklanınca açılır)
   - Opsiyonel: Hata nedeni butonları (tıklanınca açılır)
   - Opsiyonel: Not input
4. Öğrenci dilediği kadarını doldurup kaydedebilir
5. Geri kalanlar RAW kalır — cezasız, zorunluluksuz
6. "Tümünü Haritalandır" butonu yerine → "Kaydet" (partial save)
7. Clarity Score otomatik güncellenir

### 3.3 Süperpozisyon Çökmesi Mekanizması (API)
Makro girişteki null void'lar, mikro girişlerle tüketilir:
- `PATCH /api/exams/{id}/cognitive-voids/collapse`
  - Input: `{ subjectId, questionNumber, source }`
  - Mantık: Aynı subject+source'da bir null-questionNumber void bul, questionNumber'ı ata
  - Eğer tüm null void'lar tükendiyse ve yeni mikro giriş geliyorsa → yeni void oluştur, makro toplamı güncelle

---

## FAZ 4: ANA EKRAN (DENEME LİSTESİ) REVİZYONU
> **Branch:** `claude/phase4-exam-list-reform-FBigJ`
> **Scope:** app/(app)/exams/page.tsx + yeni widget'lar

### 4.1 Sonraki Görev Widget'ı (TaskScheduler)
- Yeni component: `components/exams/next-task-widget.tsx`
- Öncelik kuyruğu (client-side, mevcut exam data'dan hesaplanır):
  1. RAW verisi olan deneme (en düşük clarity score) → "Haritalandır"
  2. En yüksek severity UNRESOLVED void → "Onar"
- Cross-exam birleştirme: subject+topic bazında (deneme türünden bağımsız)
- Tek görev gösterir, altında "Tüm Görevler" linki

### 4.2 Filtre Revizyonu — Kademeli Pill Segmentasyonu
Mevcut: 10+ buton tek satırda
Yeni: 3 satırlı progressive disclosure

```
Satır 1: [ TYT ] [ AYT ]
Satır 2 (AYT seçilince): [ Genel (160) ] [ Sayısal (80) ] [ EA (80) ] [ Tek Ders ]
Satır 3 (Tüm modlarda): [ Tüm Dersler ] [📐 Mat] [🧲 Fiz] [🧪 Kim] ...
```

- Satır 3 her zaman açık (Genel modda da ders filtresi var)
- Ders seçildiğinde: **Mercek (Lens) Efekti** — deneme kartları dönüşür:
  - Toplam net küçülür, seçili dersin neti büyür
  - Grafik, o dersin gidişatına dönüşür

### 4.3 Grafik Accordion — Dinamik Teaser
Mevcut: Toggle ile gizle/göster
Yeni: Accordion, varsayılan kapalı (ilk 3 kullanımda açık — localStorage flag)

Başlık dinamik mikro-içgörü:
- Client-side hesaplama (son 3 denemenin netleri):
  - 3 ardışık artış → "📈 Yükseliş trendindesin"
  - 3 deneme ±2 net fark → "📊 Platoya girdin"
  - 3 ardışık düşüş → "📉 Düşüş trendi var"
  - Filtre aktifse → filtre bağlamında hesapla

### 4.4 Deneme Kartları — Clarity Score Gösterimi
Mevcut: `coldPhaseCompleted` amber banner
Yeni: Her kartta circular progress indicator
- `%0` (tüm RAW) → kırmızı halka
- `%50` (yarısı sınıflandırılmış) → amber halka
- `%100` (tümü sınıflandırılmış) → yeşil halka

### 4.5 "Kognitif Zafiyetler Bekliyor" Banner Revizyonu
Kaldırılıyor. Yerine: **Sonraki Görev Widget'ı** (4.1) ve **kart üstü Clarity halkaları** (4.4)

---

## FAZ 5: DETAY SAYFASI REVİZYONU
> **Branch:** `claude/phase5-detail-reform-FBigJ`
> **Scope:** exam-detail-view.tsx + zafiyetler sekmesi

### 5.1 Özet Sekmesi — Badge Satırı
Mevcut: 7 büyük stat kutusu (Doğru/Yanlış/Boş/Net + 3 status)
Yeni: Tek satır badge

**Desktop:** `[ 30.75 Net ] • 31D, 1Y, 9B • 🔴 7 Bekleyen, 2 Çözülen`
**Mobil (<768px):** `[ 30.75 Net ] • 🔴 7 Zafiyet Bekliyor`

Ders tablosu ve radar chart korunur.

### 5.2 Zafiyetler Sekmesi — Pozitif Onarım Döngüsü
Mevcut: Kırmızı kartlarla "suçluluk duvarı"
Yeni: Nötr kartlar + eylem butonları + triage modu

**Kart tasarımı:**
- Arka plan: nötr dark
- Sol kenarda incecik renkli border (severity'ye göre: yüksek=kırmızı, orta=amber, düşük=gri)
- Sağ tarafta 2 eylem butonu:
  - `[ ✔ Çözüldü ]` → tek tıkla RESOLVED, dopamin
  - `[ ✏️ Not Al / Çözüme Git ]` → CognitiveVoid not inputu açar

**Triage (Flashcard) Modu:**
- Listenin tepesinde: `[ 🎯 Odak Moduna Gir ]` butonu
- Tıklanınca: ekran kararır, tek zafiyet kartı (en yüksek severity)
- "Çözüldü" → sıradaki kart
- "Atla" → 12 saat gizle (skippedUntil timestamp, localStorage veya DB)
- Severity sırasına göre, aktif filtreyi korur

### 5.3 "Çözüldü" Oto-Regülasyon (Recidivism)
- Tek tıkla RESOLVED → anında yeşil, dopamin
- Sonraki denemede aynı subject+topic+errorReason'da hata → void'un relapseCount++
- Severity *= 1.5^relapseCount
- Dashboard'da alarm: "X konusunu çözdüğünü belirttin ama aynı hata tekrarlandı."

---

## FAZ 6: ANALİTİK DASHBOARD — FOG OF WAR
> **Branch:** `claude/phase6-analytics-fog-FBigJ`
> **Scope:** analytics bileşenleri + heatmap revizyonu

### 6.1 Isı Haritası — Karanlık Madde Sütunu
- X ekseninin sonuna "Bilinmeyen Bölge" sütunu ekle
- RAW void'lar (topicId=null) bu sütunda gösterilir
- Diğer konu hücreleri üzerinde blur/sis efekti (CSS `backdrop-filter: blur`)
- Kilit ikonu + nudge mesajı: "X hatanın nedeni belirsiz. Sisi kaldır."

### 6.2 Bulanık Analitik
- RAW void'lar severity hesaplamasına 0.1 katsayıyla katılır
- Grafikler RAW verilerle çalışır ama "düşük güvenilirlik" badge'i gösterir
- Clarity score arttıkça grafikler netleşir (blur kademeli azalır)

### 6.3 Dinamik Teaser Entegrasyonu
- AnalyticsView'daki filtrelere göre mikro-içgörü hesaplama
- Her tab'ın kendi teaser'ı

---

## ÇAPRAZ FAZ KARARLARI

### Recidivism Algılama Algoritması
```
Öğrenci void V'yi RESOLVED yaptı (subject=S, topic=T, errorReason=E).
Yeni deneme girildiğinde, sistem:
1. Yeni void'ların (S, T, E) üçlüsünü kontrol eder
2. Eşleşen RESOLVED void varsa → relapseCount++
3. Yeni void'un severity'si recidivism multiplier ile hesaplanır
4. Eski RESOLVED void → REVIEW'a düşürülür
Bu mantık POST /api/exams/{id}/cognitive-voids endpoint'inde çalışır.
```

### Süperpozisyon Çökmesi Algoritması
```
Senaryo: 8 makro yanlış girildi (8x null-questionNumber WRONG void)
Sonra öğrenci grid'den 3, 5, 7 numaraları işaretledi (3 mikro)

1. Mevcut null void'lardan 3 tanesini al
2. questionNumber = 3, 5, 7 ata
3. Kalan: 5 null void + 3 numaralı void = 8 toplam ✓

Senaryo: 10 mikro giriş, ama makro sadece 8 ise
→ 2 yeni void oluştur, ExamSubjectResult.wrongCount'u 10'a güncelle
```

### Cross-Exam Subject Birleştirme (TaskScheduler)
```
Widget "Fizik kasın zayıflıyor" derken:
1. Tüm denemelerdeki (genel+branş) subjectId=Fizik void'larını topla
2. Son 2 deneme window'unda severity agregasyonu yap
3. Deneme türü (genel/branş) önemsiz, sadece subject+topic matters
```

---

## DOSYA HARİTASI (Değişecek Dosyalar)

### Faz 1 (Schema)
- `prisma/schema.prisma` — VoidStatus enum, CognitiveVoid model
- `lib/severity.ts` — RAW default, recidivism multiplier
- `lib/exam-metrics.ts` — YENİ: clarityScore, repairScore

### Faz 2 (Sıcak Faz)
- `components/exams/exam-entry-form.tsx` — Tam yeniden yazım (Step 2)
- `lib/vector-parser.ts` — YENİ: kaos toleranslı parser
- `app/api/exams/[id]/results/route.ts` — RAW void oluşturma
- `components/exams/optical-grid.tsx` — YENİ: optik grid bileşeni
- `components/exams/subject-block.tsx` — YENİ: ders kartı bileşeni

### Faz 3 (Soğuk Faz)
- `components/exams/cold-phase-form.tsx` — Opsiyonel zenginleştirme
- `app/api/exams/[id]/cognitive-voids/route.ts` — RAW→classified geçiş
- `app/api/exams/[id]/cognitive-voids/collapse/route.ts` — YENİ: süperpozisyon çökmesi

### Faz 4 (Ana Ekran)
- `app/(app)/exams/page.tsx` — Tam revizyon
- `components/exams/next-task-widget.tsx` — YENİ: TaskScheduler widget
- `components/exams/pill-filter.tsx` — YENİ: kademeli pill segmentasyonu
- `components/exams/exam-card.tsx` — YENİ: clarity halkalı kart

### Faz 5 (Detay Sayfası)
- `components/exams/exam-detail-view.tsx` — Badge satırı + zafiyetler revizyonu
- `components/exams/triage-mode.tsx` — YENİ: flashcard triage
- `components/exams/void-card.tsx` — YENİ: nötr zafiyet kartı

### Faz 6 (Analitik)
- `components/analytics/cognitive-heatmap.tsx` — Karanlık madde sütunu + fog
- `components/analytics/analytics-view.tsx` — Teaser + bulanık analitik
- `app/api/analytics/heatmap/route.ts` — RAW void desteği

---

## ÖNCELİK SIRASI ve BAĞIMLILIKLAR

```
Faz 1 (Schema) ──→ Faz 2 (Sıcak Faz) ──→ Faz 3 (Soğuk Faz)
                                              │
                                              ├──→ Faz 4 (Ana Ekran)
                                              │
                                              ├──→ Faz 5 (Detay Sayfası)
                                              │
                                              └──→ Faz 6 (Analitik)
```

Faz 1 → 2 → 3 sıralı (birbirine bağımlı)
Faz 4, 5, 6 paralel çalışabilir (Faz 3'e bağımlı)

---

## NOTLAR
- Her faz tamamlandığında PR açılır, merge sonrası sonraki faza geçilir
- Bu doküman her yeni sohbette referans noktasıdır
- CLAUDE.md'ye bu dosyanın varlığı eklenecek
