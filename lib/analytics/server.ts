import type { AnalyticsEvent, AnalyticsProvider } from "./events";

/** Default server provider: structured log line. Replace with a real sink later. */
const consoleProvider: AnalyticsProvider = {
  name: "console",
  capture(event) {
    console.info(
      `[analytics] ${event.timestamp} ${event.name} ${JSON.stringify(event.properties ?? {})}`,
    );
  },
};

export function getServerAnalyticsProvider(): AnalyticsProvider {
  return consoleProvider;
}

export async function captureServerEvent(event: AnalyticsEvent) {
  await getServerAnalyticsProvider().capture(event);
}
