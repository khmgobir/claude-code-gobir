"use client";

import { useState } from "react";
import {
  Bot,
  Baby,
  Lightbulb,
  Monitor,
  Rocket,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleUserRound,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reveal, SectionHeading } from "./reveal";
import { naira, SOLO_PRICE, WHATSAPP_LINK } from "@/lib/booking";
import { useBooking } from "./booking-context";

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
    topic: "How to Use AI",
    forWho: "Students, teachers, writers, office workers — anyone who wants AI to do the heavy lifting.",
    learn: [
      "Write, plan and research 10× faster with ChatGPT, Claude & Gemini",
      "Prompt like a pro — get useful answers the first time",
      "Summarise long documents and study notes instantly",
      "Create images, slides and simple documents with AI",
      "Use AI safely: what to share, what to double-check",
    ],
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
    topic: "Computer Basics & Skills",
    forWho: "Complete beginners, seniors, anyone returning to study or work after a break.",
    learn: [
      "Master the desktop, files, folders and printing",
      "Type faster with simple daily drills",
      "Email, Google Docs and cloud storage done right",
      "Search the internet well and spot scams",
      "Stay safe: passwords, backups and privacy",
    ],
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
    topic: "Turn Your Idea Into Reality",
    forWho: "Anyone with an idea sitting in a notebook — side hustles, apps, services, school projects.",
    learn: [
      "Shape a fuzzy idea into a clear, testable plan",
      "Check there are real customers before you build",
      "Simple one-page business plan you'll actually use",
      "AI tools that speed up naming, branding and content",
      "Your first 3 concrete steps with dates",
    ],
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
    topic: "Promote Your Business Online",
    forWho: "Shop owners, artisans, food vendors, freelancers — anyone selling something in Sokoto or online.",
    learn: [
      "Set up or fix your WhatsApp Business & catalogue",
      "Make scroll-stopping posts with free AI design tools",
      "A simple weekly content calendar you can keep",
      "Turn comments and DMs into paying customers",
      "Track what works — one page, no jargon",
    ],
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
    topic: "Kids Digital Learning (personalised)",
    forWho: "Parents of children aged 6–15 — for after-school, weekends or holidays.",
    learn: [
      "Safe, supervised first steps on the computer",
      "Typing games that actually build speed",
      "Creative projects: drawings, slides, mini-videos",
      "Age-appropriate AI: learn with it, not cheat with it",
      "Online safety rules every child should know",
    ],
  },
];

export function Courses() {
  const [open, setOpen] = useState<number | null>(null);
  const { openBooking } = useBooking();
  const c = open !== null ? COURSES[open] : null;

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
          sub="Five ways to level up. Tap a card for the full details, then book the one that fits you."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {COURSES.map((course, i) => (
            <Reveal
              key={course.title}
              delay={i * 0.07}
              className={i === 0 ? "md:col-span-2 lg:col-span-3" : "lg:col-span-3"}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border bg-card p-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-brand sm:p-7"
              >
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${course.grad} opacity-[0.12] blur-2xl transition-opacity duration-300 group-hover:opacity-25`}
                />
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${course.grad} text-white shadow-soft transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <course.icon className="h-5.5 w-5.5" />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${course.badgeClass}`}
                  >
                    {course.badge}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl font-bold tracking-tight">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {course.body}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${course.soft}`}>
                    {course.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    See details
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
          {c && (
            <>
              <div className="bg-brand-gradient pointer-events-none absolute inset-x-0 top-0 h-1.5" />
              <DialogHeader className="text-left">
                <DialogTitle asChild>
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-soft`}
                    >
                      <c.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-xl font-extrabold">{c.title}</span>
                  </div>
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed">
                  {c.body}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-5 text-sm">
                <div>
                  <h4 className="font-display flex items-center gap-2 text-base font-bold">
                    <ListChecks className="h-4 w-4 text-primary" />
                    What you&apos;ll learn
                  </h4>
                  <ul className="mt-2.5 space-y-2">
                    {c.learn.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-muted-foreground">
                        <span className="bg-brand-gradient mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-display flex items-center gap-2 text-base font-bold">
                    <CircleUserRound className="h-4 w-4 text-primary" />
                    Who it&apos;s for
                  </h4>
                  <p className="mt-1.5 text-muted-foreground">{c.forWho}</p>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-brand-gradient-soft px-4 py-3">
                  <span className="text-sm font-semibold text-foreground/90">
                    {naira(SOLO_PRICE)} solo · {naira(10000)} group of 2–5
                  </span>
                  <span className="text-xs text-muted-foreground">60 min · pay after booking</span>
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    onClick={() => {
                      setOpen(null);
                      openBooking({ topic: c.topic });
                    }}
                    className="bg-brand-gradient shadow-brand flex-1 rounded-full font-semibold text-white"
                  >
                    Book this topic
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full font-semibold">
                      <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
                      Ask a question
                    </Button>
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
