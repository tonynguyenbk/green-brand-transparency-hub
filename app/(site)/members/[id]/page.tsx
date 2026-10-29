import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProfileView } from "@/components/gl/profile/profile-view";
import { SiteHeader } from "@/components/gl/site-chrome";
import { getMember } from "@/lib/auth/member";
import { getProfile } from "@/lib/community/profiles";
import { getLocale } from "@/lib/i18n/server";
import { idSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

async function publicProfile(rawId: string) {
  const id = idSchema.safeParse(rawId);
  if (!id.success) return null;
  const profile = await getProfile(id.data);
  return profile?.isPublic ? profile : null;
}

export async function generateMetadata(props: PageProps<"/members/[id]">): Promise<Metadata> {
  const p = await publicProfile((await props.params).id);
  return p ? { title: p.displayName } : { title: "Member not found" };
}

export default async function MemberPage(props: PageProps<"/members/[id]">) {
  const { id } = await props.params;
  const member = await getMember();
  if (member?.id === id) redirect("/me");
  const [locale, profile] = await Promise.all([getLocale(), publicProfile(id)]);
  if (!profile) notFound();

  return (
    <>
      <SiteHeader />
      <ProfileView profile={profile} locale={locale} isOwner={false} />
    </>
  );
}
