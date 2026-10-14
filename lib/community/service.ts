import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { ArticleSubmissionInput, CommunityRatingInput } from "@/lib/validation/schemas";
import {
  MAX_PENDING_SUBMISSIONS,
  reliabilityOf,
  summarizeRatings,
  type CommunitySummary,
  type Reliability,
} from "./aggregate";

export class CommunityError extends Error {
  constructor(readonly code: "not_found" | "too_many_pending" | "duplicate" | "already_reviewed") {
    super(code);
  }
}

async function brandIdFor(slug: string): Promise<string> {
  const brand = await prisma.brand.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!brand) throw new CommunityError("not_found");
  return brand.id;
}

export interface MyRating {
  stars: number;
  e: number;
  s: number;
  g: number;
  comment: string | null;
  updatedAt: string;
}

export interface CommunityView {
  summary: CommunitySummary;
  mine: MyRating | null;
  /** Keyed by EsgSource id. */
  reliability: Record<string, Reliability & { myVote: boolean | null }>;
  mySubmissions: { id: string; title: string; pillar: string; status: string }[];
}

/** Everything the company page shows about the community, for one viewer. */
export async function getCommunityView(
  brandId: string,
  sourceIds: string[],
  memberId: string | null,
): Promise<CommunityView> {
  const [ratings, votes, submissions] = await Promise.all([
    prisma.communityRating.findMany({
      where: { brandId, hidden: false },
      select: {
        stars: true,
        environmental: true,
        social: true,
        governance: true,
        memberId: true,
        comment: true,
        updatedAt: true,
      },
    }),
    prisma.sourceVote.findMany({
      where: { sourceId: { in: sourceIds } },
      select: { sourceId: true, reliable: true, memberId: true },
    }),
    memberId
      ? prisma.articleSubmission.findMany({
          where: { brandId, memberId },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, title: true, pillar: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  const mineRow = memberId
    ? await prisma.communityRating.findUnique({
        where: { brandId_memberId: { brandId, memberId } },
      })
    : null;

  const reliability: CommunityView["reliability"] = {};
  for (const id of sourceIds) {
    const forSource = votes.filter((v) => v.sourceId === id);
    const my = memberId ? forSource.find((v) => v.memberId === memberId) : undefined;
    reliability[id] = { ...reliabilityOf(forSource), myVote: my ? my.reliable : null };
  }

  return {
    summary: summarizeRatings(ratings),
    mine: mineRow
      ? {
          stars: mineRow.stars,
          e: mineRow.environmental,
          s: mineRow.social,
          g: mineRow.governance,
          comment: mineRow.comment,
          updatedAt: mineRow.updatedAt.toISOString(),
        }
      : null,
    reliability,
    mySubmissions: submissions,
  };
}

export async function saveRating(memberId: string, input: CommunityRatingInput) {
  const brandId = await brandIdFor(input.brandSlug);
  const data = {
    stars: input.stars,
    environmental: input.environmental,
    social: input.social,
    governance: input.governance,
    comment: input.comment,
  };
  return prisma.communityRating.upsert({
    where: { brandId_memberId: { brandId, memberId } },
    create: { ...data, brandId, memberId },
    update: data,
  });
}

/** Returns the brand slug, for revalidation. */
export async function castSourceVote(
  memberId: string,
  sourceId: string,
  vote: "up" | "down" | "clear",
): Promise<string> {
  const source = await prisma.esgSource.findUnique({
    where: { id: sourceId },
    select: { brand: { select: { slug: true, status: true } } },
  });
  if (!source || source.brand.status !== "PUBLISHED") throw new CommunityError("not_found");
  if (vote === "clear") {
    await prisma.sourceVote.deleteMany({ where: { sourceId, memberId } });
  } else {
    await prisma.sourceVote.upsert({
      where: { sourceId_memberId: { sourceId, memberId } },
      create: { sourceId, memberId, reliable: vote === "up" },
      update: { reliable: vote === "up" },
    });
  }
  return source.brand.slug;
}

export async function submitArticle(memberId: string, input: ArticleSubmissionInput) {
  const brandId = await brandIdFor(input.brandSlug);
  const pending = await prisma.articleSubmission.count({
    where: { memberId, status: "PENDING" },
  });
  if (pending >= MAX_PENDING_SUBMISSIONS) throw new CommunityError("too_many_pending");
  const known = await prisma.esgSource.findUnique({
    where: { brandId_url: { brandId, url: input.url } },
    select: { id: true },
  });
  if (known) throw new CommunityError("duplicate");
  try {
    return await prisma.articleSubmission.create({
      data: {
        brandId,
        memberId,
        url: input.url,
        title: input.title,
        pillar: input.pillar,
        sentiment: input.sentiment,
        summary: input.summary,
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") throw new CommunityError("duplicate");
    throw e;
  }
}

// --- Moderation -------------------------------------------------------------

export async function listPendingSubmissions() {
  return prisma.articleSubmission.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      brand: { select: { name: true, slug: true } },
      member: {
        select: {
          displayName: true,
          email: true,
          submissions: { select: { status: true } },
        },
      },
    },
  });
}

/** Approving adds the article to the company's sources; scores are not changed. */
export async function reviewSubmission(
  reviewer: string,
  submissionId: string,
  decision: "APPROVED" | "REJECTED",
  reviewNote: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const sub = await tx.articleSubmission.findUnique({ where: { id: submissionId } });
    if (!sub) throw new CommunityError("not_found");
    if (sub.status !== "PENDING") throw new CommunityError("already_reviewed");
    await tx.articleSubmission.update({
      where: { id: submissionId },
      data: { status: decision, reviewNote, reviewedBy: reviewer, reviewedAt: new Date() },
    });
    if (decision === "APPROVED") {
      const existing = await tx.esgSource.findUnique({
        where: { brandId_url: { brandId: sub.brandId, url: sub.url } },
      });
      if (!existing) {
        await tx.esgSource.create({
          data: {
            brandId: sub.brandId,
            title: sub.title,
            url: sub.url,
            pillar: sub.pillar,
            sentiment: sub.sentiment,
            submissionId: sub.id,
          },
        });
      }
    }
    return tx.brand.findUniqueOrThrow({ where: { id: sub.brandId }, select: { slug: true } });
  });
}

export async function listFlaggedSources() {
  const sources = await prisma.esgSource.findMany({
    where: { votes: { some: {} } },
    include: {
      brand: { select: { name: true, slug: true } },
      votes: { select: { reliable: true } },
    },
  });
  return sources
    .map((s) => ({ ...s, reliability: reliabilityOf(s.votes) }))
    .filter((s) => s.reliability.flagged)
    .sort((a, b) => (a.reliability.share ?? 0) - (b.reliability.share ?? 0));
}

export async function listRecentRatings(take = 50) {
  return prisma.communityRating.findMany({
    orderBy: { updatedAt: "desc" },
    take,
    include: {
      brand: { select: { name: true, slug: true } },
      member: { select: { displayName: true, email: true } },
    },
  });
}

export async function setRatingHidden(ratingId: string, hidden: boolean) {
  const r = await prisma.communityRating.update({
    where: { id: ratingId },
    data: { hidden },
    select: { brand: { select: { slug: true } } },
  });
  return r.brand.slug;
}

export async function communityQueueCounts() {
  const [pending, flagged] = await Promise.all([
    prisma.articleSubmission.count({ where: { status: "PENDING" } }),
    listFlaggedSources().then((s) => s.length),
  ]);
  return { pending, flagged };
}
