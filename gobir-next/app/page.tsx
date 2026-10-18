import Header from "@/components/Header";
import Booking from "@/components/Booking";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Reveal from "@/components/Reveal";
import { waLink } from "@/lib/config";

const SERVICES = [
  ["bi-robot", "How to Use AI", "Work smarter with tools like ChatGPT, Claude and Gemini — write, plan, research, create and solve everyday problems in minutes.", "Most popular"],
  ["bi-laptop", "Computer Basics & Skills", "From switching on to confident daily use — typing, files & folders, the internet, email, online safety and the essentials.", "Great for beginners"],
  ["bi-lightbulb", "Turn Your Idea Into Reality", "Have an idea but don't know where to start? We'll shape it into a clear, do-able plan — product, service or project, step by step.", "For creators & founders"],
  ["bi-megaphone", "Promote Your Business Online", "Get found and grow in the digital age — social media, simple content, and digital marketing that actually brings customers.", "For hustlers & SMEs"],
  ["bi-balloon-heart", "Kids Digital Learning", "Personalised, fun lessons for children — safe computer use, typing, creativity, and a friendly early start with AI, paced to each child.", "Ages 6–15 · personalised"],
];
const TRUST = [
  ["bi-person-badge", "Expert instructor", "Guided, personal attention"],
  ["bi-laptop", "Online & flexible", "Join from anywhere"],
  ["bi-wrench-adjustable", "Practical projects", "Learn by doing"],
  ["bi-headset", "Ongoing support", "We don't leave you stuck"],
];
const STEPS = [
  ["Book your slot", "Choose your topic, pick a day and time between 4pm and 10pm, and tell us how many of you are joining."],
  ["Get confirmed", "You'll get an email with the meeting link (online) or venue details (in person) and how to pay."],
  ["Learn & grow", "Show up, get hands-on help tailored to you, and leave with clear next steps you can act on right away."],
];
const FAQS = [
  ["Do I need any experience?", "Not at all. Sessions are built for complete beginners and improvers alike. We start from wherever you are and keep it simple."],
  ["How do online sessions work?", "You'll get a Google Meet or Zoom link after your booking is confirmed. All you need is a phone or laptop and internet."],
  ["How do I pay?", "After you book, you'll receive a confirmation with payment details (bank transfer). Payment confirms your slot."],
  ["Can I bring friends or my team?", "Yes — up to 5 people. It's ₦5,000 for 1 person, or a flat ₦10,000 for a group of 2–5 — so bringing friends is great value."],
  ["What if I need to reschedule?", "No problem — use the manage link in your confirmation email to cancel or reschedule yourself, any time."],
];

