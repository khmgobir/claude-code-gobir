"use client";

import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const KEY = "gobir-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Minimal, privacy-first cookie notice. Analytics stay denied (Consent Mode)
 * until the visitor accepts. The choice is remembered, and a custom event lets
 * the sticky mobile CTA know a decision was made so the two bars never overlap.
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* private mode, etc. */
    }
    if (stored === "granted") {
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    } else if (!stored) {
      setShow(true);
    }
  }, []);

  function decide(granted: boolean) {
    try {
      localStorage.setItem(KEY, granted ? "granted" : "denied");
    } catch {
      /* ignore */
    }
    if (granted) {
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
    window.dispatchEvent(new Event("gobir-consent-set"));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="rounded-2xl border bg-card/95 p-4 shadow-brand backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient-soft text-primary">
            <Cookie className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] leading-relaxed text-foreground/80">
              I use a few cookies to see which pages help people most. Nothing is
              sold or shared.{" "}
              <a
                href="/privacy/"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Learn more
              </a>
              .
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => decide(true)}
                className="flex-1 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]"
              >
                Accept
              </button>
              <button
                onClick={() => decide(false)}
                className="rounded-full border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
