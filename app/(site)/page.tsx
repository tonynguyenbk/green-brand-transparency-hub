import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/gl/company-logo";
import { HeroRuler } from "@/components/gl/hero-ruler";
import { HeroSearch } from "@/components/gl/hero-search";
import { MemberAvatar } from "@/components/gl/member-avatar";
import { Rankings } from "@/components/gl/rankings";
import { BAND_VAR, PILLAR_VAR } from "@/components/gl/score-parts";
import { SiteHeader } from "@/components/gl/site-chrome";
import { SECTORS } from "@/data/esg/companies";
import { getLeaderboard } from "@/lib/community/profiles";
import { ESG_WEIGHTS, bandFor, formatEsg } from "@/lib/esg/scoring";
import { listEsgCompanies, summarizeSectors } from "@/lib/esg/service";
import { getLocale } from "@/lib/i18n/server";
import { formatDateL, pick, tr } from "@/lib/i18n/shared";

export const dynamic = "force-dynamic";

/** Zoomed range for the per-sector strips (all scores fall well inside it). */
const STRIP_MIN = 4;
const STRIP_MAX = 8.5;
/** Gold, silver, bronze rank chips (as on the leaderboard page). */
const MEDAL = ["#d4a017", "#9ca3af", "#b4713d"];

export default async function HomePage() {
  const [locale, rows, board] = await Promise.all([
    getLocale(),
    listEsgCompanies(),
    getLeaderboard("week", null, 3),
  ]);
  const L = (vi: string, en: string) => tr(locale, vi, en);
  const sectors = summarizeSectors(rows);
  const average = rows.reduce((s, r) => s + r.overall, 0) / Math.max(rows.length, 1);
  const sourceCount = rows.reduce((s, r) => s + r.sourceCount, 0);
  const updated = rows
    .map((r) => r.assessedAt)
    .sort()
    .at(-1);
  const vnCount = rows.filter((r) => r.country === "VN").length;

  return (
    <>
      {/* Hero */}
      <div className="contours text-on-forest">
        <SiteHeader variant="forest" />
        <section id="main" className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
            <div className="flex flex-col justify-center space-y-7">
              <p className="eyebrow text-mint">
                {L("Cơ sở dữ liệu ESG · dựng từ báo chí", "ESG database · built from the news")}
              </p>
              <h1 className="text-[2.3rem] leading-[1.06] font-semibold sm:text-5xl xl:text-[3.6rem]">
                {L(
                  `Điểm ESG của ${rows.length} thương hiệu lớn,`,
                  `ESG scores for ${rows.length} major brands,`,
                )}{" "}
                <em className="text-mint">
                  {L("và từng bài báo đứng sau con số.", "and every article behind the number.")}
                </em>
              </h1>
              <p className="text-on-forest-2 max-w-xl text-lg">
                {L(
                  "Chúng tôi đọc tin tức về môi trường, xã hội và quản trị của từng công ty, chấm điểm theo một công thức công khai và dẫn nguồn cho mọi nhận định.",
                  "We read the coverage of each company's environmental, social and governance record, score it with a published formula and cite a source for every judgement.",
                )}
              </p>
              <HeroSearch rows={rows} />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-6 sm:grid-cols-4">
                {[
                  [String(rows.length), L("công ty được chấm", "companies scored")],
                  [String(sectors.length), L("ngành", "sectors")],
                  [String(sourceCount), L("nguồn bài báo", "cited sources")],
                  [String(vnCount), L("doanh nghiệp Việt Nam", "Vietnamese companies")],
                ].map(([v, k]) => (
                  <div key={k}>
                    <dt className="sr-only">{k}</dt>
                    <dd>
                      <span className="tabular block font-serif text-3xl font-semibold">{v}</span>
                      <span className="text-on-forest-2 text-sm">{k}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside
              aria-label={L("Nổi bật", "Highlights")}
              className="divide-y divide-white/10 self-center rounded-3xl border border-white/10 bg-white/[0.04]"
            >
              <section aria-labelledby="top-h" className="p-5 sm:p-6">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 id="top-h" className="font-sans text-base font-semibold">
                    {L("Điểm ESG cao nhất", "Top ESG scores")}
                  </h2>
                  <span className="text-on-forest-2 text-xs">
                    {L(`${rows.length} công ty`, `${rows.length} companies`)}
                  </span>
                </div>
                <ol className="space-y-1">
                  {rows.slice(0, 5).map((r, i) => (
                    <li key={r.slug}>
                      <Link
                        href={`/companies/${r.slug}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.06]"
                      >
                        <span className="tabular text-on-forest-2 w-4 text-sm">{i + 1}</span>
                        <CompanyLogo name={r.name} domain={r.logoDomain} size={28} />
                        <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                        <span
                          className="tabular rounded-md px-2 py-0.5 text-sm font-semibold text-white"
                          style={{ background: BAND_VAR[r.band] }}
                        >
                          {formatEsg(r.overall)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link
                  href="/#rankings"
                  className="text-mint mt-3 inline-flex items-center gap-1 px-2 text-sm font-semibold hover:underline"
                >
                  {L("Xem toàn bộ xếp hạng", "See all rankings")}
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </section>

              <section aria-labelledby="lb-h" className="p-5 sm:p-6">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 id="lb-h" className="font-sans text-base font-semibold">
                    {L("Leaderboard tuần này", "Leaderboard this week")}
                  </h2>
                  <span className="text-on-forest-2 text-xs">Green Points</span>
                </div>
                {board.rows.length === 0 ? (
                  <p className="text-on-forest-2 px-2 text-sm">
                    {L("Chưa ai có điểm tuần này.", "Nobody has scored this week yet.")}
                  </p>
                ) : (
                  <ol className="space-y-1">
                    {board.rows.slice(0, 3).map((r) => (
                      <li key={r.memberId} className="flex items-center gap-3 px-2 py-1.5">
                        <span
                          className="tabular grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                          style={{ background: MEDAL[r.rank - 1] ?? "rgb(255 255 255 / 0.2)" }}
                        >
                          {r.rank}
                        </span>
                        <MemberAvatar name={r.name} src={r.avatarUrl} size={28} />
                        <span className="min-w-0 flex-1 truncate">
                          {r.name ?? L("Thành viên ẩn danh", "Anonymous member")}
                        </span>
                        <span className="tabular text-sm font-semibold">{r.points} GP</span>
                      </li>
                    ))}
                  </ol>
                )}
                <Link
                  href="/leaderboard"
                  className="text-mint mt-3 inline-flex items-center gap-1 px-2 text-sm font-semibold hover:underline"
                >
                  {L("Tham gia Leaderboard", "Join the leaderboard")}
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </section>
            </aside>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold sm:text-2xl">
                {L("Cả cơ sở dữ liệu trên một thước đo", "The whole database on one ruler")}
              </h2>
              <p className="text-on-forest-2 text-sm">
                {L(
                  "Di chuột hoặc chạm vào logo để xem điểm · cập nhật ",
                  "Hover or tap a logo for its score · updated ",
                )}
                {updated ? formatDateL(locale, updated) : "—"}
              </p>
            </div>
            <HeroRuler rows={rows} average={average} />
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-6xl space-y-24 px-4 pt-20 sm:px-6">
        {/* Sectors */}
        <section id="sectors" aria-labelledby="sectors-h" className="scroll-mt-20 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="eyebrow text-primary">{L("Theo ngành", "By sector")}</p>
              <h2 id="sectors-h" className="text-3xl font-semibold sm:text-4xl">
                {L("Mỗi ngành có rủi ro ESG riêng", "Every sector carries its own ESG risks")}
              </h2>
            </div>
            <p className="text-muted-foreground max-w-md text-sm">
              {L(
                "So sánh có ý nghĩa nhất là giữa các công ty cùng ngành, vì mỗi ngành chịu áp lực môi trường và xã hội khác nhau.",
                "Comparisons mean most within a sector, because each industry faces different environmental and social pressures.",
              )}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((s) => {
              const meta = SECTORS.find((x) => x.key === s.key)!;
              const band = bandFor(s.average);
              return (
                <li
                  key={s.key}
                  className="group bg-card flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-[0_18px_40px_-28px_rgb(13_42_31/0.55)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{pick(locale, meta)}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {s.count} {L("công ty", "companies")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="tabular font-serif text-3xl leading-none font-semibold"
                        style={{ color: BAND_VAR[band.key] }}
                      >
                        {formatEsg(s.average)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {L("trung bình", "average")}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-4 text-sm">{pick(locale, meta.context)}</p>
                  <div className="mt-6" aria-hidden="true">
                    <div className="relative mx-3 h-9">
                      <div className="bg-border absolute inset-x-0 top-1/2 h-px" />
                      {s.companies.map((c) => (
                        <span
                          key={c.slug}
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${Math.min(100, Math.max(0, ((c.overall - STRIP_MIN) / (STRIP_MAX - STRIP_MIN)) * 100))}%`,
                          }}
                        >
                          <CompanyLogo
                            name={c.name}
                            domain={c.logoDomain}
                            size={26}
                            className="ring-card rounded-full ring-2"
                          />
                        </span>
                      ))}
                    </div>
                    <div className="tabular text-muted-foreground flex justify-between text-[11px]">
                      <span>{STRIP_MIN.toFixed(1)}</span>
                      <span>{STRIP_MAX.toFixed(1)}</span>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground text-xs">{L("Cao nhất", "Highest")}</dt>
                      <dd>
                        <Link
                          href={`/companies/${s.top.slug}`}
                          className="font-medium hover:underline"
                        >
                          {s.top.name}
                        </Link>{" "}
                        <span className="tabular text-muted-foreground">
                          {formatEsg(s.top.overall)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">{L("Thấp nhất", "Lowest")}</dt>
                      <dd>
                        <Link
                          href={`/companies/${s.bottom.slug}`}
                          className="font-medium hover:underline"
                        >
                          {s.bottom.name}
                        </Link>{" "}
                        <span className="tabular text-muted-foreground">
                          {formatEsg(s.bottom.overall)}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
            <li className="flex flex-col justify-between rounded-2xl border border-dashed p-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {L("Thiếu một công ty?", "Missing a company?")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {L(
                    "Bộ dữ liệu đang mở rộng. Bạn sẽ sớm gửi được bài báo và đề xuất công ty mới ngay trên trang.",
                    "The dataset is growing. Soon you'll be able to submit articles and suggest companies right here.",
                  )}
                </p>
              </div>
              <Link
                href="/how-we-score"
                className="text-primary mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              >
                {L("Xem cách chúng tôi chọn và chấm", "See how we select and score")}{" "}
                <ArrowRightIcon className="size-4" />
              </Link>
            </li>
          </ul>
        </section>

        {/* Rankings */}
        <section id="rankings" aria-labelledby="rankings-h" className="scroll-mt-20 space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="eyebrow text-primary">{L("Xếp hạng công ty", "Company rankings")}</p>
            <h2 id="rankings-h" className="text-3xl font-semibold sm:text-4xl">
              {L("Tất cả 27 công ty, xếp theo điểm ESG", "All 27 companies, ranked by ESG score")}
            </h2>
          </div>
          <Rankings rows={rows} />
          <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
            {L(
              "Điểm là ước tính phân tích dựa trên bài báo đã thu thập, không phải xếp hạng chính thức. Thiếu bằng chứng không có nghĩa công ty làm kém, mà là hiệu quả ESG khó kiểm chứng hơn.",
              "Scores are analytical estimates based on collected articles, not official ratings. Missing evidence does not mean a company performs poorly; it means its ESG performance is harder to verify.",
            )}
          </p>
        </section>

        {/* Method teaser */}
        <section
          aria-labelledby="method-h"
          className="bg-card grid gap-10 rounded-3xl border p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr]"
        >
          <div className="space-y-4">
            <p className="eyebrow text-primary">{L("Phương pháp", "Methodology")}</p>
            <h2 id="method-h" className="text-3xl font-semibold">
              {L("Một công thức, áp dụng cho mọi công ty", "One formula, applied to every company")}
            </h2>
            <p className="text-muted-foreground">
              {L(
                "Mỗi trụ được chấm trên thang 10 dựa trên cả thành tích lẫn tranh cãi được báo chí đưa tin. Chúng tôi thưởng cho kết quả chứng minh được, không phải lời hứa.",
                "Each pillar is scored out of 10 from both achievements and controversies in the coverage. We reward demonstrated results, not promises.",
              )}
            </p>
            <Link
              href="/how-we-score"
              className="text-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
            >
              {L("Đọc phương pháp đầy đủ", "Read the full methodology")}{" "}
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <div className="space-y-6">
            <div
              className="flex h-14 overflow-hidden rounded-xl text-sm font-semibold text-white"
              role="img"
              aria-label="E 40%, S 35%, G 25%"
            >
              {(["e", "s", "g"] as const).map((k) => (
                <div
                  key={k}
                  className="flex items-center px-4"
                  style={{ flex: ESG_WEIGHTS[k], background: PILLAR_VAR[k] }}
                >
                  {k.toUpperCase()} · {Math.round(ESG_WEIGHTS[k] * 100)}%
                </div>
              ))}
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  "E",
                  L("Môi trường", "Environmental"),
                  L(
                    "Phát thải, năng lượng tái tạo, rác và bao bì, mục tiêu so với kết quả.",
                    "Emissions, renewables, waste and packaging, targets vs results.",
                  ),
                ],
                [
                  "S",
                  L("Xã hội", "Social"),
                  L(
                    "Quyền lao động, chuỗi cung ứng, an toàn sản phẩm, cộng đồng.",
                    "Labour rights, supply chain, product safety, community.",
                  ),
                ],
                [
                  "G",
                  L("Quản trị", "Governance"),
                  L(
                    "Giám sát, đạo đức kinh doanh, minh bạch, xử lý tranh cãi.",
                    "Oversight, ethics, transparency, response to controversy.",
                  ),
                ],
              ].map(([k, name, desc]) => (
                <div key={k}>
                  <dt className="font-semibold">
                    {k} · {name}
                  </dt>
                  <dd className="text-muted-foreground mt-1 text-sm">{desc}</dd>
                </div>
              ))}
            </dl>
            <p className="tabular bg-muted rounded-lg px-4 py-3 font-mono text-sm">
              ESG = 0.40 × E + 0.35 × S + 0.25 × G
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
