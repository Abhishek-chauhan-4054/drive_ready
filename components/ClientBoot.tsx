"use client";

import { useEffect } from "react";
import { markVisit } from "@/lib/progress";
import { track } from "@/lib/analytics";

/** Registers the service worker (PWA install support) and fires the returning-user event. */
export function ClientBoot() {
  useEffect(() => {
    if (markVisit()) track("returning_user");
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is a progressive enhancement */
      });
    }
  }, []);
  return null;
}

/** Fires state_selected once when a state hub is viewed. */
export function TrackStateView({ code }: { code: string }) {
  useEffect(() => {
    track("state_selected", { state: code });
  }, [code]);
  return null;
}
