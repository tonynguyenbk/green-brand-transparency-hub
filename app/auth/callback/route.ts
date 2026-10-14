import { NextResponse } from "next/server";
import { getMemberAuthMode, safeNextPath, upsertSupabaseMember } from "@/lib/auth/member";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

/** OAuth return point: exchange the code for a session, then go back to `next`. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");

  if (getMemberAuthMode() === "supabase" && code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await upsertSupabaseMember(data.user);
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  const back = new URL("/login", url.origin);
  back.searchParams.set("error", "oauth");
  back.searchParams.set("next", next);
  return NextResponse.redirect(back);
}
