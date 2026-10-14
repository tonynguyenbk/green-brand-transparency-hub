"use client";

import { StarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CommunitySummary } from "@/lib/community/aggregate";
import { rateCompanyAction } from "@/lib/community/actions";
import type { MyRating } from "@/lib/community/service";
import { computeEsg, formatEsg } from "@/lib/esg/scoring";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { PILLAR_VAR } from "../score-parts";
import { Stars } from "./stars";

export interface CommunityAccess {
  /** "disabled" = sign-in is not configured on this deployment. */
  mode: "supabase" | "dev" | "disabled";
  signedIn: boolean;
  loginHref: string;
}

const STAR_WORDS = [
  ["Rất kém", "Very poor"],
  ["Kém", "Poor"],
  ["Tạm được", "Fair"],
  ["Khá xanh", "Fairly green"],
  ["Rất xanh", "Very green"],
] as const;

export function RateCard({
  slug,
  name,
  summary,
  mine,
  greenlens,
  access,
}: {
  slug: string;
  name: string;
  summary: CommunitySummary;
  mine: MyRating | null;
  greenlens: { e: number; s: number; g: number };
  access: CommunityAccess;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="rate-h" className="bg-card space-y-4 rounded-2xl border p-6">
      <h2 id="rate-h" className="font-sans text-base font-semibold">
        {t(`Bạn thấy ${name} xanh đến đâu?`, `How green do you think ${name} is?`)}
      </h2>

      <div className="flex items-center gap-3">
        <Stars value={summary.stars} />
        <span className="text-sm">
          {summary.shown ? (
            <>
              <b className="tabular">{summary.stars!.toFixed(1)}</b> / 5 ·{" "}
              {t(`${summary.count} lượt`, `${summary.count} ratings`)}
            </>
          ) : (
            <span className="text-muted-foreground">
              {t(`${summary.count}/10 lượt chấm`, `${summary.count}/10 ratings`)}
            </span>
          )}
        </span>
      </div>

      {access.mode === "disabled" ? (
        <p className="bg-muted text-muted-foreground rounded-xl p-3 text-sm">
          {t(
            "Đăng nhập Google sắp được bật. Khi đó bạn có thể chấm công ty này.",
            "Google sign-in is coming soon. You'll then be able to rate this company.",
          )}
        </p>
      ) : access.signedIn ? (
        <>
          {mine && (
            <div className="bg-muted/70 rounded-xl p-3 text-sm">
              <p className="font-medium">{t("Bạn đã chấm", "Your rating")}</p>
              <p className="tabular text-muted-foreground mt-0.5">
                {mine.stars}★ · E {formatEsg(mine.e)} · S {formatEsg(mine.s)} · G{" "}
                {formatEsg(mine.g)}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            <StarIcon className="size-4" aria-hidden="true" />
            {mine ? t("Sửa đánh giá", "Edit your rating") : t("Chấm điểm", "Rate this company")}
          </button>
          <RateDialog
            open={open}
            onOpenChange={setOpen}
            slug={slug}
            name={name}
            mine={mine}
            greenlens={greenlens}
          />
        </>
      ) : (
        <Link
          href={access.loginHref}
          className="hover:bg-muted focus-visible:ring-ring/50 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none"
        >
          <GoogleMark />
          {access.mode === "dev"
            ? t("Đăng nhập thử để chấm", "Test sign-in to rate")
            : t("Đăng nhập bằng Google để chấm", "Sign in with Google to rate")}
        </Link>
      )}

      <p className="text-muted-foreground text-xs leading-relaxed">
        {t(
          "Mỗi tài khoản chấm một lần cho mỗi công ty và sửa được bất cứ lúc nào. Điểm cộng đồng hiển thị riêng, không cộng vào điểm Greenlens.",
          "One rating per account per company, editable any time. Community scores are shown separately and never added to the Greenlens score.",
        )}
      </p>
    </section>
  );
}

export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[18px]", className)} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}

function RateDialog({
  open,
  onOpenChange,
  slug,
  name,
  mine,
  greenlens,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  name: string;
  mine: MyRating | null;
  greenlens: { e: number; s: number; g: number };
}) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const starWord = (n: number) => t(STAR_WORDS[n - 1]![0], STAR_WORDS[n - 1]![1]);
  const [stars, setStars] = useState<number>(mine?.stars ?? 0);
  const [vals, setVals] = useState({
    e: mine?.e ?? greenlens.e,
    s: mine?.s ?? greenlens.s,
    g: mine?.g ?? greenlens.g,
  });

  const pillars = [
    {
      k: "e" as const,
      field: "environmental",
      label: t("Môi trường", "Environmental"),
      hint: t("phát thải, vật liệu, rác thải", "emissions, materials, waste"),
    },
    {
      k: "s" as const,
      field: "social",
      label: t("Xã hội", "Social"),
      hint: t("người lao động, chuỗi cung ứng, cộng đồng", "workers, supply chain, communities"),
    },
    {
      k: "g" as const,
      field: "governance",
      label: t("Quản trị", "Governance"),
      hint: t("minh bạch, trung thực khi quảng cáo xanh", "transparency, honest green marketing"),
    },
  ];

  function submit(formData: FormData) {
    setError(null);
    if (!stars) {
      setError(t("Chọn số sao trước khi gửi.", "Pick a star rating first."));
      return;
    }
    startTransition(async () => {
      const res = await rateCompanyAction(formData);
      if (res.ok) {
        toast.success(t("Đã lưu đánh giá của bạn", "Your rating was saved"));
        onOpenChange(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-semibold">
            {t(`Chấm điểm ${name}`, `Rate ${name}`)}
          </DialogTitle>
          <DialogDescription>
            {t(
              "Chấm theo những gì bạn biết. Bạn có thể sửa lại bất cứ lúc nào.",
              "Rate on what you know. You can change it any time.",
            )}
          </DialogDescription>
        </DialogHeader>

        <form action={submit} className="space-y-6">
          <input type="hidden" name="brandSlug" value={slug} />
          <fieldset>
            <legend className="mb-2.5 font-semibold">
              {t(`Nhìn chung, ${name} xanh đến đâu?`, `Overall, how green is ${name}?`)}
            </legend>
            <div className="flex flex-wrap items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className={cn(
                    "has-focus-visible:ring-ring/50 grid size-11 cursor-pointer place-items-center rounded-xl border transition-colors has-focus-visible:ring-3",
                    n <= stars
                      ? "border-[color-mix(in_oklab,var(--band-2)_45%,transparent)] bg-[color-mix(in_oklab,var(--band-2)_12%,transparent)] text-[var(--band-2)]"
                      : "text-border hover:text-muted-foreground",
                  )}
                >
                  <input
                    type="radio"
                    name="stars"
                    value={n}
                    checked={stars === n}
                    onChange={() => setStars(n)}
                    className="sr-only"
                  />
                  <StarIcon className="size-6 fill-current" aria-hidden="true" />
                  <span className="sr-only">
                    {n} {t("sao", n === 1 ? "star" : "stars")} — {starWord(n)}
                  </span>
                </label>
              ))}
              {stars > 0 && (
                <span className="text-muted-foreground ml-2 text-sm">{starWord(stars)}</span>
              )}
            </div>
          </fieldset>

          <div className="space-y-5 border-t pt-5">
            <p className="font-semibold">{t("Chấm từng trụ, thang 1–10", "Each pillar, 1–10")}</p>
            {pillars.map((p) => (
              <div key={p.k} className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <label
                    htmlFor={`rate-${p.k}`}
                    className="font-semibold"
                    style={{ color: PILLAR_VAR[p.k] }}
                  >
                    {p.label}
                  </label>
                  <output
                    htmlFor={`rate-${p.k}`}
                    className="tabular font-serif text-2xl font-semibold"
                  >
                    {formatEsg(vals[p.k])}
                  </output>
                </div>
                <input
                  id={`rate-${p.k}`}
                  name={p.field}
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={vals[p.k]}
                  onChange={(e) => setVals((v) => ({ ...v, [p.k]: Number(e.target.value) }))}
                  className="h-7 w-full cursor-pointer"
                  style={{ accentColor: PILLAR_VAR[p.k] }}
                />
                <p className="text-muted-foreground text-xs">
                  {t("Greenlens chấm", "Greenlens gave")} {formatEsg(greenlens[p.k])} · {p.hint}
                </p>
              </div>
            ))}
            <div className="bg-muted flex items-center justify-between gap-4 rounded-xl px-4 py-3">
              <span className="text-muted-foreground text-xs">
                {t("Điểm ESG của bạn", "Your ESG score")}
                <br />
                <span className="tabular font-mono">
                  {formatEsg(vals.e)} × 0.4 + {formatEsg(vals.s)} × 0.35 + {formatEsg(vals.g)} ×
                  0.25
                </span>
              </span>
              <span className="tabular font-serif text-3xl font-semibold">
                {formatEsg(computeEsg(vals.e, vals.s, vals.g))}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="rate-comment" className="font-semibold">
              {t("Vì sao bạn chấm như vậy?", "Why did you rate it this way?")}{" "}
              <span className="text-muted-foreground font-normal">
                {t("(không bắt buộc)", "(optional)")}
              </span>
            </label>
            <textarea
              id="rate-comment"
              name="comment"
              rows={3}
              maxLength={1000}
              defaultValue={mine?.comment ?? ""}
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:ring-3 focus-visible:outline-none"
            />
          </div>

          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              name="pledge"
              required
              defaultChecked={Boolean(mine)}
              className="accent-primary mt-0.5 size-[18px] shrink-0"
            />
            {t(
              `Tôi chấm dựa trên những gì mình biết, không nhận tiền hay lợi ích từ ${name} hoặc đối thủ.`,
              `I'm rating on what I know, and I receive no money or benefit from ${name} or its competitors.`,
            )}
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[color-mix(in_oklab,var(--band-1)_12%,transparent)] px-3 py-2 text-sm text-[var(--band-1)]"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="hover:bg-muted h-11 rounded-xl border px-5 font-semibold"
            >
              {t("Huỷ", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl px-6 font-semibold disabled:opacity-60"
            >
              {pending ? t("Đang gửi…", "Sending…") : t("Gửi đánh giá", "Submit rating")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
