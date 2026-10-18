"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ngn } from "@/lib/config";

export default function Admin() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [msg, setMsg] = useState("");
  const [s, setS] = useState<any>(null);

  function load(p: string) {
    setMsg("Loading…");
    api<any>({ action: "stats", pin: p })
      .then((r) => { if (r && r.ok) { localStorage.setItem("gobirPin", p); setPin(p); setUnlocked(true); setS(r); setMsg(""); } else lock("Wrong PIN. Try again."); })
      .catch(() => setMsg("Couldn't reach the server."));
  }
  function lock(m: string) { localStorage.removeItem("gobirPin"); setUnlocked(false); setPin(""); setS(null); setMsg(m); }
  useEffect(() => { const p = localStorage.getItem("gobirPin"); if (p) load(p); /* eslint-disable-next-line */ }, []);

  const cards = s ? [
    ["Revenue this month", ngn(s.revenueMonth), "bi-cash-stack"],
    ["Revenue (all)", ngn(s.revenueTotal), "bi-graph-up-arrow"],
    ["Upcoming sessions", String(s.upcoming), "bi-calendar-event"],
    ["Active bookings", String(s.active), "bi-journal-check"],
    ["People taught", String(s.people), "bi-people-fill"],
  ] : [];

  return (
    <main className="min-h-[100svh] bg-[radial-gradient(1000px_500px_at_50%_-10%,rgba(31,143,239,.18),transparent),linear-gradient(180deg,#0a1733,#0e1f3d)] p-5 text-[#eaf2fb]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <img src="/gobir-logo-emblem.png" alt="" className="h-11 w-11 rounded-xl shadow-lift" />
            <div><h1 className="font-serif text-xl font-semibold">Admin dashboard</h1><p className="text-xs text-[#9fb4d0]">Revenue & this week at a glance</p></div>
          </div>
          {unlocked && <div className="flex gap-3 text-sm"><button onClick={() => load(pin)} className="text-brand2 underline">Refresh</button><a href="/owner/" className="text-brand2 underline">Controls</a><button onClick={() => lock("")} className="text-[#9fb4d0] underline">Lock</button></div>}
        </div>

        {!unlocked ? (
          <div className="mx-auto max-w-sm rounded-[22px] border border-white/15 bg-white/[.05] p-7 text-center shadow-lift">
            <i className="bi bi-shield-lock mb-2 block text-3xl text-brand2" />
            <p className="mb-3 text-sm text-[#9fb4d0]">Enter your PIN to view the dashboard.</p>
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && pin && load(pin)} placeholder="••••"
              className="w-full rounded-xl border-[1.5px] border-white/15 bg-white/[.07] p-3.5 text-center text-lg tracking-widest text-white outline-none focus:border-brand2" />
            <button onClick={() => pin && load(pin)} className="btn-blue mt-3.5 w-full"><i className="bi bi-unlock" /> Unlock</button>
            {msg && <p className="mt-3 text-sm text-[#ff8a95]">{msg}</p>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cards.map(([label, val, icon]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[.05] p-4">
                  <i className={`bi ${icon} text-xl text-brand2`} />
                  <div className="mt-1 font-serif text-2xl font-semibold text-white">{val}</div>
                  <div className="text-xs text-[#9fb4d0]">{label}</div>
                </div>
              ))}
            </div>

            <h2 className="mb-2 mt-7 font-serif text-lg font-semibold">This week's schedule</h2>
            {!s.week || s.week.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm text-[#9fb4d0]">No sessions in the next 7 days.</p>
            ) : (
              <ul className="space-y-2">
                {s.week.map((b: any, i: number) => (
                  <li key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] p-3 text-sm">
                    <div>
                      <b className="text-white">{b.date} · {b.time}</b>
                      <div className="text-[#cfe0f5]">{b.name} — {b.topic}</div>
                    </div>
                    <span className="rounded-full bg-brand/15 px-3 py-1 text-xs text-brand2">{b.mode} · {b.people}p</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-6 text-center text-xs text-[#9fb4d0]">Full charts & records live in your Google Sheet (Summary / Analytics tabs).</p>
          </>
        )}
      </div>
    </main>
  );
}
