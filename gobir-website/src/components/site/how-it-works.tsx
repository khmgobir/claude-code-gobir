"use client";

import { CalendarCheck2, PartyPopper, Send } from "lucide-react";
import { Reveal, SectionHeading } from "./reveal";

const STEPS = [
  {
    icon: CalendarCheck2,
    step: "01",
    title: "Book your slot",
    body: "Choose your topic, pick a day and time between 4pm and 10pm, and tell us how many of you are joining. Takes about two minutes.",
    grad: "from-brand-royal to-brand-coral",
  },
  {
    icon: Send,
    step: "02",
    title: "Get confirmed",
    body: "You'll get an email with the meeting link (online) or venue details (in person) — plus simple payment details to lock in your slot.",
    grad: "from-brand-blue to-brand-cyan",
  },
  {
    icon: PartyPopper,
    step: "03",
    title: "Learn & grow",
    body: "Show up, get hands-on help tailored to you, and leave with clear next steps you can act on right away.",
    grad: "from-brand-coral to-brand-coral-deep",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-16 sm:py-24" aria-label="How it works">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Booking takes <span className="text-gradient">two minutes</span>
            </>
          }
          sub="No forms that never end, no waiting for days. Pick a time, get confirmed, show up and learn."
        />

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-0.5 bg-gradient-to-r from-brand-royal via-brand-blue to-brand-coral opacity-30 md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12} className="relative">
              <div className="flex h-full flex-col items-center rounded-3xl border bg-card p-7 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-brand">
                <div className="relative">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-soft`}
                  >
                    <s.icon className="h-6 w-6" />
                  </span>
                  <span className="font-display absolute -right-2.5 -top-2.5 grid h-7 w-7 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
