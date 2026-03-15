// ==================== Analitik Motor (Analytics Engine) ====================
//
// 5 analitik modül:
// 1. Trend Algılama — Deneme-arası hata trendleri (iyileşme/kötüleşme)
// 2. Kök Neden Tespiti — DAG üzerinden kümelenmiş zayıflıkları analiz
// 3. Belief Decay — Zamanla kanıt belirsizliğini artır (Ebbinghaus)
// 4. Öğrenci Profili — Hata örüntüsüne göre tip tespiti
// 5. Net Tahmin — Mevcut belief'lerden tahmini sınav neti

import { betaMean, evidenceCount } from './bayesian-engine';

// ==================== 1. Trend Algılama ====================

export type TrendDirection = 'improving' | 'worsening' | 'stable';

export interface TopicTrend {
  topicId: string;
  topicName: string;
  subjectName: string;
  direction: TrendDirection;
  /** Negatif = iyileşme (daha az hata), pozitif = kötüleşme */
  slope: number;
  /** Kaç deneme üzerinden hesaplandı */
  examCount: number;
  /** Son denemede hata sayısı */
  lastErrorCount: number;
  /** İlk denemede hata sayısı */
  firstErrorCount: number;
  message: string;
}

export interface ExamErrorSnapshot {
  examId: string;
  examDate: Date;
  topicId: string;
  topicName: string;
  subjectName: string;
  wrongCount: number;
  emptyCount: number;
}

/**
 * Deneme-arası trend algılama.
 *
 * Her konu için son N denemede hata sayısının yönünü hesaplar.
 * 3+ ardışık azalma = iyileşme, 3+ ardışık artış = kötüleşme.
 *
 * Basit lineer regresyon: slope < -0.3 = iyileşiyor, > 0.3 = kötüleşiyor.
 */
export function detectTrends(
  snapshots: ExamErrorSnapshot[],
  minExams: number = 3
): TopicTrend[] {
  // Konuya göre grupla, tarih sıralı
  const byTopic = new Map<string, ExamErrorSnapshot[]>();
  for (const s of snapshots) {
    const existing = byTopic.get(s.topicId) ?? [];
    existing.push(s);
    byTopic.set(s.topicId, existing);
  }

  const trends: TopicTrend[] = [];

  for (const [topicId, exams] of byTopic) {
    // Tarih sıralı (eskiden yeniye)
    const sorted = exams.sort((a, b) => a.examDate.getTime() - b.examDate.getTime());
    if (sorted.length < minExams) continue;

    // Son 8 denemeyi al
    const recent = sorted.slice(-8);
    const errorCounts = recent.map(e => e.wrongCount + e.emptyCount);

    // Basit lineer regresyon slope
    const n = errorCounts.length;
    const xMean = (n - 1) / 2;
    const yMean = errorCounts.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (errorCounts[i] - yMean);
      denominator += (i - xMean) ** 2;
    }
    const slope = denominator > 0 ? numerator / denominator : 0;

    // Eşik: |slope| > 0.3 → anlamlı trend
    let direction: TrendDirection = 'stable';
    if (slope < -0.3) direction = 'improving';
    else if (slope > 0.3) direction = 'worsening';

    const first = errorCounts[0];
    const last = errorCounts[errorCounts.length - 1];
    const sample = recent[0];

    const message = direction === 'improving'
      ? `${sample.topicName} konusunda son ${n} denemede hata sayısı ${first}'den ${last}'e düştü. İyileşme trendi var.`
      : direction === 'worsening'
        ? `${sample.topicName} konusunda son ${n} denemede hata sayısı ${first}'den ${last}'e çıktı. Dikkat gerekiyor.`
        : `${sample.topicName} konusunda son ${n} denemede hata sayısı stabil.`;

    trends.push({
      topicId,
      topicName: sample.topicName,
      subjectName: sample.subjectName,
      direction,
      slope: Math.round(slope * 100) / 100,
      examCount: n,
      lastErrorCount: last,
      firstErrorCount: first,
      message,
    });
  }

  // İyileşen ve kötüleşenler önce
  return trends.sort((a, b) => {
    const order = { worsening: 0, improving: 1, stable: 2 };
    return order[a.direction] - order[b.direction] || Math.abs(b.slope) - Math.abs(a.slope);
  });
}

// ==================== 2. Kök Neden Tespiti (DAG Clustering) ====================

