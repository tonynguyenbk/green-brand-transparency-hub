import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { BrandCard } from "@/components/brand/brand-card";
import { BrandFilters } from "@/components/brand/brand-filters";
import { Container, PageHeader } from "@/components/layout/page-header";
import { EmptyState, FictionalDataNotice } from "@/components/layout/notices";
import { listIndustries, listPublicBrands } from "@/lib/services/brand-service";
import { brandDirectoryQuerySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Brand directory" };

export default async function BrandsPage(props: PageProps<"/brands">) {
  const raw = await props.searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const filters = brandDirectoryQuerySchema.parse(flat);

  const [brands, industries] = await Promise.all([listPublicBrands(filters), listIndustries()]);
  const active = Object.values(filters).some((v) => v !== undefined && v !== "score_desc");

  return (
    <Container className="space-y-8 py-10">
      <PageHeader
        eyebrow="Directory"
        title="Brands"
        description="Browse published brand profiles. Scores reflect the transparency of sustainability communication according to the current methodology."
      />
      <Suspense>
        <BrandFilters industries={industries} />
      </Suspense>

      {brands.some((b) => b.isFictional) && <FictionalDataNotice />}

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {brands.length} {brands.length === 1 ? "brand" : "brands"}
        {filters.q ? ` matching “${filters.q}”` : ""}
      </p>

      {brands.length === 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title="No brands match these filters."
          description={
            active
              ? "Try broadening the score range or clearing the search."
              : "No brand profiles have been published yet."
          }
        >
          {active && (
            <Link href="/brands" className="text-primary text-sm font-medium hover:underline">
              Clear filters
            </Link>
          )}
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <li key={b.id}>
              <BrandCard brand={b} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
