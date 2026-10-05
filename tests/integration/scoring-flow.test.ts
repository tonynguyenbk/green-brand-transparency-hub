/**
 * Integration: Brand → verified claims → sources → score calculation → snapshot.
 * Runs against the database in DATABASE_URL (or TEST_DATABASE_URL). All rows
 * are created under a unique fictional brand and deleted afterwards.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { DISCLOSURE_TOPICS } from "@/lib/validation/enums";
import {
  createClaim,
  setClaimStatus,
  linkClaimSource,
  ClaimReviewError,
} from "@/lib/services/claim-service";
import { getScoreHistory, recalculateBrandScore } from "@/lib/services/scoring-service";

const slug = `itest-${Date.now()}`;
let brandId = "";
let industryId = "";
let sourceId = "";

const rubric = (n: number) => ({
  specificityScore: n,
  evidenceScore: n,
  measurabilityScore: n,
  verificationScore: n,
  contextScore: n,
});

const claimInput = (text: string, n: number | null) => ({
  brandId,
  claimText: text,
  claimCategory: "MATERIALS" as const,
  claimDate: null,
  ...(n === null
    ? {
        specificityScore: null,
        evidenceScore: null,
        measurabilityScore: null,
        verificationScore: null,
        contextScore: null,
      }
    : rubric(n)),
  methodologyNote: null,
  verificationNote: null,
  reviewerNotes: null,
});

beforeAll(async () => {
  const industry = await prisma.industry.create({ data: { name: `Integration ${slug}`, slug } });
  industryId = industry.id;
  const brand = await prisma.brand.create({
    data: {
      slug,
      name: "Integration Test Brand (fictional)",
      industryId,
      isFictional: true,
      status: "PUBLISHED",
      targetsDataState: "NOT_FOUND",
    },
  });
  brandId = brand.id;
  await prisma.disclosureItem.createMany({
    data: DISCLOSURE_TOPICS.map((topic) => ({
      brandId,
      topic,
      state: "AVAILABLE" as const,
      level: "CLEAR" as const,
    })),
  });
  await prisma.accessibilityAudit.create({
    data: {
      brandId,
      clickCount: 2,
      searchabilityScore: 3,
      readabilityScore: 3,
      evidenceLinkageScore: 4,
    },
  });
  for (let i = 0; i < 4; i++) {
    const s = await prisma.source.create({
      data: {
        brandId,
        title: `Report ${i}`,
        sourceType: "SUSTAINABILITY_REPORT",
        url: `https://example.com/${slug}/report-${i}.pdf`,
        publicationDate: new Date(),
        verificationLevel: "SELF_DECLARED",
        status: "VERIFIED",
      },
    });
    sourceId ||= s.id;
  }
});

afterAll(async () => {
  await prisma.brand.deleteMany({ where: { slug } });
  await prisma.industry.deleteMany({ where: { id: industryId } });
  await prisma.$disconnect();
});

describe("score calculation flow", () => {
  it("cannot score a brand without reviewed claims", async () => {
    const r = await recalculateBrandScore(brandId);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/Evidence Quality/);
    expect(await getScoreHistory(brandId)).toHaveLength(0);
  });

  it("refuses to verify a claim whose rubric is incomplete", async () => {
    const c = await createClaim(claimInput("Incomplete rubric claim for testing.", null));
    expect(c.status).toBe("CANDIDATE");
    await expect(setClaimStatus(c.id, "VERIFIED")).rejects.toBeInstanceOf(ClaimReviewError);
  });

  it("verified claim + sources → score → snapshot", async () => {
    const c = await createClaim(
      claimInput("68% recycled polyester verified by a fictional body.", 5),
    );
    expect(c.riskScore).toBe(0);
    expect(c.riskLevel).toBe("LOW");
    await linkClaimSource({
      claimId: c.id,
      sourceId,
      evidenceExcerpt: "68%",
      pageNumber: "4",
      evidenceStrength: "STRONG",
    });
    await setClaimStatus(c.id, "VERIFIED");

    const r = await recalculateBrandScore(brandId);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // disclosure 100, evidence 100, verification 20 (self-declared), targets 0 (not found), accessibility 100
    expect(r.snapshot.overallScore).toBeCloseTo(25 + 25 + 4 + 0 + 15, 6);
    expect(r.snapshot.claimCount).toBe(1);
    expect(r.snapshot.sourceCount).toBe(4);
    expect(r.snapshot.methodologyVersion).toBeTruthy();
    expect(r.snapshot.confidenceLevel).toMatch(/HIGH|MEDIUM|LOW/);
  });

  it("candidate claims must not affect the score, and old snapshots are never modified", async () => {
    const [first] = await getScoreHistory(brandId);
    await createClaim(claimInput("Candidate claim with terrible transparency.", 0));

    const r = await recalculateBrandScore(brandId);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.snapshot.overallScore).toBe(first.overallScore);
    expect(r.snapshot.claimCount).toBe(first.claimCount);
    expect(r.snapshot.id).not.toBe(first.id);

    const history = await getScoreHistory(brandId);
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual(first);
  });

  it("a newly verified low-transparency claim lowers the next snapshot", async () => {
    const c = await createClaim(claimInput("Eco-friendly products.", 0));
    await setClaimStatus(c.id, "VERIFIED");
    const r = await recalculateBrandScore(brandId);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.snapshot.evidenceScore).toBeCloseTo(50, 6);
    expect(await getScoreHistory(brandId)).toHaveLength(3);
  });
});
