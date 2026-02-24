import { auth } from "@/lib/auth";
import { getUploadUrl, getPublicUrl } from "@/lib/r2";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and content type are required" },
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
