import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { DEV_SESSION_COOKIE, getAuthMode } from "./config";
import { verifyDevSessionToken } from "./dev-session";
import { createSupabaseServerClient } from "./supabase-server";

export interface AdminSession {
  email: string;
  method: "supabase" | "dev";
}

/** E-mail allowlist: ADMIN_EMAILS env var plus AdminUser rows. */
async function isAllowedAdmin(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv.includes(normalized)) return true;
  const row = await prisma.adminUser.findUnique({ where: { email: normalized } });
  return Boolean(row);
}

/**
 * Server-side authorisation check. This — not the proxy — is the security
 * boundary: every admin page, server action and write API calls it.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const mode = getAuthMode();
  if (mode === "supabase") {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return null;
    return (await isAllowedAdmin(data.user.email))
      ? { email: data.user.email, method: "supabase" }
      : null;
  }
  if (mode === "dev") {
    const token = (await cookies()).get(DEV_SESSION_COOKIE)?.value;
    return verifyDevSessionToken(token) ? { email: "dev-admin@localhost", method: "dev" } : null;
  }
  return null;
}

/** For admin pages and server actions: redirect to login when unauthenticated. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For route handlers: returns a 401 response when unauthenticated. */
export async function authorizeApi(): Promise<
  { session: AdminSession } | { response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  return { session };
}
