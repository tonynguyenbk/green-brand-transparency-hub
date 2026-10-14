/**
 * Integration: member rating → reliability votes → article submission →
 * moderation → approved source. Runs against DATABASE_URL (or
 * TEST_DATABASE_URL); every row is created under a unique fictional brand and
 * deleted afterwards.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import {
  CommunityError,
  castSourceVote,
  getCommunityView,
  reviewSubmission,
  saveRating,
  setRatingHidden,
  submitArticle,
} from "@/lib/community/service";

const tag = `ctest-${Date.now()}`;
let industryId = "";
let brandId = "";
let sourceId = "";
const memberIds: string[] = [];

beforeAll(async () => {
  industryId = (await prisma.industry.create({ data: { name: `Community ${tag}`, slug: tag } })).id;
  brandId = (
    await prisma.brand.create({
      data: {
        slug: tag,
        name: "Community Test Brand (fictional)",
        industryId,
        isFictional: true,
        status: "PUBLISHED",
      },
    })
  ).id;
  sourceId = (
    await prisma.esgSource.create({
      data: { brandId, title: "Existing article", url: `https://example.org/${tag}/a` },
    })
  ).id;
  for (let i = 0; i < 11; i++) {
    const m = await prisma.member.create({
      data: { provider: "test", subject: `${tag}-${i}`, displayName: `Tester ${i}` },
    });
    memberIds.push(m.id);
  }
});

afterAll(async () => {
  await prisma.member.deleteMany({ where: { id: { in: memberIds } } });
  await prisma.brand.deleteMany({ where: { id: brandId } });
  await prisma.industry.deleteMany({ where: { id: industryId } });
  await prisma.$disconnect();
});

const rate = (memberId: string, e: number, stars = 3) =>
  saveRating(memberId, {
    brandSlug: tag,
    stars,
    environmental: e,
    social: 5,
    governance: 4,
    comment: null,
    pledge: true,
  });

describe("community flow", () => {
  it("keeps one rating per member and hides the score below 10 ratings", async () => {
    await rate(memberIds[0], 9);
    await rate(memberIds[0], 6, 2); // edit replaces
    expect(await prisma.communityRating.count({ where: { brandId } })).toBe(1);

    const view = await getCommunityView(brandId, [sourceId], memberIds[0]);
    expect(view.summary).toMatchObject({ count: 1, shown: false, needed: 9 });
    expect(view.mine).toMatchObject({ stars: 2, e: 6 });
  });

  it("shows averages from 10 ratings and excludes hidden ones", async () => {
    for (let i = 1; i < 10; i++) await rate(memberIds[i], 6);
    let view = await getCommunityView(brandId, [sourceId], null);
    expect(view.summary.shown).toBe(true);
    expect(view.summary.e).toBeCloseTo(6, 10);
    expect(view.summary.overall).toBeCloseTo(6 * 0.4 + 5 * 0.35 + 4 * 0.25, 10);

    const r = await prisma.communityRating.findFirstOrThrow({
      where: { brandId, memberId: memberIds[3] },
    });
    await setRatingHidden(r.id, true);
    view = await getCommunityView(brandId, [sourceId], null);
    expect(view.summary).toMatchObject({ count: 9, shown: false });
    await setRatingHidden(r.id, false);
  });

  it("records, changes and withdraws reliability votes", async () => {
    await castSourceVote(memberIds[0], sourceId, "up");
    await castSourceVote(memberIds[1], sourceId, "down");
    await castSourceVote(memberIds[1], sourceId, "up");
    await castSourceVote(memberIds[2], sourceId, "down");
    await castSourceVote(memberIds[2], sourceId, "clear");
    const view = await getCommunityView(brandId, [sourceId], memberIds[1]);
    expect(view.reliability[sourceId]).toMatchObject({ reliable: 2, total: 2, myVote: true });
  });

  it("moderates submissions; approval adds a community source", async () => {
    const input = {
      brandSlug: tag,
      url: `https://example.org/${tag}/new`,
      title: "A new article — Example",
      pillar: "E" as const,
      sentiment: "NEGATIVE" as const,
      summary: "Shows something relevant about the brand.",
    };
    const sub = await submitArticle(memberIds[4], input);
    await expect(submitArticle(memberIds[4], input)).rejects.toBeInstanceOf(CommunityError);
    await expect(
      submitArticle(memberIds[5], { ...input, url: `https://example.org/${tag}/a` }),
    ).rejects.toMatchObject({ code: "duplicate" });

    await reviewSubmission("admin@test", sub.id, "APPROVED", null);
    await expect(reviewSubmission("admin@test", sub.id, "REJECTED", null)).rejects.toMatchObject({
      code: "already_reviewed",
    });
    const src = await prisma.esgSource.findUniqueOrThrow({ where: { submissionId: sub.id } });
    expect(src).toMatchObject({ pillar: "E", sentiment: "NEGATIVE", url: input.url });

    const view = await getCommunityView(brandId, [sourceId], memberIds[4]);
    expect(view.mySubmissions[0]).toMatchObject({ id: sub.id, status: "APPROVED" });
  });

  it("limits open submissions per member", async () => {
    for (let i = 0; i < 5; i++) {
      await submitArticle(memberIds[6], {
        brandSlug: tag,
        url: `https://example.org/${tag}/p${i}`,
        title: `Pending article ${i}`,
        pillar: "S",
        sentiment: "NEUTRAL",
        summary: "Waiting for an editor to read it.",
      });
    }
    await expect(
      submitArticle(memberIds[6], {
        brandSlug: tag,
        url: `https://example.org/${tag}/p9`,
        title: "One too many",
        pillar: "S",
        sentiment: "NEUTRAL",
        summary: "Should be refused by the limit.",
      }),
    ).rejects.toMatchObject({ code: "too_many_pending" });
  });
});
