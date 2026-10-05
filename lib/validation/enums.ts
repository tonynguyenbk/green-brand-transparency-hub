/**
 * Enum value lists shared by server and client code. They are declared here
 * (instead of importing runtime values from @prisma/client) so client bundles
 * never pull in Prisma. The type-level checks below fail compilation if the
 * lists drift from the Prisma schema.
 */
import type {
  BrandStatus,
  ClaimStatus,
  CorrectionStatus,
  CorrectionType,
  ReporterRole,
  DisclosureLevel,
  DisclosureTopic,
  EvidenceStrength,
  MissingDataState,
  ReviewStatus,
  RiskLevel,
  SourceType,
  SustainabilityCategory,
  VerificationLevel,
  VerificationStatus,
} from "@prisma/client";

export const BRAND_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
] as const satisfies readonly BrandStatus[];
export const CLAIM_STATUSES = [
  "CANDIDATE",
  "IN_REVIEW",
  "VERIFIED",
  "PUBLISHED",
  "ARCHIVED",
] as const satisfies readonly ClaimStatus[];
export const REVIEW_STATUSES = [
  "CANDIDATE",
  "IN_REVIEW",
  "VERIFIED",
  "PUBLISHED",
  "ARCHIVED",
] as const satisfies readonly ReviewStatus[];
export const RISK_LEVELS = ["LOW", "MODERATE", "HIGH"] as const satisfies readonly RiskLevel[];
export const VERIFICATION_STATUSES = [
  "VERIFIED",
  "PARTIALLY_VERIFIED",
  "SELF_DECLARED",
  "UNVERIFIED",
  "EXPIRED",
  "PENDING_REVIEW",
] as const satisfies readonly VerificationStatus[];
export const SOURCE_TYPES = [
  "SUSTAINABILITY_REPORT",
  "ESG_REPORT",
  "ANNUAL_REPORT",
  "SUSTAINABILITY_WEBPAGE",
  "PRODUCT_PAGE",
  "REGULATORY_FILING",
  "CLIMATE_REPORT",
  "CERTIFICATION_DATABASE",
  "ASSURANCE_STATEMENT",
  "THIRD_PARTY_AUDIT",
  "ACADEMIC_PUBLICATION",
  "NGO_REPORT",
  "GOVERNMENT_PUBLICATION",
  "NEWS_ARTICLE",
  "MARKETING_MATERIAL",
  "OTHER",
] as const satisfies readonly SourceType[];
export const VERIFICATION_LEVELS = [
  "SELF_DECLARED",
  "EXTERNAL_REFERENCE",
  "RECOGNIZED_CERTIFICATION",
  "INDEPENDENT_ASSURANCE",
] as const satisfies readonly VerificationLevel[];
export const EVIDENCE_STRENGTHS = [
  "STRONG",
  "MODERATE",
  "LIMITED",
  "NOT_FOUND",
] as const satisfies readonly EvidenceStrength[];
export const MISSING_DATA_STATES = [
  "AVAILABLE",
  "NOT_AVAILABLE",
  "NOT_FOUND",
  "NOT_APPLICABLE",
  "PENDING_REVIEW",
] as const satisfies readonly MissingDataState[];
export const DISCLOSURE_LEVELS = [
  "ABSENT",
  "PARTIAL",
  "CLEAR",
] as const satisfies readonly DisclosureLevel[];
export const DISCLOSURE_TOPICS = [
  "SUSTAINABILITY_REPORT",
  "CARBON_EMISSIONS",
  "MATERIAL_SOURCING",
  "SUPPLY_CHAIN",
  "WASTE_RECYCLING",
  "WATER_RESOURCE_USE",
  "METHODOLOGY",
] as const satisfies readonly DisclosureTopic[];
export const SUSTAINABILITY_CATEGORIES = [
  "MATERIALS",
  "PACKAGING",
  "CARBON_CLIMATE",
  "ENERGY",
  "WATER",
  "WASTE_CIRCULARITY",
  "SUPPLY_CHAIN",
  "CHEMICALS_INGREDIENTS",
  "BIODIVERSITY",
  "GENERAL",
  "OTHER",
] as const satisfies readonly SustainabilityCategory[];

export const CORRECTION_TYPES = [
  "MISSING_SOURCE",
  "INCORRECT_SOURCE",
  "UPDATED_DATA",
  "CLARIFICATION",
  "OTHER",
] as const satisfies readonly CorrectionType[];
export const CORRECTION_STATUSES = [
  "OPEN",
  "IN_REVIEW",
  "RESOLVED",
  "REJECTED",
] as const satisfies readonly CorrectionStatus[];
export const REPORTER_ROLES = [
  "CONSUMER",
  "BRAND_REPRESENTATIVE",
  "RESEARCHER",
  "OTHER",
] as const satisfies readonly ReporterRole[];

// Exhaustiveness checks (compile-time only).
type Exhaustive<All, Listed> = [Exclude<All, Listed>] extends [never] ? true : never;
const _checks: [
  Exhaustive<BrandStatus, (typeof BRAND_STATUSES)[number]>,
  Exhaustive<ClaimStatus, (typeof CLAIM_STATUSES)[number]>,
  Exhaustive<ReviewStatus, (typeof REVIEW_STATUSES)[number]>,
  Exhaustive<RiskLevel, (typeof RISK_LEVELS)[number]>,
  Exhaustive<VerificationStatus, (typeof VERIFICATION_STATUSES)[number]>,
  Exhaustive<SourceType, (typeof SOURCE_TYPES)[number]>,
  Exhaustive<VerificationLevel, (typeof VERIFICATION_LEVELS)[number]>,
  Exhaustive<EvidenceStrength, (typeof EVIDENCE_STRENGTHS)[number]>,
  Exhaustive<MissingDataState, (typeof MISSING_DATA_STATES)[number]>,
  Exhaustive<DisclosureLevel, (typeof DISCLOSURE_LEVELS)[number]>,
  Exhaustive<DisclosureTopic, (typeof DISCLOSURE_TOPICS)[number]>,
  Exhaustive<SustainabilityCategory, (typeof SUSTAINABILITY_CATEGORIES)[number]>,
  Exhaustive<CorrectionType, (typeof CORRECTION_TYPES)[number]>,
  Exhaustive<CorrectionStatus, (typeof CORRECTION_STATUSES)[number]>,
  Exhaustive<ReporterRole, (typeof REPORTER_ROLES)[number]>,
] = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
void _checks;

/** "SUSTAINABILITY_REPORT" → "Sustainability report" */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "—";
  const special: Record<string, string> = {
    ESG_REPORT: "ESG report",
    CARBON_CLIMATE: "Carbon & climate",
    WASTE_CIRCULARITY: "Waste & circularity",
    CHEMICALS_INGREDIENTS: "Chemicals & ingredients",
    WATER_RESOURCE_USE: "Water / resource use",
    WASTE_RECYCLING: "Waste / recycling",
    NOT_FOUND: "Not found",
    NGO_REPORT: "NGO report",
  };
  if (special[value]) return special[value];
  const words = value.toLowerCase().split("_");
  return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(" ");
}

export const MISSING_DATA_STATE_LABELS: Record<(typeof MISSING_DATA_STATES)[number], string> = {
  AVAILABLE: "Available",
  NOT_AVAILABLE: "Not available (brand states it does not report)",
  NOT_FOUND: "Supporting evidence not found",
  NOT_APPLICABLE: "Not applicable",
  PENDING_REVIEW: "Pending review",
};
