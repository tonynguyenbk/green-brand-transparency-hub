import { computeEsg } from "@/lib/esg/scoring";

/** A company's community score is hidden until this many members have rated it. */
export const MIN_RATINGS = 10;
/** A source is sent back to editors when, with at least this many votes… */
export const MIN_VOTES_FOR_FLAG = 10;
/** …fewer than this share of voters find it reliable. */
export const FLAG_BELOW_SHARE = 0.4;
/** Pending article submissions one member may have open at a time. */
export const MAX_PENDING_SUBMISSIONS = 5;

export interface RatingInput {
  stars: number;
  environmental: number;
  social: number;
  governance: number;
}

export interface CommunitySummary {
  count: number;
  /** False until MIN_RATINGS is reached; averages are then null. */
  shown: boolean;
  needed: number;
  stars: number | null;
  e: number | null;
  s: number | null;
  g: number | null;
  /** Same 40/35/25 formula as the Greenlens score, applied to the pillar means. */
  overall: number | null;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function summarizeRatings(rows: RatingInput[]): CommunitySummary {
  const count = rows.length;
  if (count < MIN_RATINGS) {
    return {
      count,
      shown: false,
      needed: MIN_RATINGS - count,
      stars: null,
      e: null,
      s: null,
      g: null,
      overall: null,
    };
  }
  const e = mean(rows.map((r) => r.environmental));
  const s = mean(rows.map((r) => r.social));
  const g = mean(rows.map((r) => r.governance));
  return {
    count,
    shown: true,
    needed: 0,
    stars: mean(rows.map((r) => r.stars)),
    e,
    s,
    g,
    overall: computeEsg(e, s, g),
  };
}

export interface Reliability {
  reliable: number;
  total: number;
  /** Share of voters who find the source reliable, 0–1; null without votes. */
  share: number | null;
  flagged: boolean;
}

export function reliabilityOf(votes: { reliable: boolean }[]): Reliability {
  const total = votes.length;
  const reliable = votes.filter((v) => v.reliable).length;
  const share = total ? reliable / total : null;
  return {
    reliable,
    total,
    share,
    flagged: total >= MIN_VOTES_FOR_FLAG && share !== null && share < FLAG_BELOW_SHARE,
  };
}
