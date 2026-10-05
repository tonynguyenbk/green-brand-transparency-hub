import { prisma } from "@/lib/db/prisma";
import { DISCLOSURE_TOPICS } from "@/lib/validation/enums";
import type {
  AccessibilityAuditInputData,
  CertificationInput,
  DisclosureInput,
  SourceInput,
  TargetInputData,
} from "@/lib/validation/schemas";

// --- Sources ---------------------------------------------------------------

export function listSources(brandId?: string) {
  return prisma.source.findMany({
    where: { brandId },
    include: { brand: { select: { name: true } }, _count: { select: { claimSources: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export function listPublicSourcesForBrand(brandId: string) {
  return prisma.source.findMany({
    where: { brandId, status: { in: ["VERIFIED", "PUBLISHED"] }, brand: { status: "PUBLISHED" } },
    orderBy: { publicationDate: "desc" },
  });
}

export function getSource(id: string) {
  return prisma.source.findUnique({
    where: { id },
    include: { brand: { select: { id: true, name: true } } },
  });
}

export function createSource(input: SourceInput) {
  return prisma.source.create({ data: input });
}

export function updateSource(id: string, input: SourceInput) {
  return prisma.source.update({ where: { id }, data: input });
}

export function deleteSource(id: string) {
  return prisma.source.delete({ where: { id } });
}

// --- Certifications --------------------------------------------------------

export function listCertifications(brandId?: string) {
  return prisma.certification.findMany({
    where: { brandId },
    include: { brand: { select: { name: true } }, source: { select: { title: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export function getCertification(id: string) {
  return prisma.certification.findUnique({ where: { id } });
}

async function assertSourceBelongsToBrand(sourceId: string | null, brandId: string) {
  if (!sourceId) return;
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    select: { brandId: true },
  });
  if (!source || source.brandId !== brandId) {
    throw new EvidenceError("The selected source does not belong to this brand.");
  }
}

export async function createCertification(input: CertificationInput) {
  await assertSourceBelongsToBrand(input.sourceId, input.brandId);
  return prisma.certification.create({ data: input });
}

export async function updateCertification(id: string, input: CertificationInput) {
  await assertSourceBelongsToBrand(input.sourceId, input.brandId);
  return prisma.certification.update({ where: { id }, data: input });
}

export function deleteCertification(id: string) {
  return prisma.certification.delete({ where: { id } });
}

// --- Targets ---------------------------------------------------------------

export function listTargets(brandId?: string) {
  return prisma.sustainabilityTarget.findMany({
    where: { brandId },
    include: { brand: { select: { name: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export function getTarget(id: string) {
  return prisma.sustainabilityTarget.findUnique({ where: { id } });
}

export async function createTarget(input: TargetInputData) {
  await assertSourceBelongsToBrand(input.sourceId, input.brandId);
  return prisma.sustainabilityTarget.create({ data: input });
}

export async function updateTarget(id: string, input: TargetInputData) {
  await assertSourceBelongsToBrand(input.sourceId, input.brandId);
  return prisma.sustainabilityTarget.update({ where: { id }, data: input });
}

export function deleteTarget(id: string) {
  return prisma.sustainabilityTarget.delete({ where: { id } });
}

// --- Accessibility audits --------------------------------------------------

export function listAudits(brandId?: string) {
  return prisma.accessibilityAudit.findMany({
    where: { brandId },
    include: { brand: { select: { name: true } } },
    orderBy: [{ reviewedAt: "desc" }],
  });
}

export function getAudit(id: string) {
  return prisma.accessibilityAudit.findUnique({ where: { id } });
}

export function createAudit(input: AccessibilityAuditInputData) {
  return prisma.accessibilityAudit.create({
    data: { ...input, reviewedAt: input.reviewedAt ?? new Date() },
  });
}

export function updateAudit(id: string, input: AccessibilityAuditInputData) {
  return prisma.accessibilityAudit.update({
    where: { id },
    data: { ...input, reviewedAt: input.reviewedAt ?? undefined },
  });
}

export function deleteAudit(id: string) {
  return prisma.accessibilityAudit.delete({ where: { id } });
}

// --- Disclosure checklist --------------------------------------------------

export async function getDisclosureItems(brandId: string) {
  const rows = await prisma.disclosureItem.findMany({ where: { brandId } });
  const byTopic = new Map(rows.map((r) => [r.topic, r]));
  return DISCLOSURE_TOPICS.map(
    (topic) =>
      byTopic.get(topic) ?? { topic, state: "PENDING_REVIEW" as const, level: null, notes: null },
  );
}

export async function saveDisclosureItems(input: DisclosureInput) {
  await prisma.$transaction(
    input.items.map((item) =>
      prisma.disclosureItem.upsert({
        where: { brandId_topic: { brandId: input.brandId, topic: item.topic } },
        create: {
          brandId: input.brandId,
          topic: item.topic,
          state: item.state,
          level: item.state === "AVAILABLE" ? item.level : null,
          notes: item.notes,
        },
        update: {
          state: item.state,
          level: item.state === "AVAILABLE" ? item.level : null,
          notes: item.notes,
        },
      }),
    ),
  );
}

export class EvidenceError extends Error {}
