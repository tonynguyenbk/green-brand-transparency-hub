import { CheckCircle2Icon, CircleIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/action-button";
import {
  AdminHeader,
  AdminTable,
  CandidateNotice,
  Panel,
  RowLink,
  StatusPill,
} from "@/components/admin/admin-ui";
import { BrandForm, DisclosureForm } from "@/components/admin/entity-forms";
import { RiskBadge } from "@/components/scoring/badges";
import { Button } from "@/components/ui/button";
import {
  deleteBrandAction,
  recalculateScoreAction,
  setBrandStatusAction,
} from "@/lib/admin/actions";
import { brandToForm } from "@/lib/admin/form-values";
import { DIMENSION_KEYS, DIMENSION_LABELS, formatScore } from "@/lib/scoring";
import { getBrandAdmin, listIndustriesAdmin } from "@/lib/services/admin-service";
import { getDisclosureItems } from "@/lib/services/evidence-service";
import { previewBrandAssessment } from "@/lib/services/scoring-service";
import { formatDate } from "@/lib/utils/format";

export default async function AdminBrandPage(props: PageProps<"/admin/brands/[id]">) {
  const { id } = await props.params;
  const brand = await getBrandAdmin(id);
  if (!brand) notFound();
  const [industries, disclosure, preview] = await Promise.all([
    listIndustriesAdmin(),
    getDisclosureItems(brand.id),
    previewBrandAssessment(brand.id),
  ]);

  const verifiedClaims = brand.claims.filter(
    (c) => c.status === "VERIFIED" || c.status === "PUBLISHED",
  );
  const pendingClaims = brand.claims.filter(
    (c) => c.status === "CANDIDATE" || c.status === "IN_REVIEW",
  );
  const steps = [
    ["Brand created", true],
    ["Sources added", brand.sources.length > 0],
    ["Claims added", brand.claims.length > 0],
    ["Claims verified", verifiedClaims.length > 0],
    ["Disclosure checklist assessed", disclosure.every((d) => d.state !== "PENDING_REVIEW")],
    [
      "Certifications / targets reviewed",
      brand.certifications.length + brand.targets.length > 0 ||
        brand.targetsDataState === "NOT_FOUND",
    ],
    ["Accessibility audit completed", brand.accessibilityAudits.length > 0],
    ["Score calculated", brand.scores.length > 0],
    ["Profile published", brand.status === "PUBLISHED"],
  ] as const;

  return (
    <>
      <AdminHeader
        title={brand.name}
        description={`${brand.industry.name} · /brands/${brand.slug}`}
        actions={
          <>
            {brand.status === "PUBLISHED" && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/brands/${brand.slug}`}>
                  View public profile <ExternalLinkIcon />
                </Link>
              </Button>
            )}
            <ActionButton
              action={recalculateScoreAction.bind(null, brand.id)}
              variant="default"
              testId="recalculate-score"
            >
              Recalculate score
            </ActionButton>
            {brand.status !== "PUBLISHED" ? (
              <ActionButton action={setBrandStatusAction.bind(null, brand.id, "PUBLISHED")}>
                Publish profile
              </ActionButton>
            ) : (
              <ActionButton action={setBrandStatusAction.bind(null, brand.id, "DRAFT")}>
                Unpublish
              </ActionButton>
            )}
          </>
        }
      />
      {pendingClaims.length > 0 && <CandidateNotice count={pendingClaims.length} />}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Panel title="Recalculation preview" className="order-2 xl:order-1">
          {preview.overall === null ? (
            <p className="text-risk-moderate text-sm">{preview.unavailableReason}</p>
          ) : (
            <p className="text-sm">
              Recalculating now would create a snapshot of{" "}
              <strong className="tabular">{formatScore(preview.overall)} / 100</strong> with{" "}
              {preview.confidence.level.toLowerCase()} confidence ({preview.claimCount} verified
              claims, {preview.sourceCount} verified sources, methodology v
              {preview.methodologyVersion}).
            </p>
          )}
          <dl className="grid gap-2 text-sm sm:grid-cols-5">
            {DIMENSION_KEYS.map((k) => (
              <div key={k} className="bg-muted/60 rounded-md p-2">
                <dt className="text-muted-foreground text-xs">{DIMENSION_LABELS[k]}</dt>
                <dd className="tabular font-semibold">
                  {formatScore(preview.dimensions[k].score)}
                </dd>
                {preview.dimensions[k].unavailableReason && (
                  <dd className="text-risk-moderate text-xs">
                    {preview.dimensions[k].unavailableReason}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Workflow" className="order-1 xl:order-2">
          <ol className="space-y-1.5 text-sm">
            {steps.map(([label, done]) => (
              <li key={label} className="flex items-center gap-2">
                {done ? (
                  <CheckCircle2Icon className="text-risk-low size-4" aria-label="done" />
                ) : (
                  <CircleIcon className="text-muted-foreground size-4" aria-label="to do" />
                )}
                {label}
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="Brand details">
        <BrandForm
          id={brand.id}
          initial={brandToForm(brand)}
          industries={industries.map((i) => ({ value: i.id, label: i.name }))}
        />
      </Panel>

      <Panel
        title="Disclosure checklist"
        actions={
          <span className="text-muted-foreground text-xs">
            Feeds the Sustainability Disclosure dimension
          </span>
        }
      >
        <DisclosureForm
          brandId={brand.id}
          initial={disclosure.map((d) => ({
            topic: d.topic,
            state: d.state,
            level: d.level ?? "",
            notes: d.notes ?? "",
          }))}
        />
      </Panel>

      <Panel
        title={`Claims (${brand.claims.length})`}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/claims/new?brandId=${brand.id}`}>Add claim</Link>
          </Button>
        }
      >
        <AdminTable head={["Claim", "Status", "Risk", "Updated"]} empty={brand.claims.length === 0}>
          {brand.claims.map((c) => (
            <tr key={c.id}>
              <td className="max-w-md px-4 py-2.5">
                <RowLink href={`/admin/claims/${c.id}`}>
                  <span className="line-clamp-2">{c.claimText}</span>
                </RowLink>
              </td>
              <td className="px-4 py-2.5">
                <StatusPill status={c.status} />
              </td>
              <td className="px-4 py-2.5">
                <RiskBadge level={c.riskLevel} score={c.riskScore} withLabel={false} />
              </td>
              <td className="px-4 py-2.5">{formatDate(c.updatedAt)}</td>
            </tr>
          ))}
        </AdminTable>
      </Panel>

      <Panel
        title={`Sources (${brand.sources.length})`}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/sources/new?brandId=${brand.id}`}>Add source</Link>
          </Button>
        }
      >
        <AdminTable
          head={["Title", "Type", "Status", "Published"]}
          empty={brand.sources.length === 0}
        >
          {brand.sources.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-2.5">
                <RowLink href={`/admin/sources/${s.id}`}>{s.title}</RowLink>
              </td>
              <td className="px-4 py-2.5">{s.sourceType}</td>
              <td className="px-4 py-2.5">
                <StatusPill status={s.status} />
              </td>
              <td className="px-4 py-2.5">{formatDate(s.publicationDate)}</td>
            </tr>
          ))}
        </AdminTable>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title={`Certifications (${brand.certifications.length})`}
          actions={
            <Link
              className="text-primary text-sm hover:underline"
              href={`/admin/certifications/new?brandId=${brand.id}`}
            >
              Add
            </Link>
          }
        >
          <ul className="space-y-1 text-sm">
            {brand.certifications.map((c) => (
              <li key={c.id}>
                <RowLink href={`/admin/certifications/${c.id}`}>{c.name}</RowLink>
              </li>
            ))}
            {brand.certifications.length === 0 && <li className="text-muted-foreground">None</li>}
          </ul>
        </Panel>
        <Panel
          title={`Targets (${brand.targets.length})`}
          actions={
            <Link
              className="text-primary text-sm hover:underline"
              href={`/admin/targets/new?brandId=${brand.id}`}
            >
              Add
            </Link>
          }
        >
          <ul className="space-y-1 text-sm">
            {brand.targets.map((t) => (
              <li key={t.id}>
                <RowLink href={`/admin/targets/${t.id}`}>{t.title}</RowLink>
              </li>
            ))}
            {brand.targets.length === 0 && <li className="text-muted-foreground">None</li>}
          </ul>
        </Panel>
        <Panel
          title={`Accessibility audits (${brand.accessibilityAudits.length})`}
          actions={
            <Link
              className="text-primary text-sm hover:underline"
              href={`/admin/audits/new?brandId=${brand.id}`}
            >
              Add
            </Link>
          }
        >
          <ul className="space-y-1 text-sm">
            {brand.accessibilityAudits.map((a) => (
              <li key={a.id}>
                <RowLink href={`/admin/audits/${a.id}`}>
                  {formatDate(a.reviewedAt)} — {a.clickCount ?? "?"} clicks
                </RowLink>
              </li>
            ))}
            {brand.accessibilityAudits.length === 0 && (
              <li className="text-muted-foreground">None</li>
            )}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Score snapshots"
        actions={
          <span className="text-muted-foreground text-xs">
            Immutable — each recalculation adds a row
          </span>
        }
      >
        <AdminTable
          head={[
            "Calculated",
            "Overall",
            "Disc.",
            "Evid.",
            "Verif.",
            "Targets",
            "Access.",
            "Confidence",
            "Sources",
            "Version",
          ]}
          empty={brand.scores.length === 0}
        >
          {brand.scores.map((s) => (
            <tr key={s.id} className="tabular">
              <td className="px-4 py-2">{formatDate(s.calculatedAt)}</td>
              <td className="px-4 py-2 font-semibold">{formatScore(s.overallScore)}</td>
              <td className="px-4 py-2">{formatScore(s.disclosureScore)}</td>
              <td className="px-4 py-2">{formatScore(s.evidenceScore)}</td>
              <td className="px-4 py-2">{formatScore(s.verificationScore)}</td>
              <td className="px-4 py-2">{formatScore(s.targetsScore)}</td>
              <td className="px-4 py-2">{formatScore(s.accessibilityScore)}</td>
              <td className="px-4 py-2">{s.confidenceLevel}</td>
              <td className="px-4 py-2">{s.sourceCount}</td>
              <td className="px-4 py-2">v{s.methodologyVersion}</td>
            </tr>
          ))}
        </AdminTable>
      </Panel>

      <Panel title="Danger zone">
        <ActionButton
          action={deleteBrandAction.bind(null, brand.id)}
          variant="destructive"
          confirm={`Delete ${brand.name} and all of its sources, claims, certifications, targets, audits and score snapshots?`}
          redirectTo="/admin/brands"
        >
          Delete brand
        </ActionButton>
      </Panel>
    </>
  );
}
