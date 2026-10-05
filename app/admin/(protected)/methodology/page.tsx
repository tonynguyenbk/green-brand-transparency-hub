import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, AdminTable, Panel } from "@/components/admin/admin-ui";
import { MethodologyForm } from "@/components/admin/entity-forms";
import { activateMethodologyAction } from "@/lib/admin/actions";
import { listMethodologyVersions } from "@/lib/services/admin-service";
import { formatDate } from "@/lib/utils/format";

export default async function AdminMethodologyPage() {
  const versions = await listMethodologyVersions();
  return (
    <>
      <AdminHeader
        title="Methodology versions"
        description="Snapshots record the version they were calculated with. Activating a new version never changes existing snapshots."
      />
      <AdminTable
        head={["Version", "Title", "Weights (D/E/V/T/A)", "Published", "Status", ""]}
        empty={versions.length === 0}
      >
        {versions.map((v) => {
          const w =
            (v.weightsJson as { overallWeights?: Record<string, number> }).overallWeights ?? {};
          return (
            <tr key={v.id}>
              <td className="px-4 py-2.5 font-medium">v{v.version}</td>
              <td className="px-4 py-2.5">{v.title}</td>
              <td className="tabular px-4 py-2.5 text-xs">
                {[w.disclosure, w.evidence, w.verification, w.targets, w.accessibility]
                  .map((x) => (x ?? "?").toString())
                  .join(" / ")}
              </td>
              <td className="px-4 py-2.5">{formatDate(v.publishedAt)}</td>
              <td className="px-4 py-2.5">{v.active ? "Active" : "Inactive"}</td>
              <td className="px-4 py-2.5">
                {!v.active && (
                  <ActionButton
                    action={activateMethodologyAction.bind(null, v.id)}
                    confirm={`Activate methodology v${v.version}?`}
                  >
                    Activate
                  </ActionButton>
                )}
              </td>
            </tr>
          );
        })}
      </AdminTable>
      <Panel title="Create a new version">
        <p className="text-muted-foreground text-sm">
          The current release supports changing the five overall weights. Claim-risk weights and
          thresholds are defined in lib/scoring/config.ts and require a code change plus a new
          version.
        </p>
        <MethodologyForm />
      </Panel>
    </>
  );
}
