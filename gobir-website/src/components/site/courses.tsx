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
    body: "Work smarter with tools like ChatGPT, Claude and Gemini — write, plan, research, create and solve everyday problems in minutes.",
    tag: "All levels",
    grad: "from-brand-royal to-brand-coral",
    soft: "bg-brand-royal/10 text-brand-royal",
  },
  {
    icon: Monitor,
    badge: "Great for beginners",
    badgeClass: "bg-brand-green/15 text-brand-green-deep",
    title: "Computer Basics & Skills",
    body: "From switching on to confident daily use — typing, files & folders, the internet, email, online safety and the essentials.",
    tag: "Start from zero",
    grad: "from-brand-green to-brand-cyan",
    soft: "bg-brand-green/10 text-brand-green-deep",
  },
  {
    icon: Lightbulb,
    badge: "For creators & founders",
    badgeClass: "bg-brand-sky/15 text-brand-royal",
    title: "Turn Your Idea Into Reality",
    body: "Have an idea but don't know where to start? We'll shape it into a clear, do-able plan — product, service or project, step by step.",
    tag: "Idea → plan",
    grad: "from-brand-navy to-brand-royal",
    soft: "bg-brand-sky/10 text-brand-royal",
  },
  {
    icon: Rocket,
    badge: "For hustlers & SMEs",
    badgeClass: "bg-brand-coral/15 text-brand-coral-deep",
    title: "Promote Your Business Online",
    body: "Get found and grow in the digital age — social media, simple content, and digital marketing that actually brings customers.",
    tag: "Grow & sell",
    grad: "from-brand-coral to-brand-coral-deep",
    soft: "bg-brand-coral/10 text-brand-coral-deep",
  },
  {
    icon: Baby,
    badge: "Ages 6–15 · personalised",
    badgeClass: "bg-brand-blue/15 text-brand-royal",
    title: "Kids Digital Learning",
    body: "Personalised, fun lessons for children — safe computer use, typing, creativity, and a friendly early start with AI, paced to each child.",
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
              Skills for the digital age —{" "}
              <span className="text-gradient">made simple</span>
            </>
          }
          sub="Pick what you need — I'll tailor the session to your level, whether you're starting from zero or sharpening what you already know."
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
