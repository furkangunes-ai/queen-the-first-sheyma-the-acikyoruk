import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { username: "seyda" },
    data: { aiEnabled: true },
  });
  console.log(`AI enabled for ${result.count} user(s)`);
}

main()
  .catch((e) => {
    console.error("enable-ai error:", e);
    // Don't crash the build
  })
  .finally(() => prisma.$disconnect());
