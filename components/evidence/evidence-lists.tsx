import { AlertTriangleIcon, CheckIcon, ExternalLinkIcon, MinusIcon } from "lucide-react";
import { TARGET_CRITERIA_LABELS, type TargetCriterion } from "@/lib/scoring/config";
import { formatScore } from "@/lib/scoring/labels";
import type { TransparencyGap } from "@/lib/scoring/gaps";
import type { TargetView } from "@/lib/services/brand-service";
import { cn } from "@/lib/utils";
import { formatDate, formatNumber } from "@/lib/utils/format";
import { humanizeEnum } from "@/lib/validation/enums";

const VERIFICATION_STYLES: Record<string, string> = {
  VERIFIED: "bg-risk-low-bg text-risk-low",
  PARTIALLY_VERIFIED: "bg-accent text-accent-foreground",
  SELF_DECLARED: "bg-muted text-muted-foreground",
  UNVERIFIED: "bg-risk-moderate-bg text-risk-moderate",
  EXPIRED: "bg-risk-high-bg text-risk-high",
  PENDING_REVIEW: "bg-muted text-muted-foreground",
};

export function VerificationStatusBadge({
  status,
  expired,
}: {
  status: string;
  expired?: boolean;
}) {
  const s = expired ? "EXPIRED" : status;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        VERIFICATION_STYLES[s],
      )}
    >
      {s === "VERIFIED"
        ? "Verified"
        : s === "PARTIALLY_VERIFIED"
          ? "Partially verified"
          : humanizeEnum(s)}
    </span>
  );
}

export interface CertificationItem {
  id: string;
  name: string;
  certificationBody: string | null;
  scope: string;
  validFrom: Date | null;
  validTo: Date | null;
  verificationStatus: string;
  source: { title: string; url: string | null } | null;
}

export function CertificationList({
  certifications,
  asOf,
}: {
  certifications: CertificationItem[];
  asOf: Date;
}) {
  if (certifications.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        No certifications were identified in the reviewed sources.
      </p>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {certifications.map((c) => {
        const expired =
          c.verificationStatus === "EXPIRED" || (c.validTo !== null && c.validTo < asOf);
        return (
          <li key={c.id} className="bg-card space-y-3 rounded-xl border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground text-sm">
                  {c.certificationBody ?? "Certification body not stated"}
                </p>
              </div>
              <VerificationStatusBadge status={c.verificationStatus} expired={expired} />
            </div>
            <div className="bg-muted/60 rounded-md p-3">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Scope
              </p>
              <p className="mt-1 text-sm">{c.scope}</p>
            </div>
            <p className="text-muted-foreground text-xs">
              Valid {formatDate(c.validFrom)} – {formatDate(c.validTo)}
              {c.source && <> · Source: {c.source.title}</>}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function TargetList({ targets }: { targets: TargetView[] }) {
  if (targets.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        No public sustainability targets were found during the review.
      </p>
    );
  }
  return (
    <div className="bg-card overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[760px] text-sm">
        <caption className="sr-only">Sustainability targets and progress disclosure</caption>
        <thead className="bg-muted/50 text-muted-foreground border-b text-left text-xs">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Target
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Baseline
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Target
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Progress
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Disclosure criteria
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y align-top">
          {targets.map((t) => (
            <tr key={t.id}>
              <th scope="row" className="max-w-64 px-4 py-3 text-left font-medium">
                {t.title}
                <span className="text-muted-foreground mt-1 block text-xs font-normal">
                  {humanizeEnum(t.category)}
                  {t.metric ? ` · ${t.metric}` : ""}
                </span>
              </th>
              <td className="tabular px-4 py-3">
                {t.baselineValue !== null ? (
                  `${formatNumber(t.baselineValue)} (${t.baselineYear ?? "?"})`
                ) : (
                  <span className="text-muted-foreground">Not disclosed</span>
                )}
              </td>
              <td className="tabular px-4 py-3">
                {t.targetValue !== null ? (
                  formatNumber(t.targetValue)
                ) : (
                  <span className="text-muted-foreground">No value</span>
                )}
                {t.targetYear ? (
                  <span className="text-muted-foreground block text-xs">by {t.targetYear}</span>
                ) : (
                  <span className="text-muted-foreground block text-xs">No deadline</span>
                )}
              </td>
              <td className="tabular px-4 py-3">
                {t.latestProgress !== null ? (
                  `${formatNumber(t.latestProgress)} (${t.progressYear ?? "?"})`
                ) : (
                  <span className="text-muted-foreground">Not reported</span>
                )}
              </td>
              <td className="px-4 py-3">
                <ul
                  className="space-y-0.5 text-xs"
                  aria-label={`Transparency criteria, ${formatScore(t.transparencyScore)} of 100`}
                >
                  {(Object.keys(t.criteria) as TargetCriterion[]).map((k) => (
                    <li
                      key={k}
                      className={cn(
                        "flex items-center gap-1",
                        !t.criteria[k] && "text-muted-foreground",
                      )}
                    >
                      {t.criteria[k] ? (
                        <CheckIcon className="text-risk-low size-3" aria-label="present" />
                      ) : (
                        <MinusIcon className="size-3" aria-label="missing" />
                      )}
                      {TARGET_CRITERIA_LABELS[k]}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3">
                <VerificationStatusBadge status={t.verificationStatus} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TransparencyGaps({ gaps }: { gaps: TransparencyGap[] }) {
  if (gaps.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        No transparency gaps were identified in the reviewed data.
      </p>
    );
  }
  const styles = {
    high: "border-l-risk-high",
    medium: "border-l-risk-moderate",
    low: "border-l-muted-foreground/40",
  };
  return (
    <ul className="space-y-2">
      {gaps.map((g) => (
        <li
          key={g.id}
          className={cn(
            "bg-card flex items-start gap-3 rounded-r-lg border border-l-4 px-4 py-3 text-sm",
            styles[g.severity],
          )}
        >
          <AlertTriangleIcon
            className="text-muted-foreground mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>
            {g.message}
            <span className="text-muted-foreground ml-2 text-xs">({g.severity} priority)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export interface SourceItem {
  id: string;
  title: string;
  sourceType: string;
  publisher: string | null;
  url: string | null;
  publicationDate: Date | null;
  accessedAt: Date | null;
  verificationLevel: string;
}

export function SourceList({ sources }: { sources: SourceItem[] }) {
  if (sources.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
        No supporting sources are currently available.
      </p>
    );
  }
  return (
    <ul className="bg-card divide-y rounded-xl border">
      {sources.map((s) => (
        <li
          key={s.id}
          className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium">{s.title}</p>
            <p className="text-muted-foreground text-xs">
              {humanizeEnum(s.sourceType)} · {s.publisher ?? "Unknown publisher"} · published{" "}
              {formatDate(s.publicationDate)} · accessed {formatDate(s.accessedAt)} ·{" "}
              {humanizeEnum(s.verificationLevel)}
            </p>
          </div>
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-primary inline-flex shrink-0 items-center gap-1 text-sm hover:underline"
            >
              Open <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{s.title} (opens in a new tab)</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
