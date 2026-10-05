import { describe, expect, it } from "vitest";
import {
  calculateOverallFromPartial,
  calculateTransparencyScore,
  isValidWeights,
} from "@/lib/scoring/transparency-score";
import { OVERALL_WEIGHTS } from "@/lib/scoring/config";
import { formatScore } from "@/lib/scoring/labels";

describe("calculateTransparencyScore", () => {
  it("applies the 25/25/20/15/15 weights", () => {
    const score = calculateTransparencyScore({
      disclosure: 80,
      evidence: 60,
      verification: 40,
      targets: 100,
      accessibility: 20,
    });
    // 80*.25 + 60*.25 + 40*.2 + 100*.15 + 20*.15 = 20 + 15 + 8 + 15 + 3
    expect(score).toBeCloseTo(61, 10);
  });

  it("returns 100 when all dimensions are 100 and 0 when all are 0", () => {
    const all = (v: number) => ({
      disclosure: v,
      evidence: v,
      verification: v,
      targets: v,
      accessibility: v,
    });
    expect(calculateTransparencyScore(all(100))).toBeCloseTo(100, 10);
    expect(calculateTransparencyScore(all(0))).toBe(0);
  });

  it("keeps internal precision and rounds only for display", () => {
    const score = calculateTransparencyScore({
      disclosure: 33.3,
      evidence: 66.667,
      verification: 50,
      targets: 12.7,
      accessibility: 87.5,
    });
    expect(score).not.toBe(Math.round(score));
    expect(formatScore(score)).toBe(String(Math.round(score)));
  });

  it("rejects out-of-range inputs", () => {
    expect(() =>
      calculateTransparencyScore({
        disclosure: 101,
        evidence: 0,
        verification: 0,
        targets: 0,
        accessibility: 0,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateTransparencyScore({
        disclosure: Number.NaN,
        evidence: 0,
        verification: 0,
        targets: 0,
        accessibility: 0,
      }),
    ).toThrow(RangeError);
  });

  it("weights sum to 1", () => {
    expect(isValidWeights(OVERALL_WEIGHTS)).toBe(true);
    expect(isValidWeights({ ...OVERALL_WEIGHTS, evidence: 0.5 })).toBe(false);
  });
});

describe("calculateOverallFromPartial", () => {
  it("does not calculate an overall score when a dimension is missing", () => {
    const result = calculateOverallFromPartial({
      disclosure: 80,
      evidence: null,
      verification: 40,
      targets: 100,
      accessibility: 20,
    });
    expect(result.score).toBeNull();
    expect(result.missingDimensions).toEqual(["evidence"]);
    expect(result.unavailableReason).toMatch(/cannot yet be calculated/i);
  });

  it("treats a genuine 0 as a value, not as missing", () => {
    const result = calculateOverallFromPartial({
      disclosure: 0,
      evidence: 0,
      verification: 0,
      targets: 0,
      accessibility: 0,
    });
    expect(result.score).toBe(0);
    expect(result.missingDimensions).toEqual([]);
  });
});
