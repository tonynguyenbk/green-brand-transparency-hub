"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

interface Option {
  slug: string;
  name: string;
  industry: string;
}

/** Choose 2–4 brands; the selection is stored in the URL (?brands=a,b). */
export function BrandPicker({
  options,
  selected,
  min,
  max,
}: {
  options: Option[];
  selected: string[];
  min: number;
  max: number;
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(selected);
  const [pending, startTransition] = useTransition();

  function toggle(slug: string) {
    setPicked((p) =>
      p.includes(slug) ? p.filter((s) => s !== slug) : p.length >= max ? p : [...p, slug],
    );
  }

  const tooFew = picked.length < min;

  return (
    <form
      className="bg-card space-y-4 rounded-xl border p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (tooFew) return;
        track("compare_brand", { brands: picked.join(","), count: picked.length });
        startTransition(() => router.push(`/compare?brands=${picked.join(",")}`));
      }}
    >
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">
          Select {min}–{max} brands{" "}
          <span className="text-muted-foreground font-normal">({picked.length} selected)</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((o) => {
            const checked = picked.includes(o.slug);
            const disabled = !checked && picked.length >= max;
            return (
              <label
                key={o.slug}
                className={cn(
                  "has-[:focus-visible]:ring-ring flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors has-[:focus-visible]:ring-2",
                  checked ? "border-primary bg-accent" : "hover:bg-muted/50",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[var(--primary)]"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(o.slug)}
                  name="brand"
                  value={o.slug}
                />
                <span>
                  <span className="block font-medium">{o.name}</span>
                  <span className="text-muted-foreground text-xs">{o.industry}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={tooFew || pending}>
          {pending ? "Comparing…" : "Compare brands"}
        </Button>
        {tooFew && <p className="text-muted-foreground text-sm">Choose at least {min} brands.</p>}
      </div>
    </form>
  );
}
