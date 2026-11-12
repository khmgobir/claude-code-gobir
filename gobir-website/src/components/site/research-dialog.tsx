"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  BarChart3,
  FileUp,
  Loader2,
  MessageCircle,
  X,
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
  FILE_ACCEPT,
  FILE_MAX_COUNT,
  FILE_MAX_MB,
  RS_DATA_STATUS,
  RS_ROLES,
  RS_SERVICES,
  rsFromTotal,
  submitProgramRequest,
  validateFiles,
  waProgramLink,
  type RsServiceId,
} from "@/lib/programs";
import { naira } from "@/lib/booking";

const formInput =
  "h-11 rounded-xl border-input bg-white text-base shadow-sm transition-shadow focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40";
const labelCls = "text-sm font-semibold text-foreground/90";

type Stage = "form" | "submitting" | "done";

export function ResearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(RS_ROLES[0]);
  const [services, setServices] = useState<RsServiceId[]>([]);
  const [deadline, setDeadline] = useState("");
  const [dataStatus, setDataStatus] = useState<string>(RS_DATA_STATUS[1]);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [ref, setRef] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const fromTotal = rsFromTotal(services);
  const uploadEnabled = dataStatus === RS_DATA_STATUS[0];

  function toggleService(id: RsServiceId) {
    setServices((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  }

  function onPickFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = [...files, ...Array.from(list)];
    const err = validateFiles(next);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg("");
    setFiles(next.slice(0, FILE_MAX_COUNT));
  }

  function removeFile(i: number) {
    setFiles((arr) => arr.filter((_, idx) => idx !== i));
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
    if (services.length === 0) {
      setErrorMsg("Please pick at least one service (or 'Not sure yet').");
      return;
    }
    setStage("submitting");
    const serviceNames = services
      .map((id) => RS_SERVICES.find((s) => s.id === id)?.name ?? id)
      .join(", ");
    const summary = `Research & Data Analysis — ${role}. Services: ${serviceNames}. Data: ${dataStatus}${
      deadline ? `. Deadline: ${deadline}` : ""
    }${notes ? `. Notes: ${notes}` : ""}`;
    const res = await submitProgramRequest(
      {
        type: "research",
        name,
        phone,
        email,
        details: summary,
        company,
      },
      uploadEnabled ? files : []
    );
    if (res.ok) {
      setRef(res.ref);
      setConfirmed(res.confirmed);
      setStage("done");
    } else {
      setStage("form");
      setErrorMsg(res.error ?? "Something went wrong — please try again or WhatsApp me.");
    }
  }

  function reset() {
    setName("");
    setPhone("");
    setEmail("");
    setRole(RS_ROLES[0]);
    setServices([]);
    setDeadline("");
    setDataStatus(RS_DATA_STATUS[1]);
    setFiles([]);
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
        <div className="bg-gradient-to-r from-brand-blue to-brand-royal pointer-events-none absolute inset-x-0 top-0 h-1.5" />
        <DialogHeader className="space-y-0 border-b px-6 pb-4 pt-6 text-left">
          <DialogTitle asChild>
            <div className="flex items-center gap-3 pr-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-royal text-white shadow-soft">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <span className="font-display text-lg font-extrabold leading-tight">
                  Research &amp; Data Analysis — get a quote
                </span>
                <DialogDescription className="mt-0.5 text-xs">
                  Attach your data or documents — you get a firm quote on WhatsApp before any payment.
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
                  ? "Your files and details are saved — I've been notified."
                  : "Your request has been sent. If you don't hear from me within 24 hours, tap WhatsApp below."}{" "}
                You&apos;ll get a firm quote before any payment — no surprises.
              </p>
              <div className="mx-auto mt-4 w-fit rounded-2xl border bg-muted/50 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reference
                </span>
                <div className="font-mono text-sm font-bold">{ref}</div>
              </div>
              {files.length > 0 && !confirmed && (
                <p className="mt-3 text-xs text-muted-foreground">
                  If your files didn&apos;t come through, please send them directly on WhatsApp.
                </p>
              )}
            </motion.div>
          ) : (
            <form id="rs-form" onSubmit={(e) => void submit(e)} className="space-y-4" noValidate>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" className="pointer-events-none absolute h-0 w-0 opacity-0" aria-hidden="true" />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={labelCls}>Full name *</Label>
                  <Input className={formInput} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>WhatsApp number *</Label>
                  <Input className={formInput} type="tel" inputMode="tel" placeholder="0801 234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={labelCls}>Email *</Label>
                  <Input className={formInput} type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rs-role" className={labelCls}>I am a…</Label>
                  <div className="relative">
                    <select id="rs-role" aria-label="I am a" className="h-11 w-full appearance-none rounded-xl border border-input bg-white px-3.5 pr-10 text-base shadow-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/30" value={role} onChange={(e) => setRole(e.target.value)}>
                      {RS_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>What do you need? *</Label>
                <div className="flex flex-wrap gap-2">
                  {RS_SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      aria-pressed={services.includes(s.id)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        services.includes(s.id)
                          ? "border-transparent bg-brand-gradient text-white shadow-soft"
                          : "bg-white/80 text-foreground/70 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {s.name} <span className="opacity-70">· from {naira(s.from)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Your data</Label>
                <div className="grid gap-2">
                  {RS_DATA_STATUS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDataStatus(d)}
                      aria-pressed={dataStatus === d}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-all ${
                        dataStatus === d
                          ? "border-transparent bg-brand-gradient-soft ring-2 ring-primary/50"
                          : "bg-white/80 hover:bg-primary/5"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {uploadEnabled && (
                <div className="space-y-2">
                  <Label className={labelCls}>
                    Attach files (Excel / CSV / Word / PDF)
                  </Label>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.03] px-4 py-5 text-center transition hover:border-primary/60 hover:bg-primary/[0.06]"
                  >
                    <FileUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold">Tap to choose files</span>
                    <span className="text-xs text-muted-foreground">
                      Up to {FILE_MAX_COUNT} files · {FILE_MAX_MB}MB each
                    </span>
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept={FILE_ACCEPT}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      onPickFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  {files.length > 0 && (
                    <ul className="space-y-1.5">
                      {files.map((f, i) => (
                        <li key={f.name + i} className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2 text-sm">
                          <span className="truncate font-medium">{f.name}</span>
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            {(f.size / 1024 / 1024).toFixed(1)}MB
                            <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`} className="grid h-6 w-6 place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelCls}>Deadline</Label>
                  <Input className={formInput} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>Notes</Label>
                  <Input className={formInput} placeholder="Project topic, tools…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-brand-gradient-soft px-4 py-3">
                <span className="text-sm font-semibold">
                  {services.length ? "Estimated from" : "Pick services to see pricing"}
                </span>
                <span className="font-display text-gradient text-xl font-extrabold">
                  {services.length ? naira(fromTotal) : "—"}
                  {services.length > 0 && (
                    <span className="block text-[10px] font-semibold text-muted-foreground">
                      final quote before any payment
                    </span>
                  )}
                </span>
              </div>

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
            <span className="text-xs text-muted-foreground">
              Free quote · no payment until you approve
            </span>
            <Button
              type="button"
              disabled={stage === "submitting"}
              onClick={() => {
                const form = document.getElementById("rs-form") as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              className="bg-gradient-to-r from-brand-blue to-brand-royal shadow-brand rounded-full px-6 font-semibold text-white disabled:opacity-70"
            >
              {stage === "submitting" ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                "Request my quote"
              )}
            </Button>
          </div>
        ) : (
          <div className="border-t bg-muted/30 px-6 py-4">
            <a href={waProgramLink(ref, "Research & Data Analysis quote request — I'll send my project details here.")} target="_blank" rel="noopener noreferrer" className="block">
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
