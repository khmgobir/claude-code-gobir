"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const SLOTS = ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"];

export default function Owner() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState<boolean | null>(null);
  const [loginMsg, setLoginMsg] = useState("");
  const [panelMsg, setPanelMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [blkDate, setBlkDate] = useState("");
  const [blkTime, setBlkTime] = useState("");
  const [blkMsg, setBlkMsg] = useState("");
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  function loadStatus(p: string) {
    setLoginMsg("Checking…");
    api<any>({ action: "ownerstatus", pin: p })
      .then((r) => { if (r && r.ok) { localStorage.setItem("gobirPin", p); setPin(p); setUnlocked(true); setOpen(!!r.open); setLoginMsg(""); } else lock("Wrong PIN. Try again."); })
      .catch(() => setLoginMsg("Couldn't reach the server."));
  }
  function lock(m: string) { localStorage.removeItem("gobirPin"); setUnlocked(false); setPin(""); setLoginMsg(m); }
  useEffect(() => { const p = localStorage.getItem("gobirPin"); if (p) loadStatus(p); /* eslint-disable-next-line */ }, []);

  function toggle() {
    setBusy(true); setPanelMsg("Updating…");
    api<any>({ action: "setopen", pin, value: open ? "no" : "yes" })
      .then((r) => { if (r && r.ok) { setOpen(!!r.open); setPanelMsg("Saved ✓"); } else lock("Session expired — enter PIN again."); })
      .catch(() => setPanelMsg("Couldn't update. Try again."))
      .finally(() => setBusy(false));
  }
  function block(add: boolean) {
    if (!blkDate) { setBlkMsg("Pick a date."); return; }
    setBlkMsg(add ? "Blocking…" : "Unblocking…");
    api<any>({ action: add ? "setblock" : "unsetblock", pin, date: blkDate, time: blkTime })
      .then((r) => { if (r && r.ok) setBlkMsg(`${add ? "Blocked" : "Unblocked"} ${blkDate}${blkTime ? " " + blkTime : " (whole day)"} ✓`); else lock("Session expired."); })
      .catch(() => setBlkMsg("Something went wrong."));
  }

  return (
    <main className="grid min-h-[100svh] place-items-center bg-[radial-gradient(1000px_500px_at_50%_-10%,rgba(31,143,239,.22),transparent),linear-gradient(180deg,#0a1733,#0e1f3d)] p-5 text-[#eaf2fb]">
      <div className="w-full max-w-sm rounded-[22px] border border-white/15 bg-white/[.05] p-7 text-center shadow-lift">
        <img src="/gobir-logo-emblem.png" alt="Gobir Digital" className="mx-auto mb-3.5 h-[72px] w-[72px] rounded-[18px] shadow-lift" />
        <h1 className="text-xl font-bold">Owner control</h1>
        <p className="mb-5 text-sm text-[#9fb4d0]">Open or close bookings in one tap.</p>

        {!unlocked ? (
          <div>
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadStatus(pin)} placeholder="••••"
              className="w-full rounded-xl border-[1.5px] border-white/15 bg-white/[.07] p-3.5 text-center text-lg tracking-widest text-white outline-none focus:border-brand2" />
            <button onClick={() => pin && loadStatus(pin)} className="btn-blue mt-3.5 w-full"><i className="bi bi-unlock" /> Unlock</button>
            {loginMsg && <p className="mt-3 text-sm text-[#ff8a95]">{loginMsg}</p>}
          </div>
        ) : (
          <div>
            <div className={`mb-1 flex items-center justify-center gap-2.5 rounded-2xl p-5 text-2xl font-extrabold ${open ? "border border-[#1fb67a]/50 bg-[#1fb67a]/15 text-[#44e3a3]" : "border border-[#ef4b5b]/50 bg-[#ef4b5b]/15 text-[#ff8a95]"}`}>
              <i className={`bi ${open ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} /> {open ? "OPEN" : "CLOSED"}
            </div>
            <p className="mb-2 text-sm text-[#9fb4d0]">{open ? "Clients can book sessions." : "New bookings are turned off."}</p>
            <button onClick={toggle} disabled={busy} className={`btn w-full text-white ${open ? "bg-gradient-to-br from-[#e23b4c] to-[#ff6676]" : "bg-gradient-to-br from-[#17a06c] to-[#28c98a]"}`}>
              <i className={`bi ${open ? "bi-lock" : "bi-unlock"}`} /> {open ? "Close booking" : "Open booking"}
            </button>
            {panelMsg && <p className="mt-3 text-sm text-[#9fb4d0]">{panelMsg}</p>}

            <div className="mt-6 border-t border-white/15 pt-5 text-left">
              <b className="mb-1.5 block text-[0.95rem] text-[#cfe0f5]">Block a specific day / time</b>
              <label className="text-xs font-semibold text-[#cfe0f5]">Date</label>
              <input type="date" min={today} value={blkDate} onChange={(e) => setBlkDate(e.target.value)} className="mt-1 w-full rounded-xl border-[1.5px] border-white/15 bg-white/[.07] p-3 text-white outline-none focus:border-brand2" />
              <label className="mt-2.5 block text-xs font-semibold text-[#cfe0f5]">Time (optional)</label>
              <select value={blkTime} onChange={(e) => setBlkTime(e.target.value)} className="mt-1 w-full rounded-xl border-[1.5px] border-white/15 bg-white/[.07] p-3 text-white outline-none focus:border-brand2">
                <option value="" className="text-black">Whole day</option>
                {SLOTS.map((t) => <option key={t} className="text-black">{t}</option>)}
              </select>
              <div className="mt-3 flex gap-2.5">
                <button onClick={() => block(true)} className="btn flex-1 bg-gradient-to-br from-[#e23b4c] to-[#ff6676] text-white"><i className="bi bi-slash-circle" /> Block</button>
                <button onClick={() => block(false)} className="btn flex-1 bg-gradient-to-br from-[#17a06c] to-[#28c98a] text-white"><i className="bi bi-check2-circle" /> Unblock</button>
              </div>
              {blkMsg && <p className="mt-2 text-sm text-[#9fb4d0]">{blkMsg}</p>}
            </div>

            <button onClick={() => lock("")} className="mt-4 text-sm text-[#9fb4d0] underline">Lock / change PIN</button>
          </div>
        )}
        <div className="mt-4 text-xs text-[#9fb4d0]">Bookmark this page · <a href="/" className="text-brand2">View site</a></div>
      </div>
    </main>
  );
}
