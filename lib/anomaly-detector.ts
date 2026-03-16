// ==================== Aktif Anomali Tespiti (Sibernetik Kapalı Çevrim) ====================
//
// Aksiyom 1 (Sibernetik): Pasif log yığını ≠ kontrol. Sensörden gelen veri,
// eşik değeri (threshold) aşıldığında bir actuator (uyarı) üretmelidir.
//
// Aksiyom 2 (Kurucunun Bilişsel Sınırı): Manuel log tarama ameleliktir.
// Sistem kendi anomalilerini tespit edip kurucuyu "dürtmelidir".
//
// İki anomali sınıfı:
//   1. Matematiksel Anomali: EP delta > MASTERY_JUMP_THRESHOLD → γ agresif veya veri sapması
//   2. Sürtünme Anomalisi: Kullanıcı ROI önerisini reddediyor → planlama/zorluk algısı yanlış

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// ── Eşik Değerleri (Thresholds) ──

/** Tek denemede izin verilen maksimum mastery sıçraması */
const MASTERY_JUMP_THRESHOLD = 0.4;

/** Sürtünme tespiti için geriye bakış penceresi (gün) */
const FRICTION_LOOKBACK_DAYS = 7;

/** Sürtünme oranı eşiği: önerilerin %70'inden fazlası reddediliyorsa anomali */
const FRICTION_REJECTION_THRESHOLD = 0.7;

/** Minimum oturum sayısı — düşük örneklemde false positive önleme */
const FRICTION_MIN_SESSIONS = 3;

// ── Anomali Tipleri ──

interface AnomalyEvent {
  type: 'mastery_jump' | 'roi_rejection';
  severity: 'warning' | 'critical';
  userId: string;
  detail: Record<string, unknown>;
  message: string;
}

// ── 1. Matematiksel Anomali: EP Mastery Sıçraması ──

/**
 * Elastic Projection sonrası çağrılır.
 * Delta > threshold ise admin'e bildirim oluşturur.
 *
 * @param userId - Etkilenen öğrenci
 * @param nodeId - Sıçrayan ConceptNode
 * @param topicId - Bağlı topic
 * @param mOld - Eski mastery
 * @param mNew - Yeni mastery
 * @param bNew - Bayesyen ortalama (sinyal kaynağı)
 */
export async function detectMasteryJump(
  userId: string,
  nodeId: string,
  topicId: string,
  mOld: number,
  mNew: number,
  bNew: number
): Promise<void> {
  const delta = Math.abs(mNew - mOld);
  if (delta <= MASTERY_JUMP_THRESHOLD) return;

  const anomaly: AnomalyEvent = {
    type: 'mastery_jump',
    severity: delta > 0.6 ? 'critical' : 'warning',
    userId,
    detail: { nodeId, topicId, mOld, mNew, bNew, delta, threshold: MASTERY_JUMP_THRESHOLD },
    message: `Mastery sıçraması: ${mOld.toFixed(3)} → ${mNew.toFixed(3)} (Δ=${delta.toFixed(3)}) — B=${bNew.toFixed(3)}. γ=0.3 ile bu sıçrama anormal, veri tutarsızlığı olası.`,
  };

  await emitAnomaly(anomaly);
}

// ── 2. Sürtünme Anomalisi: ROI Önerisi Reddi ──

/**
 * Çalışma oturumu kaydedildiğinde çağrılır.
 * Son N gündeki ROI önerisi vs gerçek çalışma konusu karşılaştırması yapar.
 *
 * @param userId - Öğrenci
 * @param studiedTopicId - Gerçekte çalışılan konu
 */
