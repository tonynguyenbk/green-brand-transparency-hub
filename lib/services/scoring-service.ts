import type { BrandScore, Prisma, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";
import {
  assessBrand,
  isValidWeights,
  METHODOLOGY_VERSION,
  OVERALL_WEIGHTS,
  type BrandAssessment,
  type BrandAssessmentInput,
  type Weights,
} from "@/lib/scoring";

type Db = PrismaClient | Prisma.TransactionClient;

export interface ActiveMethodology {
  version: string;
  title: string;
  weights: Weights;
  publishedAt: Date | null;
}

/** Active methodology version; falls back to the in-code configuration. */
export async function getActiveMethodology(db: Db = defaultPrisma): Promise<ActiveMethodology> {
  const row = await db.methodologyVersion.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  const json = (row?.weightsJson ?? {}) as { overallWeights?: Record<string, number> };
  const weights =
    json.overallWeights && isValidWeights(json.overallWeights)
      ? json.overallWeights
      : OVERALL_WEIGHTS;
  return {
    version: row?.version ?? METHODOLOGY_VERSION,
    title: row?.title ?? "Green Transparency Methodology",
    weights,
    publishedAt: row?.publishedAt ?? null,
  };
}

/** Load everything the scoring engine needs for one brand. Filtering by status happens in the engine. */
export async function loadAssessmentInput(
  brandId: string,
  db: Db = defaultPrisma,
): Promise<Omit<BrandAssessmentInput, "weights" | "methodologyVersion" | "asOf">> {
  const brand = await db.brand.findUniqueOrThrow({
    where: { id: brandId },
    include: {
      disclosureItems: true,
      claims: { include: { _count: { select: { claimSources: true } } } },
      sources: true,
      certifications: true,
      targets: true,
      accessibilityAudits: { orderBy: { reviewedAt: "desc" }, take: 1 },
    },
  });

  return {
    disclosureItems: brand.disclosureItems.map((d) => ({
      topic: d.topic,
      state: d.state,
      level: d.level,
    })),
    claims: brand.claims.map((c) => ({
      id: c.id,
      status: c.status,
      evidenceLevel: c.evidenceScore,
      specificity: c.specificityScore,
      measurability: c.measurabilityScore,
      verification: c.verificationScore,
      context: c.contextScore,
      linkedSourceCount: c._count.claimSources,
    })),
    sources: brand.sources.map((s) => ({
      id: s.id,
      status: s.status,
      verificationLevel: s.verificationLevel,
      sourceType: s.sourceType,
      publisher: s.publisher,
      publicationDate: s.publicationDate,
    })),
    certifications: brand.certifications.map((c) => ({
      id: c.id,
      certificationBody: c.certificationBody,
      verificationStatus: c.verificationStatus,
      validTo: c.validTo,
    })),
    targets: brand.targets.map((t) => ({
      id: t.id,
      title: t.title,
      isSpecific: t.isSpecific,
      metric: t.metric,
      targetValue: t.targetValue,
      baselineValue: t.baselineValue,
      baselineYear: t.baselineYear,
      targetYear: t.targetYear,
      latestProgress: t.latestProgress,
      progressYear: t.progressYear,
      hasHistoricalData: t.hasHistoricalData,
      verificationStatus: t.verificationStatus,
    })),
    targetsDataState: brand.targetsDataState,
    latestAudit: brand.accessibilityAudits[0] ?? null,
  };
}

/** Run the full assessment without persisting anything (preview). */
export async function previewBrandAssessment(
  brandId: string,
  db: Db = defaultPrisma,
): Promise<BrandAssessment> {
  const [input, methodology] = await Promise.all([
    loadAssessmentInput(brandId, db),
    getActiveMethodology(db),
  ]);
  return assessBrand({
    ...input,
    weights: methodology.weights,
    methodologyVersion: methodology.version,
  });
}

export type RecalculateResult =
  | { ok: true; snapshot: BrandScore; assessment: BrandAssessment }
  | { ok: false; reason: string; assessment: BrandAssessment };

/**
 * Recalculate Score:
 *   load verified data → calculate all dimensions → overall → confidence
 *   → INSERT a new BrandScore snapshot.
 * Existing snapshots are never updated. If required review data is
 * incomplete no snapshot is written and the reason is returned.
 */
export async function recalculateBrandScore(
  brandId: string,
  db: Db = defaultPrisma,
  asOf: Date = new Date(),
): Promise<RecalculateResult> {
  const [input, methodology] = await Promise.all([
    loadAssessmentInput(brandId, db),
    getActiveMethodology(db),
  ]);
  const assessment = assessBrand({
    ...input,
    weights: methodology.weights,
    methodologyVersion: methodology.version,
    asOf,
  });

  if (assessment.overall === null) {
    return {
      ok: false,
      reason: assessment.unavailableReason ?? "Score cannot yet be calculated.",
      assessment,
    };
  }

  const d = assessment.dimensions;
  const snapshot = await db.brandScore.create({
    data: {
      brandId,
      overallScore: assessment.overall,
      disclosureScore: d.disclosure.score!,
      evidenceScore: d.evidence.score!,
      verificationScore: d.verification.score!,
      targetsScore: d.targets.score!,
      accessibilityScore: d.accessibility.score!,
      averageClaimRisk: assessment.averageClaimRisk,
      claimCount: assessment.claimCount,
      sourceCount: assessment.sourceCount,
      confidenceLevel: assessment.confidence.level,
      methodologyVersion: assessment.methodologyVersion,
      calculatedAt: asOf,
      detailsJson: toJson({
        weights: methodology.weights,
        dimensions: Object.fromEntries(
          Object.entries(d).map(([k, v]) => [
            k,
            { score: v.score, explanation: v.explanation, details: v.details },
          ]),
        ),
        confidence: assessment.confidence,
        gaps: assessment.gaps,
      }),
    },
  });

  return { ok: true, snapshot, assessment };
}

export async function getLatestScore(brandId: string, db: Db = defaultPrisma) {
  return db.brandScore.findFirst({ where: { brandId }, orderBy: { calculatedAt: "desc" } });
}

export async function getScoreHistory(brandId: string, db: Db = defaultPrisma) {
  return db.brandScore.findMany({ where: { brandId }, orderBy: { calculatedAt: "asc" } });
}

/** Shape of BrandScore.detailsJson. */
export interface ScoreDetails {
  weights: Weights;
  dimensions: Record<string, { score: number | null; explanation: string[]; details: unknown }>;
  confidence: BrandAssessment["confidence"];
  gaps: BrandAssessment["gaps"];
}

export function parseScoreDetails(json: Prisma.JsonValue | null): ScoreDetails | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  return json as unknown as ScoreDetails;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
