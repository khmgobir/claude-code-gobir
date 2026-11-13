"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/faq-data";
import { Reveal, SectionHeading } from "./reveal";

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
          sub="The things people usually ask me before their first session. Still unsure? WhatsApp me, I reply fast."
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
