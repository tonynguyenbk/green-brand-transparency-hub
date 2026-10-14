"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, tr, type Locale } from "./shared";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** `const t = useT(); t("Xin chào", "Hello")` */
export function useT() {
  const locale = useLocale();
  return (vi: string, en: string) => tr(locale, vi, en);
}
