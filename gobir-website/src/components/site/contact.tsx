"use client";

import {
  Clock3,
  Globe2,
  MapPin,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./reveal";
import { WHATSAPP_LINK, WHATSAPP_DISPLAY } from "@/lib/booking";

const CARDS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    main: WHATSAPP_DISPLAY,
    sub: "Chat now — we usually reply fast",
    cta: "Chat now",
    href: WHATSAPP_LINK,
    grad: "from-brand-green to-brand-wa",
  },
  {
    icon: MapPin,
    title: "In person",
    main: "Sokoto, Nigeria",
    sub: "Book a face-to-face session",
    cta: "Book in person",
    href: "#book",
    grad: "from-brand-royal to-brand-coral",
  },
  {
    icon: Globe2,
    title: "Online worldwide",
    main: "Google Meet / Zoom",
    sub: "Learn from anywhere",
    cta: "Book online",
    href: "#book",
    grad: "from-brand-blue to-brand-cyan",
  },
  {
    icon: Clock3,
    title: "Open hours",
    main: "4:00pm – 10:00pm",
    sub: "Daily · Nigeria time (WAT)",
    cta: "See slots",
    href: "#book",
    grad: "from-brand-coral to-brand-coral-deep",
  },
];

export function Contact() {
  return (
    <section id="contact" className="py-16 sm:py-24" aria-label="Contact and location">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Find us"
          title={
            <>
              Contact &amp; <span className="text-gradient">location</span>
            </>
          }
          sub="Reach out any time — WhatsApp is fastest, and we usually reply within minutes during open hours."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.07}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex h-full flex-col rounded-3xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-brand"
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-soft transition-transform duration-300 group-hover:scale-110`}
                >
                  <c.icon className="h-5.5 w-5.5" />
                </span>
                <div className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {c.title}
                </div>
                <div className="font-display mt-1 text-lg font-bold leading-snug">
                  {c.main}
                </div>
                <div className="mt-1.5 flex-1 text-sm text-muted-foreground">
                  {c.sub}
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {c.cta}
                  <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="border-gradient mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-card p-7 text-center shadow-brand sm:flex-row sm:text-left">
            <div>
              <h3 className="font-display text-xl font-bold">
                Prefer to just ask a question first?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Message us on WhatsApp at {WHATSAPP_DISPLAY} — no commitment, just answers.
              </p>
            </div>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="w-full rounded-full bg-gradient-to-br from-brand-green to-brand-wa px-7 py-5 font-semibold text-white shadow-soft transition-transform hover:scale-[1.03] sm:w-auto"
              >
                <MessageCircle className="mr-2 h-4.5 w-4.5" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
