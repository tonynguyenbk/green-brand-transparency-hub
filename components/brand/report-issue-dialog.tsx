"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FlagIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CORRECTION_TYPES, REPORTER_ROLES, humanizeEnum } from "@/lib/validation/enums";
import { correctionReportSchema } from "@/lib/validation/schemas";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

type Values = {
  brandId: string;
  claimId: string;
  reportType: string;
  message: string;
  sourceUrl: string;
  reporterRole: string;
  reporterEmail: string;
  website: string;
};

const TYPE_LABELS: Record<(typeof CORRECTION_TYPES)[number], string> = {
  MISSING_SOURCE: "A source is missing",
  INCORRECT_SOURCE: "A source is incorrect or misattributed",
  UPDATED_DATA: "Newer data is available",
  CLARIFICATION: "Clarification / context",
  OTHER: "Other",
};

/** Public "Report an issue" form. Reports are reviewed by an admin before any change. */
export function ReportIssueDialog({
  brandId,
  brandName,
  claims,
  defaultClaimId = "",
  trigger,
}: {
  brandId: string;
  brandName: string;
  claims: { id: string; text: string }[];
  defaultClaimId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const defaults: Values = {
    brandId,
    claimId: defaultClaimId,
    reportType: "MISSING_SOURCE",
    message: "",
    sourceUrl: "",
    reporterRole: "CONSUMER",
    reporterEmail: "",
    website: "",
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(correctionReportSchema as never) as unknown as Resolver<Values>,
    defaultValues: defaults,
  });

  // Validate with the shared schema, then send the raw form values; the API re-validates.
  const submit = handleSubmit(async (_parsed, event) => {
    const form = event?.target as HTMLFormElement;
    const raw = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/corrections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(raw),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(json.error ?? "The report could not be sent.");
      return;
    }
    toast.success("Thank you — your report will be reviewed before any change is published.");
    reset(defaults);
    setOpen(false);
  });

  const err = (k: keyof Values) =>
    errors[k]?.message ? (
      <p id={`ri-${k}-error`} className="text-destructive text-xs">
        {errors[k]?.message}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <FlagIcon /> Report an issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Report an issue — {brandName}</DialogTitle>
          <DialogDescription>
            Point out a missing or incorrect source, newer data or needed context. An administrator
            reviews every report before anything is changed; reports do not affect scores directly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate data-testid="report-issue-form">
          <input type="hidden" {...register("brandId")} />
          {/* Honeypot — hidden from people, tempting for bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor={`ri-website-${defaultClaimId}`}>Website</label>
            <input
              id={`ri-website-${defaultClaimId}`}
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ri-type">What kind of issue?</Label>
            <select id="ri-type" className={SELECT_CLASS} {...register("reportType")}>
              {CORRECTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ri-claim">Related claim (optional)</Label>
            <select id="ri-claim" className={SELECT_CLASS} {...register("claimId")}>
              <option value="">The profile in general</option>
              {claims.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.text.length > 80 ? `${c.text.slice(0, 80)}…` : c.text}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ri-message">Details</Label>
            <Textarea
              id="ri-message"
              rows={4}
              maxLength={2000}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "ri-message-error" : undefined}
              {...register("message")}
            />
            {err("message")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ri-url">Supporting source URL (optional)</Label>
            <Input
              id="ri-url"
              type="url"
              placeholder="https://…"
              aria-invalid={errors.sourceUrl ? true : undefined}
              {...register("sourceUrl")}
            />
            {err("sourceUrl")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ri-role">You are</Label>
              <select id="ri-role" className={SELECT_CLASS} {...register("reporterRole")}>
                {REPORTER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {humanizeEnum(r)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ri-email">E-mail (optional)</Label>
              <Input
                id="ri-email"
                type="email"
                autoComplete="email"
                {...register("reporterEmail")}
              />
              {err("reporterEmail")}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Your e-mail is only used to follow up on this report and is never shown publicly.
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            Send report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
