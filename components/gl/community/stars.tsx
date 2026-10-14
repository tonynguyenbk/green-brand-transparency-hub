import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star row; `value` may be fractional (partial fill on the last star). */
export function Stars({
  value,
  size = 20,
  className,
}: {
  value: number | null;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = value === null ? 0 : Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <StarIcon
              className="text-border absolute inset-0 fill-current"
              style={{ width: size, height: size }}
            />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarIcon
                className="fill-current text-[var(--band-2)]"
                style={{ width: size, height: size }}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
