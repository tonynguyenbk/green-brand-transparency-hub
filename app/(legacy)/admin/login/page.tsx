import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Container } from "@/components/layout/page-header";
import { getAuthMode } from "@/lib/auth/config";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  const mode = getAuthMode();
  return (
    <Container className="py-16">
      <div className="bg-card mx-auto max-w-sm space-y-6 rounded-xl border p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Admin sign-in</h1>
          <p className="text-muted-foreground text-sm">
            Only administrators need an account. Public pages never require login.
          </p>
        </div>
        {mode === "disabled" ? (
          <p role="alert" className="bg-risk-moderate-bg text-risk-moderate rounded-md p-3 text-sm">
            Admin authentication is not configured. Set the Supabase variables, or
            DEV_ADMIN_PASSWORD and DEV_AUTH_SECRET for local development (see docs/development.md).
          </p>
        ) : (
          <LoginForm mode={mode} />
        )}
      </div>
    </Container>
  );
}
