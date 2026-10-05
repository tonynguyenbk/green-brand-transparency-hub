/** Product analytics events. Keep in sync with analyticsEventSchema. */
export const ANALYTICS_EVENTS = [
  "brand_search",
  "brand_view",
  "claim_expand",
  "evidence_view",
  "evidence_click",
  "compare_brand",
  "claim_checker_submit",
  "methodology_view",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
export type AnalyticsProperties = Record<string, string | number | boolean | null>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties?: AnalyticsProperties;
  timestamp: string;
}

/**
 * Provider abstraction. The MVP ships a console provider; a PostHog (or
 * similar) provider can implement the same interface later without touching
 * call sites. Never send personal data — properties should be IDs/slugs only.
 */
export interface AnalyticsProvider {
  name: string;
  capture(event: AnalyticsEvent): void | Promise<void>;
}
