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

## Active Work: Öğrenci İlerleme & Akıllı Öneri Sistemi
**Plan Dokümanı:** `docs/STUDENT-PROGRESS-PLAN.md`
**Branch:** `claude/student-progress-schedule-nbZ6s`
- 4 fazlı geliştirme planı
- **Faz 1**: Deterministik Konu Hakimiyet Motoru (Topic Mastery Engine) — CMS skoru (0-100)
  - 5 bileşen: selfRating(%20), examPerformance(%35), implicitPositive(%20), studyEffort(%15), recency(%10)
  - `lib/topic-mastery-engine.ts` + `app/api/student/mastery-scores/route.ts`
- **Faz 2**: Akıllı İçgörü & Öneri Motoru — 6 insight tipi (FUTILITY, NEGLECT, OVER_STUDY, MASTERY_CONFIRMED, DECLINING, QUICK_WIN)
  - `lib/recommendation-engine.ts` + `app/api/student/recommendations/route.ts`
- **Faz 3**: Deneme Sonrası Otomatik Mastery Güncellemesi — örtük pozitif sinyal + TopicKnowledge ayarı
  - Mevcut `app/api/exams/[id]/results/route.ts` düzenlenir
- **Faz 4**: Dashboard Öneri Widget'ı — `components/home/study-recommendations.tsx`
  - Dashboard'da "Bugünün Planı" altına eklenir
- **Durum**: Planlama tamamlandı, Faz 1'den başlanacak

## Pending Work (as of last session)
1. Curriculum manager UI improvements: bigger fonts, multi-select delete, bigger delete buttons
2. DAG: AI auto-generate concept nodes for each topic → review → approve → link
3. The AI should analyze each curriculum topic and suggest concept nodes to create and link
