import { AwardIcon, CheckCircle2Icon, StarIcon, ThumbsUpIcon, UserRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { MemberAvatar } from "@/components/gl/member-avatar";
import { SiteHeader } from "@/components/gl/site-chrome";
import { getMember, getMemberAuthMode } from "@/lib/auth/member";
import { POINTS, LEVELS, VOTE_POINTS_DAILY_CAP, type Period } from "@/lib/community/points";
import { getLeaderboard, type LeaderboardRow } from "@/lib/community/profiles";
import { getLocale } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Members who research, check and contribute ESG evidence on Greenlens.",
};

const MEDAL = ["#d4a017", "#9ca3af", "#b4713d"];

export default async function LeaderboardPage(props: PageProps<"/leaderboard">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.period) ? sp.period[0] : sp.period;
  const period: Period = raw === "month" || raw === "all" ? raw : "week";
  const [locale, member] = await Promise.all([getLocale(), getMember()]);
  const board = await getLeaderboard(period, member?.id ?? null);
  const L = (vi: string, en: string) => tr(locale, vi, en);
  const mode = getMemberAuthMode();

  const periods: { key: Period; label: string }[] = [
    { key: "week", label: L("Tuần này", "This week") },
    { key: "month", label: L("Tháng này", "This month") },
    { key: "all", label: L("Mọi thời điểm", "All time") },
  ];
  const levelName = (r: LeaderboardRow) => tr(locale, r.level.vi, r.level.en);
  const displayName = (r: LeaderboardRow) => r.name ?? L("Thành viên ẩn danh", "Anonymous member");
  const profileHref = (r: LeaderboardRow) =>
    r.memberId === member?.id ? "/me" : r.name && r.isPublic ? `/members/${r.memberId}` : null;
  const podium = board.rows.slice(0, 3);
  const rest = board.rows.slice(3);

  const ways = [
    {
      icon: UserRoundIcon,
      pts: POINTS.profile,
      text: L("Hoàn thành hồ sơ (một lần)", "Complete your profile (once)"),
    },
    {
      icon: StarIcon,
      pts: POINTS.rating,
      text: L("Chấm điểm E/S/G một công ty", "Rate a company's E/S/G"),
    },
    {
      icon: ThumbsUpIcon,
      pts: POINTS.vote,
      text: L(
        `Bình chọn độ tin cậy của một nguồn (tối đa ${VOTE_POINTS_DAILY_CAP} lần/ngày)`,
        `Vote on a source's reliability (up to ${VOTE_POINTS_DAILY_CAP} a day)`,
      ),
    },
    {
      icon: CheckCircle2Icon,
      pts: POINTS.approvedArticle,
      text: L("Gửi bài báo được biên tập viên duyệt", "Suggest an article an editor approves"),
    },
  ];

  const Name = ({ r, className }: { r: LeaderboardRow; className?: string }) => {
    const href = profileHref(r);
    return href ? (
      <Link href={href} className={cn("hover:underline", className)}>
        {displayName(r)}
      </Link>
    ) : (
      <span className={className}>{displayName(r)}</span>
    );
  };

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="max-w-2xl space-y-3">
          <p className="eyebrow text-primary">{L("Cộng đồng Greenlens", "Greenlens community")}</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Green Community Leaderboard</h1>
          <p className="text-muted-foreground text-lg">
            {L(
              "Ghi nhận những thành viên tích cực tìm hiểu, kiểm chứng và đóng góp bằng chứng ESG. Điểm phản ánh chất lượng nghiên cứu, không phải số tiền bạn chi tiêu.",
              "Recognising members who research, check and contribute ESG evidence. Points reflect research quality, never what you spend.",
            )}
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section aria-labelledby="board-h" className="min-w-0 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="board-h" className="sr-only">
                {L("Bảng xếp hạng", "Leaderboard")}
              </h2>
              <nav
                aria-label={L("Khoảng thời gian", "Period")}
                className="bg-muted flex rounded-xl p-1"
              >
                {periods.map((p) => (
                  <Link
                    key={p.key}
                    href={p.key === "week" ? "/leaderboard" : `/leaderboard?period=${p.key}`}
                    aria-current={p.key === period ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium",
                      p.key === period
                        ? "bg-card shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </Link>
                ))}
              </nav>
              <p className="text-muted-foreground text-sm">
                {L(
                  `${board.participants} thành viên có điểm`,
                  `${board.participants} members scored`,
                )}
              </p>
            </div>

            {board.rows.length === 0 ? (
              <div className="text-muted-foreground rounded-2xl border border-dashed p-10 text-center">
                {L(
                  "Chưa ai có điểm trong khoảng thời gian này. Hãy là người đầu tiên!",
                  "Nobody has scored in this period yet. Be the first!",
                )}
              </div>
            ) : (
              <>
                <ol className="grid gap-3 sm:grid-cols-3">
                  {podium.map((r) => (
                    <li
                      key={r.memberId}
                      className={cn(
                        "bg-card relative flex flex-col items-center gap-2 rounded-2xl border p-5 text-center",
                        r.rank === 1 && "sm:-translate-y-2 sm:shadow-md",
                      )}
                    >
                      <span
                        className="absolute top-3 left-3 grid size-7 place-items-center rounded-full text-xs font-bold text-white"
                        style={{ background: MEDAL[r.rank - 1] ?? "var(--muted-foreground)" }}
                      >
                        {r.rank}
                      </span>
                      <MemberAvatar name={r.name} src={r.avatarUrl} size={64} />
                      <Name r={r} className="max-w-full truncate font-semibold" />
                      <span className="text-muted-foreground text-xs">
                        {L("Cấp", "Level")} {r.level.number} · {levelName(r)}
                      </span>
                      <span className="tabular font-serif text-3xl font-semibold">
                        {r.points}
                        <span className="text-muted-foreground ml-1 font-sans text-sm font-normal">
                          GP
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>

                {rest.length > 0 && (
                  <ol className="bg-card divide-y rounded-2xl border">
                    {rest.map((r) => (
                      <li
                        key={r.memberId}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3",
                          r.memberId === member?.id && "bg-primary/5",
                        )}
                      >
                        <span className="tabular text-muted-foreground w-7 text-right text-sm font-semibold">
                          {r.rank}
                        </span>
                        <MemberAvatar name={r.name} src={r.avatarUrl} size={36} />
                        <span className="min-w-0 flex-1">
                          <Name r={r} className="block truncate font-medium" />
                          <span className="text-muted-foreground block text-xs">
                            {L("Cấp", "Level")} {r.level.number} · {levelName(r)}
                            {r.verified > 0 &&
                              ` · ${L(`${r.verified} bài được duyệt`, `${r.verified} approved`)}`}
                          </span>
                        </span>
                        <span className="tabular font-semibold">{r.points} GP</span>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <section className="bg-card rounded-2xl border p-5">
              <h2 className="font-sans text-base font-semibold">
                {L("Thứ hạng của bạn", "Your ranking")}
              </h2>
              {board.mine ? (
                <div className="mt-4 flex items-center gap-3">
                  <MemberAvatar name={board.mine.name} src={board.mine.avatarUrl} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      #{board.mine.rank} · {board.mine.points} GP
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {L("Cấp", "Level")} {board.mine.level.number} · {levelName(board.mine)}
                    </p>
                  </div>
                  <Link href="/me" className="text-primary text-sm font-semibold hover:underline">
                    {L("Hồ sơ", "Profile")}
                  </Link>
                </div>
              ) : member ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {L(
                    "Bạn chưa có điểm trong khoảng này. Bắt đầu bằng việc hoàn thành hồ sơ.",
                    "No points in this period yet. Start by completing your profile.",
                  )}{" "}
                  <Link href="/me" className="text-primary font-semibold hover:underline">
                    {L("Mở hồ sơ", "Open profile")}
                  </Link>
                </p>
              ) : mode === "disabled" ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {L("Đăng nhập sắp được bật.", "Sign-in is coming soon.")}
                </p>
              ) : (
                <p className="text-muted-foreground mt-2 text-sm">
                  <Link
                    href="/login?next=/leaderboard"
                    className="text-primary font-semibold hover:underline"
                  >
                    {L("Đăng nhập", "Sign in")}
                  </Link>{" "}
                  {L("để tham gia bảng xếp hạng.", "to join the leaderboard.")}
                </p>
              )}
            </section>

            <section className="bg-card rounded-2xl border p-5">
              <h2 className="font-sans text-base font-semibold">
                {L("Cách nhận Green Points", "How to earn Green Points")}
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {ways.map((w) => (
                  <li key={w.text} className="flex items-start gap-3">
                    <w.icon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{w.text}</span>
                    <span className="tabular font-semibold">+{w.pts}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-4 text-xs">
                {L(
                  "Hoà điểm: ai có nhiều đóng góp được duyệt hơn đứng trên; nếu vẫn bằng thì đồng hạng.",
                  "Ties go to more approved contributions; if still level, members share the rank.",
                )}
              </p>
            </section>

            <section className="bg-card rounded-2xl border p-5">
              <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
                <AwardIcon className="text-primary size-4" aria-hidden="true" />
                {L("Cấp độ", "Levels")}
              </h2>
              <ol className="mt-4 space-y-2 text-sm">
                {LEVELS.map((lv, i) => (
                  <li key={lv.en} className="flex items-baseline justify-between gap-3">
                    <span>
                      <span className="text-muted-foreground mr-1.5">{i + 1}.</span>
                      {tr(locale, lv.vi, lv.en)}
                    </span>
                    <span className="tabular text-muted-foreground text-xs">
                      {LEVELS[i + 1] ? `${lv.min}–${LEVELS[i + 1].min - 1}` : `${lv.min}+`} GP
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
