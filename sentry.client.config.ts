import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring: %10 sample
  tracesSampleRate: 0.1,

  // Session replay: sadece hatalı oturumlarda
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  environment: process.env.NODE_ENV,

  // DSN yoksa devre dışı bırak
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
