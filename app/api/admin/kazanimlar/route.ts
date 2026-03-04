import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function adminGuard(session: any) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin")
    return { error: "Forbidden: Admin access required", status: 403 };
  return null;
}

// ---------------------------------------------------------------------------
// GET — Topic listesi kazanım sayılarıyla
// Query: ?exam=AYT&subject=Matematik (opsiyonel filtre)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const examFilter = searchParams.get("exam");
    const subjectFilter = searchParams.get("subject");
    const topicId = searchParams.get("topicId");

    // Single topic detail mode
    if (topicId) {
      const kazanimlar = await prisma.topicKazanim.findMany({
        where: { topicId },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          code: true,
          subTopicName: true,
          description: true,
          details: true,
          isKeyKazanim: true,
          sortOrder: true,
        },
      });
      return NextResponse.json(kazanimlar);
    }

    // Full tree mode with counts
    const examTypes = await prisma.examType.findMany({
      where: examFilter ? { name: examFilter } : undefined,
      include: {
        subjects: {
          where: subjectFilter ? { name: subjectFilter } : undefined,
          include: {
            topics: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                name: true,
                _count: { select: { kazanimlar: true } },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(examTypes);
  } catch (error) {
    console.error("Admin kazanım GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — JSON ile kazanım ekleme (append mode, dedup by topicId+code)
// Body: [{ exam, subject, topic, kazanimlar: [{ code, description, ... }] }]
// ---------------------------------------------------------------------------

interface KazanimInput {
  code: string;
  description: string;
  subTopicName?: string;
  details?: string;
  isKey?: boolean;
}

interface EntryInput {
  exam: string;
  subject: string;
  topic: string;
  kazanimlar: KazanimInput[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const body: EntryInput[] = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "JSON array bekleniyor. Örnek: [{ exam, subject, topic, kazanimlar: [...] }]" },
        { status: 400 }
      );
    }

    // Validate structure
    const errors: string[] = [];
    for (let i = 0; i < body.length; i++) {
      const e = body[i];
      if (!e.exam) errors.push(`[${i}]: "exam" eksik`);
      if (!e.subject) errors.push(`[${i}]: "subject" eksik`);
      if (!e.topic) errors.push(`[${i}]: "topic" eksik`);
      if (!Array.isArray(e.kazanimlar) || e.kazanimlar.length === 0)
        errors.push(`[${i}]: "kazanimlar" boş veya eksik`);
      else {
        for (let j = 0; j < e.kazanimlar.length; j++) {
          const k = e.kazanimlar[j];
          if (!k.code) errors.push(`[${i}].kazanimlar[${j}]: "code" eksik`);
          if (!k.description) errors.push(`[${i}].kazanimlar[${j}]: "description" eksik`);
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validasyon hataları", details: errors }, { status: 400 });
    }

    // Resolve topics
    let created = 0;
    let skipped = 0;
    const notFound: string[] = [];

    for (const entry of body) {
      // Find topic by exam + subject + topic name
      const topic = await prisma.topic.findFirst({
        where: {
          name: entry.topic,
          subject: {
            name: entry.subject,
            examType: { name: entry.exam },
          },
        },
        select: { id: true },
      });

      if (!topic) {
        notFound.push(`${entry.exam} > ${entry.subject} > ${entry.topic}`);
        continue;
      }

      // Get existing codes for dedup
      const existing = await prisma.topicKazanim.findMany({
        where: { topicId: topic.id },
        select: { code: true },
      });
      const existingCodes = new Set(existing.map((e) => e.code));

      // Get current max sortOrder
      const maxSort = await prisma.topicKazanim.aggregate({
        where: { topicId: topic.id },
        _max: { sortOrder: true },
      });
      let nextSort = (maxSort._max.sortOrder ?? 0) + 1;

      // Create new kazanımlar
      for (const k of entry.kazanimlar) {
        if (existingCodes.has(k.code)) {
          skipped++;
          continue;
        }

        await prisma.topicKazanim.create({
          data: {
            topicId: topic.id,
            code: k.code,
            description: k.description,
            subTopicName: k.subTopicName || null,
            details: k.details || null,
            isKeyKazanim: k.isKey ?? false,
            sortOrder: nextSort++,
          },
        });
        created++;
        existingCodes.add(k.code);
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      notFound: notFound.length > 0 ? notFound : undefined,
      message: `${created} kazanım eklendi${skipped > 0 ? `, ${skipped} duplicate atlandı` : ""}${notFound.length > 0 ? `, ${notFound.length} topic bulunamadı` : ""}`,
    });
  } catch (error) {
    console.error("Admin kazanım POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — Topic'in kazanımlarını sil
// Query: ?topicId=xxx
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");
    const kazanimId = searchParams.get("kazanimId");

    if (!topicId && !kazanimId) {
      return NextResponse.json(
        { error: "topicId veya kazanimId gerekli" },
        { status: 400 }
      );
    }

    if (kazanimId) {
      // Delete single kazanım
      await prisma.kazanimProgress.deleteMany({ where: { kazanimId } });
      await prisma.topicKazanim.delete({ where: { id: kazanimId } });
      return NextResponse.json({ success: true, message: "1 kazanım silindi" });
    }

    // Delete all kazanımlar for a topic
    const kazanimlar = await prisma.topicKazanim.findMany({
      where: { topicId: topicId! },
      select: { id: true },
    });
    const ids = kazanimlar.map((k) => k.id);

    if (ids.length > 0) {
      await prisma.kazanimProgress.deleteMany({
        where: { kazanimId: { in: ids } },
      });
    }
    const deleted = await prisma.topicKazanim.deleteMany({
      where: { topicId: topicId! },
    });

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: `${deleted.count} kazanım silindi`,
    });
  } catch (error) {
    console.error("Admin kazanım DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
