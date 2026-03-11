/**
 * k6 Load Test — Seyda App (10K kullanıcı simülasyonu)
 *
 * Kurulum: brew install k6  (veya https://k6.io/docs/get-started/installation/)
 *
 * Kullanım:
 *   k6 run scripts/load-test.js                           # Varsayılan (staging)
 *   k6 run -e BASE_URL=http://localhost:3000 scripts/load-test.js  # Lokal
 *   k6 run -e BASE_URL=https://seyda.app scripts/load-test.js     # Prod
 *
 * Senaryolar:
 *   1. smoke    — 5 VU, 30s  (Sağlık kontrolü)
 *   2. average  — 50 VU, 2m  (Ortalama yük)
 *   3. stress   — 200 VU, 3m (Yoğun saat)
 *   4. spike    — 500 VU, 1m (Ani trafik patlaması)
 *   5. soak     — 100 VU, 10m (Uzun süre kararlılık)
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------

const errorRate = new Rate("errors");
const apiDuration = new Trend("api_duration", true);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Test auth token — load test öncesi oluşturulmalı
// Gerçek session cookie veya JWT token kullanılabilir
const AUTH_COOKIE = __ENV.AUTH_COOKIE || "";

export const options = {
  scenarios: {
    // 1. Smoke Test: Sistem ayakta mı?
    smoke: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      exec: "smokeTest",
      tags: { scenario: "smoke" },
    },
    // 2. Average Load: Normal kullanım
    average: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 0 },
      ],
      startTime: "35s",
      exec: "averageLoad",
      tags: { scenario: "average" },
    },
    // 3. Stress Test: Yoğun saatler
    stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 100 },
        { duration: "1m", target: 200 },
        { duration: "1m", target: 200 },
        { duration: "30s", target: 0 },
      ],
      startTime: "3m",
      exec: "stressTest",
      tags: { scenario: "stress" },
    },
    // 4. Spike Test: Ani trafik
    spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 500 },
        { duration: "30s", target: 500 },
        { duration: "20s", target: 0 },
      ],
      startTime: "6m",
      exec: "spikeTest",
      tags: { scenario: "spike" },
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"], // %95 istek <2s
    http_req_failed: ["rate<0.05"],    // Hata oranı <%5
    errors: ["rate<0.1"],              // Custom hata oranı <%10
  },
};

// ---------------------------------------------------------------------------
// Headers
// ---------------------------------------------------------------------------

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (AUTH_COOKIE) {
    headers["Cookie"] = AUTH_COOKIE;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

function apiGet(path, name) {
  const res = http.get(`${BASE_URL}${path}`, {
    headers: getHeaders(),
    tags: { name: name || path },
  });
  apiDuration.add(res.timings.duration);
  errorRate.add(res.status >= 400);
  return res;
}

function apiPost(path, body, name) {
  const res = http.post(`${BASE_URL}${path}`, JSON.stringify(body), {
    headers: getHeaders(),
    tags: { name: name || path },
  });
  apiDuration.add(res.timings.duration);
  errorRate.add(res.status >= 400);
  return res;
}

// ---------------------------------------------------------------------------
// Test Scenarios
// ---------------------------------------------------------------------------

// Smoke: Temel endpoint'ler ayakta mı?
export function smokeTest() {
  group("Smoke - Health Check", () => {
    const res = apiGet("/api/exam-types", "GET /api/exam-types");
    check(res, {
      "exam-types status 200 or 401": (r) => r.status === 200 || r.status === 401,
    });
  });
  sleep(1);
}

// Average: Normal kullanıcı akışı simülasyonu
export function averageLoad() {
  group("Average - Dashboard Flow", () => {
    // 1. Exam types yükle (sayfa açılışı)
    const examTypes = apiGet("/api/exam-types", "GET /api/exam-types");
    check(examTypes, {
      "exam-types loaded": (r) => r.status === 200 || r.status === 401,
    });

    sleep(0.5);

    // 2. Sınavlar listesi
    const exams = apiGet("/api/exams?take=10", "GET /api/exams");
    check(exams, {
      "exams loaded": (r) => r.status === 200 || r.status === 401,
    });

    sleep(0.5);

    // 3. Günlük çalışmalar
    const daily = apiGet("/api/daily-study?take=10", "GET /api/daily-study");
    check(daily, {
      "daily study loaded": (r) => r.status === 200 || r.status === 401,
    });

    sleep(0.5);

    // 4. Gamification
    const gamification = apiGet("/api/gamification", "GET /api/gamification");
    check(gamification, {
      "gamification loaded": (r) => r.status === 200 || r.status === 401,
    });

    sleep(0.5);

    // 5. Bildirimler
    const notifications = apiGet("/api/notifications", "GET /api/notifications");
    check(notifications, {
      "notifications loaded": (r) => r.status === 200 || r.status === 401,
    });
  });

  sleep(Math.random() * 3 + 1); // 1-4 saniye rastgele bekleme
}

// Stress: Yoğun kullanım — daha fazla endpoint
export function stressTest() {
  group("Stress - Heavy Usage", () => {
    // Dashboard verisi
    apiGet("/api/exam-types", "GET /api/exam-types");
    apiGet("/api/exams?take=20", "GET /api/exams");
    apiGet("/api/daily-study?take=20", "GET /api/daily-study");
    apiGet("/api/gamification", "GET /api/gamification");
    apiGet("/api/notifications", "GET /api/notifications");

    sleep(0.3);

    // Analitik sayfası (ağır sorgular)
    apiGet("/api/analytics/trends?limit=50", "GET /api/analytics/trends");
    apiGet("/api/analytics/topics", "GET /api/analytics/topics");

    sleep(0.3);

    // Strateji sayfası
    apiGet("/api/strategy/recommendations?limit=20", "GET /api/strategy/recommendations");
    apiGet("/api/topic-knowledge", "GET /api/topic-knowledge");

    sleep(0.3);

    // Cognitive engine
    apiGet("/api/cognitive/nodes?limit=50", "GET /api/cognitive/nodes");
  });

  sleep(Math.random() * 2 + 0.5);
}

// Spike: Ani yük artışı
export function spikeTest() {
  group("Spike - Burst Traffic", () => {
    // En çok kullanılan endpoint'ler
    apiGet("/api/exam-types", "GET /api/exam-types");
    apiGet("/api/exams?take=10", "GET /api/exams");
    apiGet("/api/gamification", "GET /api/gamification");
  });

  sleep(0.5);
}
