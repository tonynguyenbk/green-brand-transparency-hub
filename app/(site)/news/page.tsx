import { ArrowUpRightIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CompanyLogo } from "@/components/gl/company-logo";
import { PILLAR_VAR } from "@/components/gl/score-parts";
import { SiteHeader } from "@/components/gl/site-chrome";
import { listEsgCompanies, listNews, type NewsFilters } from "@/lib/esg/service";
import { getLocale } from "@/lib/i18n/server";
import { formatDateL, tr } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "News",
  description: "Every article behind the Greenlens ESG scores, tagged by company and pillar.",
};

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function NewsPage(props: PageProps<"/news">) {
  const sp = await props.searchParams;
  const [locale, companies] = await Promise.all([getLocale(), listEsgCompanies()]);
  const L = (vi: string, en: string) => tr(locale, vi, en);

  const company = one(sp.company);
  const pillar = one(sp.pillar);
  const sentiment = one(sp.sentiment);
  const filters: NewsFilters = {
    company: companies.some((c) => c.slug === company) ? company : undefined,
    pillar: pillar === "E" || pillar === "S" || pillar === "G" ? pillar : undefined,
    sentiment:
      sentiment === "POSITIVE" || sentiment === "NEUTRAL" || sentiment === "NEGATIVE"
        ? sentiment
        : undefined,
  };
  const items = await listNews(filters);

  const href = (patch: Partial<NewsFilters>) => {
    const next = { ...filters, ...patch };
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/news?${s}` : "/news";
  };

  const pillarName = (p: "E" | "S" | "G") =>
    p === "E"
      ? L("Môi trường", "Environmental")
      : p === "S"
        ? L("Xã hội", "Social")
        : L("Quản trị", "Governance");
  const sentimentName = (s: "POSITIVE" | "NEUTRAL" | "NEGATIVE") =>
    s === "POSITIVE"
      ? L("Tin tốt", "Good news")
      : s === "NEGATIVE"
        ? L("Tin xấu", "Bad news")
        : L("Trung lập", "Neutral");

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-sm font-medium transition-colors",
      active ? "bg-foreground text-background border-foreground" : "hover:bg-muted",
    );
  const selected = companies.find((c) => c.slug === filters.company);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="max-w-2xl space-y-3">
          <p className="eyebrow text-primary">{L("Tin tức ESG", "ESG news")}</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            {L("Mọi bài báo đứng sau điểm số", "Every article behind the scores")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {L(
              "Toàn bộ nguồn tin chúng tôi dùng để chấm điểm, gắn nhãn theo công ty và trụ E/S/G. Lọc để xem tin về thương hiệu bạn quan tâm.",
              "All the sources we score from, tagged by company and E/S/G pillar. Filter to follow the brands you care about.",
            )}
          </p>
        </header>

        <div className="mt-8 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link href={href({ pillar: undefined })} className={chip(!filters.pillar)}>
              {L("Tất cả trụ", "All pillars")}
            </Link>
            {(["E", "S", "G"] as const).map((p) => (
              <Link key={p} href={href({ pillar: p })} className={chip(filters.pillar === p)}>
                <span
                  className="mr-1.5 size-2 rounded-full"
                  style={{ background: PILLAR_VAR[p.toLowerCase() as "e" | "s" | "g"] }}
                  aria-hidden="true"
                />
                {pillarName(p)}
              </Link>
            ))}
            <span className="bg-border mx-1 w-px shrink-0" aria-hidden="true" />
            {(["POSITIVE", "NEGATIVE", "NEUTRAL"] as const).map((s) => (
              <Link
                key={s}
                href={href({ sentiment: filters.sentiment === s ? undefined : s })}
                className={chip(filters.sentiment === s)}
              >
                {sentimentName(s)}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link href={href({ company: undefined })} className={chip(!filters.company)}>
              {L("Mọi công ty", "All companies")}
            </Link>
            {companies.map((c) => (
              <Link
                key={c.slug}
                href={href({ company: c.slug })}
                className={cn(chip(filters.company === c.slug), "gap-1.5 pl-1.5")}
              >
                <CompanyLogo name={c.name} domain={c.logoDomain} size={20} />
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground mt-6 text-sm" aria-live="polite">
          {L(`${items.length} bài báo`, `${items.length} articles`)}
          {selected && (
            <>
              {" · "}
              <Link
                href={`/companies/${selected.slug}`}
                className="text-primary font-semibold hover:underline"
              >
                {L(`Xem điểm ESG của ${selected.name}`, `See ${selected.name}'s ESG score`)}
              </Link>
            </>
          )}
        </p>

        {items.length === 0 ? (
          <div className="text-muted-foreground mt-6 rounded-2xl border border-dashed p-10 text-center">
            {L("Chưa có bài báo nào khớp bộ lọc này.", "No articles match these filters.")}{" "}
            <Link href="/news" className="text-primary font-semibold hover:underline">
              {L("Xoá bộ lọc", "Clear filters")}
            </Link>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {items.map((n) => {
              const pv = n.pillar ? PILLAR_VAR[n.pillar.toLowerCase() as "e" | "s" | "g"] : null;
              return (
                <li key={n.id} className="bg-card flex flex-col gap-3 rounded-xl border p-4">
                  <Link
                    href={`/companies/${n.company.slug}`}
                    className="inline-flex items-center gap-2 self-start text-sm font-semibold hover:underline"
                  >
                    <CompanyLogo name={n.company.name} domain={n.company.logoDomain} size={24} />
                    {n.company.name}
                  </Link>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-1 items-start gap-3"
                  >
                    <span className="min-w-0 flex-1 font-medium group-hover:underline">
                      {n.title}
                    </span>
                    <ArrowUpRightIcon
                      className="text-muted-foreground mt-1 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      {L("(mở trong tab mới)", "(opens in a new tab)")}
                    </span>
                  </a>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <span>{host(n.url)}</span>
                    {n.pillar && pv && (
                      <span
                        className="rounded-full px-2 py-0.5 font-semibold"
                        style={{
                          color: pv,
                          background: `color-mix(in oklab, ${pv} 12%, transparent)`,
                        }}
                      >
                        {pillarName(n.pillar)}
                      </span>
                    )}
                    {n.sentiment && (
                      <span className="rounded-full border px-2 py-0.5 font-semibold">
                        {sentimentName(n.sentiment)}
                      </span>
                    )}
                    {n.fromCommunity && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 font-semibold">
                        <UsersIcon className="size-3" aria-hidden="true" />
                        {L("Do cộng đồng gửi", "From the community")}
                      </span>
                    )}
                    <span className="ml-auto">
                      {L("Thêm ngày", "Added")} {formatDateL(locale, n.addedAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
