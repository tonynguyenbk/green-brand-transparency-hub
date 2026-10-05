import {
  CLAIM_RISK_WEIGHTS,
  CLAIM_RUBRIC_MAX,
  RISK_THRESHOLDS,
  type ClaimRiskComponent,
} from "./config";
import type { ClaimRiskInput, RiskLevelValue } from "./types";

/** Normalised (0–100) claim components. */
export type ClaimRiskComponents = Record<ClaimRiskComponent, number>;

export interface ClaimRiskResult {
  transparencyStrength: number;
  riskScore: number;
  riskLevel: RiskLevelValue;
}

/**
 * Green Claim Transparency Risk.
 *
 *   transparencyStrength = specificity × 0.25 + evidence × 0.30
 *                        + measurability × 0.20 + verification × 0.15
 *                        + context × 0.10
 *   riskScore = 100 − transparencyStrength
 *
 * All inputs are 0–100. Classification: see classifyRisk.
 */
export function calculateClaimRiskFromComponents(c: ClaimRiskComponents): ClaimRiskResult {
  for (const [key, value] of Object.entries(c)) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new RangeError(`${key} must be between 0 and 100 (received ${value})`);
    }
  }
  const transparencyStrength =
    c.specificity * CLAIM_RISK_WEIGHTS.specificity +
    c.evidence * CLAIM_RISK_WEIGHTS.evidence +
    c.measurability * CLAIM_RISK_WEIGHTS.measurability +
    c.verification * CLAIM_RISK_WEIGHTS.verification +
    c.context * CLAIM_RISK_WEIGHTS.context;
  const riskScore = 100 - transparencyStrength;
  return { transparencyStrength, riskScore, riskLevel: classifyRisk(riskScore) };
}

/**
 * Risk thresholds (project-defined methodological choice):
 *   0–30 LOW · 31–60 MODERATE · 61–100 HIGH
 * The score is rounded before classification so the displayed integer
 * and the label always agree (e.g. 30.4 → 30 → LOW, 30.5 → 31 → MODERATE).
 */
export function classifyRisk(riskScore: number): RiskLevelValue {
  const rounded = Math.round(riskScore);
  if (rounded <= RISK_THRESHOLDS.lowMax) return "LOW";
  if (rounded <= RISK_THRESHOLDS.moderateMax) return "MODERATE";
  return "HIGH";
}

/** Normalise a 0–5 reviewer rubric value to 0–100. */
export function normaliseRubric(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > CLAIM_RUBRIC_MAX) {
    throw new RangeError(`Rubric value must be between 0 and ${CLAIM_RUBRIC_MAX}`);
  }
  return (value / CLAIM_RUBRIC_MAX) * 100;
}

/**
 * Risk for a reviewed claim whose components use the 0–5 rubric.
 * Returns null when any component has not been assessed — risk is never
 * computed from missing data.
 */
export function calculateClaimRisk(input: ClaimRiskInput): ClaimRiskResult | null {
  const keys: ClaimRiskComponent[] = [
    "specificity",
    "evidence",
    "measurability",
    "verification",
    "context",
  ];
  if (keys.some((k) => input[k] === null || input[k] === undefined)) return null;
  return calculateClaimRiskFromComponents({
    specificity: normaliseRubric(input.specificity!),
    evidence: normaliseRubric(input.evidence!),
    measurability: normaliseRubric(input.measurability!),
    verification: normaliseRubric(input.verification!),
    context: normaliseRubric(input.context!),
  });
}

/** Human-readable statements about which parts of a claim lack transparency. */
export function explainClaimRisk(input: ClaimRiskInput): string[] {
  const lines: string[] = [];
  const low = (v: number | null) => v !== null && v <= 2;
  if (input.specificity === null) lines.push("Specificity has not yet been assessed.");
  else if (low(input.specificity))
    lines.push("The claim uses broad wording without a clearly defined scope.");
  if (input.evidence === null) lines.push("Evidence availability has not yet been assessed.");
  else if (input.evidence === 0)
    lines.push("Supporting evidence was not found in the public sources reviewed.");
  else if (low(input.evidence))
    lines.push("This claim currently has limited publicly accessible supporting evidence.");
  if (low(input.measurability))
    lines.push(
      "The available public information does not provide a measurable metric or baseline.",
    );
  if (low(input.verification))
    lines.push("No independent verification of this claim was found during the review.");
  if (low(input.context))
    lines.push("Context such as timeframe, baseline or lifecycle scope is incomplete.");
  return lines;
}

/** Average risk across claims with a calculated risk score (null if none). */
export function averageRisk(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
