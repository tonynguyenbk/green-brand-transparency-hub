import {
  calculateClaimRiskFromComponents,
  type ClaimRiskComponents,
} from "@/lib/scoring/claim-risk";
import type { RiskLevelValue } from "@/lib/scoring/types";
import {
  BROAD_TERMS,
  MEASURABLE_SIGNALS,
  MISSING_CATEGORY_LABELS,
  PERCENT_MODIFYING_BROAD_TERM,
  SIGNAL_LABELS,
  type MeasurableSignal,
} from "./dictionary";

export interface ClaimCheckResult {
  claim: string;
  riskScore: number;
  riskLevel: RiskLevelValue;
  transparencyStrength: number;
  components: ClaimRiskComponents;
  detectedBroadTerms: string[];
  detectedMeasurableInformation: { signal: MeasurableSignal; label: string; match: string }[];
  missingEvidenceCategories: string[];
  possibleMissingContext: string[];
  issues: string[];
  explanation: string[];
  suggestedWordingPattern: string;
  notes: string[];
}

/**
 * Rule-based claim analysis (no AI). The text of a claim alone cannot prove
 * or disprove anything — the checker only estimates how much verifiable
 * context the wording itself provides, using the same Green Claim
 * Transparency Risk formula as reviewed claims.
 *
 * Component rules (each 0–100):
 *   specificity   = (broad term ? 20 : 60) + (scope ? 25 : 0) + (quantified ? 15 : 0)
 *   evidence      = (source referenced ? 50 : 0) + (certification ? 50 : 0)
 *   measurability = (quantified ? 60 : 0) + (year ? 20 : 0) + (baseline ? 20 : 0)
 *   verification  = certification / third party mentioned ? 100 : 0
 *   context       = (scope ? 40 : 0) + (baseline ? 30 : 0) + (year or methodology ? 30 : 0)
 * where quantified = percentage or measurement-with-unit, ignoring a
 * percentage that only modifies a broad term ("100% eco-friendly").
 */
export function checkClaim(rawClaim: string): ClaimCheckResult {
  const claim = rawClaim.trim().replace(/\s+/g, " ");

  const detectedBroadTerms = BROAD_TERMS.filter((t) => t.pattern.test(claim));

  const percentOnBroadTerm = PERCENT_MODIFYING_BROAD_TERM.test(claim);
  const detected: ClaimCheckResult["detectedMeasurableInformation"] = [];
  const found: Partial<Record<MeasurableSignal, boolean>> = {};
  for (const signal of Object.keys(MEASURABLE_SIGNALS) as MeasurableSignal[]) {
    const match = claim.match(MEASURABLE_SIGNALS[signal]);
    if (!match) continue;
    if (signal === "percentage" && percentOnBroadTerm && !hasOtherPercentage(claim)) continue;
    found[signal] = true;
    detected.push({ signal, label: SIGNAL_LABELS[signal], match: match[0] });
  }

  const has = (s: MeasurableSignal) => Boolean(found[s]);
  const broad = detectedBroadTerms.length > 0;
  const quantified = has("percentage") || has("measurement");

  const components: ClaimRiskComponents = {
    specificity: Math.min(100, (broad ? 20 : 60) + (has("scope") ? 25 : 0) + (quantified ? 15 : 0)),
    evidence: (has("source") ? 50 : 0) + (has("certification") ? 50 : 0),
    measurability: (quantified ? 60 : 0) + (has("year") ? 20 : 0) + (has("baseline") ? 20 : 0),
    verification: has("certification") ? 100 : 0,
    context:
      (has("scope") ? 40 : 0) +
      (has("baseline") ? 30 : 0) +
      (has("year") || has("methodology") ? 30 : 0),
  };
  const risk = calculateClaimRiskFromComponents(components);

  const missingSignals = (Object.keys(MISSING_CATEGORY_LABELS) as MeasurableSignal[]).filter(
    (s) => {
      if (s === "percentage" || s === "measurement") return !quantified;
      return !has(s);
    },
  );
  // Report the quantification gap once.
  const missingEvidenceCategories = dedupe(
    missingSignals.map((s) =>
      s === "percentage" || s === "measurement"
        ? "Quantified metric (e.g. % recycled content, tCO2e, kWh)"
        : MISSING_CATEGORY_LABELS[s],
    ),
  );

  const possibleMissingContext = dedupe(
    detectedBroadTerms.flatMap((t) => t.suggestedContext),
  ).filter((ctx) => !(quantified && /percentage|quantified/i.test(ctx)));

  const issues: string[] = [];
  const explanation: string[] = [];
  for (const t of detectedBroadTerms) {
    issues.push(`"${capitalise(t.term)}" is a broad environmental statement.`);
  }
  if (detectedBroadTerms.length > 0) {
    explanation.push(
      "Broad environmental terms are not misleading by themselves, but they are difficult for consumers to verify unless they are defined and supported by measurable information.",
    );
  }
  if (percentOnBroadTerm) {
    issues.push("The percentage qualifies a broad term rather than a measurable attribute.");
    explanation.push(
      'A figure such as "100% eco-friendly" does not state what was measured, so it is not counted as quantitative information.',
    );
  }
  if (!quantified) issues.push("No measurable metric was detected.");
  if (!has("source") && !has("certification")) {
    issues.push("No supporting source or verification is referenced in the wording.");
  }
  if (detected.length > 0) {
    explanation.push(
      `The claim includes ${detected.map((d) => d.label.toLowerCase()).join(", ")}, which improves verifiability.`,
    );
  }
  explanation.push(
    `Transparency strength ${Math.round(risk.transparencyStrength)}/100 → risk score ${Math.round(risk.riskScore)} (${risk.riskLevel.toLowerCase()} transparency risk according to the current methodology).`,
  );

  return {
    claim,
    riskScore: risk.riskScore,
    riskLevel: risk.riskLevel,
    transparencyStrength: risk.transparencyStrength,
    components,
    detectedBroadTerms: detectedBroadTerms.map((t) => t.term),
    detectedMeasurableInformation: detected,
    missingEvidenceCategories,
    possibleMissingContext,
    issues,
    explanation,
    suggestedWordingPattern:
      "[Product / scope] contains [X% / quantity + unit] [specific attribute], measured using [methodology], verified by [independent body], compared with a [year] baseline. Source: [link to report].",
    notes: [
      "This analysis looks only at the wording of the claim. It does not assess whether the claim is true and does not determine whether it is legally compliant.",
    ],
  };
}

function hasOtherPercentage(claim: string): boolean {
  const all = claim.match(/\b\d{1,3}(?:[.,]\d+)?\s?%/g) ?? [];
  const onBroad = claim.match(new RegExp(PERCENT_MODIFYING_BROAD_TERM.source, "gi")) ?? [];
  return all.length > onBroad.length;
}

function dedupe<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
