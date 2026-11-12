"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  priceFor,
  REASON_TEXT,
  type BookMode,
  type BookResponse,
  type SlotsResponse,
} from "@/lib/booking";

function todayISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

type Stage = "form" | "submitting" | "done";

type SlotsState = {
  loading: boolean;
  open: boolean | null;
  slots: string[];
  error: string | null;
};

type OpenOpts = { topic?: string; people?: number; mode?: BookMode };

const BLANK = {
  name: "",
  phone: "",
  email: "",
  topic: "",
  mode: "Online" as BookMode,
  date: "",
  time: "",
  people: 1,
  notes: "",
  address: "",
  agree: false,
};

/** Device-local memory of the visitor's most recent booking (for the manage dialog). */
const LAST_KEY = "gobir-last-booking";
export function readLastBooking(): { token: string; topic: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { token?: string; topic?: string };
    return v.token ? { token: v.token, topic: v.topic ?? "" } : null;
  } catch {
    return null;
  }
}
function saveLastBooking(token: string, topic: string) {
  try {
    window.localStorage.setItem(
      LAST_KEY,
      JSON.stringify({ token, topic, at: Date.now() })
    );
  } catch {
    /* private mode / storage full — not critical */
  }
}

type BookingCtx = {
  open: boolean;
  step: 1 | 2;
  stage: Stage;
  errorMsg: string;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  token: string;
  copied: boolean;
  slotsState: SlotsState;
  avail: { online: boolean; inperson: boolean };
  minDate: string;
  total: number;
  fields: typeof BLANK & { company: string };
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setField: <K extends keyof BookingCtx["fields"]>(
    k: K,
    v: BookingCtx["fields"][K]
  ) => void;
  setStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  openBooking: (opts?: OpenOpts) => void;
  closeBooking: () => void;
  copyToken: () => void;
  resetAll: () => void;
  submit: (e: React.FormEvent) => Promise<void>;
  validateStep1: () => string | null;
};

const Ctx = createContext<BookingCtx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [fields, setFields] = useState<typeof BLANK & { company: string }>({
    ...BLANK,
    company: "", // honeypot — bots only
  });

  const [slotsState, setSlotsState] = useState<SlotsState>({
    loading: false,
    open: null,
    slots: [],
    error: null,
  });
  const [avail, setAvail] = useState<{ online: boolean; inperson: boolean }>({
    online: true,
    inperson: true,
  });

  // date min is client-only to avoid SSR/CSR timezone hydration mismatch
  const [minDate, setMinDate] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setMinDate(todayISO()), 0);
    return () => window.clearTimeout(id);
  }, []);

  // which modes are currently open (for greying out a closed mode)
  useEffect(() => {
    api<any>("config")
      .then((r) => {
        if (r && r.ok) {
          const next = {
            online: r.online !== false,
            inperson: r.inperson !== false,
          };
          setAvail(next);
          setFields((f) => ({
            ...f,
            mode:
              f.mode === "In person" && !next.inperson
                ? "Online"
                : f.mode === "Online" && !next.online
                  ? "In person"
                  : f.mode,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // fetch free slots whenever date/mode changes
  const date = fields.date;
  const mode = fields.mode;
  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    // defer state reset to the next tick (avoids cascading renders)
    const kick = window.setTimeout(() => {
      setSlotsState({ loading: true, open: null, slots: [], error: null });
      setFields((f) => ({ ...f, time: "" }));
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

  // Deep link: ?book=1 (or ?book) opens the booking wizard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("book") !== null) {
      const id = window.setTimeout(() => setOpen(true), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  const total = priceFor(fields.people);

  const setField = useCallback(
    <K extends keyof BookingCtx["fields"]>(k: K, v: BookingCtx["fields"][K]) => {
      setFields((f) => ({ ...f, [k]: v }));
    },
    []
  );

  const openBooking = useCallback((opts?: OpenOpts) => {
    setFields((f) => ({
      ...f,
      topic: opts?.topic ?? f.topic,
      people: opts?.people ?? f.people,
      mode: opts?.mode ?? f.mode,
    }));
    setStep(1);
    setErrorMsg("");
    if (stage === "done") setStage("form");
    setOpen(true);
  }, [stage]);

  const resetAll = useCallback(() => {
    setFields({ ...BLANK, company: "" });
    setStep(1);
    setStage("form");
    setErrorMsg("");
    setToken("");
    setCopied(false);
    setSlotsState({ loading: false, open: null, slots: [], error: null });
  }, []);

  const closeBooking = useCallback(() => {
    setOpen(false);
    // fresh form next time after a completed booking
    if (stage === "done") window.setTimeout(resetAll, 250);
  }, [stage, resetAll]);

  const copyToken = useCallback(() => {
    navigator.clipboard?.writeText(token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [token]);

  const validateStep1 = useCallback((): string | null => {
    const f = fields;
    if (!f.topic) return "Please choose what you want to learn.";
    if (!f.date) return "Please pick a date for your session.";
    if (!f.time) return "Please pick one of the free time slots.";
    if (f.mode === "In person" && !f.address.trim())
      return "Please tell me where to meet you (area or landmark in Sokoto).";
    return null;
  }, [fields]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg("");
      const f = fields;
      if (!f.name.trim() || !f.phone.trim() || !f.email.trim()) {
        setErrorMsg("Please fill in your name, phone and email.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
        setErrorMsg("Please enter a valid email address so I can send your booking link.");
        return;
      }
      if (f.phone.replace(/\D/g, "").length < 7) {
        setErrorMsg("Please enter a valid phone number for your WhatsApp confirmation.");
        return;
      }
      if (!f.agree) {
        setErrorMsg("Please agree to the privacy note so I can arrange your session.");
        return;
      }
      setStage("submitting");
      try {
        const res = await api<BookResponse>("book", {
          name: f.name,
          phone: f.phone,
          email: f.email,
          topic: f.topic,
          mode: f.mode,
          date: f.date,
          time: f.time,
          people: f.people,
          total,
          notes: f.notes,
          address: f.mode === "In person" ? f.address : "",
          company: f.company, // honeypot, bots only
        });
        if (res.ok && res.token) {
          setToken(res.token);
          setStage("done");
          saveLastBooking(res.token, f.topic);
        } else {
          setStage("form");
          setErrorMsg(
            REASON_TEXT[res.reason ?? ""] ??
              "Something went wrong. Please try again or WhatsApp me."
          );
        }
      } catch (err) {
        setStage("form");
        setErrorMsg((err as Error).message);
      }
    },
    [fields, total]
  );

  const value = useMemo<BookingCtx>(
    () => ({
      open,
      step,
      stage,
      errorMsg,
      setErrorMsg,
      token,
      copied,
      slotsState,
      avail,
      minDate,
      total,
      fields,
      setOpen,
      setField,
      setStep,
      openBooking,
      closeBooking,
      copyToken,
      resetAll,
      submit,
      validateStep1,
    }),
    [
      open, step, stage, errorMsg, token, copied, slotsState, avail, minDate,
      total, fields, setField, openBooking, closeBooking, copyToken, resetAll,
      submit, validateStep1,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking(): BookingCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
