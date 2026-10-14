"use client";

import { ArrowDownIcon, ArrowUpRightIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SECTORS, type SectorKey } from "@/data/esg/companies";
import { formatEsg } from "@/lib/esg/scoring";
import type { EsgCompanyRow } from "@/lib/esg/service";
import { useLocale, useT } from "@/lib/i18n/client";
import { pick } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "./company-logo";
import { BandPill, PillarBars } from "./score-parts";

type SortKey = "overall" | "e" | "s" | "g" | "name";

export function Rankings({ rows }: { rows: EsgCompanyRow[] }) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [sector, setSector] = useState<SectorKey | "all">("all");
  const [sort, setSort] = useState<SortKey>("overall");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter(
      (r) => (sector === "all" || r.sector === sector) && (!q || r.name.toLowerCase().includes(q)),
    );
    return filtered.sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : (b[sort] as number) - (a[sort] as number) || b.overall - a.overall,
    );
  }, [rows, sector, sort, query]);

  const sectorName = (k: SectorKey) =>
    pick(
      locale,
      SECTORS.find((s) => s.key === k)!,
    );
  const sortOptions: { k: SortKey; label: string }[] = [
    { k: "overall", label: t("Điểm ESG", "ESG score") },
    { k: "e", label: t("Môi trường (E)", "Environmental (E)") },
    { k: "s", label: t("Xã hội (S)", "Social (S)") },
    { k: "g", label: t("Quản trị (G)", "Governance (G)") },
    { k: "name", label: t("Tên A–Z", "Name A–Z") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label={t("Lọc theo ngành", "Filter by sector")}
        >
          {(["all", ...SECTORS.map((s) => s.key)] as const).map((k) => {
            const count = k === "all" ? rows.length : rows.filter((r) => r.sector === k).length;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={sector === k}
                onClick={() => setSector(k)}
                className="bg-card hover:border-foreground/30 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors"
              >
                {k === "all" ? t("Tất cả", "All") : sectorName(k)}
                <span className="tabular text-xs opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <label className="bg-card focus-within:ring-ring flex min-h-9 flex-1 items-center gap-2 rounded-lg border px-3 focus-within:ring-2 lg:w-56 lg:flex-none">
            <SearchIcon className="text-muted-foreground size-4" aria-hidden="true" />
            <span className="sr-only">{t("Tìm công ty", "Search companies")}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Tìm công ty…", "Search companies…")}
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <label className="bg-card flex min-h-9 items-center gap-2 rounded-lg border px-3 text-sm">
            <span className="text-muted-foreground">{t("Xếp theo", "Sort")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer bg-transparent font-medium outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.k} value={o.k}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-card overflow-hidden rounded-2xl border shadow-[0_1px_0_rgb(0_0_0/0.02),0_12px_32px_-24px_rgb(13_42_31/0.35)]">
        <table className="w-full text-sm">
          <caption className="sr-only">{t("Bảng xếp hạng ESG", "ESG rankings")}</caption>
          <thead className="bg-muted/60 text-muted-foreground hidden border-b text-left text-xs md:table-header-group">
            <tr>
              <th scope="col" className="w-14 py-3 pl-5 font-medium">
                #
              </th>
              <th scope="col" className="py-3 font-medium">
                {t("Công ty", "Company")}
              </th>
              <th scope="col" className="py-3 font-medium">
                <span className="inline-flex items-center gap-1">
                  {sortOptions.find((o) => o.k === sort)?.label}
                  {sort !== "name" && <ArrowDownIcon className="size-3" aria-hidden="true" />}
                </span>
              </th>
              <th scope="col" className="w-52 py-3 font-medium">
                E · S · G
              </th>
              <th scope="col" className="w-24 py-3 pr-5 text-right font-medium">
                {t("Nguồn", "Sources")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted-foreground px-5 py-14 text-center">
                  {t(
                    "Không có công ty nào khớp. Thử tên khác hoặc chọn “Tất cả”.",
                    "No company matches. Try another name or choose “All”.",
                  )}
                </td>
              </tr>
            )}
            {list.map((r, i) => {
              const shown = sort === "overall" || sort === "name" ? r.overall : r[sort];
              return (
                <tr
                  key={r.slug}
                  onClick={() => router.push(`/companies/${r.slug}`)}
                  className="group hover:bg-muted/50 grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-4 transition-colors md:table-row md:p-0"
                >
                  <td className="tabular text-muted-foreground w-8 text-sm md:py-4 md:pl-5">
                    {i + 1}
                  </td>
                  <td className="min-w-0 md:py-4">
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={r.name} domain={r.logoDomain} size={40} />
                      <div className="min-w-0">
                        <Link
                          href={`/companies/${r.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block truncate font-serif text-[1.08rem] font-semibold underline-offset-4 group-hover:underline"
                        >
                          {r.name}
                        </Link>
                        <p className="text-muted-foreground truncate text-xs">
                          {sectorName(r.sector)} · {r.country}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="md:py-4">
                    <div className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-3">
                      <span className="tabular font-serif text-2xl leading-none font-semibold">
                        {formatEsg(shown)}
                      </span>
                      <BandPill
                        score={r.overall}
                        locale={locale}
                        className={cn(
                          sort !== "overall" && sort !== "name" && "hidden md:inline-flex",
                        )}
                      />
                    </div>
                  </td>
                  <td className="col-span-3 md:col-span-1 md:py-4">
                    <PillarBars
                      e={r.e}
                      s={r.s}
                      g={r.g}
                      className="max-w-xs md:max-w-none md:pr-6"
                    />
                  </td>
                  <td className="hidden text-right md:table-cell md:py-4 md:pr-5">
                    <span className="tabular text-muted-foreground inline-flex items-center gap-1">
                      {r.sourceCount}
                      <ArrowUpRightIcon
                        className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
