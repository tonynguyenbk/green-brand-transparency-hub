import type { Metadata } from "next";
import Link from "next/link";
import { CompareChart } from "@/components/charts/compare-chart";
import { SERIES_COLORS } from "@/components/charts/palette";
import { BrandPicker } from "@/components/compare/brand-picker";
import { Container, PageHeader, Section } from "@/components/layout/page-header";
import {
  EmptyState,
  FictionalDataNotice,
  MethodologyDisclaimer,
} from "@/components/layout/notices";
import { ConfidenceBadge, RiskBadge } from "@/components/scoring/badges";
import { DIMENSION_KEYS, DIMENSION_LABELS, formatScore } from "@/lib/scoring";
import { listPublicBrandOptions } from "@/lib/services/brand-service";
import {
  MAX_COMPARE,
  MIN_COMPARE,
  compareBrands,
  parseCompareSlugs,
  type ComparisonRow,
} from "@/lib/services/comparison-service";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare brands" };

const SHORT_LABELS: Record<(typeof DIMENSION_KEYS)[number], string> = {
  disclosure: "Disclosure",
  evidence: "Evidence",
  verification: "Verification",
  targets: "Targets",
  accessibility: "Accessibility",
};

export default async function ComparePage(props: PageProps<"/compare">) {
  const { brands } = await props.searchParams;
  const slugs = parseCompareSlugs(brands);
  const [options, result] = await Promise.all([
    listPublicBrandOptions(),
    slugs.length > 0 ? compareBrands(slugs) : Promise.resolve(null),
  ]);
  const rows = result?.rows ?? [];
  const ready = rows.length >= MIN_COMPARE;

  const metricRows: { label: string; render: (r: ComparisonRow) => React.ReactNode }[] = [
    {
      label: "Overall score",
      render: (r) => <strong className="tabular text-base">{formatScore(r.overall)}</strong>,
    },
    ...DIMENSION_KEYS.map((k) => ({
      label: DIMENSION_LABELS[k],
      render: (r: ComparisonRow) => <span className="tabular">{formatScore(r[k])}</span>,
    })),
    {
      label: "Average claim risk",
      render: (r) => (
        <RiskBadge level={r.averageRiskLevel} score={r.averageClaimRisk} withLabel={false} />
      ),
    },
    { label: "Analyzed claims", render: (r) => <span className="tabular">{r.claimCount}</span> },
    { label: "Source count", render: (r) => <span className="tabular">{r.sourceCount}</span> },
    { label: "Confidence", render: (r) => <ConfidenceBadge level={r.confidence} /> },
    {
      label: "Calculated",
      render: (r) => (
        <span className="text-xs">
          {formatDate(r.calculatedAt)} · v{r.methodologyVersion ?? "—"}
        </span>
      ),
    },
  ];

  const chartData = DIMENSION_KEYS.map((k) => ({
    dimension: SHORT_LABELS[k],
    ...Object.fromEntries(rows.map((r) => [r.slug, r[k]])),
  }));

  return (
    <Container className="space-y-10 py-10">
      <PageHeader
        eyebrow="Compare"
        title="Compare brands"
        description="Compare how transparently 2–4 brands communicate sustainability information. Differences describe publicly accessible evidence according to this methodology — not which brand is “greener”."
      />

      <BrandPicker
        options={options.map((o) => ({ slug: o.slug, name: o.name, industry: o.industry.name }))}
        selected={rows.map((r) => r.slug)}
        min={MIN_COMPARE}
        max={MAX_COMPARE}
      />

      {result && result.notFound.length > 0 && (
        <p role="alert" className="text-risk-high text-sm">
          Not found or not published: {result.notFound.join(", ")}
        </p>
      )}

      {!ready ? (
        <EmptyState
          title="Select at least two brands to compare."
          description={
            options.length < 2
              ? "At least two published brands are required."
              : "Use the selector above, then press “Compare brands”."
          }
        />
      ) : (
        <>
          {rows.some((r) => r.isFictional) && <FictionalDataNotice />}

          <Section id="comparison" title="Comparison table">
            <div
              className="bg-card overflow-x-auto rounded-xl border"
              data-testid="comparison-table"
            >
              <table className="w-full min-w-[560px] text-sm">
                <caption className="sr-only">Transparency metrics for the selected brands</caption>
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th
                      scope="col"
                      className="text-muted-foreground px-4 py-3 text-left text-xs font-medium"
                    >
                      Metric
                    </th>
                    {rows.map((r, i) => (
                      <th key={r.slug} scope="col" className="px-4 py-3 text-left">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ background: SERIES_COLORS[i] }}
                            aria-hidden="true"
                          />
                          <Link
                            href={`/brands/${r.slug}`}
                            className="font-semibold hover:underline"
                          >
                            {r.name}
                          </Link>
                        </span>
                        <span className="text-muted-foreground block pl-4.5 text-xs font-normal">
                          {r.industry}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {metricRows.map((m) => (
                    <tr key={m.label}>
                      <th
                        scope="row"
                        className="text-muted-foreground px-4 py-2.5 text-left font-normal"
                      >
                        {m.label}
                      </th>
                      {rows.map((r) => (
                        <td key={r.slug} className="px-4 py-2.5">
                          {r.scored ? (
                            m.render(r)
                          ) : (
                            <span className="text-muted-foreground text-xs">Not yet scored</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            id="chart"
            title="Dimension comparison"
            description="Scores 0–100 per transparency dimension."
          >
            <div className="bg-card rounded-xl border p-4 sm:p-6">
              <CompareChart
                data={chartData}
                series={rows.map((r) => ({ key: r.slug, name: r.name }))}
                caption={`Grouped bar chart comparing ${rows.map((r) => r.name).join(", ")} across five transparency dimensions.`}
              />
            </div>
          </Section>

          {result && result.statements.length > 0 && (
            <Section id="reading" title="How to read this comparison">
              <ul className="bg-card space-y-2 rounded-xl border p-5 text-sm">
                {result.statements.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="text-primary" aria-hidden="true">
                      —
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}

      <MethodologyDisclaimer />
    </Container>
  );
}
