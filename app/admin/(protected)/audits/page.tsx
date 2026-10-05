import Link from "next/link";
import { AdminHeader, AdminTable, BrandFilterLinks, RowLink } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { calculateAccessibilityScore, formatScore } from "@/lib/scoring";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { listAudits } from "@/lib/services/evidence-service";
import { formatDate } from "@/lib/utils/format";

export default async function AdminAuditsPage(props: PageProps<"/admin/audits">) {
  const { brandId } = await props.searchParams;
  const current = typeof brandId === "string" ? brandId : undefined;
  const [audits, brands] = await Promise.all([listAudits(current), listBrandOptionsAdmin()]);
  return (
    <>
      <AdminHeader
        title="Accessibility audits"
        description="The latest audit per brand feeds the Information Accessibility dimension."
        actions={
          <Button asChild size="sm">
            <Link href={`/admin/audits/new${current ? `?brandId=${current}` : ""}`}>New audit</Link>
          </Button>
        }
      />
      <BrandFilterLinks brands={brands} current={current} basePath="/admin/audits" />
      <AdminTable
        head={["Reviewed", "Brand", "Clicks", "Search", "Read", "Linkage", "Dimension score"]}
        empty={audits.length === 0}
      >
        {audits.map((a) => (
          <tr key={a.id} className="tabular">
            <td className="px-4 py-2.5">
              <RowLink href={`/admin/audits/${a.id}`}>{formatDate(a.reviewedAt)}</RowLink>
            </td>
            <td className="px-4 py-2.5">{a.brand.name}</td>
            <td className="px-4 py-2.5">{a.clickCount ?? "—"}</td>
            <td className="px-4 py-2.5">{a.searchabilityScore ?? "—"}</td>
            <td className="px-4 py-2.5">{a.readabilityScore ?? "—"}</td>
            <td className="px-4 py-2.5">{a.evidenceLinkageScore ?? "—"}</td>
            <td className="px-4 py-2.5">{formatScore(calculateAccessibilityScore(a).score)}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
