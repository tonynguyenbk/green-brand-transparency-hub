import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { getMember, getMemberAuthMode } from "@/lib/auth/member";
import { memberSignOut } from "@/lib/auth/member-actions";
import { tr, type Locale } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";

/** Header account control: "Sign in", or a link to the member's profile plus sign-out. */
export async function MemberMenu({ locale, onDark }: { locale: Locale; onDark?: boolean }) {
  if (getMemberAuthMode() === "disabled") return null;
  const member = await getMember();
  const tone = onDark
    ? "border-white/20 text-on-forest hover:bg-white/10"
    : "border-border hover:bg-muted";

  if (!member) {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex h-9 items-center rounded-lg border px-3 text-sm font-semibold",
          tone,
        )}
      >
        {tr(locale, "Đăng nhập", "Sign in")}
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/me"
        title={tr(locale, "Hồ sơ của bạn", "Your profile")}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg px-1 text-sm font-medium sm:pr-2",
          onDark ? "hover:bg-white/10" : "hover:bg-muted",
        )}
      >
        <MemberAvatar name={member.displayName} src={member.avatarUrl} size={28} />
        <span className="hidden max-w-32 truncate sm:inline">{member.displayName}</span>
        <span className="sr-only sm:hidden">{tr(locale, "Hồ sơ của bạn", "Your profile")}</span>
      </Link>
      <form action={memberSignOut}>
        <input type="hidden" name="next" value="/" />
        <button
          type="submit"
          aria-label={tr(locale, "Đăng xuất", "Sign out")}
          title={tr(locale, "Đăng xuất", "Sign out")}
          className={cn("grid size-9 place-items-center rounded-lg border", tone)}
        >
          <LogOutIcon className="size-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
