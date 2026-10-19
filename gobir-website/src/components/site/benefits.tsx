"use client";

import { HandHeart, MonitorSmartphone, Route, Users2 } from "lucide-react";
import { Reveal, SectionHeading } from "./reveal";

const ITEMS = [
  {
    icon: HandHeart,
    title: "Real, hands-on practice",
    body: "Learn by doing, not just watching — every session is a workshop, not a lecture. You practice live with guidance.",
    grad: "from-brand-royal to-brand-blue",
  },
  {
    icon: MonitorSmartphone,
    title: "Online or face-to-face",
    body: "Join on Google Meet or Zoom from anywhere, or sit with us in person in Sokoto. Same quality, either way.",
    grad: "from-brand-blue to-brand-cyan",
  },
  {
    icon: Users2,
    title: "Solo or with friends",
    body: "Bring up to 5 people to one online session and split the flat group price — learning together is better value.",
    grad: "from-brand-coral to-brand-coral-deep",
  },
  {
    icon: Route,
    title: "Clear next steps",
    body: "Leave every session knowing exactly what to do next — a simple plan you can act on immediately.",
    grad: "from-brand-green to-brand-cyan",
  },
];

export function Benefits() {
  return (
    <section className="py-16 sm:py-24" aria-label="What a session gives you">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="What a session gives you"
          title={
            <>
              Not just a class —{" "}
              <span className="text-gradient">a working session</span>
            </>
          }
          sub="Every Gobir Digital session is designed around one thing: you leaving with real skills you can use the same day."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="group h-full rounded-3xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-brand">
                <span
                  className={`inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${item.grad} text-white shadow-soft transition-transform duration-300 group-hover:scale-110`}
                >
                  <item.icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="font-display mt-4 text-lg font-bold leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
