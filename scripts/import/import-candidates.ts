/**
 * Import candidate claims exported by the scraping pipeline.
 *
 *   npm run import:candidates -- scripts/import/examples/sample-candidates.json [--dry-run]
 *
 * Every imported source and claim is stored with status CANDIDATE and
 * therefore never affects public scores until an administrator reviews,
 * rates and verifies it. Duplicate claim texts for the same brand are skipped.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const candidateFileSchema = z.object({
  brandSlug: z.string().regex(/^[a-z0-9-]+$/),
  sourceUrl: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//.test(u), "http(s) only"),
  sourceTitle: z.string().min(1).max(300),
  extractedAt: z.string().datetime(),
  candidates: z
    .array(
      z.object({
        text: z.string().min(10).max(1000),
        keywords: z.array(z.string()).default([]),
        hasMetric: z.boolean().optional(),
        hasCertificationReference: z.boolean().optional(),
        status: z.literal("CANDIDATE"),
      }),
    )
    .max(500),
});

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");
  if (!file) {
    console.error("Usage: npm run import:candidates -- <file.json> [--dry-run]");
    process.exit(1);
  }

  const parsed = candidateFileSchema.safeParse(JSON.parse(await readFile(file, "utf8")));
  if (!parsed.success) {
    console.error("Invalid candidate file:", parsed.error.issues);
    process.exit(1);
  }
  const data = parsed.data;
  const prisma = new PrismaClient();
  try {
    const brand = await prisma.brand.findUnique({ where: { slug: data.brandSlug } });
    if (!brand) throw new Error(`Brand "${data.brandSlug}" not found. Create it in /admin first.`);

    const existing = new Set(
      (
        await prisma.claim.findMany({ where: { brandId: brand.id }, select: { claimText: true } })
      ).map((c) => c.claimText.trim().toLowerCase()),
    );
    const fresh = data.candidates.filter((c) => !existing.has(c.text.trim().toLowerCase()));
    console.log(`${data.candidates.length} candidates, ${fresh.length} new for ${brand.name}.`);
    if (dryRun || fresh.length === 0) return;

    const origin = `import:${basename(file)}`;
    await prisma.$transaction(async (tx) => {
      const source = await tx.source.create({
        data: {
          brandId: brand.id,
          title: data.sourceTitle,
          sourceType: "SUSTAINABILITY_WEBPAGE",
          url: data.sourceUrl,
          accessedAt: new Date(data.extractedAt),
          verificationLevel: "SELF_DECLARED",
          status: "CANDIDATE",
          notes: `Imported automatically (${origin}). Requires human review.`,
        },
      });
      for (const c of fresh) {
        await tx.claim.create({
          data: {
            brandId: brand.id,
            claimText: c.text,
            claimCategory: "GENERAL",
            status: "CANDIDATE",
            origin,
            reviewerNotes: `Auto-detected keywords: ${c.keywords.join(", ") || "none"}. Not reviewed.`,
            claimSources: {
              create: { sourceId: source.id, evidenceExcerpt: c.text, evidenceStrength: "LIMITED" },
            },
          },
        });
      }
    });
    console.log(
      `Imported ${fresh.length} CANDIDATE claims. Review them at /admin/claims?status=CANDIDATE.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
