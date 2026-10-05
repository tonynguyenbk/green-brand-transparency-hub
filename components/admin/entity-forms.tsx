"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createMethodologyAction,
  linkEvidenceAction,
  reviewCorrectionAction,
  saveAuditAction,
  saveBrandAction,
  saveCertificationAction,
  saveClaimAction,
  saveDisclosureAction,
  saveSourceAction,
  saveTargetAction,
} from "@/lib/admin/actions";
import { DISCLOSURE_TOPIC_LABELS, type DisclosureTopicKey } from "@/lib/scoring/config";
import {
  BRAND_STATUSES,
  CLAIM_STATUSES,
  CORRECTION_STATUSES,
  DISCLOSURE_LEVELS,
  EVIDENCE_STRENGTHS,
  MISSING_DATA_STATES,
  MISSING_DATA_STATE_LABELS,
  REVIEW_STATUSES,
  SOURCE_TYPES,
  SUSTAINABILITY_CATEGORIES,
  VERIFICATION_LEVELS,
  VERIFICATION_STATUSES,
  humanizeEnum,
} from "@/lib/validation/enums";
import {
  accessibilityAuditSchema,
  brandSchema,
  certificationSchema,
  claimSchema,
  claimSourceLinkSchema,
  correctionReviewSchema,
  methodologySchema,
  sourceSchema,
  targetSchema,
} from "@/lib/validation/schemas";
import {
  CheckboxField,
  FormGrid,
  RubricField,
  SELECT_CLASS,
  SelectField,
  SubmitBar,
  TextAreaField,
  TextField,
  enumOptions,
  useAdminForm,
} from "./form-kit";

type Option = { value: string; label: string };
const opts = (values: readonly string[]) => enumOptions(values, humanizeEnum);

// --- Brand -------------------------------------------------------------------

export interface BrandFormValues {
  name: string;
  slug: string;
  industryId: string;
  country: string;
  website: string;
  logoUrl: string;
  description: string;
  isFictional: boolean;
  status: string;
  targetsDataState: string;
  lastReviewedAt: string;
}

export function BrandForm({
  id,
  initial,
  industries,
}: {
  id: string | null;
  initial: BrandFormValues;
  industries: Option[];
}) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: brandSchema,
    defaultValues: initial,
    submit: (v) => saveBrandAction(id, v),
    redirectTo: (newId) => (!id && newId ? `/admin/brands/${newId}` : undefined),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormGrid>
        <TextField form={form} name="name" label="Brand name" />
        <TextField
          form={form}
          name="slug"
          label="Slug"
          hint="Lowercase, hyphenated — used in the public URL."
        />
        <SelectField
          form={form}
          name="industryId"
          label="Industry"
          options={industries}
          emptyLabel="Select…"
        />
        <TextField form={form} name="country" label="Country" />
        <TextField form={form} name="website" label="Website" type="url" placeholder="https://…" />
        <TextField form={form} name="logoUrl" label="Logo URL" type="url" />
        <SelectField
          form={form}
          name="status"
          label="Profile status"
          options={opts(BRAND_STATUSES)}
        />
        <SelectField
          form={form}
          name="targetsDataState"
          label="Targets review state"
          hint="‘Not found’ with no targets scores 0 on Targets; ‘Pending review’ leaves it uncalculated."
          options={MISSING_DATA_STATES.map((s) => ({
            value: s,
            label: MISSING_DATA_STATE_LABELS[s],
          }))}
        />
        <TextField form={form} name="lastReviewedAt" label="Last reviewed" type="date" />
        <CheckboxField
          form={form}
          name="isFictional"
          label="Fictional / sample data"
          hint="Shows a fictional-data notice publicly."
        />
      </FormGrid>
      <TextAreaField form={form} name="description" label="Description" rows={3} />
      <SubmitBar pending={pending} label={id ? "Save brand" : "Create brand"} />
    </form>
  );
}

// --- Source ------------------------------------------------------------------

