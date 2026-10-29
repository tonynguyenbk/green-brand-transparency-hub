"use client";

import { CameraIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { MemberAvatar } from "@/components/gl/member-avatar";
import { PILLAR_VAR } from "@/components/gl/score-parts";
import {
  deletePhotoAction,
  updateProfileAction,
  uploadPhotoAction,
} from "@/lib/community/profile-actions";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

const inputCls =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-xl border bg-transparent px-3 text-sm focus-visible:ring-3 focus-visible:outline-none";

const PHOTO_SIZE = 256;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Crop to a centred square and re-encode small, so uploads stay well under the limit. */
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  canvas
    .getContext("2d")!
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      PHOTO_SIZE,
      PHOTO_SIZE,
    );
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (blob?.type === "image/webp") return blob;
  // Browsers without WebP encoding fall back to JPEG.
  const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!jpeg) throw new Error("encode");
  return jpeg;
}

export function PhotoEditor({
  name,
  src,
  hasUpload,
}: {
  name: string;
  src: string | null;
  hasUpload: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error(t("Chỉ nhận ảnh JPG, PNG hoặc WebP.", "Only JPG, PNG or WebP images."));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("Ảnh gốc tối đa 10 MB.", "Original photo must be under 10 MB."));
      return;
    }
    startTransition(async () => {
      try {
        const blob = await toSquareWebp(file);
        const fd = new FormData();
        fd.set("photo", new File([blob], "avatar", { type: blob.type }));
        const res = await uploadPhotoAction(fd);
        if (res.ok) {
          toast.success(t("Đã cập nhật ảnh đại diện.", "Profile photo updated."));
          router.refresh();
        } else toast.error(res.error);
      } catch {
        toast.error(t("Không đọc được ảnh này.", "Could not read this image."));
      } finally {
        if (input.current) input.current.value = "";
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deletePhotoAction();
      if (res.ok) router.refresh();
      else toast.error(res.error);
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className={cn("relative", pending && "opacity-60")}>
        <MemberAvatar name={name} src={src} size={96} />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={pending}
          aria-label={t("Đổi ảnh đại diện", "Change profile photo")}
          title={t("Đổi ảnh đại diện", "Change profile photo")}
          className="bg-primary text-primary-foreground ring-card absolute right-0 bottom-0 grid size-8 place-items-center rounded-full ring-4"
        >
          <CameraIcon className="size-4" aria-hidden="true" />
        </button>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      {hasUpload && (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <Trash2Icon className="size-3" aria-hidden="true" />
          {t("Xoá ảnh", "Remove photo")}
        </button>
      )}
    </div>
  );
}

export function ProfileForm({
  initial,
}: {
  initial: {
    displayName: string;
    bio: string | null;
    interests: ("E" | "S" | "G")[];
    isPublic: boolean;
    showActivity: boolean;
    profileComplete: boolean;
  };
}) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [bio, setBio] = useState(initial.bio ?? "");

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.ok) {
        toast.success(t("Đã lưu hồ sơ.", "Profile saved."));
        router.refresh();
      } else setError(res.error);
    });
  }

  const pillars = [
    { k: "E" as const, label: t("Môi trường", "Environmental") },
    { k: "S" as const, label: t("Xã hội", "Social") },
    { k: "G" as const, label: t("Quản trị", "Governance") },
  ];

  return (
    <section aria-labelledby="edit-h" className="bg-card rounded-2xl border p-5 sm:p-6">
      <h2 id="edit-h" className="text-xl font-semibold">
        {t("Chỉnh sửa hồ sơ", "Edit profile")}
      </h2>
      {!initial.profileComplete && (
        <p className="bg-primary/10 text-primary mt-2 rounded-lg px-3 py-2 text-sm font-medium">
          {t(
            "Thêm giới thiệu và chọn ít nhất một chủ đề quan tâm để nhận +20 GP.",
            "Add a bio and pick at least one interest to earn +20 GP.",
          )}
        </p>
      )}
      <form action={submit} className="mt-5 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="displayName" className="text-sm font-medium">
            {t("Tên hiển thị", "Display name")}
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            minLength={2}
            maxLength={60}
            defaultValue={initial.displayName}
            className={cn(inputCls, "h-10")}
          />
          <p className="text-muted-foreground text-xs">
            {t(
              "Có thể dùng biệt danh thay cho tên thật.",
              "You can use a nickname instead of your real name.",
            )}
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-sm font-medium">
            {t("Giới thiệu ngắn", "Short bio")}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={300}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t(
              "Ví dụ: Sinh viên quan tâm đến thời trang bền vững.",
              "e.g. Student interested in sustainable fashion.",
            )}
            className={cn(inputCls, "py-2")}
          />
          <p className="text-muted-foreground tabular text-right text-xs">{bio.length}/300</p>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            {t("Chủ đề ESG quan tâm", "ESG interests")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {pillars.map((p) => (
              <label
                key={p.k}
                className="has-[:checked]:border-foreground has-focus-visible:ring-ring/50 inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm has-focus-visible:ring-3"
              >
                <input
                  type="checkbox"
                  name="interests"
                  value={p.k}
                  defaultChecked={initial.interests.includes(p.k)}
                  className="sr-only"
                />
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: PILLAR_VAR[p.k.toLowerCase() as "e" | "s" | "g"] }}
                  aria-hidden="true"
                />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">{t("Quyền riêng tư", "Privacy")}</legend>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="isPublic"
              defaultChecked={initial.isPublic}
              className="accent-primary mt-0.5 size-4"
            />
            <span>
              <span className="block font-medium">{t("Hồ sơ công khai", "Public profile")}</span>
              <span className="text-muted-foreground block text-xs">
                {t(
                  'Tắt để hiện là "Thành viên ẩn danh" trên bảng xếp hạng.',
                  'Turn off to appear as "Anonymous member" on the leaderboard.',
                )}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="showActivity"
              defaultChecked={initial.showActivity}
              className="accent-primary mt-0.5 size-4"
            />
            <span>
              <span className="block font-medium">
                {t("Hiện lịch sử hoạt động", "Show activity history")}
              </span>
              <span className="text-muted-foreground block text-xs">
                {t(
                  "Người khác thấy các công ty bạn đã chấm và bài được duyệt.",
                  "Others see the companies you rated and your approved articles.",
                )}
              </span>
            </span>
          </label>
        </fieldset>
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground h-10 rounded-xl px-5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? t("Đang lưu…", "Saving…") : t("Lưu hồ sơ", "Save profile")}
        </button>
      </form>
    </section>
  );
}
