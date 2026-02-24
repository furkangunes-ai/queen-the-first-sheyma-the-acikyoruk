import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isLoggedIn = !!req.auth;

  // API route'ları: session yoksa bile geçir, API kendi auth() ile 401 döner
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
