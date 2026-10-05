import type { ConfidenceLevelValue, RiskLevelValue } from "./types";

/** Display rounding only — calculations keep full precision. */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "—";
  return String(Math.round(score));
}

export const RISK_LABELS: Record<RiskLevelValue, string> = {
  LOW: "Low transparency risk",
  MODERATE: "Moderate transparency risk",
  HIGH: "High transparency risk",
};

export const RISK_SHORT_LABELS: Record<RiskLevelValue, string> = {
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
};

export const CONFIDENCE_LABELS: Record<ConfidenceLevelValue, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export type EvidenceStrengthLabel =
  | "Strong evidence"
  | "Moderate evidence"
  | "Limited evidence"
  | "Supporting evidence not found"
  | "Pending review";

/** Map an Evidence Level (0–5) to the public wording used across the UI. */
export function evidenceStrengthLabel(level: number | null): EvidenceStrengthLabel {
  if (level === null) return "Pending review";
  if (level === 0) return "Supporting evidence not found";
  if (level <= 2) return "Limited evidence";
  if (level === 3) return "Moderate evidence";
  return "Strong evidence";
}

/** Verification rubric (0–5) → public wording. */
export function verificationLabel(score: number | null): string {
  if (score === null) return "Pending review";
  if (score >= 4) return "Independently verified";
  if (score >= 2) return "Partially verified";
  return "Not independently verified";
}

/** Score band wording that describes communication transparency only. */
export function scoreBandLabel(score: number | null): string {
  if (score === null) return "Not yet calculated";
  const s = Math.round(score);
  if (s >= 75) return "Extensive public evidence";
  if (s >= 50) return "Partial public evidence";
  if (s >= 25) return "Limited public evidence";
  return "Very limited public evidence";
}
