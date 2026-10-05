import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import {
  AdminHeader,
  AdminTable,
  CandidateNotice,
  Panel,
  RowLink,
  StatusPill,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { formatScore } from "@/lib/scoring/labels";
import { getAdminDashboard } from "@/lib/services/admin-service";
import { formatDate } from "@/lib/utils/format";

export default async function AdminDashboard() {
  const d = await getAdminDashboard();
  const pending = (d.claimsByStatus.CANDIDATE ?? 0) + (d.claimsByStatus.IN_REVIEW ?? 0);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Review workload, scoring runs and data-quality warnings."
        actions={
          <>
            <Button asChild size="sm">
              <Link href="/admin/brands/new">New brand</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/claims/new">New claim</Link>
            </Button>
          </>
        }
      />
      <CandidateNotice count={pending} />

      <dl className="grid gap-3 sm:grid-cols-4">
        {[
          ["Brands", d.brands.length],
          ["Claims pending review", pending],
          ["Sources", d.sourceCount],
          ["Score snapshots (recent)", d.recentScores.length],
        ].map(([k, v]) => (
          <div key={k} className="bg-card rounded-xl border p-4">
            <dt className="text-muted-foreground text-xs">{k}</dt>
            <dd className="tabular mt-1 font-serif text-3xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <Panel title="Brands">
        <AdminTable
          head={["Brand", "Status", "Claims", "Sources", "Latest score", "Last reviewed"]}
          empty={d.brands.length === 0}
        >
          {d.brands.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-2.5">
                <RowLink href={`/admin/brands/${b.id}`}>{b.name}</RowLink>
              </td>
              <td className="px-4 py-2.5">
                <StatusPill status={b.status} />
              </td>
              <td className="tabular px-4 py-2.5">{b._count.claims}</td>
              <td className="tabular px-4 py-2.5">{b._count.sources}</td>
              <td className="tabular px-4 py-2.5">
                {b.scores[0] ? formatScore(b.scores[0].overallScore) : "—"}
              </td>
              <td className="px-4 py-2.5">{formatDate(b.lastReviewedAt)}</td>
            </tr>
          ))}
        </AdminTable>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Claims pending review"
          actions={
            <Link
              href="/admin/claims?status=CANDIDATE"
              className="text-primary text-sm hover:underline"
            >
              View all
            </Link>
          }
        >
          {d.pendingClaims.length === 0 ? (
            <p className="text-muted-foreground text-sm">No claims are awaiting review.</p>
          ) : (
            <ul className="divide-y text-sm">
              {d.pendingClaims.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 py-2">
                  <Link href={`/admin/claims/${c.id}`} className="line-clamp-2 hover:underline">
                    {c.claimText}
                    <span className="text-muted-foreground block text-xs">
                      {c.brand.name} · {c.origin}
                    </span>
                  </Link>
                  <StatusPill status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Last scoring runs">
          {d.recentScores.length === 0 ? (
            <p className="text-muted-foreground text-sm">No scores calculated yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {d.recentScores.map((s) => (
                <li key={s.id} className="flex justify-between gap-3 py-2">
                  <span>
                    {s.brand.name}
                    <span className="text-muted-foreground block text-xs">
                      {formatDate(s.calculatedAt)} · v{s.methodologyVersion} · {s.sourceCount}{" "}
                      sources
                    </span>
                  </span>
                  <span className="tabular font-semibold">{formatScore(s.overallScore)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Data-quality warnings">
        {d.warnings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No warnings.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {d.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangleIcon
                  className="text-risk-moderate mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <Link href={`/admin/brands/${w.brandId}`} className="font-medium hover:underline">
                    {w.brand}
                  </Link>
                  : {w.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
