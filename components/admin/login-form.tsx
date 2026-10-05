"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/lib/auth/actions";

export function LoginForm({ mode }: { mode: "supabase" | "dev" }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={formAction} className="space-y-4">
      {mode === "dev" && (
        <p className="bg-notice-bg text-notice rounded-md p-3 text-xs">
          Development mode: Supabase is not configured, so a local development password is used.
        </p>
      )}
      {mode === "supabase" && (
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="username" required />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">{mode === "dev" ? "Development password" : "Password"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
