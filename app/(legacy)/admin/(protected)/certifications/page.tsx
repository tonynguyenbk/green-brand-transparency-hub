import Link from "next/link";
import { AdminHeader, AdminTable, BrandFilterLinks, RowLink } from "@/components/admin/admin-ui";
import { VerificationStatusBadge } from "@/components/evidence/evidence-lists";
import { Button } from "@/components/ui/button";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { listCertifications } from "@/lib/services/evidence-service";
import { formatDate } from "@/lib/utils/format";

export default async function AdminCertificationsPage(props: PageProps<"/admin/certifications">) {
  const { brandId } = await props.searchParams;
  const current = typeof brandId === "string" ? brandId : undefined;
  const [certs, brands] = await Promise.all([listCertifications(current), listBrandOptionsAdmin()]);
  return (
    <>
      <AdminHeader
        title="Certifications"
        description="Always record the exact scope. Pending-review certifications are hidden publicly and not scored."
        actions={
          <Button asChild size="sm">
            <Link href={`/admin/certifications/new${current ? `?brandId=${current}` : ""}`}>
              New certification
            </Link>
          </Button>
        }
      />
      <BrandFilterLinks brands={brands} current={current} basePath="/admin/certifications" />
      <AdminTable
        head={["Certification", "Brand", "Body", "Scope", "Valid to", "Status"]}
        empty={certs.length === 0}
      >
        {certs.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-2.5">
              <RowLink href={`/admin/certifications/${c.id}`}>{c.name}</RowLink>
            </td>
            <td className="px-4 py-2.5">{c.brand.name}</td>
            <td className="px-4 py-2.5">{c.certificationBody ?? "—"}</td>
            <td className="text-muted-foreground max-w-xs px-4 py-2.5 text-xs">{c.scope}</td>
            <td className="px-4 py-2.5">{formatDate(c.validTo)}</td>
            <td className="px-4 py-2.5">
              <VerificationStatusBadge
                status={c.verificationStatus}
                expired={c.validTo !== null && c.validTo < new Date()}
              />
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
