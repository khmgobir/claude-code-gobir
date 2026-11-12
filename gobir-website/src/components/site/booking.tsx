"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  Loader2,
  MessageCircle,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  naira,
  manageUrl,
  SLOTS,
  TOPICS,
  waLink,
  type BookMode,
} from "@/lib/booking";
import { useBooking } from "./booking-context";

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

const formInput =
  "h-11 rounded-xl border-input bg-white text-base shadow-sm transition-shadow focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40";
const selectInput =
  "h-11 w-full appearance-none rounded-xl border border-input bg-white px-3.5 pr-10 text-base shadow-sm outline-none transition-shadow focus:border-primary focus:shadow-md focus:ring-2 focus:ring-primary/30";
const labelCls = "text-sm font-semibold text-foreground/90";

export function BookingDialog() {
  const b = useBooking();
  const f = b.fields;

  function nextStep() {
    const err = b.validateStep1();
    if (err) {
      b.setErrorMsg(err);
      return;
    }
    b.setErrorMsg("");
    b.setStep(2);
  }

  return (
    <Dialog open={b.open} onOpenChange={(v) => (v ? b.setOpen(true) : b.closeBooking())}>
      <DialogContent className="max-h-[92dvh] overflow-hidden rounded-3xl p-0 sm:max-w-lg">
        <div className="bg-brand-gradient pointer-events-none absolute inset-x-0 top-0 h-1.5" />
        <DialogHeader className="space-y-0 border-b px-6 pb-4 pt-6 text-left">
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle asChild>
              <div>
                <div className="font-display text-lg font-extrabold leading-tight">
                  {b.stage === "done" ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="bg-brand-gradient grid h-8 w-8 place-items-center rounded-xl text-white">
                        <PartyPopper className="h-4 w-4" />
                      </span>
                      You&apos;re booked!
                    </span>
                  ) : (
                    <>
                      Book your session{" "}
                      <span className="hidden text-muted-foreground sm:inline">
                        · step {b.step} of 2
                      </span>
                    </>
                  )}
                </div>
                <DialogDescription className="mt-1 text-xs">
                  {b.stage === "done"
                    ? "Confirmation is on its way to your email."
                    : b.step === 1
                      ? "Pick what, where and when — under a minute."
                      : "Almost done — just your contact details."}
                </DialogDescription>
              </div>
            </DialogTitle>
            {b.stage !== "done" && (
              <div className="flex items-center gap-1.5 pr-1">
                <span
                  className={`h-2 rounded-full transition-all ${
                    b.step === 1 ? "w-6 bg-brand-gradient" : "w-2 bg-primary/25"
                  }`}
                />
                <span
                  className={`h-2 rounded-full transition-all ${
                    b.step === 2 ? "w-6 bg-brand-gradient" : "w-2 bg-primary/25"
                  }`}
                />
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[60dvh] overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {b.stage === "done" ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-green to-brand-cyan text-white shadow-brand">
                  <BadgeCheck className="h-7 w-7" />
                </span>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {f.topic || "Your session"} · {prettyDate(f.date)} at {f.time} ·{" "}
                  {f.mode}. A confirmation email is on its way with payment details
                  and your private manage link.
                </p>
                <div className="mx-auto mt-4 flex max-w-xs items-center justify-between gap-2 rounded-2xl border bg-muted/50 px-4 py-3">
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Booking reference
                    </div>
                    <div className="font-mono text-sm font-bold">{b.token}</div>
                  </div>
                  <button
                    onClick={b.copyToken}
                    aria-label="Copy booking reference"
                    className="grid h-9 w-9 place-items-center rounded-xl border bg-white transition hover:bg-primary/5"
                  >
                    {b.copied ? (
                      <Check className="h-4 w-4 text-brand-green" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mx-auto mt-2 max-w-xs text-xs text-muted-foreground">
                  Save this reference — you can also manage your session any time at{" "}
                  <a
                    href={manageUrl(b.token)}
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Manage booking
                  </a>
                  .
                </p>
              </motion.div>
            ) : b.step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-4">
                {/* honeypot, hidden from humans */}
                <input
                  type="text"
                  value={f.company}
                  onChange={(e) => b.setField("company", e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="pointer-events-none absolute h-0 w-0 opacity-0"
                  aria-hidden="true"
                />

                <div className="space-y-1.5">
                  <Label className={labelCls}>What do you want to learn? *</Label>
                  <div className="relative">
                    <select
                      aria-label="What do you want to learn?"
                      className={selectInput}
                      value={f.topic}
                      onChange={(e) => b.setField("topic", e.target.value)}
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
                  <Label className={labelCls}>How would you like to meet? *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Online", "In person"] as BookMode[]).map((m) => {
                      const closed =
                        (m === "Online" && !b.avail.online) ||
                        (m === "In person" && !b.avail.inperson);
                      return (
                        <button
                          key={m}
                          type="button"
                          disabled={closed}
                          onClick={() => {
                            if (closed) return;
                            b.setField("mode", m);
                            if (m === "In person") b.setField("people", 1);
                          }}
                          aria-pressed={f.mode === m}
                          title={closed ? `${m} sessions are closed right now` : undefined}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                            closed
                              ? "cursor-not-allowed border-dashed bg-muted/50 text-muted-foreground opacity-60"
                              : f.mode === m
                                ? "border-transparent bg-brand-gradient text-white shadow-soft"
                                : "bg-white/80 hover:bg-primary/5"
                          }`}
                        >
                          {m}
                          {closed ? " · closed" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {f.mode === "In person" && (
                    <Input
                      className={`${formInput} mt-1`}
                      placeholder="Your address (area / landmark, Sokoto)"
                      value={f.address}
                      onChange={(e) => b.setField("address", e.target.value)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className={labelCls}>People</Label>
                    <div className="relative">
                      <select
                        aria-label="Number of people"
                        className={`${selectInput} disabled:opacity-60`}
                        value={f.people}
                        onChange={(e) => b.setField("people", Number(e.target.value))}
                        disabled={f.mode === "In person"}
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
                  <div className="space-y-1.5">
                    <Label htmlFor="bk-date" className={labelCls}>Date *</Label>
                    <Input
                      id="bk-date"
                      type="date"
                      min={b.minDate}
                      className={formInput}
                      value={f.date}
                      onChange={(e) => b.setField("date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Today", days: 0 },
                    { label: "Tomorrow", days: 1 },
                    { label: "In 2 days", days: 2 },
                    { label: "In 3 days", days: 3 },
                  ].map((q) => (
                    <button
                      key={q.days}
                      type="button"
                      onClick={() => b.setField("date", isoPlusDays(q.days))}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        f.date === isoPlusDays(q.days)
                          ? "border-transparent bg-brand-gradient text-white shadow-soft"
                          : "bg-white/80 text-foreground/70 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label className={labelCls}>Time slot *</Label>
                  {!f.date ? (
                    <p className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      Pick a date first, then I&apos;ll show the free times.
                    </p>
                  ) : b.slotsState.loading ? (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking free times…
                    </div>
                  ) : b.slotsState.error ? (
                    <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {b.slotsState.error}
                    </div>
                  ) : b.slotsState.open === false || b.slotsState.slots.length === 0 ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
                      {b.slotsState.open === false
                        ? "Bookings are closed for this date (or fully booked). Try another day."
                        : "No free times on this date, try another day."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {SLOTS.map((s) => {
                        const free = b.slotsState.slots.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={!free}
                            onClick={() => b.setField("time", s)}
                            aria-pressed={f.time === s}
                            className={`rounded-xl border px-2 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                              f.time === s
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

                {b.errorMsg && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {b.errorMsg}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="s2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                id="bk-form"
                onSubmit={(e) => void b.submit(e)}
                className="space-y-4"
                noValidate
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="bk-name" className={labelCls}>Full name *</Label>
                    <Input
                      id="bk-name"
                      className={formInput}
                      placeholder="e.g. Aisha Bello"
                      value={f.name}
                      onChange={(e) => b.setField("name", e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bk-phone" className={labelCls}>Phone / WhatsApp *</Label>
                    <Input
                      id="bk-phone"
                      className={formInput}
                      type="tel"
                      inputMode="tel"
                      placeholder="0801 234 5678"
                      value={f.phone}
                      onChange={(e) => b.setField("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bk-email" className={labelCls}>Email *</Label>
                  <Input
                    id="bk-email"
                    className={formInput}
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={f.email}
                    onChange={(e) => b.setField("email", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your confirmation &amp; private manage link arrive here. No email?{" "}
                    <a
                      href={waLink(
                        "Hello Gobir Digital! I'd like to book a session but I don't use email — please confirm my booking here on WhatsApp."
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Book on WhatsApp instead
                    </a>
                    .
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bk-notes" className={labelCls}>
                    Anything I should know? <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="bk-notes"
                    className="min-h-[64px] rounded-xl bg-white text-base shadow-sm transition-shadow focus-visible:shadow-md"
                    placeholder="Your goal or current level…"
                    value={f.notes}
                    onChange={(e) => b.setField("notes", e.target.value)}
                  />
                </div>

                <div className="flex items-start justify-between gap-3 rounded-2xl bg-brand-gradient-soft px-4 py-3">
                  <div className="text-sm leading-snug">
                    <span className="font-semibold">
                      {f.topic || "Session"} · {prettyDate(f.date)} at {f.time}
                    </span>
                    <br />
                    <span className="text-muted-foreground">
                      {f.people === 1 ? "Solo session" : `Group of ${f.people}`} · {f.mode}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total
                    </div>
                    <div className="font-display text-gradient text-2xl font-extrabold">
                      {naira(b.total)}
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={f.agree}
                    onChange={(e) => b.setField("agree", e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f9dff]"
                  />
                  <span>
                    I agree that Gobir Digital may store and use my details{" "}
                    <strong className="font-semibold text-foreground">only</strong>{" "}
                    to arrange and deliver my session (see our{" "}
                    <a
                      href="/privacy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      privacy policy
                    </a>
                    ).
                  </span>
                </label>

                {b.errorMsg && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {b.errorMsg}
                  </div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {b.stage !== "done" && (
          <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4">
            <div className="text-sm">
              <span className="font-semibold">{naira(b.total)}</span>
              <span className="text-muted-foreground">
                {" "}· pay after booking
              </span>
            </div>
            <div className="flex items-center gap-2">
              {b.step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-4 font-semibold"
                  onClick={() => b.setStep(1)}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
              {b.step === 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-brand-gradient shadow-brand rounded-full px-6 font-semibold text-white"
                >
                  Continue
                  <CalendarDays className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    const form = document.getElementById("bk-form") as HTMLFormElement | null;
                    form?.requestSubmit();
                  }}
                  disabled={b.stage === "submitting"}
                  className="bg-brand-gradient shadow-brand rounded-full px-6 font-semibold text-white disabled:opacity-70"
                >
                  {b.stage === "submitting" ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    <>
                      <CalendarDays className="mr-1.5 h-4 w-4" />
                      Confirm · {naira(b.total)}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {b.stage === "done" && (
          <div className="flex flex-col gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row">
            <a
              href={waLink(
                `Hello Gobir Digital! I just booked a session (reference: ${b.token}). Please confirm my payment details.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full rounded-full bg-gradient-to-br from-brand-green to-brand-wa font-semibold text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp me
              </Button>
            </a>
            <Button
              variant="outline"
              className="flex-1 rounded-full font-semibold"
              onClick={() => {
                b.resetAll();
                b.closeBooking();
              }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
