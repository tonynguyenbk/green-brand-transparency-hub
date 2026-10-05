import Link from "next/link";
import { AdminHeader, AdminTable, BrandFilterLinks, RowLink } from "@/components/admin/admin-ui";
import { VerificationStatusBadge } from "@/components/evidence/evidence-lists";
import { Button } from "@/components/ui/button";
import { evaluateTarget, formatScore } from "@/lib/scoring";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { listTargets } from "@/lib/services/evidence-service";

export default async function AdminTargetsPage(props: PageProps<"/admin/targets">) {
  const { brandId } = await props.searchParams;
  const current = typeof brandId === "string" ? brandId : undefined;
  const [targets, brands] = await Promise.all([listTargets(current), listBrandOptionsAdmin()]);
  return (
    <>
      <AdminHeader
        title="Sustainability targets"
        actions={
          <Button asChild size="sm">
            <Link href={`/admin/targets/new${current ? `?brandId=${current}` : ""}`}>
              New target
            </Link>
          </Button>
        }
      />
      <BrandFilterLinks brands={brands} current={current} basePath="/admin/targets" />
      <AdminTable
        head={[
          "Target",
          "Brand",
          "Baseline",
          "Target year",
          "Progress",
          "Criteria score",
          "Status",
        ]}
        empty={targets.length === 0}
      >
        {targets.map((t) => (
          <tr key={t.id}>
            <td className="max-w-xs px-4 py-2.5">
              <RowLink href={`/admin/targets/${t.id}`}>{t.title}</RowLink>
            </td>
            <td className="px-4 py-2.5">{t.brand.name}</td>
            <td className="tabular px-4 py-2.5">
              {t.baselineValue ?? "—"} {t.baselineYear ? `(${t.baselineYear})` : ""}
            </td>
            <td className="tabular px-4 py-2.5">{t.targetYear ?? "—"}</td>
            <td className="tabular px-4 py-2.5">
              {t.latestProgress ?? "—"} {t.progressYear ? `(${t.progressYear})` : ""}
            </td>
            <td className="tabular px-4 py-2.5">{formatScore(evaluateTarget(t).score)}</td>
            <td className="px-4 py-2.5">
              <VerificationStatusBadge status={t.verificationStatus} />
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
