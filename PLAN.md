# Sesli Mufredat Degerlendirme - Uygulama Plani

## Ozet

Ogrencilerin mufredat bilgi duzeylerini manuel tek tek girmek yerine, ses kaydi alarak topluca girebilecegi bir sistem. Ogrenci ekranda konulari ve kazanimlari gorurken sesli olarak durumunu anlatir, sistem bunu isleyip yapilandirilmis veri olarak sunar, ogrenci onaylar/duzeltir ve kaydeder.

---

## Kullanici Akisi

### 1. Giris Noktasi
- Strateji sayfasina "Sesli Degerlendirme" butonu eklenir
- Yeni sayfa: `/voice-assessment`

### 2. Ders Secimi
- Ogrenci bir ders secer (ornegin "TYT Matematik")
- Veya "Tum Dersler" secebilir (toplu giris)

### 3. Kayit Ekrani (Ana Deneyim)
**Sol Panel / Ust Kisim - Mufredat Gorunumu:**
- Secilen dersin tum konulari listelenirsolda sirayla
- Her konunun altinda kazanimlar (acilir/kapanir)
- Mevcut bilgi seviyesi renk koduyla gosterilir
- Konu numaralari belirgin (ogrenci "1155" gibi numara soyleyebilsin)
- Hangi konunun uzerinde konustugu highlight edilir

**Sag Panel / Alt Kisim - Ses Kaydi:**
- Buyuk mikrofon butonu (baslat/durdur)
- Canli sureye gosterge (00:00 formatinda)
- Canli transkript alani (konusurken yazi gorunur)
- Duraklatma/devam ettirme ozelligi
- "Kaydi Tamamla" butonu

### 4. AI Isleme
- Transkript OpenAI'a gonderilir
- Prompt mufredat yapisini icerir (konu adlari, kazanim kodlari)
- AI su bilgileri cikarir:
  - Her konu icin bilgi seviyesi (0-5)
  - Hangi kazanimlar tamamlanmis
  - Ogrencinin belirttigi notlar/detaylar
  - Yanlis yapilan konular
  - Konu tekrari gereken alanlar

### 5. Onay & Duzeltme Ekrani
- AI'nin anlayisini yapilandirilmis formatta gosterir:
  ```
  "Anladigim kadariyla:"
  - Turkev: Seviye 4/5 (Iyi) - 12/15 kazanim tamamlanmis
  - Limit: Seviye 2/5 (Temel) - "Saga soldan limit biliyorum ama epsilon-delta tanimini bilmiyorum"
  - Integral: Seviye 0/5 - Hic baslamamis
  ```
- Her konu satiri duzenlenebilir (tikla -> seviye degistir)
- Her kazanim tek tek isaretlenebilir/kaldirilabilir
- "Sesle Duzelt" butonu -> ek ses kaydi alip AI tekrar isler
- "Manuel Duzelt" -> mevcut KazanimDrawer acilir
- "Onayla ve Kaydet" butonu

### 6. Kayit
- TopicKnowledge tablolari guncellenir
- KazanimProgress tablolari guncellenir
- Bilisssel cizge (cognitive graph) senkronize edilir

---

## Teknik Mimari

### Yeni Dosyalar

#### 1. Sayfa: `app/(app)/voice-assessment/page.tsx`
- Ana sayfa komponenti
- Adim bazli wizard (ders secimi -> kayit -> onay -> kaydet)

#### 2. Komponentler:

**`components/voice-assessment/subject-selector.tsx`**
- Ders secimi (TYT/AYT gruplariyla)
- Tek ders veya toplu secim

**`components/voice-assessment/curriculum-display.tsx`**
- Secilen dersin konulari + kazanimlari listesi
- Numarali, renk kodlu, scroll edilebilir
- Mevcut bilgi seviyeleri gosterilir
- Konular acilir/kapanir (kazanimlari gormek icin)

**`components/voice-assessment/voice-recorder.tsx`**
- Mikrofon butonu, sure gostergesi
- Web Speech API ile canli transkript
- Uzun kayitlar icin: continuous mode + chunk yonetimi
- Duraklatma/devam
- Transkript onizleme

