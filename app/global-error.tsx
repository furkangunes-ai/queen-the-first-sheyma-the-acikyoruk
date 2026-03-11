"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#0f0f23", color: "#fff", fontFamily: "system-ui" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              textAlign: "center",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "48px 32px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
              Bir Hata Oluştu
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              Beklenmeyen bir hata meydana geldi. Sorun devam ederse lütfen bizimle
              iletişime geçin.
            </p>
            <button
              onClick={reset}
              style={{
                background: "linear-gradient(135deg, #ec4899, #db2777)",
                color: "#fff",
                border: "none",
                padding: "12px 32px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
