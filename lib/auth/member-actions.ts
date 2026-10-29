"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/shared";
import { devMemberLoginSchema } from "@/lib/validation/schemas";
import {
  DEV_MEMBER_COOKIE,
  createDevMemberToken,
  devMemberCookieOptions,
  getMemberAuthMode,
  safeNextPath,
} from "./member";
import { createSupabaseServerClient } from "./supabase-server";

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export interface MemberLoginState {
  error?: string;
}

/** Start Google sign-in (Supabase OAuth with PKCE); returns to /auth/callback. */
export async function signInWithGoogle(formData: FormData) {
  const next = safeNextPath(formData.get("next"));
  if (getMemberAuthMode() !== "supabase") redirect(`/login?next=${encodeURIComponent(next)}`);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) redirect(`/login?error=oauth&next=${encodeURIComponent(next)}`);
  redirect(data.url);
}

/** Development only: sign in under a display name, no password. */
export async function devMemberSignIn(
  _prev: MemberLoginState,
  formData: FormData,
): Promise<MemberLoginState> {
  const locale = await getLocale();
  if (getMemberAuthMode() !== "dev")
    return { error: tr(locale, "Chế độ đăng nhập thử đang tắt.", "Test sign-in is disabled.") };
  const parsed = devMemberLoginSchema.safeParse({ displayName: formData.get("displayName") });
  if (!parsed.success)
    return { error: tr(locale, "Nhập tên từ 2 đến 60 ký tự.", "Enter a name of 2–60 characters.") };

  const subject =
    parsed.data.displayName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "member";
  await prisma.member.upsert({
    where: { provider_subject: { provider: "dev", subject } },
    create: { provider: "dev", subject, displayName: parsed.data.displayName },
    update: {},
  });
  (await cookies()).set(DEV_MEMBER_COOKIE, createDevMemberToken(subject), devMemberCookieOptions);
  redirect(safeNextPath(formData.get("next")));
}

export async function memberSignOut(formData: FormData) {
  if (getMemberAuthMode() === "supabase") {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  (await cookies()).delete(DEV_MEMBER_COOKIE);
  redirect(safeNextPath(formData.get("next")));
}
