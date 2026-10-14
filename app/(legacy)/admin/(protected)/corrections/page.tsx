import Link from "next/link";
import { AdminHeader, AdminTable, RowLink } from "@/components/admin/admin-ui";
import { listCorrectionReports } from "@/lib/services/correction-service";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import { CORRECTION_STATUSES, humanizeEnum } from "@/lib/validation/enums";

export default async function AdminCorrectionsPage(props: PageProps<"/admin/corrections">) {
  const { status: raw } = await props.searchParams;
  const status = CORRECTION_STATUSES.find((s) => s === raw);
  const reports = await listCorrectionReports(status);

  return (
    <>
      <AdminHeader
        title="Correction reports"
        description="Public reports of missing or incorrect sources, updated data or clarifications. Reports never change data on their own — review, edit the relevant records, then recalculate the score."
      />
      <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5 text-sm">
        {[undefined, ...CORRECTION_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `/admin/corrections?status=${s}` : "/admin/corrections"}
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
        head={["Received", "Brand", "Type", "Claim", "Reporter", "Status"]}
        empty={reports.length === 0}
      >
        {reports.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-2.5">
              <RowLink href={`/admin/corrections/${r.id}`}>{formatDate(r.createdAt)}</RowLink>
            </td>
            <td className="px-4 py-2.5">{r.brand.name}</td>
            <td className="px-4 py-2.5">{humanizeEnum(r.reportType)}</td>
            <td className="text-muted-foreground max-w-xs px-4 py-2.5 text-xs">
              <span className="line-clamp-2">{r.claim?.claimText ?? "Profile in general"}</span>
            </td>
            <td className="px-4 py-2.5">{humanizeEnum(r.reporterRole)}</td>
            <td className="px-4 py-2.5">{humanizeEnum(r.status)}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
