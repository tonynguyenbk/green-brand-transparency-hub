import { ArrowRightIcon, FileSearchIcon, LayersIcon, ScaleIcon } from "lucide-react";
import Link from "next/link";
import { BrandCard } from "@/components/brand/brand-card";
import { BrandSearchForm } from "@/components/brand/brand-search-form";
import { Container, Section } from "@/components/layout/page-header";
import {
  EmptyState,
  FictionalDataNotice,
  MethodologyDisclaimer,
} from "@/components/layout/notices";
import { RiskBadge } from "@/components/scoring/badges";
import { Button } from "@/components/ui/button";
import { checkClaim } from "@/lib/claims/checker";
import {
  CLAIM_RISK_WEIGHTS,
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  OVERALL_WEIGHTS,
  RISK_THRESHOLDS,
  formatScore,
} from "@/lib/scoring";
import { getFeaturedBrands, listPublicBrands } from "@/lib/services/brand-service";

export const dynamic = "force-dynamic";

const DIMENSION_BLURBS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  disclosure:
    "Does the brand publicly report emissions, materials, supply chain, waste, water and its methodology?",
  evidence:
    "Is each verified claim backed by quantitative, sourced and methodologically explained evidence?",
  verification: "Are claims supported by recognised certifications or independent assurance?",
  targets: "Do targets have a metric, baseline, deadline and reported progress?",
  accessibility: "Can a consumer actually find and read the evidence within a few clicks?",
};

const WEAK_CLAIM = "Our packaging is 100% eco-friendly.";
const STRONG_CLAIM =
  "Our mailer bags contain 80% post-consumer recycled paper, certified by an independent body, compared with a 2023 baseline. Source: 2025 impact report.";

