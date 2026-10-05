import { ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { humanizeEnum } from "@/lib/validation/enums";

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
  actions,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className={cn("bg-card space-y-4 rounded-xl border p-5", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="font-sans text-base font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const STATUS_STYLES: Record<string, string> = {
  CANDIDATE: "bg-notice-bg text-notice",
  IN_REVIEW: "bg-risk-moderate-bg text-risk-moderate",
  VERIFIED: "bg-risk-low-bg text-risk-low",
  PUBLISHED: "bg-accent text-accent-foreground",
  ARCHIVED: "bg-muted text-muted-foreground",
  DRAFT: "bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status] ?? "bg-muted",
      )}
    >
      {humanizeEnum(status)}
    </span>
  );
}

/** Prominent reminder that candidate claims never affect public scores. */
export function CandidateNotice({ count }: { count?: number }) {
  return (
    <div
      role="note"
      className="border-notice/30 bg-notice-bg text-notice flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
    >
      <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <strong>Candidate and in-review claims never affect public scores.</strong> Only claims
        marked <em>Verified</em> or <em>Published</em> — with all five rubric components assessed —
        are included when a score is recalculated.
        {count !== undefined && ` ${count} claim(s) are currently awaiting review.`}
      </p>
    </div>
  );
}

export function AdminTable({
  head,
  children,
  empty,
}: {
  head: string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="bg-card overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[640px] text-sm">
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
          {empty ? (
            <tr>
              <td colSpan={head.length} className="text-muted-foreground px-4 py-8 text-center">
                No records yet.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function RowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium hover:underline">
      {children}
    </Link>
  );
}

export function BrandFilterLinks({
  brands,
  current,
  basePath,
}: {
  brands: { id: string; name: string }[];
  current?: string;
  basePath: string;
}) {
  return (
    <nav aria-label="Filter by brand" className="flex flex-wrap gap-1.5 text-sm">
      <Link
        href={basePath}
        className={cn("rounded-full border px-3 py-1", !current && "border-primary bg-accent")}
      >
        All brands
      </Link>
      {brands.map((b) => (
        <Link
          key={b.id}
          href={`${basePath}?brandId=${b.id}`}
          className={cn(
            "rounded-full border px-3 py-1",
            current === b.id && "border-primary bg-accent",
          )}
        >
          {b.name}
        </Link>
      ))}
    </nav>
  );
}
