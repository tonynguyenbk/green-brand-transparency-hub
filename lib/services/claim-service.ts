import type { Claim, ClaimStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { calculateClaimRisk } from "@/lib/scoring";
import type { ClaimInput, ClaimSourceLinkInput } from "@/lib/validation/schemas";

/** Derive the stored riskScore / riskLevel from the claim's rubric components. */
export function deriveClaimRisk(c: {
  specificityScore: number | null;
  evidenceScore: number | null;
  measurabilityScore: number | null;
  verificationScore: number | null;
  contextScore: number | null;
}): Pick<Claim, "riskScore" | "riskLevel"> {
  const r = calculateClaimRisk({
    specificity: c.specificityScore,
    evidence: c.evidenceScore,
    measurability: c.measurabilityScore,
    verification: c.verificationScore,
    context: c.contextScore,
  });
  return { riskScore: r?.riskScore ?? null, riskLevel: r?.riskLevel ?? null };
}

export async function listClaims(filter: { brandId?: string; status?: ClaimStatus } = {}) {
  return prisma.claim.findMany({
    where: { brandId: filter.brandId, status: filter.status },
    include: {
      brand: { select: { name: true, slug: true } },
      _count: { select: { claimSources: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function listPublicClaimsForBrand(brandId: string) {
  return prisma.claim.findMany({
    where: { brandId, status: { in: ["VERIFIED", "PUBLISHED"] }, brand: { status: "PUBLISHED" } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getClaim(id: string) {
  return prisma.claim.findUnique({
    where: { id },
    include: {
      brand: { select: { id: true, name: true, slug: true, status: true } },
      claimSources: { include: { source: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

function claimData(input: ClaimInput) {
  return {
    claimText: input.claimText,
    claimCategory: input.claimCategory,
    claimDate: input.claimDate,
    specificityScore: input.specificityScore,
    evidenceScore: input.evidenceScore,
    measurabilityScore: input.measurabilityScore,
    verificationScore: input.verificationScore,
    contextScore: input.contextScore,
    methodologyNote: input.methodologyNote,
    verificationNote: input.verificationNote,
    reviewerNotes: input.reviewerNotes,
    ...deriveClaimRisk(input),
  };
}

/** New claims always start as CANDIDATE unless an admin explicitly sets another status. */
export async function createClaim(input: ClaimInput) {
  assertReviewable(input.status, input);
  return prisma.claim.create({
    data: {
      ...claimData(input),
      brandId: input.brandId,
      status: input.status ?? "CANDIDATE",
      origin: input.origin ?? "manual",
      reviewedAt: isReviewed(input.status) ? new Date() : null,
    },
  });
}

export async function updateClaim(id: string, input: ClaimInput) {
  const existing = await prisma.claim.findUniqueOrThrow({ where: { id } });
  const status = input.status ?? existing.status;
  assertReviewable(status, input);
  return prisma.claim.update({
    where: { id },
    data: {
      ...claimData(input),
      status,
      reviewedAt:
        status !== existing.status && isReviewed(status) ? new Date() : existing.reviewedAt,
    },
  });
}

export async function setClaimStatus(id: string, status: ClaimStatus) {
  const existing = await prisma.claim.findUniqueOrThrow({ where: { id } });
  assertReviewable(status, existing);
  return prisma.claim.update({
    where: { id },
    data: { status, reviewedAt: isReviewed(status) ? new Date() : existing.reviewedAt },
  });
}

export async function deleteClaim(id: string) {
  return prisma.claim.delete({ where: { id } });
}

export async function linkClaimSource(input: ClaimSourceLinkInput) {
  const [claim, source] = await Promise.all([
    prisma.claim.findUniqueOrThrow({ where: { id: input.claimId } }),
    prisma.source.findUniqueOrThrow({ where: { id: input.sourceId } }),
  ]);
  if (claim.brandId !== source.brandId) {
    throw new ClaimReviewError("A claim can only be linked to sources of the same brand.");
  }
  const data: Prisma.ClaimSourceUncheckedCreateInput = {
    claimId: input.claimId,
    sourceId: input.sourceId,
    evidenceExcerpt: input.evidenceExcerpt,
    pageNumber: input.pageNumber,
    evidenceStrength: input.evidenceStrength,
  };
  return prisma.claimSource.upsert({
    where: { claimId_sourceId: { claimId: input.claimId, sourceId: input.sourceId } },
    create: data,
    update: data,
  });
}

export async function unlinkClaimSource(id: string) {
  return prisma.claimSource.delete({ where: { id } });
}

/** A claim can only enter a scorable status once every rubric component has been assessed. */
function assertReviewable(
  status: ClaimStatus | undefined,
  rubric: Parameters<typeof deriveClaimRisk>[0],
) {
  if (isReviewed(status) && deriveClaimRisk(rubric).riskScore === null) {
    throw new ClaimReviewError(
      "All five rubric components must be assessed before a claim can be verified.",
    );
  }
}

function isReviewed(status: ClaimStatus | undefined) {
  return status === "VERIFIED" || status === "PUBLISHED";
}

export class ClaimReviewError extends Error {}