export default function Home() {
  const waHi = waLink("Hello Gobir Digital! I'd like to learn more about booking a session.");
  return (
    <>
      <Header />
      <span id="top" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[radial-gradient(1200px_500px_at_80%_-10%,rgba(70,179,255,.18),transparent),linear-gradient(180deg,#0a1733,#13284d)] text-[#eaf0f7]">
        <div className="wrap grid min-h-[100svh] items-center gap-10 py-24 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="eyebrow !text-brand2"><i className="bi bi-stars" /> Online & in-person coaching</span>
            <h1 className="mt-4 font-serif text-[clamp(2.2rem,5vw,3.7rem)] font-semibold leading-[1.14] text-white">
              Learn <em className="italic text-brand2">smarter</em>. Master AI & digital skills.
            </h1>
            <p className="mt-4 max-w-xl text-[1.15rem] text-[#c3cedd]">
              Practical, beginner-friendly coaching to help you use AI with confidence, get comfortable with the computer, bring your ideas to life, and grow your business online — <b>learn smarter, not harder.</b>
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <a href="#book" className="btn-blue"><i className="bi bi-calendar-check" /> Book your session</a>
              <a href="#services" className="btn-light"><i className="bi bi-compass" /> See what you'll learn</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-8">
              {[["60 min", "per session"], ["₦5k–10k", "solo / group"], ["1–5", "people"], ["4–10pm", "daily (WAT)"]].map(([b, s]) => (
                <div key={s} className="flex flex-col"><b className="font-serif text-2xl text-white">{b}</b><span className="text-[0.82rem] text-[#9fb0c4]">{s}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] border border-white/15 bg-white/[.06] p-7 shadow-lift backdrop-blur">
            <h3 className="mb-3.5 font-serif text-xl text-white">What a session gives you</h3>
            {[["bi-robot", "Real, hands-on practice", "Learn by doing, not just watching"], ["bi-person-video3", "Online or face-to-face", "Google Meet / Zoom, or in person"], ["bi-people", "Solo or with friends", "Up to 5 people to one session"], ["bi-patch-check", "Clear next steps", "Leave knowing exactly what to do next"]].map(([i, b, s]) => (
              <div key={b} className="flex items-center gap-3 border-b border-white/10 py-2.5 last:border-0">
                <i className={`bi ${i} grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-brand2/15 text-[1.05rem] text-brand2`} />
                <div><b className="block text-[0.95rem] text-white">{b}</b><span className="text-[0.82rem] text-[#9fb0c4]">{s}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20">
        <div className="wrap">
          <div className="reveal mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow"><i className="bi bi-grid" /> What you'll learn</span>
            <h2 className="h2 my-3">Skills for the digital age — made simple</h2>
            <p className="text-[1.06rem] text-muted">Pick what you need. Every session is tailored to your level, whether you're starting out or sharpening what you know.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {SERVICES.map(([icon, title, body, tag]) => (
              <div key={title} className="card reveal transition hover:-translate-y-1 hover:shadow-lift">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-[14px] bg-gradient-to-br from-navy to-navy2 text-[1.5rem] text-brand2"><i className={`bi ${icon}`} /></div>
                <h3 className="font-serif text-[1.32rem] font-semibold text-navy">{title}</h3>
                <p className="my-2.5 text-[0.98rem] text-muted">{body}</p>
                <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[0.76rem] font-semibold text-brand">{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-line bg-white py-9">
        <div className="wrap reveal grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {TRUST.map(([i, b, s]) => (
            <div key={b} className="flex items-center gap-3.5">
              <i className={`bi ${i} grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand/10 text-[1.2rem] text-brand`} />
              <div><b className="block text-[0.95rem] text-navy">{b}</b><span className="text-[0.82rem] text-muted">{s}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="bg-white py-20">
        <div className="wrap">
          <div className="reveal mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow"><i className="bi bi-signpost-2" /> How it works</span>
            <h2 className="h2 my-3">Booking takes two minutes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, b], idx) => (
              <div key={t} className="reveal relative rounded-2xl border border-line bg-cream p-7">
                <div className="absolute -top-4 left-6 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand to-brand2 font-serif text-lg font-bold text-white shadow-card">{idx + 1}</div>
                <h3 className="mb-2 mt-3.5 font-serif text-[1.18rem] font-semibold text-navy">{t}</h3>
                <p className="text-[0.96rem] text-muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY / PRICING */}
      <section id="why" className="py-20">
        <div className="wrap grid items-center gap-11 md:grid-cols-2">
          <div className="reveal">
            <span className="eyebrow"><i className="bi bi-heart" /> Why learn with Gobir</span>
            <h2 className="h2 mb-1.5 mt-3">Patient, practical, and all about you</h2>
            <p className="text-muted">No jargon. No rushing. Just friendly, real-world coaching that meets you where you are.</p>
            <ul className="mt-5 space-y-0">
              {[["Beginner-friendly", "Explained in plain language anyone can follow."], ["Tailored to your goal", "Every session is built around what you want to achieve."], ["Flexible & convenient", "Online or in person, evenings that suit you."], ["Learn together", "Bring friends, family or your team — great value."]].map(([b, s]) => (
                <li key={b} className="flex gap-3.5 border-b border-line py-3 last:border-0">
                  <i className="bi bi-check-circle-fill mt-0.5 text-[1.2rem] text-brand" />
                  <div><b className="block text-navy">{b}</b><span className="text-[0.94rem] text-muted">{s}</span></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal rounded-[20px] bg-gradient-to-br from-navy to-navy2 p-9 text-white shadow-lift">
            <span className="eyebrow !text-brand2"><i className="bi bi-tag" /> Simple pricing</span>
            <h3 className="mt-1 font-serif text-2xl text-white">Simple, flat pricing</h3>
            <div className="my-4 font-serif text-5xl leading-none text-brand2">₦5,000<small className="text-base font-medium text-[#9fb0c4]"> solo · 60 min</small></div>
            <ul className="mb-6 space-y-2">
              {["₦5,000 for 1 person", "₦10,000 flat for a group of 2–5 (max)", "Any topic — AI, computer, ideas, kids or marketing", "Online or in person · hands-on"].map((t) => (
                <li key={t} className="flex gap-2.5 text-[0.96rem] text-[#d7e0ea]"><i className="bi bi-check2 text-brand2" /> {t}</li>
              ))}
            </ul>
            <a href="#book" className="btn-blue w-full"><i className="bi bi-calendar-check" /> Book a session</a>
          </div>
        </div>
      </section>

      <Booking />

      {/* CONTACT */}
      <section id="contact" className="border-y border-line bg-white py-20">
        <div className="wrap">
          <div className="reveal mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow"><i className="bi bi-geo-alt" /> Find us</span>
            <h2 className="h2 my-3">Contact & location</h2>
            <p className="text-[1.06rem] text-muted">Reach out any time — we usually reply fast on WhatsApp.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {[
              { i: "bi-whatsapp", b: "WhatsApp", p: "+234 706 663 7888", cta: true },
              { i: "bi-geo-alt-fill", b: "In person", p: "Sokoto, Nigeria", s: "Book a face-to-face session" },
              { i: "bi-globe2", b: "Online worldwide", p: "Google Meet / Zoom", s: "Learn from anywhere" },
              { i: "bi-clock-history", b: "Open hours", p: "4:00pm – 10:00pm", s: "Daily · Nigeria time (WAT)" },
            ].map((c) => (
              <div key={c.b} className="card reveal text-center transition hover:-translate-y-1 hover:shadow-lift">
                <i className={`bi ${c.i} mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-[14px] bg-gradient-to-br from-navy to-navy2 text-[1.5rem] text-brand2`} />
                <b className="block text-[1.05rem] text-navy">{c.b}</b>
                <p className="my-1.5 font-semibold text-ink">{c.p}</p>
                {c.cta ? <a href={waHi} target="_blank" rel="noopener" className="btn-blue mt-1"><i className="bi bi-whatsapp" /> Chat now</a> : <span className="text-[0.84rem] text-muted">{c.s}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="wrap max-w-3xl">
          <div className="reveal mb-12 text-center">
            <span className="eyebrow"><i className="bi bi-question-circle" /> Questions</span>
            <h2 className="h2 my-3">Good to know</h2>
          </div>
          {FAQS.map(([q, a]) => (
            <details key={q} className="reveal group mb-3 rounded-xl border border-line bg-white px-5 open:border-brand/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3.5 py-4 font-semibold text-navy">
                {q}<i className="bi bi-plus-lg text-brand transition group-open:rotate-45" />
              </summary>
              <p className="mb-4 text-[0.96rem] text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy py-12 text-[#9fb0c4]">
        <div className="wrap">
          <div className="mb-8 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3"><img src="/gobir-logo-emblem.png" alt="" className="h-10 w-10 rounded-xl" /><span className="font-serif text-lg font-semibold text-white">Gobir Digital</span></div>
              <p className="mt-3.5 max-w-xs text-[0.92rem]">Friendly, practical coaching in AI and digital skills — helping people and small businesses thrive online.</p>
            </div>
            <div><h4 className="mb-3.5 text-[0.82rem] uppercase tracking-[0.12em] text-white">Learn</h4>{["How to Use AI", "Computer Basics", "Kids Learning", "Promote Your Business"].map((t) => <a key={t} href="#services" className="block py-1 text-[0.94rem] hover:text-brand2">{t}</a>)}</div>
            <div><h4 className="mb-3.5 text-[0.82rem] uppercase tracking-[0.12em] text-white">Visit</h4>{[["How it works", "#how"], ["Contact & location", "#contact"], ["FAQ", "#faq"], ["Book a session", "#book"]].map(([t, h]) => <a key={t} href={h} className="block py-1 text-[0.94rem] hover:text-brand2">{t}</a>)}</div>
          </div>
          <div className="border-t border-white/10 pt-5 text-center text-[0.85rem]">© {new Date().getFullYear()} Gobir Digital · Open daily 4:00pm – 10:00pm (WAT)</div>
        </div>
      </footer>

      <WhatsAppFloat />
      <Reveal />
    </>
  );
}
