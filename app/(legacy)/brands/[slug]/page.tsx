import { ExternalLinkIcon, GitCompareArrowsIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackEvent } from "@/components/analytics/track-event";
import { ScoreHistoryChart } from "@/components/charts/score-history-chart";
import { ReportIssueDialog } from "@/components/brand/report-issue-dialog";
import { ClaimsExplorer } from "@/components/claim/claims-explorer";
import {
  CertificationList,
  SourceList,
  TargetList,
  TransparencyGaps,
} from "@/components/evidence/evidence-lists";
import { Container, Section } from "@/components/layout/page-header";
import {
  EmptyState,
  FictionalBadge,
  FictionalDataNotice,
  MethodologyDisclaimer,
} from "@/components/layout/notices";
import { ConfidenceBadge, RiskBadge } from "@/components/scoring/badges";
import { DimensionBreakdown, type DimensionRow } from "@/components/scoring/dimension-breakdown";
import { ScoreDisplay } from "@/components/scoring/score-display";
import { Button } from "@/components/ui/button";
import { DIMENSION_KEYS, OVERALL_WEIGHTS, classifyRisk } from "@/lib/scoring";
import { getPublicBrandProfile } from "@/lib/services/brand-service";
import { formatDate, formatMonth } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const profile = await getPublicBrandProfile(slug);
  return profile
    ? {
        title: profile.brand.name,
        description: `Sustainability communication transparency profile for ${profile.brand.name}.`,
      }
    : { title: "Brand not found" };
}

