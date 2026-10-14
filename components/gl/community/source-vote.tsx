"use client";

import { AlertCircleIcon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import type { Reliability } from "@/lib/community/aggregate";
import { voteSourceAction } from "@/lib/community/actions";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import type { CommunityAccess } from "./rate-card";

type State = Reliability & { myVote: boolean | null };

function applyVote(s: State, next: boolean | null): State {
  let { reliable, total } = s;
  if (s.myVote !== null) {
    total -= 1;
    if (s.myVote) reliable -= 1;
  }
  if (next !== null) {
    total += 1;
    if (next) reliable += 1;
  }
  return { ...s, reliable, total, share: total ? reliable / total : null, myVote: next };
}

/** Reliability bar plus "Reliable / Not accurate" vote buttons for one source. */
export function SourceVote({
  sourceId,
  initial,
  access,
}: {
  sourceId: string;
  initial: State;
  access: CommunityAccess;
}) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setOptimistic] = useOptimistic(initial, applyVote);

  function vote(next: boolean) {
    if (!access.signedIn) {
      if (access.mode === "disabled") {
        toast(t("Đăng nhập Google sắp được bật.", "Google sign-in is coming soon."));
      } else {
        router.push(access.loginHref);
      }
      return;
    }
    const target = state.myVote === next ? null : next;
    startTransition(async () => {
      setOptimistic(target);
      const res = await voteSourceAction(
        sourceId,
        target === null ? "clear" : target ? "up" : "down",
      );
      if (!res.ok) toast.error(res.error);
      router.refresh();
    });
  }

  const pct = state.share === null ? null : Math.round(state.share * 100);
  const barColor =
    pct === null
      ? ""
      : pct >= 70
        ? "var(--primary)"
        : pct >= 40
          ? "var(--band-3)"
          : "var(--band-1)";

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="text-muted-foreground flex min-w-0 items-center gap-2.5 text-xs">
        {pct === null ? (
          <span>{t("Chưa có phiếu đánh giá độ tin cậy", "No reliability votes yet")}</span>
        ) : (
          <>
            <span className="bg-border h-1.5 w-24 overflow-hidden rounded-full" aria-hidden="true">
              <span
                className="block h-full rounded-full"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </span>
            <span className="tabular">
              {t(
                `${pct}% thấy đáng tin · ${state.total} phiếu`,
                `${pct}% find it reliable · ${state.total} votes`,
              )}
            </span>
          </>
        )}
      </div>
      <div
        className="flex gap-1.5"
        role="group"
        aria-label={t("Bài này có đáng tin không?", "Is this article reliable?")}
      >
        <button
          type="button"
          onClick={() => vote(true)}
          disabled={pending}
          aria-pressed={state.myVote === true}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:opacity-70",
            state.myVote === true
              ? "border-primary bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {state.myVote === true && <CheckIcon className="size-3.5" aria-hidden="true" />}
          {t("Đáng tin", "Reliable")}
        </button>
        <button
          type="button"
          onClick={() => vote(false)}
          disabled={pending}
          aria-pressed={state.myVote === false}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:opacity-70",
            state.myVote === false
              ? "border-[var(--band-1)] bg-[color-mix(in_oklab,var(--band-1)_12%,transparent)] text-[var(--band-1)]"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {state.myVote === false && <AlertCircleIcon className="size-3.5" aria-hidden="true" />}
          {t("Chưa đúng", "Not accurate")}
        </button>
      </div>
      {state.flagged && (
        <p className="flex w-full items-center gap-2 rounded-lg bg-[color-mix(in_oklab,var(--band-1)_10%,transparent)] px-3 py-2 text-xs text-[var(--band-1)]">
          <AlertCircleIcon className="size-3.5 shrink-0" aria-hidden="true" />
          {t(
            "Nhiều người thấy bài này chưa phản ánh đúng. Biên tập viên đang xem lại.",
            "Many readers find this article inaccurate. Editors are reviewing it.",
          )}
        </p>
      )}
    </div>
  );
}
