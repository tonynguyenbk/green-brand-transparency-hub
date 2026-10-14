"use client";

import { PlusIcon } from "lucide-react";
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
import { submitArticleAction } from "@/lib/community/actions";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { PILLAR_VAR } from "../score-parts";
import type { CommunityAccess } from "./rate-card";

const inputCls =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-xl border bg-transparent px-3 text-sm focus-visible:ring-3 focus-visible:outline-none";

export function SubmitArticle({
  slug,
  name,
  access,
  mySubmissions,
}: {
  slug: string;
  name: string;
  access: CommunityAccess;
  mySubmissions: { id: string; title: string; pillar: string; status: string }[];
}) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pillar, setPillar] = useState<"E" | "S" | "G" | null>(null);
  const [sentiment, setSentiment] = useState<"POSITIVE" | "NEUTRAL" | "NEGATIVE" | null>(null);

  function start() {
    if (access.signedIn) setOpen(true);
    else if (access.mode === "disabled")
      toast(t("Đăng nhập Google sắp được bật.", "Google sign-in is coming soon."));
    else router.push(access.loginHref);
  }

  function submit(formData: FormData) {
    setError(null);
    if (!pillar || !sentiment) {
      setError(
        t(
          "Chọn trụ và hướng tin của bài báo.",
          "Choose the pillar and whether it's good or bad news.",
        ),
      );
      return;
    }
    startTransition(async () => {
      const res = await submitArticleAction(formData);
      if (res.ok) {
        toast.success(t("Đã gửi. Biên tập viên sẽ đọc bài này.", "Sent. An editor will read it."));
        setPillar(null);
        setSentiment(null);
        setOpen(false);
        router.refresh();
      } else setError(res.error);
    });
  }

  const pillars = [
    { v: "E" as const, label: t("Môi trường", "Environmental"), color: PILLAR_VAR.e },
    { v: "S" as const, label: t("Xã hội", "Social"), color: PILLAR_VAR.s },
    { v: "G" as const, label: t("Quản trị", "Governance"), color: PILLAR_VAR.g },
  ];
  const sentiments = [
    { v: "POSITIVE" as const, label: t("Tích cực", "Positive"), color: "var(--primary)" },
    { v: "NEUTRAL" as const, label: t("Trung lập", "Neutral"), color: "var(--muted-foreground)" },
    { v: "NEGATIVE" as const, label: t("Tiêu cực", "Negative"), color: "var(--band-1)" },
  ];
  const statusLabel: Record<string, string> = {
    PENDING: t("Đang chờ duyệt", "Waiting for review"),
    APPROVED: t("Đã thêm vào nguồn", "Added to sources"),
    REJECTED: t("Không được duyệt", "Not accepted"),
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
      >
        <PlusIcon className="size-4" aria-hidden="true" />
        {t("Gửi bài báo", "Suggest an article")}
      </button>

      {mySubmissions.length > 0 && (
        <div className="bg-muted/60 w-full space-y-2 rounded-xl p-4 text-sm">
          <p className="eyebrow text-muted-foreground">{t("Bài bạn đã gửi", "Your suggestions")}</p>
          <ul className="space-y-1.5">
            {mySubmissions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate">
                  {s.title} · {s.pillar}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    s.status === "APPROVED" && "bg-accent text-accent-foreground",
                    s.status === "PENDING" &&
                      "text-foreground bg-[color-mix(in_oklab,var(--band-3)_18%,transparent)]",
                    s.status === "REJECTED" && "bg-muted text-muted-foreground",
                  )}
                >
                  {statusLabel[s.status]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-semibold">
              {t(`Gửi bài báo về ${name}`, `Suggest an article about ${name}`)}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Biên tập viên đọc mọi bài trước khi đưa vào danh sách nguồn. Bài được duyệt có thể làm thay đổi điểm ở lần chấm sau.",
                "Editors read every article before adding it to the sources. Accepted articles can change the score at the next review.",
              )}
            </DialogDescription>
          </DialogHeader>

          <form action={submit} className="space-y-5">
            <input type="hidden" name="brandSlug" value={slug} />
            <input type="hidden" name="pillar" value={pillar ?? ""} />
            <input type="hidden" name="sentiment" value={sentiment ?? ""} />

            <div className="space-y-1.5">
              <label htmlFor="sub-url" className="font-semibold">
                {t("Đường dẫn bài báo", "Article link")}
              </label>
              <input
                id="sub-url"
                name="url"
                type="url"
                required
                maxLength={2048}
                placeholder="https://"
                className={cn(inputCls, "h-11")}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sub-title" className="font-semibold">
                {t("Tiêu đề và tên báo", "Headline and outlet")}
              </label>
              <input
                id="sub-title"
                name="title"
                required
                minLength={5}
                maxLength={300}
                placeholder={t("Ví dụ: … — Reuters", "e.g. … — Reuters")}
                className={cn(inputCls, "h-11")}
              />
            </div>

            <fieldset>
              <legend className="mb-2 font-semibold">
                {t("Bài nói về trụ nào?", "Which pillar is it about?")}
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {pillars.map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    aria-pressed={pillar === p.v}
                    onClick={() => setPillar(p.v)}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-semibold transition-colors",
                      pillar === p.v ? "border-2" : "hover:bg-muted",
                    )}
                    style={
                      pillar === p.v
                        ? {
                            borderColor: p.color,
                            color: p.color,
                            background: `color-mix(in oklab, ${p.color} 10%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 font-semibold">
                {t(`Tin tốt hay tin xấu cho ${name}?`, `Good or bad news for ${name}?`)}
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {sentiments.map((s) => (
                  <button
                    key={s.v}
                    type="button"
                    aria-pressed={sentiment === s.v}
                    onClick={() => setSentiment(s.v)}
                    className={cn(
                      "h-11 rounded-xl border text-sm font-semibold transition-colors",
                      sentiment === s.v ? "border-2" : "hover:bg-muted",
                    )}
                    style={
                      sentiment === s.v
                        ? {
                            borderColor: s.color,
                            color: s.color,
                            background: `color-mix(in oklab, ${s.color} 10%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label htmlFor="sub-summary" className="font-semibold">
                {t("Tóm tắt một câu", "One-sentence summary")}
              </label>
              <textarea
                id="sub-summary"
                name="summary"
                required
                minLength={10}
                maxLength={500}
                rows={3}
                placeholder={t(
                  `Bài báo cho thấy điều gì về ${name}?`,
                  `What does it show about ${name}?`,
                )}
                className={cn(inputCls, "resize-none py-2")}
              />
              <p className="text-muted-foreground text-xs">
                {t(
                  "Viết bằng lời của bạn, không chép nguyên văn bài.",
                  "Use your own words; don't copy the article.",
                )}
              </p>
            </div>

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
                onClick={() => setOpen(false)}
                className="hover:bg-muted h-11 rounded-xl border px-5 font-semibold"
              >
                {t("Huỷ", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={pending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl px-6 font-semibold disabled:opacity-60"
              >
                {pending ? t("Đang gửi…", "Sending…") : t("Gửi để duyệt", "Send for review")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
