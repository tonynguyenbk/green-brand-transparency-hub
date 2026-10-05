import type { CorrectionStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CorrectionReportInput } from "@/lib/validation/schemas";

export class CorrectionError extends Error {}

/**
 * Store a public correction report. Only published brands accept reports,
 * and a referenced claim must belong to that brand and be publicly visible.
 * Reports never change brand data or scores by themselves.
 */
export async function submitCorrectionReport(input: CorrectionReportInput) {
  const brand = await prisma.brand.findFirst({ where: { id: input.brandId, status: "PUBLISHED" } });
  if (!brand) throw new CorrectionError("This brand profile is not available.");
  if (input.claimId) {
    const claim = await prisma.claim.findFirst({
      where: { id: input.claimId, brandId: brand.id, status: { in: ["VERIFIED", "PUBLISHED"] } },
    });
    if (!claim) throw new CorrectionError("The selected claim does not belong to this brand.");
  }
  return prisma.correctionReport.create({
    data: {
      brandId: brand.id,
      claimId: input.claimId,
      reportType: input.reportType,
      message: input.message,
      sourceUrl: input.sourceUrl,
      reporterRole: input.reporterRole,
      reporterEmail: input.reporterEmail,
    },
    select: { id: true },
  });
}

export function listCorrectionReports(status?: CorrectionStatus) {
  return prisma.correctionReport.findMany({
    where: { status },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      claim: { select: { id: true, claimText: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getCorrectionReport(id: string) {
  return prisma.correctionReport.findUnique({
    where: { id },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      claim: { select: { id: true, claimText: true } },
    },
  });
}

export function countOpenCorrections() {
  return prisma.correctionReport.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } });
}

export function reviewCorrectionReport(
  id: string,
  status: CorrectionStatus,
  resolutionNote: string | null,
) {
  const closed = status === "RESOLVED" || status === "REJECTED";
  return prisma.correctionReport.update({
    where: { id },
    data: { status, resolutionNote, resolvedAt: closed ? new Date() : null },
  });
}
