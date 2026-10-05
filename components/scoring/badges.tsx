import {
  CircleDashedIcon,
  GaugeIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CONFIDENCE_LABELS, RISK_SHORT_LABELS, formatScore } from "@/lib/scoring/labels";
import type { ConfidenceLevelValue, RiskLevelValue } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

const RISK_STYLES: Record<RiskLevelValue, string> = {
  LOW: "bg-risk-low-bg text-risk-low border-risk-low/25",
  MODERATE: "bg-risk-moderate-bg text-risk-moderate border-risk-moderate/25",
  HIGH: "bg-risk-high-bg text-risk-high border-risk-high/25",
};

const RISK_ICONS = { LOW: ShieldCheckIcon, MODERATE: ShieldIcon, HIGH: ShieldAlertIcon };

export function RiskBadge({
  level,
  score,
  className,
  withLabel = true,
  prefix,
}: {
  level: RiskLevelValue | null;
  score?: number | null;
  className?: string;
  withLabel?: boolean;
  prefix?: string;
}) {
  if (!level) {
    return (
      <span
        className={cn(
          "text-muted-foreground inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
          className,
        )}
      >
        <CircleDashedIcon className="size-3" aria-hidden="true" />
        Risk pending review
      </span>
    );
  }
  const Icon = RISK_ICONS[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        RISK_STYLES[level],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {prefix}
      {RISK_SHORT_LABELS[level]}
      {withLabel && " risk"}
      {score !== undefined && score !== null && (
        <span className="tabular opacity-80">· {formatScore(score)}</span>
      )}
    </span>
  );
}

export function ConfidenceBadge({
  level,
  className,
}: {
  level: ConfidenceLevelValue | null;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            "bg-card inline-flex cursor-help items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
            className,
          )}
        >
          <GaugeIcon className="text-muted-foreground size-3" aria-hidden="true" />
          Confidence: {level ? CONFIDENCE_LABELS[level] : "—"}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        Confidence in the transparency assessment (source count, quality, recency, missing data and
        external verification) — not confidence in environmental performance.
      </TooltipContent>
    </Tooltip>
  );
}

const STRENGTH_STYLES: Record<string, string> = {
  "Strong evidence": "text-risk-low bg-risk-low-bg border-risk-low/20",
  "Moderate evidence": "text-accent-foreground bg-accent border-primary/15",
  "Limited evidence": "text-risk-moderate bg-risk-moderate-bg border-risk-moderate/20",
  "Supporting evidence not found": "text-risk-high bg-risk-high-bg border-risk-high/20",
  "Pending review": "text-muted-foreground bg-muted",
};

export function EvidenceStrengthBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STRENGTH_STYLES[label] ?? "bg-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}

const LINK_STRENGTH_LABELS: Record<string, string> = {
  STRONG: "Strong evidence",
  MODERATE: "Moderate evidence",
  LIMITED: "Limited evidence",
  NOT_FOUND: "Supporting evidence not found",
};

/** Per-source evidence strength (ClaimSource.evidenceStrength). */
export function LinkStrengthBadge({ strength }: { strength: string }) {
  return <EvidenceStrengthBadge label={LINK_STRENGTH_LABELS[strength] ?? strength} />;
}
