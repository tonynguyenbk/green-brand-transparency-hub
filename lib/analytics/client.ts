import type { AnalyticsEventName, AnalyticsProperties, AnalyticsProvider } from "./events";

/** Browser-side provider: logs locally and forwards to /api/analytics (server log). */
const beaconProvider: AnalyticsProvider = {
  name: "beacon",
  capture(event) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[analytics]", event.name, event.properties ?? {});
    }
    try {
      const body = JSON.stringify({ name: event.name, properties: event.properties });
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
      }
    } catch {
      // Analytics must never break the UI.
    }
  },
};

let provider: AnalyticsProvider = beaconProvider;

/** Swap the provider (e.g. a PostHog adapter) at app start-up. */
export function setAnalyticsProvider(next: AnalyticsProvider) {
  provider = next;
}

export function track(name: AnalyticsEventName, properties?: AnalyticsProperties) {
  if (typeof window === "undefined") return;
  void provider.capture({ name, properties, timestamp: new Date().toISOString() });
}