export async function detectFrictionAnomaly(
  userId: string,
  studiedTopicId: string
): Promise<void> {
  try {
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - FRICTION_LOOKBACK_DAYS);

    // Son N gündeki çalışma oturumları
    const recentStudies = await prisma.dailyStudy.findMany({
      where: {
        userId,
        date: { gte: lookbackDate },
        topicId: { not: null },
      },
      select: { topicId: true },
      orderBy: { date: 'desc' },
      take: 20,
    });

    if (recentStudies.length < FRICTION_MIN_SESSIONS) return;

    // Son ROI önerisini al (en son next-action çağrısının sonucu)
    // TopicBelief üzerinden en yüksek ROI'li topic'i yaklaşık hesapla
    // (Gerçek ROI motorunu tekrar çağırmak yerine, en düşük mastery'li topic'i proxy olarak kullan)
    const beliefs = await prisma.topicBelief.findMany({
      where: { userId },
      select: { topicId: true, alpha: true, beta: true },
      orderBy: { alpha: 'asc' }, // En düşük alpha = en zayıf konu
    });

    if (beliefs.length === 0) return;

    // En zayıf 3 topic (ROI motorunun yüksek ihtimalle önereceği konular)
    const weakTopicIds = new Set(
      beliefs
        .map(b => ({ topicId: b.topicId, mean: b.alpha / (b.alpha + b.beta) }))
        .sort((a, b) => a.mean - b.mean)
        .slice(0, 3)
        .map(b => b.topicId)
    );

    // Kaç oturum önerilen konulardan birine gitmiş?
    const studiedTopicIds = recentStudies.map(s => s.topicId!);
    const alignedCount = studiedTopicIds.filter(id => weakTopicIds.has(id)).length;
    const rejectionRate = 1 - (alignedCount / studiedTopicIds.length);

    if (rejectionRate < FRICTION_REJECTION_THRESHOLD) return;

    const anomaly: AnomalyEvent = {
      type: 'roi_rejection',
      severity: rejectionRate > 0.9 ? 'critical' : 'warning',
      userId,
      detail: {
        rejectionRate: Math.round(rejectionRate * 100),
        totalSessions: studiedTopicIds.length,
        alignedSessions: alignedCount,
        weakTopics: Array.from(weakTopicIds),
        recentStudiedTopics: [...new Set(studiedTopicIds)].slice(0, 5),
        lookbackDays: FRICTION_LOOKBACK_DAYS,
      },
      message: `Otonomi reddi: Son ${studiedTopicIds.length} oturumun %${Math.round(rejectionRate * 100)}'inde öğrenci ROI önerisini atlayıp farklı konu çalıştı. Planlama kapasitesi veya zorluk algısı yanlış olabilir.`,
    };

    await emitAnomaly(anomaly);
  } catch (err) {
    // Anomali tespiti asla ana akışı bozmamalı
    logger.error({ event: 'anomaly_detection_error', userId, err }, '[ANOMALY] Friction detection failed');
  }
}

// ── Anomali Yayıcı (Actuator) ──

/**
 * Anomali tespit edildiğinde:
 * 1. Railway loglarına WARN/ERROR seviyesinde yazar (Axiom/Datadog alert rule)
 * 2. Admin kullanıcılara Notification oluşturur (uygulama içi dürtme)
 *
 * Gelecek: Webhook (Slack/Discord) veya email entegrasyonu eklenebilir.
 */
async function emitAnomaly(anomaly: AnomalyEvent): Promise<void> {
  // 1. Structured log (Railway → Axiom alert rule ile yakalanır)
  const logMethod = anomaly.severity === 'critical' ? 'error' : 'warn';
  logger[logMethod](
    { event: `anomaly_${anomaly.type}`, severity: anomaly.severity, ...anomaly.detail },
    `[ANOMALY] ${anomaly.type} userId=${anomaly.userId} — ${anomaly.message}`
  );

  // 2. Uygulama içi bildirim — admin kullanıcılara dürtme
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });

    if (admins.length === 0) return;

    const title = anomaly.severity === 'critical'
      ? `🚨 Kritik Anomali: ${anomaly.type === 'mastery_jump' ? 'Mastery Sıçraması' : 'ROI Reddi'}`
      : `⚠️ Anomali: ${anomaly.type === 'mastery_jump' ? 'Mastery Sıçraması' : 'ROI Reddi'}`;

    // Aynı tip anomali için spam önleme: son 1 saatte aynı userId+type için bildirim varsa atla
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentNotification = await prisma.notification.findFirst({
      where: {
        recipientId: admins[0].id,
        type: 'anomaly',
        title: { contains: anomaly.type },
        createdAt: { gte: oneHourAgo },
        message: { contains: anomaly.userId },
      },
    });

    if (recentNotification) {
      logger.info(
        { event: 'anomaly_throttled', type: anomaly.type, userId: anomaly.userId },
        `[ANOMALY] Throttled: same anomaly within 1h`
      );
      return;
    }

    // Her admin'e bildirim oluştur
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        recipientId: admin.id,
        type: 'anomaly',
        title,
        message: `[${anomaly.userId.slice(0, 8)}...] ${anomaly.message}`,
      })),
    });
  } catch (notifErr) {
    // Bildirim hatası asla ana akışı bozmamalı
    logger.error(
      { event: 'anomaly_notification_error', err: notifErr },
      '[ANOMALY] Failed to create admin notification'
    );
  }
}
