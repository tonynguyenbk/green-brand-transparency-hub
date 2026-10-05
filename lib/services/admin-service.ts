import type { BrandStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { methodologyConfigSnapshot } from "@/lib/scoring";
import type { BrandInput, MethodologyInput } from "@/lib/validation/schemas";

// --- Brands ----------------------------------------------------------------

export function listBrandsAdmin() {
  return prisma.brand.findMany({
    include: {
      industry: true,
      scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
      _count: { select: { claims: true, sources: true } },
    },
    orderBy: { name: "asc" },
  });
}

export function getBrandAdmin(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      industry: true,
      scores: { orderBy: { calculatedAt: "desc" } },
      claims: { orderBy: { updatedAt: "desc" } },
      sources: { orderBy: { updatedAt: "desc" } },
      certifications: true,
      targets: true,
      accessibilityAudits: { orderBy: { reviewedAt: "desc" } },
    },
  });
}

export function getBrandBySlugAny(slug: string) {
  return prisma.brand.findUnique({ where: { slug }, include: { industry: true } });
}

export function listBrandOptionsAdmin() {
  return prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export function createBrand(input: BrandInput) {
  return prisma.brand.create({ data: input });
}

export function updateBrand(id: string, input: BrandInput) {
  return prisma.brand.update({ where: { id }, data: input });
}

export function setBrandStatus(id: string, status: BrandStatus) {
  return prisma.brand.update({
    where: { id },
    data: { status, ...(status === "PUBLISHED" ? { lastReviewedAt: new Date() } : {}) },
  });
}

export function deleteBrand(id: string) {
  return prisma.brand.delete({ where: { id } });
}

export function listIndustriesAdmin() {
  return prisma.industry.findMany({ orderBy: { name: "asc" } });
}

// --- Methodology -----------------------------------------------------------

export function listMethodologyVersions() {
  return prisma.methodologyVersion.findMany({ orderBy: { createdAt: "desc" } });
}

/** New versions are created inactive; activating one deactivates the others. */
export function createMethodologyVersion(input: MethodologyInput) {
  const base = methodologyConfigSnapshot();
  return prisma.methodologyVersion.create({
    data: {
      version: input.version,
      title: input.title,
      description: input.description,
      active: false,
      weightsJson: {
        ...base,
        version: input.version,
        overallWeights: {
          disclosure: input.disclosure,
          evidence: input.evidence,
          verification: input.verification,
          targets: input.targets,
          accessibility: input.accessibility,
        },
      },
    },
  });
}

export async function activateMethodologyVersion(id: string) {
  await prisma.$transaction([
    prisma.methodologyVersion.updateMany({ where: { active: true }, data: { active: false } }),
    prisma.methodologyVersion.update({
      where: { id },
      data: { active: true, publishedAt: new Date() },
    }),
  ]);
}

// --- Dashboard -------------------------------------------------------------

export async function getAdminDashboard() {
  const [brands, pendingClaims, sourceCount, recentScores, claimsByStatus] = await Promise.all([
    prisma.brand.findMany({
      include: {
        scores: { orderBy: { calculatedAt: "desc" }, take: 1 },
        _count: {
          select: { sources: true, claims: true, accessibilityAudits: true, disclosureItems: true },
        },
        claims: { select: { status: true, _count: { select: { claimSources: true } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.claim.findMany({
      where: { status: { in: ["CANDIDATE", "IN_REVIEW"] } },
      include: { brand: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.source.count(),
    prisma.brandScore.findMany({
      include: { brand: { select: { name: true } } },
      orderBy: { calculatedAt: "desc" },
      take: 8,
    }),
    prisma.claim.groupBy({ by: ["status"], _count: true }),
  ]);

  const warnings: { brand: string; brandId: string; message: string }[] = [];
  for (const b of brands) {
    const verified = b.claims.filter((c) => c.status === "VERIFIED" || c.status === "PUBLISHED");
    if (b.status === "PUBLISHED" && b.scores.length === 0) {
      warnings.push({
        brand: b.name,
        brandId: b.id,
        message: "Published without a calculated score.",
      });
    }
    if (b._count.accessibilityAudits === 0) {
      warnings.push({ brand: b.name, brandId: b.id, message: "No accessibility audit recorded." });
    }
    if (b._count.disclosureItems < 7) {
      warnings.push({ brand: b.name, brandId: b.id, message: "Disclosure checklist incomplete." });
    }
    const unlinked = verified.filter((c) => c._count.claimSources === 0).length;
    if (unlinked > 0) {
      warnings.push({
        brand: b.name,
        brandId: b.id,
        message: `${unlinked} verified claim(s) have no linked source.`,
      });
    }
  }

  return {
    brands,
    pendingClaims,
    sourceCount,
    recentScores,
    claimsByStatus: Object.fromEntries(claimsByStatus.map((g) => [g.status, g._count])) as Record<
      string,
      number
    >,
    warnings,
  };
}
