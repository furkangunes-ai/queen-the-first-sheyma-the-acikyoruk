import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { logApiError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body; // username veya email

    if (!identifier || typeof identifier !== "string" || identifier.trim().length < 2) {
      return NextResponse.json(
        { error: "Kullanıcı adı veya e-posta gereklidir." },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim().toLowerCase();

    // Kullanıcıyı bul (username veya email ile)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmed },
          { email: trimmed },
        ],
      },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    });

    // Güvenlik: kullanıcı bulunsun veya bulunmasın aynı yanıtı ver
    // (Kullanıcı varlığını sızdırmamak için)
    const successMessage =
      "Eğer bu bilgilerle bir hesap varsa, şifre sıfırlama bağlantısı e-posta adresine gönderildi.";

    if (!user || !user.email) {
      // Kullanıcı yok veya e-postası yok — yine de başarılı dön
      return NextResponse.json({ success: true, message: successMessage });
    }

    // Son 5 dakikada zaten token oluşturulmuş mu kontrol et (spam önleme)
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    if (recentToken) {
      // Çok sık istek — yine de başarılı dön
      return NextResponse.json({ success: true, message: successMessage });
    }

    // Token oluştur (48 byte hex = 96 karakter)
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // E-posta gönder (fire-and-forget)
    sendPasswordResetEmail(user.email, token, user.displayName);

    return NextResponse.json({ success: true, message: successMessage });
  } catch (error) {
    logApiError("auth/forgot-password", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
