import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false },
};

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/certifications", label: "Certifications" },
  { href: "/admin/targets", label: "Targets" },
  { href: "/admin/audits", label: "Accessibility audits" },
  { href: "/admin/methodology", label: "Methodology" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  return (
    <div className="bg-muted/30 border-b">
      <Container className="grid gap-8 py-8 lg:grid-cols-[13rem_1fr]">
        <aside className="space-y-4">
          <div className="bg-card rounded-lg border p-3 text-xs">
            <p className="font-semibold">Signed in</p>
            <p className="text-muted-foreground truncate">{session.email}</p>
            {session.method === "dev" && <p className="text-notice mt-1">Development login</p>}
            <form action={logoutAction} className="mt-2">
              <Button type="submit" variant="outline" size="xs">
                Sign out
              </Button>
            </form>
          </div>
          <nav aria-label="Admin">
            <ul className="flex flex-wrap gap-1 lg:flex-col">
              {ADMIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:bg-card block rounded-md px-3 py-1.5 text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="min-w-0 space-y-6">{children}</div>
      </Container>
    </div>
  );
}
