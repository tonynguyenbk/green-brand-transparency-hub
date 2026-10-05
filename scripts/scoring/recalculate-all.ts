/**
 * Recalculate scores for every brand (each run inserts new snapshots).
 *   npm run score:recalculate
 */
import "dotenv/config";
import { prisma } from "../../lib/db/prisma";
import { recalculateBrandScore } from "../../lib/services/scoring-service";

async function main() {
  const brands = await prisma.brand.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: { name: "asc" },
  });
  for (const b of brands) {
    const r = await recalculateBrandScore(b.id);
    console.log(
      r.ok
        ? `${b.name}: ${r.snapshot.overallScore.toFixed(1)} (${r.snapshot.confidenceLevel}, v${r.snapshot.methodologyVersion})`
        : `${b.name}: not scored — ${r.reason}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
