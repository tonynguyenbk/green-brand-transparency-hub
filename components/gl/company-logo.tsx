"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Self-hosted logos for domains whose favicon is missing or unusable. */
const LOCAL_LOGOS: Record<string, string> = {
  "viettien.com.vn": "/logos/viet-tien.png",
  "thmilk.vn": "/logos/th-true-milk.jpg",
};

/**
 * Company logo: a self-hosted file when we have one, otherwise the brand's own
 * domain favicon (Google's favicon service), falling back to a monogram.
 */
export function CompanyLogo({
  name,
  domain,
  size = 40,
  className,
}: {
  name: string;
  domain: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[28%] bg-white ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {domain && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            LOCAL_LOGOS[domain] ??
            `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
          }
          alt=""
          width={size}
          height={size}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            // Google returns a 16px globe when no icon exists.
            if (e.currentTarget.naturalWidth <= 16) setFailed(true);
          }}
          className="size-[72%] object-contain"
        />
      ) : (
        <span className="font-serif font-semibold text-[#10231c]" style={{ fontSize: size * 0.38 }}>
          {initials}
        </span>
      )}
    </span>
  );
}
