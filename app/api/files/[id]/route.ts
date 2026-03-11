import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";
import { logApiError } from "@/lib/logger";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const file = await prisma.userFile.findFirst({
      where: { id, userId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete from R2
    try {
      await deleteFile(file.r2Key);
    } catch {
      console.error("Failed to delete from R2, continuing with DB delete");
    }

    // Delete from DB
    await prisma.userFile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("files/:id", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