export default async function BrandProfilePage(props: PageProps<"/brands/[slug]">) {
  const { slug } = await props.params;
  const profile = await getPublicBrandProfile(slug);
  if (!profile) notFound();

  const {
    brand,
    latestScore,
    scoreDetails,
    claims,
    certifications,
    targets,
    sources,
    latestAudit,
  } = profile;
  const weights = scoreDetails?.weights ?? OVERALL_WEIGHTS;
  const rows: DimensionRow[] = latestScore
    ? DIMENSION_KEYS.map((key) => ({
        key,
        weight: weights[key],
        score: {
          disclosure: latestScore.disclosureScore,
          evidence: latestScore.evidenceScore,
          verification: latestScore.verificationScore,
          targets: latestScore.targetsScore,
          accessibility: latestScore.accessibilityScore,
        }[key],
        explanation: scoreDetails?.dimensions[key]?.explanation ?? [],
      }))
    : [];
  const avgRiskLevel =
    latestScore?.averageClaimRisk != null ? classifyRisk(latestScore.averageClaimRisk) : null;

  return (
    <>
      <TrackEvent name="brand_view" properties={{ brand: brand.slug }} />
      {/* Header */}
      <section className="bg-card border-b">
        <Container className="space-y-8 py-10">
          <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
            <Link href="/brands" className="hover:underline">
              Brands
            </Link>{" "}
            / <span aria-current="page">{brand.name}</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                  {brand.industry.name}
                </p>
                {brand.isFictional && <FictionalBadge />}
              </div>
              <h1 className="text-4xl font-semibold sm:text-5xl">{brand.name}</h1>
              {brand.description && (
                <p className="text-muted-foreground max-w-2xl">{brand.description}</p>
              )}
              <dl className="grid max-w-xl grid-cols-2 gap-4 pt-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground text-xs">Country</dt>
                  <dd className="font-medium">{brand.country ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Last reviewed</dt>
                  <dd className="font-medium">{formatDate(brand.lastReviewedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Sources reviewed</dt>
                  <dd className="tabular font-medium">
                    {latestScore?.sourceCount ?? sources.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Latest source</dt>
                  <dd className="font-medium">{formatMonth(profile.newestSourceDate)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-2">
                {brand.website && (
                  <Button asChild variant="outline" size="sm">
                    <a href={brand.website} target="_blank" rel="noopener noreferrer nofollow">
                      Website <ExternalLinkIcon />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/compare?brands=${brand.slug}`}>
                    <GitCompareArrowsIcon /> Compare
                  </Link>
                </Button>
                <ReportIssueDialog
                  brandId={brand.id}
                  brandName={brand.name}
                  claims={claims.map((c) => ({ id: c.id, text: c.claimText }))}
                />
              </div>
            </div>

            <div
              className="bg-background space-y-4 rounded-xl border p-6"
              aria-labelledby="score-heading"
            >
              <h2
                id="score-heading"
                className="text-muted-foreground font-sans text-sm font-semibold"
              >
                Green Transparency Score
              </h2>
              <ScoreDisplay score={latestScore?.overallScore ?? null} />
              {latestScore && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <ConfidenceBadge level={latestScore.confidenceLevel} />
                    <RiskBadge
                      level={avgRiskLevel}
                      score={latestScore.averageClaimRisk}
                      withLabel={false}
                      prefix="Avg. claim risk: "
                    />
                  </div>
                  <dl className="text-muted-foreground grid grid-cols-2 gap-3 border-t pt-4 text-xs">
                    <div>
                      <dt>Analyzed claims</dt>
                      <dd className="tabular text-foreground text-sm font-medium">
                        {latestScore.claimCount}
                      </dd>
                    </div>
                    <div>
                      <dt>Source count</dt>
                      <dd className="tabular text-foreground text-sm font-medium">
                        {latestScore.sourceCount}
                      </dd>
                    </div>
                    <div>
                      <dt>Methodology</dt>
                      <dd className="text-foreground text-sm font-medium">
                        <Link href="/methodology" className="hover:underline">
                          v{latestScore.methodologyVersion}
                        </Link>
                      </dd>
                    </div>
                    <div>
                      <dt>Calculated</dt>
                      <dd className="text-foreground text-sm font-medium">
                        {formatDate(latestScore.calculatedAt)}
                      </dd>
                    </div>
                  </dl>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Container className="space-y-16 py-12">
        {brand.isFictional && <FictionalDataNotice />}

        <Section
          id="breakdown"
          title="Score breakdown"
          description="Each dimension is scored 0–100 by the scoring engine from verified data. Expand a dimension to see how it was calculated."
        >
          {latestScore ? (
            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
              <DimensionBreakdown rows={rows} />
              <div className="bg-card space-y-3 rounded-xl border p-5">
                <h3 className="font-sans text-sm font-semibold">Score history</h3>
                {profile.scoreHistory.length > 1 ? (
                  <ScoreHistoryChart
                    points={profile.scoreHistory.map((s) => ({
                      label: formatMonth(s.calculatedAt),
                      score: s.overallScore,
                      methodologyVersion: s.methodologyVersion,
                    }))}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    One snapshot so far. Each recalculation adds a new snapshot; earlier ones are
                    never overwritten.
                  </p>
                )}
                {scoreDetails?.confidence && (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">
                      Why confidence is {latestScore.confidenceLevel.toLowerCase()}
                    </summary>
                    <ul className="text-muted-foreground mt-2 space-y-1">
                      {scoreDetails.confidence.factors.map((f) => (
                        <li key={f.factor}>
                          {f.factor}: {f.points}/{f.max} — {f.note}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="Score cannot yet be calculated because required review data is incomplete." />
          )}
        </Section>

        <Section
          id="claims"
          title="Sustainability claims"
          description="Only claims that passed human review are shown. Select a claim to inspect its evidence and transparency-risk explanation."
        >
          {claims.length === 0 ? (
            <EmptyState title="No claims have been reviewed yet." />
          ) : (
            <ClaimsExplorer
              claims={claims}
              brandSlug={brand.slug}
              brandId={brand.id}
              brandName={brand.name}
            />
          )}
        </Section>

        <Section
          id="gaps"
          title="Transparency gaps"
          description="Generated automatically from the stored review data at the time of the latest score calculation."
        >
          <TransparencyGaps gaps={scoreDetails?.gaps ?? []} />
        </Section>

        <Section
          id="certifications"
          title="Certifications"
          description="Certifications apply only to the stated scope — they do not imply that the entire company is certified."
        >
          <CertificationList certifications={certifications} asOf={new Date()} />
        </Section>

        <Section
          id="targets"
          title="Targets & progress"
          description="Each target is checked for a specific scope, quantitative metric, baseline, deadline, progress update and historical comparison."
        >
          <TargetList targets={targets} />
        </Section>

        <Section
          id="sources"
          title="Reviewed sources"
          description={
            latestAudit
              ? `Accessibility audit (${formatDate(latestAudit.reviewedAt)}): key evidence reached in ${latestAudit.clickCount ?? "?"} clicks from the brand homepage.`
              : undefined
          }
        >
          <SourceList sources={sources} />
        </Section>

        <MethodologyDisclaimer />
      </Container>
    </>
  );
}
