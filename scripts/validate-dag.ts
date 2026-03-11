#!/usr/bin/env tsx
// ==================== DAG Doğrulama Script'i ====================
//
// Kullanım: npx tsx scripts/validate-dag.ts <json-dosyası>
//
// Kontroller:
// 1. Döngü (cycle) kontrolü — DAG'da döngü olmamalı
// 2. Orphan node kontrolü — Bağlantısız kavramlar
// 3. Duplicate slug kontrolü — Benzersiz slug'lar
// 4. Geçersiz edge kontrolü — Var olmayan node referansları
// 5. İstatistik özeti

import * as fs from "fs";

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

function validateDAG(filePath: string) {
  console.log(`\n=== DAG Doğrulama: ${filePath} ===\n`);

  // 1. Dosyayı oku
  if (!fs.existsSync(filePath)) {
    console.error(`HATA: Dosya bulunamadı: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let data: SeedPayload;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("HATA: Geçersiz JSON formatı");
    process.exit(1);
  }

  const nodes = data.nodes || [];
  const edges = data.edges || [];

  console.log(`Toplam node: ${nodes.length}`);
  console.log(`Toplam edge: ${edges.length}`);

  let errors = 0;
  let warnings = 0;

  // 2. Duplicate slug kontrolü
  const slugSet = new Set<string>();
  const duplicates: string[] = [];
  for (const node of nodes) {
    if (slugSet.has(node.slug)) {
      duplicates.push(node.slug);
    }
    slugSet.add(node.slug);
  }
  if (duplicates.length > 0) {
    console.error(`\nHATA: ${duplicates.length} tekrarlanan slug:`);
    duplicates.forEach((s) => console.error(`  - ${s}`));
    errors += duplicates.length;
  }

  // 3. Geçersiz edge kontrolü
  const invalidEdges: string[] = [];
  for (const edge of edges) {
    if (!slugSet.has(edge.parentSlug)) {
      invalidEdges.push(`Parent bulunamadı: ${edge.parentSlug}`);
    }
    if (!slugSet.has(edge.childSlug)) {
      invalidEdges.push(`Child bulunamadı: ${edge.childSlug}`);
    }
  }
  if (invalidEdges.length > 0) {
    console.error(`\nHATA: ${invalidEdges.length} geçersiz edge referansı:`);
    invalidEdges.forEach((e) => console.error(`  - ${e}`));
    errors += invalidEdges.length;
  }

  // 4. Döngü (cycle) kontrolü — DFS
  const adjList = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjList.has(edge.parentSlug)) adjList.set(edge.parentSlug, []);
    adjList.get(edge.parentSlug)!.push(edge.childSlug);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const node of nodes) color.set(node.slug, WHITE);

  const cycles: string[][] = [];

  function dfs(node: string, path: string[]): void {
    color.set(node, GRAY);
    const neighbors = adjList.get(node) || [];
    for (const next of neighbors) {
      if (color.get(next) === GRAY) {
        // Döngü bulundu
        const cycleStart = path.indexOf(next);
        cycles.push([...path.slice(cycleStart), next]);
      } else if (color.get(next) === WHITE) {
        dfs(next, [...path, next]);
      }
    }
    color.set(node, BLACK);
  }

  for (const node of nodes) {
    if (color.get(node.slug) === WHITE) {
      dfs(node.slug, [node.slug]);
    }
  }

  if (cycles.length > 0) {
    console.error(`\nHATA: ${cycles.length} döngü bulundu:`);
    cycles.forEach((c, i) => console.error(`  Döngü ${i + 1}: ${c.join(" → ")}`));
    errors += cycles.length;
  }

  // 5. Orphan node kontrolü
  const connectedNodes = new Set<string>();
  for (const edge of edges) {
    connectedNodes.add(edge.parentSlug);
    connectedNodes.add(edge.childSlug);
  }
  const orphans = nodes.filter((n) => !connectedNodes.has(n.slug));
  if (orphans.length > 0) {
    console.warn(`\nUYARI: ${orphans.length} bağlantısız (orphan) node:`);
    orphans.slice(0, 10).forEach((n) => console.warn(`  - ${n.name} (${n.slug})`));
    if (orphans.length > 10) console.warn(`  ... ve ${orphans.length - 10} daha`);
    warnings += orphans.length;
  }

  // 6. Domain dağılımı
  const domainCounts: Record<string, number> = {};
  for (const node of nodes) {
    domainCounts[node.domain] = (domainCounts[node.domain] || 0) + 1;
  }
  console.log("\nDomain dağılımı:");
  Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} kavram`);
    });

  // 7. Karmaşıklık dağılımı
  const complexityCounts: Record<number, number> = {};
  for (const node of nodes) {
    const c = node.complexityScore ?? 5;
    complexityCounts[c] = (complexityCounts[c] || 0) + 1;
  }
  console.log("\nKarmaşıklık dağılımı:");
  Object.entries(complexityCounts)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([score, count]) => {
      console.log(`  K=${score}: ${count} kavram`);
    });

  // Sonuç
  console.log("\n" + "=".repeat(50));
  if (errors === 0) {
    console.log(`SONUÇ: ${nodes.length} node, ${edges.length} edge — GEÇERLI DAG`);
    if (warnings > 0) console.log(`  (${warnings} uyarı)`);
  } else {
    console.error(`SONUÇ: ${errors} HATA, ${warnings} uyarı — GEÇERSIZ`);
    process.exit(1);
  }
}

// CLI
const filePath = process.argv[2];
if (!filePath) {
  console.log("Kullanım: npx tsx scripts/validate-dag.ts <json-dosyası>");
  console.log("Örnek: npx tsx scripts/validate-dag.ts prisma/seed-data/matematik.json");
  process.exit(0);
}

validateDAG(filePath);
