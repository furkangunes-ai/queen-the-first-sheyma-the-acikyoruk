/**
 * Çift Fazlı Metrik Sistemi
 *
 * coldPhaseCompleted boolean flag'i kaldırıldı.
 * Yerine iki ortogonal metrik kullanılır:
 *
 * 1. Clarity Score (Teşhis/Netlik Oranı):
 *    "Savaş alanını ne kadar net görüyoruz?"
 *    = Sınıflandırılmış void'lar / Toplam void'lar
 *    Kullanım: Soğuk faz tamamlama çubuğu
 *
 * 2. Repair Score (Onarım/İyileşme Oranı):
 *    "Haritaladığımız zafiyetlerin ne kadarını iyileştirdik?"
 *    = RESOLVED void'lar / Sınıflandırılmış void'lar
 *    Kullanım: Genel gelişim göstergesi
 */

import type { VoidStatusType } from './severity';

interface VoidForMetrics {
  status: string;
}

/**
 * Clarity Score: RAW olmayan void'ların toplama oranı
 * %0 = tüm veriler ham (hiç sınıflandırılmamış)
 * %100 = tüm veriler sınıflandırılmış (konu + neden atanmış)
 *
 * Void yoksa = 1.0 (eksiksiz — sınıflandırılacak bir şey yok)
 */
export function calculateClarityScore(voids: VoidForMetrics[]): number {
  if (voids.length === 0) return 1;
  const classified = voids.filter(v => v.status !== 'RAW').length;
  return classified / voids.length;
}

/**
 * Repair Score: RESOLVED void'ların sınıflandırılmışlara oranı
 * RAW void'lar bu hesaba katılmaz (henüz teşhis bile yapılmamış)
 * %0 = hiçbir zafiyet çözülmemiş
 * %100 = tüm sınıflandırılmış zafiyetler çözülmüş
 *
 * Sınıflandırılmış void yoksa = 0 (henüz onarılacak bir şey tanımlanmamış)
 */
export function calculateRepairScore(voids: VoidForMetrics[]): number {
  const classified = voids.filter(v => v.status !== 'RAW');
  if (classified.length === 0) return 0;
  const resolved = classified.filter(v => v.status === 'RESOLVED').length;
  return resolved / classified.length;
}

/**
 * Clarity Score'u yüzde string'ine çevir
 * Örn: 0.45 → "%45"
 */
export function formatScorePercent(score: number): string {
  return `%${Math.round(score * 100)}`;
}

/**
 * Deneme kartları için renk sınıfı döndür (clarity score bazlı)
 * %0-33: kırmızı (tehlike), %34-66: amber (uyarı), %67-100: yeşil (iyi)
 */
export function getClarityColorClass(clarityScore: number): {
  ring: string;
  text: string;
  bg: string;
} {
  if (clarityScore < 0.34) {
    return { ring: 'stroke-red-400', text: 'text-red-400', bg: 'bg-red-500/20' };
  }
  if (clarityScore < 0.67) {
    return { ring: 'stroke-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/20' };
  }
  return { ring: 'stroke-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/20' };
}
