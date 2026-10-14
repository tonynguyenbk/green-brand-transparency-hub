import { SiteFooter } from "@/components/gl/site-chrome";

/** Greenlens pages render their own header inside a forest hero band. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
