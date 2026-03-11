import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { logApiError } from "@/lib/logger";

/**
 * POST — Kullanıcı kendi şifresini değiştirir
 * Body: { currentPassword, newPassword }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Mevcut şifre ve yeni şifre gerekli" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "Yeni şifre 6-128 karakter olmalı" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Mevcut şifre yanlış" }, { status: 403 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    logApiError("auth/change-password", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
