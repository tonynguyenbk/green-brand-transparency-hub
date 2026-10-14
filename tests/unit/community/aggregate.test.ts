import { describe, expect, it } from "vitest";
import { MIN_RATINGS, reliabilityOf, summarizeRatings } from "@/lib/community/aggregate";

const rating = (e: number, s: number, g: number, stars = 3) => ({
  stars,
  environmental: e,
  social: s,
  governance: g,
});

describe("summarizeRatings", () => {
  it("hides the score until the threshold is reached", () => {
    const rows = Array.from({ length: MIN_RATINGS - 4 }, () => rating(8, 8, 8));
    const s = summarizeRatings(rows);
    expect(s).toMatchObject({ count: 6, shown: false, needed: 4, overall: null, stars: null });
  });

  it("averages pillars and applies the ESG formula to the means", () => {
    const rows = [
      ...Array.from({ length: 5 }, () => rating(6, 5, 4, 2)),
      ...Array.from({ length: 5 }, () => rating(7, 6, 5, 4)),
    ];
    const s = summarizeRatings(rows);
    expect(s.shown).toBe(true);
    expect(s.e).toBeCloseTo(6.5, 10);
    expect(s.s).toBeCloseTo(5.5, 10);
    expect(s.g).toBeCloseTo(4.5, 10);
    expect(s.stars).toBeCloseTo(3, 10);
    expect(s.overall).toBeCloseTo(6.5 * 0.4 + 5.5 * 0.35 + 4.5 * 0.25, 10);
  });

  it("handles an empty list", () => {
    expect(summarizeRatings([])).toMatchObject({ count: 0, shown: false, needed: MIN_RATINGS });
  });
});

describe("reliabilityOf", () => {
  const votes = (up: number, down: number) => [
    ...Array.from({ length: up }, () => ({ reliable: true })),
    ...Array.from({ length: down }, () => ({ reliable: false })),
  ];

  it("reports the reliable share", () => {
    expect(reliabilityOf(votes(3, 1))).toEqual({
      reliable: 3,
      total: 4,
      share: 0.75,
      flagged: false,
    });
    expect(reliabilityOf([]).share).toBeNull();
  });

  it("flags only with enough votes and a low share", () => {
    expect(reliabilityOf(votes(1, 5)).flagged).toBe(false); // too few votes
    expect(reliabilityOf(votes(3, 7)).flagged).toBe(true); // 30% of 10
    expect(reliabilityOf(votes(4, 6)).flagged).toBe(false); // exactly 40%
  });
});
