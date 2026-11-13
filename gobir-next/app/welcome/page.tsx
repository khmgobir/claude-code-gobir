import type { Metadata } from "next";
import { waLink } from "@/lib/config";

export const metadata: Metadata = {
  title: "Welcome — Gobir Digital",
  description: "Welcome to Gobir Digital — learn AI & digital skills. Book a session, online worldwide or in person in Sokoto.",
};

const CHIPS = [
  ["bi-robot", "How to Use AI"],
  ["bi-laptop", "Computer Basics"],
  ["bi-lightbulb", "Idea to Reality"],
  ["bi-megaphone", "Promote Your Business"],
  ["bi-balloon-heart", "Kids Digital Learning"],
];
const META = [["60 min", "per session"], ["₦5k–10k", "solo / group"], ["1–5", "people"], ["4–10pm", "daily (WAT)"]];

export default function Welcome() {
  const waHi = waLink("Hello Gobir Digital! I'd like to learn more about booking a session.");
  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden text-[#eaf2fb] bg-[radial-gradient(1000px_500px_at_50%_-10%,rgba(31,143,239,.22),transparent),radial-gradient(900px_500px_at_85%_110%,rgba(63,120,200,.14),transparent),linear-gradient(180deg,#0a1733,#0e1f3d_60%,#0a1733)]">
      {/* topbar */}
      <div className="wrap flex items-center justify-between py-5">
        <a href="/" className="flex items-center gap-3">
          <img src="/gobir-logo-emblem.png" alt="Gobir Digital" className="h-10 w-10 rounded-xl shadow-lift" />
          <span className="font-serif text-lg font-semibold">Gobir Digital<small className="block text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[#9fb4d0]">Learn Digital · Build Smart · Grow</small></span>
        </a>
        <a href={waHi} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-[#9fb4d0] hover:border-brand2 hover:text-white"><i className="bi bi-whatsapp" /> Chat</a>
      </div>

      {/* hero */}
      <section className="wrap flex flex-1 flex-col items-center justify-center py-14 text-center">
        <div className="relative mb-8">
          <span className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle,rgba(70,179,255,.3),transparent_65%)] blur-md" />
          <img src="/gobir-logo-emblem.png" alt="Gobir Digital logo" className="h-[170px] w-[170px] rounded-[40px] shadow-[0_30px_70px_rgba(0,0,0,.55)] ring-1 ring-brand2/25 animate-float" />
        </div>
        <span className="eyebrow !text-brand2"><i className="bi bi-stars" /> Welcome</span>
        <h1 className="mt-4 font-serif text-[clamp(2.2rem,6vw,3.6rem)] font-semibold leading-tight">Welcome to <em className="italic text-brand2">Gobir&nbsp;Digital</em></h1>
        <p className="mx-auto mt-4 max-w-xl text-[1.14rem] leading-relaxed text-[#9fb4d0]">Your friendly guide to the digital age. Learn to use AI, master the computer, bring your ideas to life, and grow your business — online or in person, at your pace.</p>

        <div className="mt-7 flex flex-wrap justify-center gap-3.5">
          <a href="/#book" className="btn-blue"><i className="bi bi-calendar-check" /> Book a session</a>
          <a href="/" className="btn-light"><i className="bi bi-compass" /> Explore what we offer</a>
        </div>

        <div className="mt-8 flex max-w-2xl flex-wrap justify-center gap-2.5">
          {CHIPS.map(([i, t]) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.05] px-4 py-2 text-sm hover:border-brand2"><i className={`bi ${i} text-brand2`} /> {t}</span>
          ))}
        </div>

        <div className="mt-10 flex w-full max-w-xl flex-wrap justify-center gap-8 border-t border-white/15 pt-7">
          {META.map(([b, s]) => (<div key={s} className="flex flex-col"><b className="font-serif text-2xl text-white">{b}</b><span className="text-[0.78rem] text-[#9fb4d0]">{s}</span></div>))}
        </div>
      </section>

      <footer className="border-t border-white/15 py-6 text-center text-sm text-[#9fb4d0]">© {new Date().getFullYear()} Gobir Digital · Learn · Build · Grow</footer>
    </main>
  );
}
