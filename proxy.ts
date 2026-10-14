import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const hasSupabaseCookie = (request: NextRequest) =>
  request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

/**
 * Runs before every page:
 *
 * 1. Refreshes the Supabase session cookie (Server Components cannot write
 *    cookies, so an expired access token is renewed here).
 * 2. Optimistic gate for /admin: visitors without any session cookie go to
 *    the login page. A UX convenience only — real authorisation is enforced
 *    server-side in lib/auth/session.ts on every admin page, action and API.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey && hasSupabaseCookie(request)) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet)
            response.cookies.set(name, value, options);
        },
      },
    });
    await supabase.auth.getUser();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = hasSupabaseCookie(request) || request.cookies.has("gbth_dev_admin");
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|logos/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
