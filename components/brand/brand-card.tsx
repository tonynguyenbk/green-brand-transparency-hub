import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { FictionalBadge } from "@/components/layout/notices";
import { ConfidenceBadge, RiskBadge } from "@/components/scoring/badges";
import { formatScore } from "@/lib/scoring/labels";
import type { BrandCardData } from "@/lib/services/brand-service";
import { formatDate } from "@/lib/utils/format";

export function BrandCard({ brand }: { brand: BrandCardData }) {
  return (
    <article className="group bg-card focus-within:ring-ring relative flex h-full flex-col rounded-xl border p-5 transition-shadow focus-within:ring-2 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {brand.industry.name}
          </p>
          <h3 className="font-serif text-xl font-semibold">
            <Link
              href={`/brands/${brand.slug}`}
              className="outline-none after:absolute after:inset-0 after:rounded-xl"
            >
              {brand.name}
            </Link>
          </h3>
        </div>
        <div className="text-right">
          <p className="tabular font-serif text-3xl leading-none font-semibold">
            {brand.score ? formatScore(brand.score.overall) : "—"}
          </p>
          <p className="text-muted-foreground mt-1 text-[0.7rem]">
            {brand.score ? "/ 100" : "not scored"}
          </p>
        </div>
      </div>

      {brand.description && (
        <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">{brand.description}</p>
      )}
      <div className="flex-1" />

      <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
        {brand.score && <ConfidenceBadge level={brand.score.confidence} />}
        {brand.score && (
          <RiskBadge level={brand.score.riskLevel} withLabel={false} prefix="Avg. claim risk: " />
        )}
        {brand.isFictional && <FictionalBadge />}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Analyzed claims</dt>
          <dd className="tabular font-medium">{brand.analyzedClaims}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Last reviewed</dt>
          <dd className="font-medium">{formatDate(brand.lastReviewedAt)}</dd>
        </div>
      </dl>
      <ArrowRightIcon
        className="text-muted-foreground absolute right-5 bottom-5 size-4 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </article>
  );
}
