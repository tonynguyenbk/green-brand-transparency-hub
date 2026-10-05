import { AlertTriangleIcon, DownloadIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { setStudyStatusAction } from "@/lib/admin/actions";
import { CONSTRUCT_LABELS, SURVEY_ITEMS } from "@/lib/research/instrument";
import {
  CONTROL_KEY,
  SPEEDER_THRESHOLD_SECONDS,
  TREATMENT_KEY,
  getStudyResults,
} from "@/lib/services/research-service";
import { prisma } from "@/lib/db/prisma";
import { humanizeEnum } from "@/lib/validation/enums";

const f = (v: number | null | undefined, d = 2) =>
  v === null || v === undefined ? "—" : v.toFixed(d);
const p = (v: number) => (v < 0.001 ? "< .001" : v.toFixed(3).replace(/^0/, ""));

/** Minimum completed responses per group before inferential statistics are shown prominently. */
const MIN_N_PER_GROUP = 30;

export default async function StudyResultsPage(props: PageProps<"/admin/research/[id]">) {
  const { id } = await props.params;
  const exists = await prisma.researchStudy.findUnique({ where: { id }, select: { id: true } });
  if (!exists) notFound();
  const r = await getStudyResults(id);
  const { study } = r;
  const minN = Math.min(...r.constructs[0].byCondition.map((c) => c.n), Number.POSITIVE_INFINITY);

  return (
    <>
      <AdminHeader
        title={study.title}
        description={`Status: ${humanizeEnum(study.status)} · ${r.completed} completed / ${r.started} started`}
        actions={
          <>
            {study.status === "ACTIVE" && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/study/${study.slug}`}>
                  Participant view <ExternalLinkIcon />
                </Link>
              </Button>
            )}
            {study.status !== "ACTIVE" ? (
              <ActionButton
                action={setStudyStatusAction.bind(null, study.id, "ACTIVE")}
                confirm="Open this study for participants? Make sure consent text and stimulus have been reviewed (and ethics approval obtained where required)."
                testId="open-study"
              >
                Open study
              </ActionButton>
            ) : (
              <ActionButton
                action={setStudyStatusAction.bind(null, study.id, "CLOSED")}
                confirm="Close this study?"
              >
                Close study
              </ActionButton>
            )}
            <Button asChild size="sm" variant="outline">
              <a href={`/api/admin/research/${study.id}/export`}>
                <DownloadIcon /> Export CSV
              </a>
            </Button>
          </>
        }
      />

      <div
        role="note"
        className="border-notice/30 bg-notice-bg text-notice flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
      >
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Exploratory study with convenience sampling — results are not representative. Inferential
          statistics are shown for transparency, but with fewer than {MIN_N_PER_GROUP} completed
          responses per group they should not be interpreted as evidence of an effect. {r.speeders}{" "}
          response(s) were completed in under {SPEEDER_THRESHOLD_SECONDS} seconds and should be
          reviewed (they are not excluded automatically).
        </p>
      </div>

      <Panel title="Results by construct (5-point Likert; treatment = Transparency Hub condition)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm" data-testid="study-results">
            <thead className="text-muted-foreground border-b text-left text-xs">
              <tr>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Construct
                </th>
                {r.constructs[0].byCondition.map((c) => (
                  <th key={c.key} scope="col" className="py-2 pr-3 font-medium">
                    {c.key} — n · M (SD)
                  </th>
                ))}
                <th scope="col" className="py-2 pr-3 font-medium">
                  Cronbach&apos;s α
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Welch t (df)
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  p
                </th>
                <th scope="col" className="py-2 font-medium">
                  Cohen&apos;s d
                </th>
              </tr>
            </thead>
            <tbody className="tabular divide-y">
              {r.constructs.map((c) => (
                <tr key={c.construct}>
                  <th scope="row" className="py-2 pr-3 text-left font-medium">
                    {CONSTRUCT_LABELS[c.construct]}
                    <span className="text-muted-foreground block text-xs font-normal">
                      {c.itemCount} item(s)
                    </span>
                  </th>
                  {c.byCondition.map((g) => (
                    <td key={g.key} className="py-2 pr-3">
                      {g.n} · {f(g.mean)} ({f(g.sd)})
                    </td>
                  ))}
                  <td className="py-2 pr-3">{c.itemCount > 1 ? f(c.alpha) : "n/a"}</td>
                  <td className="py-2 pr-3">
                    {c.welch ? `${f(c.welch.t)} (${f(c.welch.df, 1)})` : "—"}
                  </td>
                  <td className="py-2 pr-3">{c.welch ? p(c.welch.p) : "—"}</td>
                  <td className="py-2">{f(c.welch?.cohensD)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-xs">
          t and d compare {TREATMENT_KEY} − {CONTROL_KEY}. Smallest group currently has{" "}
          {Number.isFinite(minN) ? minN : 0} completed response(s). Welch&apos;s test does not
          assume equal variances; no correction for multiple comparisons is applied.
        </p>
      </Panel>

      <Panel title="Instrument">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {SURVEY_ITEMS.map((i) => (
            <li key={i.id}>
              <span className="text-muted-foreground font-mono text-xs">{i.id}</span> {i.text}{" "}
              <span className="text-muted-foreground text-xs">
                ({CONSTRUCT_LABELS[i.construct]})
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Conditions & consent">
        <ul className="space-y-1 text-sm">
          {study.conditions.map((c) => (
            <li key={c.id}>
              <strong>{c.key}</strong> — {c.name}: {c.description}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground text-sm whitespace-pre-line">{study.consentText}</p>
      </Panel>
    </>
  );
}
