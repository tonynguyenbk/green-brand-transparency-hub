import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { getMember, getMemberAuthMode } from "@/lib/auth/member";
import { memberSignOut } from "@/lib/auth/member-actions";
import { tr, type Locale } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";

/** Header account control: "Sign in", or the member's name with a sign-out button. */
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
  const initial = member.displayName.trim().charAt(0).toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-2 text-sm font-medium sm:inline-flex">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatarUrl}
            alt=""
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="size-7 rounded-full"
          />
        ) : (
          <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-full text-xs font-bold">
            {initial}
          </span>
        )}
        <span className="max-w-32 truncate">{member.displayName}</span>
      </span>
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