export interface RootCauseCluster {
  /** Kök neden node'un ID'si */
  rootNodeId: string;
  rootNodeName: string;
  rootTopicId: string | null;
  rootTopicName: string | null;
  /** Kök nedenin mastery seviyesi (0-1) */
  rootMastery: number;
  /** Bu kök nedenden etkilenen child node sayısı */
  affectedChildCount: number;
  /** Etkilenen child'ların adları */
  affectedChildren: string[];
  /** Tahmini düzeltme etkisi: bu kök neden çözülürse kaç child iyileşir */
  estimatedImpact: number;
  message: string;
}

export interface DAGNode {
  id: string;
  name: string;
  parentTopicId: string | null;
  parentTopicName?: string | null;
}

export interface DAGEdge {
  parentNodeId: string;
  childNodeId: string;
  dependencyWeight: number;
}

export interface NodeMastery {
  nodeId: string;
  masteryLevel: number;
}

/**
 * DAG üzerinden kök neden analizi.
 *
 * Zayıf olan parent node'lar, birden fazla child'ı zayıflatan "kök nedenler".
 * Her parent'ın mastery'si düşükse ve child sayısı yüksekse → yüksek impact kök neden.
 */
export function findRootCauses(
  nodes: DAGNode[],
  edges: DAGEdge[],
  masteryStates: NodeMastery[],
  weaknessThreshold: number = 0.5
): RootCauseCluster[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const masteryMap = new Map(masteryStates.map(s => [s.nodeId, s.masteryLevel]));

  // Her parent node'un child'larını bul
  const parentChildMap = new Map<string, { childId: string; weight: number }[]>();
  for (const edge of edges) {
    const existing = parentChildMap.get(edge.parentNodeId) ?? [];
    existing.push({ childId: edge.childNodeId, weight: edge.dependencyWeight });
    parentChildMap.set(edge.parentNodeId, existing);
  }

  const clusters: RootCauseCluster[] = [];

  for (const [parentId, children] of parentChildMap) {
    const parentMastery = masteryMap.get(parentId) ?? 0;
    const parentNode = nodeMap.get(parentId);
    if (!parentNode) continue;

    // Sadece zayıf parent'lar kök neden adayı
    if (parentMastery >= weaknessThreshold) continue;

    // Kaç child da zayıf?
    const weakChildren: string[] = [];
    let totalImpact = 0;

    for (const child of children) {
      const childMastery = masteryMap.get(child.childId) ?? 0;
      const childNode = nodeMap.get(child.childId);
      if (childMastery < weaknessThreshold && childNode) {
        weakChildren.push(childNode.name);
        totalImpact += child.weight * (weaknessThreshold - parentMastery);
      }
    }

    // En az 1 zayıf child varsa raporla
    if (weakChildren.length >= 1) {
      clusters.push({
        rootNodeId: parentId,
        rootNodeName: parentNode.name,
        rootTopicId: parentNode.parentTopicId,
        rootTopicName: parentNode.parentTopicName ?? null,
        rootMastery: Math.round(parentMastery * 100) / 100,
        affectedChildCount: weakChildren.length,
        affectedChildren: weakChildren,
        estimatedImpact: Math.round(totalImpact * 100) / 100,
        message: `${parentNode.name} zayıf (${Math.round(parentMastery * 100)}%) ve ${weakChildren.length} bağlı konuyu etkiliyor: ${weakChildren.slice(0, 3).join(', ')}${weakChildren.length > 3 ? ` ve ${weakChildren.length - 3} diğer` : ''}.`,
      });
    }
  }

  return clusters.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
}

// ==================== 3. Belief Decay (Ebbinghaus) ====================

export interface DecayedBelief {
  topicId: string;
  originalAlpha: number;
  originalBeta: number;
  decayedAlpha: number;
  decayedBeta: number;
  originalMean: number;
  decayedMean: number;
  daysSinceUpdate: number;
  decayFactor: number;
}

/**
 * Zamanla belief belirsizliğini artır.
 *
 * Ebbinghaus ilkesi: kullanılmayan bilgi zayıflar.
 * Alpha ve beta'yı birbirine yaklaştır (belirsizliği artır), ama sıfırlama.
 *
 * Formül: decayFactor = exp(-daysSince / halfLife)
 * Alpha' = 1 + (alpha - 1) * decayFactor
 * Beta'  = 1 + (beta  - 1) * decayFactor
 *
 * halfLife: 90 gün — 3 ayda kanıt gücü yarıya düşer
 */
