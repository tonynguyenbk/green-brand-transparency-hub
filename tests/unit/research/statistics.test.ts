import { describe, expect, it } from "vitest";
import { constructScores, SURVEY_ITEMS } from "@/lib/research/instrument";
import {
  cronbachAlpha,
  logGamma,
  mean,
  standardDeviation,
  studentTTwoTailedP,
  welchTTest,
} from "@/lib/research/statistics";

describe("descriptives", () => {
  it("mean and sample SD", () => {
    expect(mean([2, 4, 4, 4, 5, 5, 7, 9])).toBe(5);
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.13809, 4);
    expect(mean([])).toBeNull();
    expect(standardDeviation([3])).toBeNull();
  });
});

describe("t distribution", () => {
  it("logGamma matches known values", () => {
    expect(logGamma(1)).toBeCloseTo(0, 10);
    expect(logGamma(5)).toBeCloseTo(Math.log(24), 10);
    expect(logGamma(0.5)).toBeCloseTo(Math.log(Math.sqrt(Math.PI)), 10);
  });

  it("reproduces textbook critical values", () => {
    expect(studentTTwoTailedP(2.228, 10)).toBeCloseTo(0.05, 3);
    expect(studentTTwoTailedP(12.706, 1)).toBeCloseTo(0.05, 3);
    expect(studentTTwoTailedP(1.96, 1e6)).toBeCloseTo(0.05, 3);
    expect(studentTTwoTailedP(0, 5)).toBeCloseTo(1, 10);
  });
});

describe("welchTTest", () => {
  it("matches R's t.test(c(1:5), c(2,4,6,8,10))", () => {
    const r = welchTTest([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])!;
    expect(r.t).toBeCloseTo(-1.8974, 4);
    expect(r.df).toBeCloseTo(5.8824, 4);
    expect(r.p).toBeCloseTo(0.1077, 3);
    expect(r.meanDifference).toBe(-3);
  });

  it("returns null for too-small or zero-variance groups", () => {
    expect(welchTTest([1], [2, 3])).toBeNull();
    expect(welchTTest([3, 3], [3, 3])).toBeNull();
  });
});

describe("cronbachAlpha", () => {
  it("is 1 for perfectly consistent items and matches a hand-computed case", () => {
    expect(
      cronbachAlpha([
        [1, 1],
        [3, 3],
        [5, 5],
      ]),
    ).toBeCloseTo(1, 10);
    const rows = [
      [4, 5, 4],
      [2, 2, 3],
      [3, 4, 3],
      [5, 4, 5],
    ];
    // item variances: 1.6667, 1.5833, 0.9167 → sum 4.1667; totals 13,7,10,14 → var 10
    // α = 1.5 × (1 − 0.41667) = 0.875
    expect(cronbachAlpha(rows)).toBeCloseTo(0.875, 4);
  });

  it("needs at least two items and two respondents", () => {
    expect(cronbachAlpha([[1], [2]])).toBeNull();
    expect(cronbachAlpha([[1, 2]])).toBeNull();
  });
});

describe("constructScores", () => {
  it("averages items per construct and rejects missing answers", () => {
    const answers = Object.fromEntries(SURVEY_ITEMS.map((i) => [i.id, 4]));
    answers.BT1 = 2;
    const s = constructScores(answers);
    expect(s.brandTrust).toBeCloseTo((2 + 4 + 4) / 3, 10);
    expect(s.perceivedGreenwashing).toBe(4);
    expect(() => constructScores({ ...answers, PI2: 6 })).toThrow(RangeError);
    const { PT1: _omit, ...missing } = answers;
    expect(() => constructScores(missing)).toThrow(RangeError);
  });
});
