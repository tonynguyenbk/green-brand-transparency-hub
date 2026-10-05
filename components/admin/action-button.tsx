"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/admin/actions";

/** Button that runs a bound server action, with optional confirmation and redirect. */
export function ActionButton({
  action,
  children,
  confirm,
  redirectTo,
  variant = "outline",
  size = "sm",
  testId,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  confirm?: string;
  redirectTo?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  testId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      data-testid={testId}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          const result = await action();
          if (result.ok) {
            toast.success(result.message ?? "Done.");
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          } else {
            toast.error(result.error);
          }
        });
      }}
    >
      {pending && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
}