export interface SourceFormValues {
  brandId: string;
  title: string;
  sourceType: string;
  publisher: string;
  url: string;
  publicationDate: string;
  accessedAt: string;
  verificationLevel: string;
  archivedUrl: string;
  notes: string;
  status: string;
}

export function SourceForm({
  id,
  initial,
  brands,
}: {
  id: string | null;
  initial: SourceFormValues;
  brands: Option[];
}) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: sourceSchema,
    defaultValues: initial,
    submit: (v) => saveSourceAction(id, v),
    redirectTo: (newId) => (!id && newId ? `/admin/sources/${newId}` : undefined),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormGrid>
        <SelectField
          form={form}
          name="brandId"
          label="Brand"
          options={brands}
          emptyLabel="Select…"
        />
        <TextField form={form} name="title" label="Title" />
        <SelectField
          form={form}
          name="sourceType"
          label="Source type"
          options={opts(SOURCE_TYPES)}
        />
        <TextField form={form} name="publisher" label="Publisher" />
        <TextField form={form} name="url" label="URL" type="url" placeholder="https://…" />
        <TextField form={form} name="archivedUrl" label="Archived URL" type="url" />
        <TextField form={form} name="publicationDate" label="Publication date" type="date" />
        <TextField form={form} name="accessedAt" label="Accessed" type="date" />
        <SelectField
          form={form}
          name="verificationLevel"
          label="Verification level"
          options={opts(VERIFICATION_LEVELS)}
        />
        <SelectField
          form={form}
          name="status"
          label="Review status"
          options={opts(REVIEW_STATUSES)}
          hint="Only verified / published sources count towards scores."
        />
      </FormGrid>
      <TextAreaField form={form} name="notes" label="Notes" />
      <SubmitBar pending={pending} label={id ? "Save source" : "Add source"} />
    </form>
  );
}

// --- Claim -------------------------------------------------------------------

export interface ClaimFormValues {
  brandId: string;
  claimText: string;
  claimCategory: string;
  claimDate: string;
  specificityScore: string;
  evidenceScore: string;
  measurabilityScore: string;
  verificationScore: string;
  contextScore: string;
  methodologyNote: string;
  verificationNote: string;
  reviewerNotes: string;
  status: string;
}

export function ClaimForm({
  id,
  initial,
  brands,
}: {
  id: string | null;
  initial: ClaimFormValues;
  brands: Option[];
}) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: claimSchema,
    defaultValues: initial,
    submit: (v) => saveClaimAction(id, v),
    redirectTo: (newId) => (!id && newId ? `/admin/claims/${newId}` : undefined),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate data-testid="claim-form">
      <FormGrid>
        <SelectField
          form={form}
          name="brandId"
          label="Brand"
          options={brands}
          emptyLabel="Select…"
        />
        <SelectField
          form={form}
          name="claimCategory"
          label="Category"
          options={opts(SUSTAINABILITY_CATEGORIES)}
        />
      </FormGrid>
      <TextAreaField form={form} name="claimText" label="Exact claim text" rows={3} />
      <FormGrid>
        <TextField form={form} name="claimDate" label="Claim date" type="date" />
        <SelectField
          form={form}
          name="status"
          label="Review status"
          options={opts(CLAIM_STATUSES)}
          hint="Candidate / in-review claims never affect public scores."
        />
      </FormGrid>
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-semibold">Transparency rubric (0–5)</legend>
        <p className="text-muted-foreground text-xs">
          The evidence rating is the claim&apos;s Evidence Level: 0 none · 1 descriptive · 2
          quantitative · 3 + source · 4 + methodology · 5 + independent verification. Risk is
          calculated automatically when all five are assessed.
        </p>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <RubricField form={form} name="specificityScore" label="Specificity" />
          <RubricField form={form} name="evidenceScore" label="Evidence level" />
          <RubricField form={form} name="measurabilityScore" label="Measurability" />
          <RubricField form={form} name="verificationScore" label="Verification" />
          <RubricField form={form} name="contextScore" label="Context" />
        </div>
      </fieldset>
      <FormGrid>
        <TextAreaField form={form} name="methodologyNote" label="Methodology note (public)" />
        <TextAreaField form={form} name="verificationNote" label="Verification note (public)" />
      </FormGrid>
      <TextAreaField form={form} name="reviewerNotes" label="Reviewer notes (public)" />
      <SubmitBar pending={pending} label={id ? "Save claim" : "Create claim"} />
    </form>
  );
}

