import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const topics = await p.topic.findMany({
    include: {
      subject: {
        select: { name: true, examType: { select: { name: true } } },
      },
      _count: { select: { kazanimlar: true } },
    },
    orderBy: [
      { subject: { examType: { name: "asc" } } },
      { subject: { name: "asc" } },
      { sortOrder: "asc" },
    ],
  });

  const grouped: Record<string, Array<{ id: string; name: string; kazanims: number; sortOrder: number }>> = {};
  for (const t of topics) {
    const key = t.subject.examType.name + " > " + t.subject.name;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      id: t.id,
      name: t.name,
      kazanims: t._count.kazanimlar,
      sortOrder: t.sortOrder,
    });
  }

  for (const [key, list] of Object.entries(grouped)) {
    console.log("\n" + key + ":");
    for (const t of list) {
      const marker = t.kazanims > 0 ? "✅" : "  ";
      const kazInfo = t.kazanims > 0 ? ` (${t.kazanims} kazanım)` : "";
      console.log(`  ${marker} [${t.sortOrder}] ${t.name}${kazInfo}`);
    }
  }

  await p.$disconnect();
}

main().catch(console.error);
