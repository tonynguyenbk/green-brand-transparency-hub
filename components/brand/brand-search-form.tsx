"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

/** Brand search that navigates to the directory (/brands?q=…). */
export function BrandSearchForm({
  defaultValue = "",
  size = "default",
  className,
}: {
  defaultValue?: string;
  size?: "default" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      role="search"
      className={cn("flex w-full gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim().slice(0, 100);
        track("brand_search", { query_length: query.length });
        router.push(query ? `/brands?q=${encodeURIComponent(query)}` : "/brands");
      }}
    >
      <label htmlFor="brand-search" className="sr-only">
        Search brands
      </label>
      <div className="relative flex-1">
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          id="brand-search"
          name="q"
          type="search"
          value={q}
          maxLength={100}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a brand, e.g. Verdant Wear"
          className={cn("bg-card pl-9", size === "lg" && "h-12 text-base")}
          autoComplete="off"
        />
      </div>
      <Button type="submit" className={cn(size === "lg" && "h-12 px-5")}>
        Search a brand
      </Button>
    </form>
  );
}
