"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/client";
import type { AnalyticsEventName, AnalyticsProperties } from "@/lib/analytics/events";

/** Fires one analytics event when mounted (e.g. page views). Renders nothing. */
export function TrackEvent({
  name,
  properties,
}: {
  name: AnalyticsEventName;
  properties?: AnalyticsProperties;
}) {
  const key = JSON.stringify(properties ?? {});
  useEffect(() => {
    track(name, JSON.parse(key) as AnalyticsProperties);
  }, [name, key]);
  return null;
}
