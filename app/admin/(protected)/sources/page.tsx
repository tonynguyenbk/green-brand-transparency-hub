import Link from "next/link";
import {
  AdminHeader,
  AdminTable,
  BrandFilterLinks,
  RowLink,
  StatusPill,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { listSources } from "@/lib/services/evidence-service";
import { formatDate } from "@/lib/utils/format";
import { humanizeEnum } from "@/lib/validation/enums";

export default async function AdminSourcesPage(props: PageProps<"/admin/sources">) {
  const { brandId } = await props.searchParams;
  const current = typeof brandId === "string" ? brandId : undefined;
  const [sources, brands] = await Promise.all([listSources(current), listBrandOptionsAdmin()]);
  return (
    <>
      <AdminHeader
        title="Sources"
        description="Only verified or published sources count towards scores and appear publicly."
        actions={
          <Button asChild size="sm">
            <Link href={`/admin/sources/new${current ? `?brandId=${current}` : ""}`}>
              New source
            </Link>
          </Button>
        }
      />
      <BrandFilterLinks brands={brands} current={current} basePath="/admin/sources" />
      <AdminTable
        head={["Title", "Brand", "Type", "Verification", "Status", "Published", "Linked claims"]}
        empty={sources.length === 0}
      >
        {sources.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-2.5">
              <RowLink href={`/admin/sources/${s.id}`}>{s.title}</RowLink>
            </td>
            <td className="px-4 py-2.5">{s.brand.name}</td>
            <td className="px-4 py-2.5">{humanizeEnum(s.sourceType)}</td>
            <td className="px-4 py-2.5">{humanizeEnum(s.verificationLevel)}</td>
            <td className="px-4 py-2.5">
              <StatusPill status={s.status} />
            </td>
            <td className="px-4 py-2.5">{formatDate(s.publicationDate)}</td>
            <td className="tabular px-4 py-2.5">{s._count.claimSources}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
