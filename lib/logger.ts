// ==================== Structured Logger (pino) ====================
//
// Production'da JSON formatında log yazar (Railway/Axiom/Datadog uyumlu).
// Development'ta okunabilir pretty format kullanır.
// console.error yerine logger.error() kullanılmalı.

import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  ...(isDev
    ? {
        transport: {
          target: "pino/file",
          options: { destination: 1 }, // stdout
        },
        formatters: {
          level(label: string) {
            return { level: label };
          },
        },
      }
    : {
        formatters: {
          level(label: string) {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});

/**
 * API route'larında hata loglamak için.
 * Error objesini serialize eder, stack trace'i saklar.
 */
export function logApiError(
  route: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  const errObj =
    error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { message: String(error) };

  logger.error({ route, err: errObj, ...extra }, `API error: ${route}`);
}
