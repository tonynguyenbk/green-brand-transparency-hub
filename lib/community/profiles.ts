import "server-only";
import type { EsgPillar } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ProfileInput } from "@/lib/validation/schemas";
import {
  BADGES,
  levelFor,
  periodStart,
  pointsFor,
  rankMembers,
  type Period,
  type PointEvent,
} from "./points";

/** Uploaded photo first, then the identity provider's picture. */
export function avatarFor(m: {
  id: string;
  avatarUrl: string | null;
  photo?: { updatedAt: Date } | null;
}): string | null {
  if (m.photo) return `/api/members/${m.id}/photo?v=${m.photo.updatedAt.getTime()}`;
  return m.avatarUrl;
}

/** Every point-earning event, optionally for one member. */
async function loadEvents(memberId?: string): Promise<PointEvent[]> {
  const byMember = memberId ? { memberId } : {};
  const [profiles, ratings, votes, approved] = await Promise.all([
    prisma.member.findMany({
      where: { profileCompletedAt: { not: null }, ...(memberId ? { id: memberId } : {}) },
      select: { id: true, profileCompletedAt: true },
    }),
    prisma.communityRating.findMany({
      where: { hidden: false, ...byMember },
      select: { memberId: true, createdAt: true },
    }),
    prisma.sourceVote.findMany({ where: byMember, select: { memberId: true, createdAt: true } }),
    prisma.articleSubmission.findMany({
      where: { status: "APPROVED", reviewedAt: { not: null }, ...byMember },
      select: { memberId: true, reviewedAt: true },
    }),
  ]);
  return [
    ...profiles.map((m) => ({
      memberId: m.id,
      action: "profile" as const,
      at: m.profileCompletedAt!,
    })),
    ...ratings.map((r) => ({ memberId: r.memberId, action: "rating" as const, at: r.createdAt })),
    ...votes.map((v) => ({ memberId: v.memberId, action: "vote" as const, at: v.createdAt })),
    ...approved.map((s) => ({
      memberId: s.memberId,
      action: "approvedArticle" as const,
      at: s.reviewedAt!,
    })),
  ];
}

export interface LeaderboardRow {
  rank: number;
  memberId: string;
  /** Null when the member keeps their profile private. */
  name: string | null;
  avatarUrl: string | null;
  points: number;
  verified: number;
  totalPoints: number;
  level: ReturnType<typeof levelFor>;
  isPublic: boolean;
}

export async function getLeaderboard(period: Period, viewerId: string | null, limit = 50) {
  const events = await loadEvents();
  const standings = rankMembers(events, periodStart(period));
  const top = standings.slice(0, limit);
  const mine = viewerId ? standings.find((s) => s.memberId === viewerId) : undefined;
  const ids = [...new Set([...top.map((s) => s.memberId), ...(mine ? [mine.memberId] : [])])];
  const members = await prisma.member.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      isPublic: true,
      photo: { select: { updatedAt: true } },
    },
  });
  const byId = new Map(members.map((m) => [m.id, m]));

  const toRow = (s: (typeof standings)[number]): LeaderboardRow => {
    const m = byId.get(s.memberId);
    const visible = Boolean(m?.isPublic) || s.memberId === viewerId;
    const totalPoints = pointsFor(events, s.memberId);
    return {
      rank: s.rank,
      memberId: s.memberId,
      name: visible && m ? m.displayName : null,
      avatarUrl: visible && m ? avatarFor(m) : null,
      points: s.points,
      verified: s.verified,
      totalPoints,
      level: levelFor(totalPoints),
      isPublic: Boolean(m?.isPublic),
    };
  };

  return {
    rows: top.map(toRow),
    mine: mine ? toRow(mine) : null,
    participants: standings.length,
  };
}

/** Profile data for the owner (`/me`) or a visitor (`/members/[id]`). */
export async function getProfile(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: { photo: { select: { updatedAt: true } } },
  });
  if (!member) return null;

  const [events, ratings, votes, submissions] = await Promise.all([
    loadEvents(),
    prisma.communityRating.findMany({
      where: { memberId, hidden: false },
      orderBy: { updatedAt: "desc" },
      select: {
        stars: true,
        updatedAt: true,
        brand: { select: { name: true, slug: true, logoDomain: true } },
      },
    }),
    prisma.sourceVote.count({ where: { memberId } }),
    prisma.articleSubmission.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        url: true,
        status: true,
        createdAt: true,
        brand: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const total = pointsFor(events, memberId);
  const rankIn = (period: Period) =>
    rankMembers(events, periodStart(period)).find((s) => s.memberId === memberId)?.rank ?? null;
  const approved = submissions.filter((s) => s.status === "APPROVED").length;
  const stats = {
    profileComplete: member.profileCompletedAt !== null,
    ratings: ratings.length,
    votes,
    approved,
  };

  return {
    id: member.id,
    displayName: member.displayName,
    avatarUrl: avatarFor(member),
    hasUploadedPhoto: member.photo !== null,
    bio: member.bio,
    interests: member.interests,
    isPublic: member.isPublic,
    showActivity: member.showActivity,
    joinedAt: member.createdAt,
    points: {
      total,
      week: pointsFor(events, memberId, periodStart("week")),
      month: pointsFor(events, memberId, periodStart("month")),
    },
    level: levelFor(total),
    rank: { week: rankIn("week"), month: rankIn("month"), all: rankIn("all") },
    stats,
    badges: BADGES.map((b) => ({
      key: b.key,
      vi: b.vi,
      en: b.en,
      hintVi: b.hintVi,
      hintEn: b.hintEn,
      earned: b.earned(stats),
    })),
    ratings,
    submissions,
  };
}

export type Profile = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

export async function updateProfile(memberId: string, input: ProfileInput) {
  const current = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
    select: { profileCompletedAt: true },
  });
  const complete = Boolean(input.bio) && input.interests.length > 0;
  return prisma.member.update({
    where: { id: memberId },
    data: {
      displayName: input.displayName,
      bio: input.bio,
      interests: input.interests as EsgPillar[],
      isPublic: input.isPublic,
      showActivity: input.showActivity,
      // Points for completing the profile are awarded once and never taken back.
      ...(complete && !current.profileCompletedAt ? { profileCompletedAt: new Date() } : {}),
    },
  });
}

export const PHOTO_MAX_BYTES = 400 * 1024;

/** Detect the image type from its first bytes; the browser-sent type is not trusted. */
export function sniffImageType(
  bytes: Uint8Array,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function savePhoto(memberId: string, bytes: Uint8Array, mime: string) {
  const data = Buffer.from(bytes);
  await prisma.memberPhoto.upsert({
    where: { memberId },
    create: { memberId, mime, data },
    update: { mime, data },
  });
}

export async function deletePhoto(memberId: string) {
  await prisma.memberPhoto.deleteMany({ where: { memberId } });
}

export async function getPhoto(memberId: string) {
  return prisma.memberPhoto.findUnique({
    where: { memberId },
    select: { mime: true, data: true, member: { select: { isPublic: true } } },
  });
}
