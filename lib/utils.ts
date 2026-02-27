import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Türkiye saatine göre (Europe/Istanbul, UTC+3) tarih string'i döner.
 * Format: "YYYY-MM-DD" (sv-SE locale'i bu formatı verir)
 * Saat 21:00+ sonrası UTC'nin bir gün ileriye kaymasını engeller.
 */
export function getTurkeyDateString(date?: Date): string {
  const d = date || new Date();
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
}

/**
 * Türkiye saatine göre bugünün Date nesnesini döner (saat 00:00:00 olarak).
 */
export function getTurkeyToday(): Date {
  const str = getTurkeyDateString();
  return new Date(str + "T00:00:00+03:00");
}
