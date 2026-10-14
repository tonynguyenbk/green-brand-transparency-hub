import { BANDS, bandFor, formatEsg, rulerPercent, type BandKey } from "@/lib/esg/scoring";
import { tr, type Locale } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";

export const BAND_VAR: Record<BandKey, string> = {
  "very-weak": "var(--band-1)",
  weak: "var(--band-2)",
  moderate: "var(--band-3)",
  good: "var(--band-4)",
  strong: "var(--band-5)",
};

export const PILLAR_VAR = {
  e: "var(--pillar-e)",
  s: "var(--pillar-s)",
  g: "var(--pillar-g)",
} as const;

export function BandPill({
  score,
  locale,
  className,
}: {
  score: number;
  locale: Locale;
  className?: string;
}) {
  const b = bandFor(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      )}
      style={{
        color: BAND_VAR[b.key],
        background: `color-mix(in oklab, ${BAND_VAR[b.key]} 14%, transparent)`,
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: BAND_VAR[b.key] }}
        aria-hidden="true"
      />
      {tr(locale, b.vi, b.en)}
    </span>
  );
}

/** Three slim pillar bars on the 1–10 scale. */
export function PillarBars({
  e,
  s,
  g,
  className,
}: {
  e: number;
  s: number;
  g: number;
  className?: string;
}) {
  const rows = [
    ["E", e, PILLAR_VAR.e],
    ["S", s, PILLAR_VAR.s],
    ["G", g, PILLAR_VAR.g],
  ] as const;
  return (
    <div className={cn("grid gap-1.5", className)}>
      {rows.map(([k, v, c]) => (
        <div
          key={k}
          className="text-muted-foreground grid grid-cols-[12px_minmax(0,1fr)_28px] items-center gap-2 text-[11.5px]"
        >
          <span className="font-semibold">{k}</span>
          <span
            className="bg-muted relative h-1.5 overflow-hidden rounded-full"
            role="img"
            aria-label={`${k} ${formatEsg(v)} / 10`}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${rulerPercent(v)}%`, background: c }}
            />
          </span>
          <span className="tabular text-foreground text-right font-medium">{formatEsg(v)}</span>
        </div>
      ))}
    </div>
  );
}

/** The five interpretation bands as a scale (1–10), with ticks. */
export function BandScale({
  locale,
  onDark,
  showLabels = true,
}: {
  locale: Locale;
  onDark?: boolean;
  showLabels?: boolean;
}) {
  const widths = BANDS.map((b) => (b.max === 10 ? 10 : b.max + 0.1) - b.min);
  return (
    <div>
      <div className="flex h-2.5 gap-[3px]" aria-hidden="true">
        {BANDS.map((b, i) => (
          <span
            key={b.key}
            className={cn(
              "h-full",
              i === 0 && "rounded-l-full",
              i === BANDS.length - 1 && "rounded-r-full",
            )}
            style={{ flex: widths[i], background: BAND_VAR[b.key] }}
          />
        ))}
      </div>
      <div
        className={cn(
          "tabular relative h-6 text-[11px]",
          onDark ? "text-on-forest-2" : "text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <span
            key={n}
            className="absolute top-1.5 -translate-x-1/2"
            style={{ left: `${rulerPercent(n)}%` }}
          >
            {n}
          </span>
        ))}
      </div>
      {showLabels && (
        <div className="mt-1 flex gap-[3px] text-[11.5px]">
          {BANDS.map((b, i) => (
            <div key={b.key} style={{ flex: widths[i] }} className="min-w-0">
              <p
                className={cn(
                  "truncate font-semibold",
                  onDark ? "text-on-forest" : "text-foreground",
                )}
              >
                {tr(locale, b.vi, b.en)}
              </p>
              <p
                className={cn(
                  "tabular hidden truncate sm:block",
                  onDark ? "text-on-forest-2" : "text-muted-foreground",
                )}
              >
                {b.min.toFixed(1)}–{b.max.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
