import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";
import { MemberMenu } from "./member-menu";
import { MobileNav } from "./mobile-nav";
import { LanguageSwitch, ThemeSwitch } from "./preferences";

export function Wordmark({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 rounded-md", className)}
      aria-label="Greenlens"
    >
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path
          d="M7.5 15.2c.6-4.4 3.3-7.1 8.2-7.6-.3 4.8-3 7.5-8.2 7.6z"
          fill={onDark ? "var(--mint)" : "var(--primary)"}
        />
        <path d="M19 19l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-[1.35rem] leading-none font-semibold tracking-tight">
        greenlens
      </span>
    </Link>
  );
}

export async function SiteHeader({ variant = "light" }: { variant?: "light" | "forest" }) {
  const locale = await getLocale();
  const onDark = variant === "forest";
  const nav = [
    { href: "/#rankings", label: tr(locale, "Xếp hạng công ty", "Company rankings") },
    { href: "/news", label: tr(locale, "Tin tức", "News") },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/how-we-score", label: tr(locale, "Cách chấm điểm", "How we score") },
  ];
  return (
    <header
      className={cn(
        "relative z-30",
        onDark
          ? "text-on-forest"
          : "bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 border-b backdrop-blur",
      )}
    >
      <a
        href="#main"
        className="focus:bg-card focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-md focus:px-3 focus:py-2"
      >
        {tr(locale, "Bỏ qua đến nội dung", "Skip to content")}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Wordmark onDark={onDark} />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-1 text-sm font-medium">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={cn(
                    "rounded-md px-3 py-2 transition-colors",
                    onDark
                      ? "text-on-forest-2 hover:text-on-forest"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitch onDark={onDark} />
          <ThemeSwitch onDark={onDark} className="hidden sm:inline-flex" />
          <MemberMenu locale={locale} onDark={onDark} />
          <MobileNav items={nav} label={tr(locale, "Menu", "Menu")} onDark={onDark} />
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const locale = await getLocale();
  return (
    <footer className="bg-card mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="space-y-4">
          <Wordmark />
          <p className="text-muted-foreground max-w-md text-sm">
            {tr(
              locale,
              "Cơ sở dữ liệu ESG dựng từ báo chí và công bố doanh nghiệp. Mỗi điểm số đều dẫn về nguồn gốc của nó.",
              "An ESG database built from news coverage and company disclosures. Every score links back to its sources.",
            )}
          </p>
          <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
            {tr(
              locale,
              "Điểm số là ước tính phân tích của nhóm nghiên cứu, không phải xếp hạng chính thức của MSCI, Sustainalytics hay S&P Global, và không phải lời khuyên đầu tư.",
              "Scores are the research team's analytical estimates, not official ratings from MSCI, Sustainalytics or S&P Global, and not investment advice.",
            )}
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow text-muted-foreground mb-3">{tr(locale, "Khám phá", "Explore")}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="hover:underline" href="/#rankings">
                {tr(locale, "Xếp hạng công ty", "Company rankings")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/#sectors">
                {tr(locale, "Theo ngành", "Sectors")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/news">
                {tr(locale, "Tin tức", "News")}
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/leaderboard">
                Leaderboard
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/how-we-score">
                {tr(locale, "Cách chấm điểm", "How we score")}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow text-muted-foreground mb-3">{tr(locale, "Dự án", "Project")}</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="hover:underline" href="/claim-checker">
                {tr(locale, "Kiểm tra tuyên bố xanh", "Green claim checker")}
              </Link>
            </li>
            <li>
              <a
                className="hover:underline"
                href="https://github.com/tonynguyenbk/green-brand-transparency-hub"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <Link className="hover:underline" href="/admin">
                Admin
              </Link>
            </li>
          </ul>
          <ThemeSwitch className="mt-5 sm:hidden" />
        </div>
      </div>
      <div className="border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-4 py-5 text-xs sm:px-6">
          © 2026 Greenlens · {tr(locale, "Dự án nghiên cứu học thuật", "Academic research project")}
        </p>
      </div>
    </footer>
  );
}
