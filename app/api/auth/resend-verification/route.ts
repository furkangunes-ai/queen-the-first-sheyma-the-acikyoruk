import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/logger";
import { sendEmailVerificationEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true, displayName: true },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "E-posta adresi bulunamadı." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "E-posta zaten doğrulanmış." },
        { status: 400 }
      );
    }

    // Spam koruması: son 5 dakika içinde token var mı?
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    if (recentToken) {
      return NextResponse.json(
        { error: "Kısa süre önce bir doğrulama bağlantısı gönderildi. Lütfen 5 dakika bekleyin." },
        { status: 429 }
      );
    }

    // Yeni token oluştur
    const token = crypto.randomBytes(48).toString("hex");
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
      },
    });

    // E-posta gönder (fire-and-forget)
    sendEmailVerificationEmail(user.email, token, user.displayName);

    return NextResponse.json({
      success: true,
      message: "Doğrulama bağlantısı gönderildi.",
    });
  } catch (error) {
    logApiError("auth/resend-verification", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
