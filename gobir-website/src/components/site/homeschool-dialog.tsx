"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Baby,
  BadgeCheck,
  CalendarClock,
  Loader2,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HS_PLANS,
  HS_SUBJECTS,
  HS_TIMES,
  hsPriceBreakdown,
  hsTotal,
  submitProgramRequest,
  waProgramLink,
  type HsPlanId,
} from "@/lib/programs";
import { naira } from "@/lib/booking";

const formInput =
  "h-11 rounded-xl border-input bg-white text-base shadow-sm transition-shadow focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40";
const labelCls = "text-sm font-semibold text-foreground/90";

type Stage = "form" | "submitting" | "done";

export function HomeschoolDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [children, setChildren] = useState(1);
  const [ages, setAges] = useState("");
  const [plan, setPlan] = useState<HsPlanId>("standard");
  const [mode, setMode] = useState<"At home (Sokoto)" | "Online">("At home (Sokoto)");
  const [time, setTime] = useState<string>(HS_TIMES[0]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [ref, setRef] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const total = hsTotal(plan, children);

  function toggleSubject(s: string) {
    setSubjects((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg("Please fill in your name, WhatsApp number and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid WhatsApp number.");
      return;
    }
    setStage("submitting");
    const planName = HS_PLANS.find((p) => p.id === plan)?.name ?? plan;
    const summary = `Home Schooling, ${planName} plan, ${children} child${children > 1 ? "ren" : ""}${
      ages ? ` (ages ${ages})` : ""
    }, ${mode}, ${time}${subjects.length ? `, subjects: ${subjects.join(", ")}` : ""}${
      start ? `, start ${start}` : ""
    }${notes ? `. Notes: ${notes}` : ""}`;
    const res = await submitProgramRequest(
      {
        type: "homeschool",
        name,
        phone,
        email,
        details: summary,
        company,
      },
      []
    );
    if (res.ok) {
      setRef(res.ref);
      setConfirmed(res.confirmed);
      setStage("done");
    } else {
      setStage("form");
      setErrorMsg(res.error ?? "Something went wrong. Please try again, or just WhatsApp me.");
    }
  }

  function reset() {
    setName("");
    setPhone("");
    setEmail("");
    setChildren(1);
    setAges("");
    setPlan("standard");
    setMode("At home (Sokoto)");
    setTime(HS_TIMES[0]);
    setSubjects([]);
    setStart("");
    setNotes("");
    setStage("form");
    setErrorMsg("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v && stage === "done") window.setTimeout(reset, 250);
      }}
    >
      <DialogContent className="max-h-[92dvh] overflow-hidden rounded-3xl p-0 sm:max-w-lg">
        <div className="bg-gradient-to-r from-brand-royal to-brand-cyan pointer-events-none absolute inset-x-0 top-0 h-1.5" />
        <div className="relative h-24 overflow-hidden sm:h-28">
          <img
            src="/img/kids-class.webp"
            alt="Children learning together on laptops in a bright classroom"
            loading="lazy"
            className="h-full w-full object-cover object-[50%_26%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent" />
        </div>
        <DialogHeader className="space-y-0 border-b px-6 pb-4 pt-4 text-left">
          <DialogTitle asChild>
            <div className="flex items-center gap-3 pr-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-royal to-brand-cyan text-white shadow-soft">
                <Baby className="h-5 w-5" />
              </span>
              <div>
                <span className="font-display text-lg font-extrabold leading-tight">
                  Home Schooling: request a place
                </span>
                <DialogDescription className="mt-0.5 text-xs">
                  Tell me about your child(ren) and I'll confirm the schedule on WhatsApp within 24 hours.
                </DialogDescription>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[62dvh] overflow-y-auto px-6 py-5">
          {stage === "done" ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-cyan text-white shadow-brand">
                <BadgeCheck className="h-7 w-7" />
              </span>
              <h3 className="font-display mt-3 text-xl font-bold">Request received!</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {confirmed
                  ? "Your request is saved and I've been notified."
                  : "Your request has been sent. If you don't hear from me within 24 hours, tap WhatsApp below."}{" "}
                I&apos;ll confirm your child&apos;s timetable and the start date on WhatsApp.
              </p>
              <div className="mx-auto mt-4 w-fit rounded-2xl border bg-muted/50 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reference
                </span>
                <div className="font-mono text-sm font-bold">{ref}</div>
              </div>
            </motion.div>
          ) : (
            <form id="hs-form" onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" className="pointer-events-none absolute h-0 w-0 opacity-0" aria-hidden="true" />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={labelCls}>Parent / guardian *</Label>
                  <Input className={formInput} placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>WhatsApp number *</Label>
                  <Input className={formInput} type="tel" inputMode="tel" placeholder="0801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Email *</Label>
                <Input className={formInput} type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hs-children" className={labelCls}>Children</Label>
                  <div className="relative">
                    <select id="hs-children" className="h-11 w-full appearance-none rounded-xl border border-input bg-white px-3.5 pr-10 text-base shadow-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/30" value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n === 1 ? "1 child" : `${n} children`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>Ages</Label>
                  <Input className={formInput} placeholder="e.g. 7 and 10" value={ages} onChange={(e) => setAges(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Monthly plan *</Label>
                <div className="grid gap-2">
                  {HS_PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlan(p.id)}
                      aria-pressed={plan === p.id}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                        plan === p.id
                          ? "border-transparent bg-brand-gradient-soft ring-2 ring-primary/50"
                          : "bg-white/80 hover:bg-primary/5"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-bold">
                          {p.name} <span className="font-medium text-muted-foreground">· {p.perWeek} sessions/week</span>
                        </span>
                        <span className="block text-xs text-muted-foreground">{p.blurb}</span>
                      </span>
                      <span className="font-display text-sm font-extrabold text-brand-royal">
                        {naira(p.perChild)}
                        <span className="block text-[10px] font-semibold text-muted-foreground">per child / month</span>
                      </span>
                    </button>
                  ))}
                </div>
                {children > 1 && (
                  <p className="text-xs font-medium text-brand-green-deep">
                    25% sibling discount applied on children 2-4.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Where? *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["At home (Sokoto)", "Online"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      aria-pressed={mode === m}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                        mode === m
                          ? "border-transparent bg-brand-gradient text-white shadow-soft"
                          : "bg-white/80 hover:bg-primary/5"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Best time for lessons</Label>
                <div className="relative">
                  <select aria-label="Best time for lessons" className="h-11 w-full appearance-none rounded-xl border border-input bg-white px-3.5 pr-10 text-base shadow-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/30" value={time} onChange={(e) => setTime(e.target.value)}>
                    {HS_TIMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Focus subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {HS_SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      aria-pressed={subjects.includes(s)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        subjects.includes(s)
                          ? "border-transparent bg-brand-gradient text-white shadow-soft"
                          : "bg-white/80 text-foreground/70 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelCls}>Preferred start</Label>
                  <Input className={formInput} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>Notes</Label>
                  <Input className={formInput} placeholder="Anything I should know" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-brand-gradient-soft px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm">
                  <Wallet className="h-4 w-4 text-brand-royal" />
                  <span className="font-semibold">{hsPriceBreakdown(plan, children)}</span>
                </span>
                <span className="font-display text-gradient text-xl font-extrabold">
                  {naira(total)}<span className="block text-[10px] font-semibold text-muted-foreground">per month</span>
                </span>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                One-off assessment session: {naira(5000)}, credited to your first month if you continue.
              </p>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}
            </form>
          )}
        </div>

        {stage !== "done" ? (
          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Reply within 24h
            </span>
            <Button
              type="button"
              disabled={stage === "submitting"}
              onClick={() => {
                const form = document.getElementById("hs-form") as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              className="bg-gradient-to-r from-brand-royal to-brand-cyan shadow-brand rounded-full px-6 font-semibold text-white disabled:opacity-70"
            >
              {stage === "submitting" ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Request a place"
              )}
            </Button>
          </div>
        ) : (
          <div className="border-t bg-muted/30 px-6 py-4">
            <a href={waProgramLink(ref, `Home Schooling request. My child's details: `)} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full rounded-full bg-gradient-to-br from-brand-green to-brand-wa font-semibold text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                Continue on WhatsApp
              </Button>
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
