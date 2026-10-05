import { describe, expect, it } from "vitest";
import {
  averageRisk,
  calculateClaimRisk,
  calculateClaimRiskFromComponents,
  classifyRisk,
  explainClaimRisk,
  normaliseRubric,
} from "@/lib/scoring/claim-risk";

describe("classifyRisk boundaries", () => {
  it.each([
    [0, "LOW"],
    [30, "LOW"],
    [31, "MODERATE"],
    [60, "MODERATE"],
    [61, "HIGH"],
    [100, "HIGH"],
  ] as const)("risk score %d → %s", (score, level) => {
    expect(classifyRisk(score)).toBe(level);
  });

  it("classifies on the rounded score so label and display agree", () => {
    expect(classifyRisk(30.4)).toBe("LOW");
    expect(classifyRisk(30.5)).toBe("MODERATE");
    expect(classifyRisk(60.49)).toBe("MODERATE");
    expect(classifyRisk(60.5)).toBe("HIGH");
  });
});

describe("calculateClaimRiskFromComponents", () => {
  it("applies 25/30/20/15/10 weights and risk = 100 - strength", () => {
    const r = calculateClaimRiskFromComponents({
      specificity: 100,
      evidence: 50,
      measurability: 0,
      verification: 100,
      context: 50,
    });
    // 25 + 15 + 0 + 15 + 5 = 60
    expect(r.transparencyStrength).toBeCloseTo(60, 10);
    expect(r.riskScore).toBeCloseTo(40, 10);
    expect(r.riskLevel).toBe("MODERATE");
  });

  it("fully transparent claim has zero risk", () => {
    const r = calculateClaimRiskFromComponents({
      specificity: 100,
      evidence: 100,
      measurability: 100,
      verification: 100,
      context: 100,
    });
    expect(r.riskScore).toBeCloseTo(0, 10);
    expect(r.riskLevel).toBe("LOW");
  });

  it("rejects values outside 0–100", () => {
    expect(() =>
      calculateClaimRiskFromComponents({
        specificity: -1,
        evidence: 0,
        measurability: 0,
        verification: 0,
        context: 0,
      }),
    ).toThrow(RangeError);
  });
});

describe("calculateClaimRisk (0–5 rubric)", () => {
  it("normalises the rubric ×20", () => {
    expect(normaliseRubric(0)).toBe(0);
    expect(normaliseRubric(3)).toBe(60);
    expect(normaliseRubric(5)).toBe(100);
    expect(() => normaliseRubric(6)).toThrow(RangeError);
  });

  it("returns null when any component is missing (never treats missing as 0)", () => {
    expect(
      calculateClaimRisk({
        specificity: 5,
        evidence: null,
        measurability: 5,
        verification: 5,
        context: 5,
      }),
    ).toBeNull();
  });

  it("computes a high risk for a vague, unsupported claim", () => {
    const r = calculateClaimRisk({
      specificity: 1,
      evidence: 0,
      measurability: 0,
      verification: 0,
      context: 1,
    });
    // strength = 20*.25 + 0 + 0 + 0 + 20*.1 = 7 → risk 93
    expect(r?.riskScore).toBeCloseTo(93, 10);
    expect(r?.riskLevel).toBe("HIGH");
  });

  it("explains weak components in non-accusatory language", () => {
    const lines = explainClaimRisk({
      specificity: 1,
      evidence: 0,
      measurability: 1,
      verification: 0,
      context: 2,
    });
    expect(lines.join(" ")).toMatch(/not found in the public sources reviewed/);
    expect(lines.join(" ").toLowerCase()).not.toMatch(/greenwash|fake|lie/);
  });

  it("averages only calculated risks", () => {
    expect(averageRisk([20, null, 40])).toBe(30);
    expect(averageRisk([null, null])).toBeNull();
  });
});
