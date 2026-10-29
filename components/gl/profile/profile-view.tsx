import { AwardIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import { CompanyLogo } from "@/components/gl/company-logo";
import { MemberAvatar } from "@/components/gl/member-avatar";
import { PILLAR_VAR } from "@/components/gl/score-parts";
import type { Profile } from "@/lib/community/profiles";
import { formatDateL, tr, type Locale } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";

/** Points, level, badges and activity; shared by /me and public profiles. */
export function ProfileView({
  profile: p,
  locale,
  isOwner,
  photoSlot,
  children,
}: {
  profile: Profile;
  locale: Locale;
  isOwner: boolean;
  /** Replaces the plain avatar (the owner gets upload controls). */
  photoSlot?: React.ReactNode;
  /** Extra sections in the main column (the owner's settings form). */
  children?: React.ReactNode;
}) {
  const L = (vi: string, en: string) => tr(locale, vi, en);
  const pillarName = (k: "E" | "S" | "G") =>
    k === "E"
      ? L("Môi trường", "Environmental")
      : k === "S"
        ? L("Xã hội", "Social")
        : L("Quản trị", "Governance");
  const showActivity = isOwner || p.showActivity;
  const statusText = (s: string) =>
    s === "APPROVED"
      ? L("Đã duyệt", "Approved")
      : s === "REJECTED"
        ? L("Không duyệt", "Not approved")
        : L("Chờ duyệt", "Pending");

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="bg-card flex flex-col gap-6 rounded-3xl border p-6 sm:flex-row sm:items-center sm:p-8">
        {photoSlot ?? <MemberAvatar name={p.displayName} src={p.avatarUrl} size={96} />}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-3xl font-semibold sm:text-4xl">{p.displayName}</h1>
            {isOwner && !p.isPublic && (
              <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                <LockIcon className="size-3" aria-hidden="true" />
                {L("Riêng tư", "Private")}
              </span>
            )}
          </div>
          {p.bio && <p className="text-muted-foreground max-w-xl">{p.bio}</p>}
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            <span>
              {L("Tham gia", "Joined")} {formatDateL(locale, p.joinedAt)}
            </span>
            {p.interests.map((k) => {
              const v = PILLAR_VAR[k.toLowerCase() as "e" | "s" | "g"];
              return (
                <span
                  key={k}
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ color: v, background: `color-mix(in oklab, ${v} 12%, transparent)` }}
                >
                  {pillarName(k)}
                </span>
              );
            })}
          </div>
        </div>
        <div className="sm:w-64">
          <p className="text-sm font-semibold">
            {L("Cấp", "Level")} {p.level.number} · {tr(locale, p.level.vi, p.level.en)}
          </p>
          <div
            className="bg-muted mt-2 h-2 overflow-hidden rounded-full"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(p.level.progress * 100)}
            aria-label={L("Tiến độ lên cấp", "Progress to next level")}
          >
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${p.level.progress * 100}%` }}
            />
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs">
            {p.level.next
              ? L(
                  `Còn ${p.level.next.min - p.points.total} GP để lên "${p.level.next.vi}"`,
                  `${p.level.next.min - p.points.total} GP to "${p.level.next.en}"`,
                )
              : L("Cấp cao nhất", "Top level")}
          </p>
        </div>
      </section>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [String(p.points.total), L("Tổng GP", "Total GP")],
          [String(p.points.week), L("GP tuần này", "GP this week")],
          [p.rank.week ? `#${p.rank.week}` : "–", L("Hạng tuần", "Weekly rank")],
          [p.rank.all ? `#${p.rank.all}` : "–", L("Hạng mọi thời điểm", "All-time rank")],
        ].map(([v, k]) => (
          <div key={k} className="bg-card rounded-2xl border p-4">
            <dt className="text-muted-foreground text-xs">{k}</dt>
            <dd className="tabular mt-1 font-serif text-3xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-8">
          {children}
          {showActivity ? (
            <>
              <section aria-labelledby="rated-h" className="space-y-3">
                <h2 id="rated-h" className="text-xl font-semibold">
                  {L("Công ty đã chấm điểm", "Companies rated")}{" "}
                  <span className="tabular text-muted-foreground">({p.ratings.length})</span>
                </h2>
                {p.ratings.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {L("Chưa chấm công ty nào.", "No companies rated yet.")}{" "}
                    {isOwner && (
                      <Link
                        href="/#rankings"
                        className="text-primary font-semibold hover:underline"
                      >
                        {L("Chọn một công ty", "Pick a company")}
                      </Link>
                    )}
                  </p>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {p.ratings.map((r) => (
                      <li key={r.brand.slug}>
                        <Link
                          href={`/companies/${r.brand.slug}`}
                          className="bg-card hover:bg-muted flex items-center gap-3 rounded-xl border p-3"
                        >
                          <CompanyLogo name={r.brand.name} domain={r.brand.logoDomain} size={28} />
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {r.brand.name}
                          </span>
                          <span className="text-sm" aria-label={`${r.stars}/5`}>
                            {"★".repeat(r.stars)}
                            <span className="text-muted-foreground/40">
                              {"★".repeat(5 - r.stars)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="sub-h" className="space-y-3">
                <h2 id="sub-h" className="text-xl font-semibold">
                  {L("Bài báo đã gửi", "Articles suggested")}{" "}
                  <span className="tabular text-muted-foreground">
                    ({isOwner ? p.submissions.length : p.stats.approved})
                  </span>
                </h2>
                {(() => {
                  // Visitors only see approved articles; pending and rejected ones stay private.
                  const list = isOwner
                    ? p.submissions
                    : p.submissions.filter((s) => s.status === "APPROVED");
                  if (list.length === 0)
                    return (
                      <p className="text-muted-foreground text-sm">
                        {L("Chưa có bài nào.", "None yet.")}
                      </p>
                    );
                  return (
                    <ul className="bg-card divide-y rounded-xl border">
                      {list.map((s) => (
                        <li
                          key={s.id}
                          className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3 text-sm"
                        >
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 basis-60 font-medium hover:underline"
                          >
                            {s.title}
                          </a>
                          <Link
                            href={`/companies/${s.brand.slug}`}
                            className="text-muted-foreground hover:underline"
                          >
                            {s.brand.name}
                          </Link>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              s.status === "APPROVED"
                                ? "bg-primary/10 text-primary"
                                : s.status === "REJECTED"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-notice-bg text-notice",
                            )}
                          >
                            {statusText(s.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </section>
            </>
          ) : (
            <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-sm">
              {L(
                "Thành viên này ẩn lịch sử hoạt động.",
                "This member keeps their activity private.",
              )}
            </p>
          )}
        </div>

        <aside className="space-y-5">
          <section className="bg-card rounded-2xl border p-5">
            <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
              <AwardIcon className="text-primary size-4" aria-hidden="true" />
              {L("Huy hiệu", "Badges")}{" "}
              <span className="tabular text-muted-foreground font-normal">
                {p.badges.filter((b) => b.earned).length}/{p.badges.length}
              </span>
            </h2>
            <ul className="mt-4 space-y-3">
              {p.badges
                .filter((b) => isOwner || b.earned)
                .map((b) => (
                  <li
                    key={b.key}
                    className={cn("flex items-start gap-3", !b.earned && "opacity-55")}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        b.earned
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border border-dashed",
                      )}
                      aria-hidden="true"
                    >
                      <AwardIcon className="size-4" />
                    </span>
                    <span className="text-sm">
                      <span className="block font-semibold">{tr(locale, b.vi, b.en)}</span>
                      <span className="text-muted-foreground block text-xs">
                        {b.earned ? L("Đã đạt", "Earned") : tr(locale, b.hintVi, b.hintEn)}
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          </section>
          <Link
            href="/leaderboard"
            className="text-primary block rounded-2xl border border-dashed p-5 text-sm font-semibold hover:underline"
          >
            {L("Xem Leaderboard →", "See the leaderboard →")}
          </Link>
        </aside>
      </div>
    </main>
  );
}
