/**
 * Bilişsel Çizge (DAG) seed script'i.
 * prisma/seed-data/ altındaki tüm JSON dosyalarını okur ve DB'ye yazar.
 * Idempotent: mevcut node'ları günceller, yenilerini ekler.
 *
 * Çalıştırmak için: npx tsx prisma/seed-cognitive-graph.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

interface SeedNode {
  name: string;
  slug: string;
  domain: string;
  examType?: string;
  complexityScore?: number;
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

async function seedCognitiveGraph() {
  const currentDir = typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));
  const seedDir = path.join(currentDir, "seed-data");

  if (!fs.existsSync(seedDir)) {
    console.log("seed-data klasoru bulunamadi, atlaniyor");
    return;
  }

  // Sadece ders JSON'larini al (ornek dosyayi atla)
  const files = fs.readdirSync(seedDir).filter(
    (f) => f.endsWith(".json") && !f.includes("ornek")
  );

  if (files.length === 0) {
    console.log("Seed dosyasi bulunamadi, atlaniyor");
    return;
  }

  // Mevcut node sayisini kontrol et
  const existingCount = await prisma.conceptNode.count();
  if (existingCount >= 800) {
    console.log(
      `Bilissel cizge zaten yuklu (${existingCount} node), atlaniyor`
    );
    return;
  }

  console.log(`${files.length} ders dosyasi bulundu, import ediliyor...`);

  let totalNodes = 0;
  let totalEdges = 0;

  // Once tum node'lari olustur
  for (const file of files) {
    const filePath = path.join(seedDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    let data: SeedPayload;

    try {
      data = JSON.parse(raw);
    } catch {
      console.error(`  JSON parse hatasi: ${file}`);
      continue;
    }

    if (!data.nodes || !Array.isArray(data.nodes)) continue;

    let created = 0;
    for (const node of data.nodes) {
      if (!node.name || !node.slug || !node.domain) continue;

      try {
        await prisma.conceptNode.upsert({
          where: { slug: node.slug },
          update: {
            name: node.name,
            domain: node.domain,
            examType: node.examType || "both",
            complexityScore: node.complexityScore ?? 5,
          },
          create: {
            name: node.name,
            slug: node.slug,
            domain: node.domain,
            examType: node.examType || "both",
            complexityScore: node.complexityScore ?? 5,
          },
        });
        created++;
      } catch (err: any) {
        console.error(`  Node hatasi (${node.slug}): ${err.message}`);
      }
    }

    totalNodes += created;
    console.log(`  ${file}: ${created} node`);
  }

  // Sonra tum edge'leri olustur (slug -> ID haritasi ile)
  const allNodes = await prisma.conceptNode.findMany({
    select: { id: true, slug: true },
  });
  const slugToId = new Map<string, string>();
  for (const n of allNodes) {
    slugToId.set(n.slug, n.id);
  }

  for (const file of files) {
    const filePath = path.join(seedDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    let data: SeedPayload;

    try {
      data = JSON.parse(raw);
    } catch {
      continue;
    }

    if (!data.edges || !Array.isArray(data.edges)) continue;

    let created = 0;
    for (const edge of data.edges) {
      const parentId = slugToId.get(edge.parentSlug);
      const childId = slugToId.get(edge.childSlug);
      if (!parentId || !childId) continue;

      try {
        await prisma.dependencyEdge.upsert({
          where: {
            parentNodeId_childNodeId: {
              parentNodeId: parentId,
              childNodeId: childId,
            },
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
        created++;
      } catch (err: any) {
        // Sessizce atla (duplikat edge vs)
      }
    }

    totalEdges += created;
    console.log(`  ${file}: ${created} edge`);
  }

  console.log(
    `Bilissel cizge seed tamamlandi: ${totalNodes} node, ${totalEdges} edge`
  );
}

seedCognitiveGraph()
  .catch((e) => {
    console.error("Cognitive graph seed hatasi:", e);
  })
  .finally(() => prisma.$disconnect());
