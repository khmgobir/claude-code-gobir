"use client";

import { ArrowRight, Clock3, MessageCircle, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { naira, SOLO_PRICE, GROUP_PRICE, WHATSAPP_LINK } from "@/lib/booking";
import { Reveal } from "./reveal";
import { useBooking } from "./booking-context";

/**
 * Compact booking CTA band (replaces the old full-page booking section).
 * The whole form now lives in a 2-step popup wizard (see booking.tsx).
 */
export function BookCta() {
  const { openBooking } = useBooking();

  return (
    <section id="book" className="relative py-10 sm:py-14" aria-label="Book a session">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="bg-brand-gradient relative overflow-hidden rounded-[2rem] px-6 py-9 text-white shadow-brand sm:px-10 sm:py-12">
            <div className="dots-pattern pointer-events-none absolute inset-0 opacity-20" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex flex-col items-start gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start today
                </span>
                <h2 className="font-display mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  Book in under{" "}
                  <span className="relative inline-block">
                    2 minutes
                    <svg
                      className="absolute -bottom-1.5 left-0 w-full text-white/70"
                      viewBox="0 0 120 8"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M2 6c30-4 70-4.5 116-2"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h2>
                <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" /> Evenings, 4-10pm daily (WAT)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {naira(SOLO_PRICE)} solo · {naira(GROUP_PRICE)} group
                  </span>
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[240px]">
                <Button
                  size="lg"
                  onClick={() => openBooking()}
                  className="w-full rounded-full bg-white px-8 py-6 text-base font-bold text-brand-royal shadow-brand transition-transform hover:scale-[1.03]"
                >
                  Book your session
                  <ArrowRight className="ml-2 h-4.5 w-4.5" />
                </Button>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-full border-2 border-white/40 bg-white/10 px-8 py-6 font-semibold text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  >
                    <MessageCircle className="mr-2 h-4.5 w-4.5" />
                    WhatsApp me first
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
