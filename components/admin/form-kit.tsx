"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  useForm,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

export const SELECT_CLASS =
  "h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

/**
 * React Hook Form wired to a Zod schema (client-side convenience) and a
 * server action (which re-validates on the server). Field values are kept
 * as strings/booleans; the shared schema coerces them.
 */
export function useAdminForm<T extends FieldValues>({
  schema,
  defaultValues,
  submit,
  redirectTo,
}: {
  schema: z.ZodType;
  defaultValues: T;
  submit: (values: T) => Promise<ActionResult>;
  redirectTo?: (id?: string) => string | undefined;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<T>({
    // Resolver validates with the shared schema but we submit the raw string values,
    // which the server action parses again.
    resolver: zodResolver(schema as never) as unknown as Resolver<T>,
    defaultValues: defaultValues as never,
  });

  const onSubmit = form.handleSubmit(() => {
    const values = form.getValues();
    startTransition(async () => {
      const result = await submit(values);
      if (result.ok) {
        toast.success(result.message ?? "Saved.");
        const to = redirectTo?.(result.id);
        if (to) router.push(to);
        else router.refresh();
      } else {
        toast.error(result.error);
        for (const [field, message] of Object.entries(result.fields ?? {})) {
          form.setError(field as Path<T>, { message });
        }
      }
    });
  });

  return { form, onSubmit, pending };
}

type FieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  hint?: string;
  className?: string;
};

function FieldShell<T extends FieldValues>({
  form,
  name,
  label,
  hint,
  className,
  children,
}: FieldProps<T> & {
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
}) {
  const error = form.formState.errors[name]?.message as string | undefined;
  const id = `f-${String(name)}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextField<T extends FieldValues>(
  props: FieldProps<T> & { type?: string; placeholder?: string; step?: string },
) {
  return (
    <FieldShell {...props}>
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          type={props.type ?? "text"}
          step={props.step}
          placeholder={props.placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...props.form.register(props.name)}
        />
      )}
    </FieldShell>
  );
}

export function TextAreaField<T extends FieldValues>(props: FieldProps<T> & { rows?: number }) {
  return (
    <FieldShell {...props}>
      {({ id, describedBy, invalid }) => (
        <Textarea
          id={id}
          rows={props.rows ?? 3}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...props.form.register(props.name)}
        />
      )}
    </FieldShell>
  );
}

export function SelectField<T extends FieldValues>(
  props: FieldProps<T> & { options: { value: string; label: string }[]; emptyLabel?: string },
) {
  return (
    <FieldShell {...props}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          className={SELECT_CLASS}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...props.form.register(props.name)}
        >
          {props.emptyLabel !== undefined && <option value="">{props.emptyLabel}</option>}
          {props.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function CheckboxField<T extends FieldValues>(props: FieldProps<T>) {
  const id = `f-${String(props.name)}`;
  return (
    <div className={cn("flex items-start gap-2 pt-6", props.className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 accent-[var(--primary)]"
        {...props.form.register(props.name)}
      />
      <div>
        <Label htmlFor={id}>{props.label}</Label>
        {props.hint && <p className="text-muted-foreground text-xs">{props.hint}</p>}
      </div>
    </div>
  );
}

/** 0–5 rubric select; empty = not yet assessed (never coerced to 0). */
export function RubricField<T extends FieldValues>(props: FieldProps<T> & { max?: number }) {
  const max = props.max ?? 5;
  return (
    <SelectField
      {...props}
      emptyLabel="Not assessed"
      options={Array.from({ length: max + 1 }, (_, i) => ({
        value: String(i),
        label: `${i} / ${max}`,
      }))}
    />
  );
}

export function SubmitBar({
  pending,
  label = "Save",
  children,
}: {
  pending: boolean;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t pt-5">
      <Button type="submit" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" />}
        {label}
      </Button>
      {children}
    </div>
  );
}

export function FormGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

export function enumOptions(values: readonly string[], humanize: (v: string) => string) {
  return values.map((v) => ({ value: v, label: humanize(v) }));
}