**`components/voice-assessment/assessment-result.tsx`**
- AI sonuclarini gosterir
- Konu bazli seviye kartlari
- Kazanim bazli checklist
- Duzenlenebilir alanlar
- Sesle duzeltme destegi

**`components/voice-assessment/voice-correction.tsx`**
- Duzeltme icin ek ses kaydi
- "Su konuyu aslinda 3 degil 4 yapın" gibi komutlari isler

#### 3. Hook: `hooks/useContinuousVoiceInput.ts`
- Mevcut `useVoiceInput.ts`'in genisletilmis versiyonu
- `continuous: true` modu
- Otomatik yeniden baslatma (speech recognition timeout'larinda)
- Chunk biriktirme (uzun kayitlar icin)
- Duraklatma/devam
- Toplam sure takibi

#### 4. API Route: `app/api/ai/voice-assessment/route.ts`
- POST: Transkript + mufredat yapisi alir
- OpenAI ile yapilandirilmis veri cikarir
- JSON formatinda donus:
  ```json
  {
    "topics": [
      {
        "topicId": "...",
        "topicName": "Turev",
        "suggestedLevel": 4,
        "reasoning": "Ogrenci turev kurallarini iyi bildigini soyledi",
        "kazanimlar": [
          { "kazanimId": "...", "checked": true, "note": "..." }
        ],
        "wrongAreas": ["Zincir kurali"],
        "needsReview": false
      }
    ],
    "generalNotes": "Genel olarak..."
  }
  ```

#### 5. API Route: `app/api/ai/voice-correction/route.ts`
- POST: Duzeltme transkripti + mevcut sonuclar
- Mevcut sonuclari gunceller

#### 6. API Route: `app/api/voice-assessment/save/route.ts`
- POST: Onaylanmis sonuclari toplu kaydet
- TopicKnowledge batch upsert
- KazanimProgress batch upsert
- Bilisssel cizge senkronizasyonu

### Mevcut Dosya Degisiklikleri

1. **`app/(app)/strategy/page.tsx`** - "Sesli Degerlendirme" butonu/linki eklenir
2. **`components/ui/`** - Gerekirse yeni UI komponentleri
3. **`lib/openai.ts`** - Yeni system prompt eklenir (SYSTEM_PROMPT_VOICE_ASSESSMENT)

---

## Detayli Akis Senaryosu

### Senaryo: Ogrenci TYT Matematik durumunu sesle anlatir

1. Ogrenci `/voice-assessment` sayfasina gider
2. "TYT Matematik" secer
3. Ekranda TYT Matematik'in tum konulari gozukur:
   ```
   1. Temel Kavramlar (Mevcut: 3/5)
   2. Sayilar (Mevcut: --)
   3. Bolunebilme (Mevcut: --)
   ...
   35. Olasilik (Mevcut: --)
   ```
4. "Kayda Basla" tiklar
5. Konusur: "Temel kavramlari iyi biliyorum, sayi basamaklarinda biraz sorunum var. Bolunebilme kurallari tamam ama OBEB-OKEK problemlerinde hata yapiyorum. Rasyonel sayilari hic bilmiyorum..."
6. Ekranda canli transkript gozukur
7. 5 dakika sonra "Kaydi Tamamla" tiklar
8. "Isleniyor..." yukleme ekrani (3-5 saniye)
9. Sonuc ekrani:
   ```
   Anladigim kadariyla:

   ✅ Temel Kavramlar → Seviye 4/5 (Iyi)
      "iyi biliyorum" ifadesinden

   ⚠️ Sayilar → Seviye 3/5 (Orta)
      "sayi basamaklarinda biraz sorun var"

   ⚠️ Bolunebilme → Seviye 3/5 (Orta)
      "kurallar tamam ama OBEB-OKEK problemlerinde hata"
      Tekrar onerilir: OBEB-OKEK problemleri

   ❌ Rasyonel Sayilar → Seviye 0/5 (Hic bilmiyorum)
      "hic bilmiyorum"
   ```
10. Ogrenci "Sayilar aslinda 2 olmali" diye duzeltir (sesle veya tikla)
11. "Onayla ve Kaydet" tiklar
12. Tum bilgiler veritabanina kaydedilir

---

## Web Speech API Uzun Kayit Stratejisi

Browser'in Web Speech API'si genellikle 60 saniye civarinda timeout olur. Bunu asmak icin:

1. `continuous: true` + `interimResults: true` ayarlari
2. `onend` event'inde otomatik yeniden baslatma
3. Her segment sonucunu biriktirme (accumulator pattern)
4. Kullaniciya kesintisiz deneyim sunma
5. Toplam sure ve transkript uzunlugu takibi

---

## OpenAI Prompt Tasarimi

### Ana Degerlendirme Promptu
```
Sen bir YKS mufredat degerlendirme asistanisin.

Asagida bir ogrencinin ses kaydindan elde edilen transkript ve mufredatin konu listesi var.
Ogrencinin her konu hakkinda ne soyledigini analiz et ve yapilandirilmis bir degerlendirme olustur.

MUFREDAT KONULARI:
[Konu listesi burada - ID, isim, kazanimlar]

OGRENCI TRANSKRIPTI:
[Transkript burada]

Asagidaki JSON formatinda yanit ver:
{
  "topics": [
    {
      "topicId": "string",
      "topicName": "string",
      "suggestedLevel": 0-5,
      "confidence": "high|medium|low",
      "reasoning": "Neden bu seviyeyi onerdiginin kisa aciklamasi",
      "kazanimlar": [{"kazanimId": "string", "checked": true/false, "note": "optional"}],
      "wrongAreas": ["string"],
      "needsReview": true/false,
      "studentQuote": "Ogrencinin bu konuyla ilgili soyledigi"
    }
  ],
  "unmentionedTopics": ["topicId listesi - ogrencinin hic bahsetmedigi konular"],
  "generalNotes": "Genel degerlendirme ozeti"
}

KURALLAR:
- Ogrenci bir konudan hic bahsetmemisse unmentionedTopics'e ekle
- Seviye belirlerken ogrencinin ifadelerini dikkate al
- "iyi biliyorum" = 4, "tamam" = 3-4, "biraz" = 2, "hic bilmiyorum" = 0
- Sayisal referanslar varsa (ornegin "1155") bunu konu numarasi olarak yorumla
- Kazanim bazinda detay varsa kazanimlar dizisini doldur
```

---

## Uygulama Adimlari (Sirali)

### Adim 1: Altyapi
- [ ] `useContinuousVoiceInput` hook'u olustur
- [ ] `lib/openai.ts`'e yeni prompt ekle

### Adim 2: API Route'lar
- [ ] `/api/ai/voice-assessment/route.ts` - AI isleme
- [ ] `/api/ai/voice-correction/route.ts` - Duzeltme isleme
- [ ] `/api/voice-assessment/save/route.ts` - Toplu kaydetme

### Adim 3: UI Komponentleri
- [ ] `subject-selector.tsx` - Ders secimi
- [ ] `curriculum-display.tsx` - Mufredat gorunumu
- [ ] `voice-recorder.tsx` - Ses kayit paneli
- [ ] `assessment-result.tsx` - Sonuc/onay ekrani

### Adim 4: Ana Sayfa
- [ ] `app/(app)/voice-assessment/page.tsx` - Wizard akisi

### Adim 5: Entegrasyon
- [ ] Strateji sayfasina link ekleme
- [ ] Navigation'a ekleme (gerekirse)

---

## Onemli Notlar

- Web Speech API tarayici destegi gerektirir (Chrome/Edge en iyi)
- Desteklenmeyen tarayicilarda uyari gosterilir
- Transkript kalitesi dusukse manuel duzeltme her zaman mumkun
- OpenAI API maliyetini kontrol icin transkript uzunlugu sinirlanabilir
- Uzun kayitlar chunklara bolunup islenir (token limiti)
