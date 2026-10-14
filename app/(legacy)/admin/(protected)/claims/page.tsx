import Link from "next/link";
import {
  AdminHeader,
  AdminTable,
  CandidateNotice,
  RowLink,
  StatusPill,
} from "@/components/admin/admin-ui";
import { RiskBadge } from "@/components/scoring/badges";
import { Button } from "@/components/ui/button";
import { listClaims } from "@/lib/services/claim-service";
import { formatDate } from "@/lib/utils/format";
import { CLAIM_STATUSES, humanizeEnum } from "@/lib/validation/enums";
import { cn } from "@/lib/utils";

export default async function AdminClaimsPage(props: PageProps<"/admin/claims">) {
  const { status: rawStatus, brandId: rawBrand } = await props.searchParams;
  const status = CLAIM_STATUSES.find((s) => s === rawStatus);
  const brandId =
    typeof rawBrand === "string" && /^[a-z0-9]+$/i.test(rawBrand) ? rawBrand : undefined;
  const claims = await listClaims({ status, brandId });

  return (
    <>
      <AdminHeader
        title="Claims"
        description="Review workflow: Candidate → In review → Verified → Published (or Archived)."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/claims/new">New claim</Link>
          </Button>
        }
      />
      <CandidateNotice />
      <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5 text-sm">
        {[undefined, ...CLAIM_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/claims?status=${s}` : "/admin/claims"}
            className={cn(
              "rounded-full border px-3 py-1",
              status === s && "border-primary bg-accent",
            )}
          >
            {s ? humanizeEnum(s) : "All"}
          </Link>
        ))}
      </nav>
      <AdminTable
        head={["Claim", "Brand", "Status", "Risk", "Sources", "Origin", "Updated"]}
        empty={claims.length === 0}
      >
        {claims.map((c) => (
          <tr key={c.id}>
            <td className="max-w-sm px-4 py-2.5">
              <RowLink href={`/admin/claims/${c.id}`}>
                <span className="line-clamp-2">{c.claimText}</span>
              </RowLink>
            </td>
            <td className="px-4 py-2.5">{c.brand.name}</td>
            <td className="px-4 py-2.5">
              <StatusPill status={c.status} />
            </td>
            <td className="px-4 py-2.5">
              <RiskBadge level={c.riskLevel} score={c.riskScore} withLabel={false} />
            </td>
            <td className="tabular px-4 py-2.5">{c._count.claimSources}</td>
            <td className="text-muted-foreground px-4 py-2.5 text-xs">{c.origin}</td>
            <td className="px-4 py-2.5">{formatDate(c.updatedAt)}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
