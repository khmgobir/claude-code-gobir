"use client";

import { useState } from "react";
import {
  ArrowRight,
  Baby,
  BarChart3,
  Check,
  GraduationCap,
  LineChart,
  MessageCircle,
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
import { naira, WHATSAPP_LINK } from "@/lib/booking";
import { HS_PLANS, RS_SERVICES } from "@/lib/programs";
import { HomeschoolDialog } from "./homeschool-dialog";
import { ResearchDialog } from "./research-dialog";

type Program = {
  id: string;
  topic: string;
  title: string;
  img: string;
  imgAlt: string;
  icon: typeof Baby;
  grad: string;
  tagline: string;
  bullets: string[];
  detail: {
    intro: string;
    includes: string[];
    forWho: string;
    how: string[];
  };
};

const PROGRAMS: Program[] = [
  {
    id: "homeschool",
    topic: "Home Schooling Program",
    title: "Home Schooling Program",
    img: "/img/homeschool.webp",
    imgAlt: "A real Hausa boy in a traditional teal cap, smiling gently",
    icon: Baby,
    grad: "from-brand-royal to-brand-cyan",
    tagline: "A real school routine at home, built around your child.",
    bullets: [
      "Personalised timetable for ages 5–15",
      "Reading, maths, computer & AI skills",
      "2–4 sessions a week, at home or online",
      "Monthly progress report for parents",
    ],
    detail: {
      intro:
        "A structured home-schooling support program for families in Sokoto and online. We combine your child's school curriculum with digital skills, in a calm 1-to-1 setting at your home or on Google Meet.",
      includes: [
        "Free meet-and-greet session with you and your child",
        "A weekly plan mixing school subjects with computer & AI skills",
        "Qualified, patient coaching — Hausa & English",
        "Monthly progress summary with next steps for parents",
        "Safe, child-friendly content only (parent approved)",
      ],
      forWho: "Parents of children aged 5–15 (including homeschooling families and anyone wanting extra support after school).",
      how: [
        "Book a first session — we assess your child's level",
        "We agree a weekly timetable that fits your family",
        "Sessions run 2–4 times a week, 60 minutes each",
        "You get a progress report every month",
      ],
    },
  },
  {
    id: "research",
    topic: "Research & Data Analysis",
    title: "Research & Data Analysis",
    img: "/img/research-data.webp",
    imgAlt: "Charts and dashboards ready for analysis on a laptop",
    icon: BarChart3,
    grad: "from-brand-blue to-brand-royal",
    tagline: "From questionnaire to clean, defensible results.",
    bullets: [
      "Questionnaires, data entry & cleaning",
      "Analysis in Excel, SPSS or Power BI",
      "Final-year project & thesis support",
      "Charts, interpretation & write-up help",
    ],
    detail: {
      intro:
        "Practical research and data-analysis support for students, researchers, NGOs and small businesses. Bring your raw data or your project topic, and leave with results you can actually defend.",
      includes: [
        "Study design & questionnaire review (Google Forms, paper)",
        "Data entry, cleaning and coding in Excel",
        "Descriptive statistics, charts & cross-tabs",
        "SPSS / Power BI analysis with plain-English interpretation",
        "Final-year project chapters 4 & 5 walkthrough",
      ],
      forWho: "Undergraduate & postgraduate students, lecturers, NGOs and small businesses that need reliable numbers and clear reporting.",
      how: [
        "Book a first session — we review your topic or data",
        "We agree the analysis plan and tools (Excel, SPSS, Power BI)",
        "We work through the analysis together, hands-on",
        "You leave with clean tables, charts and a written interpretation",
      ],
    },
  },
];

export function LearnYourWay() {
  const [open, setOpen] = useState<Program | null>(null);
  const [hsOpen, setHsOpen] = useState(false);
  const [rsOpen, setRsOpen] = useState(false);

  function bookProgram(p: Program) {
    setOpen(null);
    if (p.id === "homeschool") setHsOpen(true);
    else setRsOpen(true);
  }

  return (
    <section id="learn" className="relative py-16 sm:py-24" aria-label="Home schooling and data analysis programs">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="New programs"
          title={
            <>
              Learn <span className="text-gradient">your way</span> — at home or in the data
            </>
          }
          sub="Two focused programs beyond one-off sessions: a full home-schooling routine for your child, and research & data-analysis support that gets results."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-brand">
                <div className="relative h-52 overflow-hidden sm:h-60">
                  <img
                    src={p.img}
                    alt={p.imgAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/55 via-transparent to-transparent" />
                  <span
                    className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-royal shadow-soft backdrop-blur`}
                  >
                    <p.icon className="h-3.5 w-3.5" />
                    {p.id === "homeschool" ? "For your children" : "For students & SMEs"}
                  </span>
                  <h3 className="font-display absolute bottom-4 left-4 right-4 text-2xl font-extrabold tracking-tight text-white drop-shadow">
                    {p.title}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-sm font-medium text-foreground/80">{p.tagline}</p>
                  <ul className="mt-4 grid flex-1 gap-2.5 sm:grid-cols-2">
                    {p.bullets.map((bl) => (
                      <li key={bl} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-gradient-to-br ${p.grad} text-white`}>
                          <Check className="h-3 w-3" />
                        </span>
                        {bl}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                    <Button
                      onClick={() => bookProgram(p)}
                      className={`flex-1 rounded-full bg-gradient-to-br ${p.grad} shadow-brand font-semibold text-white transition-transform hover:scale-[1.02]`}
                    >
                      {p.id === "homeschool" ? "Request a place" : "Get a free quote"}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(p)}
                      className="flex-1 rounded-full border-2 border-primary/25 font-semibold hover:bg-primary/5"
                    >
                      How it works
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
          {open && (
            <>
              <div className="bg-brand-gradient pointer-events-none absolute inset-x-0 top-0 h-1.5" />
              <DialogHeader className="text-left">
                <DialogTitle asChild>
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${open.grad} text-white shadow-soft`}
                    >
                      <open.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-xl font-extrabold">{open.title}</span>
                  </div>
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed">
                  {open.detail.intro}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-5 text-sm">
                <div>
                  <h4 className="font-display flex items-center gap-2 text-base font-bold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    What&apos;s included
                  </h4>
                  <ul className="mt-2.5 space-y-2">
                    {open.detail.includes.map((it) => (
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
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Who it&apos;s for
                  </h4>
                  <p className="mt-1.5 text-muted-foreground">{open.detail.forWho}</p>
                </div>

                <div>
                  <h4 className="font-display flex items-center gap-2 text-base font-bold">
                    <LineChart className="h-4 w-4 text-primary" />
                    How it works
                  </h4>
                  <ol className="mt-2.5 space-y-2">
                    {open.detail.how.map((s, idx) => (
                      <li key={s} className="flex items-start gap-2.5 text-muted-foreground">
                        <span className="bg-brand-gradient mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white">
                          {idx + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-brand-gradient-soft px-4 py-3">
                  {open.id === "homeschool" ? (
                    <>
                      <span className="text-sm font-semibold text-foreground/90">
                        From {naira(HS_PLANS[0].perChild)} / month per child
                      </span>
                      <span className="text-xs text-muted-foreground">25% sibling discount</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-foreground/90">
                        From {naira(RS_SERVICES[0].from)} per service
                      </span>
                      <span className="text-xs text-muted-foreground">free quote, no payment until approved</span>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <Button
                    onClick={() => bookProgram(open)}
                    className="bg-brand-gradient shadow-brand flex-1 rounded-full font-semibold text-white"
                  >
                    {open.id === "homeschool" ? "Request a place" : "Get a free quote"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full font-semibold">
                      <MessageCircle className="mr-1.5 h-4 w-4 text-brand-green-deep" />
                      Ask a question
                    </Button>
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <HomeschoolDialog open={hsOpen} onOpenChange={setHsOpen} />
      <ResearchDialog open={rsOpen} onOpenChange={setRsOpen} />
    </section>
  );
}
