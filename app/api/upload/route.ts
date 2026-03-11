import { auth } from "@/lib/auth";
import { getUploadUrl, getPublicUrl } from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Yetkilendirme hatası" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Dosya adı ve içerik türü gerekli" },
        { status: 400 }
      );
    }

    // İzin verilen dosya türleri
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Desteklenmeyen dosya türü. JPEG, PNG, WebP, GIF veya PDF olmalı." },
        { status: 400 }
      );
    }

    // Dosya adı güvenliği
    if (filename.length > 255) {
      return NextResponse.json(
        { error: "Dosya adı çok uzun" },
        { status: 400 }
      );
    }

    // Extract extension from filename
    const extension = filename.split(".").pop() || "bin";
    const randomString = crypto.randomBytes(8).toString("hex");
    const r2Key = `uploads/${userId}/${Date.now()}-${randomString}.${extension}`;

    const uploadUrl = await getUploadUrl(r2Key, contentType);
    const publicUrl = getPublicUrl(r2Key);

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      r2Key,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
