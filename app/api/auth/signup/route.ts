import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/logger";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, displayName, password, email } = body;

    // — Validasyon —
    if (!username || !displayName || !password) {
      return NextResponse.json(
        { error: "Kullanıcı adı, görünen ad ve şifre zorunludur." },
        { status: 400 }
      );
    }

    const trimmedUsername = (username as string).trim().toLowerCase();
    const trimmedDisplayName = (displayName as string).trim();
    const trimmedEmail = email ? (email as string).trim().toLowerCase() : null;

    if (!USERNAME_REGEX.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Kullanıcı adı 3-30 karakter olmalı ve sadece harf, rakam, alt çizgi içermelidir." },
        { status: 400 }
      );
    }

    if (trimmedDisplayName.length < 2 || trimmedDisplayName.length > 50) {
      return NextResponse.json(
        { error: "Görünen ad 2-50 karakter arasında olmalıdır." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Şifre 6-128 karakter arasında olmalıdır." },
        { status: 400 }
      );
    }

    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // — Benzersizlik kontrolü —
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedUsername },
          ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
        ],
      },
      select: { username: true, email: true },
    });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        return NextResponse.json(
          { error: "Bu kullanıcı adı zaten kullanılıyor." },
          { status: 409 }
        );
      }
      if (trimmedEmail && existingUser.email === trimmedEmail) {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten kullanılıyor." },
          { status: 409 }
        );
      }
    }

    // — Kullanıcı oluştur (transaction) —
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: trimmedUsername,
          email: trimmedEmail,
          displayName: trimmedDisplayName,
          passwordHash,
          role: "user",
          aiEnabled: false,
        },
      });

      await tx.userSubscription.create({
        data: {
          userId: newUser.id,
          tier: "basic",
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hesap başarıyla oluşturuldu. Giriş yapabilirsiniz.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    logApiError("auth/signup", error);
    return NextResponse.json(
      { error: "Hesap oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
