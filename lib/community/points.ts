/**
 * Green Points (GP): derived from community activity already stored in the
 * database, so there is no separate ledger to keep in sync. Points reward
 * research and verified contributions, never purchases. Passive actions earn
 * little and are capped; editor-approved contributions earn the most.
 */

export const POINTS = {
  /** Bio and at least one ESG interest; counted once. */
  profile: 20,
  /** First rating of each company (hidden ratings earn nothing). */
  rating: 5,
  /** Reliability vote, once per source. */
  vote: 2,
  /** Article accepted by an editor as a source. */
  approvedArticle: 20,
} as const;

/** Votes beyond this many in one day (Vietnam time) earn no points. */
export const VOTE_POINTS_DAILY_CAP = 10;

export type PointAction = keyof typeof POINTS;

export interface PointEvent {
  memberId: string;
  action: PointAction;
  at: Date;
}

export type Period = "week" | "month" | "all";

export const LEVELS = [
  { min: 0, vi: "Người mới xanh", en: "Green Beginner" },
  { min: 100, vi: "Nhà thám hiểm sinh thái", en: "Eco Explorer" },
  { min: 300, vi: "Thám tử ESG", en: "ESG Detective" },
  { min: 600, vi: "Nhà vô địch minh bạch", en: "Transparency Champion" },
] as const;

export function levelFor(total: number) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) if (total >= LEVELS[i].min) index = i;
  const next = LEVELS[index + 1];
  return {
    index,
    number: index + 1,
    ...LEVELS[index],
    next: next ?? null,
    /** 0–1 progress towards the next level (1 at the top level). */
    progress: next ? (total - LEVELS[index].min) / (next.min - LEVELS[index].min) : 1,
  };
}

/** Leaderboard periods run on Vietnam time (UTC+7), weeks starting Monday. */
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function periodStart(period: Period, now = new Date()): Date | null {
  if (period === "all") return null;
  const local = new Date(now.getTime() + TZ_OFFSET_MS);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  if (period === "month") return new Date(Date.UTC(y, m, 1) - TZ_OFFSET_MS);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(y, m, local.getUTCDate() - daysSinceMonday) - TZ_OFFSET_MS);
}

const localDay = (d: Date) => Math.floor((d.getTime() + TZ_OFFSET_MS) / DAY_MS);

/** Drop vote events past the daily cap, keeping the earliest ones each day. */
export function applyVoteCap(events: PointEvent[]): PointEvent[] {
  const perDay = new Map<string, number>();
  return [...events]
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .filter((e) => {
      if (e.action !== "vote") return true;
      const key = `${e.memberId}:${localDay(e.at)}`;
      const n = (perDay.get(key) ?? 0) + 1;
      perDay.set(key, n);
      return n <= VOTE_POINTS_DAILY_CAP;
    });
}

export interface Standing {
  memberId: string;
  points: number;
  /** Editor-approved contributions in the period; the first tie-breaker. */
  verified: number;
  rank: number;
}

/**
 * Rank members by points in the period. Ties go to more verified
 * contributions; members still level share a rank.
 */
export function rankMembers(events: PointEvent[], since: Date | null): Standing[] {
  const totals = new Map<string, { points: number; verified: number }>();
  for (const e of applyVoteCap(events)) {
    if (since && e.at < since) continue;
    const t = totals.get(e.memberId) ?? { points: 0, verified: 0 };
    t.points += POINTS[e.action];
    if (e.action === "approvedArticle") t.verified += 1;
    totals.set(e.memberId, t);
  }
  const sorted = [...totals.entries()]
    .map(([memberId, t]) => ({ memberId, ...t }))
    .filter((s) => s.points > 0)
    .sort((a, b) => b.points - a.points || b.verified - a.verified);

  const out: Standing[] = [];
  sorted.forEach((s, i) => {
    const prev = out[i - 1];
    const tied = prev && prev.points === s.points && prev.verified === s.verified;
    out.push({ ...s, rank: tied ? prev.rank : i + 1 });
  });
  return out;
}

export function pointsFor(events: PointEvent[], memberId: string, since: Date | null = null) {
  return applyVoteCap(events.filter((e) => e.memberId === memberId))
    .filter((e) => !since || e.at >= since)
    .reduce((sum, e) => sum + POINTS[e.action], 0);
}

export interface BadgeStats {
  profileComplete: boolean;
  ratings: number;
  votes: number;
  approved: number;
}

export const BADGES = [
  {
    key: "profile",
    vi: "Hồ sơ hoàn chỉnh",
    en: "Profile complete",
    hintVi: "Thêm giới thiệu và chủ đề quan tâm",
    hintEn: "Add a bio and your interests",
    earned: (s: BadgeStats) => s.profileComplete,
  },
  {
    key: "rater",
    vi: "Người chấm điểm",
    en: "Rater",
    hintVi: "Chấm điểm 5 công ty",
    hintEn: "Rate 5 companies",
    earned: (s: BadgeStats) => s.ratings >= 5,
  },
  {
    key: "fact-checker",
    vi: "Người kiểm chứng",
    en: "Fact-checker",
    hintVi: "Bình chọn độ tin cậy cho 20 nguồn",
    hintEn: "Vote on 20 sources",
    earned: (s: BadgeStats) => s.votes >= 20,
  },
  {
    key: "contributor",
    vi: "Người đóng góp",
    en: "Contributor",
    hintVi: "Có 1 bài báo được duyệt",
    hintEn: "Get 1 article approved",
    earned: (s: BadgeStats) => s.approved >= 1,
  },
  {
    key: "reporter",
    vi: "Phóng viên cộng đồng",
    en: "Community reporter",
    hintVi: "Có 5 bài báo được duyệt",
    hintEn: "Get 5 articles approved",
    earned: (s: BadgeStats) => s.approved >= 5,
  },
] as const;
