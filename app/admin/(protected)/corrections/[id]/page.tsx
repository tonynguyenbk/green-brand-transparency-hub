import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { CorrectionReviewForm } from "@/components/admin/entity-forms";
import { getCorrectionReport } from "@/lib/services/correction-service";
import { formatDate } from "@/lib/utils/format";
import { humanizeEnum } from "@/lib/validation/enums";

export default async function CorrectionReportPage(props: PageProps<"/admin/corrections/[id]">) {
  const { id } = await props.params;
  const report = await getCorrectionReport(id);
  if (!report) notFound();

  return (
    <>
      <AdminHeader
        title="Correction report"
        description={`${report.brand.name} · received ${formatDate(report.createdAt)}`}
        actions={
          <Link href="/admin/corrections" className="text-primary text-sm hover:underline">
            All reports
          </Link>
        }
      />
      <Panel title={humanizeEnum(report.reportType)}>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">Brand</dt>
          <dd>
            <Link href={`/admin/brands/${report.brand.id}`} className="font-medium hover:underline">
              {report.brand.name}
            </Link>
          </dd>
          <dt className="text-muted-foreground">Claim</dt>
          <dd>
            {report.claim ? (
              <Link href={`/admin/claims/${report.claim.id}`} className="hover:underline">
                {report.claim.claimText}
              </Link>
            ) : (
              "Profile in general"
            )}
          </dd>
          <dt className="text-muted-foreground">Reporter</dt>
          <dd>
            {humanizeEnum(report.reporterRole)}
            {report.reporterEmail && <> · {report.reporterEmail}</>}
          </dd>
          <dt className="text-muted-foreground">Source URL</dt>
          <dd className="break-all">
            {report.sourceUrl ? (
              <a
                href={report.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-primary hover:underline"
              >
                {report.sourceUrl}
              </a>
            ) : (
              "—"
            )}
          </dd>
          <dt className="text-muted-foreground">Details</dt>
          <dd className="whitespace-pre-wrap">{report.message}</dd>
          {report.resolvedAt && (
            <>
              <dt className="text-muted-foreground">Closed</dt>
              <dd>{formatDate(report.resolvedAt)}</dd>
            </>
          )}
        </dl>
        <p className="text-muted-foreground text-xs">
          Treat the URL and text as unverified user input. Check the source yourself before editing
          any record.
        </p>
      </Panel>
      <Panel title="Review">
        <CorrectionReviewForm
          id={report.id}
          initial={{ status: report.status, resolutionNote: report.resolutionNote ?? "" }}
        />
      </Panel>
    </>
  );
}
