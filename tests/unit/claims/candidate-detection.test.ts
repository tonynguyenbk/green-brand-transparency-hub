import { describe, expect, it } from "vitest";
import { detectCandidateParagraphs } from "@/lib/claims/candidate-detection";

describe("detectCandidateParagraphs", () => {
  it("flags sustainability paragraphs with keywords, metrics and certification references", () => {
    const [c] = detectCandidateParagraphs([
      "Our packaging is now made from 80% recycled cardboard, certified by an independent body.",
    ]);
    expect(c.keywords).toEqual(expect.arrayContaining(["recycled", "packaging", "certified"]));
    expect(c.hasMetric).toBe(true);
    expect(c.hasCertificationReference).toBe(true);
  });

  it("matches 'net zero' with a hyphen and ignores unrelated or duplicate paragraphs", () => {
    const out = detectCandidateParagraphs([
      "Free shipping on all orders over fifty euros this weekend only.",
      "We are committed to reaching net-zero emissions across our operations by 2040.",
      "We are committed to reaching net-zero emissions across our operations by 2040.",
      "Too short: carbon.",
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].keywords).toEqual(expect.arrayContaining(["net zero", "emission"]));
  });
});
