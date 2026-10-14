export type Locale = "vi" | "en";

export const LOCALE_COOKIE = "gl_lang";
export const DEFAULT_LOCALE: Locale = "vi";

export function isLocale(value: unknown): value is Locale {
  return value === "vi" || value === "en";
}

/** Pick the string for the active locale: `tr(locale, "Xin chào", "Hello")`. */
export function tr(locale: Locale, vi: string, en: string): string {
  return locale === "en" ? en : vi;
}

export function pick<T extends { vi: string; en: string }>(locale: Locale, value: T): string {
  return locale === "en" ? value.en : value.vi;
}

const dateFmt = {
  vi: new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  en: new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
};

export function formatDateL(locale: Locale, value: Date | string): string {
  return dateFmt[locale].format(typeof value === "string" ? new Date(value) : value);
}
