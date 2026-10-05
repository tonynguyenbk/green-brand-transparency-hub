import { LeafIcon } from "lucide-react";
import { ConfidenceBadge, EvidenceStrengthBadge, RiskBadge } from "@/components/scoring/badges";
import { ScoreDisplay, ScoreMeter } from "@/components/scoring/score-display";
import type { StudyStimulus } from "@/lib/research/instrument";
import type { ConfidenceLevelValue, RiskLevelValue } from "@/lib/scoring/types";

/** The advertisement shown to every condition. Deliberately styled like a brand ad, not like the Hub. */
export function AdStimulus({ stimulus }: { stimulus: StudyStimulus }) {
  return (
    <figure className="overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 to-lime-50 p-8 text-emerald-950">
      <p className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
        <LeafIcon className="size-4" aria-hidden="true" /> {stimulus.brandName}
      </p>
      <p className="mt-6 font-serif text-3xl leading-tight font-semibold">{stimulus.headline}</p>
      <p className="mt-3 max-w-lg text-base">{stimulus.body}</p>
      <figcaption className="mt-6 border-t border-emerald-900/10 pt-4 text-sm">
        <span className="font-semibold">Product: </span>
        {stimulus.productDescription}
      </figcaption>
    </figure>
  );
}

export interface HubSummaryData {
  brandName: string;
  score: number | null;
  confidence: ConfidenceLevelValue | null;
  dimensions: { label: string; score: number | null }[];
  claims: {
    text: string;
    riskLevel: RiskLevelValue | null;
    riskScore: number | null;
    evidenceStrength: string;
  }[];
  gaps: string[];
}

/** Condensed Transparency Hub profile shown only in the treatment condition. */
export function HubSummary({ data }: { data: HubSummaryData }) {
  return (
    <section
      aria-label="Transparency Hub profile"
      className="bg-card space-y-6 rounded-2xl border p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            Green Brand Transparency Hub
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold">{data.brandName}</p>
        </div>
        <div className="space-y-2 text-right">
          <ScoreDisplay score={data.score} size="md" />
          <ConfidenceBadge level={data.confidence} />
        </div>
      </div>
      <div className="space-y-2">
        {data.dimensions.map((d) => (
          <div key={d.label} className="grid grid-cols-[11rem_1fr] items-center gap-3 text-sm">
            <span className="text-muted-foreground">{d.label}</span>
            <ScoreMeter value={d.score} label={d.label} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Claims and their evidence</p>
        <ul className="divide-y rounded-lg border">
          {data.claims.map((c) => (
            <li
              key={c.text}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
            >
              <span className="font-serif">“{c.text}”</span>
              <span className="flex gap-1.5">
                <EvidenceStrengthBadge label={c.evidenceStrength} />
                <RiskBadge level={c.riskLevel} score={c.riskScore} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {data.gaps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Transparency gaps</p>
          <ul className="text-muted-foreground list-disc space-y-0.5 pl-5 text-sm">
            {data.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        Scores describe the transparency of sustainability communication, not environmental
        performance.
      </p>
    </section>
  );
}
