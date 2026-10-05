import { describe, expect, it } from "vitest";
import {
  brandSchema,
  certificationSchema,
  claimCheckerSchema,
  claimSchema,
  disclosureSchema,
  methodologySchema,
  sourceSchema,
} from "@/lib/validation/schemas";

const baseClaim = {
  brandId: "abc123",
  claimText: "Our mailers are made from 80% recycled paper.",
  claimCategory: "PACKAGING",
  claimDate: "",
  specificityScore: "",
  evidenceScore: "3",
  measurabilityScore: "",
  verificationScore: "",
  contextScore: "",
  methodologyNote: "",
  verificationNote: "",
  reviewerNotes: "",
};

describe("claimSchema", () => {
  it("keeps unassessed rubric values as null — never 0", () => {
    const r = claimSchema.parse(baseClaim);
    expect(r.specificityScore).toBeNull();
    expect(r.evidenceScore).toBe(3);
    expect(r.claimDate).toBeNull();
    expect(r.methodologyNote).toBeNull();
  });

  it("rejects rubric values outside 0–5 and non-integers", () => {
    expect(claimSchema.safeParse({ ...baseClaim, evidenceScore: "6" }).success).toBe(false);
    expect(claimSchema.safeParse({ ...baseClaim, evidenceScore: "2.5" }).success).toBe(false);
  });

  it("rejects invalid enums and too-short text", () => {
    expect(claimSchema.safeParse({ ...baseClaim, claimCategory: "NOPE" }).success).toBe(false);
    expect(claimSchema.safeParse({ ...baseClaim, claimText: "short" }).success).toBe(false);
  });
});

describe("URL validation", () => {
  const source = {
    brandId: "abc123",
    title: "Impact report",
    sourceType: "SUSTAINABILITY_REPORT",
    publisher: "",
    url: "https://example.com/report.pdf",
    publicationDate: "2026-01-01",
    accessedAt: "",
    verificationLevel: "SELF_DECLARED",
    archivedUrl: "",
    notes: "",
    status: "VERIFIED",
  };

  it("accepts http(s) URLs and coerces dates", () => {
    const r = sourceSchema.parse(source);
    expect(r.publicationDate).toBeInstanceOf(Date);
    expect(r.archivedUrl).toBeNull();
  });

  it("rejects javascript: and other non-http schemes", () => {
    expect(sourceSchema.safeParse({ ...source, url: "javascript:alert(1)" }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...source, url: "ftp://example.com/x" }).success).toBe(false);
  });

  it("rejects invalid dates", () => {
    expect(sourceSchema.safeParse({ ...source, publicationDate: "not-a-date" }).success).toBe(
      false,
    );
  });
});

describe("other schemas", () => {
  it("brand slug must be kebab-case", () => {
    const brand = {
      name: "Test",
      slug: "Bad Slug!",
      industryId: "ind1",
      country: "",
      website: "",
      logoUrl: "",
      description: "",
      isFictional: true,
      status: "DRAFT",
      targetsDataState: "PENDING_REVIEW",
      lastReviewedAt: "",
    };
    expect(brandSchema.safeParse(brand).success).toBe(false);
    expect(brandSchema.safeParse({ ...brand, slug: "good-slug" }).success).toBe(true);
  });

  it("certification validTo must not precede validFrom and scope is required", () => {
    const cert = {
      brandId: "b1",
      name: "Scheme",
      certificationBody: "",
      scope: "Product line A",
      validFrom: "2026-01-01",
      validTo: "2025-01-01",
      sourceId: "",
      verificationStatus: "VERIFIED",
    };
    expect(certificationSchema.safeParse(cert).success).toBe(false);
    expect(
      certificationSchema.safeParse({ ...cert, validTo: "2027-01-01", scope: "" }).success,
    ).toBe(false);
  });

  it("disclosure 'available' requires a partial/clear level", () => {
    const bad = {
      brandId: "b1",
      items: [{ topic: "CARBON_EMISSIONS", state: "AVAILABLE", level: "", notes: "" }],
    };
    expect(disclosureSchema.safeParse(bad).success).toBe(false);
  });

  it("methodology weights must sum to 1", () => {
    const m = {
      version: "1.1",
      title: "Next",
      description: "Adjusted weights.",
      disclosure: 0.3,
      evidence: 0.3,
      verification: 0.2,
      targets: 0.1,
      accessibility: 0.15,
    };
    expect(methodologySchema.safeParse(m).success).toBe(false);
    expect(methodologySchema.safeParse({ ...m, accessibility: 0.1 }).success).toBe(true);
  });

  it("claim checker limits input length", () => {
    expect(claimCheckerSchema.safeParse({ claim: "x".repeat(1001) }).success).toBe(false);
    expect(claimCheckerSchema.safeParse({ claim: "  " }).success).toBe(false);
  });
});
