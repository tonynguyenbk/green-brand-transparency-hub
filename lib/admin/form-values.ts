import type {
  AccessibilityAudit,
  Brand,
  Certification,
  Claim,
  Source,
  SustainabilityTarget,
} from "@prisma/client";
import type {
  AuditFormValues,
  BrandFormValues,
  CertificationFormValues,
  ClaimFormValues,
  SourceFormValues,
  TargetFormValues,
} from "@/components/admin/entity-forms";
import { toDateInput } from "@/lib/utils/format";

const s = (v: string | number | null | undefined) =>
  v === null || v === undefined ? "" : String(v);

export function brandToForm(b?: Brand | null): BrandFormValues {
  return {
    name: s(b?.name),
    slug: s(b?.slug),
    industryId: s(b?.industryId),
    country: s(b?.country),
    website: s(b?.website),
    logoUrl: s(b?.logoUrl),
    description: s(b?.description),
    isFictional: b?.isFictional ?? false,
    status: b?.status ?? "DRAFT",
    targetsDataState: b?.targetsDataState ?? "PENDING_REVIEW",
    lastReviewedAt: toDateInput(b?.lastReviewedAt),
  };
}

export function sourceToForm(x?: Source | null, brandId = ""): SourceFormValues {
  return {
    brandId: x?.brandId ?? brandId,
    title: s(x?.title),
    sourceType: x?.sourceType ?? "SUSTAINABILITY_REPORT",
    publisher: s(x?.publisher),
    url: s(x?.url),
    publicationDate: toDateInput(x?.publicationDate),
    accessedAt: toDateInput(x?.accessedAt ?? (x ? null : new Date())),
    verificationLevel: x?.verificationLevel ?? "SELF_DECLARED",
    archivedUrl: s(x?.archivedUrl),
    notes: s(x?.notes),
    status: x?.status ?? "IN_REVIEW",
  };
}

export function claimToForm(c?: Claim | null, brandId = ""): ClaimFormValues {
  return {
    brandId: c?.brandId ?? brandId,
    claimText: s(c?.claimText),
    claimCategory: c?.claimCategory ?? "GENERAL",
    claimDate: toDateInput(c?.claimDate),
    specificityScore: s(c?.specificityScore),
    evidenceScore: s(c?.evidenceScore),
    measurabilityScore: s(c?.measurabilityScore),
    verificationScore: s(c?.verificationScore),
    contextScore: s(c?.contextScore),
    methodologyNote: s(c?.methodologyNote),
    verificationNote: s(c?.verificationNote),
    reviewerNotes: s(c?.reviewerNotes),
    status: c?.status ?? "CANDIDATE",
  };
}

export function certificationToForm(
  c?: Certification | null,
  brandId = "",
): CertificationFormValues {
  return {
    brandId: c?.brandId ?? brandId,
    name: s(c?.name),
    certificationBody: s(c?.certificationBody),
    scope: s(c?.scope),
    validFrom: toDateInput(c?.validFrom),
    validTo: toDateInput(c?.validTo),
    sourceId: s(c?.sourceId),
    verificationStatus: c?.verificationStatus ?? "PENDING_REVIEW",
  };
}

export function targetToForm(t?: SustainabilityTarget | null, brandId = ""): TargetFormValues {
  return {
    brandId: t?.brandId ?? brandId,
    title: s(t?.title),
    category: t?.category ?? "GENERAL",
    metric: s(t?.metric),
    baselineValue: s(t?.baselineValue),
    baselineYear: s(t?.baselineYear),
    targetValue: s(t?.targetValue),
    targetYear: s(t?.targetYear),
    latestProgress: s(t?.latestProgress),
    progressYear: s(t?.progressYear),
    isSpecific: t?.isSpecific ?? false,
    hasHistoricalData: t?.hasHistoricalData ?? false,
    verificationStatus: t?.verificationStatus ?? "PENDING_REVIEW",
    sourceId: s(t?.sourceId),
  };
}

export function auditToForm(a?: AccessibilityAudit | null, brandId = ""): AuditFormValues {
  return {
    brandId: a?.brandId ?? brandId,
    clickCount: s(a?.clickCount),
    searchabilityScore: s(a?.searchabilityScore),
    readabilityScore: s(a?.readabilityScore),
    evidenceLinkageScore: s(a?.evidenceLinkageScore),
    notes: s(a?.notes),
    reviewedAt: toDateInput(a?.reviewedAt ?? new Date()),
  };
}
