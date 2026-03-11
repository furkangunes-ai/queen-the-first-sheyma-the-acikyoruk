import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: { role: "user" },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            tier: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(users);
  } catch (error) {
    logApiError("admin/users-with-subscriptions", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
