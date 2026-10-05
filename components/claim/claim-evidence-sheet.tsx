"use client";

import { AlertCircleIcon, ExternalLinkIcon } from "lucide-react";
import { EvidenceStrengthBadge, LinkStrengthBadge, RiskBadge } from "@/components/scoring/badges";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { track } from "@/lib/analytics/client";
import { EVIDENCE_LEVEL_LABELS, RISK_LABELS } from "@/lib/scoring";
import type { ClaimView } from "@/lib/services/brand-service";
import { formatDate } from "@/lib/utils/format";
import { humanizeEnum } from "@/lib/validation/enums";

const COMPONENT_LABELS: [keyof ClaimView["components"], string, number][] = [
  ["specificity", "Specificity", 25],
  ["evidence", "Evidence availability", 30],
  ["measurability", "Measurability", 20],
  ["verification", "External verification", 15],
  ["context", "Context completeness", 10],
];

export function ClaimEvidenceSheet({
  claim,
  brandSlug,
  onOpenChange,
}: {
  claim: ClaimView | null;
  brandSlug: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={claim !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        {claim && (
          <>
            <SheetHeader className="space-y-2 border-b pb-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {humanizeEnum(claim.category)} claim · {humanizeEnum(claim.status)}
              </p>
              <SheetTitle className="font-serif text-xl leading-snug font-normal">
                “{claim.claimText}”
              </SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={claim.riskLevel} score={claim.riskScore} />
                  <EvidenceStrengthBadge label={claim.evidenceStrength} />
                  <span className="text-xs">Reviewed {formatDate(claim.reviewedAt)}</span>
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-7 px-4 pb-8" data-testid="evidence-panel">
              <section aria-labelledby="risk-why" className="space-y-3">
                <h3 id="risk-why" className="font-sans text-sm font-semibold">
                  Transparency-risk explanation
                </h3>
                <p className="text-muted-foreground text-sm">
                  {claim.riskLevel
                    ? `This claim has a ${RISK_LABELS[claim.riskLevel].toLowerCase()} according to the current methodology.`
                    : "Risk has not been calculated because the review is incomplete."}
                </p>
                <table className="w-full text-sm">
                  <caption className="sr-only">Claim risk components (0–5 rubric)</caption>
                  <tbody className="divide-y">
                    {COMPONENT_LABELS.map(([key, label, weight]) => {
                      const v = claim.components[key];
                      return (
                        <tr key={key}>
                          <th scope="row" className="py-1.5 text-left font-normal">
                            {label}{" "}
                            <span className="text-muted-foreground text-xs">({weight}%)</span>
                          </th>
                          <td className="w-28 py-1.5 pl-3">
                            <div className="flex gap-0.5" aria-hidden="true">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full ${v !== null && i < v ? "bg-primary" : "bg-muted"}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="tabular text-muted-foreground py-1.5 pl-3 text-right">
                            {v === null ? "pending" : `${v}/5`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {claim.riskExplanation.length > 0 && (
                  <ul className="space-y-1.5 text-sm">
                    {claim.riskExplanation.map((line) => (
                      <li key={line} className="flex gap-2">
                        <AlertCircleIcon
                          className="text-risk-moderate mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="ev-level" className="space-y-1">
                <h3 id="ev-level" className="font-sans text-sm font-semibold">
                  Evidence level
                </h3>
                <p className="text-muted-foreground text-sm">
                  {claim.evidenceLevel === null
                    ? "Not yet assessed."
                    : `Level ${claim.evidenceLevel} of 5 — ${EVIDENCE_LEVEL_LABELS[claim.evidenceLevel]}.`}
                </p>
              </section>

              <section aria-labelledby="ev-sources" className="space-y-3">
                <h3 id="ev-sources" className="font-sans text-sm font-semibold">
                  Sources ({claim.evidence.length})
                </h3>
                {claim.evidence.length === 0 ? (
                  <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
                    No supporting sources are currently available.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {claim.evidence.map((e) => (
                      <li key={e.sourceId} className="space-y-2 rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">{e.title}</p>
                          <LinkStrengthBadge strength={e.evidenceStrength} />
                        </div>
                        <dl className="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                          <dt>Source type</dt>
                          <dd>{humanizeEnum(e.sourceType)}</dd>
                          <dt>Publisher</dt>
                          <dd>{e.publisher ?? "—"}</dd>
                          <dt>Published</dt>
                          <dd>{formatDate(e.publicationDate)}</dd>
                          <dt>Accessed</dt>
                          <dd>{formatDate(e.accessedAt)}</dd>
                          <dt>Verification</dt>
                          <dd>{humanizeEnum(e.verificationLevel)}</dd>
                          {e.pageNumber && (
                            <>
                              <dt>Page</dt>
                              <dd>{e.pageNumber}</dd>
                            </>
                          )}
                        </dl>
                        {e.excerpt ? (
                          <blockquote className="border-primary/40 border-l-2 pl-3 text-sm italic">
                            {e.excerpt}
                          </blockquote>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Supporting evidence not found in this source during the review.
                          </p>
                        )}
                        {e.url && (
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            onClick={() =>
                              track("evidence_click", { brand: brandSlug, source_id: e.sourceId })
                            }
                            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                          >
                            Open source <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="ev-method" className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <h3 id="ev-method" className="font-sans text-sm font-semibold">
                    Methodology
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {claim.methodologyNote ??
                      "No measurement methodology was found in the reviewed sources."}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans text-sm font-semibold">Verification</h3>
                  <p className="text-muted-foreground text-sm">
                    {claim.verification}. {claim.verificationNote ?? ""}
                  </p>
                </div>
              </section>

              {claim.missingInformation.length > 0 && (
                <section aria-labelledby="ev-missing" className="space-y-2">
                  <h3 id="ev-missing" className="font-sans text-sm font-semibold">
                    Missing information
                  </h3>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                    {claim.missingInformation.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </section>
              )}

              {claim.reviewerNotes && (
                <section className="space-y-1">
                  <h3 className="font-sans text-sm font-semibold">Reviewer note</h3>
                  <p className="text-muted-foreground text-sm">{claim.reviewerNotes}</p>
                </section>
              )}

              <p className="text-muted-foreground border-t pt-4 text-xs">
                “Not found” means public supporting evidence was not found during the review — not
                that evidence definitely does not exist.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
