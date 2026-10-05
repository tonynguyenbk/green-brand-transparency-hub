"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics/client";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm shadow-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Directory filters, kept in the URL so results are shareable and server-rendered. */
export function BrandFilters({ industries }: { industries: { slug: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const next = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      const v = String(value).trim();
      if (v) next.set(key, v);
    }
    if (next.get("q"))
      track("brand_search", { query_length: next.get("q")!.length, source: "directory" });
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <form
      key={params.toString()}
      aria-label="Filter brands"
      className="bg-card grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_1.2fr_1.4fr_auto] lg:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="f-q">Search</Label>
        <Input
          id="f-q"
          name="q"
          type="search"
          maxLength={100}
          defaultValue={params.get("q") ?? ""}
          placeholder="Brand or industry"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-industry">Industry</Label>
        <select
          id="f-industry"
          name="industry"
          defaultValue={params.get("industry") ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">All industries</option>
          {industries.map((i) => (
            <option key={i.slug} value={i.slug}>
              {i.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-min">Min score</Label>
        <Input
          id="f-min"
          name="minScore"
          type="number"
          min={0}
          max={100}
          inputMode="numeric"
          defaultValue={params.get("minScore") ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-max">Max score</Label>
        <Input
          id="f-max"
          name="maxScore"
          type="number"
          min={0}
          max={100}
          inputMode="numeric"
          defaultValue={params.get("maxScore") ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-risk">Avg. claim risk</Label>
        <select
          id="f-risk"
          name="risk"
          defaultValue={params.get("risk") ?? ""}
          className={SELECT_CLASS}
        >
          <option value="">Any</option>
          <option value="LOW">Low</option>
          <option value="MODERATE">Moderate</option>
          <option value="HIGH">High</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="f-sort">Sort by</Label>
        <select
          id="f-sort"
          name="sort"
          defaultValue={params.get("sort") ?? "score_desc"}
          className={SELECT_CLASS}
        >
          <option value="score_desc">Highest transparency score</option>
          <option value="score_asc">Lowest transparency score</option>
          <option value="reviewed_desc">Newest review</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Applying…" : "Apply"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => startTransition(() => router.push(pathname))}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
