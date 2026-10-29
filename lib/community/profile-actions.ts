"use server";

import { revalidatePath } from "next/cache";
import { getMember } from "@/lib/auth/member";
import { getLocale } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/shared";
import { profileSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "./actions";
import { PHOTO_MAX_BYTES, deletePhoto, savePhoto, sniffImageType, updateProfile } from "./profiles";

async function requireMember() {
  const locale = await getLocale();
  const member = await getMember();
  const denied: ActionResult = {
    ok: false,
    signIn: true,
    error: tr(locale, "Hãy đăng nhập để tiếp tục.", "Sign in to continue."),
  };
  return { locale, member, denied };
}

function refresh(memberId: string) {
  revalidatePath("/me");
  revalidatePath(`/members/${memberId}`);
  revalidatePath("/leaderboard");
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const { locale, member, denied } = await requireMember();
  if (!member) return denied;
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
    interests: formData.getAll("interests"),
    isPublic: formData.get("isPublic"),
    showActivity: formData.get("showActivity"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      ok: false,
      error:
        field === "displayName"
          ? tr(locale, "Tên hiển thị cần từ 2 đến 60 ký tự.", "Display name needs 2–60 characters.")
          : field === "bio"
            ? tr(locale, "Giới thiệu tối đa 300 ký tự.", "Bio is at most 300 characters.")
            : tr(locale, "Kiểm tra lại các ô đã nhập.", "Check the fields you filled in."),
    };
  }
  await updateProfile(member.id, parsed.data);
  refresh(member.id);
  return { ok: true };
}

export async function uploadPhotoAction(formData: FormData): Promise<ActionResult> {
  const { locale, member, denied } = await requireMember();
  if (!member) return denied;
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: tr(locale, "Chưa chọn ảnh.", "No photo selected.") };
  if (file.size > PHOTO_MAX_BYTES)
    return {
      ok: false,
      error: tr(locale, "Ảnh quá lớn (tối đa 400 KB).", "Photo is too large (400 KB max)."),
    };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime)
    return {
      ok: false,
      error: tr(locale, "Chỉ nhận ảnh JPG, PNG hoặc WebP.", "Only JPG, PNG or WebP images."),
    };
  await savePhoto(member.id, bytes, mime);
  refresh(member.id);
  return { ok: true };
}

export async function deletePhotoAction(): Promise<ActionResult> {
  const { member, denied } = await requireMember();
  if (!member) return denied;
  await deletePhoto(member.id);
  refresh(member.id);
  return { ok: true };
}
