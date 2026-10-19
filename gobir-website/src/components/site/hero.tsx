"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  GraduationCap,
  Sparkles,
  Users,
  Wallet,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CHIPS = [
  { icon: Clock3, label: "60 min", sub: "per session" },
  { icon: Wallet, label: "₦5k–10k", sub: "solo / group" },
  { icon: Users, label: "1–5", sub: "people" },
  { icon: CalendarClock, label: "4–10pm", sub: "daily (WAT)" },
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section id="top" className="bg-hero-mesh relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20">
      <div className="dots-pattern pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-gradient-to-br from-brand-coral/25 to-brand-coral/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] left-[-8%] h-96 w-96 rounded-full bg-gradient-to-tr from-brand-royal/25 to-brand-blue/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="text-center lg:text-left">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/70 px-4 py-1.5 text-xs font-semibold shadow-soft backdrop-blur"
          >
            <span className="animate-pulse-ring h-2 w-2 rounded-full bg-brand-green" />
            Hi, I&apos;m Gobir — your coach in Sokoto &amp; online
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-[2.6rem] font-extrabold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.1rem]"
          >
            Learn <span className="text-gradient">smarter</span>.
            <br />
            Master AI &amp;{" "}
            <span className="relative inline-block">
              <span className="text-gradient-2">digital skills</span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-brand-coral/70"
                viewBox="0 0 220 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 9c50-5.5 120-6.5 214-3"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg lg:mx-0"
          >
            I sit with you one-to-one and help you use AI with confidence, get
            comfortable on the computer, turn that idea in your head into a real
            plan, and grow your business online. We go at your pace, hands-on,
            until it clicks —{" "}
            <strong className="font-semibold text-foreground">
              no jargon, no rushing.
            </strong>
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center"
          >
            <a href="#book" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-brand-gradient shadow-brand w-full rounded-full px-8 py-6 text-base font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Book your session
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Button>
            </a>
            <a href="#courses" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-full border-2 border-primary/25 bg-white/60 px-8 py-6 text-base font-semibold backdrop-blur hover:bg-white"
              >
                See what you&apos;ll learn
              </Button>
            </a>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {CHIPS.map((c) => (
              <div
                key={c.label}
                className="glass rounded-2xl border border-white/60 px-4 py-3 text-center shadow-soft sm:text-left"
              >
                <c.icon className="mx-auto h-4.5 w-4.5 text-primary lg:mx-0" />
                <div className="font-display mt-1.5 text-lg font-bold leading-none">
                  {c.label}
                </div>
                <div className="mt-1 text-[11px] font-medium text-muted-foreground">
                  {c.sub}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="bg-brand-gradient absolute -inset-3 rounded-[2.2rem] opacity-25 blur-2xl" />
          <div className="border-gradient relative overflow-hidden rounded-[2rem] shadow-brand">
            <img
              src="/img/hero-site.png"
              alt="A smiling student learning AI skills on a laptop with Gobir Digital"
              className="aspect-[4/3.4] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/35 via-transparent to-transparent" />
          </div>

          <motion.div
            className="glass-dark animate-float-y absolute -left-3 top-8 flex items-center gap-2.5 rounded-2xl border border-white/15 px-4 py-3 text-white shadow-brand sm:-left-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <span className="bg-brand-gradient grid h-9 w-9 place-items-center rounded-xl">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="text-[13px] font-bold leading-none">AI coaching</div>
              <div className="mt-1 text-[11px] text-white/70">
                ChatGPT · Claude · Gemini
              </div>
            </div>
          </motion.div>

          <motion.div
            className="glass-dark animate-float-y absolute -right-2 bottom-10 flex items-center gap-2.5 rounded-2xl border border-white/15 px-4 py-3 text-white shadow-brand sm:-right-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            style={{ animationDelay: "1.4s" }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-green to-brand-cyan">
              <Zap className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="text-[13px] font-bold leading-none">Learn by doing</div>
              <div className="mt-1 text-[11px] text-white/70">Real projects, real skills</div>
            </div>
          </motion.div>

          <motion.div
            className="glass absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 shadow-soft"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-semibold">
              Loved by beginners &amp; hustlers
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function HeroBadgeRow() {
  const items = [
    { icon: GraduationCap, text: "Taught one-to-one" },
    { icon: Clock3, text: "Evenings that fit you" },
    { icon: Zap, text: "You practise, not just watch" },
    { icon: Users, text: "I don't leave you stuck" },
  ];
  return (
    <div className="border-y bg-white/60 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:justify-between sm:px-6">
        {items.map((i) => (
          <div key={i.text} className="flex items-center gap-2 text-sm font-semibold text-foreground/75">
            <span className="bg-brand-gradient-soft grid h-8 w-8 place-items-center rounded-lg text-primary">
              <i.icon className="h-4 w-4" />
            </span>
            {i.text}
          </div>
        ))}
      </div>
    </div>
  );
}
