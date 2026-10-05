import type { Prisma, RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  classifyRisk,
  evaluateTarget,
  evidenceStrengthLabel,
  explainClaimRisk,
  isScorableStatus,
  verificationLabel,
  type TargetCriterion,
} from "@/lib/scoring";
import { parseScoreDetails } from "./scoring-service";

/** Public visitors only ever see PUBLISHED brands and VERIFIED/PUBLISHED claims & sources. */
const PUBLIC_BRAND_WHERE: Prisma.BrandWhereInput = { status: "PUBLISHED" };
const SCORABLE = { in: ["VERIFIED", "PUBLISHED"] as ("VERIFIED" | "PUBLISHED")[] };

export type BrandSort = "score_desc" | "score_asc" | "reviewed_desc" | "alpha";

export interface BrandDirectoryFilters {
  q?: string;
  industry?: string;
  minScore?: number;
  maxScore?: number;
  risk?: RiskLevel;
  sort?: BrandSort;
}

export interface BrandCardData {
  id: string;
  slug: string;
  name: string;
  industry: { name: string; slug: string };
  country: string | null;
  isFictional: boolean;
  lastReviewedAt: Date | null;
  description: string | null;
  analyzedClaims: number;
  score: {
    overall: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    averageClaimRisk: number | null;
    riskLevel: RiskLevel | null;
    sourceCount: number;
    calculatedAt: Date;
  } | null;
}

async function loadPublicBrandCards(where: Prisma.BrandWhereInput = {}): Promise<BrandCardData[]> {
  const brands = await prisma.brand.findMany({
    where: { ...PUBLIC_BRAND_WHERE, ...where },
    include: {
      industry: true,
      scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
      _count: { select: { claims: { where: { status: SCORABLE } } } },
    },
  });
  return brands.map((b) => {
    const s = b.scores[0];
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      industry: { name: b.industry.name, slug: b.industry.slug },
      country: b.country,
      isFictional: b.isFictional,
      lastReviewedAt: b.lastReviewedAt,
      description: b.description,
      analyzedClaims: b._count.claims,
      score: s
        ? {
            overall: s.overallScore,
            confidence: s.confidenceLevel,
            averageClaimRisk: s.averageClaimRisk,
            riskLevel: s.averageClaimRisk === null ? null : classifyRisk(s.averageClaimRisk),
            sourceCount: s.sourceCount,
            calculatedAt: s.calculatedAt,
          }
        : null,
    };
  });
}

