import { cn } from "@/lib/utils";

/** Member photo, falling back to their initial (or "?" for anonymous members). */
export function MemberAvatar({
  name,
  src,
  size = 28,
  className,
}: {
  name: string | null;
  src: string | null;
  size?: number;
  className?: string;
}) {
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-primary text-primary-foreground grid shrink-0 place-items-center rounded-full font-bold",
        !name && "bg-muted text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.4) }}
    >
      {name ? name.trim().charAt(0).toUpperCase() : "?"}
    </span>
  );
}
