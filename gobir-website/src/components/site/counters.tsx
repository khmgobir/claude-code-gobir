"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { CalendarCheck, GraduationCap, Timer, Users } from "lucide-react";

const STATS = [
  {
    icon: GraduationCap,
    value: 6,
    suffix: "",
    label: "Skill tracks to choose from",
    sub: "AI · computer · ideas · business · kids",
    grad: "from-brand-royal to-brand-coral",
  },
  {
    icon: CalendarCheck,
    value: 7,
    suffix: "",
    label: "Days a week, every week",
    sub: "open every single evening",
    grad: "from-brand-blue to-brand-cyan",
  },
  {
    icon: Timer,
    value: 6,
    suffix: "",
    label: "Slots every evening",
    sub: "4pm · 5pm · 6pm · 7pm · 8pm · 9pm",
    grad: "from-brand-coral to-brand-coral-deep",
  },
  {
    icon: Users,
    value: 5,
    suffix: "",
    label: "People max per group session",
    sub: "so everyone gets attention",
    grad: "from-brand-green to-brand-cyan",
  },
];

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {val}
    </span>
  );
}

export function Counters() {
  return (
    <section
      className="bg-brand-gradient relative overflow-hidden py-14 sm:py-16"
      aria-label="Gobir Digital in numbers"
    >
      <div className="dots-pattern absolute inset-0 opacity-20 invert" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center text-white">
              <span className={`mx-auto inline-grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur`}>
                <s.icon className="h-5 w-5" />
              </span>
              <div className="font-display mt-3 text-4xl font-extrabold leading-none sm:text-5xl">
                <CountUp target={s.value} />
                {s.suffix}
              </div>
              <div className="mt-2 text-sm font-semibold">{s.label}</div>
              <div className="mt-1 text-xs text-white/70">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
