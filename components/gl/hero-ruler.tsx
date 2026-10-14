"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { formatEsg, rulerPercent } from "@/lib/esg/scoring";
import type { EsgCompanyRow } from "@/lib/esg/service";
import { useLocale, useT } from "@/lib/i18n/client";
import { CompanyLogo } from "./company-logo";
import { BandScale } from "./score-parts";

interface Placed {
  slug: string;
  x: number;
  y: number;
}

/**
 * Symmetric beeswarm: circles are placed in score order at their x position
 * and nudged up or down from a centre line just enough to avoid overlaps.
 */
function beeswarm(rows: EsgCompanyRow[], width: number, d: number, gap = 3) {
  const placed: Placed[] = [];
  const min = d + gap;
  const sorted = [...rows].sort((a, b) => a.overall - b.overall);
  for (const r of sorted) {
    const x = (rulerPercent(r.overall) / 100) * width;
    const near = placed.filter((p) => Math.abs(p.x - x) < min);
    const offsets = near.map((p) => Math.sqrt(Math.max(0, min * min - (p.x - x) ** 2)));
    const candidates = [0, ...near.flatMap((p, i) => [p.y + offsets[i], p.y - offsets[i]])].sort(
      (a, b) => Math.abs(a) - Math.abs(b),
    );
    const y =
      candidates.find((cy) =>
        near.every((p) => (p.x - x) ** 2 + (p.y - cy) ** 2 >= min * min - 0.5),
      ) ?? 0;
    placed.push({ slug: r.slug, x, y });
  }
  const top = Math.max(...placed.map((p) => p.y), 0);
  const bottom = Math.min(...placed.map((p) => p.y), 0);
  return { placed, top, height: top - bottom + d };
}

export function HeroRuler({ rows, average }: { rows: EsgCompanyRow[]; average: number }) {
  const locale = useLocale();
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1100);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const d = width < 560 ? 24 : width < 900 ? 28 : 32;
  const { placed, top, height } = useMemo(() => beeswarm(rows, width, d), [rows, width, d]);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const avgX = rulerPercent(average);

  return (
    <figure className="space-y-3">
      <div ref={ref} className="relative" style={{ height: height + 34 }}>
        <div
          className="border-on-forest-2/60 absolute bottom-0 border-l border-dashed"
          style={{ left: `${avgX}%`, top: 0 }}
          aria-hidden="true"
        >
          <span className="tabular text-on-forest-2 absolute -top-0.5 left-2 text-[11px] whitespace-nowrap">
            {t("Trung bình", "Average")} {formatEsg(average)}
          </span>
        </div>
        <ul aria-label={t("Các công ty theo điểm ESG", "Companies by ESG score")}>
          {placed.map((p, i) => {
            const r = bySlug.get(p.slug)!;
            return (
              <li
                key={p.slug}
                className="group absolute motion-safe:animate-[gl-rise_.5s_ease-out_both]"
                style={{ left: p.x - d / 2, top: 26 + (top - p.y), animationDelay: `${i * 18}ms` }}
              >
                <Link
                  href={`/companies/${r.slug}`}
                  className="ring-forest block rounded-full ring-2 transition-transform duration-150 hover:z-10 hover:scale-125 focus-visible:z-10 focus-visible:scale-125"
                  aria-label={`${r.name}: ${formatEsg(r.overall)}`}
                >
                  <CompanyLogo
                    name={r.name}
                    domain={r.logoDomain}
                    size={d}
                    className="rounded-full"
                  />
                </Link>
                <span className="bg-on-forest text-forest pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md px-2 py-1 text-[12px] font-semibold whitespace-nowrap opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  {r.name} · <span className="tabular">{formatEsg(r.overall)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <BandScale locale={locale} onDark />
      <figcaption className="sr-only">
        {t(
          "Thước đo ESG từ 1 đến 10 chia thành năm dải: Rất yếu, Yếu, Trung bình, Tốt, Mạnh. Mỗi logo là một công ty đặt tại điểm ESG của nó.",
          "ESG ruler from 1 to 10 in five bands: Very weak, Weak, Moderate, Good, Strong. Each logo is a company placed at its ESG score.",
        )}
      </figcaption>
      <style>{`@keyframes gl-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </figure>
  );
}
