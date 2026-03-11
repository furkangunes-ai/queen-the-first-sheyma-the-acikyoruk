import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { logApiError } from "@/lib/logger";
import { logAdminAction } from "@/lib/audit-log";

/**
 * POST — Admin bir kullanıcının şifresini sıfırlar
 * Body: { userId, newPassword }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Admin yetkisi gerekli" }, { status: 403 });
    }
    const adminId = (session.user as any).id;

    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "userId ve newPassword gerekli" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "Şifre 6-128 karakter olmalı" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await logAdminAction(adminId, "reset_password", "User", userId, {
      targetUsername: user.username,
    });

    return NextResponse.json({
      success: true,
      message: `${user.username} kullanıcısının şifresi sıfırlandı`,
    });
  } catch (error) {
    logApiError("admin/reset-password", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
