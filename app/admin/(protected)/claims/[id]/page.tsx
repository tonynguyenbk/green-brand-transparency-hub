import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, CandidateNotice, Panel, StatusPill } from "@/components/admin/admin-ui";
import { ClaimForm, EvidenceLinkForm } from "@/components/admin/entity-forms";
import { LinkStrengthBadge, RiskBadge } from "@/components/scoring/badges";
import { deleteClaimAction, setClaimStatusAction, unlinkEvidenceAction } from "@/lib/admin/actions";
import { claimToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { getClaim } from "@/lib/services/claim-service";
import { listSources } from "@/lib/services/evidence-service";
import { formatDate } from "@/lib/utils/format";
import type { ClaimStatus } from "@prisma/client";

const TRANSITIONS: { status: ClaimStatus; label: string; variant: "default" | "outline" }[] = [
  { status: "IN_REVIEW", label: "Mark in review", variant: "outline" },
  { status: "VERIFIED", label: "Mark verified", variant: "default" },
  { status: "PUBLISHED", label: "Publish", variant: "outline" },
  { status: "ARCHIVED", label: "Archive", variant: "outline" },
  { status: "CANDIDATE", label: "Back to candidate", variant: "outline" },
];

export default async function AdminClaimPage(props: PageProps<"/admin/claims/[id]">) {
  const { id } = await props.params;
  const claim = await getClaim(id);
  if (!claim) notFound();
  const [brands, sources] = await Promise.all([
    listBrandOptionsAdmin(),
    listSources(claim.brandId),
  ]);
  const linked = new Set(claim.claimSources.map((cs) => cs.sourceId));
  const affectsScore = claim.status === "VERIFIED" || claim.status === "PUBLISHED";

  return (
    <>
      <AdminHeader
        title="Review claim"
        description={`${claim.brand.name} · created ${formatDate(claim.createdAt)} · origin: ${claim.origin}`}
        actions={
          <Link
            href={`/admin/brands/${claim.brandId}`}
            className="text-primary text-sm hover:underline"
          >
            Back to brand
          </Link>
        }
      />
      {!affectsScore && <CandidateNotice />}

      <Panel title="Status">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={claim.status} />
          <RiskBadge level={claim.riskLevel} score={claim.riskScore} />
          <span className="text-muted-foreground text-sm">
            {affectsScore
              ? "Included in the next score recalculation."
              : "Not included in public scores."}
          </span>
        </div>
        <div className="flex flex-wrap gap-2" data-testid="claim-status-actions">
          {TRANSITIONS.filter((t) => t.status !== claim.status).map((t) => (
            <ActionButton
              key={t.status}
              action={setClaimStatusAction.bind(null, claim.id, t.status)}
              variant={t.variant}
              testId={`status-${t.status}`}
            >
              {t.label}
            </ActionButton>
          ))}
        </div>
      </Panel>

      <Panel title="Claim & rubric">
        <ClaimForm
          id={claim.id}
          initial={claimToForm(claim)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Panel>

      <Panel title={`Linked evidence (${claim.claimSources.length})`}>
        {claim.claimSources.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sources linked yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {claim.claimSources.map((cs) => (
              <li key={cs.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="space-y-1">
                  <p className="font-medium">
                    {cs.source.title} <StatusPill status={cs.source.status} />
                  </p>
                  {cs.evidenceExcerpt && (
                    <p className="text-muted-foreground italic">“{cs.evidenceExcerpt}”</p>
                  )}
                  {cs.pageNumber && (
                    <p className="text-muted-foreground text-xs">Page {cs.pageNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <LinkStrengthBadge strength={cs.evidenceStrength} />
                  <ActionButton
                    action={unlinkEvidenceAction.bind(null, cs.id)}
                    variant="ghost"
                    confirm="Remove this evidence link?"
                  >
                    Remove
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t pt-4">
          <h3 className="mb-3 font-sans text-sm font-semibold">Link a source</h3>
          <EvidenceLinkForm
            claimId={claim.id}
            sources={sources.map((s) => ({
              value: s.id,
              label: `${s.title}${linked.has(s.id) ? " (linked — will update)" : ""}`,
            }))}
          />
        </div>
      </Panel>

      <Panel title="Danger zone">
        <ActionButton
          action={deleteClaimAction.bind(null, claim.id)}
          variant="destructive"
          confirm="Delete this claim permanently?"
          redirectTo="/admin/claims"
        >
          Delete claim
        </ActionButton>
      </Panel>
    </>
  );
}
