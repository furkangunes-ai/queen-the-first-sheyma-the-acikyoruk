import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
});

async function main() {
  const examTypes = await prisma.examType.findMany({
    include: {
      subjects: {
        include: {
          topics: {
            orderBy: { sortOrder: "asc" },
            include: {
              _count: { select: { kazanimlar: true } },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  for (const et of examTypes) {
    console.log(`\n=== ${et.name} ===`);
    for (const sub of et.subjects) {
      console.log(`\n  📘 ${sub.name} (${sub.topics.length} konu)`);
      for (const t of sub.topics) {
        const kCount = t._count.kazanimlar;
        const marker = kCount === 0 ? "❌" : "✅";
        console.log(`    ${marker} [${t.sortOrder}] "${t.name}" → ${kCount} kazanım (grade: ${t.gradeLevel || "?"}, area: ${t.learningArea || "-"})`);
      }
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
