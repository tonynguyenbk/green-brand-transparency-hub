import { UsersIcon } from "lucide-react";
import type { CommunitySummary } from "@/lib/community/aggregate";
import { formatEsg, rulerPercent } from "@/lib/esg/scoring";
import { tr, type Locale } from "@/lib/i18n/shared";
import { BandPill, PILLAR_VAR } from "../score-parts";

/**
 * Greenlens vs community, pillar by pillar, on one 1–10 ruler each:
 * filled dot = Greenlens, ring = community. Never combined into one number.
 */
export function CommunityCompare({
  locale,
  name,
  greenlens,
  summary,
}: {
  locale: Locale;
  name: string;
  greenlens: { e: number; s: number; g: number; overall: number };
  summary: CommunitySummary;
}) {
  const L = (vi: string, en: string) => tr(locale, vi, en);

  if (!summary.shown) {
    return (
      <section aria-labelledby="community-h" className="bg-muted/60 space-y-4 rounded-2xl p-6">
        <h2 id="community-h" className="text-2xl font-semibold">
          {L("Cộng đồng nghĩ gì", "What the community thinks")}
        </h2>
        <div className="flex items-center gap-4">
          <span className="bg-card grid size-12 place-items-center rounded-xl border">
            <UsersIcon className="text-muted-foreground size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {L(
                `Mới có ${summary.count}/10 đánh giá cho ${name}`,
                `${summary.count} of 10 ratings so far for ${name}`,
              )}
            </p>
            <div
              className="bg-border mt-2 h-1.5 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={summary.count}
              aria-label={L("Số đánh giá", "Ratings so far")}
            >
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${summary.count * 10}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          {L(
            "Điểm cộng đồng hiện khi đủ 10 người chấm, để vài lượt đầu tiên không làm lệch kết quả.",
            "The community score appears once 10 people have rated, so the first few ratings can't skew it.",
          )}
        </p>
        <a
          href="#rate-h"
          className="text-primary inline-block text-sm font-semibold hover:underline lg:hidden"
        >
          {L("Chấm điểm của bạn ↓", "Add your rating ↓")}
        </a>
      </section>
    );
  }

  const rows = [
    { k: "e" as const, label: L("Môi trường", "Environmental"), gl: greenlens.e, cm: summary.e! },
    { k: "s" as const, label: L("Xã hội", "Social"), gl: greenlens.s, cm: summary.s! },
    { k: "g" as const, label: L("Quản trị", "Governance"), gl: greenlens.g, cm: summary.g! },
  ];
  const widest = rows.reduce((a, b) => (Math.abs(b.cm - b.gl) > Math.abs(a.cm - a.gl) ? b : a));

  return (
    <section
      aria-labelledby="community-h"
      className="bg-card space-y-6 rounded-2xl border p-6 sm:p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="community-h" className="text-2xl font-semibold">
          {L("Hai góc nhìn, không cộng gộp", "Two views, never combined")}
        </h2>
        <span className="text-muted-foreground text-xs">
          {L("Thang 1–10 · cùng công thức 40/35/25", "1–10 scale · same 40/35/25 formula")}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-4">
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="bg-foreground size-3 rounded-full" aria-hidden="true" />
            {L("Điểm Greenlens", "Greenlens score")}
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="tabular font-serif text-5xl font-semibold">
              {formatEsg(greenlens.overall)}
            </span>
            <BandPill score={greenlens.overall} locale={locale} />
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {L("Chấm từ các bài báo đã kiểm chứng", "Scored from verified articles")}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span
              className="border-foreground bg-card size-3 rounded-full border-2"
              aria-hidden="true"
            />
            {L("Điểm cộng đồng", "Community score")}
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="tabular font-serif text-5xl font-semibold">
              {formatEsg(summary.overall)}
            </span>
            <BandPill score={summary.overall!} locale={locale} />
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {L(`Từ ${summary.count} người đã đăng nhập`, `From ${summary.count} signed-in people`)}
          </p>
        </div>
      </div>

      <ul className="space-y-5">
        {rows.map((r) => {
          const lo = Math.min(r.gl, r.cm);
          const hi = Math.max(r.gl, r.cm);
          const diff = r.cm - r.gl;
          return (
            <li
              key={r.k}
              className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 sm:grid-cols-[7.5rem_minmax(0,1fr)_7.5rem]"
            >
              <span className="text-sm font-semibold" style={{ color: PILLAR_VAR[r.k] }}>
                {r.label}
              </span>
              <span
                className="relative h-7"
                role="img"
                aria-label={L(
                  `${r.label}: Greenlens ${formatEsg(r.gl)}, cộng đồng ${formatEsg(r.cm)}`,
                  `${r.label}: Greenlens ${formatEsg(r.gl)}, community ${formatEsg(r.cm)}`,
                )}
              >
                <span className="bg-border absolute inset-x-0 top-[13px] h-0.5" />
                <span
                  className="absolute top-3 h-1 opacity-35"
                  style={{
                    left: `${rulerPercent(lo)}%`,
                    width: `${rulerPercent(hi) - rulerPercent(lo)}%`,
                    background: PILLAR_VAR[r.k],
                  }}
                />
                <span
                  className="bg-card absolute top-1.5 -ml-2 size-4 rounded-full border-2"
                  style={{ left: `${rulerPercent(r.cm)}%`, borderColor: PILLAR_VAR[r.k] }}
                />
                <span
                  className="absolute top-1.5 -ml-2 size-4 rounded-full"
                  style={{ left: `${rulerPercent(r.gl)}%`, background: PILLAR_VAR[r.k] }}
                />
              </span>
              <span className="tabular col-start-2 text-sm sm:col-start-auto sm:text-right">
                <b>{formatEsg(r.gl)}</b> · {formatEsg(r.cm)}{" "}
                <span className={diff < 0 ? "text-[var(--band-1)]" : "text-primary"}>
                  {diff > 0 ? "+" : diff < 0 ? "−" : "±"}
                  {Math.abs(diff).toFixed(1)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {Math.abs(widest.cm - widest.gl) >= 0.5 && (
        <p className="text-muted-foreground border-t pt-4 text-sm">
          {widest.cm < widest.gl
            ? L(
                `Cộng đồng chấm ${name} thấp hơn Greenlens nhiều nhất ở trụ ${widest.label}.`,
                `The community rates ${name} furthest below Greenlens on ${widest.label}.`,
              )
            : L(
                `Cộng đồng chấm ${name} cao hơn Greenlens nhiều nhất ở trụ ${widest.label}.`,
                `The community rates ${name} furthest above Greenlens on ${widest.label}.`,
              )}
        </p>
      )}
      <a
        href="#rate-h"
        className="text-primary inline-block text-sm font-semibold hover:underline lg:hidden"
      >
        {L("Chấm điểm của bạn ↓", "Add your rating ↓")}
      </a>
    </section>
  );
}
