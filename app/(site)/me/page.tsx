import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PhotoEditor, ProfileForm } from "@/components/gl/profile/profile-editor";
import { ProfileView } from "@/components/gl/profile/profile-view";
import { SiteHeader } from "@/components/gl/site-chrome";
import { getMember } from "@/lib/auth/member";
import { getProfile } from "@/lib/community/profiles";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

export default async function MyProfilePage() {
  const member = await getMember();
  if (!member) redirect("/login?next=/me");
  const [locale, profile] = await Promise.all([getLocale(), getProfile(member.id)]);
  if (!profile) notFound();

  return (
    <>
      <SiteHeader />
      <ProfileView
        profile={profile}
        locale={locale}
        isOwner
        photoSlot={
          <PhotoEditor
            name={profile.displayName}
            src={profile.avatarUrl}
            hasUpload={profile.hasUploadedPhoto}
          />
        }
      >
        <ProfileForm
          initial={{
            displayName: profile.displayName,
            bio: profile.bio,
            interests: profile.interests,
            isPublic: profile.isPublic,
            showActivity: profile.showActivity,
            profileComplete: profile.stats.profileComplete,
          }}
        />
      </ProfileView>
    </>
  );
}
