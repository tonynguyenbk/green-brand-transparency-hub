import { ChevronDownIcon } from "lucide-react";
import { DIMENSION_KEYS, DIMENSION_LABELS, type DimensionKey } from "@/lib/scoring/config";
import { ScoreMeter } from "./score-display";

export interface DimensionRow {
  key: DimensionKey;
  score: number | null;
  weight: number;
  explanation: string[];
}

/**
 * Score breakdown as labelled meters. Each row can be expanded to show the
 * calculation explanation produced by the scoring engine.
 */
export function DimensionBreakdown({ rows }: { rows: DimensionRow[] }) {
  const ordered = DIMENSION_KEYS.map((k) => rows.find((r) => r.key === k)).filter(
    Boolean,
  ) as DimensionRow[];
  return (
    <ul className="bg-card divide-y rounded-lg border">
      {ordered.map((row) => (
        <li key={row.key}>
          <details className="group">
            <summary className="hover:bg-muted/40 flex cursor-pointer list-none flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-6 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-56 items-center justify-between gap-2 text-sm font-medium sm:justify-start">
                <span>
                  {DIMENSION_LABELS[row.key]}
                  <span className="text-muted-foreground ml-2 text-xs font-normal">
                    weight {Math.round(row.weight * 100)}%
                  </span>
                </span>
                <ChevronDownIcon
                  className="text-muted-foreground size-4 transition-transform group-open:rotate-180 sm:order-first"
                  aria-hidden="true"
                />
              </span>
              <ScoreMeter value={row.score} label={DIMENSION_LABELS[row.key]} className="flex-1" />
            </summary>
            <div className="px-4 pb-4 sm:pl-10">
              {row.explanation.length > 0 ? (
                <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                  {row.explanation.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">No calculation details recorded.</p>
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
