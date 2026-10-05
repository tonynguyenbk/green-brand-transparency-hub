import Link from "next/link";
import { DISCLAIMER, NAV_ITEMS, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-card mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-serif text-lg font-semibold">{SITE.name}</p>
          <p className="text-muted-foreground max-w-md text-sm">{SITE.subtitle}</p>
          <p className="text-muted-foreground max-w-xl text-xs leading-relaxed">
            {DISCLAIMER.short} {DISCLAIMER.long}
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Explore
          </p>
          <ul className="space-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link className="hover:underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Project
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="hover:underline" href="/methodology#limitations">
                Limitations
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/methodology#corrections">
                Corrections
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/admin">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="text-muted-foreground mx-auto max-w-6xl px-4 py-4 text-xs sm:px-6">
          Academic portfolio project. Brand data shown in development is fictional.
        </p>
      </div>
    </footer>
  );
}
