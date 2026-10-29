/**
 * Load the Greenlens ESG dataset (data/esg/companies.ts) into the database.
 *
 *   npm run seed:esg
 *
 * Non-destructive and idempotent: companies and sources are upserted, and a
 * new current EsgAssessment is created only when a company's pillar scores or
 * texts changed (the previous one is kept as history).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { COMPANIES, SECTORS } from "../data/esg/companies";
import { ESG_METHODOLOGY_VERSION, computeEsg } from "../lib/esg/scoring";

const prisma = new PrismaClient();
const ASSESSED_AT = new Date("2026-10-14T00:00:00.000Z");
/** Companies removed from the dataset: archived (kept with their history), not deleted. */
const RETIRED_SLUGS = ["fpt-retail"];

async function main() {
  const industryIds: Record<string, string> = {};
  for (const s of SECTORS) {
    const row = await prisma.industry.upsert({
      where: { slug: s.key },
      create: { slug: s.key, name: s.en },
      update: { name: s.en },
    });
    industryIds[s.key] = row.id;
  }

  let created = 0;
  for (const c of COMPANIES) {
    const assessedAt = c.assessedAt ? new Date(`${c.assessedAt}T00:00:00.000Z`) : ASSESSED_AT;
    const brand = await prisma.brand.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        industryId: industryIds[c.sector],
        country: c.country,
        website: `https://${c.domain}`,
        logoDomain: c.domain,
        isFictional: false,
        status: "PUBLISHED",
        lastReviewedAt: assessedAt,
      },
      update: {
        name: c.name,
        industryId: industryIds[c.sector],
        country: c.country,
        logoDomain: c.domain,
        isFictional: false,
        lastReviewedAt: assessedAt,
      },
    });

    const data = {
      environmental: c.e,
      social: c.s,
      governance: c.g,
      overall: computeEsg(c.e, c.s, c.g),
      whyVi: c.why.vi,
      whyEn: c.why.en,
      envNoteVi: c.notes.e.vi,
      envNoteEn: c.notes.e.en,
      socNoteVi: c.notes.s.vi,
      socNoteEn: c.notes.s.en,
      govNoteVi: c.notes.g.vi,
      govNoteEn: c.notes.g.en,
      methodologyVersion: ESG_METHODOLOGY_VERSION,
    };
    const current = await prisma.esgAssessment.findFirst({
      where: { brandId: brand.id, isCurrent: true },
    });
    const changed =
      !current || (Object.keys(data) as (keyof typeof data)[]).some((k) => current[k] !== data[k]);
    if (changed) {
      await prisma.$transaction([
        prisma.esgAssessment.updateMany({
          where: { brandId: brand.id, isCurrent: true },
          data: { isCurrent: false },
        }),
        prisma.esgAssessment.create({
          data: { ...data, brandId: brand.id, isCurrent: true, assessedAt },
        }),
      ]);
      created++;
    }

    for (const s of c.sources) {
      await prisma.esgSource.upsert({
        where: { brandId_url: { brandId: brand.id, url: s.url } },
        create: {
          brandId: brand.id,
          title: s.title,
          url: s.url,
          needsReplacement: s.needsReplacement ?? false,
        },
        update: { title: s.title, needsReplacement: s.needsReplacement ?? false },
      });
    }
  }
  const retired = await prisma.brand.updateMany({
    where: { slug: { in: RETIRED_SLUGS }, status: { not: "ARCHIVED" } },
    data: { status: "ARCHIVED" },
  });
  if (retired.count) console.log(`Archived ${retired.count} retired companies.`);
  console.log(`ESG dataset loaded: ${COMPANIES.length} companies, ${created} new assessment(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
