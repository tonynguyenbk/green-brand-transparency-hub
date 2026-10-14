"use server";

import { revalidatePath } from "next/cache";
import { getMember } from "@/lib/auth/member";
import { requireAdmin } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { tr, type Locale } from "@/lib/i18n/shared";
import {
  articleSubmissionSchema,
  communityRatingSchema,
  idSchema,
  sourceVoteSchema,
  submissionReviewSchema,
} from "@/lib/validation/schemas";
import {
  CommunityError,
  castSourceVote,
  reviewSubmission,
  saveRating,
  setRatingHidden,
  submitArticle,
} from "./service";

export type ActionResult = { ok: true } | { ok: false; error: string; signIn?: boolean };

function errorText(locale: Locale, e: unknown): string {
  if (e instanceof CommunityError) {
    switch (e.code) {
      case "not_found":
        return tr(locale, "Không tìm thấy mục này.", "That item was not found.");
      case "too_many_pending":
        return tr(
          locale,
          "Bạn đang có 5 bài chờ duyệt. Hãy đợi biên tập viên xử lý trước khi gửi thêm.",
          "You have 5 articles waiting for review. Wait for editors to process them before sending more.",
        );
      case "duplicate":
        return tr(
          locale,
          "Bài báo này đã có trong danh sách nguồn hoặc bạn đã gửi trước đó.",
          "This article is already a source, or you have sent it before.",
        );
      case "already_reviewed":
        return tr(locale, "Bài này đã được xử lý.", "This submission was already reviewed.");
    }
  }
  console.error(e);
  return tr(locale, "Không lưu được. Hãy thử lại.", "Could not save. Try again.");
}

async function signedIn(locale: Locale) {
  const member = await getMember();
  if (!member)
    return {
      member: null,
      result: {
        ok: false,
        signIn: true,
        error: tr(locale, "Hãy đăng nhập để tiếp tục.", "Sign in to continue."),
      } satisfies ActionResult,
    };
  return { member, result: null };
}

const invalid = (locale: Locale): ActionResult => ({
  ok: false,
  error: tr(locale, "Kiểm tra lại các ô đã nhập.", "Check the fields you filled in."),
});

export async function rateCompanyAction(formData: FormData): Promise<ActionResult> {
  const locale = await getLocale();
  const { member, result } = await signedIn(locale);
  if (!member) return result;
  const parsed = communityRatingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "pledge"))
      return {
        ok: false,
        error: tr(
          locale,
          "Hãy xác nhận cam kết chấm trung thực.",
          "Confirm the honesty pledge to submit.",
        ),
      };
    return invalid(locale);
  }
  try {
    await saveRating(member.id, parsed.data);
  } catch (e) {
    return { ok: false, error: errorText(locale, e) };
  }
  revalidatePath(`/companies/${parsed.data.brandSlug}`);
  return { ok: true };
}

export async function voteSourceAction(
  sourceId: string,
  vote: "up" | "down" | "clear",
): Promise<ActionResult> {
  const locale = await getLocale();
  const { member, result } = await signedIn(locale);
  if (!member) return result;
  const parsed = sourceVoteSchema.safeParse({ sourceId, vote });
  if (!parsed.success) return invalid(locale);
  try {
    const slug = await castSourceVote(member.id, parsed.data.sourceId, parsed.data.vote);
    revalidatePath(`/companies/${slug}`);
  } catch (e) {
    return { ok: false, error: errorText(locale, e) };
  }
  return { ok: true };
}

export async function submitArticleAction(formData: FormData): Promise<ActionResult> {
  const locale = await getLocale();
  const { member, result } = await signedIn(locale);
  if (!member) return result;
  const parsed = articleSubmissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "url")
      return {
        ok: false,
        error: tr(
          locale,
          "Dán đường dẫn đầy đủ, bắt đầu bằng https://",
          "Paste the full link, starting with https://",
        ),
      };
    return invalid(locale);
  }
  try {
    await submitArticle(member.id, parsed.data);
  } catch (e) {
    return { ok: false, error: errorText(locale, e) };
  }
  revalidatePath(`/companies/${parsed.data.brandSlug}`);
  revalidatePath("/admin/community");
  return { ok: true };
}

// --- Admin ------------------------------------------------------------------

export async function reviewSubmissionAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = submissionReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  try {
    const { slug } = await reviewSubmission(
      admin.email,
      parsed.data.submissionId,
      parsed.data.decision,
      parsed.data.reviewNote,
    );
    revalidatePath(`/companies/${slug}`);
  } catch (e) {
    if (!(e instanceof CommunityError)) throw e;
  }
  revalidatePath("/admin/community");
}

export async function setRatingHiddenAction(formData: FormData) {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("ratingId"));
  if (!id.success) return;
  const slug = await setRatingHidden(id.data, formData.get("hidden") === "true");
  revalidatePath(`/companies/${slug}`);
  revalidatePath("/admin/community");
}
