import { describe, expect, it } from "vitest";
import { assessBrand, type BrandAssessmentInput } from "@/lib/scoring/assess-brand";
import { calculateConfidence } from "@/lib/scoring/confidence";

const asOf = new Date("2026-10-01");
const recent = new Date("2026-03-01");
const old = new Date("2022-01-01");

describe("calculateConfidence", () => {
  it("HIGH with many recent quality sources, no gaps and verified claims", () => {
    const r = calculateConfidence({
      sources: Array.from({ length: 9 }, () => ({
        sourceType: "SUSTAINABILITY_REPORT",
        publicationDate: recent,
      })),
      missingDataPoints: 0,
      claimVerificationScores: [4, 4, 3, 1],
      asOf,
    });
    expect(r.points).toBe(8);
    expect(r.level).toBe("HIGH");
  });

  it("MEDIUM in the middle band", () => {
    const r = calculateConfidence({
      sources: Array.from({ length: 4 }, () => ({
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publicationDate: recent,
      })),
      missingDataPoints: 2,
      claimVerificationScores: [1, 1, 1],
      asOf,
    });
    // count 1 + quality 1 + recency 1 + gaps 1 + verified 0 = 4
    expect(r.points).toBe(4);
    expect(r.level).toBe("MEDIUM");
  });

  it("LOW when sources are old, marketing-only and data is missing", () => {
    const r = calculateConfidence({
      sources: Array.from({ length: 5 }, () => ({
        sourceType: "MARKETING_MATERIAL",
        publicationDate: old,
      })),
      missingDataPoints: 6,
      claimVerificationScores: [0, 1],
      asOf,
    });
    expect(r.level).toBe("LOW");
  });

  it("is always LOW with fewer than 3 sources", () => {
    const r = calculateConfidence({
      sources: [
        { sourceType: "ESG_REPORT", publicationDate: recent },
        { sourceType: "ESG_REPORT", publicationDate: recent },
      ],
      missingDataPoints: 0,
      claimVerificationScores: [5, 5],
      asOf,
    });
    expect(r.points).toBeGreaterThanOrEqual(3);
    expect(r.level).toBe("LOW");
  });
});

function baseInput(): BrandAssessmentInput {
  return {
    asOf,
    disclosureItems: [
      "SUSTAINABILITY_REPORT",
      "CARBON_EMISSIONS",
      "MATERIAL_SOURCING",
      "SUPPLY_CHAIN",
      "WASTE_RECYCLING",
      "WATER_RESOURCE_USE",
      "METHODOLOGY",
    ].map((topic) => ({ topic, state: "AVAILABLE", level: "CLEAR" })),
    claims: [
      {
        id: "c1",
        status: "VERIFIED",
        evidenceLevel: 5,
        specificity: 5,
        measurability: 5,
        verification: 5,
        context: 5,
        linkedSourceCount: 1,
      },
      {
        id: "c2",
        status: "PUBLISHED",
        evidenceLevel: 1,
        specificity: 1,
        measurability: 0,
        verification: 0,
        context: 1,
        linkedSourceCount: 0,
      },
    ],
    sources: Array.from({ length: 4 }, (_, i) => ({
      id: `s${i}`,
      status: "VERIFIED" as const,
      verificationLevel: "SELF_DECLARED" as const,
      sourceType: "SUSTAINABILITY_REPORT",
      publisher: "Brand",
      publicationDate: recent,
    })),
    certifications: [],
    targets: [],
    targetsDataState: "NOT_FOUND",
    latestAudit: {
      clickCount: 2,
      searchabilityScore: 3,
      readabilityScore: 3,
      evidenceLinkageScore: 4,
    },
  };
}

describe("assessBrand", () => {
  it("produces all dimensions, an overall score and metadata", () => {
    const a = assessBrand(baseInput());
    expect(a.dimensions.disclosure.score).toBe(100);
    expect(a.dimensions.evidence.score).toBeCloseTo(60, 10); // (5+1)/2/5
    expect(a.dimensions.verification.score).toBe(20);
    expect(a.dimensions.targets.score).toBe(0);
    expect(a.dimensions.accessibility.score).toBe(100);
    expect(a.overall).toBeCloseTo(25 + 15 + 4 + 0 + 15, 10);
    expect(a.methodologyVersion).toBe("1.0");
    expect(a.sourceCount).toBe(4);
    expect(a.claimCount).toBe(2);
    expect(a.calculatedAt).toBe(asOf.toISOString());
  });

  it("candidate claims never change the assessment", () => {
    const before = assessBrand(baseInput());
    const input = baseInput();
    input.claims.push({
      id: "cand",
      status: "CANDIDATE",
      evidenceLevel: 0,
      specificity: 0,
      measurability: 0,
      verification: 0,
      context: 0,
      linkedSourceCount: 0,
    });
    const after = assessBrand(input);
    expect(after.overall).toBe(before.overall);
    expect(after.claimCount).toBe(before.claimCount);
    expect(after.averageClaimRisk).toBe(before.averageClaimRisk);
  });

  it("does not produce an overall score when a dimension is missing", () => {
    const input = baseInput();
    input.latestAudit = null;
    const a = assessBrand(input);
    expect(a.overall).toBeNull();
    expect(a.missingDimensions).toEqual(["accessibility"]);
  });

  it("derives transparency gaps from stored data only", () => {
    const a = assessBrand(baseInput());
    const messages = a.gaps.map((g) => g.message);
    expect(messages).toContain("1 claim lacks quantitative evidence.");
    expect(messages).toContain("1 verified claim is not linked to a public source.");
    expect(messages).toContain("No public sustainability targets were found during the review.");
  });

  it("flags a sustainability report older than 24 months", () => {
    const input = baseInput();
    input.sources = input.sources.map((s) => ({ ...s, publicationDate: old }));
    const a = assessBrand(input);
    expect(a.gaps.map((g) => g.message)).toContain(
      "Latest sustainability report is older than 24 months.",
    );
  });
});
