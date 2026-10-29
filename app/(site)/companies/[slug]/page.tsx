import { AlertTriangleIcon, ArrowLeftIcon, ArrowUpRightIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityCompare } from "@/components/gl/community/compare";
import { RateCard, type CommunityAccess } from "@/components/gl/community/rate-card";
import { SourceVote } from "@/components/gl/community/source-vote";
import { SubmitArticle } from "@/components/gl/community/submit-article";
import { CompanyLogo } from "@/components/gl/company-logo";
import { BAND_VAR, BandPill, BandScale, PILLAR_VAR } from "@/components/gl/score-parts";
import { SiteHeader } from "@/components/gl/site-chrome";
import { SECTORS } from "@/data/esg/companies";
import { getMember, getMemberAuthMode } from "@/lib/auth/member";
import { getCommunityView } from "@/lib/community/service";
import { ESG_WEIGHTS, formatEsg, rulerPercent } from "@/lib/esg/scoring";
import { getEsgCompany } from "@/lib/esg/service";
import { getLocale } from "@/lib/i18n/server";
import { formatDateL, pick, tr } from "@/lib/i18n/shared";
import { slugSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const slug = slugSchema.safeParse((await props.params).slug);
  const c = slug.success ? await getEsgCompany(slug.data) : null;
  return c
    ? {
        title: `${c.name} · ESG ${formatEsg(c.assessment.overall)}/10`,
        description: c.assessment.why.en,
      }
    : { title: "Company not found" };
}

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function CompanyPage(props: PageProps<"/companies/[slug]">) {
  const slug = slugSchema.safeParse((await props.params).slug);
  if (!slug.success) notFound();
  const [locale, c, member] = await Promise.all([
    getLocale(),
    getEsgCompany(slug.data),
    getMember(),
  ]);
  if (!c) notFound();
  const community = await getCommunityView(
    c.id,
    c.sources.map((s) => s.id),
    member?.id ?? null,
  );
  const access: CommunityAccess = {
    mode: getMemberAuthMode(),
    signedIn: Boolean(member),
    loginHref: `/login?next=${encodeURIComponent(`/companies/${c.slug}`)}`,
  };
  const L = (vi: string, en: string) => tr(locale, vi, en);
  const a = c.assessment;
  const sector = SECTORS.find((s) => s.key === c.sector)!;

  const pillars = [
    {
      k: "e" as const,
      name: L("Môi trường", "Environmental"),
      v: a.e,
      note: pick(locale, a.notes.e),
    },
    { k: "s" as const, name: L("Xã hội", "Social"), v: a.s, note: pick(locale, a.notes.s) },
    { k: "g" as const, name: L("Quản trị", "Governance"), v: a.g, note: pick(locale, a.notes.g) },
  ];

  return (
    <>
      <div className="contours text-on-forest">
        <SiteHeader variant="forest" />
        <section id="main" className="mx-auto max-w-6xl px-4 pt-6 pb-14 sm:px-6">
          <Link
            href="/#rankings"
            className="text-on-forest-2 hover:text-on-forest inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeftIcon className="size-4" /> {L("Xếp hạng công ty", "Company rankings")}
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <div>
              <div className="flex items-center gap-5">
                <CompanyLogo
                  name={c.name}
                  domain={c.logoDomain}
                  size={76}
                  className="shadow-[0_16px_40px_-16px_rgb(0_0_0/0.6)]"
                />
                <div>
                  <p className="eyebrow text-mint">
                    {pick(locale, sector)} · {c.country}
                  </p>
                  <h1 className="mt-1 text-4xl font-semibold sm:text-6xl">{c.name}</h1>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-end gap-x-5 gap-y-3">
                <p className="tabular font-serif text-7xl leading-[0.85] font-semibold sm:text-8xl">
                  {formatEsg(a.overall)}
                  <span className="text-on-forest-2 ml-2 font-sans text-xl font-normal">/ 10</span>
                </p>
                <div className="space-y-2 pb-1">
                  <BandPill score={a.overall} locale={locale} className="bg-on-forest! text-sm" />
                  <p className="text-on-forest-2">
                    {pick(locale, { vi: a.band.meaningVi, en: a.band.meaningEn })}
                  </p>
                </div>
              </div>
              <div className="text-on-forest-2 mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span>
                  {L("Hạng", "Rank")}{" "}
                  <b className="tabular text-on-forest">
                    {c.rankInSector}/{c.peers.length}
                  </b>{" "}
                  {L("trong ngành", "in sector")}
                </span>
                <span>
                  {L("Hạng", "Rank")}{" "}
                  <b className="tabular text-on-forest">
                    {c.rankOverall}/{c.totalCompanies}
                  </b>{" "}
                  {L("toàn bảng", "overall")}
                </span>
                <span>
                  {L("Đánh giá ngày", "Assessed")} {formatDateL(locale, a.assessedAt)}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="mb-5 text-sm font-semibold">
                {L("Vị trí trên thước đo", "Position on the ruler")}
              </p>
              <div className="relative mb-2 h-[104px]">
                {[...pillars, { k: "esg" as const, name: "ESG", v: a.overall, note: "" }].map(
                  (p, i) => (
                    <div
                      key={p.k}
                      className="absolute inset-x-0 h-5 border-b border-dashed border-white/10"
                      style={{ top: i * 26 }}
                    >
                      <span className="text-on-forest-2 absolute top-0 left-0 text-[11px] font-bold">
                        {p.k.toUpperCase()}
                      </span>
                      <span
                        className="ring-forest absolute top-0.5 -ml-2 size-4 rounded-full ring-2"
                        style={{
                          left: `${rulerPercent(p.v)}%`,
                          background: p.k === "esg" ? "var(--mint)" : PILLAR_VAR[p.k],
                        }}
                      >
                        <span className="tabular absolute top-[-2px] left-5 text-xs font-bold whitespace-nowrap">
                          {formatEsg(p.v)}
                        </span>
                      </span>
                    </div>
                  ),
                )}
              </div>
              <BandScale locale={locale} onDark showLabels={false} />
              <p className="tabular text-on-forest-2 mt-4 rounded-lg bg-black/20 px-3 py-2 font-mono text-[12.5px]">
                {formatEsg(a.e)} × {ESG_WEIGHTS.e} + {formatEsg(a.s)} × {ESG_WEIGHTS.s} +{" "}
                {formatEsg(a.g)} × {ESG_WEIGHTS.g} ={" "}
                <b className="text-on-forest">{a.overall.toFixed(3)}</b>
              </p>
            </div>
          </div>
        </section>
      </div>

      <main className="mx-auto grid max-w-6xl gap-12 px-4 pt-14 sm:px-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="why-h" className="space-y-4">
            <h2 id="why-h" className="eyebrow text-primary font-sans">
              {L("Vì sao có điểm này", "Why this score")}
            </h2>
            <blockquote className="border-primary border-l-4 pl-6 font-serif text-2xl leading-snug sm:text-[1.7rem]">
              {pick(locale, a.why)}
            </blockquote>
          </section>

          <section aria-labelledby="pillars-h" className="space-y-5">
            <h2 id="pillars-h" className="text-2xl font-semibold">
              {L("Đánh giá từng trụ", "Pillar by pillar")}
            </h2>
            <ul className="grid gap-4">
              {pillars.map((p) => (
                <li key={p.k} className="bg-card rounded-2xl border p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span
                      className="grid size-11 place-items-center rounded-xl font-serif text-xl font-semibold text-white"
                      style={{ background: PILLAR_VAR[p.k] }}
                    >
                      {p.k.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-sans text-base font-semibold">{p.name}</h3>
                      <p className="text-muted-foreground text-xs">
                        {L("Trọng số", "Weight")} {Math.round(ESG_WEIGHTS[p.k] * 100)}%
                      </p>
                    </div>
                    <p className="tabular font-serif text-4xl font-semibold">
                      {formatEsg(p.v)}
                      <span className="text-muted-foreground font-sans text-sm font-normal">
                        {" "}
                        /10
                      </span>
                    </p>
                  </div>
                  <div
                    className="bg-muted mt-4 h-2 overflow-hidden rounded-full"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${rulerPercent(p.v)}%`, background: PILLAR_VAR[p.k] }}
                    />
                  </div>
                  <p className="mt-4 leading-relaxed">{p.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <CommunityCompare
            locale={locale}
            name={c.name}
            greenlens={{ e: a.e, s: a.s, g: a.g, overall: a.overall }}
            summary={community.summary}
          />

          <section aria-labelledby="src-h" className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="src-h" className="text-2xl font-semibold">
                  {L("Nguồn tin đứng sau điểm số", "The sources behind the score")}{" "}
                  <span className="tabular text-muted-foreground">({c.sources.length})</span>
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {L(
                    `Bài này có phản ánh đúng ${c.name} không? Phiếu của bạn giúp chúng tôi lọc nguồn.`,
                    `Does each article fairly reflect ${c.name}? Your vote helps us filter sources.`,
                  )}
                </p>
              </div>
            </div>
            <ul className="grid gap-3">
              {c.sources.map((s) => (
                <li key={s.id} className="bg-card space-y-3 rounded-xl border p-4">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4"
                  >
                    <CompanyLogo name={host(s.url)} domain={host(s.url)} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium group-hover:underline">{s.title}</span>
                      <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                        {host(s.url)}
                        {s.pillar && (
                          <span
                            className="rounded-full px-2 py-0.5 font-semibold"
                            style={{
                              color: PILLAR_VAR[s.pillar.toLowerCase() as "e" | "s" | "g"],
                              background: `color-mix(in oklab, ${PILLAR_VAR[s.pillar.toLowerCase() as "e" | "s" | "g"]} 12%, transparent)`,
                            }}
                          >
                            {s.pillar === "E"
                              ? L("Môi trường", "Environmental")
                              : s.pillar === "S"
                                ? L("Xã hội", "Social")
                                : L("Quản trị", "Governance")}
                          </span>
                        )}
                        {s.fromCommunity && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 font-semibold">
                            <UsersIcon className="size-3" aria-hidden="true" />
                            {L("Do cộng đồng gửi", "Suggested by the community")}
                          </span>
                        )}
                        {s.needsReplacement && (
                          <span className="bg-notice-bg text-notice inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold">
                            <AlertTriangleIcon className="size-3" />
                            {L(
                              "Không phải bài báo cụ thể, cần thay",
                              "Not a specific article; needs replacing",
                            )}
                          </span>
                        )}
                      </span>
                    </span>
                    <ArrowUpRightIcon
                      className="text-muted-foreground mt-1 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      {L("(mở trong tab mới)", "(opens in a new tab)")}
                    </span>
                  </a>
                  <div className="border-t pt-3">
                    <SourceVote
                      sourceId={s.id}
                      initial={community.reliability[s.id]}
                      access={access}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-start gap-3 rounded-xl border border-dashed p-4">
              <p className="text-muted-foreground min-w-0 flex-1 basis-60 text-sm">
                {L(
                  `Bạn biết một bài báo về ${c.name} mà chúng tôi chưa có?`,
                  `Know an article about ${c.name} that we're missing?`,
                )}
              </p>
              <SubmitArticle
                slug={c.slug}
                name={c.name}
                access={access}
                mySubmissions={community.mySubmissions}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <RateCard
            slug={c.slug}
            name={c.name}
            summary={community.summary}
            mine={community.mine}
            greenlens={{ e: a.e, s: a.s, g: a.g }}
            access={access}
          />

          <section aria-labelledby="peer-h" className="bg-card rounded-2xl border p-6">
            <h2 id="peer-h" className="font-sans text-base font-semibold">
              {L("So với cùng ngành", "Versus the sector")}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">{pick(locale, sector)}</p>
            <ul className="mt-5 space-y-3">
              {c.peers.map((p) => {
                const me = p.slug === c.slug;
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/companies/${p.slug}`}
                      className="group block"
                      aria-current={me ? "page" : undefined}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className={me ? "font-semibold" : "group-hover:underline"}>
                          {p.name}
                        </span>
                        <span className="tabular font-semibold">{formatEsg(p.overall)}</span>
                      </div>
                      <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.overall * 10}%`,
                            background: me ? BAND_VAR[p.band] : "var(--muted-foreground)",
                            opacity: me ? 1 : 0.35,
                          }}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="text-muted-foreground rounded-2xl border border-dashed p-6 text-sm">
            <p className="text-foreground font-semibold">
              {L("Về điểm số này", "About this score")}
            </p>
            <p className="mt-2">
              {L(
                "Ước tính phân tích theo phương pháp esg-1.0, dựa trên bài báo và công bố của doanh nghiệp. Không phải xếp hạng chính thức và có thể thay đổi khi có bằng chứng mới.",
                "Analytical estimate under methodology esg-1.0, based on articles and company disclosures. Not an official rating; it may change as new evidence appears.",
              )}
            </p>
            <Link
              href="/how-we-score"
              className="text-primary mt-3 inline-block font-semibold hover:underline"
            >
              {L("Cách chúng tôi chấm điểm", "How we score")}
            </Link>
          </section>
        </aside>
      </main>
    </>
  );
}
