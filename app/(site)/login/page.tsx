import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DevLoginForm } from "@/components/gl/community/dev-login-form";
import { GoogleMark } from "@/components/gl/community/rate-card";
import { SiteHeader } from "@/components/gl/site-chrome";
import { getMember, getMemberAuthMode, safeNextPath } from "@/lib/auth/member";
import { signInWithGoogle } from "@/lib/auth/member-actions";
import { getLocale } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/shared";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = safeNextPath(sp.next);
  if (await getMember()) redirect(next);
  const locale = await getLocale();
  const L = (vi: string, en: string) => tr(locale, vi, en);
  const mode = getMemberAuthMode();

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="bg-card space-y-6 rounded-3xl border p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{L("Đăng nhập", "Sign in")}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {L(
                "Đăng nhập để chấm điểm công ty, bình chọn độ tin cậy của bài báo và gửi bài mới. Xem điểm thì không cần đăng nhập.",
                "Sign in to rate companies, vote on article reliability and suggest new articles. Browsing never needs an account.",
              )}
            </p>
          </div>

          {sp.error === "oauth" && (
            <p
              role="alert"
              className="rounded-xl bg-[color-mix(in_oklab,var(--band-1)_12%,transparent)] px-3 py-2 text-sm text-[var(--band-1)]"
            >
              {L(
                "Đăng nhập Google chưa thành công. Hãy thử lại.",
                "Google sign-in didn't complete. Try again.",
              )}
            </p>
          )}

          {mode === "supabase" && (
            <form action={signInWithGoogle}>
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className="hover:bg-muted focus-visible:ring-ring/50 inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
              >
                <GoogleMark />
                {L("Tiếp tục với Google", "Continue with Google")}
              </button>
            </form>
          )}

          {mode === "dev" && (
            <div className="space-y-3">
              <p className="bg-muted text-muted-foreground rounded-xl p-3 text-xs">
                {L(
                  "Chế độ thử trên máy cục bộ: chưa cấu hình Supabase nên đăng nhập bằng tên, không cần mật khẩu.",
                  "Local test mode: Supabase isn't configured, so you sign in with a name and no password.",
                )}
              </p>
              <DevLoginForm next={next} />
            </div>
          )}

          {mode === "disabled" && (
            <p className="bg-muted rounded-xl p-4 text-sm">
              {L(
                "Đăng nhập Google sắp được bật trên trang này.",
                "Google sign-in is coming soon on this site.",
              )}
            </p>
          )}

          <p className="text-muted-foreground text-xs leading-relaxed">
            {L(
              "Chúng tôi chỉ lưu tên và ảnh đại diện Google của bạn để hiển thị bên cạnh đánh giá. Email không bao giờ được công khai.",
              "We only keep your Google name and avatar to show next to your ratings. Your email is never shown publicly.",
            )}{" "}
            <Link href={next} className="text-primary font-semibold hover:underline">
              {L("Quay lại", "Go back")}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
