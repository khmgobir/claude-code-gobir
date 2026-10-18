"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { CONFIG, priceFor, ngn, waLink } from "@/lib/config";

type Msg = { type: "ok" | "err" | "info"; html: string } | null;

const TOPICS = [
  "How to Use AI",
  "Computer Basics & Skills",
  "Turn Your Idea Into Reality",
  "Promote Your Business Online",
  "Kids Digital Learning (personalised)",
  "Not sure yet — help me choose",
];

export default function Booking() {
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const [f, setF] = useState({
    name: "", phone: "", email: "", topic: "", mode: "Online",
    date: "", time: "", people: "1", notes: "", address: "", company: "",
  });
  const [consent, setConsent] = useState(false);
  const [prices, setPrices] = useState({ solo: CONFIG.pricePerSeat, group: CONFIG.groupPrice, duration: 60 });
  useEffect(() => {
    api<any>({ action: "config" }).then((r) => { if (r && r.ok) setPrices({ solo: +r.priceSolo || CONFIG.pricePerSeat, group: +r.priceGroup || CONFIG.groupPrice, duration: +r.duration || 60 }); }).catch(() => {});
  }, []);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotMsg, setSlotMsg] = useState("");
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const isPerson = f.mode.toLowerCase().includes("person");
  const total = (parseInt(f.people, 10) || 1) > 1 ? prices.group : prices.solo;
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  const loadSlots = useCallback((date: string, mode: string) => {
    if (!date) { setSlots([]); setSlotMsg(""); return; }
    if (!CONFIG.scriptUrl) { setSlots(CONFIG.baseSlots); setSlotMsg(""); return; }
    setSlotLoading(true); setSlotMsg("Checking availability…");
    api<any>({ action: "slots", date, mode })
      .then((r) => {
        if (r.open === false) { setSlots([]); setSlotMsg("CLOSED:Booking is closed for this date."); }
        else if (!r.slots || !r.slots.length) { setSlots([]); setSlotMsg("CLOSED:Fully booked — try another date."); }
        else { setSlots(r.slots); setSlotMsg(`OK:${r.slots.length} time${r.slots.length > 1 ? "s" : ""} available`); }
      })
      .catch(() => { setSlots(CONFIG.baseSlots); setSlotMsg(""); })
      .finally(() => setSlotLoading(false));
  }, []);

  useEffect(() => { if (f.date) loadSlots(f.date, f.mode); set("time", ""); /* eslint-disable-next-line */ }, [f.date, f.mode]);

  // manage link in URL
  const [manageToken, setManageToken] = useState<string | null>(null);
  useEffect(() => {
    const m = /[?&]manage=([^&#]+)/.exec(window.location.search);
    if (m) setManageToken(decodeURIComponent(m[1]));
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.company) { setMsg({ type: "ok", html: "<b>Booking received!</b>" }); return; }
    if (!f.name || !f.phone || !f.email || !f.topic || !f.date || !f.time || !consent || (isPerson && !f.address)) {
      setMsg({ type: "err", html: "Please fill in all required fields." });
      return;
    }
    const data: any = { ...f, total };
    setSubmitting(true); setMsg(null);
    if (!CONFIG.scriptUrl) { fallbackWa(data); setSubmitting(false); return; }
    api<any>({ action: "book", ...data })
      .then((r) => {
        if (r && r.ok) {
          const link = `${location.origin}${location.pathname}?manage=${encodeURIComponent(r.token || "")}`;
          setMsg({
            type: "ok",
            html:
              `<b>Booking confirmed! ✅</b><br>Thank you, ${esc((f.name || "").split(" ")[0])}. We've emailed your confirmation` +
              (r.token ? " and cancel/reschedule link" : "") + ".<br>" +
              (r.token ? `Keep this link: <a class="underline font-semibold" href="${link}">${link}</a>` : ""),
          });
          setF((s) => ({ ...s, name: "", phone: "", email: "", topic: "", date: "", time: "", notes: "", address: "" }));
          setConsent(false); setSlots([]); setSlotMsg("");
        } else if (r && r.reason === "taken") { setMsg({ type: "err", html: "<b>Sorry — that time was just booked.</b> Please choose another slot." }); loadSlots(f.date, f.mode); }
        else if (r && r.reason === "closed") { setMsg({ type: "err", html: "<b>Booking is closed for that date.</b>" }); }
        else fallbackWa(data);
      })
      .catch(() => fallbackWa(data))
      .finally(() => setSubmitting(false));
  }

  function fallbackWa(d: any) {
    if (CONFIG.whatsapp) window.open(waLink(waText(d)), "_blank", "noopener");
    setMsg({ type: "info", html: "<b>Almost there.</b> We couldn't reach the server, so we've opened WhatsApp with your details — just hit send." });
  }

  return (
    <section id="book" className="bg-gradient-to-b from-cream to-[#e3ebf7] py-20">
      <div className="wrap grid items-start gap-10 md:grid-cols-[.85fr_1.15fr]">
        <div className="reveal">
          <span className="eyebrow"><i className="bi bi-calendar-check" /> Book now</span>
          <h2 className="h2 mt-3">Reserve your session</h2>
          <p className="mt-3 text-[1.04rem] text-muted">Pick a date — you'll only see times that are free. Quick, easy, and you can bring others.</p>
          <ul className="mt-5 space-y-0">
            <InfoRow icon="bi-clock-history" b={`${prices.duration}-minute sessions`} s="Focused and hands-on" />
            <InfoRow icon="bi-sunset" b="Daily, 4:00pm – 10:00pm" s="Nigeria time (WAT)" />
            <InfoRow icon="bi-cash-coin" b={`${ngn(prices.solo)} solo · ${ngn(prices.group)} group`} s={`2–5 people = flat ${ngn(prices.group)} · pay after`} />
            <InfoRow icon="bi-people-fill" b="Online up to 5 · in-person 1" s="Online sessions host up to 5" />
          </ul>
        </div>

        <div className="card reveal rounded-[20px] shadow-lift">
          <h3 className="font-serif text-2xl font-semibold text-navy">Booking details</h3>
          <p className="mb-5 mt-0.5 text-sm text-muted">Fields marked <span className="text-brand">*</span> are required.</p>
          <form onSubmit={submit} className="space-y-4">
            <input className="hidden" tabIndex={-1} autoComplete="off" value={f.company} onChange={(e) => set("company", e.target.value)} aria-hidden />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Full name" req><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aisha Bello" /></Field>
              <Field label="Phone / WhatsApp" req><input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 0803 000 0000" /></Field>
            </div>
            <Field label="Email" req><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></Field>
            <Field label="What do you want to learn?" req>
              <select value={f.topic} onChange={(e) => set("topic", e.target.value)}>
                <option value="" disabled>Choose a topic…</option>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="How would you like to meet?" req>
              <div className="flex gap-2.5">
                {["Online", "In person"].map((m) => (
                  <label key={m} className="relative flex-1 cursor-pointer">
                    <input type="radio" name="mode" className="peer sr-only" checked={f.mode === m} onChange={() => set("mode", m)} />
                    <span className="flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-line py-3 font-semibold text-muted peer-checked:border-brand peer-checked:bg-brand/10 peer-checked:text-navy">
                      <i className={`bi ${m === "Online" ? "bi-camera-video" : "bi-geo-alt"}`} /> {m}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            {isPerson && (
              <Field label="Your address (for in-person)" req>
                <textarea value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Where should we meet? Street / area, landmark, city…" />
              </Field>
            )}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Preferred date" req>
                <input type="date" min={today} value={f.date} onChange={(e) => set("date", e.target.value)} />
              </Field>
              <Field label="Time slot" req>
                <select value={f.time} onChange={(e) => set("time", e.target.value)} disabled={!slots.length}>
                  <option value="" disabled>{f.date ? (slots.length ? "Choose a time…" : "No times available") : "Pick a date first…"}</option>
                  {slots.map((t) => <option key={t}>{t}</option>)}
                </select>
                {slotMsg && (
                  <div className={`mt-1.5 text-[0.82rem] font-semibold ${slotMsg.startsWith("OK:") ? "text-[#1b7a43]" : slotMsg.startsWith("CLOSED:") ? "text-[#b4322b]" : "text-muted"}`}>
                    {slotLoading ? "Checking availability…" : slotMsg.replace(/^(OK:|CLOSED:)/, "")}
                  </div>
                )}
              </Field>
            </div>
            <Field label="Number of people" req>
              <select value={f.people} onChange={(e) => set("people", e.target.value)}>
                <option value="1">Just me (1)</option>
                {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} people</option>)}
              </select>
            </Field>
            <Field label="Anything we should know? (optional)">
              <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Your goal, your level, or any question…" />
            </Field>

            <div className="flex items-center justify-between rounded-xl bg-navy px-4 py-3.5 text-white">
              <span className="text-sm text-[#c3d4ec]">Estimated total</span>
              <b className="font-serif text-[1.7rem] text-brand2">{ngn(total)}{parseInt(f.people, 10) > 1 ? " · group" : ""}</b>
            </div>

            <label className="flex items-start gap-2.5 text-[0.82rem] leading-snug text-muted">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I agree that Gobir Digital may store and use my details <b>only</b> to arrange and deliver my session.</span>
            </label>

            <button type="submit" disabled={submitting} className="btn-blue w-full">
              <i className={`bi ${submitting ? "bi-hourglass-split" : "bi-send"}`} /> {submitting ? "Checking…" : "Confirm booking"}
            </button>
            <p className="text-center text-[0.82rem] text-muted"><i className="bi bi-shield-lock" /> Secure (HTTPS) · stored privately · never sold or shared.</p>

            {msg && (
              <div className={`rounded-xl border p-4 text-sm ${msg.type === "ok" ? "border-[#9fd8b4] bg-[#e6f6ec] text-[#1b6b3a]" : msg.type === "err" ? "border-[#f0b3b3] bg-[#fdecec] text-[#9b2222]" : "border-brand bg-brand/10 text-[#1b4e7a]"}`} dangerouslySetInnerHTML={{ __html: msg.html }} />
            )}
            <p className="text-center text-[0.82rem]">
              Already booked? <button type="button" className="font-semibold text-brand" onClick={() => { const t = prompt("Paste your booking link or code:"); if (t) { const mm = /manage=([^&]+)/.exec(t); setManageToken(mm ? decodeURIComponent(mm[1]) : t.trim()); } }}>Manage or cancel your booking</button>
            </p>
          </form>
        </div>
      </div>

      {manageToken && <ManageModal token={manageToken} onClose={() => setManageToken(null)} />}
    </section>
  );
}

function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label} {req && <span className="text-brand">*</span>}</label>
      {children}
    </div>
  );
}
function InfoRow({ icon, b, s }: { icon: string; b: string; s: string }) {
  return (
    <div className="flex items-center gap-3.5 border-b border-line py-3 last:border-0">
      <i className={`bi ${icon} grid h-11 w-11 flex-none place-items-center rounded-xl bg-navy text-[1.1rem] text-brand2`} />
      <div><b className="block text-[0.98rem] text-navy">{b}</b><span className="text-[0.88rem] text-muted">{s}</span></div>
    </div>
  );
}

function ManageModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [state, setState] = useState<{ loading: boolean; booking?: any; found?: boolean; done?: string }>({ loading: true });
  const [resMode, setResMode] = useState(false);
  const [rDate, setRDate] = useState("");
  const [rSlots, setRSlots] = useState<string[]>([]);
  const [rTime, setRTime] = useState("");
  const [note, setNote] = useState("");
  const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  useEffect(() => {
    api<any>({ action: "booking", token })
      .then((r) => setState({ loading: false, booking: r.booking, found: !!r.found }))
      .catch(() => setState({ loading: false, found: false }));
  }, [token]);

  useEffect(() => {
    if (!rDate) { setRSlots([]); return; }
    api<any>({ action: "slots", date: rDate, mode: state.booking?.mode || "Online" })
      .then((r) => setRSlots(r.open !== false && r.slots ? r.slots : []))
      .catch(() => setRSlots([]));
  }, [rDate, state.booking]);

  const cancel = () => {
    if (!confirm("Cancel this booking?")) return;
    setNote("Cancelling…");
    api<any>({ action: "cancel", token }).then((r) => {
      if (r && r.ok) setState((s) => ({ ...s, done: "Booking cancelled. Hope to see you another time!" }));
      else setNote("Could not cancel — please WhatsApp us.");
    }).catch(() => setNote("Could not cancel — please WhatsApp us."));
  };
  const reschedule = () => {
    if (!rDate || !rTime) { setNote("Pick a new date and time."); return; }
    setNote("Rescheduling…");
    api<any>({ action: "reschedule", token, date: rDate, time: rTime }).then((r) => {
      if (r && r.ok) setState((s) => ({ ...s, done: `Rescheduled! Your session is now ${rDate} · ${rTime}.` }));
      else if (r && r.reason === "taken") setNote("That slot was just taken — pick another.");
      else setNote("Could not reschedule — WhatsApp us.");
    }).catch(() => setNote("Could not reschedule."));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/60 p-5 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-line bg-white p-7 shadow-lift">
        <button onClick={onClose} className="absolute right-4 top-3 text-2xl text-muted" aria-label="Close">×</button>
        <h3 className="mb-3.5 font-serif text-xl font-semibold text-navy"><i className="bi bi-calendar2-check" /> Manage your booking</h3>
        {state.loading ? <p className="text-muted">Loading your booking…</p>
          : state.done ? <p className="font-semibold text-[#1b7a43]">{state.done}</p>
          : !state.found ? <p className="text-[#b4322b]">We couldn't find that booking — it may already be cancelled.</p>
          : (
            <>
              <div className="mb-4 rounded-xl border border-line bg-cream p-3.5 text-sm">
                <b>{state.booking.topic || "Session"}</b><br />
                {state.booking.date} · {state.booking.time} · {state.booking.mode} · {state.booking.people} person(s)
              </div>
              <div className="flex gap-2.5">
                <button className="btn-ghost flex-1" onClick={() => setResMode((v) => !v)}><i className="bi bi-arrow-repeat" /> Reschedule</button>
                <button className="btn-ghost flex-1 !text-[#b4322b]" onClick={cancel}><i className="bi bi-x-circle" /> Cancel</button>
              </div>
              {resMode && (
                <div className="mt-4 space-y-3">
                  <div className="field"><label>New date</label><input type="date" min={today} value={rDate} onChange={(e) => { setRDate(e.target.value); setRTime(""); }} /></div>
                  <div className="field"><label>New time</label>
                    <select value={rTime} onChange={(e) => setRTime(e.target.value)} disabled={!rSlots.length}>
                      <option value="" disabled>{rDate ? (rSlots.length ? "Choose a time…" : "No times available") : "Pick a date first…"}</option>
                      {rSlots.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <button className="btn-blue w-full" onClick={reschedule}><i className="bi bi-check2" /> Confirm new time</button>
                </div>
              )}
              {note && <p className="mt-2 text-[0.82rem] font-semibold text-muted">{note}</p>}
            </>
          )}
      </div>
    </div>
  );
}

function esc(s: string) { return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)); }
function waText(d: any) {
  return `Hello Gobir Digital! I'd like to book a session.\n\nName: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nTopic: ${d.topic}\nMode: ${d.mode}\nDate: ${d.date}\nTime: ${d.time}\nPeople: ${d.people}\nTotal: ${ngn(d.total)}`;
}
