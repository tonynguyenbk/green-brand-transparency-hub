import Link from "next/link";
import { AdminHeader, AdminTable, RowLink, StatusPill } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { formatScore } from "@/lib/scoring/labels";
import { listBrandsAdmin } from "@/lib/services/admin-service";
import { formatDate } from "@/lib/utils/format";

export default async function AdminBrandsPage() {
  const brands = await listBrandsAdmin();
  return (
    <>
      <AdminHeader
        title="Brands"
        actions={
          <Button asChild size="sm">
            <Link href="/admin/brands/new">New brand</Link>
          </Button>
        }
      />
      <AdminTable
        head={["Brand", "Industry", "Status", "Claims", "Sources", "Score", "Fictional", "Updated"]}
        empty={brands.length === 0}
      >
        {brands.map((b) => (
          <tr key={b.id}>
            <td className="px-4 py-2.5">
              <RowLink href={`/admin/brands/${b.id}`}>{b.name}</RowLink>
            </td>
            <td className="px-4 py-2.5">{b.industry.name}</td>
            <td className="px-4 py-2.5">
              <StatusPill status={b.status} />
            </td>
            <td className="tabular px-4 py-2.5">{b._count.claims}</td>
            <td className="tabular px-4 py-2.5">{b._count.sources}</td>
            <td className="tabular px-4 py-2.5">
              {b.scores[0] ? formatScore(b.scores[0].overallScore) : "—"}
            </td>
            <td className="px-4 py-2.5">{b.isFictional ? "Yes" : "No"}</td>
            <td className="px-4 py-2.5">{formatDate(b.updatedAt)}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