// --- Evidence link ------------------------------------------------------------

export function EvidenceLinkForm({ claimId, sources }: { claimId: string; sources: Option[] }) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: claimSourceLinkSchema,
    defaultValues: {
      claimId,
      sourceId: "",
      evidenceExcerpt: "",
      pageNumber: "",
      evidenceStrength: "MODERATE",
    },
    submit: (v) => linkEvidenceAction(v),
  });
  if (sources.length === 0) {
    return <p className="text-muted-foreground text-sm">Add a source for this brand first.</p>;
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate data-testid="evidence-link-form">
      <FormGrid>
        <SelectField
          form={form}
          name="sourceId"
          label="Source"
          options={sources}
          emptyLabel="Select…"
        />
        <SelectField
          form={form}
          name="evidenceStrength"
          label="Evidence strength"
          options={opts(EVIDENCE_STRENGTHS)}
        />
      </FormGrid>
      <TextAreaField
        form={form}
        name="evidenceExcerpt"
        label="Evidence excerpt"
        hint="Quote the exact passage that supports (or fails to support) the claim."
      />
      <TextField form={form} name="pageNumber" label="Page / section" className="max-w-40" />
      <SubmitBar pending={pending} label="Link evidence" />
    </form>
  );
}

// --- Certification -------------------------------------------------------------

export interface CertificationFormValues {
  brandId: string;
  name: string;
  certificationBody: string;
  scope: string;
  validFrom: string;
  validTo: string;
  sourceId: string;
  verificationStatus: string;
}

export function CertificationForm({
  id,
  initial,
  brands,
  sources,
}: {
  id: string | null;
  initial: CertificationFormValues;
  brands: Option[];
  sources: Option[];
}) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: certificationSchema,
    defaultValues: initial,
    submit: (v) => saveCertificationAction(id, v),
    redirectTo: () => (!id ? "/admin/certifications" : undefined),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormGrid>
        <SelectField
          form={form}
          name="brandId"
          label="Brand"
          options={brands}
          emptyLabel="Select…"
        />
        <TextField form={form} name="name" label="Certification" />
        <TextField form={form} name="certificationBody" label="Certification body" />
        <SelectField
          form={form}
          name="verificationStatus"
          label="Verification status"
          options={opts(VERIFICATION_STATUSES)}
        />
        <TextField form={form} name="validFrom" label="Valid from" type="date" />
        <TextField form={form} name="validTo" label="Valid to" type="date" />
        <SelectField
          form={form}
          name="sourceId"
          label="Source"
          options={sources}
          emptyLabel="None"
          hint="Must belong to the same brand."
        />
      </FormGrid>
      <TextAreaField
        form={form}
        name="scope"
        label="Scope"
        hint="State exactly what is covered (product line, site, material). Required."
      />
      <SubmitBar pending={pending} label={id ? "Save certification" : "Add certification"} />
    </form>
  );
}

// --- Target ----------------------------------------------------------------------

export interface TargetFormValues {
  brandId: string;
  title: string;
  category: string;
  metric: string;
  baselineValue: string;
  baselineYear: string;
  targetValue: string;
  targetYear: string;
  latestProgress: string;
  progressYear: string;
  isSpecific: boolean;
  hasHistoricalData: boolean;
  verificationStatus: string;
  sourceId: string;
}

