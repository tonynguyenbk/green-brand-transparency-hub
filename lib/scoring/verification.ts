import { VERIFICATION_LEVEL_LABELS, VERIFICATION_LEVEL_MAX } from "./config";
import { isScorableStatus } from "./status";
import type {
  DimensionResult,
  VerificationCertificationInput,
  VerificationSourceInput,
} from "./types";

export interface VerificationDetails {
  level: number;
  levelLabel: string;
  independentMechanisms: string[];
  validCertifications: number;
  expiredCertifications: number;
  assuranceSources: number;
  externalReferenceSources: number;
  selfDeclaredSources: number;
}

/**
 * Third-Party Verification (0–100) = level / 5 × 100, where level is the
 * highest rung reached on this ladder (verified data only):
 *
 *   5  Multiple independent mechanisms: an independent-assurance source AND
 *      at least two distinct independent mechanisms in total (distinct
 *      certification bodies with valid VERIFIED certifications, recognised-
 *      certification sources, independent-assurance sources).
 *   4  Independent assurance: at least one INDEPENDENT_ASSURANCE source.
 *   3  Recognised certification: a valid VERIFIED certification or a
 *      RECOGNIZED_CERTIFICATION source.
 *   2  External reference: an EXTERNAL_REFERENCE source or a
 *      PARTIALLY_VERIFIED certification.
 *   1  Self-declaration: only brand-published material.
 *   0  None.
 *
 * Certifications are valid when VERIFIED and validTo is empty or >= asOf.
 * Sources count only when VERIFIED or PUBLISHED. If there are no scorable
 * sources and no assessed certifications the dimension is not calculated.
 */
export function calculateVerificationScore(
  sources: VerificationSourceInput[],
  certifications: VerificationCertificationInput[],
  asOf: Date = new Date(),
): DimensionResult<VerificationDetails> {
  const scorableSources = sources.filter((s) => isScorableStatus(s.status));
  const assessedCerts = certifications.filter((c) => c.verificationStatus !== "PENDING_REVIEW");

  const isExpired = (c: VerificationCertificationInput) =>
    c.verificationStatus === "EXPIRED" || (c.validTo !== null && c.validTo < asOf);
  const validCerts = assessedCerts.filter(
    (c) => c.verificationStatus === "VERIFIED" && !isExpired(c),
  );
  const expiredCertifications = assessedCerts.filter(isExpired).length;

  const assurance = scorableSources.filter((s) => s.verificationLevel === "INDEPENDENT_ASSURANCE");
  const certSources = scorableSources.filter(
    (s) => s.verificationLevel === "RECOGNIZED_CERTIFICATION",
  );
  const external = scorableSources.filter((s) => s.verificationLevel === "EXTERNAL_REFERENCE");
  const selfDeclared = scorableSources.filter((s) => s.verificationLevel === "SELF_DECLARED");

  const mechanisms = new Set<string>();
  for (const c of validCerts) mechanisms.add(`certification:${norm(c.certificationBody) || c.id}`);
  for (const s of certSources) mechanisms.add(`certification:${norm(s.publisher) || s.id}`);
  for (const s of assurance) mechanisms.add(`assurance:${norm(s.publisher) || s.id}`);

  let level = 0;
  if (assurance.length > 0 && mechanisms.size >= 2) level = 5;
  else if (assurance.length > 0) level = 4;
  else if (validCerts.length > 0 || certSources.length > 0) level = 3;
  else if (
    external.length > 0 ||
    assessedCerts.some((c) => c.verificationStatus === "PARTIALLY_VERIFIED" && !isExpired(c))
  )
    level = 2;
  else if (
    selfDeclared.length > 0 ||
    assessedCerts.some((c) => c.verificationStatus === "SELF_DECLARED")
  )
    level = 1;

  const details: VerificationDetails = {
    level,
    levelLabel: VERIFICATION_LEVEL_LABELS[level],
    independentMechanisms: [...mechanisms],
    validCertifications: validCerts.length,
    expiredCertifications,
    assuranceSources: assurance.length,
    externalReferenceSources: external.length,
    selfDeclaredSources: selfDeclared.length,
  };

  if (scorableSources.length === 0 && assessedCerts.length === 0) {
    return {
      score: null,
      unavailableReason: "No supporting sources are currently available.",
      explanation: [],
      details,
    };
  }

  const explanation = [
    `Verification level ${level} of ${VERIFICATION_LEVEL_MAX}: ${VERIFICATION_LEVEL_LABELS[level]}.`,
    `${validCerts.length} valid verified certification(s), ${assurance.length} independent assurance source(s), ${external.length} external reference source(s).`,
  ];
  if (expiredCertifications > 0) {
    explanation.push(`${expiredCertifications} certification(s) expired and were not counted.`);
  }

  return { score: (level / VERIFICATION_LEVEL_MAX) * 100, explanation, details };
}

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}
