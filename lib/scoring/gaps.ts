import {
  DISCLOSURE_TOPIC_LABELS,
  REPORT_STALENESS_MONTHS,
  type DisclosureTopicKey,
} from "./config";
import { monthsBetween } from "./confidence";
import { isScorableStatus } from "./status";
import type { BrandAssessmentInput } from "./assess-brand";

export interface TransparencyGap {
  id: string;
  severity: "high" | "medium" | "low";
  message: string;
}

const REPORT_TYPES = new Set(["SUSTAINABILITY_REPORT", "ESG_REPORT", "CLIMATE_REPORT"]);

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/**
 * Transparency gaps derived exclusively from stored, reviewed data.
 * Nothing here is inferred beyond the records themselves.
 */
export function detectTransparencyGaps(input: BrandAssessmentInput): TransparencyGap[] {
  const asOf = input.asOf ?? new Date();
  const gaps: TransparencyGap[] = [];
  const claims = input.claims.filter((c) => isScorableStatus(c.status));
  const sources = input.sources.filter((s) => isScorableStatus(s.status));
  const targets = input.targets.filter((t) => t.verificationStatus !== "PENDING_REVIEW");

  const noQuant = claims.filter((c) => c.evidenceLevel !== null && c.evidenceLevel < 2).length;
  if (noQuant > 0) {
    gaps.push({
      id: "claims-no-quant",
      severity: noQuant / Math.max(claims.length, 1) >= 0.4 ? "high" : "medium",
      message: `${noQuant} ${plural(noQuant, "claim lacks", "claims lack")} quantitative evidence.`,
    });
  }

  const unlinked = claims.filter((c) => c.linkedSourceCount === 0).length;
  if (unlinked > 0) {
    gaps.push({
      id: "claims-unlinked",
      severity: "high",
      message: `${unlinked} verified ${plural(unlinked, "claim is", "claims are")} not linked to a public source.`,
    });
  }

  const unverified = claims.filter((c) => c.verification !== null && c.verification <= 1).length;
  if (unverified > 0) {
    gaps.push({
      id: "claims-unverified",
      severity: "medium",
      message: `${unverified} ${plural(unverified, "claim has", "claims have")} no independent verification.`,
    });
  }

  const noBaseline = targets.filter(
    (t) => t.baselineValue === null || t.baselineYear === null,
  ).length;
  if (noBaseline > 0) {
    gaps.push({
      id: "targets-no-baseline",
      severity: "medium",
      message: `No baseline disclosed for ${noBaseline} ${plural(noBaseline, "target", "targets")}.`,
    });
  }

  const noProgress = targets.filter(
    (t) => t.latestProgress === null || t.progressYear === null,
  ).length;
  if (noProgress > 0) {
    gaps.push({
      id: "targets-no-progress",
      severity: "medium",
      message: `Progress has not been reported for ${noProgress} ${plural(noProgress, "target", "targets")}.`,
    });
  }

  if (targets.length === 0 && input.targetsDataState === "NOT_FOUND") {
    gaps.push({
      id: "targets-none",
      severity: "high",
      message: "No public sustainability targets were found during the review.",
    });
  }

  const reports = sources.filter((s) => REPORT_TYPES.has(s.sourceType) && s.publicationDate);
  if (sources.length > 0 && reports.length === 0) {
    gaps.push({
      id: "report-missing",
      severity: "medium",
      message: "No dated sustainability report was found among the reviewed sources.",
    });
  } else if (reports.length > 0) {
    const newest = new Date(Math.max(...reports.map((r) => r.publicationDate!.getTime())));
    if (monthsBetween(newest, asOf) > REPORT_STALENESS_MONTHS) {
      gaps.push({
        id: "report-stale",
        severity: "medium",
        message: `Latest sustainability report is older than ${REPORT_STALENESS_MONTHS} months.`,
      });
    }
  }

  const notFoundTopics = input.disclosureItems
    .filter((d) => d.state === "NOT_FOUND" || d.state === "NOT_AVAILABLE")
    .map((d) => DISCLOSURE_TOPIC_LABELS[d.topic as DisclosureTopicKey]?.toLowerCase() ?? d.topic);
  if (notFoundTopics.length > 0) {
    gaps.push({
      id: "disclosure-not-found",
      severity: notFoundTopics.length >= 3 ? "high" : "medium",
      message: `Public disclosure was not found for: ${notFoundTopics.join(", ")}.`,
    });
  }

  const expired = input.certifications.filter(
    (c) => c.verificationStatus === "EXPIRED" || (c.validTo !== null && c.validTo < asOf),
  ).length;
  if (expired > 0) {
    gaps.push({
      id: "certs-expired",
      severity: "low",
      message: `${expired} ${plural(expired, "certification has", "certifications have")} expired.`,
    });
  }

  if (input.latestAudit?.clickCount != null && input.latestAudit.clickCount >= 4) {
    gaps.push({
      id: "access-clicks",
      severity: "low",
      message: `Key sustainability evidence requires ${input.latestAudit.clickCount} navigation steps from the homepage.`,
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return gaps.sort((a, b) => order[a.severity] - order[b.severity]);
}
