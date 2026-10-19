"use client";

import { Check, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./reveal";

const FEATURES = [
  "Any topic — AI, computer, ideas, kids or marketing",
  "60 minutes, fully hands-on",
  "Online (Google Meet / Zoom) or in person, Sokoto",
  "Evening slots daily — 4:00pm to 10:00pm (WAT)",
  "Clear next steps + ongoing support",
  "Free reschedule & cancellation via your link",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24" aria-label="Pricing">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Simple pricing"
          title={
            <>
              Simple, <span className="text-gradient">flat pricing</span>
            </>
          }
          sub="No hidden fees, no hourly surprises. One friendly price per person — and bringing friends makes it cheaper for everyone."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="relative flex h-full flex-col rounded-3xl border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-brand sm:p-8">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <User className="h-3.5 w-3.5" /> Solo
              </span>
              <div className="font-display mt-5 flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight">₦5,000</span>
                <span className="pb-1.5 text-sm font-medium text-muted-foreground">
                  · 60 min
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                One-on-one, 100% tailored to you and your goal.
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="bg-brand-gradient mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-foreground/80">
                      {f === "Any topic — AI, computer, ideas, kids or marketing"
                        ? "Any topic — AI, computer, ideas, kids or marketing"
                        : f}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="mt-8">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-2 border-primary/30 py-5 font-semibold hover:bg-primary/5"
                >
                  Book solo — ₦5,000
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="border-gradient relative flex h-full flex-col rounded-3xl bg-card p-7 shadow-brand transition-all duration-300 hover:-translate-y-1 sm:p-8">
              <div className="bg-brand-gradient absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white shadow-soft">
                BEST VALUE
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-coral/10 px-3 py-1 text-xs font-bold text-brand-coral-deep">
                <Users className="h-3.5 w-3.5" /> Group · 2–5 people
              </span>
              <div className="font-display mt-5 flex items-end gap-2">
                <span className="text-gradient text-5xl font-extrabold tracking-tight">
                  ₦10,000
                </span>
                <span className="pb-1.5 text-sm font-medium text-muted-foreground">
                  · flat, not per person
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Flat for the whole group of 2–5 — that&apos;s as low as ₦2,000 each.
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {[
                  "Everything in Solo — same topics, same hands-on style",
                  "Split the cost: friends, family or your team",
                  "Up to 5 people per online session",
                  "In person: private 1-to-1 session at your address",
                  "Pay after booking — bank transfer confirms your slot",
                  "Free reschedule & cancellation via your link",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="bg-brand-gradient mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#book" className="mt-8">
                <Button className="bg-brand-gradient shadow-brand w-full rounded-full py-5 font-semibold text-white transition-transform hover:scale-[1.02]">
                  Book a group — ₦10,000
                </Button>
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mx-auto mt-8 max-w-4xl">
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            In-person sessions are exclusive (just you) · Online sessions host up to 5
            independent learners per slot · Payment happens after booking, by bank
            transfer — your slot is held until then.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
