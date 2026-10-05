import { calculateAccessibilityScore } from "./accessibility";
import { averageRisk, calculateClaimRisk } from "./claim-risk";
import { calculateConfidence, type ConfidenceResult } from "./confidence";
import { DIMENSION_KEYS, METHODOLOGY_VERSION, OVERALL_WEIGHTS, type DimensionKey } from "./config";
import { calculateDisclosureScore } from "./disclosure";
import { calculateEvidenceScore } from "./evidence";
import { detectTransparencyGaps, type TransparencyGap } from "./gaps";
import { isScorableStatus } from "./status";
import { calculateTargetsScore } from "./targets";
import { calculateOverallFromPartial, type Weights } from "./transparency-score";
import type {
  AccessibilityAuditInput,
  DimensionResult,
  DisclosureItemInput,
  MissingDataStateValue,
  ReviewStatusValue,
  TargetInput,
  VerificationCertificationInput,
  VerificationLevelValue,
} from "./types";
import { calculateVerificationScore } from "./verification";

export interface AssessmentClaimInput {
  id: string;
  status: ReviewStatusValue;
  evidenceLevel: number | null;
  specificity: number | null;
  measurability: number | null;
  verification: number | null;
  context: number | null;
  linkedSourceCount: number;
}

export interface AssessmentSourceInput {
  id: string;
  status: ReviewStatusValue;
  verificationLevel: VerificationLevelValue;
  sourceType: string;
  publisher: string | null;
  publicationDate: Date | null;
}

export interface BrandAssessmentInput {
  disclosureItems: DisclosureItemInput[];
  claims: AssessmentClaimInput[];
  sources: AssessmentSourceInput[];
  certifications: VerificationCertificationInput[];
  targets: TargetInput[];
  targetsDataState: MissingDataStateValue;
  latestAudit: AccessibilityAuditInput | null;
  weights?: Weights;
  methodologyVersion?: string;
  asOf?: Date;
}

export interface BrandAssessment {
  methodologyVersion: string;
  calculatedAt: string;
  dimensions: Record<DimensionKey, DimensionResult>;
  overall: number | null;
  missingDimensions: DimensionKey[];
  unavailableReason?: string;
  confidence: ConfidenceResult;
  averageClaimRisk: number | null;
  claimCount: number;
  sourceCount: number;
  gaps: TransparencyGap[];
}

/**
 * Full deterministic brand assessment from verified data:
 *   load verified data → all dimensions → overall → confidence.
 * The caller persists the result as a new BrandScore snapshot.
 */
export function assessBrand(input: BrandAssessmentInput): BrandAssessment {
  const asOf = input.asOf ?? new Date();
  const weights = input.weights ?? OVERALL_WEIGHTS;
  const scorableClaims = input.claims.filter((c) => isScorableStatus(c.status));
  const scorableSources = input.sources.filter((s) => isScorableStatus(s.status));

  const dimensions: Record<DimensionKey, DimensionResult> = {
    disclosure: calculateDisclosureScore(input.disclosureItems),
    evidence: calculateEvidenceScore(
      input.claims.map((c) => ({ id: c.id, status: c.status, evidenceLevel: c.evidenceLevel })),
    ),
    verification: calculateVerificationScore(input.sources, input.certifications, asOf),
    targets: calculateTargetsScore(input.targets, input.targetsDataState),
    accessibility: calculateAccessibilityScore(input.latestAudit),
  };

  const overall = calculateOverallFromPartial(
    Object.fromEntries(DIMENSION_KEYS.map((k) => [k, dimensions[k].score])) as Record<
      DimensionKey,
      number | null
    >,
    weights,
  );

  const claimRisks = scorableClaims.map(
    (c) =>
      calculateClaimRisk({
        specificity: c.specificity,
        evidence: c.evidenceLevel,
        measurability: c.measurability,
        verification: c.verification,
        context: c.context,
      })?.riskScore ?? null,
  );

  const pendingDisclosure = dimensions.disclosure.details as { pendingTopics: number };
  const unassessedClaims = claimRisks.filter((r) => r === null).length;
  const pendingTargets =
    input.targets.length -
    input.targets.filter((t) => t.verificationStatus !== "PENDING_REVIEW").length;
  const missingDataPoints =
    pendingDisclosure.pendingTopics +
    unassessedClaims +
    pendingTargets +
    overall.missingDimensions.length;

  const confidence = calculateConfidence({
    sources: scorableSources.map((s) => ({
      sourceType: s.sourceType,
      publicationDate: s.publicationDate,
    })),
    missingDataPoints,
    claimVerificationScores: scorableClaims
      .map((c) => c.verification)
      .filter((v): v is number => v !== null),
    asOf,
  });

  return {
    methodologyVersion: input.methodologyVersion ?? METHODOLOGY_VERSION,
    calculatedAt: asOf.toISOString(),
    dimensions,
    overall: overall.score,
    missingDimensions: overall.missingDimensions,
    unavailableReason: overall.unavailableReason,
    confidence,
    averageClaimRisk: averageRisk(claimRisks),
    claimCount: scorableClaims.length,
    sourceCount: scorableSources.length,
    gaps: detectTransparencyGaps({ ...input, asOf }),
  };
}
