import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

// Maksimum request body boyutu (5 MB)
const MAX_BODY_SIZE = 5 * 1024 * 1024;

// Security headers
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export default auth(async (req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isLoggedIn = !!req.auth;

  if (isApiRoute) {
    // Body size kontrolü (Content-Length header)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "İstek boyutu çok büyük. Maksimum 5 MB." },
        { status: 413 }
      );
    }

    // IP bazlı rate limiting (Redis veya in-memory) — auth dahil
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (await isRateLimited(isAuthRoute ? `auth:${ip}` : ip)) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen biraz bekleyin." },
        { status: 429 }
      );
    }
  }

  // UI sayfaları: session yoksa yönlendir
  if (!isLoggedIn && !isApiRoute) {
    // Ana sayfa -> welcome'a yönlendir
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/welcome", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Security headers ekle
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
});

export const config = {
  matcher: [
    // Auth endpoint'leri de dahil (rate limiting için)
    "/((?!login|signup|signup-success|verify-email|welcome|kvkk|terms|forgot-password|reset-password|_next/static|_next/image|favicon.ico).*)",
  ],
};