export function applyBeliefDecay(
  alpha: number,
  beta: number,
  daysSinceUpdate: number,
  halfLife: number = 90
): DecayedBelief {
  const originalMean = betaMean(alpha, beta);

  if (daysSinceUpdate <= 7) {
    // 1 haftadan yeni → decay yok
    return {
      topicId: '',
      originalAlpha: alpha,
      originalBeta: beta,
      decayedAlpha: alpha,
      decayedBeta: beta,
      originalMean,
      decayedMean: originalMean,
      daysSinceUpdate,
      decayFactor: 1.0,
    };
  }

  // Decay hesapla
  const decayFactor = Math.exp(-Math.log(2) * daysSinceUpdate / halfLife);

  // Prior'a (1, 1) doğru yaklaştır
  const decayedAlpha = 1 + (alpha - 1) * decayFactor;
  const decayedBeta = 1 + (beta - 1) * decayFactor;
  const decayedMean = betaMean(decayedAlpha, decayedBeta);

  return {
    topicId: '',
    originalAlpha: alpha,
    originalBeta: beta,
    decayedAlpha: Math.round(decayedAlpha * 1000) / 1000,
    decayedBeta: Math.round(decayedBeta * 1000) / 1000,
    originalMean: Math.round(originalMean * 1000) / 1000,
    decayedMean: Math.round(decayedMean * 1000) / 1000,
    daysSinceUpdate,
    decayFactor: Math.round(decayFactor * 1000) / 1000,
  };
}

/**
 * Stale topic'leri tespit et (decay uygulanması gereken).
 *
 * 30+ gün güncellenmemiş ve evidence > 3 olan topic'ler.
 */
