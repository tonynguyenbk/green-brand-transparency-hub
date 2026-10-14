import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/data/esg/companies";
import { bandFor, computeEsg, formatEsg, roundEsg, rulerPercent } from "@/lib/esg/scoring";

describe("computeEsg", () => {
  it("applies 40 / 35 / 25 weights", () => {
    expect(computeEsg(6.5, 6.0, 6.0)).toBeCloseTo(6.2, 10); // Nike
    expect(computeEsg(7.5, 6.0, 5.5)).toBeCloseTo(6.475, 10); // H&M
  });

  it("rejects pillars outside 1–10", () => {
    expect(() => computeEsg(0, 5, 5)).toThrow(RangeError);
    expect(() => computeEsg(5, 11, 5)).toThrow(RangeError);
    expect(() => computeEsg(5, 5, Number.NaN)).toThrow(RangeError);
  });
});

describe("rounding", () => {
  it("rounds half-up despite floating point (x.x5 cases from rating.md)", () => {
    expect(roundEsg(computeEsg(6.5, 7.5, 4.5))).toBe(6.4); // The Body Shop 6.35
    expect(roundEsg(computeEsg(7.5, 7.5, 6.5))).toBe(7.3); // L'Oréal 7.25
    expect(roundEsg(computeEsg(4.5, 6.5, 5.5))).toBe(5.5); // Coca-Cola 5.45
    expect(formatEsg(7)).toBe("7.0");
    expect(formatEsg(null)).toBe("—");
  });
});

describe("bands", () => {
  it.each([
    [3.4, "very-weak"],
    [3.5, "weak"],
    [4.9, "weak"],
    [5.0, "moderate"],
    [6.4, "moderate"],
    [6.45, "good"],
    [6.5, "good"],
    [7.9, "good"],
    [8.0, "strong"],
    [10, "strong"],
  ] as const)("%d → %s", (score, band) => {
    expect(bandFor(score).key).toBe(band);
  });

  it("maps the ruler linearly", () => {
    expect(rulerPercent(1)).toBe(0);
    expect(rulerPercent(10)).toBe(100);
    expect(rulerPercent(5.5)).toBeCloseTo(50, 10);
  });
});

describe("seed data", () => {
  it("has 27 companies with valid pillars and at least one source", () => {
    expect(COMPANIES).toHaveLength(27);
    for (const c of COMPANIES) {
      expect(() => computeEsg(c.e, c.s, c.g)).not.toThrow();
      expect(c.sources.length).toBeGreaterThan(0);
      expect(c.why.vi && c.why.en && c.notes.e.vi && c.notes.g.en).toBeTruthy();
    }
    expect(new Set(COMPANIES.map((c) => c.slug)).size).toBe(27);
  });

  it("documents where rating.md's listed overall differs from the formula", () => {
    const mismatched = COMPANIES.filter(
      (c) => roundEsg(computeEsg(c.e, c.s, c.g)) !== c.listedOverall,
    ).map((c) => c.slug);
    expect(mismatched).toEqual(
      expect.arrayContaining(["apple", "samsung"]), // genuine discrepancies, not just rounding
    );
  });
});
