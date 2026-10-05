import { formatScore, scoreBandLabel } from "@/lib/scoring/labels";
import { cn } from "@/lib/utils";

/** Large "82 / 100" score with an accessible label. Purely presentational. */
export function ScoreDisplay({
  score,
  size = "lg",
  className,
  showBand = true,
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBand?: boolean;
}) {
  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl sm:text-7xl",
  };
  if (score === null) {
    return (
      <div className={cn("space-y-1", className)}>
        <p className="text-muted-foreground font-serif text-3xl font-semibold">Not yet scored</p>
        <p className="text-muted-foreground text-sm">
          Score cannot yet be calculated because required review data is incomplete.
        </p>
      </div>
    );
  }
  return (
    <div className={cn("space-y-1", className)}>
      <p
        className="tabular leading-none"
        aria-label={`Green Transparency Score ${formatScore(score)} out of 100`}
      >
        <span className={cn("font-serif font-semibold tracking-tight", sizes[size])}>
          {formatScore(score)}
        </span>
        <span className="text-muted-foreground ml-1 text-lg"> / 100</span>
      </p>
      {showBand && <p className="text-primary text-sm font-medium">{scoreBandLabel(score)}</p>}
    </div>
  );
}

/** Horizontal meter for 0–100 values; null renders as an explicit "pending" state, never as 0. */
export function ScoreMeter({
  value,
  label,
  className,
}: {
  value: number | null;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value === null ? undefined : Math.round(value)}
        aria-valuetext={value === null ? "Not yet calculated" : `${Math.round(value)} out of 100`}
        className="bg-muted relative h-2 flex-1 overflow-hidden rounded-full"
      >
        {value !== null && (
          <div
            className="bg-primary absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${Math.max(value, 1)}%` }}
          />
        )}
      </div>
      <span className="tabular w-9 text-right text-sm font-semibold">
        {value === null ? "—" : formatScore(value)}
      </span>
    </div>
  );
}
