/**
 * Methodology configuration — the single source of truth for weights,
 * thresholds and rubric point values used by the scoring engines.
 *
 * Every number here is a documented, project-defined methodological choice
 * (see docs/methodology.md). Changing any value requires publishing a new
 * MethodologyVersion so that historical snapshots remain interpretable.
 */

export const METHODOLOGY_VERSION = "1.0";

/** Green Transparency Score — overall dimension weights (sum = 1). */
export const OVERALL_WEIGHTS = {
  disclosure: 0.25,
  evidence: 0.25,
  verification: 0.2,
  targets: 0.15,
  accessibility: 0.15,
} as const;

export type DimensionKey = keyof typeof OVERALL_WEIGHTS;

export const DIMENSION_KEYS: DimensionKey[] = [
  "disclosure",
  "evidence",
  "verification",
  "targets",
  "accessibility",
];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  disclosure: "Sustainability Disclosure",
  evidence: "Evidence Quality",
  verification: "Third-Party Verification",
  targets: "Targets & Progress",
  accessibility: "Information Accessibility",
};

/** Green Claim Transparency Risk — component weights (sum = 1). */
export const CLAIM_RISK_WEIGHTS = {
  specificity: 0.25,
  evidence: 0.3,
  measurability: 0.2,
  verification: 0.15,
  context: 0.1,
} as const;

export type ClaimRiskComponent = keyof typeof CLAIM_RISK_WEIGHTS;

/**
 * Risk classification on the 0–100 risk score (inclusive upper bounds).
 * 0–30 LOW, 31–60 MODERATE, 61–100 HIGH. Classification uses the rounded
 * score so that the displayed number and the label never disagree.
 */
export const RISK_THRESHOLDS = {
  lowMax: 30,
  moderateMax: 60,
} as const;

/** Claim component rubric: reviewers score 0–5; the engine normalises ×20. */
export const CLAIM_RUBRIC_MAX = 5;

/** Evidence levels 0–5 (Evidence Quality dimension). */
export const EVIDENCE_LEVEL_MAX = 5;
export const EVIDENCE_LEVEL_LABELS: Record<number, string> = {
  0: "No evidence",
  1: "Descriptive evidence",
  2: "Quantitative evidence",
  3: "Quantitative evidence + source",
  4: "Quantitative evidence + source + methodology",
  5: "Quantitative evidence + methodology + independent verification",
};

/** Disclosure topics and their point weights (sum = 25, from the project spec). */
export const DISCLOSURE_TOPIC_POINTS = {
  SUSTAINABILITY_REPORT: 4,
  CARBON_EMISSIONS: 4,
  MATERIAL_SOURCING: 4,
  SUPPLY_CHAIN: 4,
  WASTE_RECYCLING: 3,
  WATER_RESOURCE_USE: 3,
  METHODOLOGY: 3,
} as const;

export type DisclosureTopicKey = keyof typeof DISCLOSURE_TOPIC_POINTS;

export const DISCLOSURE_TOPIC_LABELS: Record<DisclosureTopicKey, string> = {
  SUSTAINABILITY_REPORT: "Sustainability / ESG report",
  CARBON_EMISSIONS: "Carbon emissions",
  MATERIAL_SOURCING: "Material sourcing",
  SUPPLY_CHAIN: "Supply chain",
  WASTE_RECYCLING: "Waste / recycling",
  WATER_RESOURCE_USE: "Water / resource use",
  METHODOLOGY: "Methodology / measurement approach",
};

/** absent = 0, partial = 0.5, clear = 1 */
export const DISCLOSURE_LEVEL_VALUES = {
  ABSENT: 0,
  PARTIAL: 0.5,
  CLEAR: 1,
} as const;

/**
 * Minimum share of applicable disclosure topics that must be assessed
 * (i.e. not PENDING_REVIEW) before the disclosure dimension is calculated.
 */
export const DISCLOSURE_MIN_COVERAGE = 0.5;

