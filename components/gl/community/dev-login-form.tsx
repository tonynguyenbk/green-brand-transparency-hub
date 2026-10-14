"use client";

import { useActionState } from "react";
import { devMemberSignIn, type MemberLoginState } from "@/lib/auth/member-actions";
import { useT } from "@/lib/i18n/client";

export function DevLoginForm({ next }: { next: string }) {
  const t = useT();
  const [state, action, pending] = useActionState<MemberLoginState, FormData>(devMemberSignIn, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="dev-name" className="block text-sm font-semibold">
        {t("Tên hiển thị", "Display name")}
      </label>
      <input
        id="dev-name"
        name="displayName"
        required
        minLength={2}
        maxLength={60}
        autoComplete="off"
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-xl border bg-transparent px-3 text-sm focus-visible:ring-3 focus-visible:outline-none"
      />
      {state.error && (
        <p role="alert" className="text-sm text-[var(--band-1)]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full rounded-xl font-semibold disabled:opacity-60"
      >
        {t("Đăng nhập thử", "Test sign-in")}
      </button>
    </form>
  );
}
