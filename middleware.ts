import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

export default auth((req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isLoggedIn = !!req.auth;

  // API rate limiting (IP bazlı, 60 istek/dakika)
  if (isApiRoute) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (isRateLimited(ip)) {
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
