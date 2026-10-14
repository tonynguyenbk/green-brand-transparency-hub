"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, useTransition } from "react";
import { useLocale } from "@/lib/i18n/client";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils";

export const THEME_KEY = "gl_theme";
type ThemePref = "light" | "dark" | "system";

/** Runs in <head> before first paint so the page never flashes the wrong theme. */
export const THEME_BOOT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;

function applyTheme(pref: ThemePref) {
  const dark =
    pref === "dark" || (pref === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

// Tiny external store so the switch reads localStorage without hydration mismatches.
const themeListeners = new Set<() => void>();
function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}
function writeThemePref(p: ThemePref) {
  try {
    localStorage.setItem(THEME_KEY, p);
  } catch {}
  applyTheme(p);
  themeListeners.forEach((l) => l());
}
function subscribeTheme(l: () => void) {
  themeListeners.add(l);
  window.addEventListener("storage", l);
  return () => {
    themeListeners.delete(l);
    window.removeEventListener("storage", l);
  };
}

function setLocaleCookie(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = next;
}

const segBase =
  "inline-flex items-center rounded-lg border bg-card p-0.5 text-[13px] font-semibold text-muted-foreground";
const segBtn =
  "grid min-h-8 min-w-8 cursor-pointer place-items-center rounded-md px-2 transition-colors hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background";

export function ThemeSwitch({ className, onDark }: { className?: string; onDark?: boolean }) {
  const pref = useSyncExternalStore(subscribeTheme, readThemePref, () => "system" as ThemePref);
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemePref() === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const choose = writeThemePref;

  const items: { p: ThemePref; label: string; icon: React.ReactNode }[] = [
    { p: "light", label: "Light", icon: <SunIcon className="size-4" /> },
    { p: "system", label: "System", icon: <MonitorIcon className="size-4" /> },
    { p: "dark", label: "Dark", icon: <MoonIcon className="size-4" /> },
  ];
  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(segBase, onDark && "text-on-forest-2 border-white/15 bg-white/5", className)}
    >
      {items.map((i) => (
        <button
          key={i.p}
          type="button"
          aria-pressed={pref === i.p}
          aria-label={i.label}
          title={i.label}
          onClick={() => choose(i.p)}
          className={cn(
            segBtn,
            onDark && "hover:text-on-forest aria-pressed:bg-on-forest aria-pressed:text-forest",
          )}
        >
          {i.icon}
        </button>
      ))}
    </div>
  );
}

export function LanguageSwitch({ className, onDark }: { className?: string; onDark?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label="Language / Ngôn ngữ"
      aria-busy={pending}
      className={cn(segBase, onDark && "text-on-forest-2 border-white/15 bg-white/5", className)}
    >
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          lang={l}
          onClick={() => choose(l)}
          className={cn(
            segBtn,
            "px-2.5",
            onDark && "hover:text-on-forest aria-pressed:bg-on-forest aria-pressed:text-forest",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
