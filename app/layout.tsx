import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Newsreader } from "next/font/google";
import { THEME_BOOT_SCRIPT } from "@/components/gl/preferences";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Greenlens — ESG ratings built from the news", template: "%s · Greenlens" },
  description:
    "An ESG database of 27 companies scored from news coverage and company disclosures, with every score linked to its sources.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d2a1f" },
    { media: "(prefers-color-scheme: dark)", color: "#07170f" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      data-theme="light"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
