import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/api/rate-limit";
import { correctionReportSchema } from "@/lib/validation/schemas";

const base = {
  brandId: "brand1",
  claimId: "",
  reportType: "MISSING_SOURCE",
  message: "The 2025 report on page 12 contains the missing baseline figure.",
  sourceUrl: "",
  reporterRole: "CONSUMER",
  reporterEmail: "",
  website: "",
};

describe("correctionReportSchema", () => {
  it("normalises optional fields to null", () => {
    const r = correctionReportSchema.parse(base);
    expect(r.claimId).toBeNull();
    expect(r.sourceUrl).toBeNull();
    expect(r.reporterEmail).toBeNull();
  });

  it("rejects a filled honeypot, short messages, bad e-mails and non-http URLs", () => {
    expect(correctionReportSchema.safeParse({ ...base, website: "http://spam" }).success).toBe(
      false,
    );
    expect(correctionReportSchema.safeParse({ ...base, message: "too short" }).success).toBe(false);
    expect(
      correctionReportSchema.safeParse({ ...base, reporterEmail: "not-an-email" }).success,
    ).toBe(false);
    expect(
      correctionReportSchema.safeParse({ ...base, sourceUrl: "javascript:alert(1)" }).success,
    ).toBe(false);
  });
});

describe("rateLimit", () => {
  it("allows up to the limit within a window, then resets", () => {
    const key = `test-${Math.random()}`;
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 1000, t0).allowed).toBe(true);
    expect(rateLimit(key, 3, 1000, t0 + 10).allowed).toBe(false);
    expect(rateLimit(key, 3, 1000, t0 + 1001).allowed).toBe(true);
  });
});
