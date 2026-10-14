"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { SECTORS } from "@/data/esg/companies";
import { formatEsg } from "@/lib/esg/scoring";
import type { EsgCompanyRow } from "@/lib/esg/service";
import { useLocale, useT } from "@/lib/i18n/client";
import { pick } from "@/lib/i18n/shared";
import { CompanyLogo } from "./company-logo";

/** Accessible combobox: type a company, pick with arrows + Enter, go to its page. */
export function HeroSearch({ rows }: { rows: EsgCompanyRow[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return rows.filter((r) => r.name.toLowerCase().includes(s)).slice(0, 6);
  }, [q, rows]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/companies/${slug}`);
  }

  return (
    <div className="relative max-w-xl">
      <label htmlFor={`${id}-input`} className="sr-only">
        {t("Tìm một công ty", "Find a company")}
      </label>
      <div className="bg-on-forest text-forest focus-within:ring-mint flex items-center gap-3 rounded-xl px-4 py-1 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)] focus-within:ring-2">
        <SearchIcon className="size-5 shrink-0 opacity-60" aria-hidden="true" />
        <input
          id={`${id}-input`}
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={`${id}-list`}
          aria-activedescendant={open && matches[active] ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && matches[active]) {
              e.preventDefault();
              go(matches[active].slug);
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={t("Tìm Vinamilk, H&M, Apple…", "Try Vinamilk, H&M, Apple…")}
          className="placeholder:text-forest/50 min-w-0 flex-1 bg-transparent py-3 text-base outline-none"
        />
      </div>
      {open && matches.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="bg-popover text-popover-foreground absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border p-1 shadow-xl"
        >
          {matches.map((m, i) => (
            <li
              key={m.slug}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(m.slug)}
              onMouseEnter={() => setActive(i)}
              className="aria-selected:bg-muted flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2"
            >
              <CompanyLogo name={m.name} domain={m.logoDomain} size={30} />
              <span className="flex-1">
                <span className="block font-medium">{m.name}</span>
                <span className="text-muted-foreground text-xs">
                  {pick(
                    locale,
                    SECTORS.find((s) => s.key === m.sector)!,
                  )}
                </span>
              </span>
              <span className="tabular font-serif text-lg font-semibold">
                {formatEsg(m.overall)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
