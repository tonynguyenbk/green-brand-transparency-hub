import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for /admin: redirects visitors without any session cookie
 * to the login page. It is a UX convenience only — real authorisation is
 * enforced server-side in lib/auth/session.ts on every admin page, server
 * action and write API.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = request.cookies
    .getAll()
    .some(
      (c) =>
        c.name === "gbth_dev_admin" || (c.name.startsWith("sb-") && c.name.includes("auth-token")),
    );

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
