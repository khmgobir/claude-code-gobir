"use client";

import { useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CalendarOff,
  Loader2,
  Lock,
  Power,
  Trash2,
  TrendingUp,
  Unlock,
  Users,
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
  SLOTS,
  naira,
  prettyDateSafe,
  type OwnerStatusResponse,
  type StatsResponse,
} from "@/lib/booking";

export function OwnerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [inperson, setInperson] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");

  const [delToken, setDelToken] = useState("");

  const [stats, setStats] = useState<StatsResponse | null>(null);

  async function loadStats() {
    try {
      const r = await api<StatsResponse>("stats", { pin });
      if (r && r.ok) setStats(r);
    } catch {
      /* keep dashboard hidden if it fails */
    }
  }

  async function login() {
    setBusy(true);
    setError("");
    try {
      const r = await api<OwnerStatusResponse>("ownerstatus", { pin });
      if (r.ok) {
        setAuthed(true);
        setIsOpen(!!r.open);
        setOnline(!!(r as any).online);
        setInperson(!!(r as any).inperson);
        loadStats();
      } else {
        setError("Wrong PIN. Try again.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleOpen(which: "all" | "online" | "inperson", next: boolean) {
    setBusy(true);
    setError("");
    try {
      const r = await api<any>("setopen", { pin, which, value: next ? "YES" : "NO" });
      if (r.ok) {
        setIsOpen(!!r.open);
        setOnline(!!r.online);
        setInperson(!!r.inperson);
        const label = which === "online" ? "Online" : which === "inperson" ? "In-person" : "All";
        setMsg(`${label} bookings are now ${next ? "OPEN" : "CLOSED"}.`);
      } else setError("Couldn't update, check PIN.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeBooking() {
    const token = delToken.trim();
    if (!token) {
      setError("Enter the booking reference to remove.");
      return;
    }
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Permanently delete booking ${token}? This removes the row and its calendar event, and can't be undone.`
      )
    )
      return;
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const r = await api<{ ok: boolean; name?: string; reason?: string }>("delete", {
        pin,
        token,
      });
      if (r.ok) {
        setMsg(`Deleted booking ${token}${r.name ? ` (${r.name})` : ""}.`);
        setDelToken("");
        loadStats();
      } else if (r.reason === "notfound") {
        setError(`No booking found with reference ${token}.`);
      } else {
        setError("Couldn't delete that booking, check the reference.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function block() {
    if (!blockDate) {
      setError("Pick a date to block first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api<{ ok: boolean }>("setblock", {
        pin,
        date: blockDate,
        time: blockTime,
      });
      if (r.ok) {
        setMsg(
          blockTime
            ? `Blocked ${blockDate} at ${blockTime}.`
            : `Blocked the whole day ${blockDate}.`
        );
      } else setError("Couldn't block that date.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function unblock() {
    if (!blockDate) {
      setError("Pick the date to unblock first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api<{ ok: boolean }>("unsetblock", {
        pin,
        date: blockDate,
        time: blockTime,
      });
      if (r.ok) setMsg(`Unblocked ${blockDate}${blockTime ? ` at ${blockTime}` : ""}.`);
      else setError("Couldn't unblock.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-primary" /> Owner console
          </DialogTitle>
          <DialogDescription>
            Open / close bookings and block dates. Changes apply instantly.
          </DialogDescription>
        </DialogHeader>

        {!authed ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ow-pin">Owner PIN</Label>
              <Input
                id="ow-pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="Your PIN"
                className="h-11 rounded-xl"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
            <Button
              onClick={login}
              disabled={busy}
              className="bg-brand-gradient h-11 w-full rounded-full font-semibold text-white"
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Unlock console
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {msg && (
              <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 px-4 py-3 text-sm text-brand-green-deep">
                {msg}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            {stats && (
              <div className="space-y-3 rounded-2xl border bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <TrendingUp className="h-4 w-4 text-primary" /> At a glance
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="text-xs text-muted-foreground">Revenue this month</div>
                    <div className="font-display text-lg font-bold text-brand-green-deep">
                      {naira(stats.revenueMonth)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="text-xs text-muted-foreground">Revenue all time</div>
                    <div className="font-display text-lg font-bold">
                      {naira(stats.revenueTotal)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="text-xs text-muted-foreground">Upcoming sessions</div>
                    <div className="font-display text-lg font-bold">{stats.upcoming}</div>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" /> People booked
                    </div>
                    <div className="font-display text-lg font-bold">{stats.people}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 pb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5" /> This week
                  </div>
                  {stats.week.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No sessions booked in the next 7 days.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {stats.week.map((w, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs shadow-sm"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{w.name}</div>
                            <div className="truncate text-muted-foreground">
                              {w.topic} · {w.mode}
                              {Number(w.people) > 1 ? ` · ${w.people} people` : ""}
                            </div>
                            {w.token ? (
                              <button
                                type="button"
                                onClick={() => setDelToken(w.token!)}
                                title="Use this reference in Remove a booking"
                                className="mt-0.5 font-mono text-[10px] text-primary hover:underline"
                              >
                                {w.token}
                              </button>
                            ) : null}
                          </div>
                          <div className="shrink-0 pl-2 text-right">
                            <div className="font-semibold">{prettyDateSafe(w.date)}</div>
                            <div className="text-muted-foreground">{w.time}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {([
                ["All bookings (master)", "all", isOpen],
                ["Online sessions", "online", online],
                ["In-person sessions", "inperson", inperson],
              ] as const).map(([label, which, state]) => (
                <div key={which} className="flex items-center justify-between rounded-2xl border p-4">
                  <div>
                    <div className="text-sm font-bold">{label}</div>
                    <div className={`text-xs font-semibold ${state ? "text-brand-green-deep" : "text-destructive"}`}>
                      {state === null ? "-" : state ? "OPEN" : "CLOSED"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy || state === true} onClick={() => toggleOpen(which, true)}
                      className="h-9 rounded-full bg-brand-green px-4 text-white hover:bg-brand-green-deep">
                      <Power className="mr-1 h-3.5 w-3.5" /> Open
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy || state === false} onClick={() => toggleOpen(which, false)}
                      className="h-9 rounded-full border-destructive/40 px-4 text-destructive hover:bg-destructive/5">
                      <Unlock className="mr-1 h-3.5 w-3.5" /> Close
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CalendarOff className="h-4 w-4 text-primary" />
                Block / unblock a date
              </div>
              <div className="mt-3 space-y-2.5">
                <Input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="h-10 rounded-xl"
                />
                <select
                  value={blockTime}
                  onChange={(e) => setBlockTime(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
                >
                  <option value="">Whole day</option>
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s} only
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={block}
                    disabled={busy}
                    className="bg-brand-gradient h-9 flex-1 rounded-full text-white"
                  >
                    Block
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={unblock}
                    disabled={busy}
                    className="h-9 flex-1 rounded-full"
                  >
                    Unblock
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-destructive/25 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-destructive">
                <Trash2 className="h-4 w-4" />
                Remove a booking
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Deletes the row and its calendar event for good — use it to clear
                test or duplicate bookings.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  value={delToken}
                  onChange={(e) => setDelToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && removeBooking()}
                  placeholder="Booking reference"
                  className="h-10 flex-1 rounded-xl font-mono"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={removeBooking}
                  disabled={busy}
                  className="h-10 rounded-full border-destructive/40 px-4 text-destructive hover:bg-destructive/5"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