/** Verification ladder 0–5. */
export const VERIFICATION_LEVEL_MAX = 5;
export const VERIFICATION_LEVEL_LABELS: Record<number, string> = {
  0: "None",
  1: "Self-declaration",
  2: "External reference",
  3: "Recognized certification",
  4: "Independent assurance",
  5: "Multiple relevant independent verification mechanisms",
};

/** Targets & Progress criteria points (sum = 15). */
export const TARGET_CRITERIA_POINTS = {
  specific: 2,
  quantitativeMetric: 3,
  baseline: 2,
  deadline: 2,
  progressUpdate: 3,
  historicalComparison: 3,
} as const;

export type TargetCriterion = keyof typeof TARGET_CRITERIA_POINTS;

export const TARGET_CRITERIA_LABELS: Record<TargetCriterion, string> = {
  specific: "Specific target",
  quantitativeMetric: "Quantitative metric",
  baseline: "Baseline",
  deadline: "Deadline",
  progressUpdate: "Progress update",
  historicalComparison: "Historical comparison",
};

/**
 * Information Accessibility rubric (sum = 15).
 * Click-count bands are an operational project rule, not a scientific law.
 */
export const ACCESSIBILITY_POINTS = {
  clickCountMax: 5,
  searchabilityMax: 3,
  readabilityMax: 3,
  evidenceLinkageMax: 4,
} as const;

/** clicks → points (out of 5). 5+ clicks = 0. */
export const CLICK_COUNT_BANDS: { maxClicks: number; points: number; label: string }[] = [
  { maxClicks: 2, points: 5, label: "Excellent" },
  { maxClicks: 3, points: 4, label: "Good" },
  { maxClicks: 4, points: 2, label: "Weak" },
  { maxClicks: Number.POSITIVE_INFINITY, points: 0, label: "Poor" },
];

/** Confidence in the transparency assessment. See lib/scoring/confidence.ts. */
export const CONFIDENCE_CONFIG = {
  /** Sources reviewed: >= high → 2 pts, >= medium → 1 pt. */
  sourceCount: { high: 8, medium: 4 },
  /** Below this many sources confidence is always LOW. */
  minimumSourcesForMediumOrHigh: 3,
  /** Share of sources that are not marketing material. */
  qualityShareForPoint: 0.6,
  /** Newest source must be within this many months for the recency point. */
  recencyMonths: 24,
  /** Open data gaps: 0 → 2 pts, <= this → 1 pt. */
  maxGapsForPartialPoint: 2,
  /** Share of scored claims with verification rubric >= 3. */
  externallyVerifiedShare: { high: 0.5, medium: 0.25 },
  externallyVerifiedRubricMin: 3,
  /** Total points (max 8) → level. */
  levels: { high: 6, medium: 3 },
} as const;

/** A sustainability report older than this is flagged as a transparency gap. */
export const REPORT_STALENESS_MONTHS = 24;

/** Statuses whose claims / sources may affect public scores. */
export const SCORABLE_STATUSES = ["VERIFIED", "PUBLISHED"] as const;

/** Snapshot of the configuration persisted in MethodologyVersion.weightsJson. */
export function methodologyConfigSnapshot() {
  return {
    version: METHODOLOGY_VERSION,
    overallWeights: OVERALL_WEIGHTS,
    claimRiskWeights: CLAIM_RISK_WEIGHTS,
    riskThresholds: RISK_THRESHOLDS,
    disclosureTopicPoints: DISCLOSURE_TOPIC_POINTS,
    disclosureLevelValues: DISCLOSURE_LEVEL_VALUES,
    targetCriteriaPoints: TARGET_CRITERIA_POINTS,
    accessibilityPoints: ACCESSIBILITY_POINTS,
    clickCountBands: CLICK_COUNT_BANDS.map((b) => ({
      maxClicks: Number.isFinite(b.maxClicks) ? b.maxClicks : null,
      points: b.points,
    })),
    confidence: CONFIDENCE_CONFIG,
  };
}