export default async function HomePage() {
  const [featured, all] = await Promise.all([
    getFeaturedBrands(3),
    listPublicBrands({ sort: "score_desc" }),
  ]);
  const weak = checkClaim(WEAK_CLAIM);
  const strong = checkClaim(STRONG_CLAIM);
  const hasFictional = all.some((b) => b.isFictional);
  const preview = all.filter((b) => b.score).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="bg-card border-b">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Sustainability communication · Evidence · Transparency
            </p>
            <h1 className="text-4xl leading-[1.08] font-semibold sm:text-5xl">
              How transparent is the sustainability story behind the brands you buy?
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Explore sustainability claims, inspect supporting evidence, and compare how
              transparently brands communicate environmental commitments.
            </p>
            <BrandSearchForm size="lg" className="max-w-xl" />
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Button asChild variant="outline">
                <Link href="/claim-checker">Check a claim</Link>
              </Button>
              <Link href="/brands" className="text-primary font-medium hover:underline">
                Browse all brands →
              </Link>
            </div>
          </div>
          <dl className="bg-border grid grid-cols-2 gap-px overflow-hidden rounded-xl border text-sm">
            {[
              { k: "Transparency dimensions", v: "5" },
              { k: "Claim-risk components", v: "5" },
              { k: "Evidence levels", v: "0–5" },
              { k: "Brands reviewed", v: String(all.length) },
            ].map((item) => (
              <div key={item.k} className="bg-background p-5">
                <dt className="text-muted-foreground">{item.k}</dt>
                <dd className="tabular mt-1 font-serif text-3xl font-semibold">{item.v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="space-y-20 py-14">
        {hasFictional && <FictionalDataNotice />}

        {/* Featured brands */}
        <Section
          id="featured"
          title="Recently reviewed brands"
          description="Each profile links every verified claim to its public evidence."
          actions={
            <Link href="/brands" className="text-primary text-sm font-medium hover:underline">
              View directory →
            </Link>
          }
        >
          {featured.length === 0 ? (
            <EmptyState
              title="No brands have been published yet."
              description="Published brand profiles will appear here."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {featured.map((b) => (
                <BrandCard key={b.id} brand={b} />
              ))}
            </div>
          )}
        </Section>

        {/* How scoring works */}
        <Section
          id="how-scoring-works"
          title="How the Green Transparency Score works"
          description="The score measures how openly and verifiably a brand communicates — not how sustainable its operations are."
        >
          <ol className="grid gap-4 md:grid-cols-5">
            {DIMENSION_KEYS.map((key, i) => (
              <li key={key} className="bg-card rounded-xl border p-4">
                <p className="tabular text-muted-foreground text-xs font-semibold">0{i + 1}</p>
                <p className="mt-2 font-medium">{DIMENSION_LABELS[key]}</p>
                <p className="tabular text-primary mt-1 font-serif text-2xl font-semibold">
                  {Math.round(OVERALL_WEIGHTS[key] * 100)}%
                </p>
                <p className="text-muted-foreground mt-2 text-sm">{DIMENSION_BLURBS[key]}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Claim risk */}
        <Section
          id="claim-risk"
          title="Green Claim Transparency Risk"
          description={
            <>
              Instead of labelling claims, each one is scored on specificity (
              {CLAIM_RISK_WEIGHTS.specificity * 100}%), evidence (
              {CLAIM_RISK_WEIGHTS.evidence * 100}%), measurability (
              {CLAIM_RISK_WEIGHTS.measurability * 100}%), verification (
              {CLAIM_RISK_WEIGHTS.verification * 100}%) and context (
              {CLAIM_RISK_WEIGHTS.context * 100}%). Risk = 100 − transparency strength: 0–
              {RISK_THRESHOLDS.lowMax} low, {RISK_THRESHOLDS.lowMax + 1}–
              {RISK_THRESHOLDS.moderateMax} moderate, {RISK_THRESHOLDS.moderateMax + 1}–100 high.
            </>
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { title: "Broad wording", claim: WEAK_CLAIM, result: weak },
              { title: "Specific and verifiable wording", claim: STRONG_CLAIM, result: strong },
            ].map(({ title, claim, result }) => (
              <figure key={title} className="bg-card flex flex-col rounded-xl border p-5">
                <figcaption className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {title}
                  </span>
                  <RiskBadge level={result.riskLevel} score={result.riskScore} />
                </figcaption>
                <blockquote className="mt-4 font-serif text-lg leading-snug">“{claim}”</blockquote>
                <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
                  {result.issues.slice(0, 3).map((issue) => (
                    <li key={issue}>• {issue}</li>
                  ))}
                  {result.issues.length === 0 &&
                    result.detectedMeasurableInformation
                      .slice(0, 4)
                      .map((d) => <li key={d.signal}>✓ {d.label}</li>)}
                </ul>
              </figure>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Rule-based examples from the{" "}
            <Link href="/claim-checker" className="text-primary font-medium hover:underline">
              Claim Checker
            </Link>
            . Broad terms are not misleading by themselves — the risk reflects how much verifiable
            context is provided.
          </p>
        </Section>

        {/* Comparison preview */}
        <Section
          id="comparison-preview"
          title="Comparison preview"
          description="Compare up to four brands dimension by dimension."
          actions={
            preview.length >= 2 ? (
              <Button asChild size="sm">
                <Link
                  href={`/compare?brands=${preview
                    .slice(0, 2)
                    .map((b) => b.slug)
                    .join(",")}`}
                >
                  Open comparison <ArrowRightIcon />
                </Link>
              </Button>
            ) : null
          }
        >
          {preview.length === 0 ? (
            <EmptyState title="No scored brands yet." />
          ) : (
            <div className="bg-card overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="sr-only">Green Transparency Scores of reviewed brands</caption>
                <thead className="bg-muted/50 text-muted-foreground border-b text-left text-xs">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Brand
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Industry
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Score
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Avg. claim risk
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((b) => (
                    <tr key={b.id}>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        <Link href={`/brands/${b.slug}`} className="hover:underline">
                          {b.name}
                        </Link>
                      </th>
                      <td className="text-muted-foreground px-4 py-3">{b.industry.name}</td>
                      <td className="tabular px-4 py-3 text-right font-semibold">
                        {formatScore(b.score!.overall)}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={b.score!.riskLevel} score={b.score!.averageClaimRisk} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Research angle */}
        <section
          aria-labelledby="research-angle"
          className="bg-card grid gap-8 rounded-2xl border p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr]"
        >
          <div className="space-y-3">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Marketing research angle
            </p>
            <h2 id="research-angle" className="text-2xl font-semibold">
              Can transparency tools reduce information asymmetry — and shape trust?
            </h2>
            <p className="text-muted-foreground">
              Brands know far more about their supply chains and emissions than consumers do. The
              Hub structures that fragmented communication so its effect on perceived credibility,
              brand trust and purchase intention can be studied.
            </p>
            <Link
              href="/research"
              className="text-primary inline-block text-sm font-medium hover:underline"
            >
              Read the research framework →
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: LayersIcon,
                t: "Information asymmetry",
                d: "Consolidating evidence lowers the cost of evaluating a claim.",
              },
              {
                icon: FileSearchIcon,
                t: "Signaling theory",
                d: "Specific, verifiable claims are stronger signals than vague ones.",
              },
              {
                icon: ScaleIcon,
                t: "Trust transfer",
                d: "Independent verification may transfer credibility to the brand.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="bg-background rounded-lg border p-4">
                <Icon className="text-primary size-5" aria-hidden="true" />
                <p className="mt-3 font-medium">{t}</p>
                <p className="text-muted-foreground mt-1 text-sm">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Methodology CTA + disclaimer */}
        <section aria-labelledby="methodology-cta" className="space-y-6">
          <div className="bg-primary text-primary-foreground flex flex-col items-start justify-between gap-4 rounded-2xl px-6 py-8 sm:flex-row sm:items-center sm:px-10">
            <div className="space-y-1">
              <h2 id="methodology-cta" className="text-2xl font-semibold">
                A transparency tool should be transparent too.
              </h2>
              <p className="text-primary-foreground/80">
                Every formula, weight, threshold and limitation is published and versioned.
              </p>
            </div>
            <Button asChild variant="secondary" size="lg">
              <Link href="/methodology">Read the methodology</Link>
            </Button>
          </div>
          <MethodologyDisclaimer />
        </section>
      </Container>
    </>
  );
}
