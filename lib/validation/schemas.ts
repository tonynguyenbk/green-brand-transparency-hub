import { z } from "zod";
import {
  BRAND_STATUSES,
  CLAIM_STATUSES,
  DISCLOSURE_LEVELS,
  DISCLOSURE_TOPICS,
  EVIDENCE_STRENGTHS,
  MISSING_DATA_STATES,
  REVIEW_STATUSES,
  RISK_LEVELS,
  SOURCE_TYPES,
  SUSTAINABILITY_CATEGORIES,
  VERIFICATION_LEVELS,
  VERIFICATION_STATUSES,
} from "./enums";

/**
 * Zod schemas for every user-controlled input. They accept both form values
 * (strings, "" for empty) and JSON API payloads (numbers / null), and are
 * always re-applied on the server — client validation is only a convenience.
 */

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const idSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid identifier");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const requiredText = (min: number, max: number) =>
  z.string().trim().min(min, `At least ${min} characters`).max(max);

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : emptyToNull(v)),
    z.string().max(max, `At most ${max} characters`).nullable(),
  );

/** http(s) URLs only — javascript:, data: etc. are rejected. */
const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : emptyToNull(v)),
  z
    .string()
    .max(2048)
    .url("Enter a valid URL")
    .refine((u) => /^https?:\/\//i.test(u), "URL must start with http:// or https://")
    .nullable(),
);

const optionalDate = z.preprocess(
  (v) => {
    const x = emptyToNull(v);
    if (x === null) return null;
    if (x instanceof Date) return x;
    if (typeof x === "string" || typeof x === "number") return new Date(x);
    return x;
  },
  z
    .date({ error: "Enter a valid date" })
    .refine((d) => !Number.isNaN(d.getTime()), "Enter a valid date")
    .refine((d) => d.getFullYear() >= 1900 && d.getFullYear() <= 2100, "Date out of range")
    .nullable(),
);

const optionalNumber = (min: number, max: number, int = false) =>
  z.preprocess(
    (v) => {
      const x = emptyToNull(v);
      if (x === null) return null;
      return typeof x === "string" ? Number(x) : x;
    },
    (int ? z.number().int("Whole numbers only") : z.number())
      .min(min, `Minimum ${min}`)
      .max(max, `Maximum ${max}`)
      .nullable(),
  );

const optionalId = z.preprocess(emptyToNull, idSchema.nullable());

const boolish = z.preprocess(
  (v) => (typeof v === "string" ? v === "true" || v === "on" : Boolean(v)),
  z.boolean(),
);

/** 0–5 reviewer rubric; null = not yet assessed (never coerced to 0). */
const rubric = optionalNumber(0, 5, true);
const year = optionalNumber(1900, 2100, true);

// ---------------------------------------------------------------------------

export const brandSchema = z.object({
  name: requiredText(2, 120),
  slug: slugSchema,
  industryId: idSchema,
  country: optionalText(80),
  website: optionalUrl,
  logoUrl: optionalUrl,
  description: optionalText(2000),
  isFictional: boolish,
  status: z.enum(BRAND_STATUSES),
  targetsDataState: z.enum(MISSING_DATA_STATES),
  lastReviewedAt: optionalDate,
});
export type BrandInput = z.output<typeof brandSchema>;

export const sourceSchema = z.object({
  brandId: idSchema,
  title: requiredText(3, 300),
  sourceType: z.enum(SOURCE_TYPES),
  publisher: optionalText(200),
  url: optionalUrl,
  publicationDate: optionalDate,
  accessedAt: optionalDate,
  verificationLevel: z.enum(VERIFICATION_LEVELS),
  archivedUrl: optionalUrl,
  notes: optionalText(2000),
  status: z.enum(REVIEW_STATUSES),
});
export type SourceInput = z.output<typeof sourceSchema>;

export const claimSchema = z.object({
  brandId: idSchema,
  claimText: requiredText(10, 1000),
  claimCategory: z.enum(SUSTAINABILITY_CATEGORIES),
  claimDate: optionalDate,
  specificityScore: rubric,
  evidenceScore: rubric,
  measurabilityScore: rubric,
  verificationScore: rubric,
  contextScore: rubric,
  methodologyNote: optionalText(2000),
  verificationNote: optionalText(2000),
  reviewerNotes: optionalText(2000),
  status: z.enum(CLAIM_STATUSES).optional(),
  origin: z.string().trim().max(120).optional(),
});
export type ClaimInput = z.output<typeof claimSchema>;

export const claimStatusSchema = z.object({ status: z.enum(CLAIM_STATUSES) });

export const claimSourceLinkSchema = z.object({
  claimId: idSchema,
  sourceId: idSchema,
  evidenceExcerpt: optionalText(2000),
  pageNumber: optionalText(20),
  evidenceStrength: z.enum(EVIDENCE_STRENGTHS),
});
export type ClaimSourceLinkInput = z.output<typeof claimSourceLinkSchema>;

