import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface SeedNode {
  name: string;
  slug: string;
  domain: string;
  examType?: string;
  complexityScore?: number;
  parentTopicId?: string;
  sortOrder?: number;
}

interface SeedEdge {
  parentSlug: string;
  childSlug: string;
  dependencyWeight?: number;
}

interface SeedPayload {
  nodes: SeedNode[];
  edges: SeedEdge[];
}

// POST /api/cognitive/seed — Toplu kavram ve bağlantı import (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if ((session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Sadece admin" }, { status: 403 });
  }

  const body: SeedPayload = await req.json();
  const { nodes, edges } = body;

  if (!nodes || !Array.isArray(nodes)) {
    return NextResponse.json(
      { error: "nodes dizisi zorunludur" },
      { status: 400 }
    );
  }
  if (nodes.length > 500) {
    return NextResponse.json(
      { error: "En fazla 500 node gönderilebilir" },
      { status: 400 }
    );
  }
  if (edges && Array.isArray(edges) && edges.length > 2000) {
    return NextResponse.json(
      { error: "En fazla 2000 edge gönderilebilir" },
      { status: 400 }
    );
  }

  const result = {
    nodesCreated: 0,
    nodesSkipped: 0,
    edgesCreated: 0,
    edgesSkipped: 0,
    errors: [] as string[],
  };

  // 1) Node'ları oluştur (upsert — slug'a göre)
  for (const node of nodes) {
    if (!node.name || !node.slug || !node.domain) {
      result.errors.push(`Eksik alan: ${JSON.stringify(node)}`);
      result.nodesSkipped++;
      continue;
    }

    try {
      await prisma.conceptNode.upsert({
        where: { slug: node.slug },
        update: {
          name: node.name,
          domain: node.domain,
          examType: node.examType || "both",
          complexityScore: node.complexityScore ?? 5,
          parentTopicId: node.parentTopicId || null,
          sortOrder: node.sortOrder ?? 0,
        },
        create: {
          name: node.name,
          slug: node.slug,
          domain: node.domain,
          examType: node.examType || "both",
          complexityScore: node.complexityScore ?? 5,
          parentTopicId: node.parentTopicId || null,
          sortOrder: node.sortOrder ?? 0,
        },
      });
      result.nodesCreated++;
    } catch (err: any) {
      result.errors.push(`Node hatası (${node.slug}): ${err.message}`);
      result.nodesSkipped++;
    }
  }

  // 2) Edge'leri oluştur (slug'dan ID'ye çevir)
  if (edges && Array.isArray(edges)) {
    // Slug → ID haritası oluştur
    const allNodes = await prisma.conceptNode.findMany({
      select: { id: true, slug: true },
    });
    const slugToId = new Map<string, string>();
    for (const n of allNodes) {
      slugToId.set(n.slug, n.id);
    }

    for (const edge of edges) {
      const parentId = slugToId.get(edge.parentSlug);
      const childId = slugToId.get(edge.childSlug);

      if (!parentId) {
        result.errors.push(`Parent bulunamadı: ${edge.parentSlug}`);
        result.edgesSkipped++;
        continue;
      }
      if (!childId) {
        result.errors.push(`Child bulunamadı: ${edge.childSlug}`);
        result.edgesSkipped++;
        continue;
      }

      try {
        await prisma.dependencyEdge.upsert({
          where: {
            parentNodeId_childNodeId: { parentNodeId: parentId, childNodeId: childId },
          },
          update: {
            dependencyWeight: edge.dependencyWeight ?? 0.7,
          },
          create: {
            parentNodeId: parentId,
            childNodeId: childId,
            dependencyWeight: edge.dependencyWeight ?? 0.7,
          },
        });
        result.edgesCreated++;
      } catch (err: any) {
        result.errors.push(`Edge hatası (${edge.parentSlug} → ${edge.childSlug}): ${err.message}`);
        result.edgesSkipped++;
      }
    }
  }

  return NextResponse.json(result, { status: 201 });
}
