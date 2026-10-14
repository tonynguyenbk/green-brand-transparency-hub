import { SiteFooter, SiteHeader } from "@/components/gl/site-chrome";

/** Transparency tools, research study and admin keep the light header. */
export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
