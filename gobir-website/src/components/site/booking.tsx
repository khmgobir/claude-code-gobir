"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  Copy,
  Check,
  Clock3,
  ExternalLink,
  Loader2,
  Lock,
  MessageCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, SectionHeading } from "./reveal";
import {
  api,
  naira,
  priceFor,
  REASON_TEXT,
  SLOTS,
  TOPICS,
  WHATSAPP_LINK,
  type BookResponse,
  type BookMode,
  type SlotsResponse,
} from "@/lib/booking";

function todayISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function prettyDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

type Stage = "form" | "submitting" | "done";

export function Booking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<BookMode>("Online");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState(1);
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [slotsState, setSlotsState] = useState<{
    loading: boolean;
    open: boolean | null;
    slots: string[];
    error: string | null;
  }>({ loading: false, open: null, slots: [], error: null });

  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [agree, setAgree] = useState(false);

  // date min is client-only to avoid SSR/CSR timezone hydration mismatch
  const [minDate, setMinDate] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setMinDate(todayISO()), 0);
    return () => window.clearTimeout(id);
  }, []);
  const total = priceFor(people);

  // fetch free slots whenever date/mode changes
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    // defer state reset to the next tick (avoids cascading renders)
    const kick = window.setTimeout(() => {
      setSlotsState({ loading: true, open: null, slots: [], error: null });
      setTime("");
    }, 0);
    api<SlotsResponse>("slots", { date, mode })
      .then((r) => {
        if (cancelled) return;
        setSlotsState({
          loading: false,
          open: !!r.open,
          slots: Array.isArray(r.slots) ? r.slots : [],
          error: null,
        });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setSlotsState({ loading: false, open: null, slots: [], error: e.message });
      });
    return () => {
      cancelled = true;
      window.clearTimeout(kick);
    };
  }, [date, mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim() || !phone.trim() || !email.trim() || !topic || !date || !time) {
      setErrorMsg("Please fill in every required field (and pick a time slot).");
      return;
    }
    if (!agree) {
      setErrorMsg("Please agree to the privacy note so we can arrange your session.");
      return;
    }
    setStage("submitting");
    try {
      const res = await api<BookResponse>("book", {
        name,
        phone,
        email,
        topic,
        mode,
        date,
        time,
        people,
        total,
        notes,
        address: mode === "In person" ? address : "",
        company, // honeypot — bots only
      });
      if (res.ok && res.token) {
        setToken(res.token);
        setStage("done");
      } else {
        setStage("form");
        setErrorMsg(
          REASON_TEXT[res.reason ?? ""] ??
            "Something went wrong. Please try again or WhatsApp us."
        );
      }
    } catch (err) {
      setStage("form");
      setErrorMsg((err as Error).message);
    }
  }

  const formInput =
    "h-11 rounded-xl border-input bg-white/80 text-[15px] focus-visible:ring-primary/40";

  return (
    <section id="book" className="relative py-16 sm:py-24" aria-label="Book a session">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-mesh opacity-60" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Book now"
          title={
            <>
              Reserve your <span className="text-gradient">session</span>
            </>
          }
          sub="Pick a date — you'll only see times that are free. Quick, easy, and you can bring others."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Info panel */}
          <Reveal>
            <div className="flex h-full flex-col gap-4">
              <div className="bg-brand-gradient rounded-3xl p-7 text-white shadow-brand">
                <h3 className="font-display text-xl font-bold">
                  Book in under 2 minutes
                </h3>
                <ul className="mt-5 space-y-4 text-sm">
                  {[
                    {
                      icon: Clock3,
                      t: "60-minute sessions",
                      s: "Focused and hands-on",
                    },
                    {
                      icon: CalendarDays,
                      t: "Daily, 4:00pm – 10:00pm",
                      s: "Nigeria time (WAT)",
                    },
                    {
                      icon: Users,
                      t: `${naira(5000)} solo · ${naira(10000)} group`,
                      s: "2–5 people = flat ₦10k · pay after",
                    },
                    {
                      icon: BadgeCheck,
                      t: "Online up to 5 · in-person 1",
                      s: "You'll get email confirmation instantly",
                    },
                  ].map((r) => (
                    <li key={r.t} className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                        <r.icon className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <div className="font-semibold">{r.t}</div>
                        <div className="text-white/75">{r.s}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 rounded-3xl border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Lock className="h-4 w-4 text-brand-green" />
                  Private &amp; secure
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Your details are only used to arrange and deliver your session —
                  never sold or shared. You&apos;ll get a private link to cancel or
                  reschedule any time.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-green-deep hover:text-brand-green-deep"
                >
                  <MessageCircle className="h-4 w-4" />
                  Questions? WhatsApp us first
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Form panel */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border bg-card p-6 shadow-brand sm:p-8">
              <AnimatePresence mode="wait">
                {stage === "done" ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 text-center"
                  >
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-cyan text-white shadow-brand">
                      <BadgeCheck className="h-8 w-8" />
                    </span>
                    <h3 className="font-display mt-5 text-2xl font-bold">
                      You&apos;re booked! 🎉
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      {topic || "Your session"} · {prettyDate(date)} at {time} ·{" "}
                      {mode}. A confirmation email is on its way with payment details
                      and your private manage link.
                    </p>
                    <div className="mx-auto mt-5 flex max-w-xs items-center justify-between gap-2 rounded-2xl border bg-muted/50 px-4 py-3">
                      <div className="text-left">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Booking reference
                        </div>
                        <div className="font-mono text-sm font-bold">{token}</div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(token);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1600);
                        }}
                        aria-label="Copy booking reference"
                        className="grid h-9 w-9 place-items-center rounded-xl border bg-white transition hover:bg-primary/5"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-brand-green" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                      <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                        <Button className="rounded-full bg-gradient-to-br from-brand-green to-brand-wa px-6 font-semibold text-white">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message us on WhatsApp
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        className="rounded-full px-6 font-semibold"
                        onClick={() => {
                          setStage("form");
                          setToken("");
                          setName("");
                          setPhone("");
                          setEmail("");
                          setTopic("");
                          setDate("");
                          setTime("");
                          setNotes("");
                          setAddress("");
                          setAgree(false);
                        }}
                      >
                        Book another session
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={submit}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="mb-2">
                      <h3 className="font-display text-lg font-bold">Booking details</h3>
                      <p className="text-xs text-muted-foreground">
                        Fields marked * are required.
                      </p>
                    </div>

                    {/* honeypot — hidden from humans */}
                    <input
                      type="text"
                      name="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                      aria-hidden="true"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="bk-name">Full name *</Label>
                        <Input
                          id="bk-name"
                          className={formInput}
                          placeholder="e.g. Aisha Bello"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bk-phone">Phone / WhatsApp *</Label>
                        <Input
                          id="bk-phone"
                          className={formInput}
                          type="tel"
                          placeholder="0801 234 5678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bk-email">Email *</Label>
                      <Input
                        id="bk-email"
                        className={formInput}
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bk-topic">What do you want to learn? *</Label>
                      <div className="relative">
                        <select
                          id="bk-topic"
                          className="h-11 w-full appearance-none rounded-xl border border-input bg-white/80 px-3.5 pr-10 text-[15px] shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          required
                        >
                          <option value="">Choose a topic…</option>
                          {TOPICS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>How would you like to meet? *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Online", "In person"] as BookMode[]).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setMode(m);
                              // In-person sessions are exclusive → 1 person only
                              if (m === "In person") setPeople(1);
                            }}
                            aria-pressed={mode === m}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                              mode === m
                                ? "border-transparent bg-brand-gradient text-white shadow-soft"
                                : "bg-white/80 hover:bg-primary/5"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      {mode === "In person" && (
                        <p className="pt-1 text-xs text-muted-foreground">
                          In-person sessions are exclusive — just you. Tell us where
                          to meet:
                        </p>
                      )}
                      {mode === "In person" && (
                        <Input
                          className={formInput}
                          placeholder="Your address (area / landmark, Sokoto)"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="bk-date">Preferred date *</Label>
                        <Input
                          id="bk-date"
                          type="date"
                          min={minDate}
                          className={formInput}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[
                            { label: "Today", days: 0 },
                            { label: "Tomorrow", days: 1 },
                            { label: "In 2 days", days: 2 },
                            { label: "In 3 days", days: 3 },
                          ].map((q) => (
                            <button
                              key={q.days}
                              type="button"
                              onClick={() => setDate(isoPlusDays(q.days))}
                              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                date === isoPlusDays(q.days)
                                  ? "border-transparent bg-brand-gradient text-white shadow-soft"
                                  : "bg-white/80 text-foreground/70 hover:border-primary/40 hover:bg-primary/5"
                              }`}
                            >
                              {q.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="bk-people">Number of people *</Label>
                        <div className="relative">
                          <select
                            id="bk-people"
                            className="h-11 w-full appearance-none rounded-xl border border-input bg-white/80 px-3.5 pr-10 text-[15px] shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                            value={people}
                            onChange={(e) => setPeople(Number(e.target.value))}
                            disabled={mode === "In person"}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n === 1 ? "Just me (1)" : `${n} people`}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* slots */}
                    <div className="space-y-1.5">
                      <Label>Time slot *</Label>
                      {!date ? (
                        <p className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                          Pick a date first — then we&apos;ll show the free times.
                        </p>
                      ) : slotsState.loading ? (
                        <div className="flex items-center gap-2 rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Checking free times…
                        </div>
                      ) : slotsState.error ? (
                        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          {slotsState.error}
                        </div>
                      ) : slotsState.open === false || slotsState.slots.length === 0 ? (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
                          {slotsState.open === false
                            ? "Bookings are closed for this date (or fully booked). Try another day."
                            : "No free times on this date — try another day."}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {SLOTS.map((s) => {
                            const free = slotsState.slots.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                disabled={!free}
                                onClick={() => setTime(s)}
                                aria-pressed={time === s}
                                className={`rounded-xl border px-2 py-2.5 text-[13px] font-semibold transition-all ${
                                  time === s
                                    ? "border-transparent bg-brand-gradient text-white shadow-soft"
                                    : free
                                      ? "bg-white/80 hover:border-primary/40 hover:bg-primary/5"
                                      : "cursor-not-allowed bg-muted/50 text-muted-foreground/50 line-through"
                                }`}
                              >
                                {s.replace(":00", "")}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bk-notes">Anything we should know? (optional)</Label>
                      <Textarea
                        id="bk-notes"
                        className="min-h-[76px] rounded-xl bg-white/80"
                        placeholder="Your goal, current level, or anything to prepare…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-brand-gradient-soft px-4 py-3">
                      <span className="text-sm font-semibold">Estimated total</span>
                      <span className="font-display text-gradient text-2xl font-extrabold">
                        {naira(total)}
                      </span>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f9dff]"
                      />
                      <span>
                        I agree that Gobir Digital may store and use my details{" "}
                        <strong className="font-semibold text-foreground">only</strong>{" "}
                        to arrange and deliver my session.
                      </span>
                    </label>

                    {errorMsg && (
                      <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {errorMsg}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={stage === "submitting"}
                      className="bg-brand-gradient shadow-brand h-12 w-full rounded-full text-base font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-70"
                    >
                      {stage === "submitting" ? (
                        <>
                          <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                          Confirming your booking…
                        </>
                      ) : (
                        <>
                          <CalendarDays className="mr-2 h-4.5 w-4.5" />
                          Confirm booking · {naira(total)}
                        </>
                      )}
                    </Button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      Secure (HTTPS) · stored privately · never sold or shared
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
