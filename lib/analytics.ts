"use client";

/**
 * Provider-agnostic analytics. No backend required.
 *
 * NEXT_PUBLIC_ANALYTICS_PROVIDER:
 *   (unset) | "none"  → events are dropped
 *   "console"         → events are logged (handy in development)
 *   "gtag"            → window.gtag('event', …)   (add the GA4 snippet yourself)
 *   "plausible"       → window.plausible(name, { props })
 *
 * To add another provider, extend `send` below. Call sites never change.
 */
export type AnalyticsEvent =
  | "state_selected"
  | "practice_started"
  | "practice_completed"
  | "mock_test_started"
  | "mock_test_completed"
  | "question_answered"
  | "road_sign_practice"
  | "returning_user";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (name: string, opts?: { props?: Props }) => void;
  }
}

const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? (process.env.NEXT_PUBLIC_GA4_ID ? "gtag" : "none");

function send(event: AnalyticsEvent, props: Props) {
  if (typeof window === "undefined") return;
  switch (provider) {
    case "console":
      console.info("[analytics]", event, props);
      break;
    case "gtag":
      window.gtag?.("event", event, props);
      break;
    case "plausible":
      window.plausible?.(event, { props });
      break;
    default:
      break;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}) {
  try {
    send(event, props);
  } catch {
    /* analytics must never break the app */
  }
}
