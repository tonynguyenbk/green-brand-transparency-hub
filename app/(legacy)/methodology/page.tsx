import type { Metadata } from "next";
import { TrackEvent } from "@/components/analytics/track-event";
import { Container, PageHeader, Section } from "@/components/layout/page-header";
import { MethodologyDisclaimer } from "@/components/layout/notices";
import {
  ACCESSIBILITY_POINTS,
  CLAIM_RISK_WEIGHTS,
  CLICK_COUNT_BANDS,
  CONFIDENCE_CONFIG,
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  DISCLOSURE_TOPIC_LABELS,
  DISCLOSURE_TOPIC_POINTS,
  EVIDENCE_LEVEL_LABELS,
  REPORT_STALENESS_MONTHS,
  RISK_THRESHOLDS,
  TARGET_CRITERIA_LABELS,
  TARGET_CRITERIA_POINTS,
  VERIFICATION_LEVEL_LABELS,
  type DisclosureTopicKey,
  type TargetCriterion,
} from "@/lib/scoring";
import { listMethodologyVersions } from "@/lib/services/admin-service";
import { getActiveMethodology } from "@/lib/services/scoring-service";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Methodology" };

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-muted/60 overflow-x-auto rounded-lg border p-4 font-mono text-[0.82rem] leading-relaxed">
      {children}
    </pre>
  );
}

function SimpleTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/50 text-muted-foreground border-b text-left text-xs">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === 0 ? "px-4 py-2 font-medium" : "tabular px-4 py-2"}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TOC = [
  ["measured", "What is measured"],
  ["not-measured", "What is not measured"],
  ["dimensions", "Score dimensions & weights"],
  ["evidence-levels", "Evidence levels"],
  ["claim-risk", "Claim-risk model"],
  ["confidence", "Confidence levels"],
  ["missing-data", "Missing-data handling"],
  ["process", "Review & update process"],
  ["versioning", "Methodology versioning"],
  ["limitations", "Limitations"],
  ["corrections", "Corrections"],
] as const;