export function findStaleBeliefs(
  beliefs: Array<{ topicId: string; alpha: number; beta: number; updatedAt: Date }>,
  now: Date = new Date(),
  staleThresholdDays: number = 30
): DecayedBelief[] {
  const stale: DecayedBelief[] = [];

  for (const b of beliefs) {
    const evidence = evidenceCount(b.alpha, b.beta);
    if (evidence < 3) continue; // Yetersiz veri — decay anlamsız

    const daysSince = Math.floor((now.getTime() - b.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < staleThresholdDays) continue;

    const decayed = applyBeliefDecay(b.alpha, b.beta, daysSince);
    decayed.topicId = b.topicId;
    stale.push(decayed);
  }

  return stale.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

// ==================== 4. Öğrenci Tipi Profilleme ====================

export type StudentErrorProfile =
  | 'conceptual'    // Kavram yanılgısı ağırlıklı → konu tekrarı
  | 'careless'      // Dikkatsizlik ağırlıklı → soru pratiği
  | 'knowledge_gap' // Bilgi eksikliği ağırlıklı → yeni konu çalışması
  | 'time_pressure' // Süre sorunu → hız çalışması
  | 'balanced'      // Dengeli dağılım
  | 'insufficient'; // Yetersiz veri

export interface ErrorProfileResult {
  profile: StudentErrorProfile;
  profileLabel: string;
  profileDescription: string;
  /** Her hata türünün yüzdesi */
  distribution: Record<string, { count: number; percentage: number }>;
  /** Toplam hata sayısı */
  totalErrors: number;
  /** Baskın hata türü */
  dominantErrorType: string | null;
  /** Baskın türün yüzdesi */
  dominantPercentage: number;
  /** Çalışma önerisi */
  recommendation: string;
}

const PROFILE_LABELS: Record<StudentErrorProfile, string> = {
  conceptual: 'Kavram Odaklı',
  careless: 'Dikkat Odaklı',
  knowledge_gap: 'Bilgi Eksikliği',
  time_pressure: 'Süre Baskısı',
  balanced: 'Dengeli',
  insufficient: 'Yetersiz Veri',
};

const PROFILE_DESCRIPTIONS: Record<StudentErrorProfile, string> = {
  conceptual: 'Hatalarının çoğu kavram yanılgısından kaynaklanıyor. Temel kavramları tekrar gözden geçirmen gerekiyor.',
  careless: 'Konuları biliyorsun ama dikkatsizlikten hata yapıyorsun. Soru çözme pratiği ile dikkat eğitimi önerilir.',
  knowledge_gap: 'Bazı konularda temel bilgi eksikliğin var. Yeni konu çalışmasına öncelik ver.',
  time_pressure: 'Süre yetişmemesi en büyük sorunun. Hız çalışması ve zaman yönetimi pratiği yap.',
  balanced: 'Hata türlerin dengeli dağılmış. Genel pratik ve konu tekrarı dengeli bir strateji olacaktır.',
  insufficient: 'Henüz yeterli hata verisi yok. Daha fazla deneme girişi yapıldıkça profilin netleşecek.',
};

const PROFILE_RECOMMENDATIONS: Record<StudentErrorProfile, string> = {
  conceptual: 'Konu anlatım videolarını izle, kavram haritası oluştur, temel tanımları tekrar et.',
  careless: 'Soru çözerken her adımı kontrol et, 10 soruluk mini setler çöz, "ikinci okuma" alışkanlığı edin.',
  knowledge_gap: 'Eksik konuları tespit et, sıfırdan konu çalışmasına başla, temel kaynaklardan ilerle.',
  time_pressure: 'Zamanlı soru setleri çöz, kolay soruları hızla geç, zor soruları atlayıp geri dön.',
  balanced: 'Her gün konu tekrarı + soru pratiği karışımı yap. Zayıf konulara öncelik ver.',
  insufficient: 'Deneme sınavlarına girmeye devam et, sonuçlarını detaylı gir.',
};

/**
 * Öğrencinin hata örüntüsünü analiz ederek profil çıkar.
 *
 * Baskın hata türü > %40 ise o profil, yoksa 'balanced'.
 */
export function analyzeErrorProfile(
  errorReasons: Array<{ errorReason: string | null; count: number }>
): ErrorProfileResult {
  const totalErrors = errorReasons.reduce((s, e) => s + e.count, 0);

  if (totalErrors < 5) {
    return {
      profile: 'insufficient',
      profileLabel: PROFILE_LABELS.insufficient,
      profileDescription: PROFILE_DESCRIPTIONS.insufficient,
      distribution: {},
      totalErrors,
      dominantErrorType: null,
      dominantPercentage: 0,
      recommendation: PROFILE_RECOMMENDATIONS.insufficient,
    };
  }

  // Dağılım hesapla
  const distribution: Record<string, { count: number; percentage: number }> = {};
  for (const e of errorReasons) {
    const key = e.errorReason ?? 'SINIFLANDIRILMAMIS';
    if (!distribution[key]) distribution[key] = { count: 0, percentage: 0 };
    distribution[key].count += e.count;
  }
  for (const key of Object.keys(distribution)) {
    distribution[key].percentage = Math.round((distribution[key].count / totalErrors) * 100);
  }

  // Baskın türü bul
  let dominant: { key: string; count: number } = { key: '', count: 0 };
  for (const [key, val] of Object.entries(distribution)) {
    if (val.count > dominant.count) dominant = { key, count: val.count };
  }

  const dominantPct = (dominant.count / totalErrors) * 100;

  // Profil belirle
  let profile: StudentErrorProfile = 'balanced';
  if (dominantPct >= 40) {
    const typeProfileMap: Record<string, StudentErrorProfile> = {
      KAVRAM_YANILGISI: 'conceptual',
      BILGI_EKSIKLIGI: 'knowledge_gap',
      DIKKATSIZLIK: 'careless',
      ISLEM_HATASI: 'careless',
      SURE_YETISMEDI: 'time_pressure',
      SORU_KOKUNU_YANLIS_OKUMA: 'careless',
    };
    profile = typeProfileMap[dominant.key] ?? 'balanced';
  }

  return {
    profile,
    profileLabel: PROFILE_LABELS[profile],
    profileDescription: PROFILE_DESCRIPTIONS[profile],
    distribution,
    totalErrors,
    dominantErrorType: dominant.key,
    dominantPercentage: Math.round(dominantPct),
    recommendation: PROFILE_RECOMMENDATIONS[profile],
  };
}

// ==================== 5. Net Tahmin Motoru ====================

export interface NetPrediction {
  examTypeName: string;
  predictedNet: number;
  /** Güven aralığı: alt sınır */
  lowerBound: number;
  /** Güven aralığı: üst sınır */
  upperBound: number;
  /** Ders bazında kırılım */
  subjectBreakdown: SubjectNetPrediction[];
  message: string;
}

export interface SubjectNetPrediction {
  subjectId: string;
  subjectName: string;
  questionCount: number;
  /** Tahmini doğru soru sayısı */
  predictedCorrect: number;
  /** Tahmini yanlış soru sayısı */
  predictedWrong: number;
  /** Tahmini net (doğru - yanlış/4) */
  predictedNet: number;
  /** Güven: tüm topic'lerin ortalama evidence'ı */
  avgEvidence: number;
}

export interface TopicBeliefForPrediction {
  topicId: string;
  subjectId: string;
  alpha: number;
  beta: number;
}

export interface SubjectInfo {
  id: string;
  name: string;
  questionCount: number;
  examTypeName: string;
  topicCount: number;
}

/**
 * Mevcut belief'lerden sınav neti tahmini.
 *
 * Her ders için:
 * 1. Dersin topic'lerinin belief ortalamasını al
 * 2. Ortalama mastery × soru sayısı = tahmini doğru
 * 3. (1 - mastery) × guessFactor = tahmini yanlış (geri kalan boş)
 * 4. Net = doğru - yanlış/4
 *
 * guessFactor: bilmediği soruların ne kadarını deneyeceği (0.4 varsayılan)
 */
export function predictNet(
  subjects: SubjectInfo[],
  beliefs: TopicBeliefForPrediction[],
  guessFactor: number = 0.4
): NetPrediction[] {
  // Subject bazında belief'leri grupla
  const beliefsBySubject = new Map<string, TopicBeliefForPrediction[]>();
  for (const b of beliefs) {
    const existing = beliefsBySubject.get(b.subjectId) ?? [];
    existing.push(b);
    beliefsBySubject.set(b.subjectId, existing);
  }

  // ExamType bazında grupla
  const examTypeGroups = new Map<string, SubjectNetPrediction[]>();

  for (const subject of subjects) {
    const topicBeliefs = beliefsBySubject.get(subject.id) ?? [];

    // Topic'lerin belief ortalaması
    let totalMean = 0;
    let totalEvidence = 0;
    let coveredTopics = 0;

    for (const tb of topicBeliefs) {
      totalMean += betaMean(tb.alpha, tb.beta);
      totalEvidence += evidenceCount(tb.alpha, tb.beta);
      coveredTopics++;
    }

    // Belief olmayan topic'ler için 0.5 (uniform prior)
    const uncoveredTopics = Math.max(0, subject.topicCount - coveredTopics);
    totalMean += uncoveredTopics * 0.5;

    const effectiveTopicCount = coveredTopics + uncoveredTopics;
    const avgMastery = effectiveTopicCount > 0 ? totalMean / effectiveTopicCount : 0.5;
    const avgEvidence = coveredTopics > 0 ? totalEvidence / coveredTopics : 0;

    // Tahmini sonuç
    const predictedCorrect = Math.round(avgMastery * subject.questionCount * 10) / 10;
    const unknownQuestions = subject.questionCount - predictedCorrect;
    const predictedWrong = Math.round(unknownQuestions * guessFactor * 10) / 10;
    const predictedNet = Math.round((predictedCorrect - predictedWrong / 4) * 10) / 10;

    const prediction: SubjectNetPrediction = {
      subjectId: subject.id,
      subjectName: subject.name,
      questionCount: subject.questionCount,
      predictedCorrect,
      predictedWrong,
      predictedNet: Math.max(0, predictedNet),
      avgEvidence: Math.round(avgEvidence * 10) / 10,
    };

    const group = examTypeGroups.get(subject.examTypeName) ?? [];
    group.push(prediction);
    examTypeGroups.set(subject.examTypeName, group);
  }

  // ExamType bazında toplam
  const predictions: NetPrediction[] = [];
  for (const [examType, breakdown] of examTypeGroups) {
    const totalNet = breakdown.reduce((s, b) => s + b.predictedNet, 0);
    const avgEvidence = breakdown.reduce((s, b) => s + b.avgEvidence, 0) / breakdown.length;

    // Güven aralığı: evidence az ise geniş, çok ise dar
    const uncertaintyFactor = Math.max(0.05, 0.3 / Math.sqrt(Math.max(1, avgEvidence)));
    const totalQuestions = breakdown.reduce((s, b) => s + b.questionCount, 0);
    const margin = totalQuestions * uncertaintyFactor;

    predictions.push({
      examTypeName: examType,
      predictedNet: Math.round(totalNet * 10) / 10,
      lowerBound: Math.max(0, Math.round((totalNet - margin) * 10) / 10),
      upperBound: Math.round((totalNet + margin) * 10) / 10,
      subjectBreakdown: breakdown,
      message: avgEvidence < 3
        ? `Tahmini ${examType} neti: ${Math.round(totalNet * 10) / 10}. Veri az — daha fazla deneme girdikçe tahmin netleşecek.`
        : `Tahmini ${examType} neti: ${Math.round(totalNet * 10) / 10} (${Math.round(totalNet - margin)}-${Math.round(totalNet + margin)} aralığı).`,
    });
  }

  return predictions;
}
