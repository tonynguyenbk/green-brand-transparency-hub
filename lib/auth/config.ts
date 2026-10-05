/**
 * Authentication mode selection.
 *
 * - "supabase": NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
 *   Admins sign in with Supabase Auth and must be on the allowlist
 *   (ADMIN_EMAILS or an AdminUser row).
 * - "dev": Supabase is not configured, DEV_ADMIN_PASSWORD and DEV_AUTH_SECRET
 *   are set, and either NODE_ENV !== "production" or ALLOW_DEV_AUTH=true.
 *   Intended only for local development and automated tests.
 * - "disabled": neither is available — admin is inaccessible.
 */
export type AuthMode = "supabase" | "dev" | "disabled";

export const DEV_SESSION_COOKIE = "gbth_dev_admin";
export const DEV_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isDevAuthEnabled(): boolean {
  if (isSupabaseConfigured()) return false;
  const secret = process.env.DEV_AUTH_SECRET ?? "";
  if (!process.env.DEV_ADMIN_PASSWORD || secret.length < 32) return false;
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_AUTH === "true";
}

export function getAuthMode(): AuthMode {
  if (isSupabaseConfigured()) return "supabase";
  if (isDevAuthEnabled()) return "dev";
  return "disabled";
}