export default async function MethodologyPage() {
  const [active, versions] = await Promise.all([getActiveMethodology(), listMethodologyVersions()]);
  const w = active.weights;

  return (
    <Container className="py-10">
      <TrackEvent name="methodology_view" properties={{ version: active.version }} />
      <PageHeader
        eyebrow={`Methodology v${active.version}${active.publishedAt ? ` · published ${formatDate(active.publishedAt)}` : ""}`}
        title="How transparency is assessed"
        description="Every formula, weight and threshold used by the Hub is listed here. The values on this page are read directly from the scoring engine's configuration."
      />
      <div className="mt-10 grid gap-12 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1.5 text-sm">
            {TOC.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-3xl space-y-14 [&_p]:leading-relaxed">
          <MethodologyDisclaimer />

          <Section id="measured" title="What is measured">
            <p>
              The Hub evaluates the <strong>transparency of sustainability communication</strong>:
              how specific environmental claims are, whether supporting evidence is publicly
              available and quantitative, whether a methodology is disclosed, whether independent
              verification exists, whether targets have baselines, deadlines and progress reports,
              and how easily consumers can reach the evidence.
            </p>
          </Section>

          <Section id="not-measured" title="What is not measured">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Actual environmental performance, emissions or impacts.</li>
              <li>Whether a brand is “sustainable” or “green”.</li>
              <li>Legal compliance with advertising or consumer-protection rules.</li>
              <li>The truth of a claim — only how verifiable it is from public information.</li>
            </ul>
            <p>
              A high score means more publicly accessible supporting evidence, not better
              environmental outcomes.
            </p>
          </Section>

          <Section id="dimensions" title="Green Transparency Score: dimensions & weights">
            <Formula>
              {`overall = disclosure × ${w.disclosure}
        + evidence × ${w.evidence}
        + verification × ${w.verification}
        + targets × ${w.targets}
        + accessibility × ${w.accessibility}`}
            </Formula>
            <p>
              Each dimension is normalised to 0–100 and full precision is kept internally; scores
              are rounded only for display. The overall score is only calculated when all five
              dimensions are available.
            </p>
            <SimpleTable
              caption="Dimension weights"
              head={["Dimension", "Weight"]}
              rows={DIMENSION_KEYS.map((k) => [DIMENSION_LABELS[k], `${Math.round(w[k] * 100)}%`])}
            />

            <h3 className="pt-4 text-lg font-semibold">1. Sustainability Disclosure</h3>
            <p>
              Each topic is rated absent (0), partial (0.5) or clear (1) and weighted by its points:
            </p>
            <SimpleTable
              caption="Disclosure topics"
              head={["Topic", "Points"]}
              rows={(Object.keys(DISCLOSURE_TOPIC_POINTS) as DisclosureTopicKey[]).map((t) => [
                DISCLOSURE_TOPIC_LABELS[t],
                DISCLOSURE_TOPIC_POINTS[t],
              ])}
            />
            <Formula>{`disclosure = Σ(points × value) / Σ(points of assessed topics) × 100`}</Formula>
            <p className="text-muted-foreground text-sm">
              Topics marked “not applicable” or “pending review” are excluded rather than scored as
              zero. At least half of the applicable topics must be assessed. “Not found” scores 0
              because this dimension measures public disclosure.
            </p>

            <h3 className="pt-4 text-lg font-semibold">2. Evidence Quality</h3>
            <Formula>{`evidence = average(claimEvidenceLevel / 5) × 100   (VERIFIED or PUBLISHED claims only)`}</Formula>

            <h3 className="pt-4 text-lg font-semibold">3. Third-Party Verification</h3>
            <SimpleTable
              caption="Verification ladder"
              head={["Level", "Meaning"]}
              rows={Object.entries(VERIFICATION_LEVEL_LABELS).map(([l, m]) => [l, m])}
            />
            <Formula>{`verification = highest level reached / 5 × 100`}</Formula>
            <p className="text-muted-foreground text-sm">
              Level 5 requires an independent-assurance source and at least two distinct independent
              mechanisms. Expired certifications are not counted. A certification only applies to
              its stated scope.
            </p>

            <h3 className="pt-4 text-lg font-semibold">4. Targets & Progress</h3>
            <SimpleTable
              caption="Target criteria"
              head={["Criterion", "Points"]}
              rows={(Object.keys(TARGET_CRITERIA_POINTS) as TargetCriterion[]).map((k) => [
                TARGET_CRITERIA_LABELS[k],
                TARGET_CRITERIA_POINTS[k],
              ])}
            />
            <Formula>{`targetScore = points / 15 × 100;   targets = average(targetScore)`}</Formula>

            <h3 className="pt-4 text-lg font-semibold">5. Information Accessibility</h3>
            <SimpleTable
              caption="Click-count rule"
              head={["Clicks from homepage to evidence", "Points (of 5)"]}
              rows={CLICK_COUNT_BANDS.map((b, i) => [
                i === 0 ? "1–2" : Number.isFinite(b.maxClicks) ? String(b.maxClicks) : "5+",
                `${b.points} (${b.label.toLowerCase()})`,
              ])}
            />
            <Formula>
              {`accessibility = (clickPoints + searchability[0–${ACCESSIBILITY_POINTS.searchabilityMax}]
                 + readability[0–${ACCESSIBILITY_POINTS.readabilityMax}]
                 + evidenceLinkage[0–${ACCESSIBILITY_POINTS.evidenceLinkageMax}]) / 15 × 100`}
            </Formula>
            <p className="text-muted-foreground text-sm">
              The click-count bands are an operational project rule, not a universal usability law.
            </p>
          </Section>

          <Section id="evidence-levels" title="Evidence levels">
            <SimpleTable
              caption="Evidence levels"
              head={["Level", "Definition"]}
              rows={Object.entries(EVIDENCE_LEVEL_LABELS).map(([l, d]) => [l, d])}
            />
          </Section>

          <Section id="claim-risk" title="Green Claim Transparency Risk">
            <p>Each reviewed claim is rated 0–5 on five components (normalised ×20 to 0–100):</p>
            <Formula>
              {`transparencyStrength = specificity × ${CLAIM_RISK_WEIGHTS.specificity}
                     + evidence × ${CLAIM_RISK_WEIGHTS.evidence}
                     + measurability × ${CLAIM_RISK_WEIGHTS.measurability}
                     + verification × ${CLAIM_RISK_WEIGHTS.verification}
                     + context × ${CLAIM_RISK_WEIGHTS.context}

riskScore = 100 − transparencyStrength

0–${RISK_THRESHOLDS.lowMax} LOW · ${RISK_THRESHOLDS.lowMax + 1}–${RISK_THRESHOLDS.moderateMax} MODERATE · ${RISK_THRESHOLDS.moderateMax + 1}–100 HIGH`}
            </Formula>
            <p>
              Thresholds are project-defined methodological choices. A high risk means the claim
              currently has limited publicly accessible supporting evidence — it is never a finding
              that the claim is false. The Claim Checker applies the same formula, deriving
              components from wording rules.
            </p>
          </Section>

          <Section id="confidence" title="Confidence levels">
            <p>
              Confidence describes the reliability of the <em>assessment</em>, not environmental
              performance. It is deliberately coarse (High / Medium / Low) to avoid false precision.
            </p>
            <SimpleTable
              caption="Confidence points"
              head={["Factor", "Points"]}
              rows={[
                [
                  "Number of verified sources",
                  `≥${CONFIDENCE_CONFIG.sourceCount.high} → 2, ≥${CONFIDENCE_CONFIG.sourceCount.medium} → 1`,
                ],
                [
                  "Source quality (non-marketing share)",
                  `≥${CONFIDENCE_CONFIG.qualityShareForPoint * 100}% → 1`,
                ],
                ["Source recency", `newest ≤ ${CONFIDENCE_CONFIG.recencyMonths} months → 1`],
                ["Missing data", `0 gaps → 2, ≤${CONFIDENCE_CONFIG.maxGapsForPartialPoint} → 1`],
                [
                  "Externally verified claims",
                  `≥${CONFIDENCE_CONFIG.externallyVerifiedShare.high * 100}% → 2, ≥${CONFIDENCE_CONFIG.externallyVerifiedShare.medium * 100}% → 1`,
                ],
              ]}
            />
            <p className="text-muted-foreground text-sm">
              ≥{CONFIDENCE_CONFIG.levels.high} points High, ≥{CONFIDENCE_CONFIG.levels.medium}{" "}
              Medium, otherwise Low. Fewer than {CONFIDENCE_CONFIG.minimumSourcesForMediumOrHigh}{" "}
              sources always yields Low.
            </p>
          </Section>

          <Section id="missing-data" title="Missing-data handling">
            <p>
              Missing information is never silently converted into zero. Records carry explicit
              states:
            </p>
            <SimpleTable
              caption="Missing-data states"
              head={["State", "Meaning"]}
              rows={[
                ["available", "Information was found and assessed."],
                ["not_available", "The brand states it does not report this information."],
                [
                  "not_found",
                  "Public supporting evidence was not found during the review (it may still exist).",
                ],
                ["not_applicable", "Not relevant for this brand; excluded."],
                ["pending_review", "Not yet assessed; excluded and lowers confidence."],
              ]}
            />
            <p>
              When required data is incomplete, no score is shown: “Score cannot yet be calculated
              because required review data is incomplete.”
            </p>
          </Section>

          <Section id="process" title="Review & update process">
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>
                Sources are collected manually (or imported as candidates by optional scripts).
              </li>
              <li>
                Every imported or extracted claim starts as CANDIDATE and never affects public
                scores.
              </li>
              <li>
                A reviewer links each claim to evidence, rates the five rubric components and marks
                it VERIFIED.
              </li>
              <li>
                Recalculation loads verified data only and creates a new, immutable score snapshot.
              </li>
              <li>
                Sustainability reports older than {REPORT_STALENESS_MONTHS} months are flagged as a
                transparency gap.
              </li>
            </ol>
          </Section>

          <Section id="versioning" title="Methodology versioning">
            <p>
              Each snapshot stores the methodology version, calculation timestamp, source count and
              confidence level. Changing any weight or threshold requires a new version; earlier
              snapshots are never recalculated in place.
            </p>
            {versions.length > 0 && (
              <SimpleTable
                caption="Methodology versions"
                head={["Version", "Title", "Published", "Status"]}
                rows={versions.map((v) => [
                  `v${v.version}`,
                  v.title,
                  formatDate(v.publishedAt),
                  v.active ? "Active" : "Inactive",
                ])}
              />
            )}
          </Section>

          <Section id="limitations" title="Limitations">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Rubric ratings involve reviewer judgement; inter-rater reliability has not yet been
                tested.
              </li>
              <li>Weights and thresholds are project-defined, not empirically calibrated.</li>
              <li>
                Only public information is assessed; brands may hold evidence that is not published.
              </li>
              <li>The Claim Checker analyses wording only and cannot detect inaccurate figures.</li>
              <li>Brand data shown during development is fictional.</li>
            </ul>
          </Section>

          <Section id="corrections" title="Corrections">
            <p>
              Anyone — including brand representatives — can use “Report an issue” on a brand
              profile or on an individual claim to flag a missing or incorrect source, updated data
              or a clarification. Reports never change data automatically: an administrator checks
              the evidence, edits the relevant records and recalculates the score, which creates a
              new snapshot so every change remains traceable.
            </p>
          </Section>
        </div>
      </div>
    </Container>
  );
}
