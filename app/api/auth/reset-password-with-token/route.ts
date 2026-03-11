import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Geçersiz token." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "Şifre 6-128 karakter arasında olmalıdır." },
        { status: 400 }
      );
    }

    // Token'ı bul
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true } } },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş bağlantı." },
        { status: 400 }
      );
    }

    // Süresi dolmuş mu?
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Bu bağlantının süresi dolmuş. Lütfen yeni bir tane talep edin." },
        { status: 400 }
      );
    }

    // Zaten kullanılmış mı?
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "Bu bağlantı daha önce kullanılmış." },
        { status: 400 }
      );
    }

    // Şifreyi güncelle + token'ı kullanılmış olarak işaretle
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.",
    });
  } catch (error) {
    logApiError("auth/reset-password-with-token", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
