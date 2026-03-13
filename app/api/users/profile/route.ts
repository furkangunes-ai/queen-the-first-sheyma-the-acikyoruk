import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const [user, subscription, todayChatCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          displayName: true,
          email: true,
          examTrack: true,
          role: true,
          createdAt: true,
          aiEnabled: true,
          emailVerified: true,
        },
      }),
      prisma.userSubscription.findUnique({
        where: { userId },
        select: {
          tier: true,
          startDate: true,
          endDate: true,
        },
      }),
      prisma.aIChatMessage.count({
        where: {
          userId,
          role: "user",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const tier = subscription?.tier || "basic";
    const chatLimit = tier === "premium" ? null : 5;

    return NextResponse.json({
      ...user,
      subscription: subscription || { tier: "basic", startDate: user.createdAt, endDate: null },
      chat: {
        todayCount: todayChatCount,
        limit: chatLimit,
        remaining: chatLimit ? Math.max(0, chatLimit - todayChatCount) : null,
      },
    });
  } catch (error) {
    logApiError("users/profile GET", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { displayName, examTrack } = body;

    const updateData: Record<string, unknown> = {};

    if (displayName !== undefined) {
      const trimmed = (displayName as string).trim();
      if (trimmed.length < 2 || trimmed.length > 50) {
        return NextResponse.json(
          { error: "Görünen ad 2-50 karakter arasında olmalıdır." },
          { status: 400 }
        );
      }
      updateData.displayName = trimmed;
    }

    if (examTrack !== undefined) {
      const validTracks = ["sayisal", "ea", "sozel", null];
      if (!validTracks.includes(examTrack)) {
        return NextResponse.json(
          { error: "Geçersiz sınav türü." },
          { status: 400 }
        );
      }
      updateData.examTrack = examTrack;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek alan belirtilmedi." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        examTrack: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logApiError("users/profile PATCH", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
