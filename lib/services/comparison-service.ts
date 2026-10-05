import { prisma } from "@/lib/db/prisma";
import { DIMENSION_LABELS, classifyRisk, type DimensionKey } from "@/lib/scoring";

export const MIN_COMPARE = 2;
export const MAX_COMPARE = 4;

export interface ComparisonRow {
  slug: string;
  name: string;
  industry: string;
  isFictional: boolean;
  scored: boolean;
  overall: number | null;
  disclosure: number | null;
  evidence: number | null;
  verification: number | null;
  targets: number | null;
  accessibility: number | null;
  averageClaimRisk: number | null;
  averageRiskLevel: "LOW" | "MODERATE" | "HIGH" | null;
  claimCount: number;
  sourceCount: number;
  confidence: "HIGH" | "MEDIUM" | "LOW" | null;
  methodologyVersion: string | null;
  calculatedAt: Date | null;
}

export interface ComparisonResult {
  rows: ComparisonRow[];
  notFound: string[];
  statements: string[];
}

/** Parse "a,b,c" into a de-duplicated slug list (max 4). */
export function parseCompareSlugs(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  return [
    ...new Set(
      value
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, MAX_COMPARE);
}

export async function compareBrands(slugs: string[]): Promise<ComparisonResult> {
  const brands = await prisma.brand.findMany({
    where: { slug: { in: slugs }, status: "PUBLISHED" },
    include: { industry: true, scores: { orderBy: { calculatedAt: "desc" }, take: 1 } },
  });
  const bySlug = new Map(brands.map((b) => [b.slug, b]));
  const rows: ComparisonRow[] = [];
  const notFound: string[] = [];

  for (const slug of slugs) {
    const b = bySlug.get(slug);
    if (!b) {
      notFound.push(slug);
      continue;
    }
    const s = b.scores[0];
    rows.push({
      slug: b.slug,
      name: b.name,
      industry: b.industry.name,
      isFictional: b.isFictional,
      scored: Boolean(s),
      overall: s?.overallScore ?? null,
      disclosure: s?.disclosureScore ?? null,
      evidence: s?.evidenceScore ?? null,
      verification: s?.verificationScore ?? null,
      targets: s?.targetsScore ?? null,
      accessibility: s?.accessibilityScore ?? null,
      averageClaimRisk: s?.averageClaimRisk ?? null,
      averageRiskLevel: s?.averageClaimRisk != null ? classifyRisk(s.averageClaimRisk) : null,
      claimCount: s?.claimCount ?? 0,
      sourceCount: s?.sourceCount ?? 0,
      confidence: s?.confidenceLevel ?? null,
      methodologyVersion: s?.methodologyVersion ?? null,
      calculatedAt: s?.calculatedAt ?? null,
    });
  }

  return { rows, notFound, statements: buildComparisonStatements(rows) };
}

/**
 * Neutral, methodology-scoped comparison sentences. Never "greener":
 * statements describe publicly accessible evidence only.
 */
export function buildComparisonStatements(rows: ComparisonRow[]): string[] {
  const scored = rows.filter((r) => r.scored);
  if (scored.length < 2) return [];
  const statements: string[] = [];
  const top = (key: DimensionKey) => {
    const sorted = [...scored].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
    const [first, second] = sorted;
    if (Math.round(first[key] ?? 0) === Math.round(second[key] ?? 0)) return null;
    return first;
  };

  const evidenceLeader = top("evidence");
  if (evidenceLeader) {
    statements.push(
      `${evidenceLeader.name} currently provides more publicly accessible supporting evidence for its claims according to this methodology.`,
    );
  }
  const verificationLeader = top("verification");
  if (verificationLeader) {
    statements.push(
      `${verificationLeader.name} currently has the most third-party verification mechanisms identified in the reviewed sources.`,
    );
  }
  const accessLeader = top("accessibility");
  if (accessLeader) {
    statements.push(
      `Sustainability information was easiest to locate and navigate for ${accessLeader.name}.`,
    );
  }
  const lowConfidence = scored.filter((r) => r.confidence === "LOW").map((r) => r.name);
  if (lowConfidence.length > 0) {
    statements.push(
      `Assessment confidence is low for ${lowConfidence.join(", ")}; differences should be interpreted with caution.`,
    );
  }
  statements.push(
    `Scores compare the transparency of sustainability communication across ${Object.keys(DIMENSION_LABELS).length} dimensions — not environmental performance.`,
  );
  return statements;
}
