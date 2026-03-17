import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit-log";
import { logApiError } from "@/lib/logger";

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
// Subject name mapping: ÖSYM names → DB names
// ---------------------------------------------------------------------------

const SUBJECT_MAP: Record<string, Record<string, string>> = {
  TYT: {
    "Matematik": "Matematik",
    "Fizik": "Fen Bilimleri",
    "Kimya": "Fen Bilimleri",
    "Biyoloji": "Fen Bilimleri",
    "Türk Dili ve Edebiyatı": "Türkçe",
    "Tarih": "Sosyal Bilimler",
    "Coğrafya": "Sosyal Bilimler",
    "Felsefe": "Sosyal Bilimler",
    "Din Kültürü ve Ahlak Bilgisi": "Sosyal Bilimler",
  },
  AYT: {
    "Matematik": "Matematik",
    "Fizik": "Fizik",
    "Kimya": "Kimya",
    "Biyoloji": "Biyoloji",
    "Türk Dili ve Edebiyatı": "Edebiyat",
    "Edebiyat": "Edebiyat",
    "Tarih": "Tarih",
    "T.C. İnkılap Tarihi ve Atatürkçülük": "Tarih",
    "Coğrafya": "Coğrafya",
    "Felsefe": "Felsefe",
    "Mantık": "Felsefe",
    "Sosyoloji": "Felsefe",
    "Psikoloji": "Felsefe",
    "Din Kültürü ve Ahlak Bilgisi": "Felsefe",
  },
};

// ---------------------------------------------------------------------------
// Normalized string comparison (handles Turkish chars, encoding quirks)
// ---------------------------------------------------------------------------

