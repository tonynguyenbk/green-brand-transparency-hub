/**
 * Plain input types for the scoring engines. They intentionally mirror the
 * Prisma enums as string unions so the engines stay pure (no database
 * dependency) and are trivially unit-testable.
 */

export type MissingDataStateValue =
  "AVAILABLE" | "NOT_AVAILABLE" | "NOT_FOUND" | "NOT_APPLICABLE" | "PENDING_REVIEW";

export type DisclosureLevelValue = "ABSENT" | "PARTIAL" | "CLEAR";

export type VerificationLevelValue =
  "SELF_DECLARED" | "EXTERNAL_REFERENCE" | "RECOGNIZED_CERTIFICATION" | "INDEPENDENT_ASSURANCE";

export type VerificationStatusValue =
  "VERIFIED" | "PARTIALLY_VERIFIED" | "SELF_DECLARED" | "UNVERIFIED" | "EXPIRED" | "PENDING_REVIEW";

export type ReviewStatusValue = "CANDIDATE" | "IN_REVIEW" | "VERIFIED" | "PUBLISHED" | "ARCHIVED";

export type RiskLevelValue = "LOW" | "MODERATE" | "HIGH";

export type ConfidenceLevelValue = "HIGH" | "MEDIUM" | "LOW";

/** Result of one scoring dimension. `score` is null when it cannot be calculated. */
export interface DimensionResult<TDetails = unknown> {
  /** 0–100 with full internal precision, or null when data is insufficient. */
  score: number | null;
  /** Why the score is null (only set when score === null). */
  unavailableReason?: string;
  /** Human-readable explanation lines shown in the UI. */
  explanation: string[];
  details: TDetails;
}

export interface DisclosureItemInput {
  topic: string;
  state: MissingDataStateValue;
  level: DisclosureLevelValue | null;
}

export interface EvidenceClaimInput {
  id: string;
  status: ReviewStatusValue;
  /** Evidence level 0–5 (null = not yet assessed). */
  evidenceLevel: number | null;
}

export interface VerificationSourceInput {
  id: string;
  status: ReviewStatusValue;
  verificationLevel: VerificationLevelValue;
  publisher?: string | null;
}

export interface VerificationCertificationInput {
  id: string;
  certificationBody: string | null;
  verificationStatus: VerificationStatusValue;
  validTo: Date | null;
}

export interface TargetInput {
  id: string;
  title: string;
  isSpecific: boolean;
  metric: string | null;
  targetValue: number | null;
  baselineValue: number | null;
  baselineYear: number | null;
  targetYear: number | null;
  latestProgress: number | null;
  progressYear: number | null;
  hasHistoricalData: boolean;
  verificationStatus: VerificationStatusValue;
}

export interface AccessibilityAuditInput {
  clickCount: number | null;
  searchabilityScore: number | null;
  readabilityScore: number | null;
  evidenceLinkageScore: number | null;
}

export interface ClaimRiskInput {
  /** All components on the 0–5 reviewer rubric; null = not assessed. */
  specificity: number | null;
  evidence: number | null;
  measurability: number | null;
  verification: number | null;
  context: number | null;
}
