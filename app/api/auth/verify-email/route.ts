import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, emailVerified: true },
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Geçersiz doğrulama bağlantısı." },
        { status: 400 }
      );
    }

    if (verificationToken.usedAt) {
      return NextResponse.json(
        { error: "Bu bağlantı daha önce kullanılmış." },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Bu bağlantının süresi dolmuş. Lütfen yeni bir doğrulama bağlantısı isteyin." },
        { status: 400 }
      );
    }

    if (verificationToken.user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "E-posta zaten doğrulanmış.",
      });
    }

    // Transaction: emailVerified = true + token kullanıldı
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Hoşgeldin maili gönder (fire-and-forget)
    if (verificationToken.user.email) {
      sendWelcomeEmail(verificationToken.user.email, verificationToken.user.displayName);
    }

    return NextResponse.json({
      success: true,
      message: "E-posta başarıyla doğrulandı!",
    });
  } catch (error) {
    logApiError("auth/verify-email", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