export const certificationSchema = z
  .object({
    brandId: idSchema,
    name: requiredText(2, 200),
    certificationBody: optionalText(200),
    scope: requiredText(3, 500),
    validFrom: optionalDate,
    validTo: optionalDate,
    sourceId: optionalId,
    verificationStatus: z.enum(VERIFICATION_STATUSES),
  })
  .refine((c) => !c.validFrom || !c.validTo || c.validTo >= c.validFrom, {
    message: "Valid-to date must be on or after the valid-from date",
    path: ["validTo"],
  });
export type CertificationInput = z.output<typeof certificationSchema>;

export const targetSchema = z
  .object({
    brandId: idSchema,
    title: requiredText(3, 300),
    category: z.enum(SUSTAINABILITY_CATEGORIES),
    metric: optionalText(120),
    baselineValue: optionalNumber(-1e12, 1e12),
    baselineYear: year,
    targetValue: optionalNumber(-1e12, 1e12),
    targetYear: year,
    latestProgress: optionalNumber(-1e12, 1e12),
    progressYear: year,
    isSpecific: boolish,
    hasHistoricalData: boolish,
    verificationStatus: z.enum(VERIFICATION_STATUSES),
    sourceId: optionalId,
  })
  .refine((t) => !t.baselineYear || !t.targetYear || t.targetYear >= t.baselineYear, {
    message: "Target year must not be earlier than the baseline year",
    path: ["targetYear"],
  });
export type TargetInputData = z.output<typeof targetSchema>;

export const accessibilityAuditSchema = z.object({
  brandId: idSchema,
  clickCount: optionalNumber(1, 50, true),
  searchabilityScore: optionalNumber(0, 3, true),
  readabilityScore: optionalNumber(0, 3, true),
  evidenceLinkageScore: optionalNumber(0, 4, true),
  notes: optionalText(2000),
  reviewedAt: optionalDate,
});
export type AccessibilityAuditInputData = z.output<typeof accessibilityAuditSchema>;

export const disclosureItemSchema = z
  .object({
    topic: z.enum(DISCLOSURE_TOPICS),
    state: z.enum(MISSING_DATA_STATES),
    level: z.preprocess(emptyToNull, z.enum(DISCLOSURE_LEVELS).nullable()),
    notes: optionalText(1000),
  })
  .refine((d) => d.state !== "AVAILABLE" || d.level === "PARTIAL" || d.level === "CLEAR", {
    message: "Choose partial or clear when information is available",
    path: ["level"],
  });

export const disclosureSchema = z.object({
  brandId: idSchema,
  items: z.array(disclosureItemSchema).max(DISCLOSURE_TOPICS.length),
});
export type DisclosureInput = z.output<typeof disclosureSchema>;

const weight = z.preprocess(
  (v) => (typeof v === "string" ? Number(v) : v),
  z.number().min(0).max(1),
);

export const methodologySchema = z
  .object({
    version: z
      .string()
      .trim()
      .regex(/^\d+\.\d+(\.\d+)?$/, "Use a version such as 1.1"),
    title: requiredText(3, 200),
    description: requiredText(10, 5000),
    disclosure: weight,
    evidence: weight,
    verification: weight,
    targets: weight,
    accessibility: weight,
  })
  .refine(
    (m) =>
      Math.abs(m.disclosure + m.evidence + m.verification + m.targets + m.accessibility - 1) <
      0.001,
    { message: "Weights must sum to 1.0", path: ["accessibility"] },
  );
export type MethodologyInput = z.output<typeof methodologySchema>;

export const claimCheckerSchema = z.object({
  claim: z
    .string()
    .trim()
    .min(3, "Enter a claim to analyse")
    .max(1000, "Claims are limited to 1,000 characters"),
});

export const brandDirectoryQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  industry: slugSchema.optional().catch(undefined),
  minScore: z.coerce.number().min(0).max(100).optional().catch(undefined),
  maxScore: z.coerce.number().min(0).max(100).optional().catch(undefined),
  risk: z.enum(RISK_LEVELS).optional().catch(undefined),
  sort: z.enum(["score_desc", "score_asc", "reviewed_desc", "alpha"]).optional().catch(undefined),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  password: z.string().min(1, "Password is required").max(200),
});

export const analyticsEventSchema = z.object({
  name: z.enum([
    "brand_search",
    "brand_view",
    "claim_expand",
    "evidence_view",
    "evidence_click",
    "compare_brand",
    "claim_checker_submit",
    "methodology_view",
  ]),
  properties: z
    .record(z.string(), z.union([z.string().max(200), z.number(), z.boolean(), z.null()]))
    .optional(),
});

/** Flatten Zod issues into { field: message } for forms and API responses. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
