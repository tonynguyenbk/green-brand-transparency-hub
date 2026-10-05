import { describe, expect, it } from "vitest";
import { checkClaim } from "@/lib/claims/checker";

describe("checkClaim", () => {
  it("flags a vague claim as high transparency risk", () => {
    const r = checkClaim("Our packaging is 100% eco-friendly.");
    expect(r.riskLevel).toBe("HIGH");
    expect(r.detectedBroadTerms).toContain("eco-friendly");
    // "100%" modifies a broad term, so it is not counted as a measurable metric
    expect(r.detectedMeasurableInformation.map((d) => d.signal)).not.toContain("percentage");
    expect(r.possibleMissingContext).toEqual(
      expect.arrayContaining([
        "Material composition",
        "Recycled percentage",
        "Certification",
        "Lifecycle scope",
      ]),
    );
    expect(r.issues[0]).toBe('"Eco-friendly" is a broad environmental statement.');
  });

  it("rates a specific, verified, baselined claim as low risk", () => {
    const r = checkClaim(
      "This T-shirt contains 75% post-consumer recycled polyester, verified by an independent certification body, compared with a 2024 baseline. Source: 2025 sustainability report.",
    );
    expect(r.detectedBroadTerms).toEqual([]);
    expect(r.riskLevel).toBe("LOW");
    const signals = r.detectedMeasurableInformation.map((d) => d.signal);
    expect(signals).toEqual(
      expect.arrayContaining([
        "percentage",
        "year",
        "baseline",
        "certification",
        "source",
        "scope",
      ]),
    );
  });

  it("does not flag 'greenhouse' as the broad term 'green'", () => {
    const r = checkClaim("We reduced Scope 1 greenhouse gas emissions by 1,200 tCO2e in 2025.");
    expect(r.detectedBroadTerms).not.toContain("green");
  });

  it("detects measurement units", () => {
    const r = checkClaim("Our stores used 4,500 MWh of renewable electricity in 2025.");
    expect(r.detectedMeasurableInformation.map((d) => d.signal)).toContain("measurement");
  });

  it("never uses accusatory language", () => {
    const r = checkClaim("Sustainable, natural, clean and green.");
    const text = [...r.issues, ...r.explanation, ...r.notes].join(" ").toLowerCase();
    expect(text).not.toMatch(/greenwash(ing|er)|\bfake\b|\blie\b|deceptive/);
    expect(r.riskLevel).toBe("HIGH");
  });

  it("lists missing evidence categories", () => {
    const r = checkClaim("Our products are eco-friendly.");
    expect(r.missingEvidenceCategories).toEqual(
      expect.arrayContaining([
        "Certification or independent verification",
        "Baseline year or comparison point",
        "Measurement methodology",
      ]),
    );
  });
});
