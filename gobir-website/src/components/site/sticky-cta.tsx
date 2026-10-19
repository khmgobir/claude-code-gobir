"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";

/**
 * Sticky mobile call-to-action. Appears on small screens once the visitor has
 * scrolled past the hero, and hides when the booking section is on screen so it
 * never covers the form.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);
  const [consentDone, setConsentDone] = useState(true);

  useEffect(() => {
    // Hold the CTA back while the cookie notice is still on screen so the two
    // bottom bars never overlap on mobile.
    try {
      setConsentDone(!!localStorage.getItem("gobir-consent"));
    } catch {
      setConsentDone(true);
    }
    const onConsent = () => setConsentDone(true);
    window.addEventListener("gobir-consent-set", onConsent);

    const book = document.getElementById("book");
    function onScroll() {
      const scrolledEnough = window.scrollY > 500;
      let bookingVisible = false;
      if (book) {
        const r = book.getBoundingClientRect();
        bookingVisible = r.top < window.innerHeight && r.bottom > 0;
      }
      setShow(scrolledEnough && !bookingVisible);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("gobir-consent-set", onConsent);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 p-3 transition-all duration-300 sm:hidden ${
        show && consentDone
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="#book"
        className="flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3.5 text-sm font-bold text-white shadow-soft"
      >
        <CalendarCheck className="h-4.5 w-4.5" />
        Book a session
      </a>
    </div>
  );
}