export function TargetForm({
  id,
  initial,
  brands,
  sources,
}: {
  id: string | null;
  initial: TargetFormValues;
  brands: Option[];
  sources: Option[];
}) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: targetSchema,
    defaultValues: initial,
    submit: (v) => saveTargetAction(id, v),
    redirectTo: () => (!id ? "/admin/targets" : undefined),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormGrid>
        <SelectField
          form={form}
          name="brandId"
          label="Brand"
          options={brands}
          emptyLabel="Select…"
        />
        <SelectField
          form={form}
          name="category"
          label="Category"
          options={opts(SUSTAINABILITY_CATEGORIES)}
        />
      </FormGrid>
      <TextField form={form} name="title" label="Target (as stated)" />
      <FormGrid className="lg:grid-cols-3">
        <TextField form={form} name="metric" label="Metric / unit" placeholder="e.g. tCO2e" />
        <TextField
          form={form}
          name="baselineValue"
          label="Baseline value"
          type="number"
          step="any"
        />
        <TextField form={form} name="baselineYear" label="Baseline year" type="number" />
        <TextField form={form} name="targetValue" label="Target value" type="number" step="any" />
        <TextField form={form} name="targetYear" label="Target year" type="number" />
        <SelectField
          form={form}
          name="verificationStatus"
          label="Verification status"
          options={opts(VERIFICATION_STATUSES)}
        />
        <TextField
          form={form}
          name="latestProgress"
          label="Latest progress value"
          type="number"
          step="any"
        />
        <TextField form={form} name="progressYear" label="Progress year" type="number" />
        <SelectField
          form={form}
          name="sourceId"
          label="Source"
          options={sources}
          emptyLabel="None"
        />
      </FormGrid>
      <FormGrid>
        <CheckboxField
          form={form}
          name="isSpecific"
          label="Specific target"
          hint="Clear object and scope."
        />
        <CheckboxField
          form={form}
          name="hasHistoricalData"
          label="Historical comparison published"
        />
      </FormGrid>
      <p className="text-muted-foreground text-xs">
        Leave fields empty when not disclosed — empty values are never treated as zero.
      </p>
      <SubmitBar pending={pending} label={id ? "Save target" : "Add target"} />
    </form>
  );
}

// --- Accessibility audit ------------------------------------------------------------

export interface AuditFormValues {
  brandId: string;
  clickCount: string;
  searchabilityScore: string;
  readabilityScore: string;
  evidenceLinkageScore: string;
  notes: string;
  reviewedAt: string;
}

export function AuditForm({
  id,
  initial,
  brands,
}: {
  id: string | null;
  initial: AuditFormValues;
  brands: Option[];
}) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: accessibilityAuditSchema,
    defaultValues: initial,
    submit: (v) => saveAuditAction(id, v),
    redirectTo: () => (!id ? "/admin/audits" : undefined),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormGrid>
        <SelectField
          form={form}
          name="brandId"
          label="Brand"
          options={brands}
          emptyLabel="Select…"
        />
        <TextField form={form} name="reviewedAt" label="Reviewed on" type="date" />
        <TextField
          form={form}
          name="clickCount"
          label="Clicks: homepage → key evidence"
          type="number"
          hint="1–2 excellent · 3 good · 4 weak · 5+ poor (operational rule)."
        />
        <RubricField form={form} name="searchabilityScore" label="Searchability (0–3)" max={3} />
        <RubricField form={form} name="readabilityScore" label="Readability (0–3)" max={3} />
        <RubricField
          form={form}
          name="evidenceLinkageScore"
          label="Evidence linkage (0–4)"
          max={4}
        />
      </FormGrid>
      <TextAreaField form={form} name="notes" label="Audit notes" />
      <SubmitBar pending={pending} label={id ? "Save audit" : "Record audit"} />
    </form>
  );
}

// --- Disclosure checklist -------------------------------------------------------------

export interface DisclosureRowValue {
  topic: string;
  state: string;
  level: string;
  notes: string;
}

