"use client";

import { ChevronRightIcon, FileTextIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { EvidenceStrengthBadge, RiskBadge } from "@/components/scoring/badges";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics/client";
import type { ClaimView } from "@/lib/services/brand-service";
import { humanizeEnum } from "@/lib/validation/enums";
import { ClaimEvidenceSheet } from "./claim-evidence-sheet";

const SELECT_CLASS =
  "h-9 rounded-md border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Claim list with category/risk filters; selecting a claim opens its evidence panel. */
export function ClaimsExplorer({ claims, brandSlug }: { claims: ClaimView[]; brandSlug: string }) {
  const [category, setCategory] = useState("");
  const [risk, setRisk] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(claims.map((c) => c.category))].sort(), [claims]);
  const filtered = claims.filter(
    (c) =>
      (!category || c.category === category) &&
      (!risk || (risk === "PENDING" ? !c.riskLevel : c.riskLevel === risk)),
  );
  const open = claims.find((c) => c.id === openId) ?? null;

  function openClaim(id: string) {
    setOpenId(id);
    track("claim_expand", { brand: brandSlug, claim_id: id });
    track("evidence_view", { brand: brandSlug, claim_id: id });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="claim-category">Category</Label>
          <select
            id="claim-category"
            className={SELECT_CLASS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {humanizeEnum(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="claim-risk">Transparency risk</Label>
          <select
            id="claim-risk"
            className={SELECT_CLASS}
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
          >
            <option value="">All levels</option>
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <p className="text-muted-foreground ml-auto text-sm" aria-live="polite">
          Showing {filtered.length} of {claims.length} claims
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
          No claims match these filters.
        </p>
      ) : (
        <ul className="bg-card divide-y overflow-hidden rounded-xl border">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => openClaim(c.id)}
                className="group hover:bg-muted/40 focus-visible:bg-muted/40 grid w-full gap-3 px-4 py-4 text-left transition-colors focus-visible:outline-none sm:grid-cols-[1fr_auto] sm:items-center"
                aria-haspopup="dialog"
                data-testid="claim-row"
              >
                <span className="space-y-2">
                  <span className="block font-serif text-[1.05rem] leading-snug">
                    “{c.claimText}”
                  </span>
                  <span className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="bg-background rounded border px-1.5 py-0.5">
                      {humanizeEnum(c.category)}
                    </span>
                    <EvidenceStrengthBadge label={c.evidenceStrength} />
                    <span className="inline-flex items-center gap-1">
                      <FileTextIcon className="size-3" aria-hidden="true" />
                      {c.evidence.length} {c.evidence.length === 1 ? "source" : "sources"}
                    </span>
                    <span>· {humanizeEnum(c.status)}</span>
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <RiskBadge level={c.riskLevel} score={c.riskScore} />
                  <span className="text-primary text-sm font-medium">Inspect evidence</span>
                  <ChevronRightIcon
                    className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <ClaimEvidenceSheet
        claim={open}
        brandSlug={brandSlug}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </div>
  );
}
