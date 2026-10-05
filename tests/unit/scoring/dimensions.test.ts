import { describe, expect, it } from "vitest";
import { calculateAccessibilityScore, clickCountPoints } from "@/lib/scoring/accessibility";
import { calculateDisclosureScore } from "@/lib/scoring/disclosure";
import { calculateEvidenceScore } from "@/lib/scoring/evidence";
import { calculateTargetsScore, evaluateTarget } from "@/lib/scoring/targets";
import type { DisclosureItemInput, TargetInput } from "@/lib/scoring/types";
import { calculateVerificationScore } from "@/lib/scoring/verification";

const ALL_TOPICS = [
  "SUSTAINABILITY_REPORT",
  "CARBON_EMISSIONS",
  "MATERIAL_SOURCING",
  "SUPPLY_CHAIN",
  "WASTE_RECYCLING",
  "WATER_RESOURCE_USE",
  "METHODOLOGY",
];

describe("calculateDisclosureScore", () => {
  it("scores clear = 1, partial = 0.5, not found = 0 using topic points", () => {
    const items: DisclosureItemInput[] = [
      { topic: "SUSTAINABILITY_REPORT", state: "AVAILABLE", level: "CLEAR" }, // 4
      { topic: "CARBON_EMISSIONS", state: "AVAILABLE", level: "PARTIAL" }, // 2
      { topic: "MATERIAL_SOURCING", state: "AVAILABLE", level: "CLEAR" }, // 4
      { topic: "SUPPLY_CHAIN", state: "NOT_FOUND", level: null }, // 0
      { topic: "WASTE_RECYCLING", state: "AVAILABLE", level: "CLEAR" }, // 3
      { topic: "WATER_RESOURCE_USE", state: "AVAILABLE", level: "PARTIAL" }, // 1.5
      { topic: "METHODOLOGY", state: "AVAILABLE", level: "CLEAR" }, // 3
    ];
    const r = calculateDisclosureScore(items);
    expect(r.score).toBeCloseTo((17.5 / 25) * 100, 10);
  });

  it("excludes pending and not-applicable topics instead of scoring them zero", () => {
    const items: DisclosureItemInput[] = ALL_TOPICS.map((topic, i) => ({
      topic,
      state: i < 5 ? "AVAILABLE" : i === 5 ? "NOT_APPLICABLE" : "PENDING_REVIEW",
      level: i < 5 ? "CLEAR" : null,
    }));
    const r = calculateDisclosureScore(items);
    expect(r.score).toBe(100);
    expect(r.details.pendingTopics).toBe(1);
  });

  it("is not calculated when fewer than half of applicable topics are assessed", () => {
    const r = calculateDisclosureScore([
      { topic: "SUSTAINABILITY_REPORT", state: "AVAILABLE", level: "CLEAR" },
    ]);
    expect(r.score).toBeNull();
    expect(r.unavailableReason).toMatch(/incomplete/);
  });
});

describe("calculateEvidenceScore", () => {
  it("averages evidence level / 5 × 100 for verified claims only", () => {
    const r = calculateEvidenceScore([
      { id: "a", status: "VERIFIED", evidenceLevel: 5 },
      { id: "b", status: "PUBLISHED", evidenceLevel: 2 },
      { id: "c", status: "CANDIDATE", evidenceLevel: 0 },
      { id: "d", status: "IN_REVIEW", evidenceLevel: 0 },
    ]);
    expect(r.score).toBeCloseTo(70, 10);
    expect(r.details.excludedUnverified).toBe(2);
  });

  it("returns null (not zero) when no claims are reviewed", () => {
    const r = calculateEvidenceScore([{ id: "a", status: "CANDIDATE", evidenceLevel: 5 }]);
    expect(r.score).toBeNull();
    expect(r.unavailableReason).toBe("No claims have been reviewed yet.");
  });

  it("excludes verified claims whose evidence level is not yet assessed", () => {
    const r = calculateEvidenceScore([
      { id: "a", status: "VERIFIED", evidenceLevel: 4 },
      { id: "b", status: "VERIFIED", evidenceLevel: null },
    ]);
    expect(r.score).toBe(80);
    expect(r.details.excludedUnassessed).toBe(1);
  });
});

