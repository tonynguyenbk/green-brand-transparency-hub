import { DIMENSION_KEYS, DIMENSION_LABELS, OVERALL_WEIGHTS, type DimensionKey } from "./config";

export type DimensionScores = Record<DimensionKey, number>;
export type Weights = Record<DimensionKey, number>;

/**
 * Green Transparency Score (0–100):
 *
 *   overall = disclosure × 0.25 + evidence × 0.25 + verification × 0.20
 *           + targets × 0.15 + accessibility × 0.15
 *
 * Inputs must already be normalised to 0–100. Full precision is kept;
 * rounding happens only at display time (see formatScore).
 */
export function calculateTransparencyScore(
  input: DimensionScores,
  weights: Weights = OVERALL_WEIGHTS,
): number {
  for (const key of DIMENSION_KEYS) {
    const v = input[key];
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      throw new RangeError(`${key} must be between 0 and 100 (received ${v})`);
    }
  }
  return DIMENSION_KEYS.reduce((sum, key) => sum + input[key] * weights[key], 0);
}

export interface OverallResult {
  score: number | null;
  missingDimensions: DimensionKey[];
  unavailableReason?: string;
}

/**
 * Overall score from possibly-incomplete dimensions. The overall score is
 * only produced when all five dimensions are available — a missing
 * dimension is never silently treated as zero.
 */
export function calculateOverallFromPartial(
  dims: Record<DimensionKey, number | null>,
  weights: Weights = OVERALL_WEIGHTS,
): OverallResult {
  const missingDimensions = DIMENSION_KEYS.filter((k) => dims[k] === null);
  if (missingDimensions.length > 0) {
    return {
      score: null,
      missingDimensions,
      unavailableReason: `Score cannot yet be calculated because required review data is incomplete (${missingDimensions
        .map((k) => DIMENSION_LABELS[k])
        .join(", ")}).`,
    };
  }
  return {
    score: calculateTransparencyScore(dims as DimensionScores, weights),
    missingDimensions: [],
  };
}

/** Validate that a weights object is complete and sums to 1 (±0.001). */
export function isValidWeights(weights: Partial<Record<string, number>>): weights is Weights {
  const values = DIMENSION_KEYS.map((k) => weights[k]);
  if (values.some((v) => typeof v !== "number" || v < 0)) return false;
  const sum = (values as number[]).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1) < 0.001;
}
