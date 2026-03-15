# Project Context - Queen The First (Şeyma/Şeyda YKS Prep Platform)

## Architecture
- **Framework**: Next.js 15 App Router + TypeScript
- **DB**: Prisma ORM + PostgreSQL (Railway)
- **AI**: OpenAI (gpt-4o-mini via `lib/openai.ts`)
- **UI**: Tailwind CSS glass-morphism + motion/react (Framer Motion) + sonner toasts
- **Auth**: next-auth with admin role check
- **Deploy**: Railway (queen-the-first-sheyda-the-acikyoruk-production.up.railway.app)

## Data Hierarchy
```
ExamType (TYT/AYT) → Subject (Matematik, Fizik...) → Topic (Türev, İntegral...)
  → TopicKazanim (learning outcomes per topic)
  → ConceptNode (cognitive graph nodes, linked via parentTopicId)
    → DependencyEdge (DAG: parent→child with weight)
    → UserCognitiveState (per-user mastery with Ebbinghaus retention)
```

## Admin Panel Structure (`app/(app)/admin/page.tsx`)
Tabs: GENEL | KULLANICILAR | MÜFREDAT | AI DÜZENLEME | ABONELİKLER | DAG
- Tab type: `'genel' | 'dag' | 'abonelikler' | 'ai-edit' | 'kullanicilar' | 'mufredat'`
- MÜFREDAT tab: `<CurriculumManager />` + `<MufredatManager />`
- DAG tab: `<CognitiveDashboard />` + `<ConceptNodeManager />` + `<DependencyEdgeManager />` + `<BulkImport />`

## Key API Endpoints (Admin)
- `/api/admin/curriculum` - GET (tree/links), POST (create subject/topic, link/unlink node), DELETE (topic/subject)
- `/api/admin/kazanimlar` - GET (tree/export/topicId), POST (JSON import), PATCH (edit), DELETE
- `/api/admin/ai-edit` - POST (AI suggest), PATCH (apply edits)
- `/api/admin/user-overview` - GET (user list / user detail with stats)
- `/api/cognitive/nodes` - GET (list), POST (create), PATCH/DELETE per node

## Key Components (Admin)
- `components/admin/curriculum-manager.tsx` - Ders/konu CRUD + ConceptNode linkage
- `components/admin/mufredat-manager.tsx` - Inline kazanım/topic editing + JSON export/import
- `components/admin/ai-curriculum-editor.tsx` - AI-powered bulk text corrections
- `components/admin/user-overview.tsx` - Per-user progress tracking
- `components/admin/concept-node-manager.tsx` - ConceptNode CRUD
- `components/admin/dependency-edge-manager.tsx` - DAG edge management

## ConceptNode Schema (Prisma)
```
model ConceptNode {
  id, name, slug (unique), domain, examType ("tyt"|"ayt"|"both"),
  complexityScore (1-10), parentTopicId? → Topic, sortOrder
  parentEdges (DependencyEdge[]), childEdges (DependencyEdge[])
  cognitiveStates (UserCognitiveState[])
}
```

## Slug Generation Pattern
Turkish chars → ASCII: ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c, then kebab-case

## Current Branch
`claude/student-progress-schedule-nbZ6s`

## Active Reform: Deneme Sistemi Yeniden Tasarımı
**Plan Dokümanı:** `docs/DENEME-REFORM-PLAN.md`
- 6 fazlı reform: Schema → Sıcak Faz → Soğuk Faz → Ana Ekran → Detay → Analitik
- Her faz ayrı PR ile merge edilir
- Temel felsefe: Kuantum Veri Girişi (Lazy Evaluation), Çift Fazlı Metrik (Clarity+Repair), Fog of War analitik, Recidivism ceza sistemi
- Kademeli Pill Segmentasyonu (dropdown yerine), Odak Merceği (Lens Effect), Triage Flashcard modu

## Active Work: Öğrenci İlerleme & Akıllı Öneri Sistemi (v2 Aksiyomatik)
**Plan Dokümanı:** `docs/STUDENT-PROGRESS-PLAN.md`
**Branch:** `claude/student-progress-schedule-nbZ6s`
**Aksiyomlar:** (1) Bayes Teoremi sinyal/gürültü, (2) Hız=Ustalık, (3) Çevre Mimarisi (sürtünmesiz)
- 4 fazlı geliştirme planı
- **Faz 1**: Olasılıksal Biliş Motoru — Beta(α,β) dağılımı per topic, güven aralığı + fuzzy kategori
  - `TopicBelief` Prisma model + `durationMinutes` ExamSubjectResult'a eklenir
  - `lib/bayesian-engine.ts` + `app/api/student/mastery/route.ts`
  - Sinyaller: examError, implicitPositive (discrimination-weighted), selfRating, studySession
  - Speed weight: V = T_subject / N_attempted × complexity → Bayesyen ağırlık
- **Faz 2**: Çevre Mimarisi Motoru — ROI bazlı tek aksiyon seçici (frictionless guidance)
  - `lib/roi-engine.ts` + `app/api/student/next-action/route.ts`
  - ROI = examWeight × gainPotential × dagLeverage × urgencyMultiplier
  - Negatif yargı yok → "sıradaki en verimli hamle" olarak sunulur
- **Faz 3**: Deneme Sonrası Bayesyen Güncelleme — post-exam signal processing
  - Exam results → incremental TopicBelief güncelleme (error + implicit positive)
  - Exam entry form'a durationMinutes input eklenir (opsiyonel, ders bazı)
- **Faz 4**: Dashboard Çevre Mimarisi UI — overlay session launcher + pomodoro timer
  - `components/home/next-action-widget.tsx` + `study-session-overlay.tsx` + `mastery-badge.tsx`
  - Tek buton "Hemen Başla" → timer başlar → oturum bitince DailyStudy + belief güncellenir
  - Fuzzy kategori (Belirsiz/Zayıf/Gelişiyor/Güçlü/Uzman) + hover'da CI detay
- **Durum**: v2 plan tamamlandı (aksiyomatik temeller), Faz 1'den başlanacak

## Pending Work (as of last session)
1. Curriculum manager UI improvements: bigger fonts, multi-select delete, bigger delete buttons
2. DAG: AI auto-generate concept nodes for each topic → review → approve → link
3. The AI should analyze each curriculum topic and suggest concept nodes to create and link
