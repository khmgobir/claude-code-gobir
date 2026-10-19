"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  api,
  naira,
  priceFor,
  prettyDateSafe,
  REASON_TEXT,
  SLOTS,
  type BookingLookupResponse,
  type BookMode,
  type SlotsResponse,
} from "@/lib/booking";

type View = "lookup" | "details";

export function ManageDialog({
  open,
  onOpenChange,
  initialToken,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialToken?: string;
}) {
  const [token, setToken] = useState("");
  const [view, setView] = useState<View>("lookup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingLookupResponse["booking"] | null>(
    null
  );

  const [reschedDate, setReschedDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsMsg, setSlotsMsg] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [doneMsg, setDoneMsg] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setDoneMsg("");
      if (initialToken) {
        setToken(initialToken);
        void load(initialToken);
      } else {
        setView("lookup");
        setBooking(null);
        setToken("");
      }
    }
  }, [open, initialToken]);

  async function load(t: string) {
    setError("");
    setDoneMsg("");
    if (!t.trim()) {
      setError("Please paste your booking reference.");
      return;
    }
    setBusy(true);
    try {
      const r = await api<BookingLookupResponse>("booking", { token: t.trim() });
      if (r.ok && r.found && r.booking) {
        setBooking(r.booking);
        setView("details");
      } else {
        setError("We couldn't find a booking with that reference. Check the email we sent you.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function fetchSlots(date: string) {
    if (!booking || !date) return;
    setSlots([]);
    setReschedTime("");
    setSlotsMsg("Checking free times…");
    try {
      const r = await api<SlotsResponse>("slots", {
        date,
        mode: booking.mode || "Online",
      });
      if (r.ok && r.open && r.slots?.length) {
        setSlots(r.slots);
        setSlotsMsg("");
      } else {
        setSlotsMsg("No free times that day, try another date.");
      }
    } catch (e) {
      setSlotsMsg((e as Error).message);
    }
  }

  async function reschedule() {
    if (!booking || !reschedDate || !reschedTime) return;
    setBusy(true);
    setError("");
    try {
      const r = await api<{ ok: boolean; reason?: string }>("reschedule", {
        token,
        date: reschedDate,
        time: reschedTime,
      });
      if (r.ok) {
        setDoneMsg(`Moved to ${prettyDateSafe(reschedDate)} at ${reschedTime}. A fresh confirmation email is on its way.`);
        setBooking({ ...booking, date: reschedDate, time: reschedTime });
        setReschedDate("");
        setSlots([]);
        setReschedTime("");
      } else {
        setError(REASON_TEXT[r.reason ?? ""] ?? "Couldn't reschedule, try again.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    setError("");
    try {
      const r = await api<{ ok: boolean; reason?: string }>("cancel", { token });
      if (r.ok) {
        setDoneMsg("Booking cancelled. You can book again any time.");
        setBooking(null);
        setView("lookup");
      } else {
        setError(REASON_TEXT[r.reason ?? ""] ?? "Couldn't cancel, try again.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDate = today.toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Manage your booking</DialogTitle>
          <DialogDescription>
            Enter the booking reference from your confirmation email.
          </DialogDescription>
        </DialogHeader>

        {doneMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-brand-green/30 bg-brand-green/5 px-4 py-3 text-sm text-brand-green-deep">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            {doneMsg}
          </div>
        )}

        {view === "lookup" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mg-token">Booking reference</Label>
              <Input
                id="mg-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 8f3a92c1de"
                className="h-11 rounded-xl font-mono uppercase"
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button
              onClick={() => load(token)}
              disabled={busy}
              className="bg-brand-gradient h-11 w-full rounded-full font-semibold text-white"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Find my booking
            </Button>
          </div>
        )}

        {view === "details" && booking && (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
              <div className="font-display text-base font-bold">{booking.name}</div>
              <div className="mt-1 text-muted-foreground">{booking.topic}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  {prettyDateSafe(booking.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {booking.time}
                </span>
                <span>{booking.mode}</span>
                <span>
                  {booking.people}{" "}
                  {Number(booking.people) > 1 ? "people" : "person"} ·{" "}
                  {naira(priceFor(Number(booking.people)))}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Reschedule, pick a new date</Label>
              <Input
                type="date"
                min={minDate}
                className="h-11 rounded-xl"
                value={reschedDate}
                onChange={(e) => {
                  setReschedDate(e.target.value);
                  if (e.target.value) void fetchSlots(e.target.value);
                }}
              />
              {slotsMsg && (
                <p className="text-xs text-muted-foreground">{slotsMsg}</p>
              )}
              {slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {SLOTS.map((s) => {
                    const free = slots.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!free}
                        onClick={() => setReschedTime(s)}
                        className={`rounded-xl border px-2 py-2 text-[13px] font-semibold transition-all ${
                          reschedTime === s
                            ? "border-transparent bg-brand-gradient text-white"
                            : free
                              ? "bg-white hover:border-primary/40"
                              : "cursor-not-allowed bg-muted/50 text-muted-foreground/50 line-through"
                        }`}
                      >
                        {s.replace(":00", "")}
                      </button>
                    );
                  })}
                </div>
              )}
              <Button
                onClick={reschedule}
                disabled={busy || !reschedDate || !reschedTime}
                className="bg-brand-gradient h-11 w-full rounded-full font-semibold text-white"
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Move to {reschedDate ? prettyDateSafe(reschedDate) : "…"} {reschedTime}
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              variant="outline"
              onClick={cancel}
              disabled={busy}
              className="h-11 w-full rounded-full border-destructive/40 font-semibold text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel this booking
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