export function DisclosureForm({
  brandId,
  initial,
}: {
  brandId: string;
  initial: DisclosureRowValue[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const update = (i: number, patch: Partial<DisclosureRowValue>) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await saveDisclosureAction({ brandId, items: rows });
          if (res.ok) {
            toast.success(res.message ?? "Saved.");
            router.refresh();
          } else toast.error(Object.values(res.fields ?? {})[0] ?? res.error);
        });
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-muted-foreground text-left text-xs">
            <tr>
              <th scope="col" className="py-2 pr-3 font-medium">
                Topic
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                State
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Level
              </th>
              <th scope="col" className="py-2 font-medium">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, i) => {
              const label = DISCLOSURE_TOPIC_LABELS[row.topic as DisclosureTopicKey];
              return (
                <tr key={row.topic}>
                  <th scope="row" className="py-2 pr-3 text-left font-medium">
                    {label}
                  </th>
                  <td className="py-2 pr-3">
                    <Label className="sr-only" htmlFor={`d-state-${i}`}>
                      {label} state
                    </Label>
                    <select
                      id={`d-state-${i}`}
                      className={SELECT_CLASS}
                      value={row.state}
                      onChange={(e) =>
                        update(i, {
                          state: e.target.value,
                          level: e.target.value === "AVAILABLE" ? row.level || "PARTIAL" : "",
                        })
                      }
                    >
                      {MISSING_DATA_STATES.map((s) => (
                        <option key={s} value={s}>
                          {MISSING_DATA_STATE_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <Label className="sr-only" htmlFor={`d-level-${i}`}>
                      {label} level
                    </Label>
                    <select
                      id={`d-level-${i}`}
                      className={`${SELECT_CLASS} min-w-28`}
                      value={row.level}
                      disabled={row.state !== "AVAILABLE"}
                      onChange={(e) => update(i, { level: e.target.value })}
                    >
                      <option value="">—</option>
                      {DISCLOSURE_LEVELS.filter((l) => l !== "ABSENT").map((l) => (
                        <option key={l} value={l}>
                          {humanizeEnum(l)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <Label className="sr-only" htmlFor={`d-notes-${i}`}>
                      {label} notes
                    </Label>
                    <input
                      id={`d-notes-${i}`}
                      className={SELECT_CLASS}
                      value={row.notes}
                      maxLength={1000}
                      onChange={(e) => update(i, { notes: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save checklist"}
      </Button>
    </form>
  );
}

// --- Methodology ------------------------------------------------------------------------

export function MethodologyForm() {
  const { form, onSubmit, pending } = useAdminForm({
    schema: methodologySchema,
    defaultValues: {
      version: "",
      title: "",
      description: "",
      disclosure: "0.25",
      evidence: "0.25",
      verification: "0.2",
      targets: "0.15",
      accessibility: "0.15",
    },
    submit: (v) => createMethodologyAction(v),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormGrid>
        <TextField form={form} name="version" label="Version" placeholder="1.1" />
        <TextField form={form} name="title" label="Title" />
      </FormGrid>
      <TextAreaField form={form} name="description" label="Change description" />
      <div className="grid gap-4 sm:grid-cols-5">
        <TextField form={form} name="disclosure" label="Disclosure" type="number" step="0.01" />
        <TextField form={form} name="evidence" label="Evidence" type="number" step="0.01" />
        <TextField form={form} name="verification" label="Verification" type="number" step="0.01" />
        <TextField form={form} name="targets" label="Targets" type="number" step="0.01" />
        <TextField
          form={form}
          name="accessibility"
          label="Accessibility"
          type="number"
          step="0.01"
        />
      </div>
      <p className="text-muted-foreground text-xs">
        Weights must sum to 1.0. New versions start inactive.
      </p>
      <SubmitBar pending={pending} label="Create version" />
    </form>
  );
}

// --- Correction report review ------------------------------------------------------------

export function CorrectionReviewForm({
  id,
  initial,
}: {
  id: string;
  initial: { status: string; resolutionNote: string };
}) {
  const { form, onSubmit, pending } = useAdminForm({
    schema: correctionReviewSchema,
    defaultValues: initial,
    submit: (v) => reviewCorrectionAction(id, v),
  });
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <SelectField
        form={form}
        name="status"
        label="Status"
        options={opts(CORRECTION_STATUSES)}
        className="max-w-xs"
      />
      <TextAreaField
        form={form}
        name="resolutionNote"
        label="Resolution note (internal)"
        hint="Record what was changed (e.g. source added, claim re-rated) or why the report was rejected."
      />
      <SubmitBar pending={pending} label="Save review" />
    </form>
  );
}
