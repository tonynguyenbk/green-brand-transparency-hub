import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 border-b pb-8", className)}>
      {eyebrow && (
        <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">{eyebrow}</p>
      )}
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      {description && (
        <div className="text-muted-foreground max-w-3xl text-base sm:text-lg">{description}</div>
      )}
      {children}
    </div>
  );
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Section({
  id,
  title,
  description,
  children,
  className,
  actions,
}: {
  id?: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 space-y-5", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <h2 id={headingId} className="text-2xl font-semibold">
            {title}
          </h2>
          {description && (
            <div className="text-muted-foreground max-w-3xl text-sm">{description}</div>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
