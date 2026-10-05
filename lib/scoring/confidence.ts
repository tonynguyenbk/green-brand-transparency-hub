import { CONFIDENCE_CONFIG } from "./config";
import type { ConfidenceLevelValue } from "./types";

export interface ConfidenceInput {
  /** Scorable (VERIFIED / PUBLISHED) sources. */
  sources: { sourceType: string; publicationDate: Date | null }[];
  /** Count of open data gaps: pending disclosure topics, unassessed claims, missing dimensions… */
  missingDataPoints: number;
  /** Verification rubric (0–5) of scored claims. */
  claimVerificationScores: number[];
  asOf?: Date;
}

export interface ConfidenceResult {
  level: ConfidenceLevelValue;
  points: number;
  maxPoints: number;
  factors: { factor: string; points: number; max: number; note: string }[];
}

const LOW_QUALITY_SOURCE_TYPES = new Set(["MARKETING_MATERIAL", "OTHER"]);

/**
 * Confidence in the transparency ASSESSMENT — not in environmental
 * performance. Deliberately coarse (three levels) to avoid false precision.
 *
 * Points (max 8):
 *   Source count       >= 8 → 2, >= 4 → 1, else 0
 *   Source quality     >= 60% non-marketing sources → 1
 *   Source recency     newest source <= 24 months old → 1
 *   Missing data       0 open gaps → 2, <= 2 → 1, else 0
 *   External verif.    >= 50% of claims verification rubric >= 3 → 2, >= 25% → 1
 *
 *   >= 6 HIGH · >= 3 MEDIUM · otherwise LOW
 *   Fewer than 3 sources always yields LOW.
 */
export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
  const cfg = CONFIDENCE_CONFIG;
  const asOf = input.asOf ?? new Date();
  const factors: ConfidenceResult["factors"] = [];
  const n = input.sources.length;

  const countPts = n >= cfg.sourceCount.high ? 2 : n >= cfg.sourceCount.medium ? 1 : 0;
  factors.push({
    factor: "Number of sources",
    points: countPts,
    max: 2,
    note: `${n} verified source(s)`,
  });

  const quality =
    n === 0
      ? 0
      : input.sources.filter((s) => !LOW_QUALITY_SOURCE_TYPES.has(s.sourceType)).length / n;
  const qualityPts = n > 0 && quality >= cfg.qualityShareForPoint ? 1 : 0;
  factors.push({
    factor: "Source quality",
    points: qualityPts,
    max: 1,
    note: `${Math.round(quality * 100)}% of sources are reports, filings or independent material`,
  });

  const dates = input.sources.map((s) => s.publicationDate).filter((d): d is Date => d !== null);
  const newest = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
  const ageMonths = newest ? monthsBetween(newest, asOf) : null;
  const recencyPts = ageMonths !== null && ageMonths <= cfg.recencyMonths ? 1 : 0;
  factors.push({
    factor: "Source recency",
    points: recencyPts,
    max: 1,
    note:
      ageMonths === null
        ? "No dated sources"
        : `Newest source is ${Math.floor(ageMonths)} month(s) old`,
  });

  const gaps = input.missingDataPoints;
  const gapPts = gaps === 0 ? 2 : gaps <= cfg.maxGapsForPartialPoint ? 1 : 0;
  factors.push({
    factor: "Missing data",
    points: gapPts,
    max: 2,
    note: `${gaps} open data gap(s)`,
  });

  const claims = input.claimVerificationScores;
  const verifiedShare =
    claims.length === 0
      ? 0
      : claims.filter((v) => v >= cfg.externallyVerifiedRubricMin).length / claims.length;
  const verPts =
    verifiedShare >= cfg.externallyVerifiedShare.high
      ? 2
      : verifiedShare >= cfg.externallyVerifiedShare.medium
        ? 1
        : 0;
  factors.push({
    factor: "Externally verified claims",
    points: verPts,
    max: 2,
    note: `${Math.round(verifiedShare * 100)}% of assessed claims externally verified`,
  });

  const points = factors.reduce((s, f) => s + f.points, 0);
  let level: ConfidenceLevelValue =
    points >= cfg.levels.high ? "HIGH" : points >= cfg.levels.medium ? "MEDIUM" : "LOW";
  if (n < cfg.minimumSourcesForMediumOrHigh) level = "LOW";

  return { level, points, maxPoints: 8, factors };
}

export function monthsBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}
