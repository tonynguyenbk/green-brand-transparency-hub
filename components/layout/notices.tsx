import { FlaskConicalIcon, InfoIcon } from "lucide-react";
import { DISCLAIMER } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Visible notice whenever fictional development data is displayed. */
export function FictionalDataNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "border-notice/25 bg-notice-bg text-notice flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        className,
      )}
    >
      <FlaskConicalIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Development notice:</strong> the brands, claims, sources
        and certification bodies shown here are fictional sample data created to demonstrate the
        methodology. They do not describe any real company.
      </p>
    </div>
  );
}

export function FictionalBadge() {
  return (
    <span className="border-notice/30 bg-notice-bg text-notice inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium">
      <FlaskConicalIcon className="size-3" aria-hidden="true" />
      Fictional data
    </span>
  );
}

export function MethodologyDisclaimer({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Methodology disclaimer"
      className={cn(
        "bg-muted/60 flex items-start gap-3 rounded-lg border px-4 py-4 text-sm",
        className,
      )}
    >
      <InfoIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="text-muted-foreground space-y-1.5">
        <p className="text-foreground font-medium">{DISCLAIMER.short}</p>
        <p>{DISCLAIMER.long}</p>
      </div>
    </aside>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = InfoIcon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <Icon className="text-muted-foreground mb-3 size-6" />
      <p className="font-medium">{title}</p>
      {description && <p className="text-muted-foreground mt-1 max-w-md text-sm">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
