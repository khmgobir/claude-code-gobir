"use client";
import { useState } from "react";

const LINKS = [
  ["#services", "What you'll learn"],
  ["#how", "How it works"],
  ["#why", "Why Gobir"],
  ["#contact", "Contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/85 backdrop-blur">
      <div className="wrap flex h-[68px] items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <img src="/gobir-logo-emblem.png" alt="Gobir Digital" className="h-10 w-10 rounded-xl object-cover shadow-card" />
          <span className="font-serif text-[1.2rem] font-semibold text-navy">
            Gobir Digital
            <small className="block text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted">Learn Digital · Build Smart · Grow</small>
          </span>
        </a>
        <nav className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-[68px] flex-col items-start gap-4 border-b border-line bg-white p-5 shadow-lift md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="font-medium text-ink hover:text-brand">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#book" className="btn-blue"><i className="bi bi-calendar-check" /> Book a session</a>
          <button className="text-2xl text-navy md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}><i className="bi bi-list" /></button>
        </div>
      </div>
    </header>
  );
}
