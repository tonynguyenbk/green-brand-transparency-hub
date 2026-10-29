import { describe, expect, it } from "vitest";
import {
  VOTE_POINTS_DAILY_CAP,
  levelFor,
  periodStart,
  pointsFor,
  rankMembers,
  type PointEvent,
} from "@/lib/community/points";

const at = (iso: string) => new Date(iso);
const ev = (memberId: string, action: PointEvent["action"], iso: string): PointEvent => ({
  memberId,
  action,
  at: at(iso),
});

describe("periodStart", () => {
  it("starts weeks on Monday, Vietnam time", () => {
    // Wednesday 29 Oct 2026, 10:00 UTC → Monday 26 Oct 00:00 UTC+7
    expect(periodStart("week", at("2026-10-29T10:00:00Z"))?.toISOString()).toBe(
      "2026-10-25T17:00:00.000Z",
    );
  });

  it("uses Vietnam's date near midnight UTC", () => {
    // Sunday 1 Nov 2026, 18:00 UTC is already Monday 2 Nov in Vietnam
    expect(periodStart("week", at("2026-11-01T18:00:00Z"))?.toISOString()).toBe(
      "2026-11-01T17:00:00.000Z",
    );
  });

  it("starts months on the 1st and has no start for all-time", () => {
    expect(periodStart("month", at("2026-10-29T10:00:00Z"))?.toISOString()).toBe(
      "2026-09-30T17:00:00.000Z",
    );
    expect(periodStart("all")).toBeNull();
  });
});

describe("rankMembers", () => {
  it("sorts by points, breaks ties on verified contributions, then shares ranks", () => {
    const events = [
      ev("a", "approvedArticle", "2026-10-27T01:00:00Z"), // 20, 1 verified
      ev("b", "rating", "2026-10-27T01:00:00Z"),
      ev("b", "rating", "2026-10-27T02:00:00Z"),
      ev("b", "rating", "2026-10-27T03:00:00Z"),
      ev("b", "rating", "2026-10-27T04:00:00Z"), // 20, 0 verified
      ev("c", "profile", "2026-10-27T01:00:00Z"), // 20, 0 verified
      ev("d", "vote", "2026-10-27T01:00:00Z"), // 2
    ];
    expect(rankMembers(events, null).map((s) => [s.memberId, s.points, s.rank])).toEqual([
      ["a", 20, 1],
      ["b", 20, 2],
      ["c", 20, 2],
      ["d", 2, 4],
    ]);
  });

  it("only counts events inside the period", () => {
    const events = [
      ev("a", "approvedArticle", "2026-09-01T00:00:00Z"),
      ev("a", "vote", "2026-10-27T00:00:00Z"),
    ];
    expect(rankMembers(events, at("2026-10-26T00:00:00Z"))).toEqual([
      { memberId: "a", points: 2, verified: 0, rank: 1 },
    ]);
  });
});

describe("vote cap", () => {
  it("stops awarding vote points after the daily cap", () => {
    const events = Array.from({ length: VOTE_POINTS_DAILY_CAP + 5 }, (_, i) =>
      ev("a", "vote", `2026-10-27T0${Math.floor(i / 10)}:${String(i % 10).padStart(2, "0")}:00Z`),
    );
    events.push(ev("a", "vote", "2026-10-28T03:00:00Z"));
    expect(pointsFor(events, "a")).toBe((VOTE_POINTS_DAILY_CAP + 1) * 2);
  });
});

describe("levelFor", () => {
  it("maps totals to levels and progress", () => {
    expect(levelFor(0)).toMatchObject({ number: 1, progress: 0 });
    expect(levelFor(150)).toMatchObject({ number: 2, progress: 0.25 });
    expect(levelFor(600)).toMatchObject({ number: 4, next: null, progress: 1 });
  });
});
