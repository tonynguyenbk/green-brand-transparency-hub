"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation/schemas";
import { DEV_SESSION_COOKIE, DEV_SESSION_MAX_AGE_SECONDS, getAuthMode } from "./config";
import { createDevSessionToken, verifyDevPassword } from "./dev-session";
import { createSupabaseServerClient } from "./supabase-server";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { error: "Enter your credentials." };

  const mode = getAuthMode();
  if (mode === "supabase") {
    if (!parsed.data.email) return { error: "E-mail is required." };
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    // Generic message: do not reveal whether the account exists.
    if (error) return { error: "Sign-in failed. Check your e-mail and password." };
  } else if (mode === "dev") {
    if (!verifyDevPassword(parsed.data.password))
      return { error: "Incorrect development password." };
    (await cookies()).set(DEV_SESSION_COOKIE, createDevSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: DEV_SESSION_MAX_AGE_SECONDS,
    });
  } else {
    return { error: "Admin authentication is not configured. See docs/development.md." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  if (getAuthMode() === "supabase") {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  (await cookies()).delete(DEV_SESSION_COOKIE);
  redirect("/admin/login");
}
