"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Hamburger menu that replaces the main nav below the lg breakpoint. */
export function MobileNav({
  items,
  label,
  onDark,
}: {
  items: { href: string; label: string }[];
  label: string;
  onDark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={label}
        className={cn(
          "grid size-9 place-items-center rounded-lg border lg:hidden",
          onDark ? "text-on-forest border-white/20 hover:bg-white/10" : "hover:bg-muted",
        )}
      >
        <MenuIcon className="size-4" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>{label}</SheetTitle>
        </SheetHeader>
        <nav aria-label={label} className="px-4">
          <ul className="space-y-1">
            {items.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="hover:bg-muted block rounded-lg px-3 py-2.5 font-medium"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