describe("calculateVerificationScore", () => {
  const asOf = new Date("2026-10-01");

  it("level 1 for self-declared sources only", () => {
    const r = calculateVerificationScore(
      [{ id: "s", status: "VERIFIED", verificationLevel: "SELF_DECLARED" }],
      [],
      asOf,
    );
    expect(r.details.level).toBe(1);
    expect(r.score).toBe(20);
  });

  it("level 3 for a valid verified certification", () => {
    const r = calculateVerificationScore(
      [{ id: "s", status: "VERIFIED", verificationLevel: "SELF_DECLARED" }],
      [
        {
          id: "c",
          certificationBody: "Body A",
          verificationStatus: "VERIFIED",
          validTo: new Date("2027-01-01"),
        },
      ],
      asOf,
    );
    expect(r.details.level).toBe(3);
  });

  it("ignores expired certifications", () => {
    const r = calculateVerificationScore(
      [{ id: "s", status: "VERIFIED", verificationLevel: "SELF_DECLARED" }],
      [
        {
          id: "c",
          certificationBody: "Body A",
          verificationStatus: "VERIFIED",
          validTo: new Date("2025-01-01"),
        },
      ],
      asOf,
    );
    expect(r.details.level).toBe(1);
    expect(r.details.expiredCertifications).toBe(1);
  });

  it("level 4 for independent assurance, 5 with multiple independent mechanisms", () => {
    const assurance = {
      id: "a",
      status: "VERIFIED" as const,
      verificationLevel: "INDEPENDENT_ASSURANCE" as const,
      publisher: "Assurer",
    };
    expect(calculateVerificationScore([assurance], [], asOf).details.level).toBe(4);
    const r = calculateVerificationScore(
      [assurance],
      [{ id: "c", certificationBody: "Body A", verificationStatus: "VERIFIED", validTo: null }],
      asOf,
    );
    expect(r.details.level).toBe(5);
    expect(r.score).toBe(100);
  });

  it("does not count candidate sources", () => {
    const r = calculateVerificationScore(
      [{ id: "a", status: "CANDIDATE", verificationLevel: "INDEPENDENT_ASSURANCE" }],
      [],
      asOf,
    );
    expect(r.score).toBeNull();
  });
});

describe("Targets & Progress", () => {
  const full: TargetInput = {
    id: "t",
    title: "Cut emissions",
    isSpecific: true,
    metric: "tCO2e",
    targetValue: 50,
    baselineValue: 100,
    baselineYear: 2020,
    targetYear: 2030,
    latestProgress: 80,
    progressYear: 2025,
    hasHistoricalData: true,
    verificationStatus: "VERIFIED",
  };

  it("awards 15/15 for a complete target", () => {
    expect(evaluateTarget(full).points).toBe(15);
    expect(evaluateTarget(full).score).toBe(100);
  });

  it("uses the 2/3/2/2/3/3 point weights", () => {
    const t = evaluateTarget({ ...full, baselineValue: null, hasHistoricalData: false });
    expect(t.points).toBe(15 - 2 - 3);
  });

  it("averages target scores and excludes pending targets", () => {
    const vague: TargetInput = {
      ...full,
      id: "v",
      isSpecific: false,
      metric: null,
      targetValue: null,
      baselineValue: null,
      baselineYear: null,
      latestProgress: null,
      progressYear: null,
      hasHistoricalData: false,
    }; // only deadline = 2
    const pending: TargetInput = { ...full, id: "p", verificationStatus: "PENDING_REVIEW" };
    const r = calculateTargetsScore([full, vague, pending], "AVAILABLE");
    expect(r.score).toBeCloseTo((100 + (2 / 15) * 100) / 2, 10);
    expect(r.details.excludedPending).toBe(1);
  });

  it("missing targets: NOT_FOUND scores 0, PENDING_REVIEW is not calculated", () => {
    expect(calculateTargetsScore([], "NOT_FOUND").score).toBe(0);
    expect(calculateTargetsScore([], "PENDING_REVIEW").score).toBeNull();
  });
});

describe("Information Accessibility", () => {
  it.each([
    [1, 5],
    [2, 5],
    [3, 4],
    [4, 2],
    [5, 0],
    [9, 0],
  ])("%d clicks → %d points", (clicks, points) => {
    expect(clickCountPoints(clicks).points).toBe(points);
  });

  it("combines click, searchability, readability and evidence linkage out of 15", () => {
    const r = calculateAccessibilityScore({
      clickCount: 3,
      searchabilityScore: 2,
      readabilityScore: 3,
      evidenceLinkageScore: 2,
    });
    expect(r.score).toBeCloseTo((11 / 15) * 100, 10);
  });

  it("is not calculated when the audit is missing or incomplete", () => {
    expect(calculateAccessibilityScore(null).score).toBeNull();
    expect(
      calculateAccessibilityScore({
        clickCount: 2,
        searchabilityScore: null,
        readabilityScore: 3,
        evidenceLinkageScore: 4,
      }).score,
    ).toBeNull();
  });
});
