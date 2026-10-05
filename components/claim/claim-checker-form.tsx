"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, CheckCircle2Icon, LightbulbIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiskBadge } from "@/components/scoring/badges";
import { ScoreMeter } from "@/components/scoring/score-display";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/lib/analytics/client";
import type { ClaimCheckResult } from "@/lib/claims/checker";
import { RISK_LABELS, formatScore } from "@/lib/scoring/labels";
import { claimCheckerSchema } from "@/lib/validation/schemas";

type FormValues = { claim: string };

const EXAMPLES = [
  "Our packaging is 100% eco-friendly.",
  "Sustainable fashion for a greener planet.",
  "Our 2025 shoe collection uses 45% recycled rubber by weight, verified by an independent certification body.",
  "We reduced Scope 1 and 2 emissions by 30% compared with our 2020 baseline, as reported in our 2025 sustainability report.",
];

const COMPONENT_LABELS: [keyof ClaimCheckResult["components"], string][] = [
  ["specificity", "Specificity"],
  ["evidence", "Evidence referenced"],
  ["measurability", "Measurability"],
  ["verification", "External verification"],
  ["context", "Context completeness"],
];

export function ClaimCheckerForm() {
  const [result, setResult] = useState<ClaimCheckResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(claimCheckerSchema),
    defaultValues: { claim: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    track("claim_checker_submit", { length: values.claim.length });
    try {
      const res = await fetch("/api/claim-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "The claim could not be analysed.");
      setResult(json as ClaimCheckResult);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "The claim could not be analysed.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="claim">Sustainability claim</Label>
          <Textarea
            id="claim"
            rows={6}
            maxLength={1000}
            placeholder="Paste a green claim, e.g. “Our packaging is 100% eco-friendly.”"
            aria-invalid={errors.claim ? true : undefined}
            aria-describedby={errors.claim ? "claim-error" : "claim-hint"}
            className="bg-card text-base"
            {...register("claim")}
          />
          {errors.claim ? (
            <p id="claim-error" className="text-destructive text-sm">
              {errors.claim.message}
            </p>
          ) : (
            <p id="claim-hint" className="text-muted-foreground text-xs">
              Up to 1,000 characters. The text is analysed with transparent rules — it is not
              stored.
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Analyse claim
        </Button>
        <div className="space-y-2 pt-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Try an example
          </p>
          <ul className="flex flex-col gap-2">
            {EXAMPLES.map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  className="bg-card hover:bg-muted w-full rounded-md border px-3 py-2 text-left text-sm"
                  onClick={() => setValue("claim", ex, { shouldValidate: true })}
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>

      <section aria-live="polite" aria-label="Analysis result" className="min-h-64">
        {serverError && (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive flex gap-2 rounded-lg border p-4 text-sm"
          >
            <AlertCircleIcon className="size-4 shrink-0" /> {serverError}
          </div>
        )}
        {!result && !serverError && (
          <div className="text-muted-foreground flex h-full min-h-64 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm">
            <LightbulbIcon className="mb-3 size-6" aria-hidden="true" />
            The analysis will appear here: risk score, detected broad terms, measurable information,
            missing evidence and a stronger wording pattern.
          </div>
        )}
        {result && (
          <div className="bg-card space-y-6 rounded-xl border p-6" data-testid="claim-check-result">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Transparency risk
                </p>
                <p className="tabular mt-1 font-serif text-5xl font-semibold">
                  {formatScore(result.riskScore)}
                  <span className="text-muted-foreground ml-1 text-base font-normal">/ 100</span>
                </p>
              </div>
              <RiskBadge level={result.riskLevel} className="text-sm" />
            </div>
            <p className="text-sm">
              This wording has a <strong>{RISK_LABELS[result.riskLevel].toLowerCase()}</strong>{" "}
              according to the current methodology.
            </p>

            <div className="space-y-2">
              {COMPONENT_LABELS.map(([key, label]) => (
                <div key={key} className="grid grid-cols-[9.5rem_1fr] items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <ScoreMeter value={result.components[key]} label={label} />
                </div>
              ))}
            </div>

            {result.issues.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold">Potential issues</h3>
                <ul className="space-y-1 text-sm">
                  {result.issues.map((i) => (
                    <li key={i} className="flex gap-2">
                      <AlertCircleIcon
                        className="text-risk-moderate mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold">Detected broad terms</h3>
                {result.detectedBroadTerms.length ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {result.detectedBroadTerms.map((t) => (
                      <li
                        key={t}
                        className="bg-risk-moderate-bg text-risk-moderate rounded-full border px-2 py-0.5 text-xs"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">None</p>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold">Detected measurable information</h3>
                {result.detectedMeasurableInformation.length ? (
                  <ul className="space-y-1 text-sm">
                    {result.detectedMeasurableInformation.map((d) => (
                      <li key={d.signal} className="flex gap-2">
                        <CheckCircle2Icon
                          className="text-risk-low mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {d.label}:{" "}
                          <code className="bg-muted rounded px-1 text-xs">{d.match}</code>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">None</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-sans text-sm font-semibold">Missing evidence categories</h3>
              <ul className="text-muted-foreground list-disc space-y-0.5 pl-5 text-sm">
                {result.missingEvidenceCategories.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            {result.possibleMissingContext.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-sans text-sm font-semibold">Possible missing context</h3>
                <ul className="text-muted-foreground list-disc space-y-0.5 pl-5 text-sm">
                  {result.possibleMissingContext.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-sans text-sm font-semibold">Explanation</h3>
              {result.explanation.map((e) => (
                <p key={e} className="text-muted-foreground text-sm">
                  {e}
                </p>
              ))}
            </div>

            <div className="bg-accent space-y-2 rounded-lg p-4">
              <h3 className="text-accent-foreground font-sans text-sm font-semibold">
                Suggested stronger wording pattern
              </h3>
              <p className="font-serif text-[0.95rem]">{result.suggestedWordingPattern}</p>
            </div>

            <p className="text-muted-foreground border-t pt-4 text-xs">{result.notes.join(" ")}</p>
          </div>
        )}
      </section>
    </div>
  );
}
