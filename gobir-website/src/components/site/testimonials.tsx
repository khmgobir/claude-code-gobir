"use client";

import { useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal, SectionHeading } from "./reveal";

const QUOTES = [
  {
    name: "Amina S.",
    role: "Student, Sokoto",
    topic: "How to Use AI",
    text: "I was scared of ChatGPT before. Now I use it for my assignments, my CV and even to plan my small business. One session changed everything for me.",
    grad: "from-brand-royal to-brand-coral",
  },
  {
    name: "Musa I.",
    role: "Shop owner",
    topic: "Promote Your Business Online",
    text: "He showed me how to post properly and message customers on WhatsApp. My shop now gets orders from people I have never met. Worth every naira.",
    grad: "from-brand-coral to-brand-coral-deep",
  },
  {
    name: "Fatima & Zainab",
    role: "Group session (3 friends)",
    topic: "Computer Basics & Skills",
    text: "We booked together and split the price. From typing to email and staying safe online — everything was explained slowly and clearly. No shame at all.",
    grad: "from-brand-green to-brand-cyan",
  },
  {
    name: "Emeka O.",
    role: "Founder",
    topic: "Turn Your Idea Into Reality",
    text: "I came with just an idea in my head. I left with a name, a simple plan and my first next steps. The follow-up support is real — he doesn't leave you stuck.",
    grad: "from-brand-navy to-brand-royal",
  },
  {
    name: "Hauwa B.",
    role: "Parent",
    topic: "Kids Digital Learning",
    text: "My son (9) now types, draws and explores safely on the computer — and talks about AI at dinner! Patient, warm and professional with children.",
    grad: "from-brand-blue to-brand-royal",
  },
  {
    name: "Yusuf A.",
    role: "NYSC member",
    topic: "How to Use AI",
    text: "The evening slots fit perfectly after work. Online on Meet, shared screen, hands-on practice. In two sessions I was automating my own reports.",
    grad: "from-brand-cyan to-brand-blue",
  },
];

const AVATAR_COLORS = [
  "bg-brand-royal",
  "bg-brand-coral",
  "bg-brand-green",
  "bg-brand-sky",
  "bg-brand-blue",
  "bg-brand-cyan",
];

export function Testimonials() {
  const [page, setPage] = useState(0);
  const pages = [QUOTES.slice(0, 3), QUOTES.slice(3, 6)];

  return (
    <section
      id="testimonials"
      className="bg-brand-gradient-soft py-16 sm:py-24"
      aria-label="What clients say"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Happy learners"
          title={
            <>
              Real people, <span className="text-gradient">real results</span>
            </>
          }
          sub="From complete beginners to business owners — here's what sessions with Gobir Digital feel like."
        />

        <Reveal className="mt-12">
          <div className="grid gap-5 md:grid-cols-3">
            {pages[page].map((q, i) => (
              <div
                key={q.name}
                className="relative flex h-full flex-col rounded-3xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-brand"
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/15" />
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
                  &ldquo;{q.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t pt-4">
                  <span
                    className={`font-display grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${q.grad} text-sm font-bold text-white`}
                  >
                    {q.name.charAt(0)}
                  </span>
                  <div>
                    <div className="text-sm font-bold">{q.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {q.role} · {q.topic}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous testimonials"
              className="grid h-10 w-10 place-items-center rounded-full border bg-white shadow-soft transition hover:bg-primary/5 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  aria-label={`Testimonials page ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    page === i ? "bg-brand-gradient w-8" : "w-2.5 bg-primary/25"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
              disabled={page === pages.length - 1}
              aria-label="Next testimonials"
              className="grid h-10 w-10 place-items-center rounded-full border bg-white shadow-soft transition hover:bg-primary/5 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
