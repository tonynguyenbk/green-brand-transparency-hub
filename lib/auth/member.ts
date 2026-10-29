import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { avatarFor } from "@/lib/community/profiles";
import { prisma } from "@/lib/db/prisma";
import { isSupabaseConfigured } from "./config";
import { createSupabaseServerClient } from "./supabase-server";

/**
 * Member (public user) sign-in.
 *
 * - "supabase": Google sign-in through Supabase Auth.
 * - "dev": name-only sign-in for local development and tests. Never enabled
 *   when NODE_ENV is "production" — preview and production deployments share
 *   one database, so fake identities must not reach them.
 * - "disabled": community features are read-only.
 */
export type MemberAuthMode = "supabase" | "dev" | "disabled";

export const DEV_MEMBER_COOKIE = "gl_dev_member";
const DEV_MEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getMemberAuthMode(): MemberAuthMode {
  if (isSupabaseConfigured()) return "supabase";
  if (process.env.NODE_ENV !== "production" && (process.env.DEV_AUTH_SECRET ?? "").length >= 32)
    return "dev";
  return "disabled";
}

export interface MemberSession {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

function sign(payload: string): string {
  return createHmac("sha256", process.env.DEV_AUTH_SECRET ?? "")
    .update(`member:${payload}`)
    .digest("base64url");
}

/** "<subject>.<expires>.<hmac>" — subject is a slug, so it never contains dots. */
export function createDevMemberToken(subject: string, now = Date.now()): string {
  const expires = Math.floor(now / 1000) + DEV_MEMBER_MAX_AGE_SECONDS;
  return `${subject}.${expires}.${sign(`${subject}.${expires}`)}`;
}

export function verifyDevMemberToken(token: string | undefined, now = Date.now()): string | null {
  if (!token) return null;
  const [subject, expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!subject || !signature || !Number.isInteger(expires) || expires * 1000 < now) return null;
  const expected = Buffer.from(sign(`${subject}.${expires}`));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given) ? subject : null;
}

export const devMemberCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DEV_MEMBER_MAX_AGE_SECONDS,
};

/** Create or refresh the Member row for a Supabase user. */
export async function upsertSupabaseMember(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata ?? {};
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const displayName =
    str(meta.full_name) ?? str(meta.name) ?? user.email?.split("@")[0] ?? "Thành viên";
  const avatarUrl = str(meta.avatar_url) ?? str(meta.picture);
  return prisma.member.upsert({
    where: { provider_subject: { provider: "supabase", subject: user.id } },
    create: {
      provider: "supabase",
      subject: user.id,
      email: user.email ?? null,
      displayName: displayName.slice(0, 80),
      avatarUrl,
    },
    // The display name is editable on the profile page, so only the first sign-in sets it.
    update: { email: user.email ?? null, avatarUrl },
    include: { photo: { select: { updatedAt: true } } },
  });
}

/** The signed-in member, or null. Safe to call from any server component. */
export async function getMember(): Promise<MemberSession | null> {
  const mode = getMemberAuthMode();
  if (mode === "supabase") {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const row =
      (await prisma.member.findUnique({
        where: { provider_subject: { provider: "supabase", subject: data.user.id } },
        include: { photo: { select: { updatedAt: true } } },
      })) ?? (await upsertSupabaseMember(data.user));
    return { id: row.id, displayName: row.displayName, avatarUrl: avatarFor(row) };
  }
  if (mode === "dev") {
    const subject = verifyDevMemberToken((await cookies()).get(DEV_MEMBER_COOKIE)?.value);
    if (!subject) return null;
    const row = await prisma.member.findUnique({
      where: { provider_subject: { provider: "dev", subject } },
      include: { photo: { select: { updatedAt: true } } },
    });
    return row ? { id: row.id, displayName: row.displayName, avatarUrl: avatarFor(row) } : null;
  }
  return null;
}

/** Only same-site relative paths are allowed as post-login destinations. */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return "/";
  if (next.includes("\\") || /[\r\n]/.test(next)) return "/";
  return next.slice(0, 500);
}
