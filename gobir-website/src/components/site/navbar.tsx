"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#courses", label: "What you'll learn" },
  { href: "#book", label: "Book" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Stories" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Navbar({ onManage }: { onManage: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-soft py-2.5" : "bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <img
            src="/gobir-icon-512.png"
            alt="Gobir Digital logo"
            className="h-9 w-9 rounded-xl object-cover shadow-soft"
          />
          <span className="font-display text-lg font-bold tracking-tight">
            Gobir<span className="text-gradient"> Digital</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/8 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onManage}
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground sm:block"
          >
            Manage booking
          </button>
          <a href="#book" className="hidden sm:block">
            <Button className="bg-brand-gradient shadow-brand rounded-full px-5 font-semibold text-white transition-transform hover:scale-[1.03]">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Book a session
            </Button>
          </a>
          <button
            className="grid h-10 w-10 place-items-center rounded-full border bg-background/80 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="glass overflow-hidden border-t lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-[15px] font-medium hover:bg-primary/8"
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onManage();
                }}
                className="rounded-xl px-3 py-2.5 text-left text-[15px] font-medium hover:bg-primary/8"
              >
                Manage booking
              </button>
              <a href="#book" onClick={() => setOpen(false)} className="mt-2">
                <Button className="bg-brand-gradient w-full rounded-full font-semibold text-white">
                  Book a session
                </Button>
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
