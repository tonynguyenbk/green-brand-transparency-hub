import Link from "next/link";
import { SITE } from "@/lib/site";

/** Wordmark: a leaf vein under inspection — "examining" green claims. */
export function Logo() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-md"
      aria-label={`${SITE.name} — home`}
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="7" className="fill-primary" />
        <path
          d="M9 21c0-6.5 4.5-11 12-12-0.4 7.6-4.8 12-11 12"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 22l6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.05rem] font-semibold tracking-tight">Green Brand</span>
        <span className="text-muted-foreground text-[0.68rem] font-medium tracking-[0.14em] uppercase">
          Transparency Hub
        </span>
      </span>
    </Link>
  );
}
