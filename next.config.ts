import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry build sırasında source maps yükler (SENTRY_AUTH_TOKEN gerekli)
  // Token yoksa sessizce atlar
  silent: true,

  // Org ve project env'den okunur
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Source maps'i Sentry'ye yükle (production build)
  widenClientFileUpload: true,

  // Tunnel route: ad-blocker bypass
  tunnelRoute: "/monitoring",

  // Tree shaking: development'ta Sentry kodunu kaldır
  disableLogger: true,

  // Auth token yoksa build'i kırma
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