/** Brand directory: search, industry / score / risk filters and sorting. */
export async function listPublicBrands(
  filters: BrandDirectoryFilters = {},
): Promise<BrandCardData[]> {
  const q = filters.q?.trim();
  const where: Prisma.BrandWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { industry: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (filters.industry) where.industry = { slug: filters.industry };

  let cards = await loadPublicBrandCards(where);

  const { minScore, maxScore, risk } = filters;
  if (minScore !== undefined) cards = cards.filter((c) => c.score && c.score.overall >= minScore);
  if (maxScore !== undefined) cards = cards.filter((c) => c.score && c.score.overall <= maxScore);
  if (risk) cards = cards.filter((c) => c.score?.riskLevel === risk);

  const sort = filters.sort ?? "score_desc";
  const scoreOf = (c: BrandCardData) => c.score?.overall ?? -1;
  cards.sort((a, b) => {
    switch (sort) {
      case "score_asc":
        // Unscored brands go last in both directions.
        return (a.score ? scoreOf(a) : 101) - (b.score ? scoreOf(b) : 101);
      case "reviewed_desc":
        return (b.lastReviewedAt?.getTime() ?? 0) - (a.lastReviewedAt?.getTime() ?? 0);
      case "alpha":
        return a.name.localeCompare(b.name);
      default:
        return scoreOf(b) - scoreOf(a);
    }
  });
  return cards;
}

export async function getFeaturedBrands(limit = 3) {
  return (await listPublicBrands({ sort: "reviewed_desc" })).slice(0, limit);
}

/** Resolve an API path key that may be a brand id or a slug. */
export async function resolveBrandKey(key: string) {
  return prisma.brand.findFirst({
    where: { OR: [{ id: key }, { slug: key }] },
    select: { id: true, slug: true, status: true },
  });
}

export async function listIndustries() {
  return prisma.industry.findMany({ orderBy: { name: "asc" } });
}

export async function listPublicBrandOptions() {
  return prisma.brand.findMany({
    where: PUBLIC_BRAND_WHERE,
    select: { slug: true, name: true, isFictional: true, industry: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Brand profile
// ---------------------------------------------------------------------------

export interface ClaimEvidenceView {
  sourceId: string;
  title: string;
  sourceType: string;
  publisher: string | null;
  url: string | null;
  archivedUrl: string | null;
  publicationDate: Date | null;
  accessedAt: Date | null;
  verificationLevel: string;
  excerpt: string | null;
  pageNumber: string | null;
  evidenceStrength: string;
}

export interface ClaimView {
  id: string;
  claimText: string;
  category: string;
  claimDate: Date | null;
  status: string;
  evidenceLevel: number | null;
  evidenceStrength: string;
  verification: string;
  riskScore: number | null;
  riskLevel: RiskLevel | null;
  components: {
    specificity: number | null;
    evidence: number | null;
    measurability: number | null;
    verification: number | null;
    context: number | null;
  };
  methodologyNote: string | null;
  verificationNote: string | null;
  reviewerNotes: string | null;
  riskExplanation: string[];
  missingInformation: string[];
  evidence: ClaimEvidenceView[];
  reviewedAt: Date | null;
}

export interface TargetView {
  id: string;
  title: string;
  category: string;
  metric: string | null;
  baselineValue: number | null;
  baselineYear: number | null;
  targetValue: number | null;
  targetYear: number | null;
  latestProgress: number | null;
  progressYear: number | null;
  verificationStatus: string;
  criteria: Record<TargetCriterion, boolean>;
  transparencyScore: number;
  sourceTitle: string | null;
}

/** Everything the public brand profile renders. All scoring is resolved here, not in components. */
export async function getPublicBrandProfile(slug: string) {
  const brand = await prisma.brand.findFirst({
    where: { slug, ...PUBLIC_BRAND_WHERE },
    include: {
      industry: true,
      scores: { orderBy: { calculatedAt: "desc" } },
      claims: {
        where: { status: SCORABLE },
        orderBy: [{ riskScore: "asc" }, { createdAt: "asc" }],
        include: { claimSources: { include: { source: true }, orderBy: { createdAt: "asc" } } },
      },
      certifications: {
        where: { verificationStatus: { not: "PENDING_REVIEW" } },
        include: { source: { select: { title: true, url: true } } },
        orderBy: { name: "asc" },
      },
      targets: {
        where: { verificationStatus: { not: "PENDING_REVIEW" } },
        include: { source: { select: { title: true } } },
        orderBy: { targetYear: "asc" },
      },
      sources: { where: { status: SCORABLE }, orderBy: { publicationDate: "desc" } },
      accessibilityAudits: { orderBy: { reviewedAt: "desc" }, take: 1 },
    },
  });
  if (!brand) return null;

  const latest = brand.scores[0] ?? null;
  const claims: ClaimView[] = brand.claims.map((c) => {
    const components = {
      specificity: c.specificityScore,
      evidence: c.evidenceScore,
      measurability: c.measurabilityScore,
      verification: c.verificationScore,
      context: c.contextScore,
    };
    const visibleEvidence = c.claimSources.filter((cs) => isScorableStatus(cs.source.status));
    const missingInformation: string[] = [];
    if (visibleEvidence.length === 0)
      missingInformation.push("No supporting sources are currently available.");
    if (!c.methodologyNote)
      missingInformation.push("No measurement methodology was found in the reviewed sources.");
    if ((c.measurabilityScore ?? 0) <= 2)
      missingInformation.push("No measurable baseline or metric was identified.");
    if ((c.verificationScore ?? 0) <= 1)
      missingInformation.push("No independent verification was identified.");
    return {
      id: c.id,
      claimText: c.claimText,
      category: c.claimCategory,
      claimDate: c.claimDate,
      status: c.status,
      evidenceLevel: c.evidenceScore,
      evidenceStrength: evidenceStrengthLabel(c.evidenceScore),
      verification: verificationLabel(c.verificationScore),
      riskScore: c.riskScore,
      riskLevel: c.riskLevel,
      components,
      methodologyNote: c.methodologyNote,
      verificationNote: c.verificationNote,
      reviewerNotes: c.reviewerNotes,
      riskExplanation: explainClaimRisk(components),
      missingInformation,
      reviewedAt: c.reviewedAt,
      evidence: visibleEvidence.map((cs) => ({
        sourceId: cs.sourceId,
        title: cs.source.title,
        sourceType: cs.source.sourceType,
        publisher: cs.source.publisher,
        url: cs.source.url,
        archivedUrl: cs.source.archivedUrl,
        publicationDate: cs.source.publicationDate,
        accessedAt: cs.source.accessedAt,
        verificationLevel: cs.source.verificationLevel,
        excerpt: cs.evidenceExcerpt,
        pageNumber: cs.pageNumber,
        evidenceStrength: cs.evidenceStrength,
      })),
    };
  });

  const targets: TargetView[] = brand.targets.map((t) => {
    const evaluation = evaluateTarget(t);
    return {
      id: t.id,
      title: t.title,
      category: t.category,
      metric: t.metric,
      baselineValue: t.baselineValue,
      baselineYear: t.baselineYear,
      targetValue: t.targetValue,
      targetYear: t.targetYear,
      latestProgress: t.latestProgress,
      progressYear: t.progressYear,
      verificationStatus: t.verificationStatus,
      criteria: evaluation.criteria,
      transparencyScore: evaluation.score,
      sourceTitle: t.source?.title ?? null,
    };
  });

  const newestSource = brand.sources.find((s) => s.publicationDate)?.publicationDate ?? null;

  return {
    brand: {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      industry: brand.industry,
      country: brand.country,
      website: brand.website,
      description: brand.description,
      isFictional: brand.isFictional,
      lastReviewedAt: brand.lastReviewedAt,
    },
    latestScore: latest,
    scoreDetails: latest ? parseScoreDetails(latest.detailsJson) : null,
    scoreHistory: [...brand.scores].reverse().map((s) => ({
      calculatedAt: s.calculatedAt,
      overallScore: s.overallScore,
      methodologyVersion: s.methodologyVersion,
    })),
    claims,
    certifications: brand.certifications,
    targets,
    sources: brand.sources,
    latestAudit: brand.accessibilityAudits[0] ?? null,
    newestSourceDate: newestSource,
  };
}

export type BrandProfile = NonNullable<Awaited<ReturnType<typeof getPublicBrandProfile>>>;
