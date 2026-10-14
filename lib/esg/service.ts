import "server-only";
import { prisma } from "@/lib/db/prisma";
import { SECTORS, type SectorKey } from "@/data/esg/companies";
import { bandFor, roundEsg, type BandKey } from "./scoring";

export interface EsgCompanyRow {
  slug: string;
  name: string;
  sector: SectorKey;
  country: string | null;
  logoDomain: string | null;
  e: number;
  s: number;
  g: number;
  overall: number;
  band: BandKey;
  sourceCount: number;
  assessedAt: string;
}

const SECTOR_KEYS = new Set(SECTORS.map((s) => s.key));

/** All companies with a current ESG assessment, best first (unrounded score). */
export async function listEsgCompanies(): Promise<EsgCompanyRow[]> {
  const brands = await prisma.brand.findMany({
    where: { status: "PUBLISHED", esgAssessments: { some: { isCurrent: true } } },
    include: {
      industry: { select: { slug: true } },
      esgAssessments: { where: { isCurrent: true }, take: 1 },
      _count: { select: { esgSources: true } },
    },
  });
  return brands
    .filter((b) => SECTOR_KEYS.has(b.industry.slug as SectorKey))
    .map((b) => {
      const a = b.esgAssessments[0];
      return {
        slug: b.slug,
        name: b.name,
        sector: b.industry.slug as SectorKey,
        country: b.country,
        logoDomain: b.logoDomain,
        e: a.environmental,
        s: a.social,
        g: a.governance,
        overall: a.overall,
        band: bandFor(a.overall).key,
        sourceCount: b._count.esgSources,
        assessedAt: a.assessedAt.toISOString(),
      };
    })
    .sort((x, y) => y.overall - x.overall || x.name.localeCompare(y.name));
}

export interface SectorSummary {
  key: SectorKey;
  count: number;
  average: number;
  top: EsgCompanyRow;
  bottom: EsgCompanyRow;
  companies: EsgCompanyRow[];
}

export function summarizeSectors(rows: EsgCompanyRow[]): SectorSummary[] {
  return SECTORS.map((s) => {
    const companies = rows.filter((r) => r.sector === s.key);
    const average =
      companies.reduce((sum, r) => sum + r.overall, 0) / Math.max(companies.length, 1);
    return {
      key: s.key,
      count: companies.length,
      average,
      top: companies[0],
      bottom: companies[companies.length - 1],
      companies,
    };
  }).filter((s) => s.count > 0);
}

export async function getEsgCompany(slug: string) {
  const brand = await prisma.brand.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      industry: { select: { slug: true } },
      esgAssessments: { where: { isCurrent: true }, take: 1 },
      esgSources: { orderBy: { createdAt: "asc" } },
    },
  });
  const a = brand?.esgAssessments[0];
  if (!brand || !a || !SECTOR_KEYS.has(brand.industry.slug as SectorKey)) return null;

  const all = await listEsgCompanies();
  const sector = brand.industry.slug as SectorKey;
  const peers = all.filter((r) => r.sector === sector);
  return {
    id: brand.id,
    slug: brand.slug,
    name: brand.name,
    sector,
    country: brand.country,
    website: brand.website,
    logoDomain: brand.logoDomain,
    assessment: {
      e: a.environmental,
      s: a.social,
      g: a.governance,
      overall: a.overall,
      rounded: roundEsg(a.overall),
      band: bandFor(a.overall),
      why: { vi: a.whyVi, en: a.whyEn },
      notes: {
        e: { vi: a.envNoteVi, en: a.envNoteEn },
        s: { vi: a.socNoteVi, en: a.socNoteEn },
        g: { vi: a.govNoteVi, en: a.govNoteEn },
      },
      methodologyVersion: a.methodologyVersion,
      assessedAt: a.assessedAt,
    },
    sources: brand.esgSources.map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      needsReplacement: s.needsReplacement,
      pillar: s.pillar,
      sentiment: s.sentiment,
      fromCommunity: s.submissionId !== null,
    })),
    peers,
    rankInSector: peers.findIndex((p) => p.slug === brand.slug) + 1,
    rankOverall: all.findIndex((p) => p.slug === brand.slug) + 1,
    totalCompanies: all.length,
  };
}

export type EsgCompanyDetail = NonNullable<Awaited<ReturnType<typeof getEsgCompany>>>;
