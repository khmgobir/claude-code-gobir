"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "./reveal";

const FAQS = [
  {
    q: "Do I need any experience?",
    a: "Not at all. I teach complete beginners all the time. I start from wherever you are and keep it simple — no jargon, no rushing, no making you feel small. If you can send a WhatsApp message, you can do this.",
  },
  {
    q: "How do online sessions work?",
    a: "You'll get a Google Meet or Zoom link once your booking is confirmed. All you need is a phone or laptop and internet. I share my screen, we practise live together, and you follow along step by step.",
  },
  {
    q: "How do I pay?",
    a: "After you book, you'll receive a confirmation with payment details (bank transfer). Payment confirms your slot. Nothing is charged online — you pay directly and simply.",
  },
  {
    q: "Can I bring friends or my team?",
    a: "Yes — up to 5 people. It's ₦5,000 for 1 person, or a flat ₦10,000 for a group of 2–5 — so bringing friends is great value (as low as ₦2,000 each). Everyone learns together in the same session.",
  },
  {
    q: "What if I need to reschedule?",
    a: "No problem — use the manage link in your confirmation email to cancel or reschedule yourself, any time. You'll see only the times that are actually free, and you can move as often as you need.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-24" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Questions"
          title={
            <>
              Good to <span className="text-gradient">know</span>
            </>
          }
          sub="The things people usually ask me before their first session. Still unsure? WhatsApp me — I reply fast."
        />
        <Reveal className="mt-10">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border bg-card px-5 shadow-soft data-[state=open]:shadow-brand"
              >
                <AccordionTrigger className="py-4 text-left font-display text-[15px] font-bold hover:no-underline sm:text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