function norm(s: string): string {
  return s
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/д/g, "d")
    .replace(/Â/g, "a").replace(/â/g, "a")
    .replace(/î/g, "i").replace(/û/g, "u")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    const mode = searchParams.get("mode"); // "export" for full export

    // Export mode — full JSON export of all kazanımlar grouped by exam/subject/topic
    if (mode === "export") {
      const examTypes = await prisma.examType.findMany({
        include: {
          subjects: {
            include: {
              topics: {
                orderBy: { sortOrder: "asc" },
                include: {
                  kazanimlar: {
                    orderBy: { sortOrder: "asc" },
                    select: {
                      code: true,
                      subTopicName: true,
                      description: true,
                      details: true,
                      isKeyKazanim: true,
                    },
                  },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      const exportData = examTypes.flatMap((et) =>
        et.subjects.flatMap((sub) =>
          sub.topics
            .filter((t) => t.kazanimlar.length > 0)
            .map((t) => ({
              exam: et.name,
              subject: sub.name,
              topic: t.name,
              kazanimlar: t.kazanimlar.map((k) => ({
                code: k.code,
                description: k.description,
                subTopicName: k.subTopicName || undefined,
                details: k.details || undefined,
                isKey: k.isKeyKazanim || undefined,
              })),
            }))
        )
      );

      return NextResponse.json(exportData);
    }

    // Single topic detail mode
    if (topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        select: {
          id: true,
          name: true,
          difficulty: true,
          estimatedHours: true,
          gradeLevel: true,
          learningArea: true,
          sortOrder: true,
        },
      });

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
      return NextResponse.json({ topic, kazanimlar });
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
    logApiError("admin/kazanimlar", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
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
    if (body.length > 200) {
      return NextResponse.json(
        { error: "En fazla 200 kayıt gönderilebilir" },
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
      // Map ÖSYM subject name → DB subject name (with Unicode normalization)
      const examMap = SUBJECT_MAP[entry.exam];
      let dbSubject = entry.subject;
      if (examMap) {
        // Try exact match first, then normalized match
        dbSubject = examMap[entry.subject]
          ?? Object.entries(examMap).find(
            ([k]) => k.normalize("NFC") === entry.subject.normalize("NFC")
          )?.[1]
          ?? entry.subject;
      }

      // Find topic using normalized matching (handles CAPS, Turkish chars, encoding)
      const candidateTopics = await prisma.topic.findMany({
        where: {
          subject: {
            name: dbSubject,
            examType: { name: entry.exam },
          },
        },
        select: { id: true, name: true },
      });

      const entryNorm = norm(entry.topic);
      let topic = candidateTopics.find((t) => norm(t.name) === entryNorm);
      // Fallback 1: strip subject prefix from DB names (e.g. "Biyoloji - Hücre" → "Hücre")
      if (!topic) {
        topic = candidateTopics.find((t) => {
          const stripped = t.name.replace(/^[^-]+-\s*/, "");
          return norm(stripped) === entryNorm;
        });
      }
      if (!topic) {
        notFound.push(`${entry.exam} > ${dbSubject} > ${entry.topic}`);
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

    await logAdminAction((session!.user as any).id, "bulk_create_kazanim", "TopicKazanim", null, {
      created, skipped, notFound: notFound.length,
    });

    return NextResponse.json({
      success: true,
      created,
      skipped,
      notFound: notFound.length > 0 ? notFound : undefined,
      message: `${created} kazanım eklendi${skipped > 0 ? `, ${skipped} duplicate atlandı` : ""}${notFound.length > 0 ? `, ${notFound.length} topic bulunamadı` : ""}`,
    });
  } catch (error) {
    logApiError("admin/kazanimlar", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH — Kazanım veya Topic güncelleme
// Body: { type: "kazanim", id, data: { code?, description?, ... } }
//    or { type: "topic", id, data: { name?, difficulty?, ... } }
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json(
        { error: "type, id ve data alanları gerekli" },
        { status: 400 }
      );
    }

    if (type === "kazanim") {
      const allowed = ["code", "description", "subTopicName", "details", "isKeyKazanim", "sortOrder"];
      const updateData: Record<string, any> = {};
      for (const key of allowed) {
        if (data[key] !== undefined) updateData[key] = data[key];
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
      }

      const updated = await prisma.topicKazanim.update({
        where: { id },
        data: updateData,
      });

      await logAdminAction((session!.user as any).id, "update_kazanim", "TopicKazanim", id, updateData);
      return NextResponse.json({ success: true, updated });
    }

    if (type === "topic") {
      const allowed = ["name", "difficulty", "estimatedHours", "gradeLevel", "learningArea", "sortOrder"];
      const updateData: Record<string, any> = {};
      for (const key of allowed) {
        if (data[key] !== undefined) updateData[key] = data[key];
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
      }

      const updated = await prisma.topic.update({
        where: { id },
        data: updateData,
      });

      await logAdminAction((session!.user as any).id, "update_topic", "Topic", id, updateData);
      return NextResponse.json({ success: true, updated });
    }

    if (type === "subject") {
      const allowed = ["name", "questionCount", "sortOrder"];
      const updateData: Record<string, any> = {};
      for (const key of allowed) {
        if (data[key] !== undefined) updateData[key] = data[key];
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
      }

      const updated = await prisma.subject.update({
        where: { id },
        data: updateData,
      });

      await logAdminAction((session!.user as any).id, "update_subject", "Subject", id, updateData);
      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: "Geçersiz type. kazanim, topic veya subject olmalı" }, { status: 400 });
  } catch (error) {
    logApiError("admin/kazanimlar PATCH", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
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

    // Güvenlik: Silme işlemlerinde X-Confirm-Delete header'ı zorunlu
    const confirmHeader = request.headers.get("X-Confirm-Delete");
    if (confirmHeader !== "confirmed") {
      return NextResponse.json(
        { error: "Silme işlemi için X-Confirm-Delete: confirmed header'ı gerekli" },
        { status: 400 }
      );
    }

    if (kazanimId) {
      // Delete single kazanım
      await prisma.kazanimProgress.deleteMany({ where: { kazanimId } });
      await prisma.topicKazanim.delete({ where: { id: kazanimId } });
      await logAdminAction((session!.user as any).id, "delete_kazanim", "TopicKazanim", kazanimId);
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

    await logAdminAction((session!.user as any).id, "bulk_delete_kazanim", "TopicKazanim", topicId, {
      deletedCount: deleted.count,
    });

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
      message: `${deleted.count} kazanım silindi`,
    });
  } catch (error) {
    logApiError("admin/kazanimlar", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
