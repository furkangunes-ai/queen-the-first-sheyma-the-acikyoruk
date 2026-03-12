import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit-log";
import { logApiError } from "@/lib/logger";

function adminGuard(session: any) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin")
    return { error: "Forbidden", status: 403 };
  return null;
}

// ---------------------------------------------------------------------------
// GET — Full curriculum tree with concept node linkage info
// Query: ?mode=links (show topic↔conceptNode links)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "links") {
      // Return topics with their linked concept nodes
      const examTypes = await prisma.examType.findMany({
        include: {
          subjects: {
            include: {
              topics: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  name: true,
                  conceptNodes: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      domain: true,
                      complexityScore: true,
                      _count: {
                        select: {
                          parentEdges: true,
                          childEdges: true,
                          cognitiveStates: true,
                        },
                      },
                    },
                  },
                  _count: {
                    select: { kazanimlar: true, conceptNodes: true },
                  },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      // Also get unlinked concept nodes (no parentTopicId)
      const unlinkedNodes = await prisma.conceptNode.findMany({
        where: { parentTopicId: null },
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          examType: true,
          complexityScore: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ examTypes, unlinkedNodes });
    }

    // Default: full curriculum tree for management
    const examTypes = await prisma.examType.findMany({
      include: {
        subjects: {
          include: {
            topics: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                name: true,
                difficulty: true,
                estimatedHours: true,
                gradeLevel: true,
                sortOrder: true,
                _count: {
                  select: { kazanimlar: true, conceptNodes: true },
                },
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
    logApiError("admin/curriculum GET", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Create subject or topic
// Body: { action: "create_subject", examTypeId, name, questionCount? }
//    or { action: "create_topic", subjectId, name, difficulty?, estimatedHours?, gradeLevel? }
//    or { action: "link_node", topicId, conceptNodeId }
//    or { action: "unlink_node", conceptNodeId }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const body = await request.json();
    const { action } = body;

    if (action === "create_subject") {
      const { examTypeId, name, questionCount } = body;
      if (!examTypeId || !name?.trim()) {
        return NextResponse.json({ error: "examTypeId ve name gerekli" }, { status: 400 });
      }

      // Check examType exists
      const examType = await prisma.examType.findUnique({ where: { id: examTypeId } });
      if (!examType) {
        return NextResponse.json({ error: "Sınav türü bulunamadı" }, { status: 404 });
      }

      // Get max sortOrder
      const maxSort = await prisma.subject.aggregate({
        where: { examTypeId },
        _max: { sortOrder: true },
      });

      const subject = await prisma.subject.create({
        data: {
          name: name.trim(),
          examTypeId,
          questionCount: questionCount || 40,
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });

      await logAdminAction((session!.user as any).id, "create_subject", "Subject", subject.id, { name: subject.name });
      return NextResponse.json({ success: true, subject });
    }

    if (action === "create_topic") {
      const { subjectId, name, difficulty, estimatedHours, gradeLevel } = body;
      if (!subjectId || !name?.trim()) {
        return NextResponse.json({ error: "subjectId ve name gerekli" }, { status: 400 });
      }

      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) {
        return NextResponse.json({ error: "Ders bulunamadı" }, { status: 404 });
      }

      const maxSort = await prisma.topic.aggregate({
        where: { subjectId },
        _max: { sortOrder: true },
      });

      const topic = await prisma.topic.create({
        data: {
          name: name.trim(),
          subjectId,
          difficulty: difficulty || 3,
          estimatedHours: estimatedHours || 2,
          gradeLevel: gradeLevel || null,
          sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        },
      });

      await logAdminAction((session!.user as any).id, "create_topic", "Topic", topic.id, { name: topic.name, subjectId });
      return NextResponse.json({ success: true, topic });
    }

    if (action === "link_node") {
      const { topicId, conceptNodeId } = body;
      if (!topicId || !conceptNodeId) {
        return NextResponse.json({ error: "topicId ve conceptNodeId gerekli" }, { status: 400 });
      }

      await prisma.conceptNode.update({
        where: { id: conceptNodeId },
        data: { parentTopicId: topicId },
      });

      await logAdminAction((session!.user as any).id, "link_concept_node", "ConceptNode", conceptNodeId, { topicId });
      return NextResponse.json({ success: true, message: "Kavram düğümü konuya bağlandı" });
    }

    if (action === "unlink_node") {
      const { conceptNodeId } = body;
      if (!conceptNodeId) {
        return NextResponse.json({ error: "conceptNodeId gerekli" }, { status: 400 });
      }

      await prisma.conceptNode.update({
        where: { id: conceptNodeId },
        data: { parentTopicId: null },
      });

      await logAdminAction((session!.user as any).id, "unlink_concept_node", "ConceptNode", conceptNodeId);
      return NextResponse.json({ success: true, message: "Kavram düğümü bağlantısı kaldırıldı" });
    }

    return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
  } catch (error) {
    logApiError("admin/curriculum POST", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — Remove subject or topic
// Body: { action: "delete_subject", subjectId }
//    or { action: "delete_topic", topicId }
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const guard = adminGuard(session);
    if (guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action || !id) {
      return NextResponse.json({ error: "action ve id gerekli" }, { status: 400 });
    }

    if (action === "delete_topic") {
      // Check for dependent data
      const topic = await prisma.topic.findUnique({
        where: { id },
        select: {
          name: true,
          _count: {
            select: {
              kazanimlar: true,
              conceptNodes: true,
              wrongQuestions: true,
              dailyStudies: true,
              topicKnowledge: true,
            },
          },
        },
      });

      if (!topic) {
        return NextResponse.json({ error: "Konu bulunamadı" }, { status: 404 });
      }

      // Cascade delete related data
      await prisma.$transaction([
        prisma.kazanimProgress.deleteMany({
          where: { kazanim: { topicId: id } },
        }),
        prisma.topicKazanim.deleteMany({ where: { topicId: id } }),
        prisma.topicConcept.deleteMany({ where: { topicId: id } }),
        prisma.topicPrerequisite.deleteMany({
          where: { OR: [{ topicId: id }, { prerequisiteId: id }] },
        }),
        prisma.conceptNode.updateMany({
          where: { parentTopicId: id },
          data: { parentTopicId: null },
        }),
        prisma.topicKnowledge.deleteMany({ where: { topicId: id } }),
        prisma.topic.delete({ where: { id } }),
      ]);

      await logAdminAction((session!.user as any).id, "delete_topic", "Topic", id, { name: topic.name });
      return NextResponse.json({ success: true, message: `"${topic.name}" konusu silindi` });
    }

    if (action === "delete_subject") {
      const subject = await prisma.subject.findUnique({
        where: { id },
        select: {
          name: true,
          _count: { select: { topics: true } },
        },
      });

      if (!subject) {
        return NextResponse.json({ error: "Ders bulunamadı" }, { status: 404 });
      }

      if (subject._count.topics > 0) {
        return NextResponse.json(
          { error: `"${subject.name}" dersinde ${subject._count.topics} konu var. Önce konuları silin.` },
          { status: 400 }
        );
      }

      await prisma.subject.delete({ where: { id } });
      await logAdminAction((session!.user as any).id, "delete_subject", "Subject", id, { name: subject.name });
      return NextResponse.json({ success: true, message: `"${subject.name}" dersi silindi` });
    }

    return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
  } catch (error) {
    logApiError("admin/curriculum DELETE", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
