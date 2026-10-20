"use client";

import {
  Bot,
  Baby,
  Lightbulb,
  Monitor,
  Rocket,
  ArrowUpRight,
} from "lucide-react";
import { Reveal, SectionHeading } from "./reveal";

const COURSES = [
  {
    icon: Bot,
    badge: "Most popular",
    badgeClass: "bg-brand-gradient text-white",
    title: "How to Use AI",
    body: "Get your work done in minutes with ChatGPT, Claude and Gemini, instead of staring at a blank page.",
    tag: "All levels",
    grad: "from-brand-royal to-brand-coral",
    soft: "bg-brand-royal/10 text-brand-royal",
  },
  {
    icon: Monitor,
    badge: "Great for beginners",
    badgeClass: "bg-brand-green/15 text-brand-green-deep",
    title: "Computer Basics & Skills",
    body: "Go from nervous to confident on any computer, typing, email, the internet and staying safe online.",
    tag: "Start from zero",
    grad: "from-brand-green to-brand-cyan",
    soft: "bg-brand-green/10 text-brand-green-deep",
  },
  {
    icon: Lightbulb,
    badge: "For creators & founders",
    badgeClass: "bg-brand-sky/15 text-brand-royal",
    title: "Turn Your Idea Into Reality",
    body: "Walk in with an idea, walk out with a clear, do-able plan and your first real steps.",
    tag: "Idea → plan",
    grad: "from-brand-navy to-brand-royal",
    soft: "bg-brand-sky/10 text-brand-royal",
  },
  {
    icon: Rocket,
    badge: "For hustlers & SMEs",
    badgeClass: "bg-brand-coral/15 text-brand-coral-deep",
    title: "Promote Your Business Online",
    body: "Get real customers from social media, with simple content and marketing that actually works.",
    tag: "Grow & sell",
    grad: "from-brand-coral to-brand-coral-deep",
    soft: "bg-brand-coral/10 text-brand-coral-deep",
  },
  {
    icon: Baby,
    badge: "Ages 6–15 · personalised",
    badgeClass: "bg-brand-blue/15 text-brand-royal",
    title: "Kids Digital Learning",
    body: "Fun, safe, personalised lessons that give your child a real head start with computers and AI.",
    tag: "Parent approved",
    grad: "from-brand-blue to-brand-royal",
    soft: "bg-brand-blue/10 text-brand-royal",
  },
];

export function Courses() {
  return (
    <section id="courses" className="relative py-16 sm:py-24" aria-label="What you'll learn">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="What you'll learn"
          title={
            <>
              Skills for the digital age,{" "}
              <span className="text-gradient">made simple</span>
            </>
          }
          sub="Five ways to level up. Pick one, and I'll tailor the whole session to you, whether you're starting from zero or leveling up."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {COURSES.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.07}
              className={i === 0 ? "md:col-span-2 lg:col-span-3" : "lg:col-span-3"}
            >
              <a
                href="#book"
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-brand sm:p-7"
              >
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${c.grad} opacity-[0.12] blur-2xl transition-opacity duration-300 group-hover:opacity-25`}
                />
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <c.icon className="h-5.5 w-5.5" />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${c.badgeClass}`}
                  >
                    {c.badge}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl font-bold tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${c.soft}`}>
                    {c.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Book this
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
