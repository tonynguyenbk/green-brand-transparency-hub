import { EVIDENCE_LEVEL_LABELS, EVIDENCE_LEVEL_MAX } from "./config";
import { isScorableStatus } from "./status";
import type { DimensionResult, EvidenceClaimInput } from "./types";

export interface EvidenceDetails {
  scoredClaims: number;
  excludedUnverified: number;
  excludedUnassessed: number;
  levelDistribution: Record<number, number>;
}

/**
 * Evidence Quality (0–100).
 *
 *   EvidenceScore = average(claimEvidenceLevel / 5) × 100
 *
 * Only VERIFIED or PUBLISHED claims with an assessed evidence level (0–5)
 * are included. CANDIDATE / IN_REVIEW / ARCHIVED claims never affect the
 * score. With no scorable claims the dimension is not calculated.
 */
export function calculateEvidenceScore(
  claims: EvidenceClaimInput[],
): DimensionResult<EvidenceDetails> {
  const verified = claims.filter((c) => isScorableStatus(c.status));
  const scored = verified.filter(
    (c): c is EvidenceClaimInput & { evidenceLevel: number } => c.evidenceLevel !== null,
  );

  const levelDistribution: Record<number, number> = {};
  for (let l = 0; l <= EVIDENCE_LEVEL_MAX; l++) levelDistribution[l] = 0;
  for (const c of scored) levelDistribution[c.evidenceLevel] += 1;

  const details: EvidenceDetails = {
    scoredClaims: scored.length,
    excludedUnverified: claims.length - verified.length,
    excludedUnassessed: verified.length - scored.length,
    levelDistribution,
  };

  if (scored.length === 0) {
    return {
      score: null,
      unavailableReason: "No claims have been reviewed yet.",
      explanation: [],
      details,
    };
  }

  const mean = scored.reduce((s, c) => s + c.evidenceLevel / EVIDENCE_LEVEL_MAX, 0) / scored.length;

  const explanation = [
    `${scored.length} verified claim${scored.length === 1 ? "" : "s"} assessed.`,
    ...Object.entries(levelDistribution)
      .filter(([, n]) => n > 0)
      .map(([level, n]) => `Level ${level} (${EVIDENCE_LEVEL_LABELS[Number(level)]}): ${n}`),
  ];
  if (details.excludedUnverified > 0) {
    explanation.push(
      `${details.excludedUnverified} claim(s) not yet verified were excluded from the score.`,
    );
  }

  return { score: mean * 100, explanation, details };
}
