import { TARGET_CRITERIA_LABELS, TARGET_CRITERIA_POINTS, type TargetCriterion } from "./config";
import type { DimensionResult, MissingDataStateValue, TargetInput } from "./types";

const TOTAL_TARGET_POINTS = Object.values(TARGET_CRITERIA_POINTS).reduce((a, b) => a + b, 0);

export interface TargetEvaluation {
  id: string;
  title: string;
  criteria: Record<TargetCriterion, boolean>;
  points: number;
  /** 0–100 */
  score: number;
}

export interface TargetsDetails {
  evaluations: TargetEvaluation[];
  excludedPending: number;
}

/** Evaluate one target against the six transparency criteria. */
export function evaluateTarget(target: TargetInput): TargetEvaluation {
  const criteria: Record<TargetCriterion, boolean> = {
    specific: target.isSpecific,
    quantitativeMetric: Boolean(target.metric?.trim()) && target.targetValue !== null,
    baseline: target.baselineValue !== null && target.baselineYear !== null,
    deadline: target.targetYear !== null,
    progressUpdate: target.latestProgress !== null && target.progressYear !== null,
    historicalComparison: target.hasHistoricalData,
  };
  const points = (Object.keys(criteria) as TargetCriterion[]).reduce(
    (sum, k) => sum + (criteria[k] ? TARGET_CRITERIA_POINTS[k] : 0),
    0,
  );
  return {
    id: target.id,
    title: target.title,
    criteria,
    points,
    score: (points / TOTAL_TARGET_POINTS) * 100,
  };
}

/**
 * Targets & Progress (0–100).
 *
 * Each target earns up to 15 points:
 *   specific 2, quantitative metric 3, baseline 2, deadline 2,
 *   progress update 3, historical comparison 3.
 *   targetScore = points / 15 × 100
 *   dimension   = mean(targetScore) over assessed targets
 *
 * Targets with verificationStatus PENDING_REVIEW are excluded.
 * With no assessed targets:
 *   - brand targetsDataState NOT_FOUND / NOT_AVAILABLE → 0
 *     ("no public targets found during the review")
 *   - otherwise → not calculated.
 */
export function calculateTargetsScore(
  targets: TargetInput[],
  targetsDataState: MissingDataStateValue,
): DimensionResult<TargetsDetails> {
  const assessed = targets.filter((t) => t.verificationStatus !== "PENDING_REVIEW");
  const evaluations = assessed.map(evaluateTarget);
  const details: TargetsDetails = {
    evaluations,
    excludedPending: targets.length - assessed.length,
  };

  if (evaluations.length === 0) {
    if (targetsDataState === "NOT_FOUND" || targetsDataState === "NOT_AVAILABLE") {
      return {
        score: 0,
        explanation: ["No public sustainability targets were found during the review."],
        details,
      };
    }
    return {
      score: null,
      unavailableReason: "Targets have not been reviewed yet.",
      explanation: [],
      details,
    };
  }

  const mean = evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length;
  const explanation = evaluations.map((e) => {
    const missing = (Object.keys(e.criteria) as TargetCriterion[])
      .filter((k) => !e.criteria[k])
      .map((k) => TARGET_CRITERIA_LABELS[k].toLowerCase());
    return `${e.title}: ${e.points}/${TOTAL_TARGET_POINTS} pts${missing.length ? ` — missing ${missing.join(", ")}` : ""}`;
  });

  return { score: mean, explanation, details };
}
