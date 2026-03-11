import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

// Maksimum request body boyutu (5 MB)
const MAX_BODY_SIZE = 5 * 1024 * 1024;

export default auth(async (req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
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

    // IP bazlı rate limiting (Redis veya in-memory)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (await isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Çok fazla istek. Lütfen biraz bekleyin." },
        { status: 429 }
      );
    }
  }

  // UI sayfaları: session yoksa /login'e redirect
  if (!isLoggedIn && !isApiRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
